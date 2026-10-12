import test from 'node:test';
import assert from 'node:assert/strict';
import { createGroqModel, buildGroqRequestBody } from '../src/server/groqModel.js';
import { loadPack } from '../src/core/content.js';

const item = loadPack().items[0];
const sample = { questionId: item.id, type: 'MISCONCEPTION', misconceptionId: item.allowedMisconceptionIds[0], confidence: 0.88, rationale: 'Synthetic fixture.' };
function okResponse(body) { return { ok: true, status: 200, async json() { return { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(body) } }] }; } }; }
function badResponse(status, text) { return { ok: false, status, async text() { return text; } }; }

test('Groq request uses strict allowed-ID schema, bounded synthetic context, and server-side key', async () => {
  let request;
  const model = createGroqModel({ apiKey: 'test-secret-never-log', fetchImpl: async (url, init) => { request = { url, init, body: JSON.parse(init.body) }; return okResponse(sample); } });
  const result = await model({ item, optionId: 'A', explanation: 'A synthetic student explanation.' });
  assert.equal(result.questionId, item.id);
  assert.equal(request.url, 'https://api.groq.com/openai/v1/chat/completions');
  assert.equal(request.init.headers.authorization, 'Bearer test-secret-never-log');
  assert.equal(request.body.response_format.json_schema.strict, true);
  assert.ok(request.body.response_format.json_schema.schema.properties.misconceptionId.enum.includes(sample.misconceptionId));
  assert.equal(request.body.store, false);
  assert.equal(request.body.messages[1].content.includes(item.promptOdiaDraft), true, 'Odia draft is passed as explicitly unreviewed context');
  assert.equal(request.body.messages[1].content.includes('UNREVIEWED_DRAFT'), true);
  assert.equal(JSON.stringify(request.body).includes('test-secret-never-log'), false);
});

test('NONE sentinel is normalized to null before independent validation', async () => {
  const model = createGroqModel({ apiKey: 'test', fetchImpl: async () => okResponse({ questionId: item.id, type: 'NONE', misconceptionId: 'NONE', confidence: 0.9, rationale: 'Synthetic correct-response fixture.' }) });
  const result = await model({ item, optionId: 'B', explanation: 'A sufficiently long synthetic explanation.' });
  assert.equal(result.misconceptionId, null);
});

test('strict-schema-related HTTP 400 retries once with best-effort schema', async () => {
  let calls = 0; const strictValues = [];
  const model = createGroqModel({ apiKey: 'test', fetchImpl: async (_url, init) => {
    calls++; strictValues.push(JSON.parse(init.body).response_format.json_schema.strict);
    if (calls === 1) return badResponse(400, 'response_format json_schema unsupported in this fixture');
    return okResponse(sample);
  } });
  await model({ item, optionId: 'A', explanation: 'Synthetic explanation.' });
  assert.equal(calls, 2);
  assert.deepEqual(strictValues, [true, false]);
});

test('other upstream errors do not expose provider response body', async () => {
  const model = createGroqModel({ apiKey: 'test-secret', fetchImpl: async () => badResponse(429, 'sensitive-provider-detail-should-not-escape') });
  await assert.rejects(model({ item, optionId: 'A', explanation: 'Synthetic explanation.' }), (error) => {
    assert.equal(error.code, 'groq_http_429');
    assert.equal(error.message.includes('sensitive-provider-detail'), false);
    return true;
  });
});

test('timeout aborts a hanging fetch and exposes only a safe timeout code', async () => {
  const model = createGroqModel({ apiKey: 'test', timeoutMs: 10, fetchImpl: (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(Object.assign(new Error('abort'), { name: 'AbortError' })), { once: true })) });
  await assert.rejects(model({ item, optionId: 'A', explanation: 'Synthetic explanation.' }), (error) => error.code === 'groq_timeout');
});

test('request builder rejects an option that does not belong to the item', () => {
  assert.throws(() => buildGroqRequestBody({ model: 'openai/gpt-oss-20b', item, optionId: 'Z', explanation: '', strict: true }), /invalid_option/);
});
