// Takes screenshots of the real app in headless Chromium on a phone-sized viewport. Evidence only; not a device test.
//   CHROME_PATH=/path/to/chrome node scripts/capture-screens.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sleep, freePort, startServer, launchChrome } from './lib/devtools.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'evidence', 'iteration2', 'screenshots');
await fs.mkdir(OUT, { recursive: true });
const port = await freePort();
const server = await startServer({ root: ROOT, port });
const chrome = await launchChrome();
try {
  const page = await chrome.newPage();
  await page.cdp.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await page.goto(`http://localhost:${port}/`);
  await page.waitFor("document.querySelector('.question-id')?.textContent || ''", (x) => x.includes('EL01'), 12000, 'question');
  await sleep(800);
  const shot = async (name) => { const r = await page.cdp.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }, 15000); await fs.writeFile(path.join(OUT, name), Buffer.from(r.data, 'base64')); console.log('saved', name); };
  await shot('01-mobile-first-question.png');
  await page.evaluate("document.querySelector('[data-bridge-option]').click()");
  await sleep(500);
  await page.evaluate("document.querySelector('[data-bridge-action=\"reveal\"]').click()");
  await sleep(500);
  await page.evaluate("document.querySelector('#bridge-practice-content').scrollIntoView()");
  await shot('02-mobile-bridge-practice-after-attempt-and-reveal.png');
  await page.offline(true);
  await page.waitFor('navigator.onLine', (x) => x === false, 6000, 'offline');
  await page.evaluate("document.querySelector('[data-bridge-action=\"next\"]').click()");
  await sleep(600);
  await shot('03-mobile-offline-bridge-practice.png');
} finally { await chrome.kill(); await server.stop(); }
