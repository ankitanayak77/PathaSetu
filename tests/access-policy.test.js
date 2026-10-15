// Demo access policy: whenever PATHASETU_DEMO_ACCESS_CODE is configured, draft content and the model-backed route need the code.
// Each test starts a real server process with a specific configuration. Synthetic inputs only; no provider is contacted.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanEnv } from './helpers/cleanEnv.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CODE = 'test-pathasetu-access-code-12345';
const BODY = JSON.stringify({ itemId: 'EL01', optionId: 'A', explanation: 'A synthetic test explanation with enough detail.' });

async function freePort() {
  return await new Promise((resolve, reject) => { const s = net.createServer(); s.once('error', reject); s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); }); });
}
async function withServer(env, fn) {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['src/server/server.js'], { cwd: ROOT, env: cleanEnv({ HOST: '127.0.0.1', PORT: String(port), PATHASETU_MODEL_PROVIDER: 'mock', PATHASETU_MODEL_PROVIDERS: '', GROQ_API_KEY: '', NODE_ENV: '', PATHASETU_ALLOW_DRAFT_DEMO: '', PATHASETU_DEMO_ACCESS_CODE: '', ...env }), stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  child.stdout.on('data', (c) => { logs += c; }); child.stderr.on('data', (c) => { logs += c; });
  try {
    for (let i = 0; i < 60; i++) { try { if ((await fetch(`${base}/api/health`)).ok) break; } catch { /* retry */ } await new Promise((r) => setTimeout(r, 100)); }
    return await fn({ base, logs: () => logs });
  } finally { child.kill('SIGTERM'); await new Promise((r) => setTimeout(r, 150)); if (child.exitCode === null) child.kill('SIGKILL'); }
}
const withCode = (code) => ({ 'x-pathasetu-demo-code': code });
const recheck = (base, headers = {}) => fetch(`${base}/api/recheck`, { method: 'POST', headers: { 'content-type': 'application/json', origin: base, ...headers }, body: BODY });

for (const [label, env] of [
  ['development with a configured access code', { NODE_ENV: 'development', PATHASETU_DEMO_ACCESS_CODE: CODE }],
  ['production with draft demo enabled', { NODE_ENV: 'production', PATHASETU_ALLOW_DRAFT_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: CODE }]
]) {
  test(`${label}: /api/pack and /api/recheck refuse an unauthorised client and serve an authorised one`, async () => {
    await withServer(env, async ({ base, logs }) => {
      const open = await fetch(`${base}/api/pack`);
      assert.equal(open.status, 401, 'draft content must not be served without the access code');
      const openText = await open.text();
      assert.doesNotMatch(openText, /EL01|bridge|Odia|stem/i, 'a refusal must not contain any pack content');
      assert.equal(JSON.parse(openText).error, 'demo_access_required');
      assert.equal((await fetch(`${base}/api/pack`, { headers: withCode('wrong-code-of-another-length') })).status, 401);
      assert.equal((await fetch(`${base}/api/pack`, { headers: withCode(CODE.slice(0, -1) + 'X') })).status, 401, 'same length, wrong value');
      const ok = await fetch(`${base}/api/pack`, { headers: withCode(CODE), cache: 'no-store' });
      assert.equal(ok.status, 200);
      const pack = await ok.json();
      assert.equal(pack.demoDraftMode, true);
      assert.equal(pack.items.length, 8);
      assert.equal((await recheck(base)).status, 401);
      assert.equal((await recheck(base, withCode('wrong-code-of-another-length'))).status, 401);
      const good = await recheck(base, withCode(CODE));
      assert.equal(good.status, 200);
      const data = await good.json();
      assert.equal(data.provider, 'mock');
      assert.equal((await fetch(`${base}/api/session`)).status, 401);
      assert.equal((await fetch(`${base}/api/session`, { headers: withCode(CODE) })).status, 200);
      const health = await (await fetch(`${base}/api/health`)).text();
      assert.equal(JSON.parse(health).accessRequired, true);
      for (const text of [health, openText, logs()]) assert.ok(!text.includes(CODE), 'the access code must never appear in a response or log');
    });
  });
}

test('development without an access code keeps the documented local experience open', async () => {
  await withServer({ NODE_ENV: 'development' }, async ({ base }) => {
    const pack = await (await fetch(`${base}/api/pack`)).json();
    assert.equal(pack.items.length, 8);
    assert.equal(pack.demoDraftMode, true);
    assert.equal((await recheck(base)).status, 200);
    assert.equal((await fetch(`${base}/api/session`)).status, 200);
    assert.equal((await (await fetch(`${base}/api/health`)).json()).accessRequired, false);
  });
});

test('production without draft demo serves no unreviewed item, even to an unauthorised client, and offers no draft re-check', async () => {
  await withServer({ NODE_ENV: 'production', PATHASETU_DEMO_ACCESS_CODE: CODE }, async ({ base }) => {
    const pack = await (await fetch(`${base}/api/pack`)).json();
    assert.equal(pack.items.length, 0);
    assert.equal(pack.demoDraftMode, false);
    const noCode = await recheck(base);
    assert.equal(noCode.status, 401);
    const withValid = await recheck(base, withCode(CODE));
    assert.equal(withValid.status, 404, 'a draft item cannot be re-checked in a production release');
  });
});

test('the smoke script sends the demo access header for the pack as well as the re-check, and stops on a refusal', () => {
  const source = fs.readFileSync(path.join(ROOT, 'scripts/model-smoke.mjs'), 'utf8');
  const packLine = source.split('\n').find((line) => line.includes('/api/pack'));
  assert.match(packLine, /x-pathasetu-demo-code/);
  assert.match(source, /pack_access_refused/);
});

test('the browser client sends the session-held access code with its pack request and never a provider key', () => {
  const app = fs.readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const packFetch = app.split('\n').find((line) => line.includes("fetch('/api/pack'"));
  assert.match(packFetch, /x-pathasetu-demo-code/);
  // Firebase Authentication uses browser authorization APIs; only provider credentials are forbidden in the client bundle.
  assert.doesNotMatch(app, /GROQ_API_KEY|gsk_/i);
});
