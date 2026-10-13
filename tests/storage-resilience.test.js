// Storage durability and integrity: IndexedDB failure, write rejection, corrupt saved state, queue recovery, export hygiene.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createIndexedDbStorage, createMemoryStorage } from '../src/core/storage.js';
import { repairSavedRecord, LIMITS } from '../src/core/recovery.js';
import { buildTraceExport, redactSecrets } from '../src/core/export.js';
import { PERSISTENCE, checkPersistence, createPersistenceRequester, describePersistence } from '../src/core/persistence.js';
import { initialState, submitAnswer, recheckQueued, reconcileState } from '../src/core/agent.js';
import { loadPack } from '../src/core/content.js';

const pack = loadPack();
const NOW = '2026-10-12T20:00:00.000Z';
const answered = () => {
  const state = initialState(pack);
  submitAnswer({ state, pack, itemId: 'EL01', optionId: 'A', explanation: 'A synthetic explanation waiting for a re-check.', online: false, now: NOW });
  return state;
};

// A small fake IndexedDB: enough of the API for storage.js, with switchable failures.
function fakeIndexedDB({ failOpen = false, failWritesAfter = Infinity } = {}) {
  const data = new Map();
  let writes = 0;
  const db = {
    objectStoreNames: { contains: () => true },
    transaction() {
      const tx = {};
      tx.objectStore = () => ({
        get(key) { const request = {}; setTimeout(() => { request.result = data.get(key); request.onsuccess?.(); }); return request; },
        put(value, key) { writes += 1; if (writes > failWritesAfter) throw new DOMException('quota exceeded, secret learner text must not leak', 'QuotaExceededError'); data.set(key, structuredClone(value)); queueMicrotask(() => tx.oncomplete?.()); },
        delete(key) { data.delete(key); queueMicrotask(() => tx.oncomplete?.()); }
      });
      return tx;
    }
  };
  return { data, open() { const request = {}; setTimeout(() => { if (failOpen) { request.error = new DOMException('blocked', 'SecurityError'); request.onerror?.(); } else { request.result = db; request.onsuccess?.(); } }); return request; } };
}

test('IndexedDB open failure: the app learns it is memory-only, with a safe reason, and keeps working in memory', async () => {
  const store = createIndexedDbStorage(fakeIndexedDB({ failOpen: true }));
  assert.equal(await store.load(), null);
  assert.deepEqual({ mode: store.status.mode, persistent: store.status.persistent, lastError: store.status.lastError, lastSavedAt: store.status.lastSavedAt }, { mode: 'memory', persistent: false, lastError: 'SecurityError', lastSavedAt: null });
  await store.save({ n: 1 });
  assert.deepEqual(await store.load(), { n: 1 });
});

test('no IndexedDB at all reports memory-only with a reason', () => {
  const status = createIndexedDbStorage(null).status;
  assert.equal(status.persistent, false);
  assert.equal(status.lastError, 'indexeddb_unavailable');
});

test('a rejected write downgrades visibly: durable saved time stops, reason is the error name only, latest data stays in memory', async () => {
  const idb = fakeIndexedDB({ failWritesAfter: 1 });
  const store = createIndexedDbStorage(idb);
  await store.save({ n: 1 });
  assert.equal(store.status.persistent, true);
  assert.ok(store.status.lastSavedAt);
  await store.save({ n: 2 });
  assert.equal(store.status.persistent, false);
  assert.equal(store.status.lastError, 'QuotaExceededError');
  assert.ok(!JSON.stringify(store.status).includes('secret learner text'), 'the error message must not be kept');
  assert.deepEqual(await store.load(), { n: 2 }, 'the newest data is still available in memory');
  assert.deepEqual(idb.data.get('session'), { n: 1 }, 'the older durable record is left untouched');
});

test('quarantine keeps an unreadable record under a separate key without touching the main record', async () => {
  const idb = fakeIndexedDB();
  const store = createIndexedDbStorage(idb);
  await store.save({ good: true });
  await store.quarantine({ weird: 'record' });
  assert.deepEqual(idb.data.get('session'), { good: true });
  assert.deepEqual(idb.data.get('session-unreadable-backup'), { weird: 'record' });
  const memory = createMemoryStorage();
  await memory.quarantine({ weird: 1 });
  assert.deepEqual(await memory.loadQuarantine(), { weird: 1 });
});

const CORRUPT = {
  'null record': null,
  'string record': 'garbage',
  'number record': 42,
  'array record': [],
  'state is a string': { state: 'oops', drafts: {} },
  'state is an array': { state: [], drafts: {} },
  'state is null': { state: null },
  'empty object': {}
};
for (const [label, record] of Object.entries(CORRUPT)) {
  test(`corrupt record (${label}) never throws: a fresh state is started and the record is flagged unreadable`, () => {
    const result = repairSavedRecord(record, pack);
    assert.equal(result.discarded, true);
    assert.deepEqual(result.repairs, ['record_unreadable']);
    assert.equal(result.state.answers.length, 0);
    assert.equal(result.state.learner.sessionsRemaining, 10);
    assert.equal(result.state.trace.at(-1).type, 'saved_state_repaired');
    assert.doesNotThrow(() => reconcileState(result.state, pack));
  });
}

