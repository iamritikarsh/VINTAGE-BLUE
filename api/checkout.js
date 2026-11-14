/**
 * /api/checkout.js
 * 
 * Secure Vercel Serverless Function to create a Shopify checkout cart
 * using the Shopify Storefront GraphQL API.
 * 
 * Supports:
 * - Single item direct buy: { handle, size, quantity }
 * - Full bag checkout: { items: [ { handle, size, quantity }, ... ] }
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load local env if running in standalone/dev mode
function ensureEnvLoaded() {
  const searchDirs = [
    path.join(__dirname, '..'),           // vintage-blue-main (inner project folder)
    path.join(__dirname, '..', '..'),     // vintage-blue-main (parent server folder)
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
            if (key) {
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
    const mapFile = path.join(__dirname, '..', 'data', 'shopifyMap.json');
    if (fs.existsSync(mapFile)) {
      try {
        shopifyMap = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
      } catch (e) {
        shopifyMap = {};
      }
    } else {
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

// GraphQL helper
async function shopifyGraphQL(query, variables = {}) {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || 'yjhumg-ip.myshopify.com';
  const storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-10';

  if (!storefrontToken) {
    throw new Error('SHOPIFY_STOREFRONT_TOKEN_MISSING');
  }

  // Pre-validate token type: Admin tokens start with shpat_
  if (storefrontToken.startsWith('shpat_')) {
    console.error('\n[Shopify Diagnostic Error]: Token in .env.local starts with "shpat_", which is an Admin API token.');
    console.error('The Storefront GraphQL API requires a Storefront Access Token.');
    console.error('FIX: In Shopify Admin > Settings > Apps and sales channels > Develop apps > Open app > Configuration > Storefront API integration > Create/copy Storefront Access Token.\n');
    throw new Error('SHOPIFY_ADMIN_TOKEN_PROVIDED');
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
    throw new Error(`SHOPIFY_HTTP_${response.status}: ${errorBody.slice(0, 200)}`);
  }

  const result = await response.json();
  if (result.errors && result.errors.length > 0) {
    throw new Error(`SHOPIFY_GQL_ERROR: ${result.errors[0].message}`);
  }

  return result.data;
}

// Find variant GID for a given handle and size
async function resolveVariantId(handle, size) {
  const map = getShopifyMap();
  const entry = map[handle];
  const shopifyHandle = entry?.shopifyHandle || handle;

  // Check if already pre-cached in map
  if (entry?.shopifyVariantIds) {
    if (size && entry.shopifyVariantIds[size]) {
      return entry.shopifyVariantIds[size];
    }
    const anyKey = Object.keys(entry.shopifyVariantIds)[0];
    if (anyKey && entry.shopifyVariantIds[anyKey]) {
      return entry.shopifyVariantIds[anyKey];
    }
  }

  // Query Shopify Storefront API for this product's variants
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
    // Exact match on size option
    const matched = variants.find(v => {
      const sizeOpt = v.selectedOptions?.find(o => /size/i.test(o.name))?.value;
      return sizeOpt === String(size) || v.title.toLowerCase().includes(String(size).toLowerCase());
    });
    if (matched) return matched.id;
  }

  // Fallback to first available or first variant
  const available = variants.find(v => v.availableForSale);
  return (available || variants[0]).id;
}

export default async function handler(req, res) {
  ensureEnvLoaded();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With'
    });
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = await parseBody(req);
    if (!body) {
      return sendJson(res, 400, { error: 'Invalid JSON request body.' });
    }

    // Support both single item and cart lines
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
      return sendJson(res, 400, { error: 'Missing handle or items in request body.' });
    }

    // Validate quantities
    for (const item of items) {
      const q = parseInt(item.quantity || item.qty || 1, 10);
      if (isNaN(q) || q < 1 || q > 10) {
        return sendJson(res, 400, { error: 'Quantity must be an integer between 1 and 10.' });
      }
      item.quantity = q;
    }

    // Check Shopify token configuration
    if (!process.env.SHOPIFY_STOREFRONT_TOKEN) {
      return sendJson(res, 500, {
        error: 'Shopify Storefront Token is not configured. Please set SHOPIFY_STOREFRONT_TOKEN in .env.local or Vercel Environment Variables.'
      });
    }

    // Resolve variant GIDs
    const lines = [];
    for (const item of items) {
      let variantId = item.variantId;
      if (!variantId && item.handle) {
        variantId = await resolveVariantId(item.handle, item.size);
      }

      if (!variantId) {
        return sendJson(res, 404, {
          error: `Could not find Shopify product variant for "${item.handle}" (size: ${item.size || 'default'}). Please ensure this product is published to the Storefront sales channel.`
        });
      }

      lines.push({
        merchandiseId: variantId,
        quantity: item.quantity
      });
    }

    // Create Shopify Cart
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
        error: userErrors.map(e => e.message).join('; ')
      });
    }

    const checkoutUrl = cartData?.cartCreate?.cart?.checkoutUrl;
    if (!checkoutUrl) {
      return sendJson(res, 502, { error: 'Failed to retrieve checkout URL from Shopify.' });
    }

    return sendJson(res, 200, { checkoutUrl });

  } catch (err) {
    if (err.message === 'SHOPIFY_STOREFRONT_TOKEN_MISSING') {
      return sendJson(res, 500, {
        error: 'Shopify Storefront Token is not configured. Please set SHOPIFY_STOREFRONT_TOKEN in .env.local or Vercel Environment Variables.'
      });
    }

    if (err.message === 'SHOPIFY_ADMIN_TOKEN_PROVIDED') {
      return sendJson(res, 401, {
        error: 'Shopify authentication error: An Admin API token (shpat_...) was provided. A Storefront Access Token is required. In Shopify Admin, go to Settings > Apps and sales channels > Develop apps > Open App > Configuration > Storefront API integration to create a Storefront access token.'
      });
    }

    if (err.message?.includes('SHOPIFY_HTTP_401') || err.message?.includes('SHOPIFY_HTTP_403')) {
      console.error('\n[Shopify Diagnostic Error]: Shopify rejected Storefront credentials (401/403).');
      console.error('Checklist:');
      console.error('1. Verify SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN in .env.local.');
      console.error('2. Ensure Storefront API scopes are enabled (unauthenticated_read_product_listings, unauthenticated_write_checkouts).');
      console.error('3. Ensure the app is installed in your Shopify store.\n');
      return sendJson(res, 401, {
        error: 'Shopify Storefront Access Token was rejected (401/403). Please verify your token and Storefront API permissions in Shopify Admin.'
      });
    }

    if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
      return sendJson(res, 504, { error: 'Shopify connection timed out. Please try again.' });
    }

    console.error('[Shopify Checkout Error]', err.message);
    return sendJson(res, 502, {
      error: 'Unable to connect to Shopify checkout. Please check store credentials and try again.'
    });
  }
}
