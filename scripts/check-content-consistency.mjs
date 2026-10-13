// Deterministic consistency check: JSON pack <-> review worksheet <-> evaluation dataset and template.
// Exit codes: 0 consistent, 1 problems found. It never marks anything reviewed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkPackIntegrity, checkWorksheet, checkEvaluationTemplate } from './lib/content-consistency.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const pack = JSON.parse(read('content/electricity-pack.json'));
const dataset = JSON.parse(read('evaluation/cases.json'));
const integrity = checkPackIntegrity(pack);
const worksheet = checkWorksheet(pack, read('docs/CONTENT_REVIEW_WORKSHEET.csv'));
const template = fs.existsSync(path.join(ROOT, 'evaluation/EVALUATION_REVIEW_TEMPLATE.csv')) ? checkEvaluationTemplate(dataset, read('evaluation/EVALUATION_REVIEW_TEMPLATE.csv'), pack) : { ok: false, problems: [{ scope: 'evaluation-template', message: 'evaluation/EVALUATION_REVIEW_TEMPLATE.csv is missing' }] };
const problems = [...integrity, ...worksheet.problems, ...template.problems];
const errors = problems.filter((p) => p.severity !== 'info');
const statuses = pack.items.reduce((m, i) => ({ ...m, [i.status]: (m[i.status] ?? 0) + 1 }), {});
const summary = { items: pack.items.length, worksheetRows: worksheet.rows, itemStatuses: statuses, evaluationCases: dataset.cases.length, templateRows: template.filledRows, templateBlankRows: template.blankRows, templateReviewerAuthoredRows: template.authoredRows, problems: errors.length, notes: problems.length - errors.length };
console.log(JSON.stringify(summary));
for (const p of problems) console.log(`${p.severity === 'info' ? 'NOTE' : 'PROBLEM'} [${p.scope}] ${p.itemId ?? ''}${p.field ? `.${p.field}` : ''}: ${p.message}`);
console.log(errors.length ? `FAIL: ${errors.length} consistency problem(s).` : 'OK: pack, worksheet and evaluation files are consistent. Every item is still ' + Object.keys(statuses).join('/') + ' until a qualified reviewer approves it.');
process.exit(errors.length ? 1 : 0);
