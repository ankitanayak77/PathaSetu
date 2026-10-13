# Pathasetu MVP — build and verification status (iteration 5)

**Scope:** one learner, Class 10 Science, Electricity, bilingual draft experience, deterministic learning loop, local state, offline queue with bounded retry and reconnect re-check, a local Bridge Practice exercise, evaluation and review tooling, and a fail-closed private demo mode, a preflight command and the real-device and reviewer handoff (iteration 4), and (new in iteration 5) the plain-language guide, architecture, navigation, jury Q&A, pitch scripts and claim-evidence matrix. Iteration 5 changed no source or browser file.
**Status date:** 13 October 2026 (the day before the published competition build window).
**Environment of every result below:** Node v22.22.0, npm 10.9.4, headless Chromium 141.0.7390.37 on Linux (this sandbox). Nothing here ran on a phone.
**Environment results the team obtained themselves:** in the team's managed environment, `npm run capture`'s Chromium journey and `npm run e2e` were **BLOCKED** (`ERR_BLOCKED_BY_ADMINISTRATOR`), while `npm test` 151/151, `npm run check` and `npm run check:content` passed there. Those are the team's results for the Iteration 3 archive. They are neither overwritten nor promoted to passes by anything below; the results here are a separate record from a different environment where local navigation was permitted (`evidence/iteration4/baseline/README-baseline.txt`). If your machine blocks local navigation, report BLOCKED, not PASS.

## Provenance

- `Pathasetu_MVP_2026-10-12.zip` (SHA-256 `514e5fa785d0728909557bfb3c76c857bb1c53ee25d86e061f82f18a7a9c4587`) was received with no git history. It was produced by an earlier AI-assisted session on 12 Oct 2026. Commit `970ef48` records that archive exactly as received.
- Iteration 2 (commits `f9dc273`…`8a139ae`, 12 Oct 2026) and iteration 3 (commits `7ebd548`…, 13 Oct 2026) were done with AI assistance (Claude). Nothing is backdated or rewritten.
- **Disclosure: iteration 3 was rebuilt.** The first iteration 3 working directory was lost in a sandbox reset before it was packaged. On 13 Oct 2026 the recorded edits and commands were replayed from the session transcript onto the iteration 2 tree, the commits were recreated (so their hashes and timestamps are the rebuild's, not the original session's), and every number below comes from runs made on the rebuilt tree. The baseline outputs were likewise re-run against the iteration 2 commit `8a139ae` (`evidence/iteration3/baseline/README-baseline.txt`). Earlier interim figures from before the reset are not used.
- Iteration 4 (13 Oct 2026, Claude, commits after `e2d91cb`) continues from `Pathasetu_MVP_iteration3_2026-10-13.zip` (SHA-256 `e3abdd995cf95e208e128be33c941d5c807ba492b21667a18369de981a2210ed`, verified before use and left unchanged). History is appended, not rewritten; a patch against Iteration 3 is in the delivery.
- Iteration 5 (13 Oct 2026, Claude, commits after `937d42e`) continues from `Pathasetu_MVP_iteration4_2026-10-13.zip`. History is appended, not rewritten. It added documents, tests and evidence only; `src/` and `public/` are byte-identical to Iteration 4. Every commit in this repository is authored "Claude (AI-assisted build)"; the team's own contribution is not recorded in git history and must be stated honestly if asked.
- The competition rules say code must be built during competition hours. This work was done earlier, on the team's instruction, relying on a verbal organizer permission that has not been confirmed in writing. Keep these dates visible if the repository is submitted.

## Iteration 5 — field validation and demo lock (files in `evidence/iteration5/`)

Iteration 5 asked for real-world validation. The four external gates cannot be done from the build sandbox and are recorded as such, not simulated.

