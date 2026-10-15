// Iteration 8 documentation gates: board coverage register, competitor wording, feature backlog, phase matrix, Rule 4.1 record.
// They check structure, references, arithmetic and wording. They cannot judge whether a sentence is true or a score is right;
// a passing check here is not a review, an approval or an eligibility decision.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '../scripts/lib/csv.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));
const csv = (f) => parseCsv(read(f));
const docsMd = () => ['README.md', ...fs.readdirSync(path.join(ROOT, 'docs')).filter((n) => n.endsWith('.md')).map((n) => `docs/${n}`)];
const pct = (n, d) => `${((100 * n) / d).toFixed(1)}%`;

// ---------- board coverage register ----------
const TRACKS = ['BSE-HSC-X', 'BSE-MAD-X', 'CBSE-X', 'CISCE-ICSE-X', 'CHSE-PLUS2', 'NIOS-SEC', 'WBBSE-X', 'OTHER-STATE-X'];
const SCOPE_WORDS = ['CURRENT_DRAFT_SCOPE', 'RESEARCHED_NOT_IMPLEMENTED', 'PLANNED', 'BLOCKED', 'OUT_OF_SCOPE_WITH_REASON'];

test('the board coverage register has the seven tracks plus the other-state row, with every required field and a scope word', () => {
  const { header, records } = csv('docs/BOARD_COVERAGE_REGISTER.csv');
  assert.deepEqual(records.map((r) => r.track_id), TRACKS);
  for (const required of ['authority_full_name', 'exam_qualification', 'class_level', 'subject', 'syllabus_url', 'academic_session', 'textbook_title', 'edition_version', 'retrieval_date', 'electricity_topic_reference', 'language_medium_evidence', 'concept_crosswalk', 'terminology_notes', 'status_source_verification', 'status_content_authoring', 'status_item_validation', 'status_subject_review', 'status_language_review', 'status_automated_tests', 'status_product_implementation', 'scope_status', 'decision_ids', 'known_gaps', 'dependencies_next_action', 'evidence_paths']) {
    assert.ok(header.includes(required), `missing column ${required}`);
    for (const r of records) assert.notEqual(r[required].trim(), '', `${r.track_id}.${required} is blank (use UNKNOWN or NOT_VERIFIED, not empty)`);
  }
  for (const r of records) assert.ok(SCOPE_WORDS.includes(r.scope_status), `${r.track_id} scope ${r.scope_status}`);
});

test('only BSE HSC Class X has any implementation; no other board is described as supported, reviewed or authored', () => {
  for (const r of csv('docs/BOARD_COVERAGE_REGISTER.csv').records) {
    if (r.track_id === 'BSE-HSC-X') {
      assert.match(r.status_product_implementation, /^IMPLEMENTED/);
      assert.match(r.status_subject_review, /^NOT_REVIEWED/);
      assert.match(r.status_language_review, /^NOT_REVIEWED/);
      assert.equal(r.scope_status, 'CURRENT_DRAFT_SCOPE');
      continue;
    }
    assert.match(r.status_product_implementation, /^NOT_IMPLEMENTED/, r.track_id);
    for (const k of ['status_content_authoring', 'status_item_validation', 'status_subject_review', 'status_language_review', 'status_automated_tests']) assert.match(r[k], /^NOT_STARTED/, `${r.track_id} ${k}`);
    assert.notEqual(r.scope_status, 'CURRENT_DRAFT_SCOPE', r.track_id);
  }
});

test('CHSE is tracked as +2 only, CISCE is separated from the ICSE exam, WBBSE from WBCHSE', () => {
  const rows = Object.fromEntries(csv('docs/BOARD_COVERAGE_REGISTER.csv').records.map((r) => [r.track_id, r]));
  assert.match(rows['CHSE-PLUS2'].class_level, /XI|\+2/);
  assert.match(rows['CHSE-PLUS2'].class_level, /not (a |an equivalent )?Class X/i);
  assert.match(rows['CISCE-ICSE-X'].authority_full_name, /Council for the Indian School Certificate Examinations/i);
  assert.match(rows['CISCE-ICSE-X'].exam_qualification, /ICSE/);
  assert.match(rows['WBBSE-X'].authority_full_name, /West Bengal Board of Secondary Education/i);
  assert.match(rows['WBBSE-X'].authority_full_name, /distinct from WBCHSE/);
  assert.ok(!/^West Bengal Council of Higher Secondary/i.test(rows['WBBSE-X'].authority_full_name));
});

