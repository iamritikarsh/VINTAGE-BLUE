#!/usr/bin/env node

/**
 * testCheckout.mjs
 * 
 * Verifies live Shopify checkout generation:
 * - Test A: Single product (comfort-cargo-9018-dark-grey, size 32, qty 1)
 * - Test B: Two-item bag (comfort-cargo-9018-dark-grey, size 30 + size 32)
 * - Test C: One from each category (Jazz With Fleece, Hulk, Rock, Denim Jacket, Corduroy Shirt)
 * 
 * Usage:
 *   node scripts/testCheckout.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Helper to load env safely
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

const endpointUrl = 'http://localhost:3000/api/checkout';
const domain = process.env.SHOPIFY_STORE_DOMAIN || 'yjhumg-ip.myshopify.com';
const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-10';

console.log('='.repeat(70));
console.log('Vintage Blue - Live Shopify Checkout Verification');
console.log('='.repeat(70));
console.log(`Store Domain: ${domain}`);
console.log(`API Version:  ${apiVersion}`);
console.log(`Token Status: ${token ? 'Configured (Testing live Shopify checkout URL generation)' : 'MISSING from .env.local'}`);
console.log('-'.repeat(70));

async function executeTest(testName, payloadDescription, body) {
  process.stdout.write(`[${testName}] ${payloadDescription}... `);
  try {
    const res = await fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000)
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 200 && data.checkoutUrl) {
      const parsedUrl = new URL(data.checkoutUrl);
      console.log('PASSED');
      console.log(`  -> Checkout Domain: ${parsedUrl.origin} (Path: ${parsedUrl.pathname.slice(0, 30)}...)`);
      return { success: true };
    } else {
      console.log(`FAILED (${res.status})`);
      console.log(`  -> Error: ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.log('CONNECTION ERROR');
    console.log(`  -> Error: ${err.message}`);
    return { success: false, error: err.message };
  }
}

async function run() {
  console.log('\n--- Running Test A: Single Product ---');
  await executeTest(
    'Test A',
    'Comfort Cargo 9018 Dark Grey (Size 32, Qty 1)',
    { handle: 'comfort-cargo-9018-dark-grey', size: '32', quantity: 1 }
  );

  console.log('\n--- Running Test B: Two-Item Bag ---');
  await executeTest(
    'Test B',
    'Comfort Cargo 9018 Dark Grey (Size 30 + Size 32, Qty 1 each)',
    {
      items: [
        { handle: 'comfort-cargo-9018-dark-grey', size: '30', quantity: 1 },
        { handle: 'comfort-cargo-9018-dark-grey', size: '32', quantity: 1 }
      ]
    }
  );

  console.log('\n--- Running Test C: Multi-Category Coverage ---');
  const catItems = [
    { name: 'Jazz With Fleece (Size 32)', handle: 'jazz-with-fleece-035-light-blue', size: '32' },
    { name: 'Hulk Super Baggy (Size 34)', handle: 'hulk-32002-dark-blue', size: '34' },
    { name: 'Rock Baggy (Size 30)', handle: 'rock-159-dark-indigo', size: '30' },
    { name: 'Denim Jacket (Size L)', handle: 'denim-jacket-152-coal-grey', size: 'L' },
    { name: 'Corduroy Shirt (Size M)', handle: 'corduroy-shirt-0041-beige', size: 'M' }
  ];

  for (const item of catItems) {
    await executeTest('Test C', item.name, { handle: item.handle, size: item.size, quantity: 1 });
  }

  console.log('\n' + '='.repeat(70));
  console.log('Tests completed.');
  console.log('='.repeat(70));
}

run();