test('a valid record passes through untouched with no repairs', () => {
  const state = answered();
  const record = { pack, state, drafts: { EL02: { optionId: 'B', explanation: 'unsent draft' } }, savedAt: NOW };
  const result = repairSavedRecord(record, pack);
  assert.deepEqual(result.repairs, []);
  assert.equal(result.discarded, false);
  assert.deepEqual(result.state, state);
  assert.deepEqual(result.drafts, record.drafts);
});

test('partial corruption keeps every usable answer, queue entry, draft and counter and removes only the broken ones', () => {
  const state = answered();
  const goodAnswer = state.answers[0];
  const goodQueue = state.queue[0];
  const broken = {
    ...state,
    learner: { ...state.learner, sessionsRemaining: 'many', confirmedMisconceptions: { OK: 2, BAD: 'x', '': 3 }, seenItemIds: ['EL01', 7, null] },
    answers: [goodAnswer, null, 'x', { id: 'a2' }, { ...goodAnswer, id: 'a3', diagnosis: { type: 'MADE_UP', questionId: 'EL01' } }, { ...goodAnswer }],
    queue: [goodQueue, { id: 'q-bad' }, 5, { ...goodQueue, id: 'q2', attempts: -3, nextAttemptAt: 'not a date', needsAttention: 'yes' }, { ...goodQueue }],
    trace: [...state.trace, null, { nope: true }, { type: 'x'.repeat(200) }]
  };
  const result = repairSavedRecord({ state: broken, drafts: { EL02: { optionId: 'B', explanation: 'ok' }, EL03: 'bad', '': { optionId: 'A', explanation: 'x' } } }, pack);
  assert.equal(result.discarded, false);
  assert.ok(result.repairs.length > 0);
  const repaired = result.state;
  assert.equal(repaired.learner.sessionsRemaining, 10);
  assert.deepEqual(repaired.learner.confirmedMisconceptions, { OK: 2 });
  assert.deepEqual(repaired.learner.seenItemIds, ['EL01']);
  assert.deepEqual(repaired.answers.map((a) => a.id), [goodAnswer.id], 'invalid and duplicate answers removed, the valid one kept');
  assert.deepEqual(repaired.queue.map((q) => q.id), [goodQueue.id, 'q2']);
  const q2 = repaired.queue.find((q) => q.id === 'q2');
  assert.equal(q2.attempts, 0);
  assert.equal(q2.nextAttemptAt, null);
  assert.equal(q2.needsAttention, false);
  assert.deepEqual(Object.keys(result.drafts), ['EL02']);
  assert.equal(repaired.trace.at(-1).type, 'saved_state_repaired');
  assert.ok(!JSON.stringify(repaired.trace.at(-1)).includes('explanation'), 'the repair note carries counts, never content');
});

test('queue recovery: a repaired queue entry is still processed once, with one answer and no extra session', () => {
  const state = answered();
  const mangled = { ...state, queue: [{ ...state.queue[0], attempts: 'lots', nextAttemptAt: 12345 }], trace: 'gone' };
  const { state: repaired, repairs } = repairSavedRecord({ state: mangled }, pack);
  assert.ok(repairs.includes('trace_reset'));
  assert.equal(repaired.queue.length, 1);
  const sessions = repaired.learner.sessionsRemaining;
  const result = recheckQueued({ state: repaired, pack, queueId: repaired.queue[0].id, online: true });
  assert.equal(result.drained, true);
  assert.equal(repaired.queue.length, 0);
  assert.equal(repaired.answers.length, 1);
  assert.equal(repaired.learner.sessionsRemaining, sessions);
});

test('oversized collections are capped instead of growing without bound', () => {
  const state = answered();
  const trace = Array.from({ length: 500 }, (_, i) => ({ id: `e${i}`, at: NOW, type: 'noise' }));
  const result = repairSavedRecord({ state: { ...state, trace } }, pack);
  assert.ok(result.repairs.includes('trace_trimmed'));
  assert.ok(result.state.trace.length <= LIMITS.trace + 1, `trace has ${result.state.trace.length} lines`);
});

test('a stale content reference in an otherwise valid record is handled by reconcileState without a crash', () => {
  const state = answered();
  state.learner.currentItemId = 'EL99';
  state.learner.nextRecommendedItemId = 'EL98';
  const result = repairSavedRecord({ state }, pack);
  assert.deepEqual(result.repairs, []);
  assert.equal(reconcileState(result.state, pack), true);
  assert.ok(pack.items.some((item) => item.id === result.state.learner.currentItemId));
});

test('repair never throws on hostile input shapes', () => {
  const hostile = [{ state: { learner: { get sessionsRemaining() { throw new Error('boom'); } } } }, { state: { answers: new Proxy([], { get() { throw new Error('boom'); } }) } }, { state: { queue: [{ get id() { throw new Error('boom'); } }] } }];
  for (const record of hostile) assert.doesNotThrow(() => repairSavedRecord(record, pack));
});

