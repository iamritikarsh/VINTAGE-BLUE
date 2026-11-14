/**
 * /api/checkout.js
 * 
 * Secure Vercel Serverless Function to create a Shopify checkout cart
 * using the Shopify Storefront GraphQL API.
 * 
 * CommonJS format for 100% native zero-config Vercel Serverless Functions.
 * Supports:
 * - Diagnostic GET / health check
 * - Single item direct buy: { handle, size, quantity }
 * - Full bag checkout: { items: [ { handle, size, quantity }, ... ] }
 */

const fs = require('fs');
const path = require('path');

// Safe loader for local development
function ensureEnvLoaded() {
  if (process.env.VERCEL) return;

  const searchDirs = [
    path.join(__dirname, '..'),
    path.join(__dirname, '..', '..'),
    process.cwd()
  ];
  const envFiles = ['.env.local', '.env'];
  for (const dir of searchDirs) {
    for (const file of envFiles) {
      const fullPath = path.resolve(dir, file);
      try {
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          const text = fs.readFileSync(fullPath, 'utf8');
          for (const line of text.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex === -1) continue;
            const key = trimmed.slice(0, eqIndex).trim();
            let val = trimmed.slice(eqIndex + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1).trim();
            }
            if (key && !process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch (e) {}
    }
  }
}

// Lazy load shopifyMap.json
let shopifyMap = null;
function getShopifyMap() {
  if (!shopifyMap) {
    try {
      shopifyMap = require('../data/shopifyMap.json');
      return shopifyMap;
    } catch (e) {}

    const possiblePaths = [
      path.join(process.cwd(), 'data', 'shopifyMap.json'),
      path.join(__dirname, '..', 'data', 'shopifyMap.json'),
      path.join(__dirname, 'data', 'shopifyMap.json')
    ];
    for (const p of possiblePaths) {
      try {
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
          shopifyMap = JSON.parse(fs.readFileSync(p, 'utf8'));
          break;
        }
      } catch (e) {}
    }
    if (!shopifyMap) {
      shopifyMap = {};
    }
  }
  return shopifyMap;
}

// Parse request body safely for both Vercel and Node HTTP server
async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return null; }
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

// Standard JSON response helper
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

