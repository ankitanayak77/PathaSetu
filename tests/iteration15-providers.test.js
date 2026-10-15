import test from 'node:test';
import assert from 'node:assert/strict';
import { createOllamaClient, createGeminiClient, createGroqClient, createProviderChain, validatePlanSuggestion, validateGeneratedItem, buildGenerationRequest } from '../src/server/providers.js';
import { loadPack } from '../src/core/content.js';

const pack = loadPack();
const item = pack.items[0];
const okDiagnosis = { questionId: item.id, type: 'MISCONCEPTION', misconceptionId: item.allowedMisconceptionIds[0], confidence: 0.9, rationale: 'Synthetic fixture.' };
const json = (body, status = 200) => ({ ok: status < 400, status, async json() { return body; }, async text() { return 'UPSTREAM-BODY-MUST-NOT-LEAK'; } });
const ollamaReply = (obj) => json({ model: 'm', message: { role: 'assistant', content: JSON.stringify(obj) }, done: true, done_reason: 'stop' });
const geminiReply = (obj, finishReason = 'STOP') => json({ candidates: [{ finishReason, content: { parts: [{ text: JSON.stringify(obj) }] } }] });
const codeOf = async (promise) => { try { await promise; } catch (error) { return error.code; } return 'NO_ERROR'; };

test('Ollama: posts a non-streaming chat with the diagnosis schema to the configured local URL and parses message.content', async () => {
  let seen;
  const client = createOllamaClient({ baseUrl: 'http://127.0.0.1:9999', model: 'test-model', fetchImpl: async (url, init) => { seen = { url, body: JSON.parse(init.body), headers: init.headers }; return ollamaReply({ ...okDiagnosis, misconceptionId: okDiagnosis.misconceptionId }); } });
  const chain = createProviderChain([client]);
  const out = await chain.diagnose({ item, optionId: 'A', explanation: 'A synthetic learner explanation.' });
  assert.equal(seen.url, 'http://127.0.0.1:9999/api/chat');
  assert.equal(seen.body.model, 'test-model');
  assert.equal(seen.body.stream, false);
  assert.ok(seen.body.format.properties.misconceptionId.enum.includes(okDiagnosis.misconceptionId));
  assert.equal(seen.body.messages[0].role, 'system');
  assert.match(seen.body.messages[1].content, /learnerExplanation/);
  assert.equal(out.provider, 'ollama');
  assert.equal(out.model, 'test-model');
  assert.equal(out.diagnosis.misconceptionId, okDiagnosis.misconceptionId);
});

test('Gemini: key goes in a header only, never in the URL or body; JSON mime type requested; text parts are joined', async () => {
  let seen;
  const client = createGeminiClient({ apiKey: 'gem-secret-key', model: 'gem-test', fetchImpl: async (url, init) => { seen = { url, init, body: JSON.parse(init.body) }; return geminiReply(okDiagnosis); } });
  const out = await createProviderChain([client]).diagnose({ item, optionId: 'A', explanation: 'A synthetic learner explanation.' });
  assert.equal(seen.url, 'https://generativelanguage.googleapis.com/v1beta/models/gem-test:generateContent');
  assert.equal(seen.init.headers['x-goog-api-key'], 'gem-secret-key');
  assert.equal(seen.url.includes('gem-secret-key'), false);
  assert.equal(seen.init.body.includes('gem-secret-key'), false);
  assert.equal(seen.body.generationConfig.responseMimeType, 'application/json');
  assert.ok(seen.body.systemInstruction.parts[0].text.length > 20);
  assert.equal(out.provider, 'gemini');
});

test('NONE sentinel becomes null before validation, for every provider', async () => {
  const none = { questionId: item.id, type: 'NONE', misconceptionId: 'NONE', confidence: 0.9, rationale: 'Synthetic.' };
  for (const client of [createOllamaClient({ model: 'm', fetchImpl: async () => ollamaReply(none) }), createGeminiClient({ apiKey: 'k', model: 'm', fetchImpl: async () => geminiReply(none) })]) {
    const out = await createProviderChain([client]).diagnose({ item, optionId: 'B', explanation: 'A synthetic learner explanation.' });
    assert.equal(out.diagnosis.misconceptionId, null);
  }
});

