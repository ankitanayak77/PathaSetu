import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, submitAnswer, recheckQueued, chooseNextItem } from '../src/core/agent.js';
import { loadPack } from '../src/core/content.js';

const pack = loadPack();
const ids = pack.items.map((item) => item.id);
const rightOption = (item) => item.options.find((option) => option.misconceptionId == null).id;
const wrongOption = (item) => item.options.find((option) => option.misconceptionId != null).id;

// One learner step exactly as the online browser does it: submit, then drain the queued re-check immediately.
function step(state, itemId, correct) {
  const item = pack.items.find((candidate) => candidate.id === itemId);
  const submitted = submitAnswer({ state, pack, itemId, optionId: correct ? rightOption(item) : wrongOption(item), explanation: 'Synthetic test explanation.', online: true });
  const afterSubmit = submitted.nextItem.id;
  const queueId = state.queue.at(-1).id;
  const result = recheckQueued({ state, pack, queueId, online: true, provider: 'mock' });
  assert.equal(result.drained, true);
  return { afterSubmit, afterRecheck: state.learner.nextRecommendedItemId };
}

function walk(firstCorrect, restCorrect, steps) {
  const state = initialState(pack);
  let current = ids[0];
  const visited = [];
  for (let i = 0; i < steps; i += 1) {
    visited.push(current);
    const { afterRecheck } = step(state, current, i === 0 ? firstCorrect : restCorrect);
    current = afterRecheck;
  }
  return { state, visited, next: current };
}

test('following the recommendation online visits each of the eight questions once, in order, when every answer is correct', () => {
  const { visited } = walk(true, true, ids.length);
  assert.deepEqual(visited, ids, 'the re-check must not send the learner back to a question that was just answered');
});

test('a wrong first answer still gets its companion question, then the plan moves forward instead of bouncing back', () => {
  const { visited } = walk(false, true, 3);
  assert.deepEqual(visited.slice(0, 2), [ids[0], ids[1]], 'the companion question in the same concept is still recommended after the first wrong answer');
  assert.notEqual(visited[2], ids[0], 'after the companion question the plan must not return to the first question');
  assert.equal(visited[2], ids[2]);
});

test('the re-check recommendation never goes back to a question the learner has already answered while unanswered ones exist', () => {
  const state = initialState(pack);
  let current = ids[0];
  const answered = new Set();
  for (let i = 0; i < ids.length - 1; i += 1) {
    answered.add(current);
    const { afterRecheck } = step(state, current, i % 2 === 0);
    assert.ok(!answered.has(afterRecheck), `step ${i + 1}: ${afterRecheck} was recommended again after being answered`);
    current = afterRecheck;
  }
});

test('the concept bonus still prefers an unanswered question of the focused concept (existing behaviour kept)', () => {
  const state = initialState(pack);
  assert.equal(chooseNextItem(state, pack, ids[0], pack.items[0].conceptId).id, ids[1]);
});

test('when every question has been answered a recommendation still exists and is not the question just answered', () => {
  const state = initialState(pack);
  for (const id of ids) step(state, id, true);
  const item = pack.items.find((candidate) => candidate.id === ids[2]);
  const next = chooseNextItem(state, pack, item.id, item.conceptId);
  assert.ok(next);
  assert.notEqual(next.id, item.id);
});