test('every register track appears in the comparison document, and the document names the seven tracks without a board picker', () => {
  const doc = read('docs/BOARD_CLASS_BOOK_COMPARISON.md');
  for (const id of TRACKS) assert.ok(doc.includes(id), `comparison document lacks ${id}`);
  assert.match(doc, /BOARD_COVERAGE_REGISTER\.csv/);
  assert.match(doc, /not a feature|nothing here adds a board switch/i);
});

// ---------- competitor wording ----------
const NOVELTY = [
  /\b(india|odisha|odia)['’]?s? first\b/i, /\bfirst[- ](of its kind|odia|ai|personali[sz]ed|offline (learning|app|tutor)|ever (odia|ai|learning|app|tutor))\b/i, /\bthe only (odia|app|tool|system|platform|product|offline|solution)\b/i,
  /\bunique (product|platform|app|solution|system|offering)\b/i, /\bno (direct )?competitors?\b/i, /\bwithout (a )?(direct )?competitors?\b/i, /\bone[- ]of[- ]a[- ]kind\b/i, /\bnothing (like|similar) (this|it|pathasetu) (exists|in india|in odisha|elsewhere)\b/i, /\bnobody else\b/i
];
const NEGATION = /\b(no claim|not claim|never claim|do not|does not|don't|doesn't|not say|not describe|not permitted|not supported|avoid|prohibited|banned|must not|cannot|can't|never|not allowed|refuse|unsupported|reject|fails? if|forbidden|do not say|wording to avoid|not to say|makes no|no document)\b/i;

test('no document or README claims Pathasetu is first, only, unique or without a competitor (negated mentions are allowed)', () => {
  const offenders = [];
  for (const f of docsMd()) {
    read(f).split('\n').forEach((line, i) => {
      if (NOVELTY.some((re) => re.test(line)) && !NEGATION.test(line)) offenders.push(`${f}:${i + 1}: ${line.slice(0, 140)}`);
    });
  }
  assert.deepEqual(offenders, []);
});

test('the shipped page and script contain no novelty claim', () => {
  for (const f of ['public/index.html', 'public/app.js']) for (const re of NOVELTY) assert.ok(!re.test(read(f)), `${f} matches ${re}`);
});

const SYSTEMS = ['DIKSHA', 'PM eVIDYA', 'ePathshala', 'Khan Academy India', 'Jigyaso', 'Bhashini', 'ChatGPT Study Mode', 'Gemini Guided Learning', 'MATHia', 'Kolibri', 'Odisha state initiatives', 'UNESCO'];

test('the competitive landscape covers the required systems with only honest test statuses and the required conclusion', () => {
  const doc = read('docs/COMPETITIVE_LANDSCAPE.md');
  for (const s of SYSTEMS) assert.ok(doc.includes(s), `landscape lacks ${s}`);
  assert.match(doc, /no claim to be the first, the only or a unique product/i);
  assert.match(doc, /potential differentiator/i);
  assert.match(doc, /has \*\*not\*\* established whether a product identical to Pathasetu exists/i);
  const matrix = doc.split('## Summary matrix')[1].split('## Per-system records')[0];
  const statuses = matrix.split('\n').filter((l) => /^\| \d+ \|/.test(l)).map((l) => l.split('|')[7].trim());
  assert.equal(statuses.length, 12);
  for (const s of statuses) assert.ok(['SOURCE_ONLY', 'NOT_TESTED'].includes(s), `status ${s}: nothing was tried or independently verified in Iteration 8`);
  assert.ok(!/\bINDEPENDENTLY_VERIFIED\b|\bTRIED\b/.test(matrix.replace(/INDEPENDENTLY_VERIFIED|`TRIED`/g, '')), 'no system may be marked TRIED or INDEPENDENTLY_VERIFIED');
  for (const d of ['ADOPT', 'ADAPT', 'DEFER', 'AVOID']) assert.ok(doc.includes(d), d);
  assert.match(doc, /\(b\) Personally verified[^\n]*nothing/i);
});

test('the landscape cites dated sources, marks Jigyaso unverified and does not quote ASER numbers', () => {
  const doc = read('docs/COMPETITIVE_LANDSCAPE.md');
  assert.match(doc, /13 October 2026/);
  assert.match(doc, /Jigyaso[\s\S]{0,1200}unverified/i);
  assert.match(doc, /no ASER figure was read/i);
  assert.ok((doc.match(/https?:\/\//g) || []).length >= 25, 'sources are linked');
});

// ---------- feature backlog ----------
const BACKLOG_FIELDS = ['id', 'domain', 'title', 'user_problem', 'proposed_behaviour', 'target_user', 'learning_rationale', 'competitor_overlap', 'evidence_confidence', 'accessibility', 'offline_online', 'curriculum_dependency', 'privacy_safety_risk', 'effort', 'acceptance_criteria', 'tests_needed', 'priority', 'decision', 'dependency', 'rationale', 'current_status', 'phase'];
const SCORE_FIELDS = ['score_user_value', 'score_learning_impact', 'score_low_connectivity_odia_fit', 'score_safety_privacy_benefit', 'score_demo_feasibility', 'score_engineering_effort', 'score_validation_burden', 'score_dependency_risk'];

test('the backlog CSV has no blank or duplicate IDs, all fields filled, and valid priority, decision, effort and scores', () => {
  const { header, records } = csv('docs/FEATURE_OPPORTUNITY_BACKLOG.csv');
  for (const f of [...BACKLOG_FIELDS, ...SCORE_FIELDS, 'score_rationale']) assert.ok(header.includes(f), `missing column ${f}`);
  const ids = records.map((r) => r.id);
  assert.ok(ids.every((i) => /^[A-K]\d{2}$/.test(i)), 'IDs look like A01..K10');
  assert.equal(new Set(ids).size, ids.length, 'duplicate IDs');
  assert.ok(records.length >= 60);
  for (const r of records) {
    for (const f of [...BACKLOG_FIELDS, ...SCORE_FIELDS, 'score_rationale']) assert.notEqual(String(r[f]).trim(), '', `${r.id}.${f} blank`);
    assert.ok(['S', 'M', 'L', 'XL'].includes(r.effort), r.id);
    assert.ok(['P0', 'P1', 'P2', 'P3'].includes(r.priority), r.id);
    assert.ok(['NOW', 'NEXT', 'LATER', 'REJECT'].includes(r.decision), r.id);
    for (const f of SCORE_FIELDS) assert.ok(/^[1-5]$/.test(r[f]), `${r.id}.${f}=${r[f]}`);
    assert.ok(/^P(\d|1\d)$/.test(r.phase), `${r.id} phase ${r.phase}`);
    assert.equal(r.id[0], r.domain[0], `${r.id} sits in domain ${r.domain}`);
  }
});

test('the backlog covers all eleven domains, rejects what it should, and treats NOW as "in place or done", never as a proposal', () => {
  const rows = csv('docs/FEATURE_OPPORTUNITY_BACKLOG.csv').records;
  assert.deepEqual([...new Set(rows.map((r) => r.id[0]))].sort(), 'ABCDEFGHIJK'.split(''));
  for (const r of rows.filter((x) => x.decision === 'NOW')) {
    assert.equal(r.priority, 'P0', `${r.id}: NOW items are the P0 set`);
    assert.match(r.current_status, /^(IMPLEMENTED|PARTIAL|DONE)/, `${r.id} is NOW but is not marked as existing`);
  }
  for (const r of rows.filter((x) => x.priority === 'P0')) assert.equal(r.decision, 'NOW', r.id);
  for (const r of rows.filter((x) => x.decision === 'REJECT')) assert.match(r.current_status, /by decision/i, r.id);
  for (const id of ['B13', 'G06', 'H05', 'E10']) assert.equal(rows.find((r) => r.id === id).decision, 'REJECT', id);
  assert.equal(rows.find((r) => r.id === 'B01').decision, 'LATER', 'a board picker stays later');
  assert.match(rows.find((r) => r.id === 'B01').current_status, /no board picker/i);
});

test('the backlog markdown lists every CSV row, states the scoring direction and has no combined score', () => {
  const rows = csv('docs/FEATURE_OPPORTUNITY_BACKLOG.csv').records;
  const md = read('docs/FEATURE_OPPORTUNITY_BACKLOG.md');
  for (const r of rows) assert.ok(md.includes(`#### ${r.id} `), `markdown lacks ${r.id}`);
  assert.match(md, new RegExp(`${rows.length} features`));
  assert.match(md, /5 means the highest burden or risk/);
  assert.match(md, /no combined score/i);
  assert.match(md, /not a list of what is built/i);
  assert.match(md, /J09[\s\S]{0,300}UNKNOWN/);
  const counts = (key) => rows.reduce((m, r) => ({ ...m, [r[key]]: (m[r[key]] || 0) + 1 }), {});
  const d = counts('decision');
  assert.match(md, new RegExp(`NOW ${d.NOW}\\*\\*, \\*\\*NEXT ${d.NEXT}\\*\\*, \\*\\*LATER ${d.LATER}\\*\\*, \\*\\*REJECT ${d.REJECT}\\*\\*`));
});

// ---------- phase matrix ----------
const STATES = ['DONE', 'IN_PROGRESS', 'NOT_STARTED', 'BLOCKED', 'NOT_TESTED', 'NA'];
const crit = () => csv('docs/PHASE_CRITERIA.csv').records;
const REPO_ROOTS = /^(docs|evidence|tests|scripts|content|src|public)\//;
function pathTokens(value) {
  return value.split(';').map((p) => p.trim().replace(/\s+\(.*$/, '')).filter((p) => REPO_ROOTS.test(p));
}

test('phase criteria have unique IDs for P0 to P19, known states, and DONE rows carry TEST or FILE evidence that exists', () => {
  const rows = crit();
  const ids = rows.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual([...new Set(rows.map((r) => r.phase))], Array.from({ length: 20 }, (_, i) => `P${i}`));
  for (const r of rows) {
    assert.ok(STATES.includes(r.state), `${r.id} state ${r.state}`);
    assert.ok(['LAUNCH', 'EXPANSION'].includes(r.scope) && ['IMPL', 'GATE'].includes(r.kind), r.id);
    if (r.state === 'DONE') {
      assert.ok(['TEST', 'FILE'].includes(r.evidence_type), `${r.id} DONE needs TEST or FILE evidence`);
      const tokens = pathTokens(r.evidence_path);
      assert.ok(tokens.length > 0, `${r.id} DONE has no repository path`);
      for (const t of tokens) assert.ok(exists(t), `${r.id} cites missing ${t}`);
    }
    if (r.state === 'NA') assert.ok(r.note.length > 20, `${r.id} NOT_APPLICABLE needs a reason`);
    if (['BLOCKED', 'NOT_TESTED'].includes(r.state)) assert.ok(r.kind === 'GATE' || r.note.length > 0, `${r.id} blocked rows need a reason or gate kind`);
  }
});

test('a gate, a review or a real-device result is never DONE merely because a document or test exists', () => {
  for (const r of crit().filter((x) => x.kind === 'GATE')) assert.notEqual(r.state, 'DONE', `${r.id} is a readiness gate; none is complete`);
  for (const r of crit().filter((x) => x.phase === 'P12')) assert.equal(r.state, 'NOT_TESTED', r.id);
  for (const id of ['P15-04', 'P0-06', 'P0-07', 'P13-05']) assert.equal(crit().find((r) => r.id === id).state, 'BLOCKED', id);
});

test('the matrix numbers equal the criteria counts: per phase, overall, implementation and readiness; the overall is not a mean of phases', () => {
  const rows = crit();
  const md = read('docs/PHASE_COMPLETION_MATRIX.md');
  const applicable = rows.filter((r) => r.state !== 'NA');
  const done = applicable.filter((r) => r.state === 'DONE');
  for (let p = 0; p < 20; p += 1) {
    const ap = applicable.filter((r) => r.phase === `P${p}`);
    const dn = ap.filter((r) => r.state === 'DONE');
    assert.ok(md.includes(`| ${dn.length}/${ap.length} | ${pct(dn.length, ap.length)} | ${(100 - (100 * dn.length) / ap.length).toFixed(1)}% |`), `P${p} ${dn.length}/${ap.length} not in the matrix`);
  }
  assert.ok(md.includes(`${done.length}/${applicable.length} = ${pct(done.length, applicable.length)}`), 'overall string');
  const impl = applicable.filter((r) => r.kind === 'IMPL'); const gate = applicable.filter((r) => r.kind === 'GATE');
  assert.ok(md.includes(`| ${impl.filter((r) => r.state === 'DONE').length}/${impl.length} | ${pct(impl.filter((r) => r.state === 'DONE').length, impl.length)} |`), 'implementation row');
  assert.ok(md.includes(`| ${gate.filter((r) => r.state === 'DONE').length}/${gate.length} | ${pct(gate.filter((r) => r.state === 'DONE').length, gate.length)} |`), 'readiness row');
  assert.match(md, /not the mean of the phase percentages|not as the mean of the phase percentages/);
  assert.match(md, /preliminary 69\/165|69 of 165/);
  for (const state of ['BLOCKED', 'IN_PROGRESS', 'NOT_STARTED', 'NOT_TESTED']) assert.match(md, new RegExp(state), state);
  assert.match(md, /Basis and limits/);
  assert.match(md, /not quality, syllabus approval, event eligibility or a probability of success/);
});

test('the Iteration 8 phase-matrix snapshot stays historical and is not overwritten by Iteration 9', () => {
  const snapshot = read('evidence/iteration8/PHASE_MATRIX_SNAPSHOT_2026-10-13.md');
  assert.match(snapshot, /^# Phase matrix snapshot — 2026-10-13T\d\d:\d\d:\d\d\+05:30/);
  const historical = read('evidence/iteration8/phase_criteria_snapshot.csv');
  const parsed = csv('evidence/iteration8/phase_criteria_snapshot.csv').records;
  assert.equal(parsed.length, 195 + 1, 'Iteration 8 snapshot carries its original applicable criteria plus NA row');
  assert.match(snapshot, /93\/195 = 47\.7%/);
  assert.match(historical, /P14-07/);
  assert.doesNotMatch(historical, /P14-08/);
});

test('the Iteration 9 phase-matrix snapshot stays historical and is not overwritten by Iteration 10', () => {
  const snapshot = read('evidence/iteration9/PHASE_MATRIX_SNAPSHOT_2026-10-14.md');
  assert.match(snapshot, /^# Phase matrix snapshot — 2026-10-14T\d\d:\d\d:\d\d\+05:30/);
  assert.match(snapshot, /94\/196 = 48\.0%/);
  const historical = csv('evidence/iteration9/phase_criteria_snapshot.csv').records;
  assert.equal(historical.length, 196 + 1, 'Iteration 9 snapshot carries its original applicable criteria plus NA row');
  assert.equal(historical.find((r) => r.id === 'P10-09').state, 'NOT_STARTED', 'the Iteration 9 record shows P10-09 as it was then');
  assert.equal(historical.find((r) => r.id === 'P14-08').state, 'DONE');
});

test('the Iteration 10 phase-matrix snapshot matches the current unique criteria and current matrix', () => {
  const snapshot = read('evidence/iteration10/PHASE_MATRIX_SNAPSHOT_2026-10-14.md');
  assert.match(snapshot, /^# Phase matrix snapshot — 2026-10-14T\d\d:\d\d:\d\d\+05:30/);
  const rows = crit().filter((r) => r.state !== 'NA');
  const done = rows.filter((r) => r.state === 'DONE').length;
  assert.ok(snapshot.includes(`${done}/${rows.length} = ${pct(done, rows.length)}`));
  assert.equal(read('evidence/iteration10/phase_criteria_snapshot.csv'), read('docs/PHASE_CRITERIA.csv'));
});

test('the per-board table covers the seven tracks, keeps four states apart, and agrees with the register', () => {
  const md = read('docs/PHASE_COMPLETION_MATRIX.md');
  const section = md.split('## Per-board status')[1].split('## Reconciliation')[0];
  const register = Object.fromEntries(csv('docs/BOARD_COVERAGE_REGISTER.csv').records.map((r) => [r.track_id, r]));
  for (const label of ['BSE Odisha HSC', 'BSE Odisha Madhyama', 'CBSE', 'CISCE ICSE', 'CHSE Odisha +2', 'NIOS Secondary', 'WBBSE']) assert.ok(section.includes(label), label);
  for (const word of ['source checked', 'content authored', 'qualified review', 'implemented and tested']) assert.match(section, new RegExp(word, 'i'));
  const lines = section.split('\n').filter((l) => /^\| (BSE|CBSE|CISCE|CHSE|NIOS|WBBSE)/.test(l));
  assert.equal(lines.length, 7);
  for (const line of lines.slice(1)) assert.match(line, /NOT STARTED \| \d\/6/, 'no non-BSE-HSC board has any implementation result');
  assert.match(lines[0], /DONE \| 3\/6/);
  assert.match(register['BSE-HSC-X'].status_product_implementation, /^IMPLEMENTED/);
  assert.match(section, /only the BSE HSC draft path exists, and its content is unreviewed/);
});

test('the matrix, the backlog and BUILD_STATUS link to each other, and BUILD_STATUS quotes the matrix overall figure', () => {
  const status = read('docs/BUILD_STATUS.md'); const matrix = read('docs/PHASE_COMPLETION_MATRIX.md');
  for (const f of ['docs/FEATURE_OPPORTUNITY_BACKLOG.md', 'docs/COMPETITIVE_LANDSCAPE.md', 'docs/PHASE_COMPLETION_MATRIX.md', 'docs/BOARD_COVERAGE_REGISTER.csv', 'docs/RULE_4_1_STATUS.md', 'browser-path.mjs']) assert.ok(status.includes(f.replace('docs/', '')) || status.includes(f), `BUILD_STATUS lacks ${f}`);
  for (const f of ['FEATURE_OPPORTUNITY_BACKLOG.md', 'COMPETITIVE_LANDSCAPE.md']) assert.ok(matrix.includes(f), `matrix lacks ${f}`);
  const rows = crit().filter((r) => r.state !== 'NA'); const done = rows.filter((r) => r.state === 'DONE').length;
  assert.ok(status.includes(`${done}/${rows.length}`), 'BUILD_STATUS quotes the overall numerator and denominator');
});

// ---------- Rule 4.1 ----------
test('the Rule 4.1 record keeps the status UNCONFIRMED, the message UNSENT, and claims no approval or compliance', () => {
  const rule = read('docs/RULE_4_1_STATUS.md'); const msg = read('docs/ORGANIZER_CLARIFICATION_UNSENT.md');
  assert.match(rule, /RULE_4_1_STATUS=UNCONFIRMED/);
  assert.match(msg, /UNSENT/);
  assert.match(msg, /has not been sent/i);
  assert.match(rule, /TEAM-REPORTED/);
  assert.match(rule, /mock provider stays the default/i);
  const log = csv('docs/DECISION_LOG.csv').records.find((r) => r.id === 'D205');
  assert.match(log.decision, /RULE_4_1_STATUS=UNCONFIRMED/);
  const claim = /\b(approved|permitted|allowed|cleared|confirmed) (in writing )?by the organi[sz]ers\b|\brule 4\.1 (is )?(satisfied|met|complied)\b|\bcomplies with rule 4\.1\b/i;
  const offenders = [];
  for (const f of docsMd()) read(f).split('\n').forEach((line, i) => { if (claim.test(line) && !NEGATION.test(line) && !/team-reported|unconfirmed|unknown|not confirmed/i.test(line)) offenders.push(`${f}:${i + 1}: ${line.slice(0, 120)}`); });
  assert.deepEqual(offenders, []);
});

test('the default provider is still the mock and the Iteration 8 resolver adds no dependency', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.deepEqual(Object.keys(pkg.dependencies || {}), []);
  assert.deepEqual(Object.keys(pkg.devDependencies || {}), []);
  assert.match(read('docs/BUILD_STATUS.md'), /mock/i);
});
