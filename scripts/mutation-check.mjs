// npm run mutation [-- --out <dir>] [--only A1,B2] [--full] [--tests tests/a.test.js,tests/b.test.js] [--budget-seconds N] [--overwrite] [--list] [--dry-run]
// Applies each deliberate fault from scripts/lib/mutants.mjs to a TEMPORARY copy of src/core and runs the tests chosen for that
// fault. The project tree is never modified except for the report files written under --out. No network, no browser, no dependency.
//
// Modes (recorded in the report):
//   plan        (default) each mutant runs only the test groups listed for its behaviour (MUTANT_PLANS in scripts/lib/mutants.mjs)
//   full-suite  --full: every mutant runs both invariant test files completely; used to show the plans lose no kill
//   custom      --tests a,b: every mutant runs exactly those files, for example older unit tests, to show what newer tests add
// A mutant is KILLED only if the unmutated selected tests pass, at least one executed, the mutated run executed the same number of
// tests and at least one failed; anything irregular is ERROR (see scripts/lib/mutation-plan.mjs). A run that exhausts
// --budget-seconds (default 600) stops, marks the rest NOT_RUN, writes INCOMPLETE and exits 3: it never reports a score.
// The report is rewritten after every mutant, so an externally killed run leaves an IN_PROGRESS file instead of nothing.
// An existing mutation-results.json in --out is never replaced unless --overwrite is given, so earlier evidence cannot be clobbered.
// Exit codes: 0 every selected mutant killed; 1 a survivor, an error, a failed baseline or a bad request; 3 INCOMPLETE.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MUTANTS, applyEdits, TEST_GROUPS, MUTANT_PLANS, FULL_SUITE_FILES } from './lib/mutants.mjs';
import { validatePlans, selectionsFor, runSelection, combineRuns, judge } from './lib/mutation-plan.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (name, fallback) => { const index = args.indexOf(name); return index > -1 ? args[index + 1] ?? fallback : fallback; };
const outDir = path.resolve(ROOT, arg('--out', 'evidence/iteration12/mutation'));
const onlyText = arg('--only', '');
const only = onlyText ? new Set(onlyText.split(',').map((id) => id.trim()).filter(Boolean)) : null;
const customFiles = arg('--tests', '').split(',').map((file) => file.trim()).filter(Boolean);
const mode = customFiles.length ? 'custom' : args.includes('--full') ? 'full-suite' : 'plan';
const budgetSeconds = Number(arg('--budget-seconds', '600'));
const CORE = path.join(ROOT, 'src/core');

if (!(budgetSeconds > 0)) { console.error('--budget-seconds must be a positive number'); process.exit(1); }
if (only) {
  const known = new Set(MUTANTS.map((mutant) => mutant.id));
  const unknown = [...only].filter((id) => !known.has(id));
  if (unknown.length) { console.error(`unknown mutant id: ${unknown.join(', ')}`); process.exit(1); }
}
if (!args.includes('--list') && !args.includes('--dry-run') && !args.includes('--overwrite') && fs.existsSync(path.join(outDir, 'mutation-results.json'))) {
  console.error(`${path.relative(ROOT, outDir) || outDir} already contains mutation-results.json; choose another --out or pass --overwrite to replace it on purpose`);
  process.exit(1);
}
try { validatePlans(MUTANTS, MUTANT_PLANS, TEST_GROUPS, { rootDir: ROOT }); } catch (error) { console.error(error.message); process.exit(1); }

const planFor = (mutant) => {
  if (mode === 'plan') return { groups: MUTANT_PLANS[mutant.id], selections: selectionsFor(MUTANT_PLANS[mutant.id], TEST_GROUPS) };
  const files = mode === 'full-suite' ? FULL_SUITE_FILES : customFiles;
  return { groups: [mode === 'full-suite' ? 'all' : 'custom'], selections: files.map((file) => ({ file, pattern: null })) };
};
const selected = MUTANTS.filter((mutant) => !only || only.has(mutant.id));

if (args.includes('--list')) {
  for (const mutant of MUTANTS) console.log(`${mutant.id}\t${mutant.required ?? '-'}\t${MUTANT_PLANS[mutant.id].join('+')}\t${mutant.description}`);
  process.exit(0);
}
if (args.includes('--dry-run')) {
  console.log(JSON.stringify({ catalogueSize: MUTANTS.length, mode, outDir, budgetSeconds, mutants: selected.map((mutant) => ({ id: mutant.id, ...planFor(mutant) })) }, null, 2));
  process.exit(0);
}

