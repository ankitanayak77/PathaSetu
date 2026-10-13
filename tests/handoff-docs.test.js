// Real-world validation handoff: the event-day checklist, the stop/go gates and the teacher review guide.
// These documents may describe what a human must do; they must never record that a phone was tested or content reviewed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '../scripts/lib/csv.mjs';
import { HEADER, MANDATORY_STEPS, COMBINATIONS } from '../scripts/generate-phone-test-matrix.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const plan = read('docs/PHONE_TEST_PLAN.md');
const guide = read('docs/REVIEWER_GUIDE.md');
const eventPath = path.join(ROOT, 'docs/EVENT_DAY_CHECKLIST.md');
const event = fs.existsSync(eventPath) ? fs.readFileSync(eventPath, 'utf8') : '';

test('the plan documents every column of the results template, and the template header has not drifted', () => {
  const recording = plan.slice(plan.indexOf('## Recording results'), plan.indexOf('## Acceptance'));
  for (const column of HEADER.filter((name) => !['device', 'browser', 'step', 'step_title', 'mandatory'].includes(name))) assert.ok(recording.includes(`\`${column}\``), `plan must name column ${column}`);
  assert.deepEqual(parseCsv(read('docs/PHONE_TEST_RESULTS_TEMPLATE.csv')).header, HEADER);
});

test('the plan describes the current access behaviour: public demo mode, the throttle message, and the HTTPS runbook', () => {
  assert.match(plan, /PATHASETU_PUBLIC_DEMO/);
  assert.match(plan, /HTTPS_DEMO_RUNBOOK\.md/);
  assert.match(plan, /too many attempts/i);
});

test('the event-day checklist exists and orders the work for all four devices and seven browser combinations', () => {
  assert.ok(event.length > 1500, 'docs/EVENT_DAY_CHECKLIST.md must exist');
  for (const device of ['Samsung Galaxy S23', 'Samsung Galaxy S25', 'Samsung Galaxy S25 FE', 'iPhone 16']) assert.ok(event.includes(device), device);
  for (const browser of ['Chrome', 'Samsung Internet', 'Safari']) assert.ok(event.includes(browser), browser);
  assert.equal(COMBINATIONS.length, 7);
  assert.match(event, /npm run preflight/);
  assert.match(event, /HTTPS_DEMO_RUNBOOK\.md/);
});

test('the checklist names the exact version fields to fill and where to read them on each device', () => {
  assert.match(event, /`os_version`/); assert.match(event, /`browser_version`/);
  assert.match(event, /Software information/i);               // Samsung: Settings > About phone > Software information
  assert.match(event, /chrome:\/\/version|About Chrome/i);     // Chrome version
  assert.match(event, /About Samsung Internet/i);              // Samsung Internet version
  assert.match(event, /General.{0,6}About/i);                  // iPhone: Settings > General > About
  assert.match(event, /iPhone[^\n]*HTTPS|HTTPS[^\n]*iPhone/i);
  assert.match(event, /do not guess/i);
});

test('the stop/go checklist gates offline reliability on real-device steps and content on a recorded qualified reviewer decision', () => {
  assert.match(event, /\bGO\b/); assert.match(event, /\bNO-GO\b/);
  const mandatory = `${MANDATORY_STEPS[0]}, 3–9, 14 and 18`;
  assert.ok(event.includes(mandatory), `must cite the mandatory steps (${mandatory})`);
  assert.match(event, /offline[^\n]*reconnect|reconnect[^\n]*offline/i);
  assert.match(event, /qualified Odia-medium science reviewer/);
  assert.match(event, /reviewer_name/); assert.match(event, /review_decision/);
  assert.match(event, /npm run check:content/);
  assert.match(event, /UNREVIEWED_DRAFT/);
});

test('the checklist records nothing as done: every status stays NOT TESTED, with no tester, date or result filled in', () => {
  assert.match(event, /NOT TESTED/);
  assert.doesNotMatch(event, /\|\s*(PASS|PASSED|TESTED)\s*\|/);
  assert.doesNotMatch(event, /reviewed by [A-Z][a-z]+|approved by [A-Z][a-z]+/);
  assert.doesNotMatch(event, /\b20\d\d-\d\d-\d\d\b/, 'no completion date may be written into the checklist');
});

test('the teacher review guide covers every review dimension and keeps reviewer fields for the reviewer', () => {
  const dimensions = {
    'science correctness': /science correctness/i, 'answer key': /answer key|keyed correct/i, 'misconception ID mapping': /misconception ID/i,
    'everyday Odia': /everyday Odia/i, 'formal school Odia': /(formal )?school Odia/i, 'English terminology': /English terminology|English term/i,
    difficulty: /difficulty/i, ambiguity: /ambiguit/i, "the learner's likely interpretation": /learner'?s? (likely )?(interpretation|reading)|likely interpretation/i
  };
  for (const [name, pattern] of Object.entries(dimensions)) assert.match(guide, pattern, `reviewer guide must cover ${name}`);
  assert.match(guide, /Do not enter a name, date or approval for anyone else/);
  assert.doesNotMatch(guide, /reviewer_name\s*[:=]\s*\S/);
});
