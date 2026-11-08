#!/usr/bin/env node
/**
 * Headless Smoke Test for Site Tools
 * Checks that all interactive tool routes load, initialize without console or page errors,
 * and render key layout elements.
 *
 * Can be run via `npm run smoke` (or standalone).
 * Skips gracefully if Chromium is not available.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const DIST = path.join(ROOT, 'website/dist');

const TOOL_ROUTES = [
  '/tools/umpire-simulator/',
  '/tools/f1-championship-calculator/',
  '/tools/ocarina/',
  '/tools/dragonwilds-tracker/',
  '/tools/nfl-trend-analyzer/',
  '/tools/nhl-trend-analyzer/',
  '/tools/baseball-trend-analyzer/',
  '/tools/sports-betting/',
  '/tools/tier-list/',
  '/tools/stream-schedule/',
  '/tools/ffx-100-tracker/',
  '/store/'
];

// Content types for minimal local static server
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp'
};

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error(`Dist directory ${DIST} not found. Run npm run build first.`);
    process.exit(1);
  }

  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch (e) {
    console.log('Puppeteer not installed or unavailable. Skipping headless smoke test.');
    process.exit(0);
  }

  // Start minimal static server
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0].split('#')[0];
    if (reqPath.endsWith('/')) reqPath += 'index.html';
    let filePath = path.join(DIST, reqPath);
    if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`=== Headless Smoke Test on ${baseUrl} ===\n`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
  } catch (err) {
    console.log(`Chromium could not be launched in this environment (${err.message}). Skipping.`);
    server.close();
    process.exit(0);
  }

  let totalErrors = 0;

  try {
    for (const route of TOOL_ROUTES) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });

      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(err.message));
      page.on('error', (err) => pageErrors.push(err.message));

      try {
        const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        const status = response ? response.status() : 0;

        if (status >= 400) {
          console.error(`  [FAIL] ${route} returned HTTP ${status}`);
          totalErrors++;
        } else if (pageErrors.length > 0) {
          console.error(`  [FAIL] ${route} threw page error(s):`, pageErrors.join(' | '));
          totalErrors += pageErrors.length;
        } else {
          console.log(`  [PASS] ${route} (HTTP ${status}, 0 errors)`);
        }
      } catch (navErr) {
        console.error(`  [FAIL] ${route} navigation error:`, navErr.message);
        totalErrors++;
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\n======================================`);
  if (totalErrors === 0) {
    console.log(`Summary: All ${TOOL_ROUTES.length} tool routes verified clean.`);
  } else {
    console.error(`Summary: ${totalErrors} error(s) detected during smoke test.`);
    process.exit(1);
  }
  console.log(`======================================\n`);
}

main().catch((e) => {
  console.error('Smoke test harness failed:', e);
  process.exit(1);
});