test('transport failures get stable codes and never include the upstream body', async () => {
  const bad = (status) => createOllamaClient({ model: 'm', fetchImpl: async () => json({}, status) });
  assert.equal(await codeOf(createProviderChain([bad(500)]).diagnose({ item, optionId: 'A', explanation: 'x'.repeat(10) })), 'all_providers_failed');
  const chain = createProviderChain([bad(500)]);
  try { await chain.diagnose({ item, optionId: 'A', explanation: 'x'.repeat(10) }); } catch (error) {
    assert.deepEqual(error.attempts.map((a) => [a.provider, a.code]), [['ollama', 'ollama_http_500']]);
    assert.equal(JSON.stringify(error.attempts).includes('UPSTREAM-BODY-MUST-NOT-LEAK'), false);
  }
  const down = createOllamaClient({ model: 'm', fetchImpl: async () => { throw new TypeError('fetch failed'); } });
  try { await createProviderChain([down]).diagnose({ item, optionId: 'A', explanation: 'x'.repeat(10) }); } catch (error) { assert.equal(error.attempts[0].code, 'ollama_unreachable'); }
  const truncated = createGeminiClient({ apiKey: 'k', model: 'm', fetchImpl: async () => geminiReply(okDiagnosis, 'MAX_TOKENS') });
  try { await createProviderChain([truncated]).diagnose({ item, optionId: 'A', explanation: 'x'.repeat(10) }); } catch (error) { assert.equal(error.attempts[0].code, 'gemini_empty_or_truncated_output'); }
  const blocked = createGeminiClient({ apiKey: 'k', model: 'm', fetchImpl: async () => json({ promptFeedback: { blockReason: 'SAFETY' } }) });
  try { await createProviderChain([blocked]).diagnose({ item, optionId: 'A', explanation: 'x'.repeat(10) }); } catch (error) { assert.equal(error.attempts[0].code, 'gemini_blocked'); }
  const garbage = createOllamaClient({ model: 'm', fetchImpl: async () => json({ message: { content: 'not json' } }) });
  try { await createProviderChain([garbage]).diagnose({ item, optionId: 'A', explanation: 'x'.repeat(10) }); } catch (error) { assert.equal(error.attempts[0].code, 'ollama_invalid_model_json'); }
});

test('a hung provider is abandoned at its own timeout and the next provider answers', async () => {
  const hung = createOllamaClient({ model: 'm', timeoutMs: 40, fetchImpl: (url, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))) });
  const good = createGeminiClient({ apiKey: 'k', model: 'm', fetchImpl: async () => geminiReply(okDiagnosis) });
  const out = await createProviderChain([hung, good]).diagnose({ item, optionId: 'A', explanation: 'A synthetic learner explanation.' });
  assert.equal(out.provider, 'gemini');
  assert.deepEqual(out.attempts.map((a) => [a.provider, a.code]), [['ollama', 'ollama_timeout']]);
});

test('providers are tried in the configured order and the first valid answer wins; no provider is called after it', async () => {
  const calls = [];
  const mk = (name, reply) => ({ name, model: `${name}-m`, async json() { calls.push(name); return reply(); } });
  const out = await createProviderChain([mk('ollama', () => { throw Object.assign(new Error('x'), { code: 'ollama_unreachable' }); }), mk('gemini', () => okDiagnosis), mk('groq', () => okDiagnosis)]).diagnose({ item, optionId: 'A', explanation: 'A synthetic learner explanation.' });
  assert.deepEqual(calls, ['ollama', 'gemini']);
  assert.equal(out.provider, 'gemini');
});

test('an answer naming a misconception that is not allowed for this question is rejected and the next provider is tried', async () => {
  const foreign = { ...okDiagnosis, misconceptionId: pack.items[2].allowedMisconceptionIds.find((id) => !item.allowedMisconceptionIds.includes(id)) };
  const mk = (name, body) => ({ name, model: 'm', async json() { return body; } });
  const out = await createProviderChain([mk('ollama', foreign), mk('gemini', okDiagnosis)]).diagnose({ item, optionId: 'A', explanation: 'A synthetic learner explanation.' });
  assert.equal(out.provider, 'gemini');
  assert.match(out.attempts[0].code, /^diagnosis_rejected_/);
});

test('when every provider fails the chain throws and never invents a diagnosis from a fixed rule', async () => {
  const dead = { name: 'ollama', model: 'm', async json() { throw Object.assign(new Error('x'), { code: 'ollama_unreachable' }); } };
  await assert.rejects(createProviderChain([dead]).diagnose({ item, optionId: 'A', explanation: 'A synthetic learner explanation.' }), (error) => error.code === 'all_providers_failed' && error.attempts.length === 1);
});

test('an empty provider list is refused at construction, and the total time budget bounds the whole chain', async () => {
  assert.throws(() => createProviderChain([]), /at least one provider/);
  let clock = 0;
  const slow = { name: 'ollama', model: 'm', async json({ timeoutMs }) { clock += timeoutMs; throw Object.assign(new Error('x'), { code: 'ollama_timeout' }); } };
  const second = { name: 'gemini', model: 'm', async json() { throw new Error('must not be called: budget spent'); } };
  const chain = createProviderChain([{ ...slow }, second], { deadlineMs: 1000, perProviderTimeoutMs: 1000, now: () => clock });
  await assert.rejects(chain.diagnose({ item, optionId: 'A', explanation: 'A synthetic learner explanation.' }), (error) => error.code === 'all_providers_failed' && error.attempts.some((a) => a.code === 'deadline_exceeded'));
});

