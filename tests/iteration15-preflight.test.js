import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanEnv } from './helpers/cleanEnv.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CODE = 'preflight-test-access-code-9Kq2Vx7mT4';
const KEY = 'AIzaSYNTHETICPREFLIGHTGEMINIKEYDONOTUSE';
const CLEAN = Object.fromEntries(['HOST', 'PORT', 'NODE_ENV', 'PATHASETU_MODEL_PROVIDER', 'PATHASETU_MODEL_PROVIDERS', 'OLLAMA_URL', 'OLLAMA_MODEL', 'GEMINI_API_KEY', 'GEMINI_MODEL', 'GROQ_API_KEY', 'GROQ_MODEL', 'PATHASETU_DEMO_ACCESS_CODE', 'PATHASETU_PUBLIC_DEMO', 'PATHASETU_ALLOW_DRAFT_DEMO', 'PATHASETU_ALLOWED_ORIGINS', 'PATHASETU_PROVIDER_DATA_CONTROLS_ACK', 'PATHASETU_RETRY_BASE_DELAY_MS', 'PATHASETU_RETRY_MAX_ATTEMPTS', 'PATHASETU_MODEL_TIMEOUT_MS', 'PATHASETU_MODEL_DEADLINE_MS', 'PATHASETU_MODEL_PLANNING'].map((k) => [k, '']));
function preflight(env = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['scripts/preflight.mjs'], { cwd: ROOT, env: cleanEnv({ ...CLEAN, ...env }), stdio: ['ignore', 'pipe', 'pipe'] });
    let out = ''; child.stdout.on('data', (c) => { out += c; }); child.stderr.on('data', (c) => { out += c; });
    const timer = setTimeout(() => child.kill('SIGKILL'), 45000);
    child.on('exit', (code) => { clearTimeout(timer); resolve({ code, out }); });
  });
}
const failed = (out) => out.split('\n').filter((l) => l.startsWith('FAIL'));

test('a local Ollama-only chain passes, names the chain and model, and needs no hosted-data acknowledgement', async () => {
  const { code, out } = await preflight({ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'local-test-model' });
  assert.equal(code, 0, out);
  assert.match(out, /model chain: ollama \(local-test-model\)/i);
  assert.equal(failed(out).length, 0);
});

test('a hosted provider in the chain needs the data-controls acknowledgement and a strong access code, and never prints its key', async () => {
  const env = { PATHASETU_MODEL_PROVIDERS: 'ollama,gemini', OLLAMA_MODEL: 'o', GEMINI_API_KEY: KEY, GEMINI_MODEL: 'g' };
  const noAck = await preflight({ ...env, PATHASETU_DEMO_ACCESS_CODE: CODE });
  assert.equal(noAck.code, 1, noAck.out); assert.match(noAck.out, /PATHASETU_PROVIDER_DATA_CONTROLS_ACK/); assert.ok(!noAck.out.includes(KEY));
  const noCode = await preflight({ ...env, PATHASETU_PROVIDER_DATA_CONTROLS_ACK: 'true' });
  assert.equal(noCode.code, 1, noCode.out); assert.match(noCode.out, /PATHASETU_DEMO_ACCESS_CODE/); assert.ok(!noCode.out.includes(KEY));
  const ok = await preflight({ ...env, PATHASETU_PROVIDER_DATA_CONTROLS_ACK: 'true', PATHASETU_DEMO_ACCESS_CODE: CODE });
  assert.equal(ok.code, 0, ok.out); assert.ok(!ok.out.includes(KEY)); assert.ok(!ok.out.includes(CODE));
  assert.match(ok.out, /model chain: ollama \(o\) → gemini \(g\)/);
});

test('a bad chain, bad model setting or bad retry setting fails with the variable name', async () => {
  for (const [env, name] of [[{ PATHASETU_MODEL_PROVIDERS: 'openai', OLLAMA_MODEL: 'm' }, /PATHASETU_MODEL_PROVIDERS/], [{ PATHASETU_MODEL_PROVIDERS: 'ollama' }, /OLLAMA_MODEL/], [{ PATHASETU_RETRY_MAX_ATTEMPTS: '0' }, /PATHASETU_RETRY_MAX_ATTEMPTS/], [{ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm', PATHASETU_MODEL_PLANNING: 'maybe' }, /PATHASETU_MODEL_PLANNING/]]) {
    const { code, out } = await preflight(env);
    assert.equal(code, 1, out); assert.match(out, name);
  }
});

test('the retry policy and time budgets in force are reported', async () => {
  const { code, out } = await preflight({ PATHASETU_RETRY_BASE_DELAY_MS: '1500', PATHASETU_RETRY_MAX_ATTEMPTS: '3' });
  assert.equal(code, 0, out);
  assert.match(out, /retry policy \(environment\): 3 attempts, base 1500 ms/);
});

test('preflight reads the pure environment parser only: it cannot import or construct a provider client', () => {
  const source = ['scripts/preflight.mjs', 'scripts/lib/preflight.mjs'].map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  assert.match(source, /modelEnv\.js/);
  assert.doesNotMatch(source, /providers\.js|modelConfig\.js|groqModel|createOllamaClient|createGeminiClient|createGroqClient/);
  const imports = [...fs.readFileSync(path.join(ROOT, 'src/server/modelEnv.js'), 'utf8').matchAll(/^import .* from '(.+)';/gm)].map((m) => m[1]);
  assert.deepEqual(imports, ['../core/retry.js'], 'the pure parser imports only the pure retry policy, nothing that can reach the network');
});
