// Behind an HTTPS tunnel or reverse proxy the Host header may be rewritten. The origin policy must stay strict by default
// and allow only exact, explicitly configured origins. Synthetic inputs only; no provider is contacted.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BODY = JSON.stringify({ itemId: 'EL01', optionId: 'A', explanation: 'A synthetic test explanation with enough detail.' });
const TUNNEL = 'https://demo.example.test';

async function freePort() {
  return await new Promise((resolve, reject) => { const s = net.createServer(); s.once('error', reject); s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); }); });
}
async function withServer(env, fn) {
  const port = await freePort();
  const child = spawn(process.execPath, ['src/server/server.js'], { cwd: ROOT, env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), PATHASETU_MODEL_PROVIDER: 'mock', GROQ_API_KEY: '', NODE_ENV: 'development', PATHASETU_DEMO_ACCESS_CODE: '', PATHASETU_ALLOWED_ORIGINS: '', ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = ''; child.stdout.on('data', (c) => { logs += c; }); child.stderr.on('data', (c) => { logs += c; });
  try {
    for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/api/health`)).ok) break; } catch { /* retry */ } await new Promise((r) => setTimeout(r, 100)); }
    return await fn({ port, logs: () => logs });
  } finally { child.kill('SIGTERM'); await new Promise((r) => setTimeout(r, 150)); if (child.exitCode === null) child.kill('SIGKILL'); }
}
// What a reverse proxy that rewrites Host to the local address sends.
const post = (port, origin) => new Promise((resolve, reject) => {
  const req = http.request({ host: '127.0.0.1', port, path: '/api/recheck', method: 'POST', headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(BODY), host: `127.0.0.1:${port}`, ...(origin ? { origin } : {}) } }, (res) => { let t = ''; res.on('data', (c) => { t += c; }); res.on('end', () => resolve({ status: res.statusCode, text: t })); });
  req.on('error', reject); req.end(BODY);
});
const exitCode = async (env) => {
  const child = spawn(process.execPath, ['src/server/server.js'], { cwd: ROOT, env: { ...process.env, HOST: '127.0.0.1', PORT: String(await freePort()), PATHASETU_MODEL_PROVIDER: 'mock', GROQ_API_KEY: '', NODE_ENV: 'development', ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  let err = ''; child.stderr.on('data', (c) => { err += c; });
  const code = await new Promise((resolve) => { const timer = setTimeout(() => { child.kill('SIGKILL'); resolve('still-running'); }, 2500); child.on('exit', (c) => { clearTimeout(timer); resolve(c); }); });
  return { code, err };
};

test('by default a POST whose Origin differs from the Host the server sees is refused', async () => {
  await withServer({}, async ({ port }) => {
    assert.equal((await post(port, TUNNEL)).status, 403);
    assert.equal((await post(port, `http://127.0.0.1:${port}`)).status, 200, 'same origin still works');
    assert.equal((await post(port, null)).status, 200, 'no Origin header (same-origin GET-like clients, curl) is not an Origin violation');
  });
});

test('an exact origin listed in PATHASETU_ALLOWED_ORIGINS is accepted behind a Host-rewriting proxy; every other origin is not', async () => {
  await withServer({ PATHASETU_ALLOWED_ORIGINS: `${TUNNEL}, https://second.example.test` }, async ({ port }) => {
    assert.equal((await post(port, TUNNEL)).status, 200);
    assert.equal((await post(port, 'https://second.example.test')).status, 200);
    assert.equal((await post(port, 'https://evil.example.test')).status, 403);
    assert.equal((await post(port, 'http://demo.example.test')).status, 403, 'scheme must match exactly');
    assert.equal((await post(port, 'https://demo.example.test:8443')).status, 403, 'port must match exactly');
    assert.equal((await post(port, 'https://sub.demo.example.test')).status, 403, 'no subdomain wildcard');
  });
});

test('the allow-list does not weaken the access code: a protected demo still needs it', async () => {
  const CODE = 'test-pathasetu-access-code-12345';
  await withServer({ PATHASETU_ALLOWED_ORIGINS: TUNNEL, PATHASETU_DEMO_ACCESS_CODE: CODE }, async ({ port }) => {
    assert.equal((await post(port, TUNNEL)).status, 401);
  });
});

test('malformed allow-list entries stop the server at startup instead of being ignored', async () => {
  for (const bad of ['*.example.test', 'https://demo.example.test/', 'https://demo.example.test/path', 'http://demo.example.test', 'not a url', 'ftp://demo.example.test']) {
    const { code, err } = await exitCode({ PATHASETU_ALLOWED_ORIGINS: bad });
    assert.notEqual(code, 'still-running', `${bad} should be rejected`);
    assert.notEqual(code, 0);
    assert.match(err, /PATHASETU_ALLOWED_ORIGINS/);
  }
  const ok = await exitCode({ PATHASETU_ALLOWED_ORIGINS: 'http://localhost:4173,https://demo.example.test' });
  assert.equal(ok.code, 'still-running', 'valid entries start normally');
});