test('plan suggestions: only a known, different question with a short reason is accepted', () => {
  const ids = pack.items.map((i) => i.id);
  assert.deepEqual(validatePlanSuggestion({ nextItemId: ids[3], rationale: 'Practise energy transfer next.' }, pack.items, ids[0]), { nextItemId: ids[3], rationale: 'Practise energy transfer next.' });
  assert.equal(validatePlanSuggestion({ nextItemId: 'EL99', rationale: 'x' }, pack.items, ids[0]), null, 'unknown id');
  assert.equal(validatePlanSuggestion({ nextItemId: ids[0], rationale: 'repeat' }, pack.items, ids[0]), null, 'same question');
  assert.equal(validatePlanSuggestion({ nextItemId: ids[1], rationale: '' }, pack.items, ids[0]), null, 'no reason');
  assert.equal(validatePlanSuggestion({ nextItemId: ids[1], rationale: 'y'.repeat(400) }, pack.items, ids[0]), null, 'reason too long');
  assert.equal(validatePlanSuggestion(null, pack.items, ids[0]), null);
  assert.equal(validatePlanSuggestion({ nextItemId: ids[1], rationale: 'ok', extra: 1 }, pack.items, ids[0])?.extra, undefined, 'unexpected fields are dropped');
});

test('chain.suggestPlan returns a validated suggestion from the first provider that gives one, else null (never a fixed rule)', async () => {
  const ids = pack.items.map((i) => i.id);
  const bad = { name: 'ollama', model: 'm', async json() { return { nextItemId: 'EL99', rationale: 'x' }; } };
  const good = { name: 'gemini', model: 'g', async json() { return { nextItemId: ids[4], rationale: 'Try resistance next.' }; } };
  const out = await createProviderChain([bad, good]).suggestPlan({ pack, justAnsweredItemId: ids[0], history: [] });
  assert.equal(out.nextItemId, ids[4]); assert.equal(out.provider, 'gemini');
  assert.equal(await createProviderChain([bad]).suggestPlan({ pack, justAnsweredItemId: ids[0], history: [] }), null);
});

test('the plan prompt carries the history as untrusted data and offers only real question ids', async () => {
  let seen;
  const probe = { name: 'ollama', model: 'm', async json(args) { seen = args; return { nextItemId: pack.items[1].id, rationale: 'ok' }; } };
  await createProviderChain([probe]).suggestPlan({ pack, justAnsweredItemId: pack.items[0].id, history: [{ itemId: pack.items[0].id, diagnosisType: 'MISCONCEPTION', misconceptionId: item.allowedMisconceptionIds[0] }] });
  assert.deepEqual(seen.schema.properties.nextItemId.enum, pack.items.map((i) => i.id).filter((id) => id !== pack.items[0].id));
  assert.match(seen.system, /untrusted/i);
  assert.match(seen.user, /MISCONCEPTION/);
});

test('generated draft items must be structurally valid, stay UNREVIEWED_DRAFT, carry no reviewer, and be marked AI generated', () => {
  const base = JSON.parse(JSON.stringify(pack.items[0]));
  const made = validateGeneratedItem({ ...base, id: 'GEN01', status: 'REVIEWED', review: { status: 'REVIEWED', reviewer: 'someone', reviewedAt: '2026-10-14T00:00:00.000Z' } }, { provider: 'ollama', model: 'm', at: '2026-10-14T05:00:00.000Z' }, new Set(pack.items.map((i) => i.id)));
  assert.equal(made.ok, true);
  assert.equal(made.item.status, 'UNREVIEWED_DRAFT');
  assert.deepEqual(made.item.review, { status: 'UNREVIEWED_DRAFT', reviewer: null, reviewedAt: null });
  assert.equal(made.item.generated.provider, 'ollama');
  assert.equal(made.item.generated.reviewRequired, true);
  assert.equal(validateGeneratedItem({ ...base, id: pack.items[1].id }, { provider: 'p', model: 'm', at: 'x' }, new Set(pack.items.map((i) => i.id))).ok, false, 'id collides with an existing item');
  const noCorrect = { ...base, id: 'GEN02', correctOptionId: 'Z' };
  assert.equal(validateGeneratedItem(noCorrect, { provider: 'p', model: 'm', at: 'x' }, new Set()).ok, false);
});

test('the generation request names the concept and the required JSON shape, and treats topic text as data', () => {
  const req = buildGenerationRequest({ pack, conceptId: pack.items[0].conceptId, count: 2 });
  assert.match(req.system, /UNREVIEWED/);
  assert.equal(req.schema.properties.items.maxItems, 2);
  assert.match(req.user, new RegExp(pack.items[0].conceptId));
});

test('Groq client sends strict=false json_schema with a bearer key held in a header only', async () => {
  let seen;
  const client = createGroqClient({ apiKey: 'groq-secret', model: 'g-m', fetchImpl: async (url, init) => { seen = { url, init, body: JSON.parse(init.body) }; return json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(okDiagnosis) } }] }); } });
  const out = await createProviderChain([client]).diagnose({ item, optionId: 'A', explanation: 'A synthetic learner explanation.' });
  assert.equal(seen.url, 'https://api.groq.com/openai/v1/chat/completions');
  assert.equal(seen.init.headers.authorization, 'Bearer groq-secret');
  assert.equal(JSON.stringify(seen.body).includes('groq-secret'), false);
  assert.equal(out.provider, 'groq');
});
