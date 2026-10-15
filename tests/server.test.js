import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { setTimeout as sleep } from 'node:timers/promises';
import { once } from 'node:events';
import { cleanEnv } from './helpers/cleanEnv.js';

async function freePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function waitFor(base, process) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (process.exitCode !== null) throw new Error('test server exited before becoming ready');
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) return response.json();
    } catch { /* retry during startup */ }
    await sleep(100);
  }
  throw new Error('test server readiness timed out');
}

test('server enforces demo access for session/re-check and hides draft content in production', async () => {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const accessCode = 'test-pathasetu-access-code-12345';
  const child = spawn(process.execPath, ['src/server/server.js'], {
    cwd: new URL('..', import.meta.url),
    env: cleanEnv({
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: String(port),
      PATHASETU_MODEL_PROVIDER: 'mock', PATHASETU_MODEL_PROVIDERS: '',
      PATHASETU_DEMO_ACCESS_CODE: accessCode,
      PATHASETU_ALLOW_DRAFT_DEMO: ''
    }),
    stdio: ['ignore', 'ignore', 'pipe']
  });
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  try {
    const health = await waitFor(base, child);
    assert.equal(health.accessRequired, true);
    assert.equal(health.provider, 'mock');

    const firebaseConfigResponse = await fetch(`${base}/api/firebase/config`, { cache: 'no-store' });
    assert.equal(firebaseConfigResponse.status, 200);
    assert.deepEqual(await firebaseConfigResponse.json(), { enabled: false }, 'the public config route must stay disabled without Web App settings');

    const noSession = await fetch(`${base}/api/session`);
    assert.equal(noSession.status, 401);
    const yesSession = await fetch(`${base}/api/session`, { headers: { 'x-pathasetu-demo-code': accessCode } });
    assert.equal(yesSession.status, 200);

    const packResponse = await fetch(`${base}/api/pack`);
    const pack = await packResponse.json();
    assert.equal(pack.demoDraftMode, false);
    assert.equal(pack.items.length, 0, 'unreviewed content must not leak into a production release');

    const body = JSON.stringify({ itemId: 'EL01', optionId: 'A', explanation: 'A synthetic test explanation with enough detail.' });
    const blocked = await fetch(`${base}/api/recheck`, { method: 'POST', headers: { 'content-type': 'application/json', origin: base }, body });
    assert.equal(blocked.status, 401);
    const wrongOrigin = await fetch(`${base}/api/recheck`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://wrong.example', 'x-pathasetu-demo-code': accessCode }, body });
    assert.equal(wrongOrigin.status, 403);
    const invalidOption = await fetch(`${base}/api/recheck`, { method: 'POST', headers: { 'content-type': 'application/json', origin: base, 'x-pathasetu-demo-code': accessCode }, body: JSON.stringify({ itemId: 'EL01', optionId: 'Z', explanation: 'synthetic explanation' }) });
    assert.equal(invalidOption.status, 400);
    const tooLong = await fetch(`${base}/api/recheck`, { method: 'POST', headers: { 'content-type': 'application/json', origin: base, 'x-pathasetu-demo-code': accessCode }, body: JSON.stringify({ itemId: 'EL01', optionId: 'A', explanation: 'x'.repeat(1001) }) });
    assert.equal(tooLong.status, 400);
    const draftBlocked = await fetch(`${base}/api/recheck`, { method: 'POST', headers: { 'content-type': 'application/json', origin: base, 'x-pathasetu-demo-code': accessCode }, body });
    assert.equal(draftBlocked.status, 404);
    assert.deepEqual(await draftBlocked.json(), { error: 'content_not_published' });
  } finally {
    if (child.exitCode === null) {
      child.kill('SIGTERM');
      await Promise.race([once(child, 'close').catch(() => {}), sleep(800)]);
      if (child.exitCode === null) child.kill('SIGKILL');
    }
    if (stderr && child.exitCode !== null && child.exitCode !== 0) console.error(stderr.slice(-500));
  }
});

test('Firebase-enabled static pages receive the same Firebase-aware CSP as API responses', async () => {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['src/server/server.js'], {
    cwd: new URL('..', import.meta.url),
    env: cleanEnv({
      NODE_ENV: 'development', HOST: '127.0.0.1', PORT: String(port),
      PATHASETU_MODEL_PROVIDER: 'mock', PATHASETU_MODEL_PROVIDERS: '',
      FIREBASE_PROJECT_ID: 'pathasetu-demo', FIREBASE_WEB_API_KEY: 'test-web-api-key-12345',
      FIREBASE_WEB_APP_ID: '1:123456789:web:abcdef012345', FIREBASE_AUTH_DOMAIN: 'pathasetu-demo.firebaseapp.com'
    }),
    stdio: ['ignore', 'ignore', 'pipe']
  });
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  try {
    await waitFor(base, child);
    const [page, configResponse] = await Promise.all([
      fetch(base), fetch(`${base}/api/firebase/config`, { cache: 'no-store' })
    ]);
    assert.equal(page.status, 200);
    assert.equal(configResponse.status, 200);
    assert.equal((await configResponse.json()).enabled, true);
    const csp = page.headers.get('content-security-policy');
    assert.match(csp, /script-src 'self' https:\/\/www\.gstatic\.com/);
    assert.match(csp, /connect-src[^;]*https:\/\/pathasetu-demo\.firebaseapp\.com/);
    assert.match(csp, /connect-src[^;]*https:\/\/identitytoolkit\.googleapis\.com/);
    assert.match(csp, /connect-src[^;]*https:\/\/firestore\.googleapis\.com/);
    assert.match(csp, /frame-src[^;]*https:\/\/accounts\.google\.com/);
    assert.match(csp, /form-action 'self' https:\/\/pathasetu-demo\.firebaseapp\.com/);
  } finally {
    if (child.exitCode === null) {
      child.kill('SIGTERM');
      await Promise.race([once(child, 'close').catch(() => {}), sleep(800)]);
      if (child.exitCode === null) child.kill('SIGKILL');
    }
    if (stderr && child.exitCode !== null && child.exitCode !== 0) console.error(stderr.slice(-500));
  }
});

