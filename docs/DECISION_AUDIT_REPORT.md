# Pathasetu — Iteration 7 decision audit report

Written 13 October 2026. This report lists what changed, every unknown, every inconsistent or unsupported claim the audit found, the sources checked, and the commands run with their exit codes. It is a record of an audit, not an endorsement of the decisions. Decision IDs (`D0xx`) refer to `docs/DECISION_LOG.csv`.

**Scope.** Documentation, tests and evidence only. No runtime behaviour, content item, status, service-worker cache or script was changed (a test compares the SHA-256 of every file in `src/`, `public/`, `content/` and `scripts/`, plus `package.json` and `package-lock.json`, with the Iteration 6 values saved in `evidence/iteration7/baseline/runtime-file-hashes.txt`). Nothing was added for board switching, accounts, profiles, extra packs or textbook ingestion, though the alternatives are compared.

## 1. What changed

| File | Change |
|---|---|
| `docs/DECISION_REGISTER.md` | New. The authoritative register, based on the supplied register and updated only with new evidence; three environments kept apart; corrections table; generated decision index |
| `docs/DECISION_LOG.csv` | New. 101 decisions, 12 columns, each with alternatives, reason, evidence, owner role, risk, reopen trigger and next action. Dates only where a dated source exists |
| `docs/BOARD_CLASS_BOOK_COMPARISON.md` | New. Boards, classes, subject, book fields, source table with stated versions, conflicts, reviewer tasks, safe wording |
| `docs/BOOK_CROSSWALK.csv` | New. Eight rows by 24 columns, generated from the pack; book fields UNKNOWN; reviewer fields blank |
| `docs/AUTHENTICATION_AND_TRUST_LEVELS.md` | New. Six access concepts kept apart; A0–A6; Pathasetu is A1; what a code leak and the origin check mean |
| `docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md` | Updated: board/class/book section, data-field table (3.4), access levels in plain words (3.5), Mac versus sandbox results, limits 8–11, stale question count corrected |
| `docs/JURY_QA_BANK.md` | 25 questions added (Q152–Q176), now 176; intro and the current-number answers updated; Q100 now includes the Mac |
| `docs/PITCH_SCRIPTS.md` | Current numbers updated; new section H with safe wording for board, book and access |
| `docs/CLAIM_EVIDENCE_MATRIX.csv` | C34 and C36 updated; C51–C60 added (60 claims) |
| `docs/BUILD_STATUS.md`, `README.md` | Iteration 7 section, Mac log recorded separately, one results marker (`CURRENT_RESULTS`) updated |
| `tests/iteration7-decisions.test.js` | New. Documentation-integrity tests (decision-log consistency among them) |
| `tests/iteration6-claims.test.js` | The "final evidence" and pitch checks now point at `evidence/iteration7/final/`; the minimum unit total is raised to exceed Iteration 6's 207 |
| `evidence/iteration7/` | New. Baseline (sandbox), runtime-file hashes, final regression |

Prior evidence folders (`evidence/iteration2` … `evidence/iteration6`) were not edited. The tracked files `evidence/capture-latest.json`, `evidence/browser-regression-latest.json` and `evidence/pathasetu-browser-latest.png` are overwritten by each capture/e2e run, exactly as in earlier iterations.

## 2. Unknowns (nothing below was filled by guesswork)

