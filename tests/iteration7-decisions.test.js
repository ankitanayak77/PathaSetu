// Iteration 7 documentation-integrity gates. They keep the decision register, the decision log, the board/class/book comparison, the
// crosswalk, the trust-level document and the question bank consistent with each other, with the code, and with the evidence folder.
// They check structure, references and wording. They cannot judge whether a sentence is true; the audit report records what a person checked.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '../scripts/lib/csv.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));
const csv = (f) => parseCsv(read(f));
const pack = () => JSON.parse(read('content/electricity-pack.json'));

const VOCABULARY = [
  'DECIDED FOR MVP', 'TEAM-REPORTED', 'VERIFIED FROM SOURCE', 'VERIFIED IN CODE/TEST', 'PROVISIONAL', 'DEFERRED', 'REJECTED FOR MVP',
  'UNKNOWN', 'NOT TESTED', 'NOT REVIEWED', 'NOT IMPLEMENTED', 'NOT EVALUATED', 'BLOCKED', 'OUT OF SCOPE', 'NOT FOUND IN EVIDENCE', 'NOT SELECTED'
];
const OWNERS = ['TEAM (individual not recorded)', 'TEAM via AI-assisted build (individual not recorded)', 'QUALIFIED REVIEWER (unassigned)', 'ORGANISERS (external)'];
const LOG_HEADER = ['id', 'category', 'decision', 'status', 'alternatives', 'reason', 'source_evidence', 'owner', 'date', 'risk', 'reopen_trigger', 'next_action'];
const DECISION_DOCS = ['docs/DECISION_REGISTER.md', 'docs/BOARD_CLASS_BOOK_COMPARISON.md', 'docs/AUTHENTICATION_AND_TRUST_LEVELS.md', 'docs/DECISION_AUDIT_REPORT.md'];
const logRows = () => csv('docs/DECISION_LOG.csv').records;
const allDocs = () => ['README.md', ...fs.readdirSync(path.join(ROOT, 'docs')).filter((n) => n.endsWith('.md')).map((n) => `docs/${n}`)];
const urlsIn = (text) => [...text.matchAll(/https?:\/\/[^\s<>)\]|`"']+/g)].map((m) => m[0].replace(/[.,;:]+$/, ''));

test('the decision log is well formed: fixed columns, unique IDs, known statuses and owners, no invented names or dates', () => {
  const parsed = csv('docs/DECISION_LOG.csv');
  assert.deepEqual(parsed.header, LOG_HEADER);
  const rows = parsed.records;
  assert.ok(rows.length >= 90, `only ${rows.length} decisions are logged`);
  const ids = new Set();
  for (const r of rows) {
    assert.match(r.id, /^D\d{3}$/, `bad id ${r.id}`);
    assert.ok(!ids.has(r.id), `duplicate ${r.id}`); ids.add(r.id);
    for (const col of LOG_HEADER.filter((c) => c !== 'date')) assert.ok(String(r[col] ?? '').trim(), `${r.id} has an empty ${col}`);
    for (const word of r.status.split(' + ')) assert.ok(VOCABULARY.includes(word.trim()), `${r.id} uses status "${word}", which is not in the vocabulary`);
    assert.ok(OWNERS.includes(r.owner), `${r.id} owner "${r.owner}" is not one of the allowed role labels (no personal names are invented)`);
    if (r.date) {
      assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/, `${r.id} date`);
      assert.ok(!Number.isNaN(Date.parse(r.date)) && r.date <= '2026-10-14', `${r.id} carries a date that cannot be known on 13 Oct 2026`);
    }
    if (r.status.includes('VERIFIED FROM SOURCE')) assert.ok(/https:\/\//.test(r.source_evidence), `${r.id} claims VERIFIED FROM SOURCE with no URL`);
    if (r.status.includes('VERIFIED IN CODE/TEST')) assert.ok(/(src|public|scripts|tests|content|evidence)\//.test(r.source_evidence), `${r.id} claims VERIFIED IN CODE/TEST with no code, test or evidence path`);
  }
  const dated = rows.filter((r) => r.date).length;
  assert.ok(dated <= 14, 'dates are only for decisions with a dated record; Iteration 11 adds two specifically evidenced decisions');
  const statuses = rows.map((r) => r.status).join(' | ');
  assert.ok(!/\bREVIEWED\b|\bPUBLISHED\b/.test(statuses.replace(/NOT REVIEWED/g, '')), 'no decision may carry a REVIEWED or PUBLISHED status');
});

test('every evidence token in the decision log resolves: repo paths exist, URLs are on a source list, claim IDs exist, team-reported items are labelled', () => {
  const claims = new Set(csv('docs/CLAIM_EVIDENCE_MATRIX.csv').records.map((r) => r.claim_id));
  const knownUrls = new Set(DECISION_DOCS.filter(exists).flatMap((f) => urlsIn(read(f))));
  for (const f of ['docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md']) urlsIn(read(f)).forEach((u) => knownUrls.add(u));
  for (const r of logRows()) {
    const tokens = r.source_evidence.split(' ; ').map((t) => t.trim()).filter(Boolean);
    assert.ok(tokens.length > 0, `${r.id} has no evidence token`);
    for (const token of tokens) {
      if (/^https?:\/\//.test(token)) {
        assert.ok(token.startsWith('https://'), `${r.id}: ${token} is not https`);
        assert.doesNotThrow(() => new URL(token), `${r.id}: malformed URL ${token}`);
        assert.ok(knownUrls.has(token), `${r.id}: ${token} is not listed in the source tables of the decision documents`);
      } else if (/^TEAM-REPORTED:/.test(token)) {
        assert.ok(r.status.includes('TEAM-REPORTED'), `${r.id}: a team-reported evidence item needs the TEAM-REPORTED status`);
      } else if (/^UPLOADED:/.test(token) || token === 'NOT FOUND IN EVIDENCE') {
        // an uploaded file named in the conversation, or an explicit absence
      } else {
        const file = token.replace(/\s*\(.*\)\s*$/, '');
        assert.ok(!file.includes('*') && exists(file), `${r.id} cites a path that does not exist: ${file}`);
        const ref = token.match(/\((C\d{2}(?:[, ]+C\d{2})*)\)\s*$/);
        if (ref) for (const c of ref[1].split(/[, ]+/)) assert.ok(claims.has(c), `${r.id} cites claim ${c}, which does not exist`);
      }
    }
    if (r.status.includes('NOT FOUND IN EVIDENCE')) assert.ok(/NOT FOUND IN EVIDENCE|docs\//.test(r.source_evidence));
  }
});

test('the register is authoritative and in step with the log: its generated index equals the CSV, and it carries the vocabulary and the three environments', () => {
  const text = read('docs/DECISION_REGISTER.md');
  const block = text.match(/<!-- DECISION_INDEX_START -->([\s\S]*?)<!-- DECISION_INDEX_END -->/);
  assert.ok(block, 'the register must carry the generated index markers');
  const indexRows = block[1].split('\n').filter((l) => /^\| D\d{3} \|/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
  const rows = logRows();
  assert.equal(indexRows.length, rows.length, 'the register index and the CSV have different numbers of decisions');
  rows.forEach((r, i) => assert.deepEqual(indexRows[i], [r.id, r.category, r.decision, r.status], `register index row ${r.id} differs from the CSV; regenerate the index`));
  for (const word of VOCABULARY) assert.ok(text.includes(word), `the register's vocabulary lacks ${word}`);
  assert.ok(text.toLowerCase().includes('no browser check has passed on the mac'));
  for (const part of ['Three environments, kept apart', 'Node 26.8.2', 'CHROME_PATH', 'Corrections and conflicts against the supplied register', 'Open gates']) assert.ok(text.includes(part), `register lacks "${part}"`);
  assert.match(text, /Pathasetu_Comprehensive_Decision_Register_2026-10-13\.md/);
  assert.match(text, /intended meaning[^.\n]*bridge for learning between languages/i);
  assert.ok(!/etymolog(y|ical)[^.\n]*(is|was) (verified|confirmed)/i.test(text));
});

