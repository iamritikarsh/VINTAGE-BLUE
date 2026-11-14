/**
 * /api/health.js
 * 
 * Safe diagnostic endpoint for Vercel / local environments.
 * Verifies presence of environment variables and shopifyMap without exposing any secrets.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getShopifyMap() {
  const possiblePaths = [
    path.join(process.cwd(), 'data', 'shopifyMap.json'),
    path.join(__dirname, '..', 'data', 'shopifyMap.json'),
    path.join(__dirname, 'data', 'shopifyMap.json')
  ];
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        const text = fs.readFileSync(p, 'utf8');
        return JSON.parse(text);
      }
    } catch (e) {}
  }
  return null;
}

export default async function handler(req, res) {
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
