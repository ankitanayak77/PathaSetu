// Iteration 8: the browser scripts must find a browser that already exists on the machine, on macOS, Linux and Windows,
// and must report BLOCKED (not a raw ENOENT) when none is usable. Nothing here installs, downloads or contacts anything.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const RESOLVER = 'scripts/lib/browser-path.mjs';
const load = () => import(pathToFileURL(path.join(ROOT, RESOLVER)).href);

const MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MAC_CHROMIUM = '/Applications/Chromium.app/Contents/MacOS/Chromium';
const MAC_EDGE = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
const only = (...present) => (p) => present.includes(p);

test('an explicit CHROME_PATH that exists and is executable is used first, even when other browsers are installed', async () => {
  const { resolveBrowser } = await load();
  const r = resolveBrowser({ env: { CHROME_PATH: '/opt/custom/chrome' }, platform: 'darwin', isExecutable: only('/opt/custom/chrome', MAC_CHROME) });
  assert.equal(r.status, 'FOUND');
  assert.equal(r.path, '/opt/custom/chrome');
  assert.equal(r.source, 'CHROME_PATH');
});

test('an explicit CHROME_PATH that is missing is BLOCKED; a different installed browser is never launched instead', async () => {
  const { resolveBrowser } = await load();
  const r = resolveBrowser({ env: { CHROME_PATH: '/typo/chrome' }, platform: 'darwin', isExecutable: only(MAC_CHROME) });
  assert.equal(r.status, 'BLOCKED');
  assert.equal(r.reason, 'invalid_chrome_path');
  assert.equal(r.path, undefined, 'no fallback path may be returned');
  assert.match(r.detail, /CHROME_PATH/);
  assert.match(r.detail, /\/typo\/chrome/);
});

test('an empty or whitespace CHROME_PATH counts as not configured and normal discovery runs', async () => {
  const { resolveBrowser } = await load();
  for (const value of ['', '   ']) {
    const r = resolveBrowser({ env: { CHROME_PATH: value }, platform: 'darwin', isExecutable: only(MAC_CHROME) });
    assert.equal(r.status, 'FOUND');
    assert.equal(r.path, MAC_CHROME);
    assert.equal(r.source, 'standard location');
  }
});

test('macOS discovery checks Google Chrome, then Chromium, then Microsoft Edge application bundles, in that order', async () => {
  const { resolveBrowser, candidateBrowsers } = await load();
  assert.deepEqual(candidateBrowsers('darwin', {}).map((c) => c.path).slice(0, 3), [MAC_CHROME, MAC_CHROMIUM, MAC_EDGE]);
  assert.equal(resolveBrowser({ env: {}, platform: 'darwin', isExecutable: only(MAC_CHROMIUM, MAC_EDGE) }).path, MAC_CHROMIUM);
  assert.equal(resolveBrowser({ env: {}, platform: 'darwin', isExecutable: only(MAC_EDGE) }).path, MAC_EDGE);
  const r = resolveBrowser({ env: {}, platform: 'darwin', isExecutable: only(MAC_CHROME, MAC_EDGE) });
  assert.equal(r.path, MAC_CHROME);
  assert.equal(r.label, 'Google Chrome');
});

test('macOS discovery never offers the Linux-only /usr/bin/chromium path', async () => {
  const { candidateBrowsers } = await load();
  assert.ok(!candidateBrowsers('darwin', {}).some((c) => c.path === '/usr/bin/chromium'));
});

