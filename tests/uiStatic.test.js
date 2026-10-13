import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const html = read('public/index.html');
const app = read('public/app.js');
const sw = read('public/sw.js');
const css = read('public/styles.css');

test('every static DOM selector in the app maps to an existing HTML ID', () => {
  const staticIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const required = new Set([...app.matchAll(/\$\('([a-z0-9-]+)'\)/g)].map((match) => match[1]));
  const dynamicIds = new Set(['explanation-input', 'answer-form', 'submit-answer']);
  const missing = [...required].filter((id) => !staticIds.has(id) && !dynamicIds.has(id));
  for (const dynamicId of dynamicIds) assert.ok(app.includes(`id="${dynamicId}"`), `dynamic DOM id ${dynamicId} should be emitted by the renderer`);
  assert.deepEqual(missing, []);
});

test('language bridge visibly marks the Odia prompt and options as unreviewed drafts', () => {
  assert.match(app, /ODIA QUESTION · UNREVIEWED DRAFT/);
  assert.match(app, /textOdiaDraft/);
  assert.match(app, /lang="or"/);
  assert.match(html, /Odia wording awaits teacher review/);
  assert.match(css, /\.language-draft-block/);
});

test('service worker never caches API responses and has an offline navigation fallback', () => {
  assert.match(sw, /url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(sw, /caches\.match\('\/index\.html'\)/);
  assert.match(sw, /self\.clients\.claim\(\)/);
});

test('all authored executable assets are local rather than third-party scripts', () => {
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//i);
  assert.match(html, /<script type="module" src="\/app\.js"><\/script>/);
  assert.match(html, /<meta name="viewport"/);
  assert.match(css, /@media\(max-width:700px\)/);
});

test('service worker shell cache version is bumped for the revised feedback-first flow and Bridge Practice (v5)', () => {
  assert.match(sw, /pathasetu-shell-v7/);
  assert.doesNotMatch(sw, /pathasetu-shell-v4/);
  assert.match(app, /Review the feedback and remediation below/);
  assert.match(app, /Continue to \$\{next\.id\}/);
});

// ---- Iteration 2 static guards ------------------------------------------------------------------------------------
function importedBrowserModules() {
  // Every /core/*.js module reachable from the browser entry point must be in the offline shell, or the app breaks offline.
  const seen = new Set();
  const queue = [...app.matchAll(/from '\/core\/([a-zA-Z0-9_-]+\.js)'/g)].map((m) => m[1]);
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const text = read(`src/core/${file}`);
    for (const m of text.matchAll(/from '\.\/([a-zA-Z0-9_-]+\.js)'/g)) queue.push(m[1]);
  }
  return [...seen].sort();
}

test('the offline shell caches every core module the browser app imports (including Bridge Practice)', () => {
  const modules = importedBrowserModules();
  assert.ok(modules.includes('bridge.js') && modules.includes('agent.js'));
  const shell = sw.match(/const SHELL = \[([^\]]+)\]/)[1];
  for (const file of modules) assert.ok(shell.includes(`'/core/${file}'`), `${file} missing from the service worker shell`);
  for (const asset of ['/index.html', '/styles.css', '/app.js']) assert.ok(shell.includes(`'${asset}'`), `${asset} missing from the shell`);
});

test('the provider label visibly says MOCK when the mock provider is active', () => {
  assert.match(html, /<span id="provider-label">MOCK PROVIDER/);
  assert.match(app, /'MOCK PROVIDER · DEMO RULES · NO LIVE AI'/);
});

test('read-only tabs are blocked from writing, draining the queue and practising, and the banner is persistent', () => {
  assert.match(app, /if \(!ui\.pack \|\| !ui\.state \|\| !ui\.writable\) return;/);
  assert.match(app, /if \(!ui\.writable\) return; \/\/ only the writable tab may process queued work/);
  assert.match(html, /id="writer-banner"/);
  assert.match(app, /renderWriterBanner\(\);/);
});

test('re-check requests have a client timeout so a stalled provider cannot freeze the queue', () => {
  assert.match(app, /const RECHECK_TIMEOUT_MS = \d+;/);
  assert.match(app, /signal: controller\.signal/);
  assert.match(app, /recheck_timeout/);
});

test('Bridge Practice is wired in, local-only and draft-labelled', () => {
  assert.match(html, /id="bridge-practice-content"/);
  assert.match(app, /from '\/core\/bridge\.js'/);
  const start = app.indexOf('function renderBridgePractice');
  const end = app.indexOf('function renderPlan');
  const block = app.slice(start, end);
  assert.doesNotMatch(block, /fetch\(/);
  assert.match(block, /UNREVIEWED DRAFT/);
  assert.match(block, /aria-live="polite"/);
  assert.match(block, /aria-pressed/);
  assert.match(css, /\.bridge-option\{[^}]*min-height:48px/);
});

test('only the first install is allowed to claim the page silently; a later controller change announces an update', () => {
  assert.match(app, /let hadController = Boolean\(navigator\.serviceWorker\.controller\)/);
  assert.match(app, /if \(!hadController\) \{ hadController = true; return; \}/);
});

test('bounded retries are wired into the browser: gating, timer, persistent status and a deliberate Retry now action', () => {
  assert.match(app, /from '\/core\/retry\.js'/);
  assert.match(app, /isDue\(entry, Date\.now\(\)\)/);
  assert.match(app, /scheduleRetryTimer\(\)/);
  assert.match(app, /id="retry-now-button"/);
  assert.match(html, /id="queue-status"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(app, /manualRetryQueue\(\{ state: ui\.state \}\)/);
  assert.match(app, /if \(!event\.target\.closest\('#retry-now-button'\) \|\| !ui\.writable/);
  assert.match(sw, /'\/core\/retry\.js'/);
});

test('the retry-delay override is test-only plumbing and the shipped defaults are the conservative ones', () => {
  assert.match(app, /__PATHASETU_TEST_RETRY_POLICY__/);
  const retry = read('src/core/retry.js');
  assert.match(retry, /maxAutomaticAttempts: 5, baseDelayMs: 5000, factor: 2, maxDelayMs: 60000/);
  assert.doesNotMatch(retry, /setTimeout|setInterval|Date\.now\(\)|fetch\(/, 'the policy module stays pure');
});