| # | Task | Result | Label | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Baseline rerun of the Iteration 4 package | Every command exited 0: 182/182 unit tests, capture 19/0/0, e2e 95/0, a11y 462 checks 0 failed (headless Chromium, this sandbox). Separate from the team's own BLOCKED capture/e2e report, which stays BLOCKED. | BROWSER-TESTED (headless) | `evidence/iteration5/baseline/` |
| 2 | Real HTTPS / tunnel validation | **BLOCKED** — no tunnel tool, account or network route in the sandbox. Only the local preflight with a placeholder origin ran. | NOT TESTED | `evidence/iteration5/gates/GATE_STATUS.md`, `npm-preflight-public-demo-placeholder-origin.txt` |
| 3 | Real-device tests (S23, S25, S25 FE, iPhone 16) | **NOT TESTED** — no phone is reachable. The phone matrix is unchanged: all rows NOT TESTED. | NOT TESTED | `docs/PHONE_TEST_RESULTS_TEMPLATE.csv` |
| 4 | Teacher review and the language bridge | **NOT REVIEWED** — no reviewer exists. All items and Bridge mappings remain `UNREVIEWED_DRAFT`. | NOT REVIEWED | `docs/REVIEWER_GUIDE.md` |
| 5 | Live Groq smoke and evaluation | **BLOCKED — credentials not configured.** No live call was made. | not run | `gates/npm-smoke.txt`, `gates/npm-evaluate-groq.txt`, `gates/evaluation-groq-BLOCKED-*.txt` |
| 6 | Demo rehearsal and claims audit | Headless mapping of the eight-step demo story to existing e2e/capture check IDs (not a live rehearsal); 47-row claim-evidence matrix; self-audit of the guide. | BROWSER-TESTED (headless) for the mapping | `evidence/iteration5/final/REHEARSAL_MAPPING.md`, `GUIDE_SELF_AUDIT.md`, `docs/CLAIM_EVIDENCE_MATRIX.csv` |
| 7 | Explanation set (mandatory addendum) | `PROJECT_GUIDE_PLAIN_LANGUAGE.md`, `SYSTEM_ARCHITECTURE.md`, `NAVIGATION_AND_WORKFLOW.md`, `JURY_QA_BANK.md` (150 questions), `PITCH_SCRIPTS.md`, `CLAIM_EVIDENCE_MATRIX.csv`; README, ARCHITECTURE, REVIEWER_GUIDE, DEMO_RUNBOOK and HTTPS_DEMO_RUNBOOK aligned. | IMPLEMENTED (documents) | `docs/` |
| 8 | Tests for documented behaviour | 16 new tests: security headers, traversal refusal, static route pattern, what the hosted-model request contains, `trusted:false` in the shipped client, and document consistency (matrix paths exist, no placeholders, every listed question present, claim statuses use the allowed vocabulary). | UNIT-TESTED | `tests/iteration5-evidence.test.js`, `tests/iteration5-docs.test.js` |

Findings stated plainly in the new documents rather than hidden: the mock is a rule, not a model; the answer key and the draft pack ship to the browser (so this is not an exam); the re-check call from the shipped UI always sends `trusted:false`, so confirmed gaps are never set from the UI; there is no shared-phone support; the repository was built before the competition window; every commit is authored by the AI-assisted build.

## Iteration 5 final verification (files in `evidence/iteration5/final/`)

Run on 13 Oct 2026 at commit `9629263`, headless Chromium 141 in the build sandbox, nothing on a phone. `src/` and `public/` are unchanged since Iteration 4, so these numbers differ from the Iteration 4 table only by the 16 new tests.

| Check | Result | Exit code |
| --- | --- | --- |
| `npm ci`, `npm run check`, `npm run check:content`, `npm run preflight` | PASS | 0 |
| `npm test` | PASS: 198 of 198, 0 skipped (182 + 16) | 0 |
| `npm run capture` | PASS: 19 passed, 0 failed, 0 blocked | 0 |
| `npm run e2e` | PASS: 95 passed, 0 failed | 0 |
| `npm run a11y` | PASS: 33 states, 462 checks, 0 failed | 0 |
| `npm run evaluate` | Done: deterministic baseline, 47 synthetic cases | 0 |
| `npm run smoke`, `npm run evaluate -- --provider groq` | **BLOCKED — credentials not configured**; no live call | 2 / 2 |
| Tunnel, phones, teacher review | **BLOCKED / NOT TESTED / NOT REVIEWED** | n/a |

## Fresh verification (Iteration 4 results below; Iteration 5 results are in `evidence/iteration5/final/README-final.txt`)

Run on 13 Oct 2026 at commit `b3e70ea` on a clean tree (the two untracked entries that `environment.txt` counts are the evidence files being written). The commit that follows adds the saved evidence and these documents and changes no code.

