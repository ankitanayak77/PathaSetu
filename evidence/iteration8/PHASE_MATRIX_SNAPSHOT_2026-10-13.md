# Phase matrix snapshot — 2026-10-13T22:14:16+05:30

Copy of `docs/PHASE_COMPLETION_MATRIX.md` taken at 2026-10-13T22:14:16+05:30 (IST) on 13 October 2026 for HEAD `54f7c4c8068fcd70e1e775e5b6fe7f5ff19a1815` plus the uncommitted Iteration 8 working tree. It is a record; the live file is in `docs/`. Overall: **93/195 = 47.7%** (unique applicable criteria).

| Phase | Completed / total | % complete |
|---|---|---|
| P0 Rules, provenance and governance | 7/12 | 58.3% |
| P1 Problem discovery and learner needs | 3/6 | 50.0% |
| P2 Boards, classes, subjects, books and syllabus crosswalk | 7/28 | 25.0% |
| P3 Content authoring and localization | 4/6 | 66.7% |
| P4 Product requirements, UX and accessibility design | 4/6 | 66.7% |
| P5 Architecture and core learning workflow | 6/7 | 85.7% |
| P6 Agent, planner and diagnosis logic | 5/6 | 83.3% |
| P7 Offline-first behaviour and local state | 8/8 | 100.0% |
| P8 Language bridge and practice | 3/3 | 100.0% |
| P9 Security, privacy and abuse controls | 7/9 | 77.8% |
| P10 Automated quality and evaluation | 11/12 | 91.7% |
| P11 Cross-browser and responsive testing | 4/6 | 66.7% |
| P12 Physical device and network verification | 0/10 | 0.0% |
| P13 Model/provider eligibility and empirical quality | 4/8 | 50.0% |
| P14 Hosting and demo operations | 2/7 | 28.6% |
| P15 Academic validity and learning measurement | 2/8 | 25.0% |
| P16 Competition submission and presentation | 4/7 | 57.1% |
| P17 Future expansion and maintenance | 0/24 | 0.0% |
| P18 Market and competitor evidence | 6/12 | 50.0% |
| P19 Feature discovery and prioritisation | 6/10 | 60.0% |
| **All** | **93/195** | **47.7%** |

Implementation: 93/147 = 63.3%. Readiness gates: 0/48 = 0.0%.

---

# Pathasetu — phase completion matrix

**Snapshot:** 2026-10-13T22:14:16+05:30 (IST), 13 October 2026. **Repository:** HEAD `54f7c4c8068fcd70e1e775e5b6fe7f5ff19a1815` (26 commits) plus the **uncommitted Iteration 8 working tree**. A timestamped copy is in `evidence/iteration8/` (see the end of this file). **Machine-readable criteria:** `docs/PHASE_CRITERIA.csv`. **Related:** `docs/BUILD_STATUS.md`, `docs/FEATURE_OPPORTUNITY_BACKLOG.md`, `docs/COMPETITIVE_LANDSCAPE.md`, `docs/RULE_4_1_STATUS.md`.

## Basis and limits