test('the board/class/book comparison cites its sources with their stated versions and keeps source, code and team claims apart', () => {
  const text = read('docs/BOARD_CLASS_BOOK_COMPARISON.md');
  const urls = urlsIn(text);
  for (const u of [
    'https://bseodisha.nic.in/wp-content/uploads/2026/05/Subject_wise_syllabus_class_X_26_27.pdf', 'https://sme.odisha.gov.in/en/text-books-for-class-x',
    'https://cbseacademic.nic.in/curriculum_2027.html', 'https://cisce.org/', 'https://digital.nios.ac.in/topic.php?id=212en', 'https://wbbse.wb.gov.in/',
    'https://epathshala.nic.in/', 'https://www.nirmit.space/events/nextech', 'https://www.nirmit.space/rules', 'https://www.nirmit.space/docs/Nextech2.0_Problem_Statement_BW.pdf'
  ]) assert.ok(urls.includes(u), `${u} is not cited`);
  for (const u of urls) assert.ok(u.startsWith('https://'), `${u} is not https`);
  const sourceRows = text.split('\n').filter((l) => /^\| S\d+ \|/.test(l));
  assert.equal(sourceRows.length, 20);
  for (const row of sourceRows) { const cells = row.split('|').slice(1, -1).map((c) => c.trim()); assert.equal(cells.length, 6); assert.ok(cells.every(Boolean), `source row has an empty cell: ${row.slice(0, 60)}`); }
  for (const label of ['SOURCE SAYS', 'CODE PROVES', 'TEAM CHOSE', 'UNKNOWN', 'NOT EVALUATED']) assert.ok(text.includes(label), `label ${label} missing`);
  assert.match(text, /do not contain "HSC"|"HSC" does not appear|the word HSC is absent|does not (use|contain) (the word )?(either word|"HSC")/i, 'the comparison must say the syllabus does not use the word HSC');
  assert.match(text, /Madhyama/);
  for (const board of ['BSE Odisha', 'CBSE', 'CISCE', 'NIOS', 'WBBSE']) assert.ok(text.includes(board));
  for (const cls of ['I–VIII', 'IX', 'XI–XII']) assert.ok(text.includes(cls), `class band ${cls} missing`);
  assert.match(text, /Electricity/);
  assert.match(text, /no sub-topics|without sub-topics/);
  for (const phrase of ['syllabus-approved', 'curriculum-aligned', 'teacher-approved']) assert.ok(text.includes(phrase));
});

