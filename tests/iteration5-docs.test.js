// Iteration 5 documentation gates. These tests keep the explanatory documents honest: they check structure, evidence paths,
// status vocabulary, stack statements and prohibited claims. They cannot judge whether a sentence is true; the self-audit does that.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '../scripts/lib/csv.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));
const DOCS = ['docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md', 'docs/SYSTEM_ARCHITECTURE.md', 'docs/NAVIGATION_AND_WORKFLOW.md', 'docs/JURY_QA_BANK.md', 'docs/PITCH_SCRIPTS.md', 'docs/CLAIM_EVIDENCE_MATRIX.csv'];

test('all Iteration 5 explanatory documents exist and no unfilled placeholder remains in any document', () => {
  for (const f of DOCS) assert.ok(exists(f), `${f} is missing`);
  for (const f of ['README.md', ...fs.readdirSync(path.join(ROOT, 'docs')).map((n) => `docs/${n}`)]) {
    assert.ok(!/@@[A-Z_]+@@/.test(read(f)), `${f} still contains a placeholder token`);
  }
});

test('the jury bank answers all 126 listed questions in order, then further questions; every answer has the four required parts', () => {
  const text = read('docs/JURY_QA_BANK.md');
  const numbers = [...text.matchAll(/^### Q(\d+)\./gm)].map((m) => Number(m[1]));
  assert.ok(numbers.length > 126, 'additional questions are required beyond the 126 listed');
  assert.deepEqual(numbers, numbers.map((_, i) => i + 1), 'question numbers must be consecutive from Q1');
  const blocks = text.split(/^### Q\d+\./gm).slice(1);
  blocks.forEach((block, i) => {
    for (const part of ['**Say', '**Technical:**', '**Evidence:**', '**Avoid / status:**']) assert.ok(block.includes(part), `Q${i + 1} lacks ${part}`);
    const say = block.split('**Technical:**')[0];
    const words = say.replace(/^[^\n]*\n/, '').split(/\s+/).filter(Boolean).length;
    assert.ok(words >= 12 && words <= 120, `Q${i + 1} spoken answer has ${words} words; it must be speakable in about 10-20 seconds`);
  });
  for (const q of ['Q34', 'Q82', 'Q84', 'Q89', 'Q108', 'Q124', 'Q125', 'Q127', 'Q128', 'Q129', 'Q150']) assert.ok(text.includes(`### ${q}.`), `${q} missing`);
});

test('question references in other documents point at questions that exist', () => {
  const total = [...read('docs/JURY_QA_BANK.md').matchAll(/^### Q(\d+)\./gm)].length;
  for (const f of DOCS.filter((d) => d.endsWith('.md'))) {
    for (const m of read(f).matchAll(/\bQ(\d{1,3})\b/g)) assert.ok(Number(m[1]) >= 1 && Number(m[1]) <= total, `${f} refers to Q${m[1]}, which does not exist`);
  }
});

test('the claim matrix is well formed: unique IDs, known status words, evidence paths that exist, wording on both sides', () => {
  const parsed = parseCsv(read('docs/CLAIM_EVIDENCE_MATRIX.csv'));
  assert.deepEqual(parsed.header, ['claim_id', 'claim', 'evidence', 'status', 'allowable_wording', 'prohibited_wording']);
  const body = parsed.records.map((record) => parsed.header.map((name) => record[name]));
  assert.ok(body.length >= 40);
  const ids = new Set();
  const vocabulary = ['official rule/brief', 'implemented', 'unit-tested', 'browser-tested', 'phone-tested', 'live-api-tested', 'content-reviewed', 'expected benefit', 'measured result', 'team-reported', 'not tested', 'not reviewed', 'unknown'];
  for (const r of body) {
    assert.equal(r.length, 6, `row ${r[0]} has ${r.length} columns`);
    assert.ok(!ids.has(r[0]), `duplicate ${r[0]}`); ids.add(r[0]);
    for (const col of r) assert.ok(col.trim(), `${r[0]} has an empty column`);
    const words = r[3].toLowerCase().replace(/\([^)]*\)/g, '').split(/[;,]/).map((w) => w.trim()).filter(Boolean);
    for (const w of words) assert.ok(vocabulary.includes(w), `${r[0]} uses status "${w}", which is not in the vocabulary`);
    for (const piece of r[2].split(';').map((x) => x.trim()).filter(Boolean)) {
      if (/^https:\/\/www\.nirmit\.space\//.test(piece)) continue;
      const file = piece.split(/\s+/)[0];
      assert.ok(!file.includes('*') && exists(file), `${r[0]} cites a path that does not exist: ${file}`);
    }
  }
  const statuses = body.map((r) => r[3]).join(' | ').toLowerCase();
  assert.ok(!/phone-tested(?!\))/.test(statuses.replace(/not tested/g, '')), 'no claim may carry the phone-tested label while no phone has been tested');
  assert.ok(!/live-api-tested/.test(body.map((r) => r[3]).join(' ').toLowerCase().replace(/not tested \(live-api\)/g, '')), 'no claim may carry the live-API-tested label');
  assert.ok(!/content-reviewed/.test(statuses), 'no claim may carry the content-reviewed label');
});

test('stack statements are true: no dependencies, no lockfile packages, no agent framework or UI framework referenced in source', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.dependencies, undefined); assert.equal(pkg.devDependencies, undefined); assert.equal(pkg.optionalDependencies, undefined);
  assert.equal(pkg.engines.node, '>=20');
  const lock = JSON.parse(read('package-lock.json'));
  assert.deepEqual(Object.keys(lock.packages), ['']);
  const banned = /\b(langchain|crewai|autogen|llamaindex|llama-index|smolagents|express|react|next\/|vue|svelte|tensorflow|onnxruntime|transformers|webllm|speechrecognition|webkitspeechrecognition|speechsynthesis)\b/i;
  const files = [];
  const walk = (dir) => { for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) { const rel = `${dir}/${e.name}`; if (e.isDirectory()) walk(rel); else if (/\.(m?js|html)$/.test(e.name)) files.push(rel); } };
  ['src', 'public', 'scripts'].forEach(walk);
  for (const f of files) {
    const lines = read(f).split('\n').filter((l) => /\b(import|require|from)\b|<script/.test(l));
    for (const l of lines) assert.ok(!banned.test(l), `${f}: ${l.trim().slice(0, 120)}`);
  }
  assert.ok(!fs.existsSync(path.join(ROOT, '.github')), 'the documents say there is no CI service; update them if one is added');
});

test('the architecture document has the only diagram: one Mermaid block in SYSTEM_ARCHITECTURE.md and none in ARCHITECTURE.md', () => {
  const system = read('docs/SYSTEM_ARCHITECTURE.md');
  assert.equal((system.match(/```mermaid/g) ?? []).length, 1);
  assert.equal((read('docs/ARCHITECTURE.md').match(/```mermaid/g) ?? []).length, 0);
  assert.match(read('docs/ARCHITECTURE.md'), /SYSTEM_ARCHITECTURE\.md/);
  for (const part of ['ON THE PHONE', 'ON THE SERVER', 'NEEDS THE INTERNET', 'IndexedDB', 'Service worker', 'Retry now', 'Groq adapter', 'preflight']) assert.ok(system.includes(part), `diagram/table lacks ${part}`);
  for (const m of system.matchAll(/`((?:src|public|scripts|tests|content|docs)\/[A-Za-z0-9_./-]+\.[a-z]+)`/g)) assert.ok(exists(m[1].replace(/\*.*$/, '')) || m[1].includes('*'), `SYSTEM_ARCHITECTURE.md cites ${m[1]}, which does not exist`);
});

test('the navigation guide covers every control id in the page, the fifteen journeys and the NOT IMPLEMENTED list', () => {
  const nav = read('docs/NAVIGATION_AND_WORKFLOW.md');
  for (let i = 1; i <= 15; i++) assert.ok(new RegExp(`### J${i}\\.`).test(nav), `journey J${i} missing`);
  assert.match(nav, /NOT IMPLEMENTED/);
  for (const phrase of ['Check my thinking', 'Continue to EL0x', 'Reveal the source mapping', 'Try another', 'Retry now', 'Download trace JSON', 'Unlock demo', 'Read-only session', 'Agent decision trace', 'Why this next?', 'Match the meaning', 'Learning state', 'App update ready']) assert.ok(nav.includes(phrase), `navigation guide lacks "${phrase}"`);
  const html = read('public/index.html'); const app = read('public/app.js');
  for (const label of ['Check my thinking', 'Retry now', 'Reveal the source mapping', 'Try another', 'Unlock demo', 'Download trace JSON']) assert.ok(html.includes(label) || app.includes(label), `"${label}" no longer exists in the app; update the navigation guide`);
  for (const absent of ['language-toggle', 'speechSynthesis', 'webkitSpeechRecognition', 'SpeechRecognition', 'getUserMedia']) assert.ok(!html.includes(absent) && !app.includes(absent), `${absent} exists now; the NOT IMPLEMENTED list must change`);
  for (const status of ['unit', 'headless', 'phone', 'not tested']) assert.ok(nav.toLowerCase().includes(status));
});

test('the guide and bank state the facts the code supports: mock default, Groq never run live, no phone tested, content unreviewed', () => {
  const guide = read('docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md');
  for (const url of ['https://www.nirmit.space/docs/Nextech2.0_Problem_Statement_BW.pdf', 'https://www.nirmit.space/events/nextech', 'https://www.nirmit.space/rules']) assert.ok(guide.includes(url));
  for (const label of ['official rule/brief', 'implemented', 'unit-tested', 'browser-tested', 'phone-tested', 'live-API-tested', 'content-reviewed', 'expected benefit', 'measured result', 'team-reported', 'not tested', 'not reviewed', 'unknown']) assert.ok(guide.includes(label), `status label ${label} missing`);
  assert.match(guide, /MOCK PROVIDER · DEMO RULES · NO LIVE AI/);
  assert.match(guide, /trusted: false/);
  assert.match(guide, /Rule 4\.1|rule 4\.1/);
  const pack = JSON.parse(read('content/electricity-pack.json'));
  assert.ok(pack.items.every((i) => i.status === 'UNREVIEWED_DRAFT'), 'the documents say every item is an unreviewed draft');
  const phones = parseCsv(read('docs/PHONE_TEST_RESULTS_TEMPLATE.csv'));
  assert.equal(phones.records.length, 161);
  assert.ok(phones.records.every((r) => r.result === 'NOT TESTED' && !r.tester && !r.date_ist), 'the documents say no phone has been tested');
  const source = read('src/server/server.js');
  assert.match(source, /PATHASETU_MODEL_PROVIDER \|\| 'mock'/);
});

test('prohibited claims appear only where they are being warned against', () => {
  const phrases = ['fully offline', 'understands odia', 'production secure', 'low-end tested', 'educationally validated', 'proven to improve', 'supports kui', 'revolutionary', 'teacher-approved', 'ai-powered'];
  const cue = /\b(not|never|no|don't|do not|avoid|prohibited|unless|without|cannot|can't|isn't|aren't|nor|none|untested|rather than)\b/i;
  const files = ['README.md', ...fs.readdirSync(path.join(ROOT, 'docs')).filter((n) => n.endsWith('.md')).map((n) => `docs/${n}`)];
  for (const f of files) {
    read(f).split('\n').forEach((line, i) => {
      const low = line.toLowerCase();
      for (const p of phrases) if (low.includes(p)) assert.ok(cue.test(line), `${f}:${i + 1} uses "${p}" without a warning cue: ${line.trim().slice(0, 140)}`);
    });
  }
});

test('the reviewer guide carries the Iteration 5 additions and still writes no reviewer identity anywhere', () => {
  const guide = read('docs/REVIEWER_GUIDE.md');
  for (const part of ['Four further checks added in Iteration 5', 'SYLLABUS FIT', 'RATIONALE', 'ENOUGH EVIDENCE', 'Each language-bridge mapping, reviewed on its own', 'BRIDGE EL0x', 'Authoring the Odia-script and Roman-Odia evaluation rows', 'odia_script', 'roman_odia']) assert.ok(guide.includes(part), `reviewer guide lacks ${part}`);
  const pack = JSON.parse(read('content/electricity-pack.json'));
  for (const item of pack.items) { assert.equal(item.review.reviewer, null); assert.equal(item.review.reviewedAt, null); assert.equal(item.bridge.status, 'UNREVIEWED_DRAFT'); }
  const template = parseCsv(read('evaluation/EVALUATION_REVIEW_TEMPLATE.csv'));
  assert.ok(template.records.every((r) => !r.reviewer_name && !r.review_date));
  assert.equal(template.records.filter((r) => !r.case_id).length, 24, 'the 24 blank reviewer-authored rows must stay blank');
  assert.ok(template.records.filter((r) => !r.case_id).every((r) => !r.explanation && !r.reviewer_label));
});

test('Iteration 5 evidence records the gates as BLOCKED or NOT TESTED and never as passed', () => {
  const gates = read('evidence/iteration5/gates/GATE_STATUS.md');
  for (const word of ['BLOCKED', 'NOT TESTED']) assert.ok(gates.includes(word));
  assert.ok(!/\|\s*\*{0,2}PASS(ED)?\*{0,2}\s*\|/.test(gates.split('\n').filter((l) => /^\| T[2-5]/.test(l)).join('\n')), 'a gate row must not be marked PASS');
  const codes = read('evidence/iteration5/gates/exit-codes.txt');
  assert.match(codes, /smoke exit=2/); assert.match(codes, /evaluate-groq exit=2/);
  assert.match(read('evidence/iteration5/gates/credential-and-tool-presence.txt'), /GROQ_API_KEY: NOT SET/);
});
