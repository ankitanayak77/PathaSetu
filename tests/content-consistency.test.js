// Consistency checks between the JSON pack, the review worksheet and the evaluation files.
// These tests check structure and honesty. None of them decides that content is correct.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv, toCsv } from '../scripts/lib/csv.mjs';
import { checkPackIntegrity, checkWorksheet, checkReviewHonesty, checkEvaluationTemplate, WORKSHEET_COLUMNS } from '../scripts/lib/content-consistency.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const pack = () => JSON.parse(read('content/electricity-pack.json'));
const dataset = () => JSON.parse(read('evaluation/cases.json'));
const worksheetText = () => read('docs/CONTENT_REVIEW_WORKSHEET.csv');
const templateText = () => read('evaluation/EVALUATION_REVIEW_TEMPLATE.csv');
const messages = (result) => (result.problems ?? result).map((p) => `${p.itemId ?? ''}${p.field ? `.${p.field}` : ''}: ${p.message}`);
function editWorksheet(mutate) { const { header, records } = parseCsv(worksheetText()); mutate(records); return toCsv(header, records); }

test('CSV helper: quotes, commas, newlines, doubled quotes and a BOM round-trip', () => {
  const header = ['a', 'b'];
  const records = [{ a: 'x,y', b: 'line1\nline2 "quoted"' }, { a: '', b: 'ଓଡ଼ିଆ' }];
  const back = parseCsv(toCsv(header, records));
  assert.deepEqual(back.header, header);
  assert.deepEqual(back.records, records);
  assert.throws(() => parseCsv('a,b\n"open,1'), /csv_unterminated_quote/);
});

test('the shipped pack, worksheet and evaluation template are consistent, and every item is still a draft', () => {
  const p = pack();
  assert.deepEqual(checkPackIntegrity(p), []);
  const sheet = checkWorksheet(p, worksheetText());
  assert.deepEqual(messages(sheet), []);
  assert.equal(sheet.rows, p.items.length);
  assert.ok(p.items.every((item) => item.status === 'UNREVIEWED_DRAFT' && item.review.status === 'UNREVIEWED_DRAFT' && !item.review.reviewer && !item.review.reviewedAt));
  const template = checkEvaluationTemplate(dataset(), templateText());
  assert.deepEqual(messages(template), []);
  assert.equal(template.filledRows, dataset().cases.length);
  assert.ok(template.blankRows >= 8);
});

test('the worksheet carries the expected columns and the shipped not-started markers are read as "not reviewed"', () => {
  const { header, records } = parseCsv(worksheetText());
  assert.deepEqual(header, WORKSHEET_COLUMNS);
  assert.ok(records.every((r) => r.reviewer_name === '' && r.science_accuracy === 'NOT REVIEWED' && r.review_decision === 'UNREVIEWED_DRAFT'));
});

test('pack integrity: two correct options, a wrong key, an unused or foreign misconception and a missing bridge are all reported', () => {
  const p = pack();
  p.items[0].options[0].misconceptionId = null; // a second option now looks correct
  p.items[1].correctOptionId = p.items[1].options.find((o) => o.misconceptionId).id;
  p.items[2].allowedMisconceptionIds = [...p.items[2].allowedMisconceptionIds, 'SOMETHING_UNUSED'];
  p.items[3].bridge = { everydayOdia: '', schoolOdiaTerm: 'x', englishTerm: 'y' };
  const text = messages(checkPackIntegrity(p)).join('\n');
  assert.match(text, /exactly one option must be correct/);
  assert.match(text, /does not match the option without a misconception|must not map to a misconception/);
  assert.match(text, /SOMETHING_UNUSED is not used/);
  assert.match(text, /incomplete bridge mapping/);
});

test('worksheet drift from the pack is reported field by field', () => {
  const p = pack();
  const drifted = editWorksheet((rows) => { rows[0].english_prompt += ' (edited)'; rows[1].correct_option_id = 'Z'; rows[2].options_json = '[]'; rows[3].misconceptions_json = 'not json'; rows.pop(); });
  const text = messages(checkWorksheet(p, drifted)).join('\n');
  assert.match(text, /EL01\.english_prompt: does not match the pack/);
  assert.match(text, /EL02\.correct_option_id/);
  assert.match(text, /EL03\.options_json/);
  assert.match(text, /EL04\.misconceptions_json: not valid JSON/);
  assert.match(text, /no worksheet row for this pack item/);
});

test('a worksheet row that is not in the pack, a duplicate row and a missing column are reported', () => {
  const p = pack();
  const extra = editWorksheet((rows) => { rows.push({ ...rows[0], item_id: 'EL99' }); rows.push({ ...rows[0] }); });
  const text = messages(checkWorksheet(p, extra)).join('\n');
  assert.match(text, /EL99: worksheet row for an item that is not in the pack/);
  assert.match(text, /EL01: duplicate worksheet rows/);
  const noColumn = checkWorksheet(p, worksheetText().replace('reviewer_notes', 'notes'));
  assert.match(messages(noColumn).join('\n'), /missing columns: reviewer_notes/);
  assert.equal(noColumn.ok, false);
});

