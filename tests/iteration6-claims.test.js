// Iteration 6 claim-integrity gates. These keep the written claims inside what the evidence supports after the Iteration 5 audit:
// the team's intended meaning of the name, one set of current result counts, precise data-flow and shared-device wording, and
// team-reported (not written) organiser permission. They check wording and consistency; they cannot judge whether a sentence is true.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseCsv } from '../scripts/lib/csv.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));
// For the claim matrix only the claim and allowable-wording columns are scanned: the prohibited-wording column lists phrases on purpose.
const lines = (f) => {
  if (f.endsWith('.csv')) { const p = parseCsv(read(f)); return p.records.flatMap((r) => [r.claim, r.allowable_wording]); }
  return read(f).split('\n');
};
const FACING = ['README.md', 'docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md', 'docs/JURY_QA_BANK.md', 'docs/PITCH_SCRIPTS.md', 'docs/CLAIM_EVIDENCE_MATRIX.csv', 'docs/SYSTEM_ARCHITECTURE.md', 'docs/NAVIGATION_AND_WORKFLOW.md'];
const NEGATION = /\b(not|never|no|avoid|without|isn't|doesn't|don't|cannot|can't|unvalidated|untested|prohibited|only if)\b|n't/i;

function currentResults() {
  const m = read('docs/BUILD_STATUS.md').match(/<!-- CURRENT_RESULTS unit=(\d+) capture=(\d+) e2e=(\d+) a11y=(\d+) -->/);
  assert.ok(m, 'docs/BUILD_STATUS.md must carry the CURRENT_RESULTS marker');
  return { unit: Number(m[1]), capture: Number(m[2]), e2e: Number(m[3]), a11y: Number(m[4]) };
}

