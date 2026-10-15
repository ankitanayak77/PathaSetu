// Hotfix 1 to Iteration 15: the unit tests must not depend on, or be broken by, provider variables the operator has exported in the terminal.
// Found on 14 Oct 2026 when five tests failed after the operator exported PATHASETU_MODEL_PROVIDERS, GROQ_API_KEY and an access code, then ran npm test.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { cleanEnv, SCRUBBED_NAMES } from './helpers/cleanEnv.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('cleanEnv removes every provider, model, access and server variable from the inherited environment, keeps the rest, and applies the overrides', () => {
  const base = { PATH: '/usr/bin', HOME: '/home/x', CHROME_PATH: '/c', PATHASETU_MODEL_PROVIDERS: 'ollama,gemini,groq', PATHASETU_DEMO_ACCESS_CODE: 'x', PATHASETU_RETRY_BASE_DELAY_MS: '1', GROQ_API_KEY: 'k', GROQ_MODEL: 'm', GEMINI_API_KEY: 'k', GEMINI_MODEL: 'm', OLLAMA_URL: 'u', OLLAMA_MODEL: 'm', HOST: '0.0.0.0', PORT: '1', NODE_ENV: 'production', PATHASETU_SOMETHING_NEW: 'y' };
  const env = cleanEnv({ PORT: '4999' }, base);
  assert.equal(env.PATH, '/usr/bin'); assert.equal(env.HOME, '/home/x'); assert.equal(env.CHROME_PATH, '/c');
  assert.equal(env.PORT, '4999');
  for (const key of ['PATHASETU_MODEL_PROVIDERS', 'PATHASETU_DEMO_ACCESS_CODE', 'PATHASETU_RETRY_BASE_DELAY_MS', 'GROQ_API_KEY', 'GROQ_MODEL', 'GEMINI_API_KEY', 'GEMINI_MODEL', 'OLLAMA_URL', 'OLLAMA_MODEL', 'HOST', 'NODE_ENV', 'PATHASETU_SOMETHING_NEW']) assert.equal(key in env, false, `${key} must not be inherited`);
  assert.ok(SCRUBBED_NAMES.includes('GROQ_API_KEY') && SCRUBBED_NAMES.includes('GEMINI_API_KEY'));
  assert.deepEqual(cleanEnv({}, { PATH: 'p' }), { PATH: 'p' });
});

test('no test file hands the raw terminal environment to a server or script it starts', () => {
  const offenders = [];
  for (const file of fs.readdirSync(path.join(ROOT, 'tests')).filter((f) => f.endsWith('.test.js') && f !== 'iteration15-hermetic-env.test.js')) {
    const text = fs.readFileSync(path.join(ROOT, 'tests', file), 'utf8');
    if (/\.\.\.process\.env\b/.test(text)) offenders.push(file);
  }
  assert.deepEqual(offenders, [], 'use cleanEnv() from tests/helpers/cleanEnv.js instead of spreading process.env');
});

test('the suites that start a server or preflight still pass when the operator has exported a full provider chain, keys and an access code', () => {
  const polluted = {
    PATH: process.env.PATH, HOME: process.env.HOME,
    PATHASETU_MODEL_PROVIDER: 'mock', PATHASETU_MODEL_PROVIDERS: 'ollama,gemini,groq',
    OLLAMA_URL: 'http://127.0.0.1:11434', OLLAMA_MODEL: 'some-local-model',
    GEMINI_API_KEY: 'synthetic-not-a-real-gemini-key', GEMINI_MODEL: 'some-gemini-model',
    GROQ_API_KEY: 'synthetic-not-a-real-groq-key', GROQ_MODEL: 'some-groq-model',
    PATHASETU_DEMO_ACCESS_CODE: 'Zq7Lm2Xv9Rt4Kp8Wn3Bc6Yd', PATHASETU_PROVIDER_DATA_CONTROLS_ACK: 'true',
    PATHASETU_MODEL_TIMEOUT_MS: '25000', PATHASETU_MODEL_DEADLINE_MS: '60000', PATHASETU_MODEL_PLANNING: 'on',
    PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_ALLOWED_ORIGINS: 'https://example.test', HOST: '0.0.0.0', NODE_ENV: 'production'
  };
  const files = ['tests/preflight.test.js', 'tests/iteration15-preflight.test.js', 'tests/iteration15-server-chain.test.js', 'tests/public-demo.test.js', 'tests/access-policy.test.js', 'tests/proxy-origin.test.js', 'tests/iteration5-evidence.test.js', 'tests/server.test.js', 'tests/evaluation.test.js'];
  const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...files], { cwd: ROOT, env: polluted, encoding: 'utf8', timeout: 240000 });
  const failed = (run.stdout.match(/^\s*not ok .*$/gm) || []).slice(0, 8);
  assert.deepEqual(failed, [], 'tests failed under an exported provider environment');
  assert.equal(run.status, 0, run.stderr.slice(0, 400));
  assert.match(run.stdout, /^# pass \d+/m);
});
