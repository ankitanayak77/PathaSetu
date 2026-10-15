// Mutation-run planning and judging (Iteration 12). Pure helpers plus one function that runs a selection of tests with Node's
// built-in runner. Nothing here touches the network, a browser or the shipped source.
//
// Rules this module enforces for `npm run mutation`:
//   * the reporter is forced to TAP, because the default reporter on a non-TTY changed from tap to spec in Node 23 and the
//     summary lines this module reads would silently vanish on a newer Node;
//   * a mutant is KILLED only if the unmutated selected tests pass, at least one of them really executed (skipped and
//     unmatched tests do not count), the mutated run executed the same number of tests, and at least one failed;
//   * everything that is neither a plain kill nor a plain survivor (nothing executed, baseline failing, file that cannot load,
//     timeout, cancelled tests, missing or non-TAP output) is ERROR, never KILLED.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function parseTap(text) {
  const source = String(text ?? '');
  const num = (label) => { const match = source.match(new RegExp(`^# ${label} (\\d+)[ \\t]*$`, 'm')); return match ? Number(match[1]) : null; };
  const tests = num('tests'); const pass = num('pass'); const fail = num('fail');
  if (tests === null || pass === null || fail === null) return null;
  return { tests, pass, fail, cancelled: num('cancelled') ?? 0, skipped: num('skipped') ?? 0, todo: num('todo') ?? 0, executed: pass + fail };
}

export function validatePlans(mutants, plans, groups, { rootDir = null } = {}) {
  const problems = [];
  const known = new Set(mutants.map((mutant) => mutant.id));
  for (const [name, group] of Object.entries(groups)) {
    if (!group || typeof group.file !== 'string' || !group.file) { problems.push(`group "${name}" has no file`); continue; }
    if (group.pattern !== null && typeof group.pattern !== 'string') problems.push(`group "${name}" has an invalid pattern`);
    else if (typeof group.pattern === 'string') { try { new RegExp(group.pattern); } catch { problems.push(`group "${name}" has an invalid pattern: ${group.pattern}`); } }
    if (rootDir && !fs.existsSync(path.join(rootDir, group.file))) problems.push(`group "${name}" file ${group.file} does not exist`);
  }
  for (const mutant of mutants) {
    const plan = plans[mutant.id];
    if (plan === undefined) { problems.push(`no test plan for mutant ${mutant.id}`); continue; }
    if (!Array.isArray(plan) || plan.length === 0) { problems.push(`empty test plan for mutant ${mutant.id}`); continue; }
    const seen = new Set();
    for (const name of plan) {
      if (!(name in groups)) problems.push(`mutant ${mutant.id}: unknown test group "${name}"`);
      if (seen.has(name)) problems.push(`mutant ${mutant.id} lists group "${name}" twice`);
      seen.add(name);
    }
  }
  for (const id of Object.keys(plans)) if (!known.has(id)) problems.push(`plan for unknown mutant ${id}`);
  if (problems.length) throw new Error(`invalid mutation plan: ${problems.join('; ')}`);
}

export function selectionsFor(groupNames, groups) {
  const byFile = new Map();
  for (const name of groupNames) {
    const { file, pattern } = groups[name];
    if (!byFile.has(file)) byFile.set(file, { file, patterns: [], whole: false });
    const entry = byFile.get(file);
    if (pattern === null) entry.whole = true; else entry.patterns.push(pattern);
  }
  return [...byFile.values()].map(({ file, patterns, whole }) => ({ file, pattern: whole || patterns.length === 0 ? null : patterns.length === 1 ? patterns[0] : patterns.map((p) => `(?:${p})`).join('|') }));
}