test('the eight-row crosswalk matches the pack, keeps book fields UNKNOWN and reviewer fields blank, and the comparison page lists the same facts', () => {
  const parsed = csv('docs/BOOK_CROSSWALK.csv');
  const columns = ['item_id', 'concept_id', 'concept_title', 'board_pathway_class', 'academic_or_exam_year', 'official_syllabus_section', 'exact_book_title_as_printed', 'publisher_or_authority', 'edition_print_year_language', 'chapter_number_title', 'page_or_section', 'correct_option_id', 'allowed_misconception_ids', 'question_source_and_licence_note', 'everyday_odia_draft', 'school_odia_term_draft', 'english_term', 'reviewer_name', 'reviewer_role', 'science_correctness_decision', 'language_decision', 'age_reading_level_decision', 'review_date', 'status'];
  assert.deepEqual(parsed.header, columns);
  const items = pack().items;
  assert.equal(parsed.records.length, 8);
  assert.equal(items.length, 8);
  const comparison = read('docs/BOARD_CLASS_BOOK_COMPARISON.md');
  items.forEach((item, i) => {
    const r = parsed.records[i];
    assert.equal(r.item_id, item.id); assert.equal(r.concept_id, item.conceptId); assert.equal(r.concept_title, item.conceptTitle);
    assert.equal(r.correct_option_id, item.correctOptionId);
    assert.equal(r.allowed_misconception_ids, item.allowedMisconceptionIds.join(';'));
    assert.equal(r.everyday_odia_draft, item.bridge.everydayOdia); assert.equal(r.school_odia_term_draft, item.bridge.schoolOdiaTerm); assert.equal(r.english_term, item.bridge.englishTerm);
    assert.equal(r.status, item.status); assert.equal(r.status, 'UNREVIEWED_DRAFT');
    for (const col of ['exact_book_title_as_printed', 'publisher_or_authority', 'edition_print_year_language', 'chapter_number_title', 'page_or_section']) assert.match(r[col], /^UNKNOWN/, `${r.item_id} ${col} must stay UNKNOWN until a reviewer fills it`);
    for (const col of ['reviewer_name', 'reviewer_role', 'science_correctness_decision', 'language_decision', 'age_reading_level_decision', 'review_date']) assert.equal(r[col], '', `${r.item_id} ${col} must stay blank`);
    assert.match(r.board_pathway_class, /BSE Odisha, Class X/); assert.match(r.academic_or_exam_year, /2026-27/);
    assert.match(r.question_source_and_licence_note, /not copied from a textbook/);
    assert.ok(comparison.includes(`| ${item.id} | ${item.conceptId} | ${item.correctOptionId} | ${item.allowedMisconceptionIds.join('; ')} |`), `${item.id} is missing or different in the comparison table`);
    assert.ok(comparison.includes(item.bridge.englishTerm) && comparison.includes(item.bridge.schoolOdiaTerm), `${item.id} terms missing in the comparison`);
  });
});

