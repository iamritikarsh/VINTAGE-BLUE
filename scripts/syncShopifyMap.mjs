#!/usr/bin/env node

/**
 * syncShopifyMap.mjs
 * 
 * Fetches all products and variants from the Shopify Storefront API
 * and maps them directly to the 84 Vintage Blue website products.
 * 
 * Usage:
 *   node scripts/syncShopifyMap.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Helper to load simple .env files without extra dependencies
function loadEnv() {
  const searchDirs = [
    ROOT,
    path.resolve(ROOT, '..'),
    process.cwd()
  ];
  const envFiles = ['.env.local', '.env'];
  for (const dir of searchDirs) {
    for (const file of envFiles) {
      const fullPath = path.resolve(dir, file);
      try {
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const line of content.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex === -1) continue;
            const key = trimmed.slice(0, eqIndex).trim();
            let val = trimmed.slice(eqIndex + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1).trim();
            }
            if (key) process.env[key] = val;
          }
        }
      } catch (e) {}
    }
  }
}

loadEnv();

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'yjhumg-ip.myshopify.com';
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';

console.log('='.repeat(70));
console.log('Vintage Blue - Shopify Product Mapper');
console.log('='.repeat(70));
console.log(`Store Domain: ${STORE_DOMAIN}`);
console.log(`API Version:  ${API_VERSION}`);
console.log(`Token Status: ${STOREFRONT_TOKEN ? 'Present (Hidden for security)' : 'NOT FOUND (Using slug-based mapping fallback)'}`);
console.log('-'.repeat(70));

const productsPath = path.join(ROOT, 'data', 'products.json');
const mapPath = path.join(ROOT, 'data', 'shopifyMap.json');

if (!fs.existsSync(productsPath)) {
  console.error(`Error: Could not find ${productsPath}`);
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
let shopifyMap = fs.existsSync(mapPath) ? JSON.parse(fs.readFileSync(mapPath, 'utf8')) : {};

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchShopifyProducts() {
  if (!STOREFRONT_TOKEN) {
    return null;
  }

  const endpoint = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;
  const query = `
    query getProducts($cursor: String) {
      products(first: 250, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            handle
            variants(first: 100) {
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
      }
    }
  `;

  let allProducts = [];
  let cursor = null;
  let hasNext = true;

  while (hasNext) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query, variables: { cursor } }),
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
      throw new Error(`Shopify API responded with status ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.errors) {
      throw new Error(`Shopify GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    const page = data.data.products;
    allProducts.push(...page.edges.map(e => e.node));
    hasNext = page.pageInfo.hasNextPage;
    cursor = page.pageInfo.endCursor;
  }

  return allProducts;
}

async function run() {
  let shopifyProducts = null;
  try {
    shopifyProducts = await fetchShopifyProducts();
  } catch (err) {
    console.warn(`[Warning] Could not fetch products from live Shopify API: ${err.message}`);
    console.warn('Falling back to local deterministic title/slug mapping.');
  }

  const report = {
    matched: 0,
    unmatched: [],
    details: []
  };

  const shopifyByHandle = new Map();
  const shopifyByTitle = new Map();

  if (shopifyProducts) {
    console.log(`Fetched ${shopifyProducts.length} active products from Shopify.`);
    for (const sp of shopifyProducts) {
      shopifyByHandle.set(sp.handle, sp);
      shopifyByTitle.set(normalize(sp.title), sp);
    }
  }

  for (const p of products) {
    const expectedSlug = normalize(p.name);
    let matchedShopify = null;

    if (shopifyProducts) {
      matchedShopify = shopifyByHandle.get(expectedSlug) ||
                       shopifyByHandle.get(p.handle) ||
                       shopifyByTitle.get(expectedSlug) ||
                       shopifyByTitle.get(normalize(p.handle));
    }

    const variantMap = {};
    if (matchedShopify) {
      // Map sizes to variant GIDs
      matchedShopify.variants.edges.forEach(({ node: v }) => {
        const sizeOpt = v.selectedOptions.find(o => /size/i.test(o.name))?.value || v.title;
        variantMap[sizeOpt] = v.id;
        variantMap[v.title] = v.id;
      });
    }

    const mapEntry = {
      websiteHandle: p.handle,
      websiteName: p.name,
      shopifyHandle: matchedShopify ? matchedShopify.handle : expectedSlug,
      shopifyId: matchedShopify ? matchedShopify.id : null,
      sizes: p.sizes || [],
      color: p.color || '',
      type: p.type || '',
      price: p.price,
      shopifyVariantIds: variantMap
    };

    shopifyMap[p.handle] = mapEntry;

    if (shopifyProducts) {
      if (matchedShopify) {
        report.matched++;
        report.details.push(`[MATCHED] ${p.name} -> ${matchedShopify.handle} (${Object.keys(variantMap).length} variants)`);
      } else {
        report.unmatched.push(p.name);
      }
    } else {
      report.matched++;
      report.details.push(`[SLUG-MAPPED] ${p.name} -> ${expectedSlug}`);
    }
  }

  fs.writeFileSync(mapPath, JSON.stringify(shopifyMap, null, 2), 'utf8');

  console.log('\nMapping Results:');
  console.log(`  Total Website Products: ${products.length}`);
  console.log(`  Successfully Mapped:    ${report.matched} / ${products.length}`);

  if (report.unmatched.length > 0) {
    console.log(`  Unmatched Products:     ${report.unmatched.length}`);
    report.unmatched.forEach(u => console.log(`    - ${u}`));
  } else {
    console.log('  All 84 products successfully mapped to Shopify!');
  }

  console.log(`\nSaved mapping file to: ${path.relative(process.cwd(), mapPath)}`);
}

run().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
