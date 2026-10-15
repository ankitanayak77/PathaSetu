import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '../scripts/lib/csv.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(ROOT, file));

test('NEXTECH strategy maps all four core criteria and four bonus criteria to actual evidence and limits', () => {
  const doc = read('docs/NEXTECH_24H_DEMO_STRATEGY.md');
  for (const criterion of ['Problem understanding', 'Technicalities', 'Presentation', 'Pitch deck', 'Regional-language support', 'Ease of use and accessibility', 'Offline compatibility', 'Agentic approach/framework']) {
    assert.ok(doc.toLowerCase().includes(criterion.toLowerCase()), `missing criterion: ${criterion}`);
  }
  for (const route of ['/api/session', '/api/pack', '/api/recheck']) assert.ok(doc.includes(route), `route ${route} is not mapped`);
  for (const time of ['10:30 AM', '3:00 PM onwards', '8:00 AM', '9:00 AM–12:30 PM']) assert.ok(doc.includes(time), `agenda time ${time} missing`);
  assert.match(doc, /approximately 50 competing teams[^.]*team-reported/i);
  assert.match(doc, /not independently verified/i);
  assert.match(doc, /does not interpret the mock free text|free text is not semantically interpreted/i);
  assert.match(doc, /no claim|do not claim/i);
});

test('Iteration 11 evidence captures a real red-before-fix run and a green-after-fix run for retry atomicity', () => {
  const red = read('evidence/iteration11/tests-first/retry-atomicity-red-before-fix.txt');
  const green = read('evidence/iteration11/tests-first/retry-atomicity-green-after-fix.txt');
  assert.match(red, /^# fail [1-9]\d*$/m);
  assert.match(red, /^targeted red-before-fix exit=1$/m);
  assert.match(green, /^# pass 6$/m);
  assert.match(green, /^# fail 0$/m);
  assert.match(read('evidence/iteration11/runtime-changes.txt'), /src\/core\/retry\.js/);
  assert.ok(exists('evidence/iteration11/previous-runtime/src/core/retry.js'));
});

test('Iteration 11 keeps the queue hardening criterion and the eight content items honest without increasing completion counts', () => {
  const criteria = parseCsv(read('docs/PHASE_CRITERIA.csv')).records;
  const p1009 = criteria.find((row) => row.id === 'P10-09');
  assert.equal(p1009.state, 'DONE');
  assert.ok(exists('evidence/iteration11/tests-first/retry-atomicity-green-after-fix.txt'));
  assert.equal(criteria.filter((row) => row.state !== 'NA').length, 196, 'applicable criteria exclude the one NA row');
  assert.equal(criteria.filter((row) => row.state === 'DONE').length, 95, 'the completion figure moves only when a criterion genuinely changes state');
  const pack = JSON.parse(read('content/electricity-pack.json'));
  assert.equal(pack.items.length, 8);
  assert.ok(pack.items.every((item) => item.status === 'UNREVIEWED_DRAFT'));
  assert.match(read('docs/BUILD_STATUS.md'), /Iteration 11/);
});
