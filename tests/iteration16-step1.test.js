// Iteration 16, step 1: the learner is never left locked without a visible way forward, sees the answer key and its explanation,
// gets honest wording for every provider, and a low-confidence model result becomes "not sure" instead of a retried failure.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDiagnosis } from '../src/core/validator.js';
import { proposeDiagnosis } from '../src/core/mockModel.js';
import { loadPack } from '../src/core/content.js';
import { initialState, submitAnswer, recheckQueued } from '../src/core/agent.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const pack = loadPack();
const item = pack.items[0];

test('a confident-enough misconception is accepted unchanged', () => {
  const r = validateDiagnosis({ questionId: item.id, type: 'MISCONCEPTION', misconceptionId: item.allowedMisconceptionIds[0], confidence: 0.65, rationale: 'x' }, item);
  assert.equal(r.ok, true);
  assert.equal(r.value.type, 'MISCONCEPTION');
});

test('a low-confidence misconception or NONE becomes UNCERTAIN (not a rejection), keeps its confidence and says why', () => {
  for (const type of ['MISCONCEPTION', 'NONE']) {
    const raw = { questionId: item.id, type, misconceptionId: type === 'MISCONCEPTION' ? item.allowedMisconceptionIds[0] : null, confidence: 0.4, rationale: 'Maybe.' };
    const r = validateDiagnosis(raw, item);
    assert.equal(r.ok, true, type);
    assert.equal(r.value.type, 'UNCERTAIN');
    assert.equal(r.value.misconceptionId, null);
    assert.equal(r.value.confidence, 0.4);
    assert.match(r.value.rationale, /Not confident enough/);
    assert.ok(r.value.rationale.length <= 500);
    assert.ok(Object.isFrozen(r.value));
  }
});

test('a misconception the question does not allow is still rejected, whatever the confidence', () => {
  assert.equal(validateDiagnosis({ questionId: item.id, type: 'MISCONCEPTION', misconceptionId: 'NOT_ALLOWED', confidence: 0.2, rationale: 'x' }, item).reason, 'misconception_not_allowed');
});

test('a low-confidence model re-check drains the queue as "not sure" instead of counting a failed attempt', () => {
  const state = initialState(pack);
  submitAnswer({ state, pack, itemId: item.id, optionId: 'A', explanation: 'The current keeps building up.', online: true });
  const queueId = state.queue[0].id;
  const r = recheckQueued({ state, pack, queueId, online: true, diagnosisOverride: { questionId: item.id, type: 'MISCONCEPTION', misconceptionId: item.allowedMisconceptionIds[0], confidence: 0.3, rationale: 'Unsure.' }, provider: 'gemini' });
  assert.equal(r.drained, true);
  assert.equal(state.queue.length, 0);
  assert.equal(state.answers[0].diagnosis.type, 'UNCERTAIN');
  assert.equal(state.answers[0].mode, 'RECHECKED_GEMINI');
});

test('the mock never asks for more reasoning after the form is locked', () => {
  const p = proposeDiagnosis({ item, optionId: item.correctOptionId, explanation: '' });
  assert.equal(p.type, 'UNCERTAIN');
  assert.doesNotMatch(p.rationale, /Please add/);
  assert.match(p.rationale, /Next time/);
});

test('the result card shows the answer key, its option text, the Odia and English explanation, and a Continue button inside the card', () => {
  const app = read('public/app.js');
  assert.match(app, /item\.correctOptionId/);
  assert.match(app, /explanationOdiaDraft/);
  assert.match(app, /item\.explanation\b/);
  assert.match(app, /data-action="continue"/);
  assert.match(app, /Matches the answer key/);
  assert.match(app, /Not the answer-key choice/);
});

test('a fixed Continue bar appears while an answered question waits, so the next step is always within reach', () => {
  const html = read('public/index.html');
  const css = read('public/styles.css');
  const app = read('public/app.js');
  assert.match(html, /id="continue-bar"/);
  assert.match(html, /id="continue-bar-button"/);
  assert.match(css, /\.continue-bar\{[^}]*position:fixed/);
  assert.match(app, /continue-bar/);
  assert.match(app, /function applyPlan\(/);
});

test('model wording for every model re-check, demo-rule wording for the mock and for local results', async () => {
  const { provenanceText, isModelRecheck, matchesKey } = await import('../src/core/labels.js');
  for (const mode of ['RECHECKED_GEMINI', 'RECHECKED_GROQ', 'RECHECKED_OLLAMA']) { assert.equal(isModelRecheck(mode), true, mode); assert.match(provenanceText(mode), /model proposal remains provisional/); }
  for (const mode of ['RECHECKED_MOCK', 'LOCAL_PROPOSAL_PENDING_RECHECK', 'OFFLINE_RULE', undefined]) { assert.equal(isModelRecheck(mode), false, String(mode)); assert.match(provenanceText(mode), /deterministic demo rule/); }
  assert.equal(matchesKey(item, item.correctOptionId), true);
  assert.equal(matchesKey(item, 'A' === item.correctOptionId ? 'B' : 'A'), false);
  const app = read('public/app.js');
  assert.doesNotMatch(app, /mode\.includes\('GROQ'\)/);
  assert.match(app, /provenanceText\(prior\.mode\)/);
  assert.match(read('public/sw.js'), /'\/core\/labels\.js'/);
});

test('the browser labels a planner fallback only when the server says it tried a model plan', () => {
  const app = read('public/app.js');
  const server = read('src/server/server.js');
  assert.match(server, /planAttempted: MODEL\.planning/);
  assert.match(server, /planAttempted: false/);
  assert.match(app, /data\.planAttempted === true \? \{ planOverride: data\.plan \?\? null \} : \{\}/);
  assert.doesNotMatch(app, /The deterministic planner selected \$\{item\.id\}/);
});

test('the service worker fetches fresh files when online (network first, cache fallback) under a new cache name', () => {
  const sw = read('public/sw.js');
  assert.match(sw, /pathasetu-shell-v12/);
  assert.doesNotMatch(sw, /pathasetu-shell-v10'/);
  assert.match(sw, /function networkFirst\(/);
  assert.doesNotMatch(sw, /caches\.match\(request\)\.then\(\(cached\) => \{\s*if \(cached\) return cached;/);
});

test('a Reset demo button clears this device and reloads, after a confirmation', () => {
  const html = read('public/index.html');
  const app = read('public/app.js');
  assert.match(html, /id="reset-demo"/);
  assert.match(app, /async function resetDemo\(/);
  assert.match(app, /indexedDB\.deleteDatabase\('pathasetu-local-v1'\)/);
  assert.match(app, /confirm\(/);
  assert.match(app, /getRegistrations\(\)/);
});