export function runSelection({ cwd, selection, timeoutMs = 60_000, nodePath = process.execPath }) {
  const started = Date.now();
  const args = ['--test', '--test-reporter=tap', ...(selection.pattern ? ['--test-name-pattern', selection.pattern] : []), selection.file];
  // A parent `node --test` sets NODE_TEST_CONTEXT; a child runner that inherits it behaves like a test file, not a runner.
  const env = { ...process.env, NODE_OPTIONS: '' };
  delete env.NODE_TEST_CONTEXT;
  const run = spawnSync(nodePath, args, { cwd, encoding: 'utf8', timeout: timeoutMs, env });
  const text = `${run.stdout ?? ''}${run.stderr ?? ''}`;
  const tap = parseTap(text);
  // Count top-level test lines ourselves. The runner also prints one line for the test FILE: when a pattern matches nothing that
  // line is a passing "test" (so `# tests 1` hides that nothing ran), and when the file cannot load it is a failing one. Neither is
  // a real test. Skipped and todo tests are listed but did not execute. Test files must be flat (top-level tests only).
  const sameFile = (name) => path.resolve(cwd, name) === path.resolve(cwd, selection.file);
  let passed = 0; let failed = 0; let skipped = 0; let todo = 0; let fileFailed = false;
  const failing = [];
  for (const match of text.matchAll(/^(not ok|ok) \d+ - (.+)$/gm)) {
    const ok = match[1] === 'ok';
    const directive = match[2].match(/ # (SKIP|TODO)\b.*$/i);
    const name = directive ? match[2].slice(0, directive.index) : match[2];
    if (sameFile(name)) { if (!ok) fileFailed = true; continue; }
    if (directive) { if (directive[1].toUpperCase() === 'SKIP') skipped += 1; else todo += 1; continue; }
    if (ok) passed += 1; else { failed += 1; failing.push(name); }
  }
  const timedOut = run.error?.code === 'ETIMEDOUT';
  return { parsed: tap !== null, tests: tap?.tests ?? 0, pass: passed, fail: failed, cancelled: tap?.cancelled ?? 0, skipped, todo, executed: passed + failed, fileFailed, exitCode: run.status, signal: run.signal ?? null, timedOut, failing, durationMs: Date.now() - started };
}

export function combineRuns(runs) {
  const sum = (key) => runs.reduce((total, run) => total + run[key], 0);
  const exitCodes = runs.map((run) => run.exitCode);
  return {
    parsed: runs.length > 0 && runs.every((run) => run.parsed), tests: sum('tests'), pass: sum('pass'), fail: sum('fail'), cancelled: sum('cancelled'), skipped: sum('skipped'), todo: sum('todo'), executed: sum('executed'), fileFailed: runs.some((run) => run.fileFailed),
    exitCode: exitCodes.some((code) => code === null) ? null : (exitCodes.find((code) => code !== 0) ?? 0), signal: runs.map((run) => run.signal).find(Boolean) ?? null, timedOut: runs.some((run) => run.timedOut),
    failing: runs.flatMap((run) => run.failing), durationMs: sum('durationMs')
  };
}

export function judge({ baseline, mutated }) {
  if (!baseline) return { status: 'ERROR', detail: 'no unmutated run was recorded for this plan' };
  if (!baseline.parsed) return { status: 'ERROR', detail: 'the unmutated run produced no TAP summary' };
  if (baseline.timedOut || baseline.signal || baseline.exitCode !== 0 || baseline.fail > 0 || baseline.cancelled > 0 || baseline.fileFailed) return { status: 'ERROR', detail: `the unmutated tests do not pass (exit ${baseline.exitCode}, ${baseline.fail} failed, ${baseline.cancelled} cancelled)` };
  if (baseline.executed === 0) return { status: 'ERROR', detail: `no test executed in the unmutated run (${baseline.skipped} skipped, ${baseline.todo} todo); the plan selects nothing` };
  if (!mutated) return { status: 'ERROR', detail: 'the mutated run was not recorded' };
  if (mutated.timedOut || mutated.signal) return { status: 'ERROR', detail: `the mutated run did not finish (${mutated.timedOut ? 'timed out' : `signal ${mutated.signal}`}); a hang is reported, not counted as a kill` };
  if (!mutated.parsed) return { status: 'ERROR', detail: 'the mutated run produced no TAP summary' };
  if (mutated.cancelled > 0) return { status: 'ERROR', detail: `${mutated.cancelled} test(s) were cancelled in the mutated run` };
  if (mutated.executed !== baseline.executed) return { status: 'ERROR', detail: `the mutated run executed ${mutated.executed} test(s) but the unmutated run executed ${baseline.executed}; a file that cannot load or a changed test set is not a kill${mutated.fileFailed ? ' (the test file itself failed to run)' : ''}` };
  if (mutated.fail === 0 && mutated.exitCode === 0) return { status: 'SURVIVED', detail: `all ${mutated.executed} selected test(s) passed against the mutant` };
  if (mutated.fail > 0 && mutated.exitCode !== 0) return { status: 'KILLED', detail: `${mutated.fail} of ${mutated.executed} selected test(s) failed` };
  return { status: 'ERROR', detail: `inconsistent result (exit ${mutated.exitCode}, ${mutated.fail} failed)` };
}
