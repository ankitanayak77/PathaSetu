// Automated accessibility and mobile-readiness audit across phone-sized viewports and the app's main states.
//   CHROME_PATH=/path/to/chrome npm run a11y
// Exit codes: 0 every automated check passed, 1 at least one failed, 2 blocked (no browser).
// This is headless Chromium with viewport emulation. It is NOT a screen-reader test, NOT a real-phone test and NOT proof of
// conformance. TalkBack, VoiceOver, Samsung Internet and Safari remain NOT TESTED until a person runs them (docs/PHONE_TEST_PLAN.md).
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sleep, freePort, startServer, launchChrome } from './lib/devtools.mjs';
import { browserRecord } from './lib/browser-path.mjs';
import { AUDIT_EXPRESSION, evaluateAudit, tabAudit } from './lib/a11y-audit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = process.env.A11Y_OUT || path.join(ROOT, 'evidence', 'iteration3', 'accessibility');
// CSS widths of the target devices are approximate: the audit tests widths, not the phones themselves.
const VIEWPORTS = [
  { name: 'reflow floor (320x640, WCAG 1.4.10)', width: 320, height: 640 },
  { name: 'narrow Android (360x780, Galaxy S23 class)', width: 360, height: 780 },
  { name: 'iPhone 16 class (393x852)', width: 393, height: 852 },
  { name: 'large Android (412x915, S25 FE class)', width: 412, height: 915 },
  { name: 'tablet / desktop floor (768x1024)', width: 768, height: 1024 }
];
const SUBMIT = (opt, text) => `(() => { const radio = document.querySelector('input[name="answer-option"][value="${opt}"]'); const ta = document.querySelector('#explanation-input'); const form = document.querySelector('#answer-form'); if (!radio || !ta || !form) return false; radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); ta.value = ${JSON.stringify(text)}; ta.dispatchEvent(new Event('input', { bubbles: true })); form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); return true; })()`;
const DRAFT = `(() => { const radio = document.querySelector('input[name="answer-option"]'); const ta = document.querySelector('#explanation-input'); radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); ta.value = 'The current keeps building up in the wire.'; ta.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`;
const QUESTION = `document.querySelector('.question-id')?.textContent || ''`;