test('a reviewer or review date cannot appear on an item that is still a draft', () => {
  const p = pack();
  p.items[0].review.reviewer = 'Someone';
  assert.match(messages(checkReviewHonesty(p, parseCsv(worksheetText()).records)).join('\n'), /draft item must not carry a reviewer name or review date/);
  const p2 = pack(); p2.items[1].review.status = 'REVIEWED';
  assert.match(messages(checkReviewHonesty(p2, parseCsv(worksheetText()).records)).join('\n'), /item status UNREVIEWED_DRAFT differs from review status REVIEWED/);
});

test('REVIEWED or PUBLISHED needs a real worksheet approval and a matching reviewer name and date in the pack', () => {
  const p = pack();
  p.items[0].status = 'REVIEWED'; p.items[0].review.status = 'REVIEWED';
  p.items[0].bridge.status = 'REVIEWED';
  const empty = checkWorksheet(p, editWorksheet(() => {}));
  assert.equal(empty.ok, false);
  assert.match(messages(empty).join('\n'), /claims REVIEWED\/PUBLISHED but the worksheet row has no reviewer/);

  // A complete worksheet approval but no reviewer/date in the pack still fails.
  const approved = editWorksheet((rows) => { Object.assign(rows[0], { content_status: 'REVIEWED', reviewer_name: 'Test Reviewer', science_accuracy: 'PASS', odia_language_quality: 'PASS', terminology_mapping: 'PASS', misconception_mapping: 'PASS', review_decision: 'APPROVE' }); });
  const noMeta = checkWorksheet(p, approved);
  assert.match(messages(noMeta).join('\n'), /needs a reviewer name and a valid review date in the pack/);

  p.items[0].review.reviewer = 'Test Reviewer'; p.items[0].review.reviewedAt = '2026-10-14';
  const consistent = checkWorksheet(p, approved);
  assert.deepEqual(messages(consistent).filter((m) => m.startsWith('EL01')), []);
  p.items[0].review.reviewer = 'Another Person';
  assert.match(messages(checkWorksheet(p, approved)).join('\n'), /reviewer in the pack differs from the worksheet/);
});

test('an approval in the worksheet needs a reviewer name and PASS in all four checks, and values must be from the allowed lists', () => {
  const p = pack();
  const partial = editWorksheet((rows) => { Object.assign(rows[0], { reviewer_name: '', science_accuracy: 'PASS', odia_language_quality: 'PASS', terminology_mapping: 'PASS', misconception_mapping: 'NEEDS_CHANGES', review_decision: 'APPROVE' }); rows[1].science_accuracy = 'MAYBE'; rows[2].review_decision = 'LGTM'; });
  const text = messages(checkWorksheet(p, partial)).join('\n');
  assert.match(text, /EL01\.review_decision: an approval needs a reviewer name and PASS in all four checks/);
  assert.match(text, /EL02\.science_accuracy: must be one of/);
  assert.match(text, /EL03\.review_decision: must be one of/);
});

test('a fully approved worksheet row only produces a note: the pack status is never changed by code', () => {
  const p = pack();
  const approved = editWorksheet((rows) => { Object.assign(rows[0], { reviewer_name: 'Test Reviewer', science_accuracy: 'PASS', odia_language_quality: 'PASS', terminology_mapping: 'PASS', misconception_mapping: 'PASS', review_decision: 'APPROVE' }); });
  const result = checkWorksheet(p, approved);
  assert.equal(result.ok, true);
  assert.ok(result.problems.some((x) => x.severity === 'info' && x.itemId === 'EL01'));
  assert.ok(p.items.every((item) => item.status === 'UNREVIEWED_DRAFT'));
});

test('evaluation template: drift, filled reviewer fields, authored Odia and missing blank categories are reported', () => {
  const data = dataset();
  const { header, records } = parseCsv(templateText());
  const mutate = (fn) => { const copy = records.map((r) => ({ ...r })); fn(copy); return toCsv(header, copy); };

  assert.match(messages(checkEvaluationTemplate(data, mutate((r) => { r[0].explanation += ' x'; }))).join('\n'), /E001: explanation does not match/);
  assert.match(messages(checkEvaluationTemplate(data, mutate((r) => { r[1].reviewer_name = 'Invented Name'; }))).join('\n'), /reviewer fields must be empty/);
  const blank = records.findIndex((r) => !r.case_id);
  assert.match(messages(checkEvaluationTemplate(data, mutate((r) => { r[blank].explanation = 'ଏକ ଉଦାହରଣ'; }))).join('\n'), /only a qualified reviewer may author Odia examples/);
  assert.match(messages(checkEvaluationTemplate(data, mutate((r) => { r.splice(46, 1); }))).join('\n'), /no row for case E047/);
  assert.match(messages(checkEvaluationTemplate(data, mutate((r) => { for (let i = r.length - 1; i >= 0; i--) if (!r[i].case_id && r[i].language === 'roman_odia' && r[i].category === 'ambiguous') r.splice(i, 1); }))).join('\n'), /no blank row for roman_odia \/ ambiguous/);
});

test('the checker CLI succeeds on the shipped files', async () => {
  const { spawnSync } = await import('node:child_process');
  const run = spawnSync(process.execPath, ['scripts/check-content-consistency.mjs'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.match(run.stdout, /OK: pack, worksheet and evaluation files are consistent/);
  assert.match(run.stdout, /still UNREVIEWED_DRAFT until a qualified reviewer approves/);
});
