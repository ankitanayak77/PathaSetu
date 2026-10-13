// Iteration 5: pins behaviour that the jury Q&A and the architecture documents state, so those statements cannot silently drift.
// These tests describe existing behaviour; they were added because the documents claim it and nothing checked it before.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { createGroqModel } from '../src/server/groqModel.js';
import { loadPack } from '../src/core/content.js';

async function freePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => { const { port } = server.address(); server.close((e) => (e ? reject(e) : resolve(port))); });
  });
}
function rawGet(port, rawPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path: rawPath, method: 'GET' }, (res) => {
      let body = ''; res.on('data', (c) => { body += c; }); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject); req.end();
  });
}
async function withServer(fn) {
  const port = await freePort();
  const child = spawn(process.execPath, ['src/server/server.js'], { cwd: new URL('..', import.meta.url), env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', NODE_ENV: '', PATHASETU_MODEL_PROVIDER: 'mock', GROQ_API_KEY: '', PATHASETU_DEMO_ACCESS_CODE: '', PATHASETU_PUBLIC_DEMO: '', PATHASETU_ALLOWED_ORIGINS: '' }, stdio: 'ignore' });
  try {
    for (let i = 0; i < 40; i++) { if (child.exitCode !== null) throw new Error('server exited'); try { await rawGet(port, '/api/health'); break; } catch { await sleep(100); } }
    return await fn(port);
  } finally { child.kill('SIGTERM'); await sleep(100); }
}

test('every response carries the documented security headers (CSP, nosniff, no-referrer)', async () => {
  await withServer(async (port) => {
    for (const p of ['/', '/app.js', '/api/health', '/api/nope']) {
      const r = await rawGet(port, p);
      assert.match(r.headers['content-security-policy'] ?? '', /default-src 'self'/, p);
      assert.match(r.headers['content-security-policy'] ?? '', /frame-ancestors 'none'/, p);
      assert.match(r.headers['content-security-policy'] ?? '', /connect-src 'self'/, p);
      assert.equal(r.headers['x-content-type-options'], 'nosniff', p);
      assert.equal(r.headers['referrer-policy'], 'no-referrer', p);
    }
  });
});

test('traversal and private paths are refused: server code, the content folder, package files and encoded dot segments return no content', async () => {
  await withServer(async (port) => {
    const attempts = ['/../package.json', '/..%2fpackage.json', '/%2e%2e/package.json', '/core/../server/server.js', '/core/..%2f..%2fserver%2fserver.js', '/content/electricity-pack.json', '/src/server/server.js', '/core/sub/agent.js', '/core/%00.js'];
    for (const p of attempts) {
      const r = await rawGet(port, p);
      assert.ok([400, 404].includes(r.status), `${p} -> ${r.status}`);
      assert.ok(!r.body.includes('createServer') && !r.body.includes('"packId"') && !r.body.includes('"pathasetu-mvp"'), `${p} leaked content`);
    }
  });
});

test('the static route serves browser modules from src/core by file-name pattern (documented in SYSTEM_ARCHITECTURE.md section 5)', async () => {
  await withServer(async (port) => {
    assert.equal((await rawGet(port, '/core/agent.js')).status, 200);
    assert.equal((await rawGet(port, '/core/content.js')).status, 200, 'content.js is served too; the documentation says so and must change if this does');
  });
});

test('the hosted-model request carries the learner’s typed explanation, the answer key and the Odia drafts (the privacy answers say so)', async () => {
  const item = loadPack().items[0];
  let sent;
  const model = createGroqModel({ apiKey: 'test-key-not-real', fetchImpl: async (_u, init) => {
    sent = JSON.parse(init.body);
    return { ok: true, status: 200, async json() { return { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ questionId: item.id, type: 'UNCERTAIN', misconceptionId: 'NONE', confidence: 0.4, rationale: 'Synthetic.' }) } }] }; } };
  } });
  const marker = 'SYNTHETIC-EXPLANATION-MARKER-48151623';
  await model({ item, optionId: 'A', explanation: marker });
  const user = JSON.parse(sent.messages[1].content);
  assert.equal(user.learnerExplanation, marker);
  assert.equal(user.correctOptionId, item.correctOptionId);
  assert.equal(user.questionOdiaDraft, item.promptOdiaDraft);
  assert.equal(sent.store, false);
  assert.ok(!('explanation' in user) || user.explanation === undefined, 'no unexpected duplicate of the item explanation or remediation');
  assert.ok(!JSON.stringify(sent).includes(item.remediation), 'the remediation text is not sent');
});

test('the shipped app always re-checks with trusted:false, so confirmed gaps are never set from the UI (documented in the guide and Q129)', async () => {
  const fs = await import('node:fs');
  const source = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
  const calls = source.match(/recheckQueued\([^)]*\)/g) ?? [];
  assert.ok(calls.length >= 2);
  const withOverride = calls.filter((c) => c.includes('diagnosisOverride'));
  assert.ok(withOverride.length >= 1);
  for (const c of withOverride) assert.match(c, /trusted:\s*false/);
  assert.ok(!/trusted:\s*true/.test(source));
});