test('server applies an in-memory per-client re-check rate limit with Retry-After', async () => {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const accessCode = 'test-pathasetu-rate-limit-code-12345';
  const child = spawn(process.execPath, ['src/server/server.js'], {
    cwd: new URL('..', import.meta.url),
    env: cleanEnv({
      NODE_ENV: 'development',
      HOST: '127.0.0.1',
      PORT: String(port),
      PATHASETU_MODEL_PROVIDER: 'mock', PATHASETU_MODEL_PROVIDERS: '',
      PATHASETU_DEMO_ACCESS_CODE: accessCode,
      PATHASETU_RECHECK_RATE_LIMIT: '2',
      PATHASETU_RATE_WINDOW_MS: '60000'
    }),
    stdio: ['ignore', 'ignore', 'pipe']
  });
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  try {
    await waitFor(base, child);
    const request = () => fetch(`${base}/api/recheck`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: base, 'x-pathasetu-demo-code': accessCode },
      body: JSON.stringify({ itemId: 'EL01', optionId: 'A', explanation: 'A synthetic explanation used only for a rate-limit test.' })
    });
    const first = await request();
    const second = await request();
    const third = await request();
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(third.status, 429);
    assert.ok(Number(third.headers.get('retry-after')) >= 1);
    assert.deepEqual(await third.json(), { error: 'rate_limited', retryAfterSeconds: Number(third.headers.get('retry-after')) });
  } finally {
    if (child.exitCode === null) {
      child.kill('SIGTERM');
      await Promise.race([once(child, 'close').catch(() => {}), sleep(800)]);
      if (child.exitCode === null) child.kill('SIGKILL');
    }
    if (stderr && child.exitCode !== null && child.exitCode !== 0) console.error(stderr.slice(-500));
  }
});
