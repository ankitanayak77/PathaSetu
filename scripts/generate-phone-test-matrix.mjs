// Writes docs/PHONE_TEST_RESULTS_TEMPLATE.csv from the numbered steps in docs/PHONE_TEST_PLAN.md.
// Every row is NOT TESTED and every tester/evidence cell is empty. Nothing here can mark a phone as tested.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { toCsv } from './lib/csv.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const COMBINATIONS = [
  ['Samsung Galaxy S23', 'Chrome'], ['Samsung Galaxy S23', 'Samsung Internet'],
  ['Samsung Galaxy S25', 'Chrome'], ['Samsung Galaxy S25', 'Samsung Internet'],
  ['Samsung Galaxy S25 FE', 'Chrome'], ['Samsung Galaxy S25 FE', 'Samsung Internet'],
  ['iPhone 16', 'Safari']
];
export const MANDATORY_STEPS = [1, 3, 4, 5, 6, 7, 8, 9, 14, 18];
export const HEADER = ['device', 'browser', 'step', 'step_title', 'mandatory', 'result', 'tester', 'date_ist', 'os_version', 'browser_version', 'https', 'network', 'evidence_ref', 'notes'];

const shorten = (text) => (text.length <= 110 ? text : `${text.slice(0, text.lastIndexOf(' ', 107))}…`);

export function readSteps(markdown) {
  const section = markdown.slice(markdown.indexOf('-step protocol'), markdown.indexOf('## HTTPS access'));
  return [...section.matchAll(/^(\d+)\. (.+)$/gm)].map((m) => ({ number: Number(m[1]), title: shorten(m[2].split(/(?<=[.:])\s/)[0].replace(/[.:]$/, '')) }));
}

export function buildRows(steps) {
  const rows = [];
  for (const [device, browser] of COMBINATIONS) for (const step of steps) rows.push({ device, browser, step: step.number, step_title: step.title, mandatory: MANDATORY_STEPS.includes(step.number) ? 'yes' : 'no', result: 'NOT TESTED', tester: '', date_ist: '', os_version: '', browser_version: '', https: '', network: '', evidence_ref: '', notes: '' });
  return rows;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const steps = readSteps(fs.readFileSync(path.join(ROOT, 'docs/PHONE_TEST_PLAN.md'), 'utf8'));
  const rows = buildRows(steps);
  fs.writeFileSync(path.join(ROOT, 'docs/PHONE_TEST_RESULTS_TEMPLATE.csv'), toCsv(HEADER, rows), 'utf8');
  console.log(`wrote docs/PHONE_TEST_RESULTS_TEMPLATE.csv: ${COMBINATIONS.length} device/browser combinations x ${steps.length} steps = ${rows.length} rows, all NOT TESTED`);
}
