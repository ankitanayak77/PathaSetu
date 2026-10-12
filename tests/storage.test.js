import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryStorage, createIndexedDbStorage } from '../src/core/storage.js';

test('memory storage returns copies and can clear state', async () => {
  const store = createMemoryStorage();
  const record = { a: 1, nested: { b: 2 } };
  await store.save(record);
  record.nested.b = 99;
  const loaded = await store.load();
  assert.equal(loaded.nested.b, 2);
  loaded.nested.b = 44;
  assert.equal((await store.load()).nested.b, 2);
  await store.clear();
  assert.equal(await store.load(), null);
});

test('IndexedDB failures downgrade visibly to memory storage without throwing', async () => {
  const brokenIndexedDB = { open() { throw new Error('blocked_by_policy'); } };
  const store = createIndexedDbStorage(brokenIndexedDB);
  assert.equal(await store.load(), null);
  assert.equal(store.persistent, false);
  await store.save({ progress: 3 });
  assert.deepEqual(await store.load(), { progress: 3 });
  assert.equal(store.mode, 'memory');
});
