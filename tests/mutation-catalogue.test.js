// Keeps the mutation catalogue honest: every deliberate fault must still apply to the current source (exactly one match), must
// actually change the text, and the three families required by Iteration 10 must be present. The slow part (running the mutants
// against the invariant tests) is `npm run mutation`; this file only checks the catalogue so it cannot rot unnoticed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MUTANTS, applyEdits } from '../scripts/lib/mutants.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const core = Object.fromEntries(fs.readdirSync(path.join(ROOT, 'src/core')).filter((name) => name.endsWith('.js')).map((name) => [name, fs.readFileSync(path.join(ROOT, 'src/core', name), 'utf8')]));

test('mutant ids are unique and every mutant has a description and at least one edit', () => {
  const ids = MUTANTS.map((mutant) => mutant.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const mutant of MUTANTS) { assert.ok(mutant.description.length > 15, mutant.id); assert.ok(mutant.edits.length >= 1, mutant.id); }
});

test('every mutant applies to the current source exactly once per edit and changes it', () => {
  for (const mutant of MUTANTS) {
    const mutated = applyEdits(core, mutant.edits);
    const touched = new Set(mutant.edits.map((e) => e.file));
    for (const file of touched) assert.notEqual(mutated[file], core[file], `${mutant.id}: ${file} must change`);
    for (const file of Object.keys(core)) if (!touched.has(file)) assert.equal(mutated[file], core[file], `${mutant.id}: ${file} must not change`);
  }
});

test('the three required families (retry timing/limit, drain on error, validator foreign id / confirmed uncertainty) each have mutants', () => {
  for (const family of ['a', 'b', 'c']) assert.ok(MUTANTS.filter((mutant) => mutant.required === family).length >= 3, `family ${family}`);
  assert.ok(MUTANTS.some((mutant) => mutant.required === 'c' && /different question/.test(mutant.description)), 'a foreign misconception id mutant');
  assert.ok(MUTANTS.some((mutant) => mutant.required === 'c' && /confirms it/.test(mutant.description)), 'an uncertainty-confirmed mutant');
});

test('applying an edit whose text is missing or ambiguous is an error, not a silent no-op', () => {
  assert.throws(() => applyEdits(core, [{ file: 'validator.js', find: 'text that is not there', replace: 'x' }]), /exactly once/);
  assert.throws(() => applyEdits(core, [{ file: 'validator.js', find: 'reject(', replace: 'x' }]), /exactly once/);
  assert.throws(() => applyEdits(core, [{ file: 'missing.js', find: 'a', replace: 'b' }]), /not in the copied source/);
});

test('the shipped source files are not touched by importing or applying mutants', () => {
  const before = fs.readFileSync(path.join(ROOT, 'src/core/validator.js'), 'utf8');
  applyEdits(core, MUTANTS[0].edits);
  assert.equal(fs.readFileSync(path.join(ROOT, 'src/core/validator.js'), 'utf8'), before);
});


test('Iteration 11 includes a mutant for malformed retry timestamps mutating state before validation', () => {
  const mutant = MUTANTS.find((candidate) => candidate.id === 'G1');
  assert.ok(mutant, 'G1 must remain in the catalogue');
  assert.match(mutant.description, /malformed clock/i);
  assert.ok(mutant.edits.some((entry) => entry.file === 'retry.js' && entry.find.includes('parseRetryTimestamp')));
});
