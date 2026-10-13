// Writes evaluation/EVALUATION_REVIEW_TEMPLATE.csv from evaluation/cases.json.
// English rows carry the team's (unvalidated) reference label for a reviewer to confirm or correct.
// Odia-script and Roman-Odia rows are BLANK on purpose: only a qualified reviewer may author or approve them.
// Reviewer fields are always written empty. Nothing here fabricates a review.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { toCsv } from './lib/csv.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataset = JSON.parse(fs.readFileSync(path.join(ROOT, 'evaluation/cases.json'), 'utf8'));
export const HEADER = ['case_id', 'item_id', 'language', 'category', 'option_id', 'explanation', 'team_reference_label', 'team_reference_misconception_id', 'reviewer_agrees', 'reviewer_label', 'reviewer_misconception_id', 'reviewer_notes', 'reviewer_name', 'review_date'];
const empty = Object.fromEntries(HEADER.map((c) => [c, '']));
const rows = dataset.cases.map((c) => ({ ...empty, case_id: c.id, item_id: c.itemId, language: c.language, category: c.category, option_id: c.optionId, explanation: c.explanation, team_reference_label: c.reference.label, team_reference_misconception_id: c.reference.misconceptionId ?? '' }));
for (const language of ['odia_script', 'roman_odia']) for (const category of ['correct_reasoning', 'genuine_misconception', 'ambiguous', 'insufficient_information']) for (let n = 0; n < 3; n++) rows.push({ ...empty, language, category });
const out = path.join(ROOT, 'evaluation/EVALUATION_REVIEW_TEMPLATE.csv');
fs.writeFileSync(out, toCsv(HEADER, rows), 'utf8');
console.log(`wrote ${path.relative(ROOT, out)}: ${dataset.cases.length} English rows to confirm, ${rows.length - dataset.cases.length} blank rows for reviewer-authored Odia script / Roman Odia cases`);