// GraphQL helper
async function shopifyGraphQL(query, variables = {}) {
  const rawDomain = process.env.SHOPIFY_STORE_DOMAIN || 'yjhumg-ip.myshopify.com';
  const storeDomain = rawDomain.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  const storefrontToken = (process.env.SHOPIFY_STOREFRONT_TOKEN || '').trim();
  const apiVersion = (process.env.SHOPIFY_API_VERSION || '2026-07').trim();

  if (!storefrontToken) {
    const err = new Error('Shopify Storefront Token is not configured. Please set SHOPIFY_STOREFRONT_TOKEN in .env.local or Vercel Environment Variables.');
    err.code = 'ENV_MISSING';
    err.missing = 'SHOPIFY_STOREFRONT_TOKEN';
    throw err;
  }

  if (storefrontToken.startsWith('shpat_')) {
    const err = new Error('Shopify authentication error: An Admin API token (shpat_...) was provided. A Storefront Access Token is required.');
    err.code = 'SHOPIFY_ADMIN_TOKEN_PROVIDED';
    throw err;
  }

  const endpoint = `https://${storeDomain}/api/${apiVersion}/graphql.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    const err = new Error(`Shopify HTTP ${response.status}: ${errorBody.slice(0, 200)}`);
    err.code = (response.status === 401 || response.status === 403) ? 'SHOPIFY_HTTP_401' : 'SHOPIFY_HTTP_NON_200';
    err.status = response.status;
    throw err;
  }

  const result = await response.json();
  if (result.errors && result.errors.length > 0) {
    const err = new Error(`Shopify GraphQL error: ${result.errors[0].message}`);
    err.code = 'SHOPIFY_GRAPHQL_ERRORS';
    throw err;
  }

  return result.data;
}

// Find variant GID for a given handle and size
async function resolveVariantId(handle, size) {
  const map = getShopifyMap();
  const entry = map[handle];
  const shopifyHandle = entry?.shopifyHandle || handle;

  if (entry?.shopifyVariantIds) {
    if (size && entry.shopifyVariantIds[size]) {
      return entry.shopifyVariantIds[size];
    }
    const anyKey = Object.keys(entry.shopifyVariantIds)[0];
    if (anyKey && entry.shopifyVariantIds[anyKey]) {
      return entry.shopifyVariantIds[anyKey];
    }
  }

  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        variants(first: 50) {
          edges {
            node {
              id
              title
              availableForSale
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyGraphQL(query, { handle: shopifyHandle });
  const product = data?.product;

  if (!product || !product.variants?.edges?.length) {
    return null;
  }

  const variants = product.variants.edges.map(e => e.node);

  if (size) {
    const matched = variants.find(v => {
      const sizeOpt = v.selectedOptions?.find(o => /size/i.test(o.name))?.value;
      return sizeOpt === String(size) || v.title.toLowerCase().includes(String(size).toLowerCase());
    });
    if (matched) return matched.id;
  }

  const available = variants.find(v => v.availableForSale);
  return (available || variants[0]).id;
}

async function handler(req, res) {
  ensureEnvLoaded();

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With'
    });
    return res.end();
  }

  if (req.method === 'GET') {
    const map = getShopifyMap();
    const productCount = map ? Object.keys(map).length : 0;
    const domain = (process.env.SHOPIFY_STORE_DOMAIN || '').trim();
    const token = (process.env.SHOPIFY_STOREFRONT_TOKEN || '').trim();
    const version = (process.env.SHOPIFY_API_VERSION || '').trim();

    return sendJson(res, 200, {
      ok: true,
      endpoint: '/api/checkout',
      env: {
        domain: Boolean(domain),
        token: Boolean(token),
        version: Boolean(version)
      },
      mapLoaded: Boolean(map && productCount > 0),
      products: productCount
    });
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed. Use POST.', code: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const body = await parseBody(req);
    if (!body) {
      return sendJson(res, 400, { error: 'Invalid JSON request body.', code: 'INVALID_JSON' });
    }

    let items = [];
    if (Array.isArray(body.items) && body.items.length > 0) {
      items = body.items;
    } else if (body.handle) {
      items = [{
        handle: body.handle,
        variantId: body.variantId,
        size: body.size || body.option,
        quantity: body.quantity || 1
      }];
    } else {
      return sendJson(res, 400, { error: 'Missing handle or items in request body.', code: 'MISSING_PAYLOAD' });
    }

    for (const item of items) {
      const q = parseInt(item.quantity || item.qty || 1, 10);
      if (isNaN(q) || q < 1 || q > 10) {
        return sendJson(res, 400, { error: 'Quantity must be an integer between 1 and 10.', code: 'INVALID_QUANTITY' });
      }
      item.quantity = q;
    }

    if (!process.env.SHOPIFY_STOREFRONT_TOKEN) {
      return sendJson(res, 500, {
        error: 'Shopify Storefront Token is not configured. Please set SHOPIFY_STOREFRONT_TOKEN in .env.local or Vercel Environment Variables.',
        code: 'ENV_MISSING'
      });
    }

    const lines = [];
    for (const item of items) {
      let variantId = item.variantId;
      if (!variantId && item.handle) {
        variantId = await resolveVariantId(item.handle, item.size);
      }

      if (!variantId) {
        return sendJson(res, 404, {
          error: `Could not find Shopify product variant for "${item.handle}" (size: ${item.size || 'default'}). Please ensure this product is published to the Storefront sales channel.`,
          code: 'VARIANT_NOT_FOUND',
          handle: item.handle
        });
      }

      lines.push({
        merchandiseId: variantId,
        quantity: item.quantity
      });
    }

    const mutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            code
            field
            message
          }
        }
      }
    `;

    const cartData = await shopifyGraphQL(mutation, {
      input: { lines }
    });

    const userErrors = cartData?.cartCreate?.userErrors;
    if (userErrors && userErrors.length > 0) {
      return sendJson(res, 400, {
        error: userErrors.map(e => e.message).join('; '),
        code: 'SHOPIFY_CART_USER_ERROR'
      });
    }

    const checkoutUrl = cartData?.cartCreate?.cart?.checkoutUrl;
    if (!checkoutUrl) {
      return sendJson(res, 502, { error: 'Failed to retrieve checkout URL from Shopify.', code: 'MISSING_CHECKOUT_URL' });
    }

    return sendJson(res, 200, { checkoutUrl });

  } catch (err) {
    if (err.code === 'ENV_MISSING') {
      return sendJson(res, 500, {
        error: 'Shopify Storefront Token is not configured. Please set SHOPIFY_STOREFRONT_TOKEN in .env.local or Vercel Environment Variables.',
        code: 'ENV_MISSING'
      });
    }

    if (err.code === 'SHOPIFY_ADMIN_TOKEN_PROVIDED') {
      return sendJson(res, 401, {
        error: 'Shopify authentication error: An Admin API token (shpat_...) was provided. A Storefront Access Token is required.',
        code: 'SHOPIFY_ADMIN_TOKEN_PROVIDED'
      });
    }

    if (err.code === 'SHOPIFY_HTTP_401') {
      return sendJson(res, 401, {
        error: 'Shopify Storefront Access Token was rejected (401/403). Please verify your token and Storefront API permissions in Shopify Admin.',
        code: 'SHOPIFY_HTTP_401'
      });
    }

    if (err.code === 'SHOPIFY_HTTP_NON_200') {
      return sendJson(res, 502, {
        error: `Shopify API returned an error (HTTP ${err.status || 500}). Please try again.`,
        code: 'SHOPIFY_HTTP_NON_200'
      });
    }

    if (err.code === 'SHOPIFY_GRAPHQL_ERRORS') {
      return sendJson(res, 400, {
        error: err.message,
        code: 'SHOPIFY_GRAPHQL_ERRORS'
      });
    }

    if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
      return sendJson(res, 504, { error: 'Shopify connection timed out. Please try again.', code: 'TIMEOUT' });
    }

    return sendJson(res, 502, {
      error: 'Unable to connect to Shopify checkout. Please check store credentials and try again.',
      code: err.code || 'UNKNOWN'
    });
  }
}

module.exports = handler;
module.exports.default = handler;
