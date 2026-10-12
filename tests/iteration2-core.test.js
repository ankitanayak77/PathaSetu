import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, submitAnswer, recheckQueued, recordRecheckDeferred, reconcileState } from '../src/core/agent.js';
import { loadPack } from '../src/core/content.js';
const pack = loadPack();
const NOW = '2026-10-12T20:00:00.000Z';

test('a second submit for an already-answered question that has not been continued is rejected (double tap)', () => {
  const state = initialState(pack);
  submitAnswer({ state, pack, itemId: 'EL01', optionId: 'A', explanation: 'The current keeps building up.', online: false, now: NOW });
  assert.throws(() => submitAnswer({ state, pack, itemId: 'EL01', optionId: 'A', explanation: 'The current keeps building up.', online: false, now: NOW }), /already_answered_awaiting_continue/);
  assert.equal(state.answers.length, 1);
  assert.equal(state.queue.length, 1);
  assert.equal(state.learner.sessionsRemaining, 9);
});

test('after the learner continues, the same question can legitimately be answered again later', () => {
  const state = initialState(pack);
  submitAnswer({ state, pack, itemId: 'EL01', optionId: 'A', explanation: 'First attempt explanation.', online: false, now: NOW });
  state.learner.currentItemId = 'EL02'; state.learner.nextRecommendedItemId = null;   // the learner applied the recommendation
  submitAnswer({ state, pack, itemId: 'EL02', optionId: 'A', explanation: 'Second question explanation.', online: false, now: NOW });
  state.learner.currentItemId = 'EL01'; state.learner.nextRecommendedItemId = null;   // a re-check brought EL01 back and the learner applied it
  assert.doesNotThrow(() => submitAnswer({ state, pack, itemId: 'EL01', optionId: 'B', explanation: 'Second attempt explanation.', online: false, now: NOW }));
  assert.equal(state.answers.length, 3);
});

test('reconcileState replaces a missing current item and clears a recommendation that points at a missing item', () => {
  const state = initialState(pack);
  state.learner.currentItemId = 'EL99';
  state.learner.nextRecommendedItemId = 'EL98';
  assert.equal(reconcileState(state, pack), true);
  assert.ok(pack.items.some((item) => item.id === state.learner.currentItemId));
  assert.equal(state.learner.nextRecommendedItemId, null);
  const types = state.trace.map((event) => event.type);
  assert.ok(types.includes('content_mismatch_recovered') && types.includes('recommendation_cleared'));
});

test('reconcileState leaves a consistent state untouched and adds no trace', () => {
  const state = initialState(pack);
  state.learner.nextRecommendedItemId = 'EL02';
  const before = JSON.stringify(state);
  assert.equal(reconcileState(state, pack), false);
  assert.equal(JSON.stringify(state), before);
});

test('50 repeated provider failures count 50 attempts but occupy one trace line', () => {
  const state = initialState(pack);
  submitAnswer({ state, pack, itemId: 'EL01', optionId: 'A', explanation: 'An answer waiting for a re-check.', online: false, now: NOW });
  const queueId = state.queue[0].id;
  const traceBefore = state.trace.length;
  for (let i = 0; i < 50; i++) recordRecheckDeferred({ state, queueId, reason: 'recheck_http_500', now: NOW });
  assert.equal(state.queue[0].attempts, 50);
  assert.equal(state.trace.length, traceBefore + 1);
  const line = state.trace.at(-1);
  assert.equal(line.type, 'recheck_deferred');
  assert.equal(line.attempts, 50);
  assert.equal(line.repeats, 50);
});

test('a different event in between starts a new failure line instead of rewriting history', () => {
  const state = initialState(pack);
  submitAnswer({ state, pack, itemId: 'EL01', optionId: 'A', explanation: 'An answer waiting for a re-check.', online: false, now: NOW });
  const queueId = state.queue[0].id;
  recordRecheckDeferred({ state, queueId, now: NOW });
  state.trace.push({ id: 'x', at: NOW, type: 'learner_applied_updated_plan' });
  recordRecheckDeferred({ state, queueId, now: NOW });
  assert.equal(state.trace.filter((event) => event.type === 'recheck_deferred').length, 2);
});

test('repeated invalid diagnoses for one queue entry are coalesced and keep the entry retryable', () => {
  const state = initialState(pack);
  submitAnswer({ state, pack, itemId: 'EL01', optionId: 'A', explanation: 'An answer waiting for a re-check.', online: false, now: NOW });
  const queueId = state.queue[0].id;
  const bad = { questionId: 'WRONG', type: 'MISCONCEPTION', misconceptionId: 'NOT_ALLOWED', confidence: 0.9, rationale: 'x' };
  for (let i = 0; i < 5; i++) recheckQueued({ state, pack, queueId, online: true, diagnosisOverride: bad });
  assert.equal(state.queue.length, 1);
  assert.equal(state.queue[0].attempts, 5);
  assert.equal(state.trace.filter((event) => event.type === 'recheck_rejected').length, 1);
  const good = recheckQueued({ state, pack, queueId, online: true });
  assert.equal(good.drained, true);
  assert.equal(state.queue.length, 0);
});
