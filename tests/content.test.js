import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPack, validateItem, selectPublishedItems } from '../src/core/content.js';

const pack = loadPack();

test('the Electricity pack is structurally valid and every option mapping is allowlisted', () => {
  assert.equal(pack.items.length, 8);
  for (const item of pack.items) assert.deepEqual(validateItem(item), [], item.id);
});

test('bilingual draft fields are populated but clearly remain unreviewed', () => {
  assert.equal(pack.languageBridge.status, 'UNREVIEWED_DRAFT');
  for (const item of pack.items) {
    assert.equal(item.status, 'UNREVIEWED_DRAFT');
    assert.ok(item.promptOdiaDraft && !item.promptOdiaDraft.includes('[Odia wording'), `${item.id} prompt draft`);
    assert.ok(item.explanationOdiaDraft && !item.explanationOdiaDraft.includes('[Odia explanation'), `${item.id} explanation draft`);
    assert.equal(item.bridge.status, 'UNREVIEWED_DRAFT');
    assert.ok(item.bridge.everydayOdia && item.bridge.schoolOdiaTerm && item.bridge.englishTerm);
    assert.ok(item.options.every((option) => option.textOdiaDraft && !option.textOdiaDraft.includes('[Odia option')));
  }
});

test('draft content cannot enter the published release set', () => {
  assert.equal(selectPublishedItems(pack).length, 0);
  const approved = structuredClone(pack);
  approved.languageBridge.status = 'REVIEWED';
  approved.items[0].status = 'PUBLISHED';
  approved.items[0].review.status = 'PUBLISHED';
  approved.items[0].bridge.status = 'PUBLISHED';
  assert.deepEqual(selectPublishedItems(approved).map((item) => item.id), ['EL01']);
});

test('invalid content whose option maps to a non-allowlisted misconception is rejected', () => {
  const errors = validateItem({ id: 'x', conceptId: 'c', status: 'UNREVIEWED_DRAFT', allowedMisconceptionIds: ['A'], correctOptionId: 'A', options: [{ id: 'A', text: 'a', misconceptionId: 'B' }, { id: 'B', text: 'b', misconceptionId: null }] });
  assert.ok(errors.some((error) => error.includes('unallowed misconception')));
});

test('content pack rejects an incorrect option without an allowed misconception mapping', async () => {
  const { validateItem } = await import('../src/core/content.js');
  const item = structuredClone(loadPack().items[0]);
  item.options.find((option) => option.id !== item.correctOptionId).misconceptionId = null;
  assert.ok(validateItem(item).some((error) => /incorrect option .* must map to a misconception/.test(error)));
});

test('content pack rejects a correct option mapped to a misconception', async () => {
  const { validateItem } = await import('../src/core/content.js');
  const item = structuredClone(loadPack().items[0]);
  item.options.find((option) => option.id === item.correctOptionId).misconceptionId = item.allowedMisconceptionIds[0];
  assert.ok(validateItem(item).some((error) => /correct option .* must not map to a misconception/.test(error)));
});

test('content pack rejects an allowlisted misconception that no incorrect option can produce', async () => {
  const { validateItem } = await import('../src/core/content.js');
  const item = structuredClone(loadPack().items[0]);
  item.allowedMisconceptionIds.push('UNUSED_MISCONCEPTION');
  assert.ok(validateItem(item).some((error) => /not mapped by an incorrect option/.test(error)));
});

test('reviewed and published content requires reviewer identity and a valid review timestamp', async () => {
  const { validateItem } = await import('../src/core/content.js');
  const item = structuredClone(loadPack().items[0]);
  item.status = 'PUBLISHED';
  item.review = { status: 'PUBLISHED', reviewer: '', reviewedAt: 'not-a-date' };
  assert.ok(validateItem(item).some((error) => /reviewer is required/.test(error)));
  assert.ok(validateItem(item).some((error) => /valid reviewedAt timestamp is required/.test(error)));
});

test('the pack contains two draft questions for each of four Electricity concepts', () => {
  const counts = new Map();
  for (const item of pack.items) counts.set(item.conceptId, (counts.get(item.conceptId) ?? 0) + 1);
  assert.equal(counts.size, 4);
  for (const [conceptId, count] of counts) assert.equal(count, 2, `${conceptId} should have exactly two question drafts`);
});
