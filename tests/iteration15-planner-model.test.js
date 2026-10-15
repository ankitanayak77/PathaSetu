import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, submitAnswer, recheckQueued } from '../src/core/agent.js';
import { loadPack } from '../src/core/content.js';

const pack = loadPack();
const ids = pack.items.map((item) => item.id);
const wrongOption = (item) => item.options.find((option) => option.misconceptionId != null).id;

function answered(online = true) {
  const state = initialState(pack);
  const item = pack.items[0];
  submitAnswer({ state, pack, itemId: item.id, optionId: wrongOption(item), explanation: 'Synthetic test explanation.', online });
  return { state, queueId: state.queue.at(-1).id, item };
}
const last = (state, type) => [...state.trace].reverse().find((entry) => entry.type === type);

test('a valid model plan becomes the recommendation and is labelled as model-chosen with its provider, model and reason', () => {
  const { state, queueId } = answered();
  const result = recheckQueued({ state, pack, queueId, online: true, provider: 'ollama', planOverride: { nextItemId: ids[5], rationale: 'Resistance is the weakest area so far.', provider: 'ollama', model: 'm1' } });
  assert.equal(result.drained, true);
  assert.equal(state.learner.nextRecommendedItemId, ids[5]);
  assert.deepEqual(state.learner.nextPlan, { forItemId: ids[5], source: 'model', provider: 'ollama', model: 'm1', rationale: 'Resistance is the weakest area so far.' });
  assert.equal(last(state, 'recheck_complete').planSource, 'model');
});

test('an invalid, unknown, repeated or missing model plan falls back to the labelled deterministic planner, never to a silent choice', () => {
  for (const planOverride of [{ nextItemId: 'EL99', rationale: 'x' }, { nextItemId: ids[0], rationale: 'same question' }, { nextItemId: ids[2], rationale: '' }, { nextItemId: ids[2], rationale: 7 }, null, undefined]) {
    const { state, queueId } = answered();
    recheckQueued({ state, pack, queueId, online: true, provider: 'groq', planOverride });
    assert.ok(ids.includes(state.learner.nextRecommendedItemId));
    assert.equal(state.learner.nextPlan.source, 'deterministic_fallback', JSON.stringify(planOverride));
    assert.equal(state.learner.nextPlan.forItemId, state.learner.nextRecommendedItemId);
    assert.equal(last(state, 'recheck_complete').planSource, 'deterministic_fallback');
  }
});

test('the offline/local path (no provider answer) records the deterministic local source', () => {
  const { state, queueId } = answered();
  recheckQueued({ state, pack, queueId, online: true });
  assert.equal(state.learner.nextPlan.source, 'deterministic_local');
});

test('submitAnswer records which planner produced the first recommendation', () => {
  const { state } = answered();
  assert.equal(state.learner.nextPlan.source, 'deterministic_local');
  assert.equal(state.learner.nextPlan.forItemId, state.learner.nextRecommendedItemId);
});

test('a long rationale is clipped, markup is kept as plain text, and a non-string provider or model is dropped', () => {
  const { state, queueId } = answered();
  recheckQueued({ state, pack, queueId, online: true, provider: 'gemini', planOverride: { nextItemId: ids[3], rationale: `<b>${'r'.repeat(250)}</b>`, provider: { evil: 1 }, model: 12 } });
  assert.equal(state.learner.nextPlan.source, 'model');
  assert.ok(state.learner.nextPlan.rationale.length <= 300);
  assert.equal(state.learner.nextPlan.provider, 'gemini', 'falls back to the answering provider name');
  assert.equal(state.learner.nextPlan.model, null);
});

test('a model plan never changes the current question and never touches confirmed mastery', () => {
  const { state, queueId, item } = answered();
  const before = JSON.stringify(state.learner.confirmedMisconceptions);
  recheckQueued({ state, pack, queueId, online: true, provider: 'ollama', trusted: false, planOverride: { nextItemId: ids[6], rationale: 'Try this next.', provider: 'ollama', model: 'm' } });
  assert.equal(state.learner.currentItemId, item.id);
  assert.equal(JSON.stringify(state.learner.confirmedMisconceptions), before);
});
