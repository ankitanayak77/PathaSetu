import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyBrowserFailure, summarizeBrowserRun } from '../scripts/lib/browser-run-status.mjs';

test('managed-browser administrator refusal is a BLOCKED environment result, not a product failure', () => {
  const result = classifyBrowserFailure(new Error('navigate_failed:net::ERR_BLOCKED_BY_ADMINISTRATOR'));
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.reason, 'browser_policy');
  assert.match(result.summary, /policy/i);
});

test('an explicitly flagged browser policy error stays BLOCKED even when its message changes', () => {
  const result = classifyBrowserFailure(Object.assign(new Error('navigation refused'), { browserBlocked: true, code: 'BROWSER_POLICY_BLOCKED' }));
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.reason, 'browser_policy');
});

test('a missing browser stays BLOCKED and is distinguished from an administrator policy refusal', () => {
  const result = classifyBrowserFailure(Object.assign(new Error('no browser found'), { code: 'BROWSER_BLOCKED' }));
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.reason, 'browser_unavailable');
});

test('ordinary application/test errors remain FAIL instead of being hidden as BLOCKED', () => {
  const result = classifyBrowserFailure(new Error('assertion failed: expected question EL01'));
  assert.equal(result.status, 'FAIL');
  assert.equal(result.reason, 'test_failure');
});

test('empty check results cannot be reported as a successful browser run when blocked', () => {
  const result = summarizeBrowserRun({ checks: [], blocked: { reason: 'browser_policy' } });
  assert.deepEqual(result, { status: 'BLOCKED', passCount: 0, failCount: 0, blockedCount: 1 });
});

test('a real failed check remains FAIL while an all-passing, unblocked run is PASS', () => {
  assert.deepEqual(summarizeBrowserRun({ checks: [{ passed: true }, { passed: true }] }), { status: 'PASS', passCount: 2, failCount: 0, blockedCount: 0 });
  assert.deepEqual(summarizeBrowserRun({ checks: [{ passed: true }, { passed: false }] }), { status: 'FAIL', passCount: 1, failCount: 1, blockedCount: 0 });
});

test('E2E and accessibility runners both use the shared policy classifier and preserve exit 2 semantics', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const e2e = fs.readFileSync(path.join(root, 'scripts/browser-regression.mjs'), 'utf8');
  const a11y = fs.readFileSync(path.join(root, 'scripts/accessibility-audit.mjs'), 'utf8');
  assert.match(e2e, /classifyBrowserFailure/);
  assert.match(e2e, /if \(!policyBlocked\) check\('Z1'/);
  assert.match(e2e, /results.status === 'BLOCKED' \? 2/);
  assert.match(a11y, /classifyBrowserFailure/);
  assert.match(a11y, /blocked = classification.summary/);
  assert.match(a11y, /process\.exit\(blocked \? 2/);
});