- **What was examined:** `docs/BUILD_STATUS.md`, `docs/DECISION_REGISTER.md`, `docs/DECISION_LOG.csv`, `docs/CLAIM_EVIDENCE_MATRIX.csv`, `docs/BOARD_CLASS_BOOK_COMPARISON.md`, `docs/BOARD_COVERAGE_REGISTER.csv`, `docs/BOOK_CROSSWALK.csv`, `docs/PHONE_TEST_RESULTS_TEMPLATE.csv`, the evidence folders `iteration2` to `iteration8`, `package.json`, the source, test and script folders, and official pages opened on 13 October 2026.
- **No phase tracker existed before this file.** The repository tracked iterations (1 to 8), decisions (D###) and claims (C##), not phases. The twenty phases P0 to P19 below are the Iteration 8 brief's lifecycle categories and the criteria IDs (`P#-##`) are new. They are an enumeration by the AI-assisted build and **need the team's agreement** before being treated as a baseline.
- **Rule used:** % complete = fully completed applicable criteria ÷ applicable criteria. `BLOCKED`, `IN_PROGRESS`, `NOT_STARTED` and `NOT_TESTED` stay in the denominator. A criterion counts only when evidence proves it. A passing test is not a review; a plan is not a phone test; a consistency check is not a teacher approval.
- **The earlier preliminary figure (69 of 165) is not carried forward.** It was computed before the Iteration 8 work, before P18 and P19 existed and before several rows changed. Everything here is recalculated from the criteria list.
- **Not applicable:** 1 criterion (P7-09: first visit with no prior connection; a web app needs one online visit, by design D080).
- **Not independently verified:** that the sandbox results hold on another machine (the team's Mac has not run the browser steps); anything the team reports about the organisers; the content of pages the reading tool could not open (the Odisha school-department textbook listing, CISCE PDFs, WBBSE syllabus, Jigyaso, Bhashini service pages).
- A percentage is evidence-based checklist coverage. It is not quality, syllabus approval, event eligibility or a probability of success.

## Overall (unique criteria, no double counting)

| Measure | Completed / applicable | % complete | % remaining |
|---|---|---|---|
| **All applicable criteria** | 93/195 | 47.7% | 52.3% |
| Launch scope (BSE Odisha Class X Electricity MVP and its evidence, P0 to P16, P18, P19) | 92/152 | 60.5% | 39.5% |
| Expansion scope (other boards, future features) | 1/43 | 2.3% | 97.7% |
| **Implementation completion** (code, tests, documents) | 93/147 | 63.3% | 36.7% |
| **Readiness gates** (approvals, reviews, real-device tests, organiser replies) | 0/48 | 0.0% | 100.0% |
| Launch scope, implementation only | 92/110 | 83.6% | 16.4% |
| Launch scope, readiness gates only | 0/42 | 0.0% | 100.0% |

The overall figure is **93/195 = 47.7% complete, 52.3% remaining**. It is computed from the 195 unique applicable criteria, not as the mean of the phase percentages. Reading it: implementation work for the launch scope is mostly in place; the readiness gates (organiser reply, qualified review, real phones, provider approval) are almost all open, and the expansion scope has not started.

*Sensitivity.* P12 counts the seven device and browser combinations as seven criteria; the phone template has 161 individual steps (7 × 23). Counting every step would give 93/346 = 26.9% overall. The choice of seven is disclosed so it can be challenged. Counts by state: BLOCKED 15, DONE 93, IN PROGRESS 6, NA 1, NOT STARTED 68, NOT TESTED 13.

## Phase table

Criteria IDs are shown without their phase prefix. Full text and evidence are in the phase details and the appendix.

| Phase | Name | Status | Fully completed (with evidence) | In progress | Left / not started | Blocked or not tested (external) | Completed / total | % complete | % remaining | Next action | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| P0 | Rules, provenance and governance | PARTIAL | 01, 02, 03, 04, 05, 09, 11 | — | 12 | 06, 07, 08, 10 | 7/12 | 58.3% | 41.7% | Team sends docs/ORGANIZER_CLARIFICATION_UNSENT.md and saves any reply with its date; update RULE_4_1_STATUS and D205 | see appendix P0 |
| P1 | Problem discovery and learner needs | PARTIAL | 01, 02, 03 | — | 04, 05, 06 | — | 3/6 | 50.0% | 50.0% | Arrange one teacher/learner conversation (team) | see appendix P1 |
| P2 | Boards, classes, subjects, books and syllabus crosswalk | PARTIAL | 01, 02, 05, BSE-HSC-B1, CBSE-B1, 06, 07 | BSE-HSC-B3, CBSE-B2, CHSE-B1, NIOS-B1, NIOS-B2 | 03, 04, BSE-MAD-B2, BSE-MAD-B3, CBSE-B3, CISCE-B2, CISCE-B3, CHSE-B2, CHSE-B3, NIOS-B3, WBBSE-B1, WBBSE-B2, WBBSE-B3 | BSE-HSC-B2, BSE-MAD-B1, CISCE-B1 | 7/28 | 25.0% | 75.0% | Open the CISCE, CHSE and WBBSE syllabus documents themselves; identify textbooks and editions; obtain the BSE textbook edition | see appendix P2 |
| P3 | Content authoring and localization | PARTIAL | 01, 02, 03, 04 | — | 05, 06 | — | 4/6 | 66.7% | 33.3% | Obtain the textbook glossary (needs the book) | see appendix P3 |
| P4 | Product requirements, UX and accessibility design | PARTIAL | 01, 02, 03, 04 | — | 05, 06 | — | 4/6 | 66.7% | 33.3% | Odia UI-string review (needs an Odia speaker) | see appendix P4 |
| P5 | Architecture and core learning workflow | PARTIAL | 01, 02, 03, 04, 05, 06 | — | 07 | — | 6/7 | 85.7% | 14.3% | Check the exam-date planner against a real timetable | see appendix P5 |
| P6 | Agent, planner and diagnosis logic | PARTIAL | 01, 02, 03, 04, 05 | — | 06 | — | 5/6 | 83.3% | 16.7% | Reviewer comparison of planner choices | see appendix P6 |
| P7 | Offline-first behaviour and local state | COMPLETE for the listed criteria | 01, 02, 03, 04, 05, 06, 07, 08 | — | — | — | 8/8 | 100.0% | 0.0% | None for the sandbox scope; phones are P12 | see appendix P7 |
| P8 | Language bridge and practice | COMPLETE for the listed criteria | 01, 02, 03 | — | — | — | 3/3 | 100.0% | 0.0% | None for the sandbox scope; terminology review is P15 | see appendix P8 |
| P9 | Security, privacy and abuse controls | PARTIAL | 01, 02, 03, 04, 05, 06, 07 | — | 09 | 08 | 7/9 | 77.8% | 22.2% | Provider data-controls review once credentials and approval exist | see appendix P9 |
| P10 | Automated quality and evaluation | PARTIAL | 01, 02, 03, 04, 05, 06, 07, 08, 10, 11, 12 | — | 09 | — | 11/12 | 91.7% | 8.3% | Add fault-injection tests for validator/retry | see appendix P10 |
| P11 | Cross-browser and responsive testing | PARTIAL | 01, 02, 04, 06 | — | — | 03, 05 | 4/6 | 66.7% | 33.3% | Team runs the browser steps on the Mac with CHROME_PATH or a standard install; record the result or BLOCKED | see appendix P11 |
| P12 | Physical device and network verification | NOT TESTED | — | — | — | 01, 02, 03, 04, 05, 06, 07, 08, 09, 10 | 0/10 | 0.0% | 100.0% | Run docs/PHONE_TEST_PLAN.md on the seven combinations | see appendix P12 |
| P13 | Model/provider eligibility and empirical quality | PARTIAL | 01, 02, 03, 04 | — | — | 05, 06, 07, 08 | 4/8 | 50.0% | 50.0% | Wait for written provider eligibility; then smoke on synthetic phrases only | see appendix P13 |
| P14 | Hosting and demo operations | PARTIAL | 01, 02 | — | 03, 04, 05, 06, 07 | — | 2/7 | 28.6% | 71.4% | Choose the HTTPS host, then preflight with --expect-origin; add a fallback section | see appendix P14 |
| P15 | Academic validity and learning measurement | PARTIAL | 01, 02 | — | 06, 07, 08 | 03, 04, 05 | 2/8 | 25.0% | 75.0% | Identify a qualified reviewer | see appendix P15 |
| P16 | Competition submission and presentation | PARTIAL | 01, 02, 03, 04 | — | 05, 06, 07 | — | 4/7 | 57.1% | 42.9% | Re-check deck/diagram against the claims matrix; fill team details | see appendix P16 |
| P17 | Future expansion and maintenance | NOT STARTED | — | — | 01, 02, 03, 04, 05, 06, BSE-MAD-B4, BSE-MAD-B5, BSE-MAD-B6, CBSE-B4, CBSE-B5, CBSE-B6, CISCE-B4, CISCE-B5, CISCE-B6, CHSE-B4, CHSE-B5, CHSE-B6, NIOS-B4, NIOS-B5, NIOS-B6, WBBSE-B4, WBBSE-B5, WBBSE-B6 | — | 0/24 | 0.0% | 100.0% | Write the multi-board selector as a separate ticket after the register is complete | see appendix P17 |
| P18 | Market and competitor evidence | PARTIAL | 01, 02, 03, 04, 05, 06 | 08 | 07, 09, 10, 12 | 11 | 6/12 | 50.0% | 50.0% | Open Jigyaso and Khan Academy India by hand; read ASER 2024; widen the search | see appendix P18 |
| P19 | Feature discovery and prioritisation | PARTIAL | 01, 02, 03, 04, 05, 06 | — | 07, 08, 09, 10 | — | 6/10 | 60.0% | 40.0% | Team reviews scores; describe the data-saver issue | see appendix P19 |
| **All** | | | | | | | **93/195** | **47.7%** | **52.3%** | | |

## Per-board status (P2 and the board rows in P3, P5, P15, P17)

Four states are kept apart for every board: **source checked**, **content authored**, **qualified review**, and **implemented and tested**. Each board has six criteria: B1 official syllabus opened with session recorded, B2 textbook identified with edition, B3 Electricity mapped to common concept IDs (all in P2), then B4 content authored, B5 qualified review, B6 selection path implemented and tested (BSE HSC in P3, P15 and P5; the others in P17). Sources were retrieved on 13 October 2026. The machine-readable version of the same register, with twelve more fields per board, is `docs/BOARD_COVERAGE_REGISTER.csv`.

| Board / pathway | Level | Source checked: B1 / B2 / B3 | Content authored (B4) | Qualified review (B5) | Implemented and tested (B6) | Done / 6 | % | What remains |
|---|---|---|---|---|---|---|---|---|
| BSE Odisha HSC Class X (General Science: Physical Science) | Class X | DONE / BLOCKED / IN PROGRESS | DONE | BLOCKED | DONE | 3/6 | 50.0% | Book edition, chapter and page (UNKNOWN); item-level mapping; qualified reviewer; the board syllabus lists Electricity with no sub-topics |
| BSE Odisha Madhyama Class X | Class X (assumed; UNKNOWN) | BLOCKED / NOT STARTED / NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | 0/6 | 0.0% | Find any primary Madhyama syllabus; decide whether it is a separate pathway (UNKNOWN) |
| CBSE Class X Science | Class X | DONE / IN PROGRESS / NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | 1/6 | 16.7% | Identify the textbook and edition; map Electricity; author, review, implement |
| CISCE ICSE Class X (Physics within Science) | Class X (ICSE exam) | BLOCKED / NOT STARTED / NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | 0/6 | 0.0% | Open the ICSE Physics syllabus for the right examination year (2027 and 2028 documents both exist); identify the textbook; author, review, implement |
| CHSE Odisha +2 (Classes XI–XII; not Class X) | +2 / XI to XII (not Class X) | IN PROGRESS / NOT STARTED / NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | 0/6 | 0.0% | Open the +2 Physics syllabus; keep as a later class-level track and make no Class X claim |
| NIOS Secondary (Science & Technology 212) | Secondary (X-equivalent) | IN PROGRESS / IN PROGRESS / NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | 0/6 | 0.0% | Get Odia-medium chapter titles and edition; check lessons 16 and 17 against the Odia books; author, review, implement |
| WBBSE Class X (Madhyamik) | Class X (Madhyamik) | NOT STARTED / NOT STARTED / NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | 0/6 | 0.0% | Reach a primary Madhyamik syllabus (keep apart from WBCHSE); author, review, implement |

"OTHER-STATE-X" in the register (other state boards) is out of scope with a stated reason and is not counted. A board counts as supported only when it has a sourced pack, a qualified review, valid mappings, passing content checks and a tested selection path; **only the BSE HSC draft path exists, and its content is unreviewed**.

Per-board source notes (13 October 2026):

- **BSE-HSC B1** (DONE): Repo records the 2026-27 syllabus PDF (S1). The BSE pattern PDF "Annual HSC Examination, 2026" was also opened on 13 Oct 2026 but is not yet recorded in the repo.
- **BSE-HSC B2** (BLOCKED): Syllabus names two prescribed books but no publisher/edition/year; SME listing refused the tool; needs the physical book
- **BSE-MAD B1** (BLOCKED): BSE page menu lists Madhyama scheme/syllabus entries that link to "#"; no content reached
- **CBSE B1** (DONE): docs/BOARD_CLASS_BOOK_COMPARISON.md (S13: Class X Science curriculum 2026-27 read through a summarising tool; page numbers UNKNOWN)
- **CBSE B2** (IN PROGRESS): S13 gives a textbook statement; title, edition and year not verified; the "Reading Material" link filename contains "IX" and is unresolved
- **CISCE B1** (BLOCKED): Official PDFs located by search (S19) but the reading tool could not open any CISCE PDF; the ICSE 2027 and 2028 documents both exist and which applies is UNKNOWN
- **CHSE B1** (IN PROGRESS): Syllabus listing opened: 43 entries, all +2/vocational; "PHYSICS (RATIONALISED 2023)"; the document itself not opened
- **NIOS B1** (IN PROGRESS): 212 syllabus page opened (English/Hindi); no year or revision stated
- **NIOS B2** (IN PROGRESS): Bhubaneswar regional-centre page lists "Science & Technology (212)- Odia Medium": Book-1 ch. 1–18, Book-2 ch. 19–32.3, Lab file; chapter titles and edition not stated
- **WBBSE B1** (NOT STARTED): Home page and a 2025 results booklet only (S20); no syllabus reached; WBCHSE not mentioned

## Reconciliation: where records disagree (history preserved, not rewritten)

1. **"HSC".** Iteration 7 recorded that the syllabus PDF does not use the word "HSC". Iteration 8 found BSE's question-pattern document for the 2026 annual examination uses "Annual HSC Examination, 2026" (source S12). Both statements are kept: the first is true of that PDF; the broader caution that "HSC is only the team's label" is withdrawn.
2. **Madhyama.** The BSE syllabus page menu lists Madhyama entries that link nowhere (S11). Madhyama stays UNKNOWN and BLOCKED, not "distinct".
3. **Test count and results.** `docs/BUILD_STATUS.md` quotes one current marker; earlier counts (182, 198, 207, 217) are labelled history. A test enforces this.
4. **Browser steps.** The team's Mac log and the managed-machine report show the browser steps BLOCKED; the sandbox shows them passing. These are different environments and are both kept. Neither is promoted into the other.
5. **Event dates.** The rules page says 11 to 15 October 2026; the event page says 14 to 15 October 2026. Unresolved until stated in writing (P0-08).
6. **Board register.** The Iteration 7 register had no CHSE row and described CISCE and WBBSE as not reached; Iteration 8 adds CHSE (+2 only) and records what was and was not opened.
7. **Preliminary matrix.** The 69 of 165 figure from the preliminary draft is superseded by the recalculation above.

## Phase details: what is done and what remains

### P0 — Rules, provenance and governance: 7/12 = 58.3%

- **Done:** Rule 4.1 and the event window recorded from the official pages (D180, D182) (`docs/DECISION_LOG.csv`); AI-assisted provenance disclosed in repository documents (D183, C45) (`docs/BUILD_STATUS.md`); History kept append-only (26 commits, all authored "Claude (AI-assisted build)") (`evidence/iteration8/baseline/environment.txt`); Earlier evidence folders (iteration2 to 7) preserved unmodified: 229 files protected by a recorded digest list; each iteration adds a new folder (`evidence/iteration8/historical-evidence-hashes.txt`); Team-reported organizer permission labelled team-reported, never as a written ruling (`tests/iteration7-decisions.test.js`); Organizer message drafted and saved in the repository records, marked UNSENT (`docs/ORGANIZER_CLARIFICATION_UNSENT.md`); RULE_4_1_STATUS=UNCONFIRMED recorded with the rules the build follows (D205) (`docs/RULE_4_1_STATUS.md`).
- **Remains:** Written organizer ruling on Rule 4.1 and the pre-event prototype saved in project records [BLOCKED: Needs organizer reply]; Written ruling on whether a Groq-hosted open-weight model is an eligible "external open-source LLM API" [BLOCKED: Needs organizer reply]; Assigned mid-evaluation slot confirmed in writing (D182) [BLOCKED: Needs organizer reply]; Organizer feedback on how pre-event, AI-assisted work should be disclosed in the submission, saved in the project records [BLOCKED: Depends on P0-06]; Organizer message actually sent by the team and the reply saved with its date [NOT STARTED: Team action; the message is UNSENT].

### P1 — Problem discovery and learner needs: 3/6 = 50.0%

- **Done:** Target learner persona chosen and recorded (Odia-medium Class X, Electricity) (`docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md`); Language and geography context recorded (Odisha, Odia medium) (`docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md`); Shared-device and connectivity constraints recorded, with the single-record limit enforced in wording (`tests/iteration6-claims.test.js`).
- **Remains:** Persona assumptions checked with a real learner or teacher (U18) [NOT STARTED]; Problem validated by interview or observation [NOT STARTED]; Real data cost and connectivity measured (U20) [NOT STARTED].

### P2 — Boards, classes, subjects, books and syllabus crosswalk: 7/28 = 25.0%

- **Done:** Board/class/book comparison register with stated source versions exists (`docs/BOARD_CLASS_BOOK_COMPARISON.md`); Eight-row book crosswalk scaffold exists with book fields UNKNOWN and checked against the pack (`docs/BOOK_CROSSWALK.csv`); Register names all seven tracks correctly (CISCE council vs ICSE exam; CHSE as +2 only; WBBSE vs WBCHSE) (`docs/BOARD_CLASS_BOOK_COMPARISON.md`); BSE Odisha HSC Class X (General Science: Physical Science): official syllabus/curriculum for the class opened; session or year recorded (`docs/BOARD_CLASS_BOOK_COMPARISON.md`); CBSE Class X Science: official syllabus/curriculum for the class opened; session or year recorded (`docs/BOARD_CLASS_BOOK_COMPARISON.md (S13: Class X Science curriculum 2026-27 read through a summarising tool`); Machine-readable board coverage register with the required fields, kept in step with the comparison table by a test (`docs/BOARD_COVERAGE_REGISTER.csv`); Register states that no board other than BSE HSC has any content, review or selection support (no board picker) (`docs/BOARD_COVERAGE_REGISTER.csv`).
- **Remains:** Common concept IDs defined across boards, each mapping backed by source evidence [NOT STARTED]; Board-selection requirements written as testable gates (no board picker onto BSE questions) [NOT STARTED]; BSE Odisha HSC Class X (General Science: Physical Science): official textbook or learning material identified with title and edition/year [BLOCKED: Syllabus names two prescribed books but no publisher/edition/year; SME listing refused the tool; needs the physical book]; BSE Odisha HSC Class X (General Science: Physical Science): Electricity topic mapped to common concept IDs with source evidence [IN PROGRESS]; BSE Odisha Madhyama Class X: official syllabus/curriculum for the class opened; session or year recorded [BLOCKED: BSE page menu lists Madhyama scheme/syllabus entries that link to "#"; no content reached]; BSE Odisha Madhyama Class X: official textbook or learning material identified with title and edition/year [NOT STARTED]; BSE Odisha Madhyama Class X: Electricity topic mapped to common concept IDs with source evidence [NOT STARTED]; CBSE Class X Science: official textbook or learning material identified with title and edition/year [IN PROGRESS: S13 gives a textbook statement; title, edition and year not verified; the "Reading Material" link filename contains "IX" and is unresolved]; CBSE Class X Science: Electricity topic mapped to common concept IDs with source evidence [NOT STARTED]; CISCE ICSE Class X (Physics within Science): official syllabus/curriculum for the class opened; session or year recorded [BLOCKED: Official PDFs located by search (S19) but the reading tool could not open any CISCE PDF; the ICSE 2027 and 2028 documents both exist and which applies is UNKNOWN]; CISCE ICSE Class X (Physics within Science): official textbook or learning material identified with title and edition/year [NOT STARTED]; CISCE ICSE Class X (Physics within Science): Electricity topic mapped to common concept IDs with source evidence [NOT STARTED]; CHSE Odisha +2 (Classes XI–XII; not Class X): official syllabus/curriculum for the class opened; session or year recorded [IN PROGRESS: Syllabus listing opened: 43 entries, all +2/vocational; "PHYSICS (RATIONALISED 2023)"; the document itself not opened]; CHSE Odisha +2 (Classes XI–XII; not Class X): official textbook or learning material identified with title and edition/year [NOT STARTED]; CHSE Odisha +2 (Classes XI–XII; not Class X): Electricity topic mapped to common concept IDs with source evidence [NOT STARTED]; NIOS Secondary (Science & Technology 212): official syllabus/curriculum for the class opened; session or year recorded [IN PROGRESS: 212 syllabus page opened (English/Hindi); no year or revision stated]; NIOS Secondary (Science & Technology 212): official textbook or learning material identified with title and edition/year [IN PROGRESS: Bhubaneswar regional-centre page lists "Science & Technology (212)- Odia Medium": Book-1 ch. 1–18, Book-2 ch. 19–32.3, Lab file; chapter titles and edition not stated]; NIOS Secondary (Science & Technology 212): Electricity topic mapped to common concept IDs with source evidence [NOT STARTED]; WBBSE Class X (Madhyamik): official syllabus/curriculum for the class opened; session or year recorded [NOT STARTED: Home page and a 2025 results booklet only (S20); no syllabus reached; WBCHSE not mentioned]; WBBSE Class X (Madhyamik): official textbook or learning material identified with title and edition/year [NOT STARTED]; WBBSE Class X (Madhyamik): Electricity topic mapped to common concept IDs with source evidence [NOT STARTED].

### P3 — Content authoring and localization: 4/6 = 66.7%

- **Done:** BSE HSC: eight Electricity items authored with options, key, explanation (B4) (`content/electricity-pack.json`); Pack, worksheet and evaluation files checked for consistency automatically (`scripts/check-content-consistency.mjs`); Odia draft fields and language-bridge fields present for all eight items (`content/electricity-pack.json`); Status label UNREVIEWED_DRAFT enforced on every item (`scripts/check-content-consistency.mjs`).
- **Remains:** School-Odia terminology list sourced from the learner's actual textbook [NOT STARTED: Needs the book (P2-BSE-HSC-B2)]; Roman-Odia and Odia-script handling for free-text answers specified and reviewed (U08) [NOT STARTED].

### P4 — Product requirements, UX and accessibility design: 4/6 = 66.7%

- **Done:** User journeys and workflow documented and kept in step with the code (`docs/NAVIGATION_AND_WORKFLOW.md`); Mobile layout, 44 px targets, contrast, reflow, lang and landmarks checked automatically (33 states, 462 checks) (`evidence/iteration8/final/accessibility/`); Keyboard focus checks automated (`scripts/accessibility-audit.mjs`); Asset sizes for low bandwidth measured on 13 Oct 2026 (`docs/CLAIM_EVIDENCE_MATRIX.csv`).
- **Remains:** Odia interface strings reviewed by an Odia speaker [NOT STARTED]; One usability observation with a real learner or teacher [NOT STARTED].

### P5 — Architecture and core learning workflow: 6/7 = 85.7%

- **Done:** App shell and Node server serve page, pack and service worker (`tests/server.test.js`); Controller loop observe→propose→validate→plan→act→save/trace→re-check implemented (`tests/agent.test.js`); Current-question path with selected option, typed explanation, feedback and next step (`evidence/iteration8/final/browser-regression.json`); Decision trace visible to the learner (`evidence/iteration8/final/browser-regression.json`); Architecture documents (`docs/ARCHITECTURE.md`); BSE HSC Class X Electricity launch path implemented and tested (B6; there is no board selector) (`evidence/iteration8/final/browser-regression.json`).
- **Remains:** Exam-date planner checked against a real exam timetable (it is heuristic) [NOT STARTED].

### P6 — Agent, planner and diagnosis logic: 5/6 = 83.3%

- **Done:** Deterministic option-linked mock provider labelled MOCK (`tests/agent.test.js`); Validator allow-list for misconception IDs, question ID, confidence (`tests/validator.test.js`); Abstention (uncertain) path valid and tested (`tests/validator.test.js`); Deterministic planner with a rationale in the trace (`tests/agent.test.js`); Wording that the mock does not read free text semantically enforced (`tests/iteration6-claims.test.js`).
- **Remains:** Planner choices compared with a qualified reviewer's judgement [NOT STARTED].

### P7 — Offline-first behaviour and local state: 8/8 = 100.0%

- **Done:** Service-worker shell cache (pathasetu-shell-v8) (`evidence/iteration8/final/capture.json`); IndexedDB persistence with in-memory fallback (`tests/storage-resilience.test.js`); Queued re-checks with bounded retry (5 attempts, 5/10/20/40 s, then paused with Retry now) (`tests/retry.test.js`); Reconnect drains the queue without switching the active question; draft kept (`evidence/iteration8/final/browser-regression.json`); Offline probe (1,800 ms) settles to offline; hung request times out and queue recovers (J4, J4b) (`evidence/iteration8/final/browser-regression.json`); Corrupted or over-quota storage recovers (synthetic) (`tests/storage-resilience.test.js`); Single-writer across tabs (Web Locks) (`evidence/iteration8/final/browser-regression.json`); Update notice when a new service worker is waiting (`evidence/iteration8/final/browser-regression.json`).
- **Remains:** nothing in this list.

### P8 — Language bridge and practice: 3/3 = 100.0%

- **Done:** Everyday ↔ school Odia ↔ English bridge fields for all eight items (`content/electricity-pack.json`); Offline practice with source reveal implemented and tested (`tests/bridge.test.js`); Ambiguity handling in the bridge tested (`tests/bridge.test.js`).
- **Remains:** nothing in this list.

### P9 — Security, privacy and abuse controls: 7/9 = 77.8%

- **Done:** Shared demo-code gate: header, constant-time compare, 16-character minimum (`tests/access-policy.test.js`); Rate limits (20 failed/60 s, 24 re-checks/min, 30 session-pack/min) and 16 KB body limit (`tests/public-demo.test.js`); Exact-origin allow-list (`tests/proxy-origin.test.js`); Fail-closed public-demo mode requiring explicit draft acknowledgement (`tests/public-demo.test.js`); Preflight validates configuration without calling a hosted model (`tests/preflight.test.js`); Provider adapter keeps the key server-side and does not leak provider error detail (`tests/groqModel.test.js`); Data-flow wording: "no data leaves the device" is not claimed (`tests/iteration6-claims.test.js`).
- **Remains:** Provider data controls reviewed and zero data retention confirmed in the provider console [BLOCKED: Needs team account and credentials]; Answer key kept off the browser (server-side grading) [NOT STARTED: Known A1 limitation: key ships to the browser].

### P10 — Automated quality and evaluation: 11/12 = 91.7%

- **Done:** Unit suite (217 tests) passes (`evidence/iteration8/final/npm-test.txt`); Content consistency check passes (`evidence/iteration8/final/npm-check-content.txt`); Synthetic evaluation harness (47 cases) and deterministic baseline recorded (`evidence/iteration8/final/evaluation-outputs/`); Headless browser regression (100 checks) in the Linux sandbox (`evidence/iteration8/final/browser-regression.json`); Automated accessibility audit (462 checks) (`evidence/iteration8/final/accessibility/`); Screen capture run (19 checks) (`evidence/iteration8/final/capture.json`); Fresh-extraction and patch-reproduction check performed for each package (`evidence/iteration7/baseline/README-baseline.txt`); Claim and decision-log integrity tests (`tests/iteration7-decisions.test.js`); Browser-path resolver tested (15 tests, written first; the first run failed as expected) (`tests/browser-path.test.js`); Iteration 8 documentation tests: board register, competitor wording, backlog CSV, phase matrix numbers, Rule 4.1 record (`tests/iteration8-docs.test.js`); Runtime-unchanged guard refactored (not deleted): historical digests plus a declared-change record (`tests/iteration7-decisions.test.js`).
- **Remains:** Mutation or fault-injection testing of the validator and retry logic [NOT STARTED].

### P11 — Cross-browser and responsive testing: 4/6 = 66.7%

- **Done:** Headless Chromium 141 on Linux, responsive viewports (`evidence/iteration8/final/accessibility/`); One shared, tested browser-path resolver used by every browser script (CHROME_PATH first; invalid means BLOCKED; macOS, Linux, Windows locations; no network or download) (`scripts/lib/browser-path.mjs`); Evidence files record the browser executable, how it was chosen and its version (`evidence/iteration8/final/capture.json`); Missing or invalid browser reports BLOCKED (exit 2) and a managed-device policy refusal stays a separate POLICY_BLOCKED (`tests/browser-path.test.js`).
- **Remains:** Capture, e2e and a11y run on the team's Mac with a browser that exists and is permitted [NOT TESTED: The resolver now exists; the Mac run itself has not been seen (and may be policy-blocked: U16)]; Safari / WebKit engine exercised in any form [NOT TESTED].

### P12 — Physical device and network verification: 0/10 = 0.0%

- **Done:** nothing yet.
- **Remains:** Phone test plan (23 steps) executed and results recorded: Galaxy S23 / Chrome [NOT TESTED]; Phone test plan (23 steps) executed and results recorded: Galaxy S23 / Samsung Internet [NOT TESTED]; Phone test plan (23 steps) executed and results recorded: Galaxy S25 / Chrome [NOT TESTED]; Phone test plan (23 steps) executed and results recorded: Galaxy S25 / Samsung Internet [NOT TESTED]; Phone test plan (23 steps) executed and results recorded: Galaxy S25 FE / Chrome [NOT TESTED]; Phone test plan (23 steps) executed and results recorded: Galaxy S25 FE / Samsung Internet [NOT TESTED]; Phone test plan (23 steps) executed and results recorded: iPhone 16 / Safari (HTTPS) [NOT TESTED]; Screen-reader (TalkBack, VoiceOver) steps added to the plan and executed [NOT TESTED]; Poor-network and offline-switch behaviour observed on a real phone [NOT TESTED]; Odia font rendering and legibility checked on a real phone [NOT TESTED].

### P13 — Model/provider eligibility and empirical quality: 4/8 = 50.0%

- **Done:** Default provider is mock and labelled (`tests/iteration6-claims.test.js`); Groq adapter implemented (server-side key, structured output, timeout) and unit-tested against a fake server (`tests/groqModel.test.js`); Deterministic offline evaluation baseline recorded (47/47 valid, 34/47 agreement, 0/8, 2/12) (`evidence/iteration8/final/npm-evaluate.txt`); Live-provider gate recorded as BLOCKED, not hidden (`evidence/iteration5/gates/GATE_STATUS.md`).
- **Remains:** Live smoke test (13 synthetic requests) run and recorded [BLOCKED: No credentials; no written approval]; Live Groq evaluation on the 47 synthetic cases run and recorded [BLOCKED]; Latency and rate limits characterised against the real provider [BLOCKED]; Odia / Roman-Odia free-text quality evaluated on a reviewer-labelled set [BLOCKED: Needs reviewer labels (P15-05)].

### P14 — Hosting and demo operations: 2/7 = 28.6%

- **Done:** Demo runbook, HTTPS runbook and event-day checklist written (`docs/DEMO_RUNBOOK.md`); Preflight command for the protected-demo configuration (`tests/preflight.test.js`).
- **Remains:** HTTPS host or tunnel chosen [NOT STARTED]; Preflight passed against the chosen HTTPS origin (--expect-origin) [NOT STARTED]; Tunnel provider logging and terms reviewed (U10) [NOT STARTED]; Written fallback plan for a failed network or tunnel at the venue [NOT STARTED: No fallback section found in the runbooks]; Timed event-day rehearsal done [NOT STARTED].

### P15 — Academic validity and learning measurement: 2/8 = 25.0%

- **Done:** Reviewer rubric, guide and worksheet prepared (`docs/CONTENT_REVIEW_RUBRIC.md`); Evaluation template for reviewer labels prepared (47 rows, 24 blank) (`scripts/check-content-consistency.mjs`).
- **Remains:** Qualified Odia-medium science reviewer identified [BLOCKED]; BSE HSC: scientific and Odia review of all eight items (B5) [BLOCKED: All eight remain UNREVIEWED_DRAFT]; Reviewer-labelled evaluation set completed [BLOCKED]; Learning outcomes and measurement plan defined [NOT STARTED]; Consent and ethics plan for any learner study [NOT STARTED]; Any learning-gain study run [NOT STARTED].

### P16 — Competition submission and presentation: 4/7 = 57.1%

- **Done:** Pitch scripts with a safe-wording table (`docs/PITCH_SCRIPTS.md`); Jury Q&A bank (176 questions) with evidence status (`docs/JURY_QA_BANK.md`); Claim–evidence matrix (60 claims) with existing evidence paths (`docs/CLAIM_EVIDENCE_MATRIX.csv`); Plain-language project guide kept current (`docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md`).
- **Remains:** Slide deck and architecture diagram re-checked against the current claims matrix [NOT STARTED: Earlier deck and diagram files sit outside the repository and were not re-verified]; Team details and roles filled in (U21) [NOT STARTED]; Final submission uploaded and verified [NOT STARTED].

### P17 — Future expansion and maintenance: 0/24 = 0.0%

- **Done:** nothing yet.
- **Remains:** Content versioning and review workflow beyond the status labels [NOT STARTED: Only the label vocabulary exists]; Multi-board selector written as a separate, small, test-first ticket [NOT STARTED]; Multiple learner profiles [NOT STARTED]; Teacher or admin tools [NOT STARTED]; Deployment operations (persistent rate limiting, monitoring) [NOT STARTED]; Post-event roadmap document [NOT STARTED]; BSE Odisha Madhyama Class X: content authored for this board (B4) [NOT STARTED]; BSE Odisha Madhyama Class X: qualified subject and language review (B5) [NOT STARTED]; BSE Odisha Madhyama Class X: selection path implemented and tested (B6) [NOT STARTED]; CBSE Class X Science: content authored for this board (B4) [NOT STARTED]; CBSE Class X Science: qualified subject and language review (B5) [NOT STARTED]; CBSE Class X Science: selection path implemented and tested (B6) [NOT STARTED]; CISCE ICSE Class X (Physics within Science): content authored for this board (B4) [NOT STARTED]; CISCE ICSE Class X (Physics within Science): qualified subject and language review (B5) [NOT STARTED]; CISCE ICSE Class X (Physics within Science): selection path implemented and tested (B6) [NOT STARTED]; CHSE Odisha +2 (Classes XI–XII; not Class X): content authored for this board (B4) [NOT STARTED]; CHSE Odisha +2 (Classes XI–XII; not Class X): qualified subject and language review (B5) [NOT STARTED]; CHSE Odisha +2 (Classes XI–XII; not Class X): selection path implemented and tested (B6) [NOT STARTED]; NIOS Secondary (Science & Technology 212): content authored for this board (B4) [NOT STARTED]; NIOS Secondary (Science & Technology 212): qualified subject and language review (B5) [NOT STARTED]; NIOS Secondary (Science & Technology 212): selection path implemented and tested (B6) [NOT STARTED]; WBBSE Class X (Madhyamik): content authored for this board (B4) [NOT STARTED]; WBBSE Class X (Madhyamik): qualified subject and language review (B5) [NOT STARTED]; WBBSE Class X (Madhyamik): selection path implemented and tested (B6) [NOT STARTED].

### P18 — Market and competitor evidence: 6/12 = 50.0%

- **Done:** Competitor method defined: per-system provider-says / verified / inference, test status and ADOPT, ADAPT, DEFER, AVOID (`docs/COMPETITIVE_LANDSCAPE.md`); India systems sourced from public pages with dates: DIKSHA, PM eVIDYA, ePathshala, Khan Academy India, Odisha state initiatives, Kolibri (`docs/COMPETITIVE_LANDSCAPE.md`); International analogues sourced: ChatGPT Study Mode, Gemini Guided Learning, MATHia (`docs/COMPETITIVE_LANDSCAPE.md`); Policy and research context sourced (UNESCO GEM 2023 key messages) (`docs/COMPETITIVE_LANDSCAPE.md`); One-page positioning statement separating proven now, hypotheses and validation steps (`docs/COMPETITIVE_LANDSCAPE.md`); No document claims Pathasetu is first, only, unique or without a competitor (guard test over all documents) (`tests/iteration8-docs.test.js`).
- **Remains:** Jigyaso page read and its claims checked [NOT STARTED: The page could not be read by the tool; the description is unverified]; Bhashini language list (including Odia) and terms verified from an official, readable page [IN PROGRESS: A PIB document gives 22 scheduled languages; Odia is not named there]; ASER 2024 figures read from the report and quoted with page references [NOT STARTED: No ASER figure was read]; Wider search of other India and local-language offline products (SWAYAM, NIOS apps, Pratham, commercial Odia-medium apps) [NOT STARTED: Listed in the landscape document as not researched]; Named alternatives tried by hand (version, date, account recorded), starting with an Odia Class X Electricity lesson on Khan Academy India [NOT TESTED]; Competitor statements in the pitch and Q&A re-checked against live pages before use [NOT STARTED].

### P19 — Feature discovery and prioritisation: 6/10 = 60.0%

- **Done:** Feature inventory covers domains A to K with the required fields (`docs/FEATURE_OPPORTUNITY_BACKLOG.md`); CSV has no blank or duplicate IDs; scores are integers 1 to 5 on eight dimensions with a reason per row (`docs/FEATURE_OPPORTUNITY_BACKLOG.csv`); Every feature has a priority P0 to P3 and a decision NOW, NEXT, LATER or REJECT with a rationale (`docs/FEATURE_OPPORTUNITY_BACKLOG.csv`); Rejected items recorded with reasons (gamification pressure, third-party analytics, ranking children, multi-agent, CI service) (`docs/FEATURE_OPPORTUNITY_BACKLOG.md`); Acceptance criteria and tests stated for every feature (`docs/FEATURE_OPPORTUNITY_BACKLOG.csv`); Backlog linked from BUILD_STATUS and from the phase matrix (`docs/BUILD_STATUS.md`).
- **Remains:** Scores and decisions reviewed by the team [NOT STARTED]; Backlog re-scored after the first qualified content review and the first real-phone session [NOT STARTED]; Priorities checked with a teacher or learner [NOT STARTED]; Data-saver issue described by the team so that J09 can be scoped and given a regression test [NOT STARTED: The issue is not described anywhere in the repository].

## Appendix — every criterion

### P0 — Rules, provenance and governance

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P0-01 | Rule 4.1 and the event window recorded from the official pages (D180, D182) | DONE | FILE: docs/DECISION_LOG.csv | LAUNCH | IMPL |  |
| P0-02 | AI-assisted provenance disclosed in repository documents (D183, C45) | DONE | FILE: docs/BUILD_STATUS.md | LAUNCH | IMPL |  |
| P0-03 | History kept append-only (26 commits, all authored "Claude (AI-assisted build)") | DONE | FILE: evidence/iteration8/baseline/environment.txt; git log (HEAD 54f7c4c) | LAUNCH | IMPL |  |
| P0-04 | Earlier evidence folders (iteration2 to 7) preserved unmodified: 229 files protected by a recorded digest list; each iteration adds a new folder | DONE | TEST: evidence/iteration8/historical-evidence-hashes.txt; tests/iteration7-decisions.test.js | LAUNCH | IMPL |  |
| P0-05 | Team-reported organizer permission labelled team-reported, never as a written ruling | DONE | TEST: tests/iteration7-decisions.test.js | LAUNCH | IMPL |  |
| P0-06 | Written organizer ruling on Rule 4.1 and the pre-event prototype saved in project records | BLOCKED | — | LAUNCH | GATE | Needs organizer reply |
| P0-07 | Written ruling on whether a Groq-hosted open-weight model is an eligible "external open-source LLM API" | BLOCKED | — | LAUNCH | GATE | Needs organizer reply |
| P0-08 | Assigned mid-evaluation slot confirmed in writing (D182) | BLOCKED | — | LAUNCH | GATE | Needs organizer reply |
| P0-09 | Organizer message drafted and saved in the repository records, marked UNSENT | DONE | FILE: docs/ORGANIZER_CLARIFICATION_UNSENT.md | LAUNCH | IMPL |  |
| P0-10 | Organizer feedback on how pre-event, AI-assisted work should be disclosed in the submission, saved in the project records | BLOCKED | — | LAUNCH | GATE | Depends on P0-06 |
| P0-11 | RULE_4_1_STATUS=UNCONFIRMED recorded with the rules the build follows (D205) | DONE | FILE: docs/RULE_4_1_STATUS.md; docs/DECISION_LOG.csv | LAUNCH | IMPL |  |
| P0-12 | Organizer message actually sent by the team and the reply saved with its date | NOT STARTED | — | LAUNCH | GATE | Team action; the message is UNSENT |

### P1 — Problem discovery and learner needs

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P1-01 | Target learner persona chosen and recorded (Odia-medium Class X, Electricity) | DONE | FILE: docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md | LAUNCH | IMPL |  |
| P1-02 | Language and geography context recorded (Odisha, Odia medium) | DONE | FILE: docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md | LAUNCH | IMPL |  |
| P1-03 | Shared-device and connectivity constraints recorded, with the single-record limit enforced in wording | DONE | TEST: tests/iteration6-claims.test.js | LAUNCH | IMPL |  |
| P1-04 | Persona assumptions checked with a real learner or teacher (U18) | NOT STARTED | — | LAUNCH | GATE |  |
| P1-05 | Problem validated by interview or observation | NOT STARTED | — | LAUNCH | GATE |  |
| P1-06 | Real data cost and connectivity measured (U20) | NOT STARTED | — | LAUNCH | IMPL |  |

### P2 — Boards, classes, subjects, books and syllabus crosswalk

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P2-01 | Board/class/book comparison register with stated source versions exists | DONE | FILE: docs/BOARD_CLASS_BOOK_COMPARISON.md | LAUNCH | IMPL |  |
| P2-02 | Eight-row book crosswalk scaffold exists with book fields UNKNOWN and checked against the pack | DONE | TEST: docs/BOOK_CROSSWALK.csv; tests/iteration7-decisions.test.js | LAUNCH | IMPL |  |
| P2-03 | Common concept IDs defined across boards, each mapping backed by source evidence | NOT STARTED | — | LAUNCH | IMPL |  |
| P2-04 | Board-selection requirements written as testable gates (no board picker onto BSE questions) | NOT STARTED | — | LAUNCH | IMPL |  |
| P2-05 | Register names all seven tracks correctly (CISCE council vs ICSE exam; CHSE as +2 only; WBBSE vs WBCHSE) | DONE | FILE: docs/BOARD_CLASS_BOOK_COMPARISON.md; docs/BOARD_COVERAGE_REGISTER.csv | LAUNCH | IMPL |  |
| P2-BSE-HSC-B1 | BSE Odisha HSC Class X (General Science: Physical Science): official syllabus/curriculum for the class opened; session or year recorded | DONE | FILE: docs/BOARD_CLASS_BOOK_COMPARISON.md | LAUNCH | IMPL | Repo records the 2026-27 syllabus PDF (S1). The BSE pattern PDF "Annual HSC Examination, 2026" was also opened on 13 Oct 2026 but is not yet recorded in the repo. |
| P2-BSE-HSC-B2 | BSE Odisha HSC Class X (General Science: Physical Science): official textbook or learning material identified with title and edition/year | BLOCKED | — | LAUNCH | IMPL | Syllabus names two prescribed books but no publisher/edition/year; SME listing refused the tool; needs the physical book |
| P2-BSE-HSC-B3 | BSE Odisha HSC Class X (General Science: Physical Science): Electricity topic mapped to common concept IDs with source evidence | IN PROGRESS | FILE: docs/BOOK_CROSSWALK.csv (scaffold only; syllabus lists "Electricity" with no sub-topics) | LAUNCH | IMPL |  |
| P2-BSE-MAD-B1 | BSE Odisha Madhyama Class X: official syllabus/curriculum for the class opened; session or year recorded | BLOCKED | — | EXPANSION | IMPL | BSE page menu lists Madhyama scheme/syllabus entries that link to "#"; no content reached |
| P2-BSE-MAD-B2 | BSE Odisha Madhyama Class X: official textbook or learning material identified with title and edition/year | NOT STARTED | — | EXPANSION | IMPL |  |
| P2-BSE-MAD-B3 | BSE Odisha Madhyama Class X: Electricity topic mapped to common concept IDs with source evidence | NOT STARTED | — | EXPANSION | IMPL |  |
| P2-CBSE-B1 | CBSE Class X Science: official syllabus/curriculum for the class opened; session or year recorded | DONE | FILE: docs/BOARD_CLASS_BOOK_COMPARISON.md (S13: Class X Science curriculum 2026-27 read through a summarising tool; page numbers UNKNOWN) | EXPANSION | IMPL |  |
| P2-CBSE-B2 | CBSE Class X Science: official textbook or learning material identified with title and edition/year | IN PROGRESS | — | EXPANSION | IMPL | S13 gives a textbook statement; title, edition and year not verified; the "Reading Material" link filename contains "IX" and is unresolved |
| P2-CBSE-B3 | CBSE Class X Science: Electricity topic mapped to common concept IDs with source evidence | NOT STARTED | — | EXPANSION | IMPL |  |
| P2-CISCE-B1 | CISCE ICSE Class X (Physics within Science): official syllabus/curriculum for the class opened; session or year recorded | BLOCKED | — | EXPANSION | IMPL | Official PDFs located by search (S19) but the reading tool could not open any CISCE PDF; the ICSE 2027 and 2028 documents both exist and which applies is UNKNOWN |
| P2-CISCE-B2 | CISCE ICSE Class X (Physics within Science): official textbook or learning material identified with title and edition/year | NOT STARTED | — | EXPANSION | IMPL |  |
| P2-CISCE-B3 | CISCE ICSE Class X (Physics within Science): Electricity topic mapped to common concept IDs with source evidence | NOT STARTED | — | EXPANSION | IMPL |  |
| P2-CHSE-B1 | CHSE Odisha +2 (Classes XI–XII; not Class X): official syllabus/curriculum for the class opened; session or year recorded | IN PROGRESS | — | EXPANSION | IMPL | Syllabus listing opened: 43 entries, all +2/vocational; "PHYSICS (RATIONALISED 2023)"; the document itself not opened |
| P2-CHSE-B2 | CHSE Odisha +2 (Classes XI–XII; not Class X): official textbook or learning material identified with title and edition/year | NOT STARTED | — | EXPANSION | IMPL |  |
| P2-CHSE-B3 | CHSE Odisha +2 (Classes XI–XII; not Class X): Electricity topic mapped to common concept IDs with source evidence | NOT STARTED | — | EXPANSION | IMPL |  |
| P2-NIOS-B1 | NIOS Secondary (Science & Technology 212): official syllabus/curriculum for the class opened; session or year recorded | IN PROGRESS | — | EXPANSION | IMPL | 212 syllabus page opened (English/Hindi); no year or revision stated |
| P2-NIOS-B2 | NIOS Secondary (Science & Technology 212): official textbook or learning material identified with title and edition/year | IN PROGRESS | — | EXPANSION | IMPL | Bhubaneswar regional-centre page lists "Science & Technology (212)- Odia Medium": Book-1 ch. 1–18, Book-2 ch. 19–32.3, Lab file; chapter titles and edition not stated |
| P2-NIOS-B3 | NIOS Secondary (Science & Technology 212): Electricity topic mapped to common concept IDs with source evidence | NOT STARTED | — | EXPANSION | IMPL |  |
| P2-WBBSE-B1 | WBBSE Class X (Madhyamik): official syllabus/curriculum for the class opened; session or year recorded | NOT STARTED | — | EXPANSION | IMPL | Home page and a 2025 results booklet only (S20); no syllabus reached; WBCHSE not mentioned |
| P2-WBBSE-B2 | WBBSE Class X (Madhyamik): official textbook or learning material identified with title and edition/year | NOT STARTED | — | EXPANSION | IMPL |  |
| P2-WBBSE-B3 | WBBSE Class X (Madhyamik): Electricity topic mapped to common concept IDs with source evidence | NOT STARTED | — | EXPANSION | IMPL |  |
| P2-06 | Machine-readable board coverage register with the required fields, kept in step with the comparison table by a test | DONE | TEST: docs/BOARD_COVERAGE_REGISTER.csv; tests/iteration8-docs.test.js | LAUNCH | IMPL |  |
| P2-07 | Register states that no board other than BSE HSC has any content, review or selection support (no board picker) | DONE | TEST: docs/BOARD_COVERAGE_REGISTER.csv; tests/iteration8-docs.test.js | LAUNCH | IMPL |  |

### P3 — Content authoring and localization

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P3-01 | BSE HSC: eight Electricity items authored with options, key, explanation (B4) | DONE | FILE: content/electricity-pack.json | LAUNCH | IMPL |  |
| P3-02 | Pack, worksheet and evaluation files checked for consistency automatically | DONE | TEST: scripts/check-content-consistency.mjs; tests/content-consistency.test.js | LAUNCH | IMPL |  |
| P3-03 | Odia draft fields and language-bridge fields present for all eight items | DONE | FILE: content/electricity-pack.json | LAUNCH | IMPL |  |
| P3-04 | Status label UNREVIEWED_DRAFT enforced on every item | DONE | TEST: scripts/check-content-consistency.mjs | LAUNCH | IMPL |  |
| P3-05 | School-Odia terminology list sourced from the learner's actual textbook | NOT STARTED | — | LAUNCH | IMPL | Needs the book (P2-BSE-HSC-B2) |
| P3-06 | Roman-Odia and Odia-script handling for free-text answers specified and reviewed (U08) | NOT STARTED | — | LAUNCH | GATE |  |

### P4 — Product requirements, UX and accessibility design

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P4-01 | User journeys and workflow documented and kept in step with the code | DONE | TEST: docs/NAVIGATION_AND_WORKFLOW.md; tests/uiStatic.test.js | LAUNCH | IMPL |  |
| P4-02 | Mobile layout, 44 px targets, contrast, reflow, lang and landmarks checked automatically (33 states, 462 checks) | DONE | TEST: evidence/iteration8/final/accessibility/ | LAUNCH | IMPL |  |
| P4-03 | Keyboard focus checks automated | DONE | TEST: scripts/accessibility-audit.mjs | LAUNCH | IMPL |  |
| P4-04 | Asset sizes for low bandwidth measured on 13 Oct 2026 | DONE | FILE: docs/CLAIM_EVIDENCE_MATRIX.csv | LAUNCH | IMPL |  |
| P4-05 | Odia interface strings reviewed by an Odia speaker | NOT STARTED | — | LAUNCH | GATE |  |
| P4-06 | One usability observation with a real learner or teacher | NOT STARTED | — | LAUNCH | GATE |  |

### P5 — Architecture and core learning workflow

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P5-01 | App shell and Node server serve page, pack and service worker | DONE | TEST: tests/server.test.js; evidence/iteration8/final/capture.json | LAUNCH | IMPL |  |
| P5-02 | Controller loop observe→propose→validate→plan→act→save/trace→re-check implemented | DONE | TEST: tests/agent.test.js | LAUNCH | IMPL |  |
| P5-03 | Current-question path with selected option, typed explanation, feedback and next step | DONE | TEST: evidence/iteration8/final/browser-regression.json | LAUNCH | IMPL |  |
| P5-04 | Decision trace visible to the learner | DONE | TEST: evidence/iteration8/final/browser-regression.json | LAUNCH | IMPL |  |
| P5-05 | Architecture documents | DONE | FILE: docs/ARCHITECTURE.md; docs/SYSTEM_ARCHITECTURE.md | LAUNCH | IMPL |  |
| P5-06 | BSE HSC Class X Electricity launch path implemented and tested (B6; there is no board selector) | DONE | TEST: evidence/iteration8/final/browser-regression.json | LAUNCH | IMPL |  |
| P5-07 | Exam-date planner checked against a real exam timetable (it is heuristic) | NOT STARTED | — | LAUNCH | IMPL |  |

### P6 — Agent, planner and diagnosis logic

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P6-01 | Deterministic option-linked mock provider labelled MOCK | DONE | TEST: tests/agent.test.js | LAUNCH | IMPL |  |
| P6-02 | Validator allow-list for misconception IDs, question ID, confidence | DONE | TEST: tests/validator.test.js | LAUNCH | IMPL |  |
| P6-03 | Abstention (uncertain) path valid and tested | DONE | TEST: tests/validator.test.js | LAUNCH | IMPL |  |
| P6-04 | Deterministic planner with a rationale in the trace | DONE | TEST: tests/agent.test.js | LAUNCH | IMPL |  |
| P6-05 | Wording that the mock does not read free text semantically enforced | DONE | TEST: tests/iteration6-claims.test.js | LAUNCH | IMPL |  |
| P6-06 | Planner choices compared with a qualified reviewer's judgement | NOT STARTED | — | LAUNCH | GATE |  |

### P7 — Offline-first behaviour and local state

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P7-01 | Service-worker shell cache (pathasetu-shell-v8) | DONE | TEST: evidence/iteration8/final/capture.json | LAUNCH | IMPL |  |
| P7-02 | IndexedDB persistence with in-memory fallback | DONE | TEST: tests/storage-resilience.test.js | LAUNCH | IMPL |  |
| P7-03 | Queued re-checks with bounded retry (5 attempts, 5/10/20/40 s, then paused with Retry now) | DONE | TEST: tests/retry.test.js | LAUNCH | IMPL |  |
| P7-04 | Reconnect drains the queue without switching the active question; draft kept | DONE | TEST: evidence/iteration8/final/browser-regression.json | LAUNCH | IMPL |  |
| P7-05 | Offline probe (1,800 ms) settles to offline; hung request times out and queue recovers (J4, J4b) | DONE | TEST: evidence/iteration8/final/browser-regression.json | LAUNCH | IMPL |  |
| P7-06 | Corrupted or over-quota storage recovers (synthetic) | DONE | TEST: tests/storage-resilience.test.js | LAUNCH | IMPL |  |
| P7-07 | Single-writer across tabs (Web Locks) | DONE | TEST: evidence/iteration8/final/browser-regression.json | LAUNCH | IMPL |  |
| P7-08 | Update notice when a new service worker is waiting | DONE | TEST: evidence/iteration8/final/browser-regression.json | LAUNCH | IMPL |  |
| P7-09 | First visit works with no prior connection | NA | docs/DECISION_LOG.csv (D080) | LAUNCH | IMPL | NOT APPLICABLE: a PWA needs one online visit; the design states first-use-offline is not claimed (D080) |

### P8 — Language bridge and practice

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P8-01 | Everyday ↔ school Odia ↔ English bridge fields for all eight items | DONE | FILE: content/electricity-pack.json | LAUNCH | IMPL |  |
| P8-02 | Offline practice with source reveal implemented and tested | DONE | TEST: tests/bridge.test.js | LAUNCH | IMPL |  |
| P8-03 | Ambiguity handling in the bridge tested | DONE | TEST: tests/bridge.test.js | LAUNCH | IMPL |  |

### P9 — Security, privacy and abuse controls

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P9-01 | Shared demo-code gate: header, constant-time compare, 16-character minimum | DONE | TEST: tests/access-policy.test.js | LAUNCH | IMPL |  |
| P9-02 | Rate limits (20 failed/60 s, 24 re-checks/min, 30 session-pack/min) and 16 KB body limit | DONE | TEST: tests/public-demo.test.js | LAUNCH | IMPL |  |
| P9-03 | Exact-origin allow-list | DONE | TEST: tests/proxy-origin.test.js | LAUNCH | IMPL |  |
| P9-04 | Fail-closed public-demo mode requiring explicit draft acknowledgement | DONE | TEST: tests/public-demo.test.js | LAUNCH | IMPL |  |
| P9-05 | Preflight validates configuration without calling a hosted model | DONE | TEST: tests/preflight.test.js | LAUNCH | IMPL |  |
| P9-06 | Provider adapter keeps the key server-side and does not leak provider error detail | DONE | TEST: tests/groqModel.test.js | LAUNCH | IMPL |  |
| P9-07 | Data-flow wording: "no data leaves the device" is not claimed | DONE | TEST: tests/iteration6-claims.test.js | LAUNCH | IMPL |  |
| P9-08 | Provider data controls reviewed and zero data retention confirmed in the provider console | BLOCKED | — | LAUNCH | GATE | Needs team account and credentials |
| P9-09 | Answer key kept off the browser (server-side grading) | NOT STARTED | — | EXPANSION | IMPL | Known A1 limitation: key ships to the browser |

### P10 — Automated quality and evaluation

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P10-01 | Unit suite (217 tests) passes | DONE | TEST: evidence/iteration8/final/npm-test.txt | LAUNCH | IMPL |  |
| P10-02 | Content consistency check passes | DONE | TEST: evidence/iteration8/final/npm-check-content.txt | LAUNCH | IMPL |  |
| P10-03 | Synthetic evaluation harness (47 cases) and deterministic baseline recorded | DONE | TEST: evidence/iteration8/final/evaluation-outputs/ | LAUNCH | IMPL |  |
| P10-04 | Headless browser regression (100 checks) in the Linux sandbox | DONE | TEST: evidence/iteration8/final/browser-regression.json | LAUNCH | IMPL |  |
| P10-05 | Automated accessibility audit (462 checks) | DONE | TEST: evidence/iteration8/final/accessibility/ | LAUNCH | IMPL |  |
| P10-06 | Screen capture run (19 checks) | DONE | TEST: evidence/iteration8/final/capture.json | LAUNCH | IMPL |  |
| P10-07 | Fresh-extraction and patch-reproduction check performed for each package | DONE | FILE: evidence/iteration7/baseline/README-baseline.txt | LAUNCH | IMPL |  |
| P10-08 | Claim and decision-log integrity tests | DONE | TEST: tests/iteration7-decisions.test.js; tests/iteration6-claims.test.js | LAUNCH | IMPL |  |
| P10-09 | Mutation or fault-injection testing of the validator and retry logic | NOT STARTED | — | LAUNCH | IMPL |  |
| P10-10 | Browser-path resolver tested (15 tests, written first; the first run failed as expected) | DONE | TEST: tests/browser-path.test.js; evidence/iteration8/baseline/browser-path-tests-RED-before-fix.txt | LAUNCH | IMPL |  |
| P10-11 | Iteration 8 documentation tests: board register, competitor wording, backlog CSV, phase matrix numbers, Rule 4.1 record | DONE | TEST: tests/iteration8-docs.test.js | LAUNCH | IMPL |  |
| P10-12 | Runtime-unchanged guard refactored (not deleted): historical digests plus a declared-change record | DONE | TEST: tests/iteration7-decisions.test.js; evidence/iteration8/runtime-changes.txt; evidence/iteration8/runtime-file-hashes.txt | LAUNCH | IMPL |  |

### P11 — Cross-browser and responsive testing

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P11-01 | Headless Chromium 141 on Linux, responsive viewports | DONE | TEST: evidence/iteration8/final/accessibility/ | LAUNCH | IMPL |  |
| P11-02 | One shared, tested browser-path resolver used by every browser script (CHROME_PATH first; invalid means BLOCKED; macOS, Linux, Windows locations; no network or download) | DONE | TEST: scripts/lib/browser-path.mjs; tests/browser-path.test.js | LAUNCH | IMPL |  |
| P11-03 | Capture, e2e and a11y run on the team's Mac with a browser that exists and is permitted | NOT TESTED | — | LAUNCH | GATE | The resolver now exists; the Mac run itself has not been seen (and may be policy-blocked: U16) |
| P11-04 | Evidence files record the browser executable, how it was chosen and its version | DONE | TEST: evidence/iteration8/final/capture.json; evidence/iteration8/final/browser-regression.json; evidence/iteration8/final/accessibility/a11y-report.json | LAUNCH | IMPL |  |
| P11-05 | Safari / WebKit engine exercised in any form | NOT TESTED | — | LAUNCH | GATE |  |
| P11-06 | Missing or invalid browser reports BLOCKED (exit 2) and a managed-device policy refusal stays a separate POLICY_BLOCKED | DONE | TEST: tests/browser-path.test.js; evidence/iteration8/final/npm-e2e-invalid-chrome-path.txt | LAUNCH | IMPL |  |

### P12 — Physical device and network verification

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P12-01 | Phone test plan (23 steps) executed and results recorded: Galaxy S23 / Chrome | NOT TESTED | docs/PHONE_TEST_RESULTS_TEMPLATE.csv | LAUNCH | GATE |  |
| P12-02 | Phone test plan (23 steps) executed and results recorded: Galaxy S23 / Samsung Internet | NOT TESTED | docs/PHONE_TEST_RESULTS_TEMPLATE.csv | LAUNCH | GATE |  |
| P12-03 | Phone test plan (23 steps) executed and results recorded: Galaxy S25 / Chrome | NOT TESTED | docs/PHONE_TEST_RESULTS_TEMPLATE.csv | LAUNCH | GATE |  |
| P12-04 | Phone test plan (23 steps) executed and results recorded: Galaxy S25 / Samsung Internet | NOT TESTED | docs/PHONE_TEST_RESULTS_TEMPLATE.csv | LAUNCH | GATE |  |
| P12-05 | Phone test plan (23 steps) executed and results recorded: Galaxy S25 FE / Chrome | NOT TESTED | docs/PHONE_TEST_RESULTS_TEMPLATE.csv | LAUNCH | GATE |  |
| P12-06 | Phone test plan (23 steps) executed and results recorded: Galaxy S25 FE / Samsung Internet | NOT TESTED | docs/PHONE_TEST_RESULTS_TEMPLATE.csv | LAUNCH | GATE |  |
| P12-07 | Phone test plan (23 steps) executed and results recorded: iPhone 16 / Safari (HTTPS) | NOT TESTED | docs/PHONE_TEST_RESULTS_TEMPLATE.csv | LAUNCH | GATE |  |
| P12-08 | Screen-reader (TalkBack, VoiceOver) steps added to the plan and executed | NOT TESTED | — | LAUNCH | GATE |  |
| P12-09 | Poor-network and offline-switch behaviour observed on a real phone | NOT TESTED | — | LAUNCH | GATE |  |
| P12-10 | Odia font rendering and legibility checked on a real phone | NOT TESTED | — | LAUNCH | GATE |  |

### P13 — Model/provider eligibility and empirical quality

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P13-01 | Default provider is mock and labelled | DONE | TEST: tests/iteration6-claims.test.js | LAUNCH | IMPL |  |
| P13-02 | Groq adapter implemented (server-side key, structured output, timeout) and unit-tested against a fake server | DONE | TEST: tests/groqModel.test.js | LAUNCH | IMPL |  |
| P13-03 | Deterministic offline evaluation baseline recorded (47/47 valid, 34/47 agreement, 0/8, 2/12) | DONE | TEST: evidence/iteration8/final/npm-evaluate.txt | LAUNCH | IMPL |  |
| P13-04 | Live-provider gate recorded as BLOCKED, not hidden | DONE | FILE: evidence/iteration5/gates/GATE_STATUS.md | LAUNCH | IMPL |  |
| P13-05 | Live smoke test (13 synthetic requests) run and recorded | BLOCKED | — | LAUNCH | GATE | No credentials; no written approval |
| P13-06 | Live Groq evaluation on the 47 synthetic cases run and recorded | BLOCKED | — | LAUNCH | GATE |  |
| P13-07 | Latency and rate limits characterised against the real provider | BLOCKED | — | LAUNCH | GATE |  |
| P13-08 | Odia / Roman-Odia free-text quality evaluated on a reviewer-labelled set | BLOCKED | — | LAUNCH | GATE | Needs reviewer labels (P15-05) |

### P14 — Hosting and demo operations

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P14-01 | Demo runbook, HTTPS runbook and event-day checklist written | DONE | FILE: docs/DEMO_RUNBOOK.md; docs/HTTPS_DEMO_RUNBOOK.md; docs/EVENT_DAY_CHECKLIST.md | LAUNCH | IMPL |  |
| P14-02 | Preflight command for the protected-demo configuration | DONE | TEST: tests/preflight.test.js | LAUNCH | IMPL |  |
| P14-03 | HTTPS host or tunnel chosen | NOT STARTED | — | LAUNCH | IMPL |  |
| P14-04 | Preflight passed against the chosen HTTPS origin (--expect-origin) | NOT STARTED | — | LAUNCH | IMPL |  |
| P14-05 | Tunnel provider logging and terms reviewed (U10) | NOT STARTED | — | LAUNCH | IMPL |  |
| P14-06 | Written fallback plan for a failed network or tunnel at the venue | NOT STARTED | — | LAUNCH | IMPL | No fallback section found in the runbooks |
| P14-07 | Timed event-day rehearsal done | NOT STARTED | — | LAUNCH | GATE |  |

### P15 — Academic validity and learning measurement

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P15-01 | Reviewer rubric, guide and worksheet prepared | DONE | FILE: docs/CONTENT_REVIEW_RUBRIC.md; docs/REVIEWER_GUIDE.md; docs/CONTENT_REVIEW_WORKSHEET.csv | LAUNCH | IMPL |  |
| P15-02 | Evaluation template for reviewer labels prepared (47 rows, 24 blank) | DONE | TEST: scripts/check-content-consistency.mjs | LAUNCH | IMPL |  |
| P15-03 | Qualified Odia-medium science reviewer identified | BLOCKED | — | LAUNCH | GATE |  |
| P15-04 | BSE HSC: scientific and Odia review of all eight items (B5) | BLOCKED | — | LAUNCH | GATE | All eight remain UNREVIEWED_DRAFT |
| P15-05 | Reviewer-labelled evaluation set completed | BLOCKED | — | LAUNCH | GATE |  |
| P15-06 | Learning outcomes and measurement plan defined | NOT STARTED | — | LAUNCH | GATE |  |
| P15-07 | Consent and ethics plan for any learner study | NOT STARTED | — | LAUNCH | GATE |  |
| P15-08 | Any learning-gain study run | NOT STARTED | — | LAUNCH | GATE |  |

### P16 — Competition submission and presentation

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P16-01 | Pitch scripts with a safe-wording table | DONE | FILE: docs/PITCH_SCRIPTS.md | LAUNCH | IMPL |  |
| P16-02 | Jury Q&A bank (176 questions) with evidence status | DONE | TEST: docs/JURY_QA_BANK.md; tests/iteration7-decisions.test.js | LAUNCH | IMPL |  |
| P16-03 | Claim–evidence matrix (60 claims) with existing evidence paths | DONE | TEST: docs/CLAIM_EVIDENCE_MATRIX.csv | LAUNCH | IMPL |  |
| P16-04 | Plain-language project guide kept current | DONE | TEST: docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md; tests/iteration6-claims.test.js | LAUNCH | IMPL |  |
| P16-05 | Slide deck and architecture diagram re-checked against the current claims matrix | NOT STARTED | — | LAUNCH | IMPL | Earlier deck and diagram files sit outside the repository and were not re-verified |
| P16-06 | Team details and roles filled in (U21) | NOT STARTED | — | LAUNCH | IMPL |  |
| P16-07 | Final submission uploaded and verified | NOT STARTED | — | LAUNCH | GATE |  |

### P17 — Future expansion and maintenance

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P17-01 | Content versioning and review workflow beyond the status labels | NOT STARTED | — | EXPANSION | IMPL | Only the label vocabulary exists |
| P17-02 | Multi-board selector written as a separate, small, test-first ticket | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-03 | Multiple learner profiles | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-04 | Teacher or admin tools | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-05 | Deployment operations (persistent rate limiting, monitoring) | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-06 | Post-event roadmap document | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-BSE-MAD-B4 | BSE Odisha Madhyama Class X: content authored for this board (B4) | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-BSE-MAD-B5 | BSE Odisha Madhyama Class X: qualified subject and language review (B5) | NOT STARTED | — | EXPANSION | GATE |  |
| P17-BSE-MAD-B6 | BSE Odisha Madhyama Class X: selection path implemented and tested (B6) | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-CBSE-B4 | CBSE Class X Science: content authored for this board (B4) | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-CBSE-B5 | CBSE Class X Science: qualified subject and language review (B5) | NOT STARTED | — | EXPANSION | GATE |  |
| P17-CBSE-B6 | CBSE Class X Science: selection path implemented and tested (B6) | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-CISCE-B4 | CISCE ICSE Class X (Physics within Science): content authored for this board (B4) | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-CISCE-B5 | CISCE ICSE Class X (Physics within Science): qualified subject and language review (B5) | NOT STARTED | — | EXPANSION | GATE |  |
| P17-CISCE-B6 | CISCE ICSE Class X (Physics within Science): selection path implemented and tested (B6) | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-CHSE-B4 | CHSE Odisha +2 (Classes XI–XII; not Class X): content authored for this board (B4) | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-CHSE-B5 | CHSE Odisha +2 (Classes XI–XII; not Class X): qualified subject and language review (B5) | NOT STARTED | — | EXPANSION | GATE |  |
| P17-CHSE-B6 | CHSE Odisha +2 (Classes XI–XII; not Class X): selection path implemented and tested (B6) | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-NIOS-B4 | NIOS Secondary (Science & Technology 212): content authored for this board (B4) | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-NIOS-B5 | NIOS Secondary (Science & Technology 212): qualified subject and language review (B5) | NOT STARTED | — | EXPANSION | GATE |  |
| P17-NIOS-B6 | NIOS Secondary (Science & Technology 212): selection path implemented and tested (B6) | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-WBBSE-B4 | WBBSE Class X (Madhyamik): content authored for this board (B4) | NOT STARTED | — | EXPANSION | IMPL |  |
| P17-WBBSE-B5 | WBBSE Class X (Madhyamik): qualified subject and language review (B5) | NOT STARTED | — | EXPANSION | GATE |  |
| P17-WBBSE-B6 | WBBSE Class X (Madhyamik): selection path implemented and tested (B6) | NOT STARTED | — | EXPANSION | IMPL |  |

### P18 — Market and competitor evidence

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P18-01 | Competitor method defined: per-system provider-says / verified / inference, test status and ADOPT, ADAPT, DEFER, AVOID | DONE | FILE: docs/COMPETITIVE_LANDSCAPE.md | LAUNCH | IMPL |  |
| P18-02 | India systems sourced from public pages with dates: DIKSHA, PM eVIDYA, ePathshala, Khan Academy India, Odisha state initiatives, Kolibri | DONE | FILE: docs/COMPETITIVE_LANDSCAPE.md | LAUNCH | IMPL |  |
| P18-03 | International analogues sourced: ChatGPT Study Mode, Gemini Guided Learning, MATHia | DONE | FILE: docs/COMPETITIVE_LANDSCAPE.md | LAUNCH | IMPL |  |
| P18-04 | Policy and research context sourced (UNESCO GEM 2023 key messages) | DONE | FILE: docs/COMPETITIVE_LANDSCAPE.md | LAUNCH | IMPL |  |
| P18-05 | One-page positioning statement separating proven now, hypotheses and validation steps | DONE | FILE: docs/COMPETITIVE_LANDSCAPE.md | LAUNCH | IMPL |  |
| P18-06 | No document claims Pathasetu is first, only, unique or without a competitor (guard test over all documents) | DONE | TEST: tests/iteration8-docs.test.js | LAUNCH | IMPL |  |
| P18-07 | Jigyaso page read and its claims checked | NOT STARTED | — | LAUNCH | IMPL | The page could not be read by the tool; the description is unverified |
| P18-08 | Bhashini language list (including Odia) and terms verified from an official, readable page | IN PROGRESS | — | LAUNCH | IMPL | A PIB document gives 22 scheduled languages; Odia is not named there |
| P18-09 | ASER 2024 figures read from the report and quoted with page references | NOT STARTED | — | LAUNCH | IMPL | No ASER figure was read |
| P18-10 | Wider search of other India and local-language offline products (SWAYAM, NIOS apps, Pratham, commercial Odia-medium apps) | NOT STARTED | — | LAUNCH | IMPL | Listed in the landscape document as not researched |
| P18-11 | Named alternatives tried by hand (version, date, account recorded), starting with an Odia Class X Electricity lesson on Khan Academy India | NOT TESTED | — | LAUNCH | GATE |  |
| P18-12 | Competitor statements in the pitch and Q&A re-checked against live pages before use | NOT STARTED | — | LAUNCH | GATE |  |

### P19 — Feature discovery and prioritisation

| ID | Criterion | State | Evidence (type: path) | Scope | Kind | Note |
|---|---|---|---|---|---|---|
| P19-01 | Feature inventory covers domains A to K with the required fields | DONE | TEST: docs/FEATURE_OPPORTUNITY_BACKLOG.md; docs/FEATURE_OPPORTUNITY_BACKLOG.csv; tests/iteration8-docs.test.js | LAUNCH | IMPL |  |
| P19-02 | CSV has no blank or duplicate IDs; scores are integers 1 to 5 on eight dimensions with a reason per row | DONE | TEST: docs/FEATURE_OPPORTUNITY_BACKLOG.csv; tests/iteration8-docs.test.js | LAUNCH | IMPL |  |
| P19-03 | Every feature has a priority P0 to P3 and a decision NOW, NEXT, LATER or REJECT with a rationale | DONE | TEST: docs/FEATURE_OPPORTUNITY_BACKLOG.csv; tests/iteration8-docs.test.js | LAUNCH | IMPL |  |
| P19-04 | Rejected items recorded with reasons (gamification pressure, third-party analytics, ranking children, multi-agent, CI service) | DONE | FILE: docs/FEATURE_OPPORTUNITY_BACKLOG.md | LAUNCH | IMPL |  |
| P19-05 | Acceptance criteria and tests stated for every feature | DONE | TEST: docs/FEATURE_OPPORTUNITY_BACKLOG.csv; tests/iteration8-docs.test.js | LAUNCH | IMPL |  |
| P19-06 | Backlog linked from BUILD_STATUS and from the phase matrix | DONE | TEST: docs/BUILD_STATUS.md; docs/PHASE_COMPLETION_MATRIX.md; tests/iteration8-docs.test.js | LAUNCH | IMPL |  |
| P19-07 | Scores and decisions reviewed by the team | NOT STARTED | — | LAUNCH | GATE |  |
| P19-08 | Backlog re-scored after the first qualified content review and the first real-phone session | NOT STARTED | — | LAUNCH | GATE |  |
| P19-09 | Priorities checked with a teacher or learner | NOT STARTED | — | LAUNCH | GATE |  |
| P19-10 | Data-saver issue described by the team so that J09 can be scoped and given a regression test | NOT STARTED | — | LAUNCH | GATE | The issue is not described anywhere in the repository |

## Snapshot

A timestamped copy of this matrix and of the criteria list is stored under `evidence/iteration8/` (`PHASE_MATRIX_SNAPSHOT_2026-10-13.md`, `phase_criteria_snapshot.csv`). It records the same numbers; a test compares them with this file. The command results for the same working tree are in `evidence/iteration8/final/`.