async function newPage(chrome, base, viewport) {
  const page = await chrome.newPage();
  await page.cdp.call('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height, deviceScaleFactor: 2, mobile: viewport.width < 700 });
  await page.goto(`${base}/`);
  return page;
}
async function audit(page, label) {
  await sleep(500);
  const report = await page.evaluate(AUDIT_EXPRESSION);
  const tab = await tabAudit(page);
  return { label, report, tab, checks: evaluateAudit(report, { label, tab }) };
}

const states = [
  ['initial question', async (page) => { await page.waitFor(QUESTION, (v) => v.includes('EL01'), 15000, 'question'); }],
  ['option chosen and explanation typed', async (page) => { await page.waitFor(QUESTION, (v) => v.includes('EL01'), 15000, 'question'); await page.evaluate(DRAFT); }],
  ['result with recommendation', async (page) => {
    await page.waitFor(QUESTION, (v) => v.includes('EL01'), 15000, 'question');
    await page.evaluate(SUBMIT('A', 'The current keeps building up in the wire.'));
    await page.waitFor(`document.querySelector('.result-action')?.innerText || ''`, (v) => v.length > 0, 15000, 'result');
    await page.waitFor(`document.querySelector('#queue-count')?.textContent`, (v) => v === '0', 15000, 'queue drained');
  }],
  ['trace panel open, after a result', async (page) => {
    await page.waitFor(QUESTION, (v) => v.includes('EL01'), 15000, 'question');
    await page.evaluate(SUBMIT('A', 'The current keeps building up in the wire.'));
    await page.waitFor(`document.querySelector('.result-action')?.innerText || ''`, (v) => v.length > 0, 15000, 'result');
    await page.evaluate(`document.querySelector('#trace-toggle').click(); 0`);
  }],
  ['Bridge Practice answered', async (page) => {
    await page.waitFor(QUESTION, (v) => v.includes('EL01'), 15000, 'question');
    await page.waitFor(`document.querySelectorAll('[data-bridge-option]').length`, (v) => v > 0, 8000, 'bridge options');
    await page.evaluate(`document.querySelector('[data-bridge-option]:not([disabled])')?.click(); 0`);
    await sleep(300);
  }],
  ['offline with one queued re-check', async (page) => {
    await page.waitFor(QUESTION, (v) => v.includes('EL01'), 15000, 'question');
    await page.waitFor(`document.querySelector('#connection-label')?.textContent || ''`, (v) => /online/i.test(v), 15000, 'online indicator');
    await page.waitFor(`(async () => Boolean(navigator.serviceWorker.controller))()`, (v) => v === true, 12000, 'service worker controlling');
    await page.offline(true);
    await page.waitFor('navigator.onLine', (v) => v === false, 6000, 'offline');
    await sleep(300);
    await page.evaluate(SUBMIT('A', 'The current keeps building up in the wire.'));
    await page.waitFor(`document.querySelector('#answers-count')?.textContent`, (v) => Number(v) >= 1, 8000, 'answer saved offline');
    await page.waitFor(`document.querySelector('#queue-count')?.textContent`, (v) => v === '1', 8000, 'queued');
  }]
];

const all = []; let blocked = null; let browserInfo = null;
let server;
try {
  const port = await freePort();
  server = await startServer({ root: ROOT, port });
  try { const probe = await launchChrome(); browserInfo = browserRecord(probe.selection, await probe.version().catch(() => null)); await probe.kill(); } catch (error) { blocked = `no usable browser: ${error.message}`; browserInfo = { status: 'BLOCKED', executable: null, selectedBy: error.reason ?? 'launch_failed', version: null }; }
  if (!blocked) {
    const base = `http://localhost:${port}`;
    for (const viewport of VIEWPORTS) {
      for (const [stateName, prepare] of states) {
        // A fresh browser per state: nothing saved by an earlier state (IndexedDB, service worker, session storage) can leak in.
        const chrome = await launchChrome();
        const page = await newPage(chrome, base, viewport);
        try {
          await prepare(page);
          all.push({ viewport: viewport.name, state: stateName, ...(await audit(page, `${viewport.width}px / ${stateName}`)) });
        } catch (error) {
          all.push({ viewport: viewport.name, state: stateName, label: `${viewport.width}px / ${stateName}`, checks: [{ id: 'setup', title: `${viewport.width}px / ${stateName}: state could not be reached`, passed: false, detail: error.message.slice(0, 200) }] });
        } finally { await page.close(); await chrome.kill(); }
      }
    }
    // The access overlay is a modal dialog: audit it with a protected server.
    const port2 = await freePort();
    const guarded = await startServer({ root: ROOT, port: port2, env: { PATHASETU_DEMO_ACCESS_CODE: 'accessibility-audit-code-0123456789' } });
    try {
      for (const viewport of [VIEWPORTS[0], VIEWPORTS[1], VIEWPORTS[2]]) {
        const chrome = await launchChrome();
        const page = await newPage(chrome, `http://localhost:${port2}`, viewport);
        try {
          await page.waitFor(`document.querySelector('#access-overlay') && !document.querySelector('#access-overlay').classList.contains('hidden')`, (v) => v === true, 12000, 'overlay');
          all.push({ viewport: viewport.name, state: 'access overlay (protected demo)', ...(await audit(page, `${viewport.width}px / access overlay`)) });
        } catch (error) {
          all.push({ viewport: viewport.name, state: 'access overlay', label: `${viewport.width}px / access overlay`, checks: [{ id: 'setup', title: `${viewport.width}px / access overlay: state could not be reached`, passed: false, detail: error.message.slice(0, 200) }] });
        } finally { await page.close(); await chrome.kill(); }
      }
    } finally { await guarded.stop(); }
  }
} finally { await server?.stop(); }

await fs.mkdir(OUT_DIR, { recursive: true });
const checks = all.flatMap((entry) => entry.checks);
const failed = checks.filter((c) => !c.passed);
const summary = { generatedAt: new Date().toISOString(), blocked, browser: browserInfo, limitation: 'Headless Chromium with viewport emulation. Not a screen-reader test, not a real-phone test, not proof of WCAG conformance.', states: all.length, checks: checks.length, failed: failed.length };
await fs.writeFile(path.join(OUT_DIR, 'a11y-report.json'), JSON.stringify({ summary, results: all.map(({ viewport, state, report, tab, checks: c }) => ({ viewport, state, report, tab, checks: c })) }, null, 2));
const lines = [`# Accessibility and mobile-readiness audit (automated)`, '', `Generated ${summary.generatedAt}. ${summary.limitation}`, '', blocked ? `**BLOCKED:** ${blocked}` : `${summary.states} state/viewport combinations, ${summary.checks} checks, **${summary.failed} failed**.`, ''];
for (const c of failed) lines.push(`- FAIL ${c.title} — ${c.detail}`);
await fs.writeFile(path.join(OUT_DIR, 'a11y-report.md'), lines.join('\n') + '\n');
console.log(blocked ? `BLOCKED: ${blocked}` : `a11y audit: ${summary.states} states, ${summary.checks} checks, ${summary.failed} failed -> ${path.relative(ROOT, OUT_DIR)}`);
for (const c of failed.slice(0, 60)) console.log(`FAIL ${c.title} — ${c.detail.slice(0, 260)}`);
process.exit(blocked ? 2 : failed.length ? 1 : 0);