const pristine = Object.fromEntries(fs.readdirSync(CORE).filter((name) => name.endsWith('.js')).map((name) => [name, fs.readFileSync(path.join(CORE, name), 'utf8')]));
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'pathasetu-mutation-'));
const startedAt = Date.now();
const key = (selection) => `${selection.file}\u0000${selection.pattern ?? ''}`;
const results = [];
let state = 'IN_PROGRESS';
let harnessOk = true;

function stageCore(files) {
  fs.rmSync(path.join(scratch, 'src'), { recursive: true, force: true });
  fs.mkdirSync(path.join(scratch, 'src/core'), { recursive: true });
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(scratch, 'src/core', name), text);
}
function stageOnce() {
  fs.mkdirSync(path.join(scratch, 'content'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'package.json'), path.join(scratch, 'package.json'));
  fs.copyFileSync(path.join(ROOT, 'content/electricity-pack.json'), path.join(scratch, 'content/electricity-pack.json'));
  for (const file of new Set(selected.flatMap((mutant) => planFor(mutant).selections.map((s) => s.file)))) {
    fs.mkdirSync(path.dirname(path.join(scratch, file)), { recursive: true });
    fs.copyFileSync(path.join(ROOT, file), path.join(scratch, file));
  }
}
const brief = (run) => ({ executed: run.executed, passed: run.pass, failed: run.fail, skipped: run.skipped, exitCode: run.exitCode });

function report() {
  const count = (status) => results.filter((row) => row.status === status).length;
  const summary = { selected: selected.length, run: results.filter((row) => row.status !== 'NOT_RUN').length, killed: count('KILLED'), survived: count('SURVIVED'), errors: count('ERROR'), notRun: count('NOT_RUN') };
  const complete = state === 'FINISHED' && !only && summary.run === MUTANTS.length && summary.killed + summary.survived + summary.errors === MUTANTS.length;
  const requiredFamilies = ['a', 'b', 'c'].map((family) => ({ family, mutants: selected.filter((m) => m.required === family).length, killed: results.filter((r) => r.required === family && r.status === 'KILLED').length }));
  return { summary, complete, requiredFamilies, json: { node: process.version, mode, reporter: 'tap', catalogueSize: MUTANTS.length, state, complete, elapsedMs: Date.now() - startedAt, budgetSeconds,
    note: 'Mutants are applied to a temporary copy of src/core only. A killed mutant means the selected tests failed against the deliberate fault. This is evidence about test sensitivity, not about learning outcomes or model accuracy.', summary, requiredFamilies, results } };
}
function write() {
  const { summary, complete, requiredFamilies, json } = report();
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'mutation-results.json'), `${JSON.stringify(json, null, 2)}\n`);
  const headline = state === 'IN_PROGRESS' ? `IN PROGRESS (this file is rewritten after every mutant; if the run was stopped, no score exists): ${summary.run} of ${selected.length} done.`
    : state === 'INCOMPLETE' ? `INCOMPLETE: the ${budgetSeconds} s time budget ran out after ${summary.run} of ${selected.length} mutants. ${summary.notRun} mutant(s) are NOT_RUN. No mutation score is claimed.`
    : complete ? `Complete run: ${summary.run} of ${MUTANTS.length} mutants; killed ${summary.killed}; survived ${summary.survived}; errors ${summary.errors}.`
    : `PARTIAL RUN: ${selected.length} of ${MUTANTS.length} mutants selected with --only. This is not a mutation score. Killed ${summary.killed}; survived ${summary.survived}; errors ${summary.errors}.`;
  const lines = ['# Mutation results', '', `Node ${process.version}. Mode: \`${mode}\`. Reporter: TAP (forced). Elapsed: ${((Date.now() - startedAt) / 1000).toFixed(1)} s. Catalogue: ${MUTANTS.length} mutants. Mutants are applied to a temporary copy of \`src/core\`; the project tree is not modified.`, '', headline, '',
    '| ID | Family | Test groups | Tests executed (unmutated / mutated) | Result | ms | First failing test |', '|---|---|---|---|---|---|---|',
    ...results.map((r) => `| ${r.id} | ${r.required ?? ''} | ${r.groups.join(' + ')} | ${r.baseline ? `${r.baseline.executed} / ${r.mutated ? r.mutated.executed : '-'}` : '-'} | ${r.status} | ${r.durationMs} | ${r.failingTests[0] ? r.failingTests[0].replace(/\|/g, '/').slice(0, 90) : ''} |`),
    '', requiredFamilies.map((f) => `family ${f.family}: ${f.killed}/${f.mutants} killed`).join('; '), '', 'Families: a = retry timing or limit; b = queue drained on provider error; c = validator accepts a foreign misconception id or confirms uncertainty.', ''];
  fs.writeFileSync(path.join(outDir, 'mutation-results.md'), lines.join('\n'));
}

