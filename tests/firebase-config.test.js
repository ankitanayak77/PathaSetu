import test from 'node:test';
import assert from 'node:assert/strict';
import { firebaseConnectSources, firebaseWebConfig } from '../src/server/firebaseConfig.js';

const fullConfig = {
  FIREBASE_PROJECT_ID: 'pathasetu-demo',
  FIREBASE_WEB_API_KEY: 'AIzaSyA-valid-public-web-key',
  FIREBASE_WEB_APP_ID: '1:123456789:web:abcdef0123456789'
};

test('Firebase is disabled when web app configuration has not been completed', () => {
  assert.deepEqual(firebaseWebConfig({}), { enabled: false });
  assert.deepEqual(firebaseWebConfig({ FIREBASE_PROJECT_ID: 'pathasetu-demo' }), { enabled: false });
});

test('complete Firebase config derives the standard auth domain without returning secrets', () => {
  const config = firebaseWebConfig(fullConfig);
  assert.equal(config.enabled, true);
  assert.equal(config.web.projectId, 'pathasetu-demo');
  assert.equal(config.web.authDomain, 'pathasetu-demo.firebaseapp.com');
  assert.equal(JSON.stringify(config).includes('serviceAccount'), false);
});

test('Firebase emulator overrides are restricted to loopback and added to CSP connect sources', () => {
  const config = firebaseWebConfig({ ...fullConfig, FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099', FIRESTORE_EMULATOR_HOST: 'localhost:8080' });
  assert.equal(config.emulators.auth, 'http://127.0.0.1:9099');
  assert.deepEqual(config.emulators.firestore, { host: 'localhost', port: 8080 });
  assert.match(firebaseConnectSources(config), /127\.0\.0\.1:9099/);
  assert.throws(() => firebaseWebConfig({ ...fullConfig, FIRESTORE_EMULATOR_HOST: '0.0.0.0:8080' }), /localhost or 127\.0\.0\.1/);
});

test('malformed project and web app identifiers fail closed', () => {
  assert.throws(() => firebaseWebConfig({ ...fullConfig, FIREBASE_PROJECT_ID: 'not a project' }), /PROJECT_ID/);
  assert.throws(() => firebaseWebConfig({ ...fullConfig, FIREBASE_WEB_APP_ID: 'wrong' }), /APP_ID/);
});