test('the trust-level document covers A0 to A6 with every required field, separates the six access concepts and states the numbers the code uses', () => {
  const text = read('docs/AUTHENTICATION_AND_TRUST_LEVELS.md');
  const sections = text.split(/^### A\d — /m).slice(1);
  assert.equal(sections.length, 7);
  const fields = ['**Goal:**', '**Identities:**', '**Credentials / session:**', '**Authorisation boundary:**', '**Data store:**', '**Threats:**', '**Pros:**', '**Cons:**', '**Mandatory tests', '**Status:**', '**Permitted claims:**'];
  sections.forEach((section, i) => { for (const f of fields) assert.ok(section.includes(f), `A${i} lacks ${f}`); });
  for (let i = 2; i <= 6; i++) assert.match(sections[i].match(/\*\*Status:\*\*[^\n]*/)[0], /NOT IMPLEMENTED|DEFERRED|NOT PRODUCTION-READY/, `A${i} must not look implemented`);
  assert.match(sections[1].match(/\*\*Status:\*\*[^\n]*/)[0], /CURRENT[^\n]*demo-grade/i);
  assert.match(sections[1], /not user authentication|does not identify/i);
  for (const row of ['**Authentication**', '**Authorisation**', '**TLS / HTTPS**', '**CORS / origin check**', '**Rate limiting / throttling**', '**Shared-code gating**']) assert.ok(text.includes(row), `six-things table lacks ${row}`);
  for (const ref of ['https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html', 'https://www.meity.gov.in/data-protection-framework']) assert.ok(text.includes(ref));
  assert.match(text, /no (statement|claim)[^.\n]*compl/i); assert.match(text, /qualified lawyer|qualified, date-current|qualified/);
  // numbers in the document must be the numbers in the code
  const server = read('src/server/server.js'); const access = read('src/server/access.js'); const app = read('public/app.js');
  assert.match(server, /MAX_BODY_BYTES = 16 \* 1024/); assert.match(text, /16 KB/);
  assert.match(access, /DEFAULT_FAILED_ATTEMPT_LIMIT = 20/); assert.match(text, /20 per 60 s/);
  assert.match(server, /RECHECK_RATE_LIMIT = positiveInteger\([^,]+, 24\)/); assert.match(text, /24 per minute/);
  assert.match(server, /SESSION_RATE_LIMIT = positiveInteger\([^,]+, 30\)/); assert.match(text, /30 per minute/);
  assert.match(server, /RATE_WINDOW_MS = positiveInteger\([^,]+, 60_000\)/);
  assert.match(access, /MIN_ACCESS_CODE_LENGTH = 16/); assert.match(text, /at least 16 characters/);
  assert.match(server, /x-pathasetu-demo-code/); assert.ok(text.includes('x-pathasetu-demo-code'));
  assert.match(app, /pathasetu_demo_code/); assert.ok(text.includes('pathasetu_demo_code'));
  assert.match(server, /timingSafeEqual/);
  assert.match(server, /if \(!origin\) return true;/, 'the document says a request with no Origin header passes the origin check; the code must still do that');
  assert.ok(/send\(res, 401/.test(server) && /send\(res, 403/.test(server) && /429/.test(server));
});

test('the Mac log, the build sandbox and the received package are recorded as separate environments, and no document says a browser check passed on the Mac', () => {
  const base = read('evidence/iteration7/baseline/README-baseline.txt');
  for (const part of ['(1) THE BUILD SANDBOX', '(2) THE TEAM\'S MAC TERMINAL LOG', '(3) THE RECEIVED PACKAGE', 'Node 26.8.2', '10 passed, 1 failed', '/usr/bin/chromium', 'BLOCKED', '1147807d06f546eb5e8d0bc60904101a0ae42f737c8abb28a40ade4b5ddeb735', 'beb9596']) assert.ok(base.includes(part), `baseline README lacks ${part}`);
  const codes = read('evidence/iteration7/baseline/exit-codes.txt');
  for (const name of ['npm-ci', 'npm-test', 'npm-check', 'npm-check-content', 'npm-preflight', 'npm-capture', 'npm-e2e', 'npm-a11y', 'npm-evaluate']) assert.match(codes, new RegExp(`${name}: exit=0 `), `${name} is not recorded with its exit code`);
  assert.match(read('evidence/iteration7/baseline/environment.txt'), /GROQ_API_KEY: NOT SET/);
  // Iteration 8 replaced that default with scripts/lib/browser-path.mjs. The Iteration 7 evidence above still records the old behaviour as history;
  // the live source must no longer contain it, and the fix must be documented.
  assert.ok(!/process\.env\.CHROME_PATH \|\| '\/usr\/bin\/chromium'/.test(read('scripts/lib/devtools.mjs')), 'the Linux-only default was fixed in Iteration 8');
  assert.match(read('docs/BUILD_STATUS.md'), /browser-path\.mjs/, 'BUILD_STATUS must record the Iteration 8 fix for the Mac failure');
  const cue = /\b(not|never|no|blocked|failed|fail|without|only if|unless|if)\b/i;
  for (const f of allDocs()) {
    read(f).split('\n').forEach((line, i) => {
      if (/\bMac\b/.test(line) && /(browser|e2e|capture|a11y|accessibility)[^.\n]*\bpass(es|ed)?\b/i.test(line)) assert.match(line, cue, `${f}:${i + 1} may say a browser check passed on the Mac: ${line.trim().slice(0, 140)}`);
      if (line.includes('/Applications/Google Chrome.app')) assert.match(line, /\bonly\b|\bif\b|\bexist/i, `${f}:${i + 1} suggests the macOS Chrome path without saying to check that it exists`);
    });
  }
  for (const f of ['docs/BUILD_STATUS.md', 'docs/DECISION_REGISTER.md', 'docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md', 'docs/JURY_QA_BANK.md']) assert.match(read(f), /26\.8\.2/, `${f} must record the Mac's Node version`);
  assert.match(read('docs/BUILD_STATUS.md'), /No browser check has passed on the Mac/);
});

test('historical Iteration 7 evidence is unaltered: its recorded runtime hashes and every earlier evidence file still match the digests taken before Iteration 8', () => {
  // evidence/iteration8/historical-evidence-hashes.txt was computed from the committed Iteration 7 state (HEAD 54f7c4c) before any Iteration 8 edit.
  const recordedLines = read('evidence/iteration8/historical-evidence-hashes.txt').trim().split('\n');
  const recorded = new Map(recordedLines.map((l) => { const [hash, file] = l.split(/\s{2}/); return [file, hash]; }));
  const walk = (dir, out = []) => { for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) { const rel = `${dir}/${e.name}`; if (e.isDirectory()) walk(rel, out); else out.push(rel); } return out; };
  const current = ['iteration2', 'iteration3', 'iteration4', 'iteration5', 'iteration6', 'iteration7'].flatMap((d) => walk(`evidence/${d}`)).sort();
  assert.deepEqual(current, [...recorded.keys()].sort(), 'an evidence file from Iteration 2-7 was added, removed or renamed');
  for (const [file, hash] of recorded) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, file))).digest('hex'), hash, `${file} (historical evidence) was modified`);
  assert.ok(recorded.has('evidence/iteration7/baseline/runtime-file-hashes.txt'), 'the Iteration 6 runtime-hash record is itself protected');
});

