import test from 'node:test';
import assert from 'node:assert/strict';
import { parseModelConfig } from '../src/server/modelConfig.js';

const parse = (env) => parseModelConfig(env, { fetchImpl: async () => { throw new Error('no network in config tests'); } });

test('with no provider variables the server stays on the labelled mock and reports the default retry policy', () => {
  const config = parse({});
  assert.equal(config.mode, 'mock');
  assert.equal(config.chain, null);
  assert.equal(config.needsAccessCode, false);
  assert.deepEqual(config.retryPolicy, { maxAutomaticAttempts: 5, baseDelayMs: 5000, factor: 2, maxDelayMs: 60000 });
  assert.equal(config.retryPolicySource, 'default');
});

test('PATHASETU_MODEL_PROVIDERS builds an ordered chain; each provider needs its own explicit model (no built-in model names)', () => {
  const config = parse({ PATHASETU_MODEL_PROVIDERS: 'ollama, gemini ,groq', OLLAMA_MODEL: 'o-m', GEMINI_API_KEY: 'k1', GEMINI_MODEL: 'g-m', GROQ_API_KEY: 'k2', GROQ_MODEL: 'q-m' });
  assert.equal(config.mode, 'chain');
  assert.deepEqual(config.chain.providers, [{ name: 'ollama', model: 'o-m' }, { name: 'gemini', model: 'g-m' }, { name: 'groq', model: 'q-m' }]);
  assert.equal(config.needsAccessCode, true, 'a hosted provider means learner text leaves the machine');
  assert.throws(() => parse({ PATHASETU_MODEL_PROVIDERS: 'ollama' }), /OLLAMA_MODEL/);
  assert.throws(() => parse({ PATHASETU_MODEL_PROVIDERS: 'gemini', GEMINI_MODEL: 'm' }), /GEMINI_API_KEY/);
  assert.throws(() => parse({ PATHASETU_MODEL_PROVIDERS: 'gemini', GEMINI_API_KEY: 'k' }), /GEMINI_MODEL/);
  assert.throws(() => parse({ PATHASETU_MODEL_PROVIDERS: 'groq', GROQ_API_KEY: 'k' }), /GROQ_MODEL/);
});

