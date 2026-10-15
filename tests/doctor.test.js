// Iteration 9: local doctor command. These tests must pass without a browser launch or live provider request.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDoctorReport } from '../scripts/lib/doctor.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const foundBrowser = () => ({ status: 'FOUND', path: '/safe/fake/chrome', source: 'CHROME_PATH', label: 'Google Chrome' });
const passingRunner = () => ({ status: 'PASS', code: 0 });

function report(overrides = {}) {
  return createDoctorReport({
    root: ROOT,
    env: { PATHASETU_MODEL_PROVIDER: 'mock' },
    platform: 'linux',
    nodeVersion: '22.16.0',
    resolveBrowserFn: foundBrowser,
    runCommand: passingRunner,
    ...overrides
  });
}

test('doctor reports PASS only when runtime, required files, syntax, content, preflight and browser discovery pass', () => {
  const result = report();
  assert.equal(result.status, 'PASS');
  assert.equal(result.ok, true);
  assert.deepEqual(result.checks.map((c) => c.id), ['D01', 'D02', 'D03', 'D04', 'D05', 'D06']);
  assert.ok(result.checks.every((c) => c.status === 'PASS'));
  assert.match(result.checks.find((c) => c.id === 'D06').summary, /\/safe\/fake\/chrome/);
  assert.match(result.checks.find((c) => c.id === 'D05').summary, /mock|local/i);
});

test('doctor fails on an unsupported Node runtime, even if its other checks pass', () => {
  const result = report({ nodeVersion: '18.19.0' });
  assert.equal(result.status, 'FAIL');
  assert.equal(result.checks.find((c) => c.id === 'D01').status, 'FAIL');
});

test('doctor reports a missing browser as BLOCKED, not as a product failure or an implicit pass', () => {
  const result = report({ resolveBrowserFn: () => ({ status: 'BLOCKED', reason: 'no_browser_found', detail: 'private path detail' }) });
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.checks.find((c) => c.id === 'D06').status, 'BLOCKED');
  assert.doesNotMatch(JSON.stringify(result), /private path detail/);
});

test('doctor reports a failed child check as FAIL and does not disclose provider credentials', () => {
  const result = report({
    env: { PATHASETU_MODEL_PROVIDER: 'mock', GROQ_API_KEY: 'test-secret-do-not-print' },
    runCommand: (name) => name === 'check:content' ? { status: 'FAIL', code: 1 } : passingRunner()
  });
  assert.equal(result.status, 'FAIL');
  assert.equal(result.checks.find((c) => c.id === 'D04').status, 'FAIL');
  assert.doesNotMatch(JSON.stringify(result), /test-secret-do-not-print/);
});

test('a child timeout or launch error is BLOCKED, not silently converted to PASS', () => {
  const result = report({ runCommand: (name) => name === 'preflight' ? { status: 'BLOCKED', code: null } : passingRunner() });
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.checks.find((c) => c.id === 'D05').status, 'BLOCKED');
});

test('an invalid explicit CHROME_PATH is BLOCKED and is never replaced by a different browser', () => {
  const result = report({
    env: { CHROME_PATH: '/home/private-user/does-not-exist' },
    resolveBrowserFn: ({ env }) => ({ status: 'BLOCKED', reason: 'invalid_chrome_path', detail: `invalid ${env.CHROME_PATH}` })
  });
  assert.equal(result.status, 'BLOCKED');
  assert.match(result.checks.find((c) => c.id === 'D06').summary, /CHROME_PATH.*invalid|invalid.*CHROME_PATH/i);
  assert.doesNotMatch(JSON.stringify(result), /private-user|does-not-exist/);
});
