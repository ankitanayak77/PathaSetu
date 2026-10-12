import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, submitAnswer, recheckQueued, chooseNextItem } from '../src/core/agent.js';
import { loadPack } from '../src/core/content.js';
const pack = loadPack();

function answerOffline(itemId = 'EL01', optionId = 'A', explanation = 'The current keeps building up in the wire.') {
  const state = initialState(pack);
  const result = submitAnswer({ state, pack, itemId, optionId, explanation, online: false, now: '2026-10-12T15:00:00.000Z' });
  return { ...result, state };
}

test('initial state records why the first question was selected', () => {
  const state = initialState(pack);
  assert.equal(state.trace[0].type, 'plan_selected');
  assert.equal(state.trace[0].itemId, pack.items[0].id);
  assert.match(state.trace[0].reason, /no learner history/i);
});

test('offline submission persists a provisional proposal and queues a re-check', () => {
  const { state, answer } = answerOffline();
  assert.equal(answer.diagnosis.provisional, true);
  assert.equal(state.trace.find((event) => event.type === 'answer_submitted').provisional, true);
  assert.equal(state.queue.length, 1);
  assert.deepEqual(state.learner.confirmedMisconceptions, {});
  assert.equal(state.learner.currentItemId, 'EL01', 'keep the answered question visible for feedback and remediation');
  assert.equal(state.learner.nextRecommendedItemId, 'EL02', 'store the next item as an explicit recommendation');
});

test('uncertain/empty explanation never confirms a misconception', () => {
  const { state, answer } = answerOffline('EL01', 'A', '');
  assert.equal(answer.diagnosis.type, 'UNCERTAIN');
  assert.deepEqual(state.learner.confirmedMisconceptions, {});
});

test('answer cannot be submitted for a missing question or invalid option', () => {
  const state = initialState(pack);
  assert.throws(() => submitAnswer({ state, pack, itemId: 'gone', optionId: 'A', explanation: 'long enough', online: true }), /question_not_found/);
  assert.throws(() => submitAnswer({ state, pack, itemId: 'EL01', optionId: 'Z', explanation: 'long enough', online: true }), /option_not_found/);
});

test('recheck with an invalid diagnosis is rejected and leaves the queue pending', () => {
  const { state } = answerOffline();
  const queueId = state.queue[0].id;
  const answer = state.answers[0];
  const result = recheckQueued({ state, pack, queueId, online: true, diagnosisOverride: { questionId: answer.itemId, type: 'MISCONCEPTION', misconceptionId: 'WRONG_ID', confidence: 0.9, rationale: 'bad' } });
  assert.equal(result.drained, false);
  assert.equal(state.queue.length, 1);
  assert.deepEqual(state.learner.confirmedMisconceptions, {});
});

test('mock re-check drains the queue but remains provisional and preserves current question', () => {
  const { state } = answerOffline();
  const queueId = state.queue[0].id;
  const currentBefore = state.learner.currentItemId;
  const result = recheckQueued({ state, pack, queueId, online: true });
  assert.equal(result.drained, true);
  assert.equal(state.queue.length, 0);
  assert.equal(state.learner.currentItemId, currentBefore);
  assert.equal(state.answers[0].diagnosis.provisional, true);
  assert.deepEqual(state.learner.confirmedMisconceptions, {});
  assert.ok(state.learner.nextRecommendedItemId);
});

test('trusted changed diagnosis updates confirmed state without double-counting the prior proposal', () => {
  const { state } = answerOffline();
  const queueId = state.queue[0].id;
  const answer = state.answers[0];
  const previousId = answer.diagnosis.misconceptionId;
  const id = pack.items[0].allowedMisconceptionIds[1];
  recheckQueued({ state, pack, queueId, online: true, trusted: true, diagnosisOverride: { questionId: answer.itemId, type: 'MISCONCEPTION', misconceptionId: id, confidence: 0.9, rationale: 'synthetic trusted test' } });
  assert.equal(state.learner.confirmedMisconceptions[id], 1);
  assert.equal(state.learner.confirmedMisconceptions[previousId], undefined);
});

test('planner prefers an alternative item for a follow-up within the same concept', () => {
  const state = initialState(pack);
  assert.equal(chooseNextItem(state, pack, 'EL01', 'closed_circuit').id, 'EL02');
});

test('queue capacity rejects another answer without partially changing learner state', () => {
  const state = initialState(pack);
  state.queue = Array.from({ length: 100 }, (_, index) => ({ id: `q-${index}`, answerId: `a-${index}`, itemId: 'EL01', attempts: 0 }));
  const before = structuredClone(state);
  assert.throws(() => submitAnswer({ state, pack, itemId: 'EL01', optionId: 'A', explanation: 'Synthetic queue capacity test.', online: false }), /recheck_queue_full/);
  assert.deepEqual(state, before);
});

test('deferred provider failures increment attempts and append a durable diagnostic trace', async () => {
  const { recordRecheckDeferred } = await import('../src/core/agent.js');
  const { state } = answerOffline();
  const queueId = state.queue[0].id;
  const result = recordRecheckDeferred({ state, queueId, reason: 'recheck_http_503', now: '2026-10-12T17:00:00.000Z' });
  assert.equal(result.recorded, true);
  assert.equal(state.queue[0].attempts, 1);
  assert.equal(state.queue[0].lastAttemptAt, '2026-10-12T17:00:00.000Z');
  assert.equal(state.trace.at(-1).type, 'recheck_deferred');
  assert.match(state.trace.at(-1).details, /503/);
});