test('the export omits typed explanations and drafts, keeps decisions and traces, and carries storage and persistence facts', () => {
  const state = answered();
  state.answers[0].explanation = 'PRIVATE-LEARNER-TEXT should never be exported';
  const exported = buildTraceExport({ state, provider: 'mock', model: null, storage: { mode: 'indexeddb', persistent: true, lastError: null }, persistence: 'denied', exportedAt: NOW });
  assert.ok(!exported.json.includes('PRIVATE-LEARNER-TEXT'));
  const data = JSON.parse(exported.json);
  assert.deepEqual(data.state.answers[0].explanation, { redacted: true, characters: 'PRIVATE-LEARNER-TEXT should never be exported'.length });
  assert.equal(data.state.answers[0].diagnosis.questionId, 'EL01');
  assert.equal(data.contentStatus, 'UNREVIEWED_DRAFT');
  assert.equal(data.storage.persistence, 'denied');
  assert.equal(data.counts.queue, 1);
  assert.ok(data.state.trace.length > 0);
  assert.ok(!('drafts' in data) && !('drafts' in data.state));
});

test('the export redacts access codes, API keys, bearer tokens and environment assignments wherever they appear', () => {
  const code = 'session-code-abcdef-0123456789';
  const state = answered();
  state.trace.push({ id: 'x', at: NOW, type: 'note', reason: `leaked ${code} and gsk_ABCDEFGHIJKLMNOPQRSTUV and sk-ABCDEFGHIJKLMNOPQRSTUV and Bearer abcdefghijklmnop12345 and GROQ_API_KEY=abcd1234efgh5678 and PATHASETU_DEMO_ACCESS_CODE: hunter2hunter2 and x-pathasetu-demo-code: ${code}` });
  const exported = buildTraceExport({ state, provider: 'mock', knownSecrets: [code], exportedAt: NOW });
  for (const secret of [code, 'gsk_ABCDEFGHIJKLMNOPQRSTUV', 'sk-ABCDEFGHIJKLMNOPQRSTUV', 'abcdefghijklmnop12345', 'abcd1234efgh5678', 'hunter2hunter2']) assert.ok(!exported.json.includes(secret), `still contains ${secret}`);
  assert.ok(exported.redactions >= 6);
  assert.doesNotThrow(() => JSON.parse(exported.json));
  assert.deepEqual(redactSecrets('nothing secret here', ['short']).redactions, 0);
});

test('persistent storage: unsupported, already granted, granted on request, denied and failing browsers are all reported without throwing', async () => {
  const none = { storage: {} };
  assert.equal((await checkPersistence(none)).state, PERSISTENCE.UNSUPPORTED);
  assert.equal((await createPersistenceRequester(none).request()).state, PERSISTENCE.UNSUPPORTED);
  const already = { storage: { persisted: async () => true, persist: async () => assert.fail('must not prompt when already persistent') } };
  assert.equal((await checkPersistence(already)).state, PERSISTENCE.GRANTED);
  assert.equal((await createPersistenceRequester(already).request()).state, PERSISTENCE.GRANTED);
  const grants = { storage: { persisted: async () => false, persist: async () => true } };
  assert.equal((await checkPersistence(grants)).state, PERSISTENCE.NOT_REQUESTED);
  assert.equal((await createPersistenceRequester(grants).request()).state, PERSISTENCE.GRANTED);
  const denies = { storage: { persisted: async () => false, persist: async () => false } };
  assert.equal((await createPersistenceRequester(denies).request()).state, PERSISTENCE.DENIED);
  const throws = { storage: { persisted: async () => false, persist: async () => { throw new Error('no'); } } };
  assert.equal((await createPersistenceRequester(throws).request()).state, PERSISTENCE.ERROR);
  const brokenCheck = { storage: { persisted: async () => { throw new Error('no'); }, persist: async () => true } };
  assert.equal((await checkPersistence(brokenCheck)).state, PERSISTENCE.ERROR);
});

test('persistent storage is requested at most once per requester, however often it is called', async () => {
  let calls = 0;
  const nav = { storage: { persisted: async () => false, persist: async () => { calls += 1; return false; } } };
  const requester = createPersistenceRequester(nav);
  await Promise.all([requester.request(), requester.request()]);
  await requester.request();
  assert.equal(calls, 1);
  assert.equal(requester.calls, 1);
});

test('persistence wording never promises retention', () => {
  for (const state of Object.values(PERSISTENCE)) {
    const { text } = describePersistence(state);
    assert.doesNotMatch(text, /\b(permanent|permanently|forever|safe|always kept)\b/i, state);
    assert.doesNotMatch(text, /(?<!never )(?<!not )\bguaranteed\b/i, `${state}: a promise, not a disclaimer`);
  }
  assert.match(describePersistence(PERSISTENCE.GRANTED).text, /does not guarantee/);
  assert.match(describePersistence(PERSISTENCE.DENIED).text, /may clear/);
  assert.match(describePersistence(PERSISTENCE.NOT_REQUESTED).text, /never guaranteed/);
});
