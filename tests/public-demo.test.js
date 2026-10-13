// Fail-closed public/tunnel demo mode. Each test starts a real server process with a specific configuration.
// Synthetic inputs only; no provider is contacted. The access code must never appear in any response, log or error.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CODE = 'k3Vq9xT2mZ8wLb4RnY7cPd1e'; // synthetic, 24 characters
const WRONG = 'k3Vq9xT2mZ8wLb4RnY7cPd1X'; // same length, one character different
const BODY = JSON.stringify({ itemId: 'EL01', optionId: 'A', explanation: 'A synthetic test explanation with enough detail.' });
const TUNNEL = 'https://demo.example.test';

const BASE_ENV = { ...process.env, HOST: '127.0.0.1', PATHASETU_MODEL_PROVIDER: 'mock', GROQ_API_KEY: '', NODE_ENV: 'development', PATHASETU_DEMO_ACCESS_CODE: '', PATHASETU_PUBLIC_DEMO: '', PATHASETU_ALLOW_DRAFT_DEMO: '', PATHASETU_ALLOWED_ORIGINS: '' };

async function freePort() {
  return await new Promise((resolve, reject) => { const s = net.createServer(); s.once('error', reject); s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); }); });
}
function spawnServer(env, port) {
  const child = spawn(process.execPath, ['src/server/server.js'], { cwd: ROOT, env: { ...BASE_ENV, PORT: String(port), ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = ''; child.stdout.on('data', (c) => { logs += c; }); child.stderr.on('data', (c) => { logs += c; });
  return { child, logs: () => logs };
}
async function withServer(env, fn) {
  const port = await freePort();
  const { child, logs } = spawnServer(env, port);
  try {
    for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/api/health`)).ok) break; } catch { /* retry */ } await new Promise((r) => setTimeout(r, 100)); }
    return await fn({ port, base: `http://127.0.0.1:${port}`, logs });
  } finally { child.kill('SIGTERM'); await new Promise((r) => setTimeout(r, 150)); if (child.exitCode === null) child.kill('SIGKILL'); }
}
// A server that is expected to refuse to start. Returns the exit code, the output, and whether anything was listening.
async function startupOutcome(env) {
  const port = await freePort();
  const { child, logs } = spawnServer(env, port);
  const code = await new Promise((resolve) => { const timer = setTimeout(() => resolve('still-running'), 2500); child.on('exit', (c) => { clearTimeout(timer); resolve(c); }); });
  let listening = false;
  try { listening = (await fetch(`http://127.0.0.1:${port}/api/health`)).ok; } catch { /* nothing listening */ }
  child.kill('SIGKILL');
  return { code, output: logs(), listening };
}
const header = (code) => (code == null ? {} : { 'x-pathasetu-demo-code': code });
const get = (base, route, code) => fetch(`${base}${route}`, { headers: header(code), cache: 'no-store' });
const recheck = (base, code, origin = base) => fetch(`${base}/api/recheck`, { method: 'POST', headers: { 'content-type': 'application/json', origin, ...header(code) }, body: BODY });
// What a Host-rewriting proxy sends: the Host the server sees is local, the Origin is the public one.
const rewritten = (port, route, { method = 'GET', origin, code } = {}) => new Promise((resolve, reject) => {
  const req = http.request({ host: '127.0.0.1', port, path: route, method, headers: { host: `127.0.0.1:${port}`, ...(origin ? { origin } : {}), ...(method === 'POST' ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(BODY) } : {}), ...header(code) } }, (res) => { let t = ''; res.on('data', (c) => { t += c; }); res.on('end', () => resolve({ status: res.statusCode, text: t, headers: res.headers })); });
  req.on('error', reject); req.end(method === 'POST' ? BODY : undefined);
});

test('local mock development without a code keeps the documented open experience and says it is not a public demo', async () => {
  await withServer({}, async ({ base }) => {
    const health = await (await fetch(`${base}/api/health`)).json();
    assert.equal(health.provider, 'mock');
    assert.equal(health.publicDemo, false);
    assert.equal(health.accessRequired, false);
    assert.equal((await get(base, '/api/pack')).status, 200);
    assert.equal((await recheck(base, null)).status, 200);
  });
});

test('PATHASETU_PUBLIC_DEMO without an access code refuses to start, whatever the provider or NODE_ENV', async () => {
  for (const env of [{ NODE_ENV: 'development' }, { NODE_ENV: 'production' }, { NODE_ENV: 'production', PATHASETU_ALLOW_DRAFT_DEMO: 'true' }, { PATHASETU_MODEL_PROVIDER: 'mock' }]) {
    const outcome = await startupOutcome({ PATHASETU_PUBLIC_DEMO: 'true', ...env });
    assert.notEqual(outcome.code, 'still-running', JSON.stringify(env));
    assert.notEqual(outcome.code, 0);
    assert.equal(outcome.listening, false, 'nothing may be listening after a refused start');
    assert.match(outcome.output, /PATHASETU_DEMO_ACCESS_CODE/);
  }
});

test('PATHASETU_PUBLIC_DEMO refuses a short, whitespace-bearing, repetitive, sequential or low-variety code without echoing it', async () => {
  const weak = ['short-code-15ch', 'has a space in the middle 123', ' leading-and-trailing-space-code ', 'abababababababababababab', 'aaaaaaaaaaaaaaaaaaaaaaaa', 'abcdefghijklmnopqrstuvwx', 'abcabcabcabcabcabcabc1', '1111222233334444', 'passwordpasswordpassword'];
  for (const code of weak) {
    const outcome = await startupOutcome({ PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: code });
    assert.notEqual(outcome.code, 'still-running', `${JSON.stringify(code)} must be refused`);
    assert.notEqual(outcome.code, 0);
    assert.equal(outcome.listening, false);
    assert.ok(!outcome.output.includes(code.trim()) || code.trim().length < 6, 'the refused code must not be printed');
    assert.match(outcome.output, /PATHASETU_DEMO_ACCESS_CODE/);
  }
});

test('PATHASETU_PUBLIC_DEMO accepts only the exact values true or false: an ambiguous value fails closed', async () => {
  for (const value of ['1', 'yes', 'TRUE', 'True', 'on', 'enabled']) {
    const outcome = await startupOutcome({ PATHASETU_PUBLIC_DEMO: value, PATHASETU_DEMO_ACCESS_CODE: CODE });
    assert.notEqual(outcome.code, 'still-running', `${value} must not silently disable or enable public mode`);
    assert.notEqual(outcome.code, 0);
    assert.match(outcome.output, /PATHASETU_PUBLIC_DEMO must be true or false/);
  }
  await withServer({ PATHASETU_PUBLIC_DEMO: 'false' }, async ({ base }) => { assert.equal((await (await fetch(`${base}/api/health`)).json()).publicDemo, false); });
});

test('public mode with a strong code: health reports it, and session, pack and re-check all need the exact code', async () => {
  for (const nodeEnv of ['development', 'production']) {
    await withServer({ PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: CODE, NODE_ENV: nodeEnv, PATHASETU_ALLOW_DRAFT_DEMO: 'true' }, async ({ base, logs }) => {
      const health = await (await fetch(`${base}/api/health`)).json();
      assert.equal(health.publicDemo, true); assert.equal(health.accessRequired, true); assert.equal(health.provider, 'mock');
      assert.ok(!JSON.stringify(health).includes(CODE));
      for (const attempt of [null, WRONG, 'wrong-length']) {
        assert.equal((await get(base, '/api/session', attempt)).status, 401, `session ${attempt}`);
        const pack = await get(base, '/api/pack', attempt);
        assert.equal(pack.status, 401, `pack ${attempt}`);
        assert.doesNotMatch(await pack.text(), /EL01|Odia|bridge/i, 'a refusal carries no pack content');
        assert.equal((await recheck(base, attempt)).status, 401, `recheck ${attempt}`);
      }
      assert.equal((await get(base, '/api/session', CODE)).status, 200);
      const pack = await (await get(base, '/api/pack', CODE)).json();
      assert.equal(pack.demoDraftMode, true); assert.equal(pack.items.length, 8);
      assert.equal((await recheck(base, CODE)).status, 200);
      assert.ok(!logs().includes(CODE) && !logs().includes(WRONG), 'the code must never reach the logs');
    });
  }
});

test('public mode in production without the draft flag serves no unreviewed item even with the right code', async () => {
  await withServer({ PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: CODE, NODE_ENV: 'production' }, async ({ base }) => {
    const pack = await (await get(base, '/api/pack', CODE)).json();
    assert.equal(pack.items.length, 0);
    assert.equal((await recheck(base, CODE)).status, 404, 'a draft item cannot be re-checked');
  });
});

test('wrong guesses are throttled per client, but never block the correct code and never use up the authorised budget', async () => {
  await withServer({ PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: CODE, PATHASETU_FAILED_ATTEMPT_LIMIT: '3', PATHASETU_RECHECK_RATE_LIMIT: '2', PATHASETU_RATE_WINDOW_MS: '60000' }, async ({ base, logs }) => {
    const first = [await get(base, '/api/session', WRONG), await get(base, '/api/pack', WRONG), await recheck(base, WRONG)];
    assert.deepEqual(first.map((r) => r.status), [401, 401, 401], 'failures within the budget are ordinary refusals, counted together across routes');
    const throttled = await get(base, '/api/session', WRONG + 'Y');
    assert.equal(throttled.status, 429);
    assert.ok(Number(throttled.headers.get('retry-after')) >= 1);
    assert.equal((await throttled.json()).error, 'too_many_attempts');
    assert.equal((await recheck(base, null)).status, 429, 'a request with no code also counts as a failed access');
    // the correct code still works during the throttle, on every protected route
    assert.equal((await get(base, '/api/session', CODE)).status, 200);
    assert.equal((await get(base, '/api/pack', CODE)).status, 200);
    assert.equal((await recheck(base, CODE)).status, 200);
    assert.equal((await recheck(base, CODE)).status, 200);
    // the failures did not consume the authorised re-check budget (2): the third authorised call hits the ordinary limit
    const over = await recheck(base, CODE);
    assert.equal(over.status, 429);
    assert.equal((await over.json()).error, 'rate_limited');
    assert.ok(!logs().includes(CODE) && !logs().includes(WRONG), 'neither the right nor a wrong code is ever logged');
  });
});

test('the failed-attempt throttle expires: it is a window, not a permanent lockout', async () => {
  await withServer({ PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: CODE, PATHASETU_FAILED_ATTEMPT_LIMIT: '1', PATHASETU_RATE_WINDOW_MS: '1000' }, async ({ base }) => {
    assert.equal((await get(base, '/api/session', WRONG)).status, 401);
    assert.equal((await get(base, '/api/session', WRONG)).status, 429);
    await new Promise((r) => setTimeout(r, 1200));
    assert.equal((await get(base, '/api/session', WRONG)).status, 401, 'after the window a wrong code is an ordinary refusal again');
    assert.equal((await get(base, '/api/session', CODE)).status, 200);
  });
});

test('the failed-attempt limit setting is validated like the others (invalid values fall back to the default, not to unlimited)', async () => {
  await withServer({ PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: CODE, PATHASETU_FAILED_ATTEMPT_LIMIT: '0' }, async ({ base }) => {
    let throttled = 0;
    for (let i = 0; i < 40; i++) if ((await get(base, '/api/session', WRONG)).status === 429) throttled += 1;
    assert.ok(throttled > 0, 'a zero or invalid limit must still throttle (default 20 per window)');
  });
});

test('public mode with an exact HTTPS origin behind a Host-rewriting tunnel: allowed origin plus code works, everything else is refused', async () => {
  await withServer({ PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: CODE, PATHASETU_ALLOWED_ORIGINS: TUNNEL, PATHASETU_ALLOW_DRAFT_DEMO: 'true' }, async ({ port }) => {
    assert.equal((await rewritten(port, '/api/recheck', { method: 'POST', origin: TUNNEL, code: CODE })).status, 200);
    assert.equal((await rewritten(port, '/api/recheck', { method: 'POST', origin: TUNNEL })).status, 401, 'the origin allow-list does not replace the code');
    assert.equal((await rewritten(port, '/api/recheck', { method: 'POST', origin: TUNNEL, code: WRONG })).status, 401);
    assert.equal((await rewritten(port, '/api/pack', { origin: TUNNEL, code: CODE })).status, 200);
    for (const origin of ['https://evil.example.test', 'http://demo.example.test', 'https://demo.example.test:8443', 'https://sub.demo.example.test', 'null']) {
      assert.equal((await rewritten(port, '/api/recheck', { method: 'POST', origin, code: CODE })).status, 403, `${origin} must be refused even with the right code`);
      assert.equal((await rewritten(port, '/api/pack', { origin, code: CODE })).status, 403);
    }
  });
});

test('allowed-origin entries that are wildcards, paths, queries, credentials, default ports, upper-case or plain-http non-local fail at startup', async () => {
  const bad = ['*.example.test', 'https://*.example.test', 'https://demo.example.test/', 'https://demo.example.test/path', 'https://demo.example.test?x=1', 'https://demo.example.test#frag', 'https://user:secret@demo.example.test', 'https://demo.example.test:443', 'https://Demo.Example.test', 'http://demo.example.test', 'http://localhost.evil.test', 'ftp://demo.example.test', 'demo.example.test', 'https://', ''];
  for (const entry of bad.filter(Boolean)) {
    const outcome = await startupOutcome({ PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: CODE, PATHASETU_ALLOWED_ORIGINS: `${TUNNEL},${entry}` });
    assert.notEqual(outcome.code, 'still-running', `${entry} must be refused`);
    assert.notEqual(outcome.code, 0);
    assert.match(outcome.output, /PATHASETU_ALLOWED_ORIGINS/);
    assert.ok(!outcome.output.includes('secret'), 'credentials in an origin entry must not be echoed');
  }
  for (const ok of ['http://localhost:4173', 'http://127.0.0.1:4173', 'https://demo.example.test', 'https://demo.example.test:8443']) {
    const outcome = await startupOutcome({ PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: CODE, PATHASETU_ALLOWED_ORIGINS: ok });
    assert.equal(outcome.code, 'still-running', `${ok} is a valid exact origin`);
  }
});