test('the name is explained as the team’s intended meaning, a bridge for learning between languages, without claiming a verified translation', () => {
  const wording = /intended meaning for Pathasetu is a bridge for learning between languages/i;
  for (const f of ['docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md', 'docs/JURY_QA_BANK.md', 'docs/PITCH_SCRIPTS.md']) {
    const text = read(f);
    assert.match(text, wording, `${f} must state the team's intended meaning`);
    assert.match(text, /not claiming a formally verified (literal )?translation/i, `${f} must not claim a verified literal translation`);
  }
  for (const f of FACING) {
    assert.ok(!/(rationale|reasoning) for the name[^.\n]*(unknown|not record)|does not record the team's own (rationale|reasoning)/i.test(read(f)), `${f} still says the name's rationale is unknown`);
  }
  assert.match(read('README.md'), /bridge for learning between languages/i);
});

test('current result counts come from one marker in BUILD_STATUS; older figures appear only when labelled as baseline or as an earlier iteration', () => {
  const cur = currentResults();
  assert.ok(cur.unit > 207, 'the current unit total must include the Iteration 7 tests on top of the 207 of Iteration 6');
  for (const f of ['README.md', 'docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md', 'docs/JURY_QA_BANK.md', 'docs/PITCH_SCRIPTS.md']) {
    assert.ok(read(f).includes(`${cur.unit} unit`), `${f} must quote the current ${cur.unit} unit tests`);
  }
  assert.ok(read('docs/PITCH_SCRIPTS.md').includes(`${cur.e2e} browser`), 'the pitch must quote the current browser-check count');
  const labelled = /baseline|iteration \d+|earlier|before|history|\+\d|was\b|then\b/i;
  for (const f of FACING) {
    for (const line of lines(f)) {
      for (const m of line.matchAll(/\b(\d{2,3})(?:\/\d{2,3})? (?:of \d+ )?(?:unit|browser|e2e)\b/g)) {
        const n = Number(m[1]);
        if ([cur.unit, cur.e2e].includes(n)) continue;
        assert.match(line, labelled, `${f} quotes "${m[0]}" without labelling it baseline/earlier: ${line.slice(0, 140)}`);
      }
    }
  }
  const pitch = read('docs/PITCH_SCRIPTS.md');
  assert.ok(!/\b182 unit/.test(pitch) && !/\b198 unit/.test(pitch), 'the live-pitch figures must be the current ones');
  assert.ok(pitch.includes(`${cur.a11y} accessibility`) && pitch.includes('evidence/iteration16/final/'));
});

test('the marker matches the saved final evidence once that evidence exists, and the baseline evidence is the untouched Iteration 5 result', () => {
  const cur = currentResults();
  const base = 'evidence/iteration6/baseline/npm-test.txt';
  assert.ok(exists(base));
  assert.match(read(base), /# pass 198\b/);
  const historicalI8Test = 'evidence/iteration8/final/npm-test.txt';
  assert.match(read(historicalI8Test), /# pass 252\b/);
  assert.match(read(historicalI8Test), /# fail 0\b/);
  const historicalI9Test = 'evidence/iteration9/final/npm-test.txt';
  assert.match(read(historicalI9Test), /# pass 266\b/);
  assert.match(read(historicalI9Test), /# fail 0\b/);
  const historicalI11 = 'evidence/iteration11/final/npm-test.txt';
  assert.match(read(historicalI11), /# pass 347\b/);
  assert.match(read(historicalI11), /# fail 0\b/);
  const blockedI11 = JSON.parse(read('evidence/iteration11/final/browser-regression.json'));
  assert.equal(blockedI11.status, 'BLOCKED');
  assert.equal(blockedI11.passCount, 0);
  const historicalI12 = 'evidence/iteration12/final/npm-test.txt';
  assert.match(read(historicalI12), /# pass 373\b/);
  assert.match(read(historicalI12), /# fail 0\b/);
  assert.equal(JSON.parse(read('evidence/iteration12/final/browser-regression.json')).passCount, 100, 'Iteration 12 browser success remains historical evidence');
  const historicalI14 = 'evidence/iteration14/final/npm-test.txt';
  assert.match(read(historicalI14), /# pass 382\b/);
  assert.match(read(historicalI14), /# fail 0\b/);
  assert.equal(JSON.parse(read('evidence/iteration14/final/browser-regression.json')).passCount, 100, 'Iteration 14 browser success remains historical evidence');
  const historicalI15 = 'evidence/iteration15/final/npm-test.txt';
  assert.match(read(historicalI15), /# pass 440\b/);
  assert.match(read(historicalI15), /# fail 0\b/);
  assert.equal(JSON.parse(read('evidence/iteration15/final/browser-regression.json')).passCount, 106, 'Iteration 15 browser success remains historical evidence');
  const finalTest = 'evidence/iteration16/final/npm-test.txt';
  if (exists(finalTest) && /# pass \d+/.test(read(finalTest))) {
    assert.equal(Number(read(finalTest).match(/# pass (\d+)/)[1]), cur.unit);
    assert.match(read(finalTest), /# fail 0\b/);
  }
  const historicalE2e = 'evidence/iteration8/final/browser-regression.json';
  assert.equal(JSON.parse(read(historicalE2e)).passCount, 100, 'Iteration 8 browser success remains historical evidence');
  const blockedI9 = JSON.parse(read('evidence/iteration9/final/browser-regression.json'));
  assert.equal(blockedI9.status, 'BLOCKED', 'the Iteration 9 policy block stays on record as that environment’s result');
  assert.equal(blockedI9.passCount, 0);
  const finalE2e = 'evidence/iteration16/final/browser-regression.json';
  const historicalI10 = 'evidence/iteration10/final/npm-test.txt';
  assert.match(read(historicalI10), /# pass 337\b/);
  assert.match(read(historicalI10), /# fail 0\b/);
  if (exists(finalE2e)) {
    const j = JSON.parse(read(finalE2e));
    if (j.status === 'BLOCKED') {
      assert.equal(cur.e2e, 0, 'a blocked current run cannot inherit an earlier successful count');
      assert.equal(j.passCount, 0);
      assert.equal(j.failCount, 0);
      assert.equal(j.blockedCount, 1);
    } else if (j.completedAt) { assert.equal(j.passCount, cur.e2e); assert.equal(j.failCount, 0); }
  }
});

test('where the learner’s words go is stated precisely: local storage when it works, the server on re-check, the hosted model only if configured', () => {
  const needs = [
    [/sent to the (Pathasetu )?server/i, 'typed explanation is sent to the server for a re-check'],
    [/hosted model|Groq/i, 'the hosted-model case'],
    [/when (browser )?storage (works|is available)|if (browser )?storage (works|is available)/i, 'local storage depends on the browser'],
  ];
  for (const f of ['docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md', 'docs/PITCH_SCRIPTS.md', 'docs/JURY_QA_BANK.md']) {
    for (const [re, what] of needs) assert.match(read(f), re, `${f} must say: ${what}`);
  }
  for (const f of [...FACING, 'public/index.html', 'public/app.js']) {
    for (const line of lines(f)) {
      assert.ok(!/saves everything|everything (is )?(saved|stored|stays) on the (phone|device)|nothing (is )?sent anywhere|no data leaves/i.test(line) || NEGATION.test(line), `${f}: overbroad storage/privacy claim: ${line.slice(0, 140)}`);
    }
  }
});

test('shared-device wording: a family phone is the target setting, but there is one local session record and no learner profiles', () => {
  for (const f of ['docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md', 'docs/PITCH_SCRIPTS.md', 'docs/JURY_QA_BANK.md', 'docs/CLAIM_EVIDENCE_MATRIX.csv']) {
    assert.match(read(f), /one (local )?(session|saved) record/i, `${f} must state the single-record limit`);
  }
  assert.match(read('docs/PITCH_SCRIPTS.md'), /does not (safely )?(separate|support) (several|multiple|different) learners/i);
  for (const f of FACING) {
    for (const line of lines(f)) {
      if (/(supports?|works? (for|with)|handles?) (a )?(shared|family)[- ](phone|device)s?|multi-learner support|learner profiles (are|exist)/i.test(line)) assert.match(line, NEGATION, `${f}: shared-device overclaim: ${line.slice(0, 140)}`);
    }
  }
});

test('claims stronger than the evidence stay out unless the same line negates or qualifies them', () => {
  const risky = /understands? (the learner|their|her|his) (reasoning|thinking|explanation)|reads? (and understands )?the (typed )?explanation|semantic(ally)? understand|improves? (learning|marks|scores|exam results)|adaptive learning (is )?validated|teacher[- ]approved|production[- ]secure|WCAG[- ]compliant|supports? Kui|low-end phones? (tested|support)|offline on (real )?phones|works offline on (real )?phones|LLM-powered|powered by (an )?(LLM|AI)/i;
  for (const f of FACING) {
    for (const line of lines(f)) {
      if (!line.startsWith('###') && risky.test(line)) assert.match(line, NEGATION, `${f}: unqualified claim: ${line.slice(0, 160)}`);
    }
  }
  const matrix = read('docs/CLAIM_EVIDENCE_MATRIX.csv');
  assert.match(matrix, /LEARNING-OUTCOME-MEASURED|learning-outcome-measured|measured result/);
});

test('organiser permission and API use are labelled team-reported unless a saved message exists; the rubric weights are not confused with the stage split', () => {
  const hasSaved = exists('evidence/organiser-message.md') || exists('docs/ORGANISER_CONFIRMATION.md');
  for (const f of ['README.md', 'docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md', 'docs/JURY_QA_BANK.md', 'docs/CLAIM_EVIDENCE_MATRIX.csv', 'docs/PITCH_SCRIPTS.md']) {
    assert.match(read(f), /team-reported/i, `${f} must call the organiser clarification team-reported`);
  }
  if (!hasSaved) {
    for (const f of FACING) {
      for (const line of lines(f)) {
        if (/permission (was|has been) granted|organi[sz]ers? (approved|confirmed in writing|gave written)|written permission (exists|was)/i.test(line)) assert.match(line, NEGATION, `${f}: asserts written permission without a saved message: ${line.slice(0, 140)}`);
      }
    }
  }
  const guide = read('docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md');
  assert.match(guide, /(agentic|architecture)[^.\n]*30\s*%/i);
  assert.match(guide, /(mid-evaluation|stage)[^.\n]*30\s*%[^.\n]*70\s*%|30\s*%[^.\n]*mid-evaluation[^.\n]*70\s*%/i, 'the 30/70 stage split must stay distinct from the four jury weights');
});

test('the shipped UI names the provider it is using: the answer-box hint and footer depend on the server-reported provider, and the cache name matches the docs', () => {
  const app = read('public/app.js');
  assert.match(app, /function explanationPlaceholder\(\)/);
  assert.match(app, /ui\.provider === 'groq'[\s\S]{0,260}hosted model/);
  assert.match(app, /ui\.provider === 'chain'[\s\S]{0,260}configured model chain/);
  assert.match(app, /placeholder="\$\{explanationPlaceholder\(\)\}"/);
  assert.ok(!/placeholder="Type in your own words\. This mock/.test(app), 'the mock-only placeholder must not be hard-coded');
  assert.match(app, /MOCK PROVIDER · DEMO RULES · NO LIVE AI/);
  assert.match(app, /CONFIGURED · GROQ.*ACCURACY UNVALIDATED/);
  assert.match(app, /CONFIGURED · \$\{ui\.providers\.map/);
  const cache = read('public/sw.js').match(/pathasetu-shell-v\d+/)[0];
  for (const f of ['docs/SYSTEM_ARCHITECTURE.md', 'docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md', 'docs/JURY_QA_BANK.md', 'docs/NAVIGATION_AND_WORKFLOW.md', 'docs/HTTPS_DEMO_RUNBOOK.md']) {
    for (const m of read(f).matchAll(/pathasetu-shell-v\d+/g)) assert.equal(m[0], cache, `${f} names a different cache than public/sw.js`);
  }
});

test('the plain-language guide answers each question the Iteration 6 brief lists, including what tests prove, where data goes and how learning would be measured', () => {
  const guide = read('docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md');
  const topics = [
    [/What the automated tests prove, and what they do not/i, 'tests prove / do not prove'],
    [/Where the learner’s words go/i, 'data flow'],
    [/Which routes need the access code/i, 'routes, secrets and security limits'],
    [/How we would measure learning improvement/i, 'future approved study'],
    [/before (anyone|we) (can )?say[^.\n]*LLM-powered|before saying[^.\n]*LLM-powered/i, 'what must be true before saying LLM-powered'],
    [/How to find the evidence for any claim/i, 'claim to evidence mapping'],
    [/Unvalidated assumptions about the user/i, 'assumptions about the target user'],
  ];
  for (const [re, what] of topics) assert.match(guide, re, `the guide lacks: ${what}`);
  assert.match(guide, /CLAIM_EVIDENCE_MATRIX\.csv/);
});
