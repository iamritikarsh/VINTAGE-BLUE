/**
 * /api/health.js
 * 
 * Safe diagnostic endpoint for Vercel / local environments.
 * CommonJS format for 100% native zero-config Vercel Serverless Functions.
 */

const fs = require('fs');
const path = require('path');

function getShopifyMap() {
  try {
    return require('../data/shopifyMap.json');
  } catch (e) {}

  const possiblePaths = [
    path.join(process.cwd(), 'data', 'shopifyMap.json'),
    path.join(__dirname, '..', 'data', 'shopifyMap.json'),
    path.join(__dirname, 'data', 'shopifyMap.json')
  ];
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    } catch (e) {}
  }
  return null;
}

async function handler(req, res) {
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store'
  });

  if (req.method === 'OPTIONS') {
    return res.end();
  }

  const map = getShopifyMap();
  const productCount = map ? Object.keys(map).length : 0;

  const domain = (process.env.SHOPIFY_STORE_DOMAIN || '').trim();
  const token = (process.env.SHOPIFY_STOREFRONT_TOKEN || '').trim();
  const version = (process.env.SHOPIFY_API_VERSION || '').trim();

  res.end(JSON.stringify({
    ok: true,
    env: {
      domain: Boolean(domain),
      token: Boolean(token),
      version: Boolean(version)
    },
    mapLoaded: Boolean(map && productCount > 0),
    products: productCount
  }));
}

module.exports = handler;
module.exports.default = handler;