test('Linux discovery covers Chromium and Chrome locations; Windows discovery builds Chrome and Edge paths from the environment', async () => {
  const { candidateBrowsers } = await load();
  const linux = candidateBrowsers('linux', {}).map((c) => c.path);
  for (const p of ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable']) assert.ok(linux.includes(p), p);
  const win = candidateBrowsers('win32', { PROGRAMFILES: 'C:\\Program Files', 'PROGRAMFILES(X86)': 'C:\\Program Files (x86)', LOCALAPPDATA: 'C:\\Users\\x\\AppData\\Local' }).map((c) => c.path);
  assert.ok(win.some((p) => /Google[\\/]Chrome[\\/]Application[\\/]chrome\.exe$/i.test(p)));
  assert.ok(win.some((p) => /Microsoft[\\/]Edge[\\/]Application[\\/]msedge\.exe$/i.test(p)));
  assert.ok(win.some((p) => p.startsWith('C:\\Users\\x\\AppData\\Local')), 'per-user installs are checked');
  assert.deepEqual(candidateBrowsers('win32', {}).map((c) => c.path).filter((p) => /undefined|null/.test(p)), [], 'missing environment variables must not produce garbage paths');
});

test('when nothing usable exists the result is BLOCKED with the list of places tried, not an exception', async () => {
  const { resolveBrowser } = await load();
  for (const platform of ['darwin', 'linux', 'win32']) {
    const r = resolveBrowser({ env: {}, platform, isExecutable: () => false });
    assert.equal(r.status, 'BLOCKED');
    assert.equal(r.reason, 'no_browser_found');
    assert.ok(Array.isArray(r.tried) && r.tried.length >= 3, `${platform} tried list`);
    assert.match(r.detail, /CHROME_PATH/);
    assert.match(r.detail, /BLOCKED|not installed|no (permitted|usable)/i);
  }
});

test('the default executable check accepts an executable file and rejects a missing path, a directory and a non-executable file', async () => {
  const { defaultIsExecutable } = await load();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pathasetu-bp-'));
  try {
    const exe = path.join(dir, 'fake-browser'); fs.writeFileSync(exe, '#!/bin/sh\nexit 0\n'); fs.chmodSync(exe, 0o755);
    const plain = path.join(dir, 'plain.txt'); fs.writeFileSync(plain, 'x'); fs.chmodSync(plain, 0o644);
    assert.equal(defaultIsExecutable(exe), true);
    assert.equal(defaultIsExecutable(path.join(dir, 'missing')), false);
    assert.equal(defaultIsExecutable(dir), false, 'a directory is not a browser');
    if (process.platform !== 'win32' && process.getuid?.() !== 0) assert.equal(defaultIsExecutable(plain), false);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('the resolver is dependency-free, offline and does not download or launch anything', () => {
  const src = read(RESOLVER);
  const imports = [...src.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
  assert.ok(imports.every((m) => m.startsWith('node:')), `only Node built-ins: ${imports.join(', ')}`);
  assert.ok(!/\bfetch\s*\(|node:https?|node:net|node:dns|XMLHttpRequest|WebSocket|curl|wget|spawn|exec(File)?Sync?\s*\(|npm\s+install|playwright\s+install/.test(src), 'no network, download or process launch');
});

test('launchChrome refuses an invalid explicit path with a BROWSER_BLOCKED error instead of a raw ENOENT', async () => {
  const { launchChrome } = await import(pathToFileURL(path.join(ROOT, 'scripts/lib/devtools.mjs')).href);
  await assert.rejects(() => launchChrome({ chromePath: path.join(os.tmpdir(), 'pathasetu-no-such-browser') }), (error) => {
    assert.equal(error.code, 'BROWSER_BLOCKED');
    assert.equal(error.browserBlocked, true);
    assert.notEqual(error.code, 'ENOENT');
    return true;
  });
});

test('a managed-browser policy refusal is classified as POLICY_BLOCKED and stays distinct from a missing browser', async () => {
  const { classifyNavigationError } = await load();
  assert.equal(classifyNavigationError('net::ERR_BLOCKED_BY_ADMINISTRATOR'), 'POLICY_BLOCKED');
  assert.equal(classifyNavigationError('net::ERR_CONNECTION_REFUSED'), null);
  assert.equal(classifyNavigationError(undefined), null);
});

test('the evidence record names the executable, how it was chosen and its version, and carries no secrets', async () => {
  const { browserRecord } = await load();
  const record = browserRecord({ status: 'FOUND', path: MAC_CHROME, source: 'CHROME_PATH', label: 'explicit' }, 'Chrome/141.0.0.0');
  assert.deepEqual(Object.keys(record).sort(), ['executable', 'selectedBy', 'status', 'version']);
  assert.equal(record.executable, MAC_CHROME);
  assert.equal(record.version, 'Chrome/141.0.0.0');
  const blocked = browserRecord({ status: 'BLOCKED', reason: 'no_browser_found', detail: 'none', tried: ['a'] }, null);
  assert.equal(blocked.status, 'BLOCKED');
  assert.equal(blocked.executable, null);
});

test('no browser script keeps its own /usr/bin/chromium default; every launcher goes through the shared resolver', () => {
  for (const f of ['scripts/lib/devtools.mjs', 'scripts/capture.mjs', 'scripts/browser-regression.mjs', 'scripts/accessibility-audit.mjs', 'scripts/capture-screens.mjs']) {
    assert.ok(!/\/usr\/bin\/chromium/.test(read(f).replace(/\/\/[^\n]*/g, '')), `${f} still hard-codes /usr/bin/chromium`);
  }
  for (const f of ['scripts/lib/devtools.mjs', 'scripts/capture.mjs', 'scripts/browser-regression.mjs']) {
    assert.match(read(f), /browser-path\.mjs/, `${f} must use the shared resolver`);
  }
});

test('the syntax check covers the new resolver and capture.mjs', () => {
  const check = JSON.parse(read('package.json')).scripts.check;
  assert.ok(check.includes('node --check scripts/lib/browser-path.mjs'));
  assert.ok(check.includes('node --check scripts/capture.mjs'));
});

test('the operator documents explain CHROME_PATH and the macOS app-bundle path, and do not imply that /usr/bin/chromium exists on a Mac', () => {
  for (const f of ['README.md', 'docs/DEMO_RUNBOOK.md']) {
    const text = read(f);
    assert.match(text, /CHROME_PATH/, f);
    assert.match(text, /Google Chrome\.app\/Contents\/MacOS\/Google Chrome/, `${f} must show the macOS app-bundle example`);
    assert.match(text, /BLOCKED/, `${f} must say that a missing or policy-blocked browser leaves the browser checks BLOCKED`);
    for (const line of text.split('\n')) {
      if (/(on (a )?mac|macos)/i.test(line) && /\/usr\/bin\/chromium/.test(line)) assert.match(line, /\b(no|not|isn't|doesn't|does not)\b/i, `${f} implies /usr/bin/chromium on macOS: ${line.slice(0, 120)}`);
    }
  }
});
