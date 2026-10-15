import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPPORTED_CLASSES,
  subjectsForClass,
  chaptersForClassAndSubject,
  defaultFamilyAccount,
  normalizeFamilyAccount,
  computeStoplightConcepts,
  buildAgentStepStrip,
  gradeMultiFormatExercise,
  computeBloomAndCriAnalytics
} from '../src/core/profiles.js';

test('supports Classes 1 through 10 with age-appropriate subject bands', () => {
  assert.deepEqual(SUPPORTED_CLASSES, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.ok(subjectsForClass(1).some((s) => s.includes('Joyful EVS')));
  assert.ok(subjectsForClass(5).some((s) => s.includes('Environmental Studies')));
  assert.ok(subjectsForClass(7).some((s) => s.includes('General Science')));
  assert.ok(subjectsForClass(10).some((s) => s.includes('Physical Science')));
});

test('parent account holds multiple child profiles (Child A Class 6, Child B Class 10) and switches cleanly', () => {
  const account = defaultFamilyAccount();
  assert.equal(account.accountRole, 'parent');
  assert.equal(account.profiles.length, 2);
  const repaired = normalizeFamilyAccount({
    ...account,
    activeProfileId: 'prof_child_a'
  });
  assert.equal(repaired.activeProfileId, 'prof_child_a');
  const active = repaired.profiles.find((p) => p.id === repaired.activeProfileId);
  assert.equal(active.classLevel, 6);
});

test('stoplight concept runner classifies red misconceptions, yellow unpractised/uncertain, and green provisional evidence', () => {
  const pack = {
    concepts: [
      { id: 'c1', title: 'Closed Circuits', odiaTitle: 'ବନ୍ଦ ପରିପଥ' },
      { id: 'c2', title: 'Ohms Law', odiaTitle: 'ଓମ୍‌ଙ୍କ ନିୟମ' },
      { id: 'c3', title: 'Series Circuits', odiaTitle: 'ଶ୍ରେଣୀ ସଂଯୋଗ' }
    ],
    items: [
      { id: 'EL01', conceptId: 'c1' },
      { id: 'EL05', conceptId: 'c2' },
      { id: 'EL07', conceptId: 'c3' }
    ]
  };
  const learner = {
    answers: [
      { itemId: 'EL01', correctOption: false, diagnosis: { type: 'MISCONCEPTION', misconceptionId: 'CURRENT_ACCUMULATES' } },
      { itemId: 'EL05', correctOption: true, diagnosis: { type: 'NONE', source: 'RECHECKED_GEMINI' } }
    ]
  };
  const lights = computeStoplightConcepts(pack, learner);
  assert.equal(lights.find((l) => l.conceptId === 'c1').light, 'red');
  assert.equal(lights.find((l) => l.conceptId === 'c2').light, 'green');
  assert.equal(lights.find((l) => l.conceptId === 'c3').light, 'yellow');
});

test('agent step strip reports all 4 orchestration steps clearly', () => {
  const steps = buildAgentStepStrip({ answers: [], recheckQueue: [] }, true);
  assert.equal(steps.length, 4);
  assert.match(steps[0].step, /check_answer/);
  assert.match(steps[1].step, /diagnose_reasoning/);
  assert.match(steps[2].step, /explain_in_odia/);
  assert.match(steps[3].step, /choose_next/);
});

test('multi-format evaluator grades Fill-in-Blank, Objective Numeric, and Match deterministically with zero LLM tokens', () => {
  const numOk = gradeMultiFormatExercise('FMT_NUM_01', '0.4');
  assert.equal(numOk.correct, true);
  assert.equal(numOk.zeroTokensUsed, true);

  const numInverted = gradeMultiFormatExercise('FMT_NUM_01', '2.5');
  assert.equal(numInverted.correct, false);
  assert.equal(numInverted.misconceptionId, 'DIVIDES_RESISTANCE_BY_VOLTAGE');

  const fillOdia = gradeMultiFormatExercise('FMT_FILL_01', 'ବନ୍ଦ');
  assert.equal(fillOdia.correct, true);
});

test('thinking-goal and CRI analytics count only tagged questions and keep unknown questions unclassified', () => {
  const learner = {
    answers: [
      { id: 'a1', itemId: 'EL01', correctOption: false, diagnosis: { type: 'MISCONCEPTION' } },
      { id: 'a2', itemId: 'EL05', correctOption: true, diagnosis: { type: 'NONE' } },
      { id: 'a3', itemId: 'CH6-DRAFT-01', correctOption: false, diagnosis: { type: 'UNCERTAIN' } }
    ]
  };
  const stats = computeBloomAndCriAnalytics(learner, { a1: 'sure', a2: 'guessing' });
  assert.equal(stats.criSummary.overconfidentMisconception, 1);
  assert.equal(stats.criSummary.luckyGuess, 1);
  assert.equal(stats.bloomSummary.UNDERSTAND.total, 1);
  assert.equal(stats.bloomSummary.APPLY.correct, 1);
  assert.equal(stats.bloomSummary.UNCLASSIFIED.total, 1);
  assert.equal(stats.bloomSummary.UNCLASSIFIED.correct, 0);
});

test('every class and subject returns distinct chapters and never repeats chapters across subjects', () => {
  for (const cls of SUPPORTED_CLASSES) {
    const subs = subjectsForClass(cls);
    const seenFirstChapterIds = new Set();
    for (const sub of subs) {
      const chs = chaptersForClassAndSubject(cls, sub, 'BSE_ODISHA');
      assert.ok(chs.length >= 4, `Class ${cls} ${sub} should have at least 4 chapters`);
      assert.ok(!seenFirstChapterIds.has(chs[0].id), `Class ${cls} ${sub} must not share chapters with another subject`);
      seenFirstChapterIds.add(chs[0].id);
    }
  }
});