try {
  stageOnce();
  stageCore(pristine);
  const baselines = new Map();
  for (const mutant of selected) for (const selection of planFor(mutant).selections) {
    if (!baselines.has(key(selection))) baselines.set(key(selection), runSelection({ cwd: scratch, selection }));
  }
  const bad = [...baselines.entries()].filter(([, run]) => judge({ baseline: run, mutated: run }).status === 'ERROR' && (run.exitCode !== 0 || run.executed === 0 || !run.parsed));
  console.log(`unmutated selections: ${baselines.size}; executed ${[...baselines.values()].reduce((n, r) => n + r.executed, 0)} test(s); failing or empty: ${bad.length}`);
  for (const [k] of bad) console.error(`unmutated baseline problem: ${k.replace('\u0000', ' [pattern: ')}${k.endsWith('\u0000') ? ' whole file' : ''}]`);
  for (const mutant of selected) {
    const plan = planFor(mutant);
    if (Date.now() - startedAt > budgetSeconds * 1000) {
      results.push({ id: mutant.id, required: mutant.required, description: mutant.description, groups: plan.groups, selections: plan.selections, status: 'NOT_RUN', detail: 'time budget exhausted before this mutant ran', baseline: null, mutated: null, exitCode: null, durationMs: 0, failingTests: [] });
      continue;
    }
    const started = Date.now();
    let row;
    try {
      stageCore(applyEdits(pristine, mutant.edits));
      const baseline = combineRuns(plan.selections.map((selection) => baselines.get(key(selection))));
      const mutated = combineRuns(plan.selections.map((selection) => runSelection({ cwd: scratch, selection })));
      const verdict = judge({ baseline, mutated });
      row = { id: mutant.id, required: mutant.required, description: mutant.description, groups: plan.groups, selections: plan.selections, status: verdict.status, detail: verdict.detail, baseline: brief(baseline), mutated: brief(mutated), exitCode: mutated.exitCode, durationMs: Date.now() - started, failingTests: mutated.failing.slice(0, 6) };
    } catch (error) {
      row = { id: mutant.id, required: mutant.required, description: mutant.description, groups: plan.groups, selections: plan.selections, status: 'ERROR', detail: String(error.message), baseline: null, mutated: null, exitCode: null, durationMs: Date.now() - started, failingTests: [] };
    }
    results.push(row);
    console.log(`${row.id.padEnd(4)} ${row.status.padEnd(8)} ${row.required ? `(${row.required}) ` : '    '}${row.description} — ${row.detail} [${row.durationMs} ms]`);
    write();
  }
  if (results.some((row) => row.status === 'NOT_RUN')) state = 'INCOMPLETE'; else state = 'FINISHED';
} catch (error) {
  harnessOk = false; state = 'INCOMPLETE'; console.error(`harness failure: ${error.stack ?? error}`);
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

write();
const { summary, complete, requiredFamilies } = report();
console.log(`\nmode ${mode}; ${state}${complete ? ' (complete catalogue)' : only ? ' (partial: --only)' : ''}; elapsed ${((Date.now() - startedAt) / 1000).toFixed(1)} s`);
console.log(`mutants: ${summary.selected} selected; run ${summary.run}; killed ${summary.killed}; survived ${summary.survived}; errors ${summary.errors}; not run ${summary.notRun}`);
console.log(requiredFamilies.map((f) => `family ${f.family}: ${f.killed}/${f.mutants} killed`).join('; '));
console.log(`written: ${path.relative(ROOT, path.join(outDir, 'mutation-results'))}.json and .md`);
if (state === 'INCOMPLETE') process.exit(harnessOk ? 3 : 1);
process.exit(harnessOk && summary.run > 0 && summary.survived === 0 && summary.errors === 0 ? 0 : 1);