| Check | Result | Exit code |
| --- | --- | --- |
| `npm ci` | PASS (no third-party dependencies) | 0 |
| `npm test` | PASS: 182 of 182, 0 skipped (151 before iteration 4, +31) | 0 |
| `npm run check` | PASS | 0 |
| `npm run check:content` | PASS: 8 items, 8 worksheet rows, 47 evaluation cases, 0 problems; all items still `UNREVIEWED_DRAFT` | 0 |
| `npm run capture` | PASS: 19 passed, 0 failed, 0 blocked (this sandbox only) | 0 |
| `npm run e2e` | PASS: 95 passed, 0 failed (headless Chromium 141; +4 checks, scenario T) | 0 |
| `npm run a11y` | PASS: 33 state/viewport combinations, 462 automated checks, 0 failed (headless, viewport emulation) | 0 |
| `npm run preflight` (default local mock) | PASSED (15 pass, 0 warn, 0 fail) | 0 |
| `npm run preflight -- --expect-origin https://demo.example.test` with a run-time-generated code, public demo, production draft demo | PASSED (22 pass, 0 warn, 0 fail); no secret printed | 0 |
| `npm run preflight` with `PATHASETU_PUBLIC_DEMO=true` and no code / with a tunnel origin and no public demo mode | FAILED as designed (these prove the failure path) | 1 / 1 |
| `npm run evaluate` | Done: deterministic baseline on 47 synthetic English cases (unchanged: validity 47/47, agreement 34/47) | 0 |
| `npm run smoke` | **BLOCKED — credentials not configured**; no live call was made | 2 |
| `npm run evaluate -- --provider groq` | **BLOCKED — credentials not configured**; no live evaluation was run | 2 |
| Runbook dry run (simulated tunnel; no tunnel, host or account used) | Done: every local command in `HTTPS_DEMO_RUNBOOK.md` executed; neither access code appears in the transcript or server log | n/a |
| Physical Samsung S23 / S25 / S25 FE / iPhone 16 tests | **NOT TESTED** | n/a |
| Odia and science review | **NOT REVIEWED** | n/a |

Baseline on the unmodified Iteration 3 archive in this sandbox (`evidence/iteration4/baseline/`): `npm test` 151/151, capture 19/19, e2e 91/91, a11y 462/0, check and check:content exit 0. Iteration 4 therefore added 31 unit tests and 4 browser checks without regressing any earlier one.

## Iteration 4 tasks

| # | Task | Result | Label | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Fresh baseline and integrity | Archive checksum verified, tree identical to the archive, all seven commands run; separate from the team's BLOCKED results. | n/a | `evidence/iteration4/baseline/` |
| 2 | Fail-closed public/tunnel mode | `PATHASETU_PUBLIC_DEMO` (exact `true`/`false`): startup refuses without a strong code (16+ chars, no whitespace, not repetitive, not sequential, not a placeholder, at least 6 distinct characters) whatever the provider or `NODE_ENV`; session, pack and re-check need the code; failed or missing-code attempts share a bounded per-client window (default 20) that answers `429 too_many_attempts` and never blocks the correct code; wildcard, path, credential and default-port origins rejected; client keeps the stored code on 429 and shows a wait message; service-worker cache v7. | UNIT-TESTED, BROWSER-TESTED | `task2-before-fix.txt` (8 of 11 failed before), `task2-client-before-fix.txt`, `tests/public-demo.test.js`, e2e T |
| 3 | `npm run preflight` | Done: Node, files, pack load, consistency (states content is unreviewed), provider, code strength, public-demo flag, bind address, exact origins and `--expect-origin`, draft exposure, mock-only loopback harness for the routes, no status promotion, Host-rewriting route. No live request; secrets redacted. | UNIT-TESTED | `task3-before-fix.txt` (12 of 13 failed before), `tests/preflight.test.js`, `final/npm-preflight*.txt` |
| 4 | HTTPS runbook | `docs/HTTPS_DEMO_RUNBOOK.md`, provider-agnostic; states that a serverless host does not work; local commands dry-run with a simulated tunnel. The real tunnel step is **not** run. | IMPLEMENTED (local commands verified) | `final/runbook-dry-run.txt` |
| 5 | Groq smoke and evaluation | **BLOCKED — credentials not configured.** Live runs now also need `PATHASETU_PROVIDER_DATA_CONTROLS_ACK=true`. | not run | `final/groq-status.txt`, `final/npm-smoke.txt`, `final/npm-evaluate-groq.txt` |
| 6 | Real-world validation handoff | Plan and template verified consistent (23 steps, 161 rows, all NOT TESTED, every column documented); `docs/EVENT_DAY_CHECKLIST.md` (order of operations, exact version fields, stop/go gates); reviewer guide extended to nine dimensions. No reviewer name, date or approval written. | UNIT-TESTED (document checks) | `task6-before-fix.txt`, `tests/handoff-docs.test.js` |
| 7 | Regression | All commands re-run after the last code change (table above). | see above | `evidence/iteration4/final/` |
| 8 | Docs, evidence, ZIP | This file, README, ARCHITECTURE, DEMO_RUNBOOK, HTTPS_DEMO_RUNBOOK; ZIP with git history, SHA-256 manifest and a patch against Iteration 3. | n/a | delivery notes |

