import test from 'node:test';
import assert from 'node:assert/strict';
import { repairSavedRecord } from '../src/core/recovery.js';
import { initialState } from '../src/core/agent.js';
import { loadPack } from '../src/core/content.js';

const pack = loadPack();

// Found by the seeded fuzz in Iteration 15: a saved record with a MISSING answers/queue/trace array was returned untouched
// and "no repairs", so the app would later call .find()/.filter() on undefined. Missing is damage, not a valid empty value.
for (const key of ['answers', 'queue', 'trace']) {
  test(`a saved state with the ${key} array missing is repaired to an empty array and the repair is reported`, () => {
    const state = initialState(pack);
    delete state[key];
    const out = repairSavedRecord({ state, drafts: {} }, pack);
    assert.ok(Array.isArray(out.state[key]), `${key} must be an array after repair`);
    assert.ok(out.repairs.includes(`${key}_reset`));
    const again = repairSavedRecord({ state: out.state, drafts: out.drafts }, pack);
    assert.deepEqual(again.repairs, [], 'a second repair changes nothing');
  });
}
