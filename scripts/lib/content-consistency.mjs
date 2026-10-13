// Deterministic consistency checks between the Electricity JSON pack, its review worksheet, and the evaluation files.
// It checks structure and agreement; it never decides that content is correct. Only a qualified human reviewer can do that.
import { parseCsv } from './csv.mjs';

export const WORKSHEET_COLUMNS = ['item_id', 'concept_id', 'concept_title', 'content_status', 'english_prompt', 'odia_prompt_draft', 'options_json', 'correct_option_id', 'allowed_misconception_ids', 'misconceptions_json', 'english_explanation', 'odia_explanation_draft', 'remediation', 'everyday_odia_draft', 'school_odia_term_draft', 'english_term', 'reviewer_name', 'science_accuracy', 'odia_language_quality', 'terminology_mapping', 'misconception_mapping', 'review_decision', 'reviewer_notes'];
export const CHECK_VALUES = ['', 'PASS', 'FAIL', 'NEEDS_CHANGES'];
export const DECISION_VALUES = ['', 'APPROVE', 'APPROVE_WITH_EDITS', 'NEEDS_CHANGES', 'REJECT'];
export const REVIEW_CHECK_COLUMNS = ['science_accuracy', 'odia_language_quality', 'terminology_mapping', 'misconception_mapping'];
const REVIEWED = new Set(['REVIEWED', 'PUBLISHED']);
// The shipped worksheet carries explicit not-started markers instead of blank cells. They mean "no review has happened".
export const PLACEHOLDERS = { check: 'NOT REVIEWED', decision: 'UNREVIEWED_DRAFT' };
function normaliseRow(row) {
  const out = { ...row };
  for (const column of REVIEW_CHECK_COLUMNS) if (out[column] === PLACEHOLDERS.check) out[column] = '';
  if (out.review_decision === PLACEHOLDERS.decision) out.review_decision = '';
  return out;
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const asText = (value) => (typeof value === 'string' ? value : JSON.stringify(value));
function splitIds(value) { const text = String(value ?? '').trim(); if (!text) return []; if (text.startsWith('[')) { try { return JSON.parse(text); } catch { return ['<unparseable>']; } } return text.split(/[;,|]/).map((part) => part.trim()).filter(Boolean); }
function parseJson(text) { try { return { ok: true, value: JSON.parse(text) }; } catch { return { ok: false }; } }

export function checkPackIntegrity(pack) {
  const problems = [];
  const seen = new Set();
  for (const item of pack.items ?? []) {
    const at = (message) => problems.push({ scope: 'pack', itemId: item.id, message });
    if (seen.has(item.id)) at('duplicate item id'); seen.add(item.id);
    const optionIds = (item.options ?? []).map((o) => o.id);
    if (new Set(optionIds).size !== optionIds.length) at('duplicate option ids');
    if (optionIds.length < 2) at('fewer than two options');
    const correct = (item.options ?? []).filter((o) => !o.misconceptionId);
    if (correct.length !== 1) at(`exactly one option must be correct (no misconception id); found ${correct.length}`);
    else if (correct[0].id !== item.correctOptionId) at(`correctOptionId ${item.correctOptionId} does not match the option without a misconception (${correct[0].id})`);
    const allowed = item.allowedMisconceptionIds ?? [];
    const described = new Set((item.misconceptions ?? []).map((m) => m.id));
    for (const o of item.options ?? []) {
      if (o.misconceptionId && !allowed.includes(o.misconceptionId)) at(`option ${o.id} maps to ${o.misconceptionId}, which is not allowed for this item`);
      if (o.id === item.correctOptionId && o.misconceptionId) at(`correct option ${o.id} must not map to a misconception`);
    }
    const used = new Set((item.options ?? []).map((o) => o.misconceptionId).filter(Boolean));
    for (const id of allowed) { if (!used.has(id)) at(`allowed misconception ${id} is not used by any option`); if (!described.has(id)) at(`allowed misconception ${id} has no description`); }
    for (const id of described) if (!allowed.includes(id)) at(`described misconception ${id} is not in the allowed list`);
    if (!item.bridge?.everydayOdia || !item.bridge?.schoolOdiaTerm || !item.bridge?.englishTerm) at('incomplete bridge mapping');
  }
  return problems;
}

export function checkReviewHonesty(pack, rawRows) {
  const problems = [];
  const rows = rawRows.map(normaliseRow);
  const byId = new Map(rows.map((r) => [r.item_id, r]));
  for (const item of pack.items ?? []) {
    const row = byId.get(item.id);
    const at = (message) => problems.push({ scope: 'review', itemId: item.id, message });
    const itemStatus = item.status; const reviewStatus = item.review?.status;
    if (itemStatus !== reviewStatus) at(`item status ${itemStatus} differs from review status ${reviewStatus}`);
    if (item.bridge?.status && item.bridge.status !== itemStatus && !(REVIEWED.has(item.bridge.status) === REVIEWED.has(itemStatus))) at(`bridge status ${item.bridge.status} differs from item status ${itemStatus}`);
    const claimsReviewed = REVIEWED.has(itemStatus) || REVIEWED.has(item.bridge?.status);
    if (!claimsReviewed) {
      if (item.review?.reviewer || item.review?.reviewedAt) at('a draft item must not carry a reviewer name or review date');
    }
    if (!row) continue;
    const complete = row.reviewer_name.trim() && REVIEW_CHECK_COLUMNS.every((c) => row[c] === 'PASS') && ['APPROVE', 'APPROVE_WITH_EDITS'].includes(row.review_decision);
    if (claimsReviewed) {
      if (!complete) at('the pack claims REVIEWED/PUBLISHED but the worksheet row has no reviewer, a failing or missing check, or no approval');
      if (!item.review?.reviewer || Number.isNaN(Date.parse(item.review?.reviewedAt ?? ''))) at('REVIEWED/PUBLISHED needs a reviewer name and a valid review date in the pack');
      else if (item.review.reviewer !== row.reviewer_name.trim()) at('the reviewer in the pack differs from the worksheet');
    } else if (row.reviewer_name.trim() || REVIEW_CHECK_COLUMNS.some((c) => row[c]) || row.review_decision) {
      // The reviewer has started or finished: fine, but the pack must still say draft until every check passes.
      if (complete) problems.push({ scope: 'review', itemId: item.id, severity: 'info', message: 'worksheet is fully approved; the pack status can now be updated by the team (by hand, never by code)' });
    }
  }
  return problems;
}

export function checkWorksheet(pack, csvText) {
  const problems = [];
  let parsed;
  try { parsed = parseCsv(csvText); } catch (error) { return { ok: false, problems: [{ scope: 'worksheet', message: `unreadable CSV: ${error.message}` }], rows: 0 }; }
  const { header } = parsed;
  const records = parsed.records.map(normaliseRow);
  const missing = WORKSHEET_COLUMNS.filter((c) => !header.includes(c)); const extra = header.filter((c) => !WORKSHEET_COLUMNS.includes(c));
  if (missing.length) problems.push({ scope: 'worksheet', message: `missing columns: ${missing.join(', ')}` });
  if (extra.length) problems.push({ scope: 'worksheet', message: `unexpected columns: ${extra.join(', ')}` });
  const packIds = (pack.items ?? []).map((i) => i.id);
  const rowIds = records.map((r) => r.item_id);
  for (const id of packIds) if (!rowIds.includes(id)) problems.push({ scope: 'worksheet', itemId: id, message: 'no worksheet row for this pack item' });
  for (const id of rowIds) if (!packIds.includes(id)) problems.push({ scope: 'worksheet', itemId: id, message: 'worksheet row for an item that is not in the pack' });
  for (const id of new Set(rowIds.filter((id, i) => rowIds.indexOf(id) !== i))) problems.push({ scope: 'worksheet', itemId: id, message: 'duplicate worksheet rows' });
  for (const row of records) {
    const item = pack.items.find((i) => i.id === row.item_id);
    if (!item) continue;
    const at = (field, message) => problems.push({ scope: 'worksheet', itemId: item.id, field, message });
    const eq = (field, expected) => { if (String(row[field]) !== String(expected ?? '')) at(field, 'does not match the pack'); };
    eq('concept_id', item.conceptId); eq('concept_title', item.conceptTitle); eq('content_status', item.status); eq('english_prompt', item.prompt); eq('odia_prompt_draft', item.promptOdiaDraft);
    eq('correct_option_id', item.correctOptionId); eq('english_explanation', item.explanation); eq('odia_explanation_draft', item.explanationOdiaDraft);
    eq('everyday_odia_draft', item.bridge?.everydayOdia); eq('school_odia_term_draft', item.bridge?.schoolOdiaTerm); eq('english_term', item.bridge?.englishTerm);
    if (String(row.remediation) !== asText(item.remediation ?? '')) at('remediation', 'does not match the pack');
    const options = parseJson(row.options_json); if (!options.ok) at('options_json', 'not valid JSON'); else if (!same(options.value, item.options)) at('options_json', 'does not match the pack options (ids, text, misconception ids or Odia drafts)');
    const misconceptions = parseJson(row.misconceptions_json); if (!misconceptions.ok) at('misconceptions_json', 'not valid JSON'); else if (!same(misconceptions.value, item.misconceptions)) at('misconceptions_json', 'does not match the pack misconceptions');
    if (!same(splitIds(row.allowed_misconception_ids), item.allowedMisconceptionIds)) at('allowed_misconception_ids', 'does not match the pack');
    for (const column of REVIEW_CHECK_COLUMNS) if (!CHECK_VALUES.includes(row[column])) at(column, `must be one of ${CHECK_VALUES.map((v) => v || '(blank)').join(', ')}`);
    if (!DECISION_VALUES.includes(row.review_decision)) at('review_decision', `must be one of ${DECISION_VALUES.map((v) => v || '(blank)').join(', ')}`);
    if (['APPROVE', 'APPROVE_WITH_EDITS'].includes(row.review_decision) && !(row.reviewer_name.trim() && REVIEW_CHECK_COLUMNS.every((c) => row[c] === 'PASS'))) at('review_decision', 'an approval needs a reviewer name and PASS in all four checks');
  }
  problems.push(...checkReviewHonesty(pack, records));
  return { ok: !problems.some((p) => p.severity !== 'info'), problems, rows: records.length };
}

export function checkEvaluationTemplate(dataset, csvText) {
  const problems = [];
  let parsed; try { parsed = parseCsv(csvText); } catch (error) { return { ok: false, problems: [{ scope: 'evaluation-template', message: `unreadable CSV: ${error.message}` }] }; }
  const need = ['case_id', 'item_id', 'language', 'category', 'option_id', 'explanation', 'team_reference_label', 'team_reference_misconception_id', 'reviewer_agrees', 'reviewer_label', 'reviewer_misconception_id', 'reviewer_notes', 'reviewer_name', 'review_date'];
  const missing = need.filter((c) => !parsed.header.includes(c));
  if (missing.length) problems.push({ scope: 'evaluation-template', message: `missing columns: ${missing.join(', ')}` });
  const filled = parsed.records.filter((r) => r.case_id);
  for (const c of dataset.cases) {
    const row = filled.find((r) => r.case_id === c.id);
    if (!row) { problems.push({ scope: 'evaluation-template', itemId: c.itemId, message: `no row for case ${c.id}` }); continue; }
    for (const [field, expected] of [['item_id', c.itemId], ['language', c.language], ['category', c.category], ['option_id', c.optionId], ['explanation', c.explanation], ['team_reference_label', c.reference.label], ['team_reference_misconception_id', c.reference.misconceptionId ?? '']]) if (row[field] !== expected) problems.push({ scope: 'evaluation-template', message: `${c.id}: ${field} does not match evaluation/cases.json` });
  }
  for (const row of filled) if (!dataset.cases.some((c) => c.id === row.case_id)) problems.push({ scope: 'evaluation-template', message: `row ${row.case_id} is not in evaluation/cases.json` });
  for (const row of parsed.records) {
    if (row.reviewer_name || row.review_date || row.reviewer_agrees || row.reviewer_label) problems.push({ scope: 'evaluation-template', message: `${row.case_id || '(blank row)'}: reviewer fields must be empty in the shipped template` });
    if (!row.case_id && row.explanation) problems.push({ scope: 'evaluation-template', message: 'a blank template row must not contain an explanation: only a qualified reviewer may author Odia examples' });
  }
  const blanks = parsed.records.filter((r) => !r.case_id);
  for (const language of ['odia_script', 'roman_odia']) for (const category of ['correct_reasoning', 'genuine_misconception', 'ambiguous', 'insufficient_information']) if (!blanks.some((r) => r.language === language && r.category === category)) problems.push({ scope: 'evaluation-template', message: `no blank row for ${language} / ${category}` });
  return { ok: problems.length === 0, problems, filledRows: filled.length, blankRows: blanks.length };
}