test('Iteration 8–15 runtime hashes form an append-only declared chain and preserve each prior runtime version', () => {
  const parse = (f) => new Map(read(f).trim().split('\n').map((l) => { const [hash, file] = l.split(/\s{2}/); return [file, hash]; }));
  const declaredOf = (f) => read(f).trim().split('\n').filter((l) => l && !l.startsWith('#')).map((l) => { const [kind, file, ...why] = l.split('\t'); return { kind, file, why: why.join(' ') }; });
  const i8 = parse('evidence/iteration8/runtime-file-hashes.txt');
  const declared8 = declaredOf('evidence/iteration8/runtime-changes.txt');
  const i9 = parse('evidence/iteration9/runtime-file-hashes.txt');
  const declared9 = declaredOf('evidence/iteration9/runtime-changes.txt');
  const i10 = parse('evidence/iteration10/runtime-file-hashes.txt');
  const declared10 = declaredOf('evidence/iteration10/runtime-changes.txt');
  const i11 = parse('evidence/iteration11/runtime-file-hashes.txt');
  const declared11 = declaredOf('evidence/iteration11/runtime-changes.txt');
  const i12 = parse('evidence/iteration12/runtime-file-hashes.txt');
  const declared12 = declaredOf('evidence/iteration12/runtime-changes.txt');
  const i13 = parse('evidence/iteration13/runtime-file-hashes.txt');
  const declared13 = declaredOf('evidence/iteration13/runtime-changes.txt');
  const i14 = parse('evidence/iteration14/runtime-file-hashes.txt');
  const declared14 = declaredOf('evidence/iteration14/runtime-changes.txt');
  const i15 = parse('evidence/iteration15/runtime-file-hashes.txt');
  const declared15 = declaredOf('evidence/iteration15/runtime-changes.txt');
  const i16 = parse('evidence/iteration16/runtime-file-hashes.txt');
  const declared16 = declaredOf('evidence/iteration16/runtime-changes.txt');
  for (const d of [...declared8, ...declared9, ...declared10, ...declared11, ...declared12, ...declared13, ...declared14, ...declared15, ...declared16]) { assert.ok(['ADDED', 'MODIFIED'].includes(d.kind), `${d.file}: kind`); assert.ok(d.why.length > 10, `${d.file}: a reason is required`); }
  const shaBytes = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
  const sha = (file) => shaBytes(fs.readFileSync(path.join(ROOT, file)));
  const walk = (dir, out = []) => { for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) { const rel = `${dir}/${e.name}`; if (e.isDirectory()) walk(rel, out); else out.push(rel); } return out; };
  const current = [...['src', 'public', 'content', 'scripts'].flatMap((d) => walk(d)), 'package.json', 'package-lock.json'].sort();
  const added = (declared) => declared.filter((d) => d.kind === 'ADDED').map((d) => d.file);
  assert.deepEqual(current, [...i8.keys(), ...added(declared9), ...added(declared10), ...added(declared11), ...added(declared12), ...added(declared13), ...added(declared14), ...added(declared15), ...added(declared16)].sort(), 'a runtime file was added or removed without being declared');
  assert.deepEqual([...i9.keys()].sort(), [...i8.keys(), ...added(declared9)].sort(), 'the Iteration 9 hash record stays historical');
  assert.deepEqual([...i10.keys()].sort(), [...i8.keys(), ...added(declared9), ...added(declared10)].sort(), 'the Iteration 10 hash record stays historical');
  assert.deepEqual([...i11.keys()].sort(), [...i8.keys(), ...added(declared9), ...added(declared10), ...added(declared11)].sort(), 'the Iteration 11 hash record stays historical');
  const upTo14 = [...i8.keys(), ...added(declared9), ...added(declared10), ...added(declared11), ...added(declared12), ...added(declared13), ...added(declared14)].sort();
  assert.deepEqual([...i12.keys()].sort(), upTo14, 'the Iteration 12 hash record lists the same runtime paths before Iteration 13 changes');
  assert.deepEqual([...i13.keys()].sort(), upTo14, 'the Iteration 13 hash record lists the same runtime paths before Iteration 14 changes');
  assert.deepEqual([...i14.keys()].sort(), [...i8.keys(), ...added(declared9), ...added(declared10), ...added(declared11), ...added(declared12), ...added(declared13), ...added(declared14)].sort(), 'the Iteration 14 hash record lists the runtime paths before Iteration 15 additions');
  assert.deepEqual([...i15.keys()].sort(), [...upTo14, ...added(declared15)].sort(), 'the Iteration 15 hash record lists the runtime paths before Iteration 16 changes');
  assert.deepEqual([...i16.keys()].sort(), current, 'the Iteration 16 hash record must list exactly the current runtime files');
  const changed9 = new Set(declared9.filter((d) => d.kind === 'MODIFIED').map((d) => d.file));
  const changed10 = new Set(declared10.filter((d) => d.kind === 'MODIFIED').map((d) => d.file));
  const changed11 = new Set(declared11.filter((d) => d.kind === 'MODIFIED').map((d) => d.file));
  const changed12 = new Set(declared12.filter((d) => d.kind === 'MODIFIED').map((d) => d.file));
  const changed13 = new Set(declared13.filter((d) => d.kind === 'MODIFIED').map((d) => d.file));
  const changed14 = new Set(declared14.filter((d) => d.kind === 'MODIFIED').map((d) => d.file));
  const changed15 = new Set(declared15.filter((d) => d.kind === 'MODIFIED').map((d) => d.file));
  const changed16 = new Set(declared16.filter((d) => d.kind === 'MODIFIED').map((d) => d.file));
  // Use the previous-runtime snapshot from the first iteration that replaced the bytes being checked.
  const changedBy = { 9: changed9, 10: changed10, 11: changed11, 12: changed12, 13: changed13, 14: changed14, 15: changed15, 16: changed16 };
  const asOf = (n, file) => { for (let k = n + 1; k <= 16; k += 1) if (changedBy[k].has(file)) return `evidence/iteration${k}/previous-runtime/${file}`; return file; };
  const asOf8 = (file) => asOf(8, file);
  const asOf9 = (file) => asOf(9, file);
  const asOf10 = (file) => asOf(10, file);
  const asOf11 = (file) => asOf(11, file);
  for (const [file, oldHash] of i8) {
    assert.ok(exists(asOf8(file)), `${file}: Iteration 8 bytes needed to preserve the record are missing`);
    assert.equal(sha(asOf8(file)), oldHash, `${file} differs from the preserved Iteration 8 version`);
  }
  for (const [file, oldHash] of i9) {
    assert.ok(exists(asOf9(file)), `${file}: Iteration 9 bytes needed to preserve the record are missing`);
    assert.equal(sha(asOf9(file)), oldHash, `${file} differs from the preserved Iteration 9 version`);
  }
  for (const [file, oldHash] of i10) {
    assert.ok(exists(asOf10(file)), `${file}: Iteration 10 bytes needed to preserve the record are missing`);
    assert.equal(sha(asOf10(file)), oldHash, `${file} differs from the Iteration 10 version`);
  }
  for (const [file, oldHash] of i11) {
    assert.ok(exists(asOf11(file)), `${file}: Iteration 11 bytes needed to preserve the record are missing`);
    assert.equal(sha(asOf11(file)), oldHash, `${file} differs from the Iteration 11 version`);
  }
  for (const [file, hash] of i12) {
    const pathFor12 = asOf(12, file);
    assert.equal(sha(pathFor12), hash, `${file} differs from the Iteration 12 record or its preserved prior bytes`);
  }
  for (const d of declared12) assert.equal(sha(asOf(12, d.file)), i12.get(d.file), `${d.file} differs from the Iteration 12 hash record`);
  for (const [file, hash] of i13) {
    const pathFor13 = asOf(13, file);
    assert.equal(sha(pathFor13), hash, `${file} differs from the Iteration 13 record or its preserved prior bytes`);
  }
  for (const [file, hash] of i14) assert.equal(sha(asOf(14, file)), hash, `${file} differs from the Iteration 14 record or its preserved prior bytes`);
  for (const d of declared14) assert.equal(sha(asOf(14, d.file)), i14.get(d.file), `${d.file} differs from the Iteration 14 hash record`);
  for (const [file, hash] of i15) assert.equal(sha(asOf(15, file)), hash, `${file} differs from the Iteration 15 hash record or its preserved prior bytes`);
  for (const d of declared15) assert.equal(sha(asOf(15, d.file)), i15.get(d.file), `${d.file} differs from the Iteration 15 hash record`);
  for (const [file, hash] of i16) assert.equal(sha(file), hash, `${file} differs from the Iteration 16 hash record`);
  for (const d of declared16) assert.equal(sha(d.file), i16.get(d.file), `${d.file} differs from the Iteration 16 hash record`);
  // Iteration 9 never changed product runtime code; Iteration 10 changed agent.js; Iteration 11 changes retry.js and mutation tooling.
  for (const file of ['src', 'public', 'content'].flatMap((d) => walk(d))) assert.ok(!declared9.some((x) => x.file === file), `${file}: Iteration 9 may not change product runtime code`);
  assert.deepEqual(declared10.map((d) => d.file).filter((file) => /^(src|public|content)\//.test(file)), ['src/core/agent.js'], 'Iteration 10 changed only the queue/re-check core file among src, public and content');
  assert.deepEqual(declared11.map((d) => d.file).filter((file) => /^(src|public|content)\//.test(file)), ['src/core/retry.js'], 'Iteration 11 may change only retry core behaviour among src, public and content');
  assert.deepEqual(new Set(declared11.map((d) => d.file)), new Set(['src/core/retry.js', 'scripts/lib/mutants.mjs', 'scripts/mutation-check.mjs']));
  assert.ok(pack().items.every((i) => i.status === 'UNREVIEWED_DRAFT' && i.review.reviewer === null && i.review.reviewedAt === null));
  assert.match(asOf(7, 'public/sw.js'), /pathasetu-shell-v10/);
  assert.deepEqual(new Set(added(declared9)), new Set(['scripts/doctor.mjs', 'scripts/lib/doctor.mjs', 'scripts/lib/browser-run-status.mjs']));
  assert.deepEqual(changed9, new Set(['package.json', 'scripts/browser-regression.mjs', 'scripts/accessibility-audit.mjs']));
  assert.deepEqual(new Set(added(declared10)), new Set(['scripts/mutation-check.mjs', 'scripts/lib/mutants.mjs']));
  assert.deepEqual(changed10, new Set(['package.json', 'src/core/agent.js']));
  assert.deepEqual(new Set(added(declared11)), new Set());
  assert.deepEqual(changed11, new Set(['src/core/retry.js', 'scripts/lib/mutants.mjs', 'scripts/mutation-check.mjs']));
  // Iteration 12 is tooling only: no file under src, public or content may change, one tooling file is added.
  assert.deepEqual(declared12.map((d) => d.file).filter((file) => /^(src|public|content)\//.test(file)), [], 'Iteration 12 may not change product runtime code');
  assert.deepEqual(new Set(added(declared12)), new Set(['scripts/lib/mutation-plan.mjs']));
  assert.deepEqual(changed12, new Set(['package.json', 'scripts/lib/mutants.mjs', 'scripts/mutation-check.mjs']));
  assert.deepEqual(new Set(added(declared13)), new Set());
  assert.deepEqual(changed13, new Set(['src/core/agent.js', 'src/core/bridge.js', 'src/core/recovery.js']));
  for (const file of ['src/core/agent.js', 'src/core/bridge.js', 'src/core/recovery.js']) assert.notEqual(sha(file), i12.get(file), `${file} must change in Iteration 13`);
  for (const file of ['src/core/retry.js', 'src/core/agent.js']) if (!changed13.has(file)) assert.equal(sha(file), i12.get(file), `${file} must match Iteration 12 unless declared changed`);
  // Iteration 14 changes exactly one product file (the planner scoring in agent.js) and one tooling check (capture.mjs). Nothing is added.
  assert.deepEqual(new Set(added(declared14)), new Set());
  assert.deepEqual(changed14, new Set(['src/core/agent.js', 'scripts/capture.mjs']));
  assert.notEqual(sha('src/core/agent.js'), i13.get('src/core/agent.js'), 'agent.js must change in Iteration 14');
  for (const file of [...i13.keys()]) if (!changed14.has(file)) assert.equal(sha(asOf(14, file)), i13.get(file), `${file} must match Iteration 13 unless declared changed`);
  // Iteration 15 adds the model-provider layer. It is the first iteration to change public/app.js, public/sw.js and server.js since Iteration 8.
  assert.deepEqual(new Set(added(declared15)), new Set(['src/server/providers.js', 'src/server/modelEnv.js', 'src/server/modelConfig.js', 'scripts/generate-draft-items.mjs']));
  assert.deepEqual(changed15, new Set(['src/core/agent.js', 'src/core/recovery.js', 'src/server/server.js', 'public/app.js', 'public/sw.js', 'scripts/browser-regression.mjs', 'scripts/capture.mjs', 'scripts/evaluate-diagnosis.mjs', 'scripts/lib/devtools.mjs', 'scripts/lib/preflight.mjs', 'package.json']));
  for (const file of changed15) assert.notEqual(sha(asOf(15, file)), i14.get(file), `${file} was declared as changed in Iteration 15`);
  for (const file of [...i14.keys()]) if (!changed15.has(file)) assert.equal(sha(asOf(15, file)), i14.get(file), `${file} must match Iteration 14 unless declared changed`);
  // Iteration 16 builds accounts, dashboards and the learning-loop fixes in steps; every changed file declares a reason and keeps its Iteration 15 bytes.
  for (const file of changed16) { assert.notEqual(sha(file), i15.get(file), `${file} was declared as changed in Iteration 16`); assert.ok(exists(`evidence/iteration16/previous-runtime/${file}`), `${file}: Iteration 15 bytes preserved`); }
  for (const file of [...i15.keys()]) if (!changed16.has(file)) assert.equal(sha(file), i15.get(file), `${file} must match Iteration 15 unless declared changed`);
  assert.ok(!declared15.some((d) => d.file.startsWith('content/')), 'Iteration 15 may not change the content pack');
  assert.match(read('evidence/iteration8/runtime-changes.txt'), /Iteration 8 declared runtime changes/);
  assert.match(read('evidence/iteration9/runtime-changes.txt'), /Iteration 9 declared runtime/);
});
test('the question bank answers every Iteration 7 topic with a path or URL and a limit, and every decision ID cited in the documents exists', () => {
  const text = read('docs/JURY_QA_BANK.md');
  const headings = [...text.matchAll(/^### Q(\d+)\. (.+)$/gm)].map((m) => ({ n: Number(m[1]), title: m[2] }));
  assert.ok(headings.length >= 176);
  const added = headings.filter((h) => h.n >= 152);
  const topics = [
    [/BSE Odisha.*Madhyama.*CBSE/i, 'why BSE Odisha rather than the other boards'], [/HSC.*Madhyama/i, 'the HSC and Madhyama label'], [/Class X rather than/i, 'why Class X'],
    [/exact book and edition/i, 'exact book and edition'], [/learning outcomes/i, 'official learning outcomes'], [/curriculum-aligned or teacher-approved/i, 'why the pack is not called curriculum-aligned'],
    [/original or copied/i, 'original versus copied and licensing'], [/supported now/i, 'supported now versus later'], [/identify a real student/i, 'identity versus the shared code'],
    [/access code leaks/i, 'what a code leak means'], [/HTTPS and the origin check/i, 'HTTPS and the origin check'], [/siblings share one phone/i, 'siblings sharing a phone'],
    [/every piece of data/i, 'where every data field goes'], [/Does any AI model really run/i, 'whether any AI runs'], [/network, browser, storage, model or tunnel fails/i, 'failure behaviours'],
    [/multi-agent.*LangChain.*voice.*RAG/i, 'what was left out and why'], [/Which tests ran in which environment/i, 'which tests ran where'], [/without bypassing security policy/i, 'the Mac without bypassing policy'],
    [/screen readers/i, 'screen-reader accessibility'], [/measured benefit/i, 'measured versus expected benefit'], [/event rules, API use, schedule, shortlist and prior permission/i, 'event claims']
  ];
  for (const [re, what] of topics) assert.ok(added.some((h) => re.test(h.title)), `no Iteration 7 question covers: ${what}`);
  const blocks = text.split(/^### Q\d+\./gm).slice(1);
  headings.forEach((h, i) => {
    if (h.n < 152) return;
    const block = blocks[i];
    assert.ok(/\*\*Evidence:\*\*[^\n]*(`[^`]+`|https:\/\/)/.test(block), `Q${h.n} must cite a path or URL`);
    assert.ok(/\*\*Avoid \/ status:\*\*[^\n]{20,}/.test(block), `Q${h.n} must state a limit or claim to avoid`);
    assert.ok(/\*\*Technical:\*\*[^\n]{80,}/.test(block), `Q${h.n} needs a real technical answer`);
  });
  const ids = new Set(logRows().map((r) => r.id));
  for (const f of ['docs/JURY_QA_BANK.md', 'docs/BOARD_CLASS_BOOK_COMPARISON.md', 'docs/AUTHENTICATION_AND_TRUST_LEVELS.md', 'docs/DECISION_REGISTER.md', 'docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md', 'docs/DECISION_AUDIT_REPORT.md']) {
    for (const m of read(f).matchAll(/\bD(\d{3})\b/g)) assert.ok(ids.has(`D${m[1]}`), `${f} cites D${m[1]}, which is not in the decision log`);
    for (const range of read(f).matchAll(/\bD(\d{3})[–-]D(\d{3})\b/g)) assert.ok(ids.has(`D${range[1]}`) && ids.has(`D${range[2]}`), `${f} cites a range ${range[0]} with a missing end`);
  }
});

test('Iteration 7 wording rules: no verified HSC-versus-Madhyama claim, no unqualified alignment or approval claim, no compliance claim, every new document is linked and every new claim row exists', () => {
  const cue = /\b(not|never|no|don't|do not|avoid|unless|without|cannot|can't|isn't|aren't|nor|pending|unverified|unknown|until|before|rather than)\b|n't/i;
  const phrases = [/HSC,? not Madhyama/i, /curriculum[- ]aligned/i, /syllabus[- ]approved/i, /\bDPDP[- ]compliant\b/i, /\bchild[- ]safe\b/i, /\bGDPR[- ]compliant\b/i];
  for (const f of allDocs()) {
    read(f).split('\n').forEach((line, i) => {
      for (const re of phrases) if (re.test(line)) assert.match(line, cue, `${f}:${i + 1} uses ${re} without a warning cue: ${line.trim().slice(0, 150)}`);
    });
  }
  const readme = read('README.md');
  for (const f of ['DECISION_REGISTER.md', 'DECISION_LOG.csv', 'BOARD_CLASS_BOOK_COMPARISON.md', 'BOOK_CROSSWALK.csv', 'AUTHENTICATION_AND_TRUST_LEVELS.md', 'DECISION_AUDIT_REPORT.md']) {
    assert.ok(exists(`docs/${f}`), `docs/${f} is missing`);
    assert.ok(readme.includes(f), `README does not mention ${f}`);
  }
  const claims = new Map(csv('docs/CLAIM_EVIDENCE_MATRIX.csv').records.map((r) => [r.claim_id, r]));
  for (let n = 51; n <= 60; n++) assert.ok(claims.has(`C${n}`), `claim C${n} is missing`);
  assert.match(claims.get('C52').status, /unknown/); assert.match(claims.get('C55').allowable_wording, /not production security/); assert.match(claims.get('C57').status, /team-reported/);
  assert.ok(!/content-reviewed|phone-tested|live-api-tested/.test([...claims.values()].filter((c) => Number(c.claim_id.slice(1)) >= 51).map((c) => c.status).join(' ')));
  const audit = read('docs/DECISION_AUDIT_REPORT.md');
  for (const part of ['What changed', 'Unknowns', 'Inconsistent', 'Sources checked', 'Commands and exit codes']) assert.ok(audit.includes(part), `audit report lacks "${part}"`);
});