| # | Unknown | Where it matters | Who can close it |
|---|---|---|---|
| U01 | Whether "HSC" or "Madhyama" is the right pathway label, and what Madhyama is | D010, D011 | A teacher or the board |
| U02 | Exact book title as printed (Odia cover wording), publisher or authority, language/script, edition or print year, ISBN | D024 | Reviewer with the physical book |
| U03 | Chapter numbers and titles, page numbers for EL01–EL08 | D024, D025 | Reviewer |
| U04 | Which official syllabus outcome each item serves (the source lists "Electricity" with no sub-topics) | D025 | Reviewer |
| U05 | Whether each item lies within the prescribed scope of the learner's book | D025 | Reviewer |
| U06 | Similarity of any item to a printed exercise; licence terms of the Odisha books and of ePathshala and NIOS material | D027, D028 | Reviewer; rights holders |
| U07 | Scientific correctness, Odia quality, terminology and reading level of all eight items and their bridge fields | D030, D031 | Qualified Odia-medium science reviewer |
| U08 | Roman-Odia and Odia-script behaviour of any diagnosis path | D032 | Reviewer |
| U09 | Behaviour on any of the seven phone/browser combinations; Odia font rendering; low-end phones | D035, D120, D121 | Team, on real devices |
| U10 | Behaviour on a real HTTPS tunnel or host; tunnel provider logging | D070, D111 | Team |
| U11 | Whether the Groq adapter works against the live API; the account's data-controls and retention terms | D061, D065, D152 | Team, with local credentials |
| U12 | Whether the organisers allowed early work and all APIs, in writing; the team's assigned slot; the shortlist message | D063, D180–D182 | Team / organisers |
| U13 | The legal text of the Data Protection Act and Rules and their commencement for a project like this (the MeitY page returned no text) | D074 | Qualified lawyer |
| U14 | CISCE current syllabus; WBBSE and other state-board syllabuses; CBSE item-level fit; NIOS current course code | D012–D016 | Whoever adopts that board |
| U15 | The content of the SME Odisha textbook listing page (the site's robots policy refused the tool) | D024 | A person with a browser |
| U16 | On the team's Mac: archive SHA-256, git state, macOS version, whether Google Chrome is installed and allowed | D057, D122 | Team |
| U17 | Screen-reader behaviour (TalkBack, VoiceOver); Odia legibility on phones | D130 | Team with testers |
| U18 | Any learning benefit; whether the persona's assumptions hold | D005, D006, D153 | Approved study |
| U19 | Prior art and novelty (no systematic survey was done) | D170 | Team, if a novelty claim is wanted |
| U20 | Data cost and hosting cost | Q112, Q138 | Team |
| U21 | Which named individuals own each decision (owners are role labels because no names are recorded) | all rows | Team |

## 3. Inconsistent or unsupported claims found

| # | Where | Finding | Action |
|---|---|---|---|
| I01 | Supplied register, sections 1 and 3.1 | "Official 2026–27 HSC Class X General Science curriculum": the PDF does not contain "HSC" | Verified wording changed to "BSE Odisha Class X General Science, session 2026-27"; HSC kept as the team's label (D010) |
| I02 | Supplied register, section 3.2 | Madhyama "distinct" in "the same subject-wise syllabus file": no Madhyama heading was found | Recorded as NOT SELECTED + UNKNOWN (D011); "HSC, not Madhyama" is now a prohibited verified-claim phrase, checked by a test |
| I03 | Supplied register, section 14 item 11 | The MeitY URL returned only placeholder metadata, so it did not supply "current legal text" | No legal statement made; secondary source named and labelled |
| I04 | Supplied register, section 3.2 | CISCE "Physics syllabus path varies by year": no syllabus link was reachable | NOT EVALUATED |
| I05 | Supplied register, section 3.1 | The SME Odisha listing's contents could not be re-checked | Carried over as unverified |
| I06 | Event page versus team | The page says "external open-source LLM APIs"; the team says "all APIs"; the rules page has no API rule | Conflict preserved (D063); not resolved |
| I07 | Event page | Mid-evaluation is listed 04:00–07:00 PM on Day 1 while Day 1 is listed 8:00 AM–6:00 PM; the 24-hour build window and the listed hours differ | Re-confirmed on 13 Oct; the assigned slot must be obtained in writing (D182) |
| I08 | Guide header (Iteration 5/6) | Said the bank had "126 questions"; it had 151 | Corrected, now 176 |
| I09 | README | A dangling lead-in "Earlier iterations, unchanged:" with nothing under it | Removed |
| I10 | BUILD_STATUS and Q100 | Only one team environment (the managed machine) was recorded; the Mac is a different environment | Added as environment A; no result merged |
| I11 | Prompt versus register | The register says the Mac-side path problem is Chromium; the scripts' default is `/usr/bin/chromium` (`scripts/lib/devtools.mjs`), which macOS lacks | Documented as a path gap with the safe, conditional fix (D057) |
| I12 | Terminology | "Class 10" (project documents) versus "Class X" (syllabus) | Both shown together where the board is named |

Facts the audit **checked and found consistent**: the evaluation set composition (47 cases: 27 genuine misconception, 8 correct reasoning, 4 ambiguous, 8 insufficient information), the mock baseline (47/47 valid, 34/47 agreement, 0/8, 2/12) in both the sandbox and the Mac log, the eight item IDs and correct options in the pack and worksheet, and the access-control constants named in the trust-level document (checked by a test against the source).

## 4. Sources checked (13 October 2026)

| Source | Result |
|---|---|
| BSE Odisha Class X subject-wise syllabus 2026-27 (PDF) | Opened. Heading, General Science, prescribed books, Physical Science topic list read; Odia text partly garbled; no page numbers, publisher or edition |
| SME Odisha Class X textbooks page | Refused by the tool (`ROBOTS_DISALLOWED`); not read |
| CBSE curriculum 2026-27 page | Opened; Science link noted; the PDF itself not opened |
| CISCE home page | Opened; no syllabus link |
| NIOS eContent, Secondary Science & Technology | Opened; 32 chapters listed; "© 2012" |
| WBBSE | Not reached from a primary source |
| NCERT ePathshala | Not re-read |
| NEXTECH event page and rules page | Opened; weights, API wording, dates, Rules 3.3 and 4.1 quoted in the register |
| OWASP Authentication and Session Management cheat sheets | Opened; points used in the trust-level document |
| MeitY data-protection page | Opened; placeholder metadata only |
| A law-firm summary of the Data Protection Rules 2025 (BDO India) | Opened; used only as a labelled secondary summary |
| The supplied register, the Iteration 7 prompt and the team's Mac log | Read in full |
| The repository: README, BUILD_STATUS, guide, bank, pitch, architecture, navigation, matrix, pack, worksheet, evaluation files, server and access code, tests | Read before editing |

## 5. Commands and exit codes

### 5.1 Baseline: untouched Iteration 6 checkout, build sandbox (`evidence/iteration7/baseline/exit-codes.txt`)

Starting state recorded before any edit: archive SHA-256 `1147807d06f546eb5e8d0bc60904101a0ae42f737c8abb28a40ade4b5ddeb735`; HEAD `beb959621d00d4628fe993c0cc41462f806a7313`; 23 commits; tree `69a86803fa007a62b35967562c2647a78fad1500`; Node v22.22.0, npm 10.9.4, Linux 6.18.44; Chromium 141.0.7390.37 through `CHROME_PATH=/tmp/chromium`; `git status` showed only the evidence folder being written.

| Command | Exit | Result |
|---|---|---|
| `npm ci` | 0 | no dependencies |
| `npm test` | 0 | 207 passed, 0 failed |
| `npm run check` | 0 | syntax check passed |
| `npm run check:content` | 0 | 8 items, all `UNREVIEWED_DRAFT`, 0 problems |
| `npm run preflight` | 0 | PASSED (mock only) |
| `npm run capture` | 0 | 19 passed, 0 failed, 0 blocked |
| `npm run e2e` | 0 | 100 passed, 0 failed |
| `npm run a11y` | 0 | 33 states, 462 checks, 0 failed |
| `npm run evaluate` | 0 | 47/47 valid, 34/47 agreement, 0/8, 2/12 |
| `npm run smoke`, Groq `evaluate` | not run | BLOCKED: credentials not configured (as in every earlier iteration) |

### 5.2 The team's Mac log (not run here)

Node 26.8.2: `npm ci` ok; `npm test` 207 passed; `check`, `check:content`, `preflight` ok; `capture` 10 passed and 1 failed (`ENOENT … '/usr/bin/chromium'`); `e2e` BLOCKED; `a11y` BLOCKED; mock `evaluate` as above; `smoke` and Groq `evaluate` BLOCKED. Exit codes were not printed in the log.

### 5.3 Final run after the Iteration 7 edits

Run in the build sandbox at commit `3c33b44` (`evidence/iteration7/final/exit-codes.txt`; Chromium 141.0.7390.37 through `CHROME_PATH`). The documentation files were edited afterwards only to record these results; the fresh-extraction check in the package re-runs the unit tests and static checks on the final tree.

| Command | Exit | Result |
|---|---|---|
| `npm ci` | 0 | no dependencies |
| `npm test` | 0 | 217 passed, 0 failed (207 earlier + 10 new documentation-integrity tests) |
| `npm run check` | 0 | syntax check passed |
| `npm run check:content` | 0 | 8 items, all `UNREVIEWED_DRAFT`, 0 problems |
| `npm run preflight` | 0 | PASSED (mock only) |
| `npm run capture` | 0 | 19 passed, 0 failed, 0 blocked |
| `npm run e2e` | 0 | 100 passed, 0 failed |
| `npm run a11y` | 0 | 33 states, 462 checks, 0 failed |
| `npm run evaluate` | 0 | 47/47 valid, 34/47 agreement, 0/8, 2/12 |
| `npm run smoke`, Groq `evaluate` | not run | BLOCKED: credentials not configured |

Not tested: any phone, any HTTPS tunnel, any reviewer, the Mac browser path, the live Groq API.
