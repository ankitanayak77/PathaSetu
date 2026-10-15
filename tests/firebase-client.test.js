import test from 'node:test';
import assert from 'node:assert/strict';
import { createFirebaseClient } from '../src/core/firebaseClient.js';

function fakeSdk({ cloudDocs = [] } = {}) {
  const calls = { persistence: null, provider: null, redirect: false, path: null, writes: [], deleted: [], authEmulator: null, firestoreEmulator: null };
  const db = {};
  const auth = {};
  class GoogleAuthProvider {
    setCustomParameters(value) { this.parameters = value; }
  }
  const app = { initializeApp: (config) => ({ config }) };
  const authSdk = {
    browserSessionPersistence: Symbol('session'),
    GoogleAuthProvider,
    getAuth: () => auth,
    setPersistence: async (_auth, persistence) => { calls.persistence = persistence; },
    connectAuthEmulator: (_auth, url) => { calls.authEmulator = url; },
    signInWithRedirect: async (_auth, provider) => { calls.provider = provider; calls.redirect = true; },
    getRedirectResult: async () => ({ user: null }),
    onAuthStateChanged: (_auth, callback) => { callback(null); return () => {}; },
    signOut: async () => {}
  };
  const firestoreSdk = {
    getFirestore: () => db,
    connectFirestoreEmulator: (_db, host, port) => { calls.firestoreEmulator = { host, port }; },
    collection: (_db, ...segments) => { calls.path = segments.join('/'); return { path: segments.join('/') }; },
    orderBy: (...args) => ({ orderBy: args }), limit: (count) => ({ limit: count }),
    query: (ref, ...constraints) => ({ ref, constraints }),
    getDocs: async (query) => {
      const docs = query.constraints.some((constraint) => constraint.limit === 400) ? [] : cloudDocs;
      return { docs, empty: docs.length === 0, size: docs.length };
    },
    writeBatch: () => {
      const pending = [];
      return {
        set: (ref, value) => pending.push({ path: ref.path, value }),
        delete: (ref) => pending.push({ deletePath: ref.path }),
        commit: async () => { calls.writes.push(...pending.filter((entry) => entry.value)); calls.deleted.push(...pending.filter((entry) => entry.deletePath)); }
      };
    },
    doc: (ref, id) => ({ path: `${ref.path}/${id}` })
  };
  return { calls, loader: async () => ({ app, auth: authSdk, firestore: firestoreSdk }) };
}

const config = { enabled: true, web: { projectId: 'pathasetu-demo' }, emulators: { auth: 'http://127.0.0.1:9099', firestore: { host: '127.0.0.1', port: 8080 } } };

test('guardian client uses session persistence, Google redirect, and local emulator endpoints', async () => {
  const fake = fakeSdk();
  const client = await createFirebaseClient(config, fake.loader);
  assert.equal(fake.calls.persistence.description, 'session');
  assert.equal(fake.calls.authEmulator, 'http://127.0.0.1:9099');
  assert.deepEqual(fake.calls.firestoreEmulator, { host: '127.0.0.1', port: 8080 });
  await client.signInWithGoogle();
  assert.equal(fake.calls.redirect, true);
  assert.deepEqual(fake.calls.provider.parameters, { prompt: 'select_account' });
});

test('progress writes are UID-scoped, deduplicated, and exclude private explanation text', async () => {
  const fake = fakeSdk();
  const client = await createFirebaseClient(config, fake.loader);
  const result = await client.syncLearnerProgress({
    user: { uid: 'guardian-uid' }, profileId: 'prof_child_b',
    answers: [{ id: 'ans-local1', itemId: 'EL01', optionId: 'B', explanation: 'private reasoning', submittedAt: '2026-10-15T12:30:00.000Z', diagnosis: { type: 'MISCONCEPTION', misconceptionId: 'series_current', rationale: 'private rationale' } }]
  });
  assert.equal(fake.calls.path, 'guardians/guardian-uid/learners/prof_child_b/attempts');
  assert.equal(result.count, 1);
  assert.equal(fake.calls.writes.length, 1);
  assert.equal(fake.calls.writes[0].value.itemId, 'EL01');
  assert.equal('explanation' in fake.calls.writes[0].value, false);
  assert.equal('rationale' in fake.calls.writes[0].value, false);
});

test('sync rejects missing guardian identity and malformed local profile paths before database access', async () => {
  const fake = fakeSdk();
  const client = await createFirebaseClient(config, fake.loader);
  await assert.rejects(client.syncLearnerProgress({ user: null, profileId: 'prof_child_b', answers: [] }), /guardian_sign_in_required/);
  await assert.rejects(client.syncLearnerProgress({ user: { uid: 'guardian-uid' }, profileId: '../other', answers: [] }), /invalid_learner_profile/);
});

test('Firebase integration is not loaded or initialized when configuration is disabled', async () => {
  let loaded = false;
  const result = await createFirebaseClient({ enabled: false }, async () => { loaded = true; return {}; });
  assert.equal(result, null);
  assert.equal(loaded, false);
});