## Accessibility audit (added in iteration 3; re-run unchanged in iteration 4)

`npm run a11y` loads the app in headless Chromium at 320, 360, 393, 412 and 768 px wide in seven states (initial, draft typed, result, trace open, Bridge Practice answered, offline with one queued re-check, access overlay) and checks accessible names, 44 px touch targets, a visible focus indicator at every real Tab stop and that Tab reaches every control, WCAG AA text contrast, no text below 12 px, `lang` tags, heading structure, pinch-zoom, landmarks, modal dialog naming, and no horizontal scrolling (including at 320 px). Before the fixes: **130 failed checks** (31 small targets, 33 missing focus indicators, 33 contrast and 33 text-size reports across the matrix; `accessibility/before/`). After: 0. The fixes darkened text colours, raised the minimum text size to 12 px, made targets 44 px, added one focus ring and a visible skip link, and hid decorative glyphs from assistive technology. The layout is unchanged.

This is **not** a screen-reader test, **not** a real-phone test, not a full WCAG conformance claim, and it cannot judge Odia readability. The 12 px floor is a minimum, not a recommendation for Odia script; a native-reader check of Odia legibility on the phones is still needed.

## Evaluation (added in iteration 3; the deterministic baseline re-run unchanged in iteration 4)

Full report: `evidence/iteration4/final/evaluation/evaluation-baseline-*.md` (iteration 3's is in `evidence/iteration3/evaluation/`); method and limits: `docs/EVALUATION.md`. The dataset is 47 English cases written by the team with AI assistance and **not reviewed** (`TEAM_AUTHORED_UNVALIDATED`). The "model" here is the option-linked mock rule, not a language model.

| Question | Result |
| --- | --- |
| Do responses have the right shape and pass the validator? (API and schema compatibility) | 47 of 47 |
| Agreement with the unvalidated reference labels | 34 of 47 (72%, 95% CI 58% to 83%) |
| Correct-reasoning cases wrongly flagged as misconceptions | 0 of 8 |
| Ambiguous and insufficient-evidence cases correctly abstained on | 2 of 12 (the rule almost never abstains; false confidence on 10 of 12) |

These numbers describe a simple rule on team-written English text. They are not Odia accuracy, not educational accuracy and not evidence about any live model. **The live Groq evaluation was not run.**

## Claim ledger

| Claim | IMPLEMENTED | UNIT-TESTED | BROWSER-TESTED (headless) | LIVE-API-TESTED | PHONE-TESTED | CONTENT-REVIEWED |
| --- | --- | --- | --- | --- | --- | --- |
| Observe, diagnose, validate, plan, act, trace | yes | yes | yes | no | no | no |
| Offline answer saved and queued exactly once | yes | yes | yes | n/a | no | n/a |
| Reconnect drains the queue; draft, option, focus and caret stay on the same question | yes | partly | yes | n/a | no | n/a |
| Public demo mode refuses to start without a strong code, whatever the provider or `NODE_ENV` | yes | yes | n/a | n/a | n/a | n/a |
| Session, pack and re-check all need the code in public demo mode; refusals carry no pack content | yes | yes | yes | n/a | no | n/a |
| Wrong or missing codes are throttled per client without blocking the correct code; the window expires | yes | yes | yes | n/a | no | n/a |
| Exact-origin allow-list (https only, no wildcard, path or credentials); Host-rewriting tunnel configuration | yes | yes | n/a | n/a | no (no real tunnel run) | n/a |
| The code never reaches logs, IndexedDB, localStorage, the trace export or the client bundle | yes | yes | yes | n/a | no | n/a |
| `npm run preflight` fails on unsafe or demo-blocking configuration, prints no secret, makes no provider call | yes | yes | n/a | n/a | n/a | n/a |
| HTTPS runbook commands (local part) | yes | n/a | n/a | n/a | n/a | n/a |
| This is production-grade authentication | **not claimed** | | | | | |
| Bounded retries, paused state, Retry now, recovery after reload | yes | yes | yes | n/a | no | n/a |
| Honest storage status, persistence request wording, corrupt-state repair, queue recovery | yes | yes | yes | n/a | no | n/a |
| Trace export without typed text or secrets | yes | yes | yes | n/a | no | n/a |
| Second tab is read-only (Web Locks) or a persistent warning is shown | yes | static | yes | n/a | no | n/a |
| Service worker serves the offline shell, never caches `/api/*`, announces updates | yes | static | yes | n/a | no | n/a |
| Bridge Practice works offline, by keyboard, is traced, uses only local mappings | yes | yes | yes | n/a | no | no |
| Automated accessibility checks (names, targets, focus, contrast, size, reflow) | yes | yes | yes (emulated viewports) | n/a | no | n/a |
| Screen-reader support (TalkBack, VoiceOver) | not claimed | not claimed | not claimed | n/a | **NOT TESTED** | n/a |
| Offline and reconnect behaviour on Samsung S23 / S25 / S25 FE / iPhone 16 | yes (by design) | n/a | headless only | n/a | **NOT TESTED** | n/a |
| Groq adapter | yes | fake-server tests only | no | **BLOCKED — credentials not configured** | no | n/a |
| Diagnosis quality of any live model | not claimed | not claimed | not claimed | **not run** | not claimed | not claimed |
| Odia wording and science content | drafts only | n/a | n/a | n/a | n/a | **NOT REVIEWED** |
| Security headers on every response; traversal and private paths refused | yes | yes (iteration 5) | n/a | n/a | n/a | n/a |
| Hosted-model request contents (typed explanation, answer key, Odia drafts; `store:false`) match the privacy answers | yes | yes (iteration 5, fake fetch) | n/a | no | n/a | n/a |
| The shipped UI never sets a confirmed gap (`trusted:false` on every override) | yes | yes (iteration 5, source check) | partly | n/a | no | n/a |
| Educational effect, language understanding | not claimed | not claimed | not claimed | not claimed | not claimed | not claimed |

## Limits and risks

- All eight items, all Odia text and all Bridge mappings remain `UNREVIEWED_DRAFT`. No reviewer name, date or approval exists anywhere. "Correct" in Bridge Practice means "matches the pack". `npm run check:content` and `npm run preflight` confirm consistency, not review.
- The mock is option-linked and does not interpret free text. Groq has never been called; the provider eligibility question (open-source wording on the event page versus the team's statement that all APIs are allowed) is not confirmed in writing, and the free Gemini tier may train on submitted content, so it is not used for learner text.
- No phone has run the app. HTTPS for iPhone Safari is untested; no tunnel, host or account was created or used. The runbook's tunnel step, certificate trust and any Host-rewriting behaviour of the tool you choose are unverified.
- The access protection is demo-grade: one shared code, in-memory counters that reset on restart and are keyed by socket address (visitors behind one tunnel connection share a bucket, and one client's wrong guesses can throttle other unauthenticated visitors, though never someone presenting the correct code), no accounts, no audit log. A leaked code gives full access until rotated. It is not production authentication.
- `/api/health` is open on purpose (the offline probe needs it) and discloses the provider label and that a code is required.
- Persistent storage is best effort: browsers (iPhone Safari especially, for sites not on the Home Screen) may clear it. The app says so and never promises retention.
- The paused-retry state and the 429 handling are verified only in headless Chromium with stubbed responses.
- A second tab never becomes writable by itself; the learner must close the other tab and reload.
- No Odia font is bundled; rendering depends on the device. It rendered here only because the sandbox has an Odia system font.
- The iteration 3 history was rebuilt (see Provenance).

## Next priorities

Iteration 5 did not retire any item below; each external gate is still open (see `evidence/iteration5/gates/GATE_STATUS.md`).

1. Run `PHONE_TEST_PLAN.md` on the seven device/browser combinations over HTTPS, following `EVENT_DAY_CHECKLIST.md`, and fill `PHONE_TEST_RESULTS_TEMPLATE.csv` honestly. No offline-reliability claim before the mandatory steps pass on the real device.
2. Have an Odia-medium science teacher review the pack with `REVIEWER_GUIDE.md`, then author the Odia script and Roman Odia evaluation cases. Do not change any status to REVIEWED or PUBLISHED without that.
3. Confirm provider eligibility in writing; with local credentials, Zero Data Retention enabled and `PATHASETU_PROVIDER_DATA_CONTROLS_ACK=true`, run `npm run smoke` and then `npm run evaluate -- --provider groq` on synthetic cases only.
4. Get written organizer confirmation on the pre-window work (rule 4.1) and the official mid-evaluation slot.