test('an Ollama-only chain on loopback needs no access code; a non-loopback Ollama URL does', () => {
  assert.equal(parse({ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm' }).needsAccessCode, false);
  assert.equal(parse({ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm', OLLAMA_URL: 'http://localhost:11434' }).needsAccessCode, false);
  assert.equal(parse({ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm', OLLAMA_URL: 'http://10.0.0.5:11434' }).needsAccessCode, true);
  assert.throws(() => parse({ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm', OLLAMA_URL: 'ftp://x' }), /OLLAMA_URL/);
});

test('bad provider lists are refused loudly: unknown names, duplicates, empty entries, and combining with the legacy single-provider switch', () => {
  assert.throws(() => parse({ PATHASETU_MODEL_PROVIDERS: 'openai', OLLAMA_MODEL: 'm' }), /unknown provider/i);
  assert.throws(() => parse({ PATHASETU_MODEL_PROVIDERS: 'ollama,ollama', OLLAMA_MODEL: 'm' }), /duplicate/i);
  assert.throws(() => parse({ PATHASETU_MODEL_PROVIDERS: 'ollama,,gemini', OLLAMA_MODEL: 'm' }), /empty/i);
  assert.throws(() => parse({ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm', PATHASETU_MODEL_PROVIDER: 'groq' }), /PATHASETU_MODEL_PROVIDER/);
  assert.equal(parse({ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm', PATHASETU_MODEL_PROVIDER: 'mock' }).mode, 'chain', 'the default value "mock" (as in .env.example) does not block the chain');
});

test('the legacy PATHASETU_MODEL_PROVIDER=groq path is unchanged and still needs its key', () => {
  assert.equal(parse({ PATHASETU_MODEL_PROVIDER: 'groq', GROQ_API_KEY: 'k' }).mode, 'groq');
  assert.throws(() => parse({ PATHASETU_MODEL_PROVIDER: 'groq' }), /GROQ_API_KEY/);
  assert.throws(() => parse({ PATHASETU_MODEL_PROVIDER: 'other' }), /mock or groq/);
});

test('retry limits and timings come from the environment, are normalised, and a bad value is an error rather than a silent default', () => {
  const config = parse({ PATHASETU_RETRY_MAX_ATTEMPTS: '3', PATHASETU_RETRY_BASE_DELAY_MS: '1500', PATHASETU_RETRY_FACTOR: '1.5', PATHASETU_RETRY_MAX_DELAY_MS: '9000' });
  assert.deepEqual(config.retryPolicy, { maxAutomaticAttempts: 3, baseDelayMs: 1500, factor: 1.5, maxDelayMs: 9000 });
  assert.equal(config.retryPolicySource, 'environment');
  assert.deepEqual(parse({ PATHASETU_RETRY_BASE_DELAY_MS: '2000' }).retryPolicy, { maxAutomaticAttempts: 5, baseDelayMs: 2000, factor: 2, maxDelayMs: 60000 }, 'unset values keep the documented defaults');
  for (const bad of [['PATHASETU_RETRY_MAX_ATTEMPTS', '0'], ['PATHASETU_RETRY_MAX_ATTEMPTS', '2.5'], ['PATHASETU_RETRY_MAX_ATTEMPTS', '51'], ['PATHASETU_RETRY_BASE_DELAY_MS', 'abc'], ['PATHASETU_RETRY_FACTOR', '0.5'], ['PATHASETU_RETRY_MAX_DELAY_MS', '-1'], ['PATHASETU_RETRY_BASE_DELAY_MS', '999999999']]) {
    assert.throws(() => parse({ [bad[0]]: bad[1] }), new RegExp(bad[0]), `${bad[0]}=${bad[1]} must be refused`);
  }
  assert.throws(() => parse({ PATHASETU_RETRY_BASE_DELAY_MS: '9000', PATHASETU_RETRY_MAX_DELAY_MS: '1000' }), /PATHASETU_RETRY_MAX_DELAY_MS/, 'the cap cannot be below the base delay');
});

test('model time budgets are configurable and tell the browser how long a re-check may take', () => {
  const dflt = parse({ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm' });
  assert.equal(dflt.timings.perProviderTimeoutMs, 20000);
  assert.equal(dflt.timings.deadlineMs, 45000);
  assert.ok(dflt.recheckTimeoutMs >= dflt.timings.deadlineMs, 'the browser must wait at least as long as the server chain');
  const custom = parse({ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm', PATHASETU_MODEL_TIMEOUT_MS: '3000', PATHASETU_MODEL_DEADLINE_MS: '7000' });
  assert.equal(custom.timings.perProviderTimeoutMs, 3000);
  assert.equal(custom.timings.deadlineMs, 7000);
  assert.throws(() => parse({ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm', PATHASETU_MODEL_TIMEOUT_MS: '0' }), /PATHASETU_MODEL_TIMEOUT_MS/);
  assert.throws(() => parse({ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm', PATHASETU_MODEL_TIMEOUT_MS: '9000', PATHASETU_MODEL_DEADLINE_MS: '1000' }), /PATHASETU_MODEL_DEADLINE_MS/);
  assert.equal(parse({}).recheckTimeoutMs, 8000, 'the mock/legacy default stays at the previous value');
});

test('planning by the model can be switched off, and the switch is reported', () => {
  assert.equal(parse({ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm' }).planning, true);
  assert.equal(parse({ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm', PATHASETU_MODEL_PLANNING: 'off' }).planning, false);
  assert.throws(() => parse({ PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm', PATHASETU_MODEL_PLANNING: 'maybe' }), /PATHASETU_MODEL_PLANNING/);
});

test('config objects never expose API keys', () => {
  const config = parse({ PATHASETU_MODEL_PROVIDERS: 'gemini,groq', GEMINI_API_KEY: 'SECRET-G', GEMINI_MODEL: 'g', GROQ_API_KEY: 'SECRET-Q', GROQ_MODEL: 'q' });
  assert.equal(JSON.stringify({ ...config, chain: config.chain.providers }).includes('SECRET'), false);
});
