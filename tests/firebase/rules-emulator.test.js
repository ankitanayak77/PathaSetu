import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';

const PROJECT_ID = 'demo-pathasetu';
const ATTEMPT = {
  schemaVersion: 1,
  itemId: 'EL01',
  optionId: 'B',
  submittedAt: '2026-10-15T12:30:00.000Z',
  diagnosisType: 'UNCERTAIN',
  misconceptionId: null
};
let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: process.env.FIRESTORE_EMULATOR_HOST?.split(':')[0] || '127.0.0.1',
      port: Number(process.env.FIRESTORE_EMULATOR_HOST?.split(':')[1] || 8080),
      rules: await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8')
    }
  });
});

after(async () => { await env?.cleanup(); });

test('Firestore rules permit a verified Google guardian to sync only allowlisted progress', async () => {
  const db = env.authenticatedContext('guardian-a', {
    email: 'guardian@example.com', email_verified: true,
    firebase: { sign_in_provider: 'google.com', identities: { email: ['guardian@example.com'] } }
  }).firestore();
  const ref = doc(db, 'guardians/guardian-a/learners/prof_child_b/attempts/ans-abc123');
  await assertSucceeds(setDoc(ref, ATTEMPT));
  assert.equal((await getDoc(ref)).data().itemId, 'EL01');
  await assertSucceeds(deleteDoc(ref));
});

test('Firestore rules deny unsigned and other-guardian access', async () => {
  const path = 'guardians/guardian-a/learners/prof_child_b/attempts/ans-abc123';
  await assertFails(setDoc(doc(env.unauthenticatedContext().firestore(), path), ATTEMPT));
  const otherGuardian = env.authenticatedContext('guardian-b', {
    email: 'other@example.com', email_verified: true,
    firebase: { sign_in_provider: 'google.com', identities: { email: ['other@example.com'] } }
  }).firestore();
  await assertFails(getDoc(doc(otherGuardian, path)));
  await assertFails(setDoc(doc(otherGuardian, path), ATTEMPT));
});

test('Firestore rules reject unverified, non-Google, and overbroad records', async () => {
  const path = 'guardians/guardian-a/learners/prof_child_b/attempts/ans-abc123';
  const unverified = env.authenticatedContext('guardian-a', {
    email: 'guardian@example.com', email_verified: false,
    firebase: { sign_in_provider: 'google.com', identities: { email: ['guardian@example.com'] } }
  }).firestore();
  await assertFails(setDoc(doc(unverified, path), ATTEMPT));
  const passwordUser = env.authenticatedContext('guardian-a', {
    email: 'guardian@example.com', email_verified: true,
    firebase: { sign_in_provider: 'password', identities: { email: ['guardian@example.com'] } }
  }).firestore();
  await assertFails(setDoc(doc(passwordUser, path), ATTEMPT));
  const googleUser = env.authenticatedContext('guardian-a', {
    email: 'guardian@example.com', email_verified: true,
    firebase: { sign_in_provider: 'google.com', identities: { email: ['guardian@example.com'] } }
  }).firestore();
  await assertFails(setDoc(doc(googleUser, path), { ...ATTEMPT, explanation: 'must not be stored' }));
  await assertFails(setDoc(doc(googleUser, 'guardians/guardian-a/learners/prof_child_b/attempts/bad'), { ...ATTEMPT, optionId: '' }));
  await assertFails(setDoc(doc(googleUser, path), { ...ATTEMPT, submittedAt: 'not-a-date' }));
  await assertFails(setDoc(doc(googleUser, path), { ...ATTEMPT, diagnosisType: 'NONE', misconceptionId: 'invented' }));
  await assertFails(setDoc(doc(googleUser, path), { ...ATTEMPT, diagnosisType: 'MISCONCEPTION', misconceptionId: null }));
});
