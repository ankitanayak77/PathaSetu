// The phone test plan and its results template must agree, and the template must never claim a test was run.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '../scripts/lib/csv.mjs';
import { readSteps, buildRows, COMBINATIONS, MANDATORY_STEPS, HEADER } from '../scripts/generate-phone-test-matrix.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const plan = fs.readFileSync(path.join(ROOT, 'docs/PHONE_TEST_PLAN.md'), 'utf8');
const csv = parseCsv(fs.readFileSync(path.join(ROOT, 'docs/PHONE_TEST_RESULTS_TEMPLATE.csv'), 'utf8'));

test('the plan lists the four required devices with their browsers, and HTTPS for iPhone', () => {
  for (const device of ['Samsung Galaxy S23', 'Samsung Galaxy S25', 'Samsung Galaxy S25 FE']) assert.match(plan, new RegExp(`\\| ${device} \\| Chrome, Samsung Internet \\|`));
  assert.match(plan, /\| iPhone 16 \| Safari \|[^|]*HTTPS is required/);
  assert.equal(COMBINATIONS.length, 7);
});

test('the numbered steps are contiguous and the results template has one row per combination and step', () => {
  const steps = readSteps(plan);
  assert.deepEqual(steps.map((s) => s.number), steps.map((_, i) => i + 1));
  assert.ok(steps.length >= 23);
  assert.deepEqual(csv.header, HEADER);
  assert.equal(csv.records.length, COMBINATIONS.length * steps.length);
  assert.deepEqual(csv.records.map((r) => `${r.device}|${r.browser}|${r.step}`), buildRows(steps).map((r) => `${r.device}|${r.browser}|${r.step}`));
});

test('every row of the shipped template is NOT TESTED with no tester, date, version or evidence filled in', () => {
  for (const row of csv.records) {
    assert.equal(row.result, 'NOT TESTED', `${row.device} ${row.browser} step ${row.step}`);
    for (const field of ['tester', 'date_ist', 'os_version', 'browser_version', 'https', 'network', 'evidence_ref', 'notes']) assert.equal(row[field], '', `${field} must be empty in the shipped template`);
  }
});

test('the mandatory steps in the template match the acceptance rule written in the plan', () => {
  assert.match(plan, /all mandatory steps 1, 3–9, 14 and 18 pass/);
  const flagged = [...new Set(csv.records.filter((r) => r.mandatory === 'yes').map((r) => Number(r.step)))];
  assert.deepEqual(flagged, MANDATORY_STEPS);
});

test('the plan never records a phone as tested, and states what the headless audit does not cover', () => {
  assert.doesNotMatch(plan, /\|\s*(PASS|PASSED|TESTED)\s*\|/);
  assert.match(plan, /no phone has been tested/i);
  assert.match(plan, /do not claim screen-reader support from the automated audit/);
  assert.match(plan, /do not claim low-end-phone performance/);
  assert.match(plan, /PATHASETU_ALLOWED_ORIGINS/);
});
