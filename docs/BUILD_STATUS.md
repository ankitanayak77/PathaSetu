# Pathasetu MVP — build and verification status (iteration 3)

**Scope:** one learner, Class 10 Science, Electricity, bilingual draft experience, deterministic learning loop, local state, offline queue with bounded retry and reconnect re-check, a local Bridge Practice exercise, evaluation and review tooling.
**Status date:** 13 October 2026 (the day before the published competition build window).
**Environment of every result below:** Node v22.22.0, npm 10.9.4, headless Chromium 141.0.7390.37 on Linux. Nothing here ran on a phone. (Iteration 2 reported Chromium 153; the browser differs because the sandbox was rebuilt, see Provenance.)

## Provenance

- `Pathasetu_MVP_2026-10-12.zip` (SHA-256 `514e5fa785d0728909557bfb3c76c857bb1c53ee25d86e061f82f18a7a9c4587`) was received with no git history. It was produced by an earlier AI-assisted session on 12 Oct 2026. Commit `970ef48` records that archive exactly as received.
- Iteration 2 (commits `f9dc273`…`8a139ae`, 12 Oct 2026) and iteration 3 (commits `7ebd548`…, 13 Oct 2026) were done with AI assistance (Claude). Nothing is backdated or rewritten.
- **Disclosure: iteration 3 was rebuilt.** The first iteration 3 working directory was lost in a sandbox reset before it was packaged. On 13 Oct 2026 the recorded edits and commands were replayed from the session transcript onto the iteration 2 tree, the commits were recreated (so their hashes and timestamps are the rebuild's, not the original session's), and every number below comes from runs made on the rebuilt tree. The baseline outputs were likewise re-run against the iteration 2 commit `8a139ae` (`evidence/iteration3/baseline/README-baseline.txt`). Earlier interim figures from before the reset are not used.
- The competition rules say code must be built during competition hours. This work was done earlier, on the team's instruction, relying on a verbal organizer permission that has not been confirmed in writing. Keep these dates visible if the repository is submitted.

## Fresh verification (files in `evidence/iteration3/final/`)

Run on 13 Oct 2026 at commit `bb1b359` with a clean working tree (`evidence/iteration3/final/environment.txt`). The commit that follows adds the saved evidence and updates the test counts in these documents; it changes no code.

| Check | Result | Exit code |
| --- | --- | --- |
| `npm ci` | PASS (no third-party dependencies) | 0 |
| `npm test` | PASS: 151 of 151, 0 skipped | 0 |
| `npm run check` | PASS (syntax of all server, browser, core and script files) | 0 |
| `npm run check:content` | PASS: 8 items, 8 worksheet rows, 47 evaluation cases, 0 problems; all items still `UNREVIEWED_DRAFT` | 0 |
| `npm run capture` | PASS: 19 passed, 0 failed, 0 blocked | 0 |
| `npm run e2e` | PASS: 91 passed, 0 failed (headless Chromium 141) | 0 |
| `npm run a11y` | PASS: 33 state/viewport combinations, 462 automated checks, 0 failed (headless, viewport emulation) | 0 |
| `npm run evaluate` | Done: deterministic baseline on 47 synthetic English cases (see Evaluation) | 0 |
| `npm run evaluate -- --provider groq` | **BLOCKED**: no local Groq credentials; no live evaluation was run | 2 |
| `npm run smoke` | **BLOCKED**: no local Groq credentials; no live call was made | 2 |
| Physical Samsung S23 / S25 / S25 FE / iPhone 16 tests | **NOT TESTED** | n/a |
| Odia and science review | **NOT REVIEWED** | n/a |

Baseline, re-run against the iteration 2 commit `8a139ae` (`evidence/iteration3/baseline/`): `npm test` 66/66, `npm run capture` 19 passed/0 failed, `npm run e2e` 53 passed/0 failed, `npm ci` and `npm run check` exit 0. So iteration 3 added 85 unit tests and 38 browser checks without regressing any earlier one.

Browser commands need `CHROME_PATH`. If your machine blocks local navigation, report BLOCKED, not PASS.

## Iteration 3 tasks

| # | Task | Result | Label | Evidence |
| --- | --- | --- | --- | --- |
| 1 | `/api/pack` draft-content access gap | Fixed. With `PATHASETU_DEMO_ACCESS_CODE` set, `/api/pack` serves draft items only with the code (401 and no content otherwise), in development and in production draft-demo mode. Browser client and smoke script send the code. | UNIT-TESTED, BROWSER-TESTED | `access-policy-before-fix.txt` (4 of 6 tests failed before), `tests/access-policy.test.js`, e2e M |
| 2 | Unbounded automatic retries | Fixed. 5 automatic attempts, 5 s doubling to 60 s, then paused; answer and entry kept; persistent status and **Retry now**; survives reload; read-only tab cannot retry. | UNIT-TESTED, BROWSER-TESTED | `unbounded-retry-observation.txt` (5 re-checks in 65 s with no cap or flag), `tests/retry.test.js`, e2e N |
| 3 | Live Groq smoke (`openai/gpt-oss-20b`) | **BLOCKED**: no credentials in the environment. Keys were never requested or printed. The mock remains the default. | not run | `live-provider/groq-smoke-status.txt`, `final/npm-smoke-no-credentials.txt` |
| 4 | Evaluation summary | Done for the deterministic baseline only; the live run is BLOCKED. Compatibility is reported apart from agreement; Odia is NOT EVALUATED. | UNIT-TESTED tooling | `evaluation/`, `docs/EVALUATION.md` |
| 5 | Storage reporting and resilience | Done: honest save status and banner, one best-effort `persist()` request, corrupt or partly corrupt saved state repaired or quarantined, queue recovery, trace export without typed text or secrets. | UNIT-TESTED, BROWSER-TESTED | `storage-baseline-observation.txt` (a corrupt record crashed the page; a failed write still said saved), `tests/storage-resilience.test.js`, e2e P, R, S |
| 6 | Pack versus worksheet consistency | Done: checker plus tests; evaluation review template (47 English rows to confirm, 24 blank Odia script and Roman Odia rows for a reviewer to author); reviewer guide. All items remain `UNREVIEWED_DRAFT`; no reviewer, date or approval exists. | UNIT-TESTED | `npm run check:content`, `docs/REVIEWER_GUIDE.md`, `tests/content-consistency.test.js` |
| 7 | Accessibility and mobile readiness; real-device matrix | Automated audit added and its 130 failures fixed (CSS and markup only). Plan extended to 23 steps with HTTPS notes; 161-row results template, all NOT TESTED. | BROWSER-TESTED (headless, emulation) | `final/accessibility/`, `evidence/iteration3/accessibility/before/`, `docs/PHONE_TEST_PLAN.md`, `docs/PHONE_TEST_RESULTS_TEMPLATE.csv` |
| 8 | Full suite, docs, evidence, ZIP | This file and the package described in the delivery notes. | n/a | `evidence/iteration3/final/` |

Also added for the HTTPS phone path: `PATHASETU_ALLOWED_ORIGINS` (exact origins; validated at startup; does not weaken the access code), tested in `tests/proxy-origin.test.js`. Service-worker shell cache is now `pathasetu-shell-v6`.

## Accessibility audit (task 7)

`npm run a11y` loads the app in headless Chromium at 320, 360, 393, 412 and 768 px wide in seven states (initial, draft typed, result, trace open, Bridge Practice answered, offline with one queued re-check, access overlay) and checks accessible names, 44 px touch targets, a visible focus indicator at every real Tab stop and that Tab reaches every control, WCAG AA text contrast, no text below 12 px, `lang` tags, heading structure, pinch-zoom, landmarks, modal dialog naming, and no horizontal scrolling (including at 320 px). Before the fixes: **130 failed checks** (31 small targets, 33 missing focus indicators, 33 contrast and 33 text-size reports across the matrix; `accessibility/before/`). After: 0. The fixes darkened text colours, raised the minimum text size to 12 px, made targets 44 px, added one focus ring and a visible skip link, and hid decorative glyphs from assistive technology. The layout is unchanged.

This is **not** a screen-reader test, **not** a real-phone test, not a full WCAG conformance claim, and it cannot judge Odia readability. The 12 px floor is a minimum, not a recommendation for Odia script; a native-reader check of Odia legibility on the phones is still needed.

## Evaluation (task 4)

Full report: `evidence/iteration3/evaluation/evaluation-baseline-*.md`; method and limits: `docs/EVALUATION.md`. The dataset is 47 English cases written by the team with AI assistance and **not reviewed** (`TEAM_AUTHORED_UNVALIDATED`). The "model" here is the option-linked mock rule, not a language model.

| Question | Result |
| --- | --- |
| Do responses have the right shape and pass the validator? (API and schema compatibility) | 47 of 47 |
| Agreement with the unvalidated reference labels | 34 of 47 (72%, 95% CI 58% to 83%) |
| Correct-reasoning cases wrongly flagged as misconceptions | 0 of 8 |
| Ambiguous and insufficient-evidence cases correctly abstained on | 2 of 12 (the rule almost never abstains; false confidence on 10 of 12) |

These numbers describe a simple rule on team-written English text. They are not Odia accuracy, not educational accuracy and not evidence about any live model. **The live Groq evaluation was not run.**

## Claim ledger

| Claim | IMPLEMENTED | UNIT-TESTED | BROWSER-TESTED (headless) | PHONE-TESTED | LIVE-API-TESTED | CONTENT-REVIEWED |
| --- | --- | --- | --- | --- | --- | --- |
| Observe, diagnose, validate, plan, act, trace | yes | yes | yes | no | no | no |
| Offline answer saved and queued exactly once | yes | yes | yes | no | n/a | n/a |
| Reconnect drains the queue; draft, option, focus and caret stay on the same question | yes | partly | yes | no | n/a | n/a |
| Draft content and re-checks need the demo access code when one is set | yes | yes | yes | no | n/a | n/a |
| Bounded retries, paused state, Retry now, recovery after reload | yes | yes | yes | no | n/a | n/a |
| Honest storage status, persistence request wording, corrupt-state repair, queue recovery | yes | yes | yes | no | n/a | n/a |
| Trace export without typed text or secrets | yes | yes | yes | no | n/a | n/a |
| Second tab is read-only (Web Locks) or a persistent warning is shown | yes | static | yes | no | n/a | n/a |
| Service worker serves the offline shell, never caches `/api/*`, announces updates | yes | static | yes | no | n/a | n/a |
| Bridge Practice works offline, by keyboard, is traced, uses only local mappings | yes | yes | yes | no | n/a | no |
| Automated accessibility checks (names, targets, focus, contrast, size, reflow) | yes | yes | yes (emulated viewports) | no | n/a | n/a |
| Screen-reader support (TalkBack, VoiceOver) | not claimed | not claimed | not claimed | **NOT TESTED** | n/a | n/a |
| Groq adapter | yes | fake-server tests only | no | no | **BLOCKED / not run** | n/a |
| Diagnosis quality of any live model | not claimed | not claimed | not claimed | not claimed | **not run** | not claimed |
| Odia wording and science content | drafts only | n/a | n/a | n/a | n/a | **no** |
| Educational effect, language understanding | not claimed | not claimed | not claimed | not claimed | not claimed | not claimed |

## Limits and risks

- All eight items, all Odia text and all Bridge mappings remain `UNREVIEWED_DRAFT`. No reviewer name, date or approval exists anywhere. "Correct" in Bridge Practice means "matches the pack".
- The mock is option-linked and does not interpret free text. Groq has never been called; the provider eligibility question (open-source wording on the event page versus the team's statement that all APIs are allowed) is not confirmed in writing, and the free Gemini tier may train on submitted content, so it is not used for learner text.
- No phone has run the app. HTTPS for iPhone Safari is untested; no tunnel or deployment was created or tested here.
- Persistent storage is best effort: browsers (iPhone Safari especially, for sites not on the Home Screen) may clear it. The app says so and never promises retention.
- The paused-retry state is verified only in headless Chromium with a stub failing provider.
- A second tab never becomes writable by itself; the learner must close the other tab and reload.
- No Odia font is bundled; rendering depends on the device. It rendered here only because the sandbox has an Odia system font.
- The access-code gate and in-memory rate limits are demo protection, not production security.
- The iteration 3 history was rebuilt (see Provenance).

## Next priorities

1. Run `PHONE_TEST_PLAN.md` on the seven device/browser combinations over HTTPS and fill `PHONE_TEST_RESULTS_TEMPLATE.csv` honestly.
2. Have an Odia-medium science teacher review the pack with `REVIEWER_GUIDE.md`, then author the Odia script and Roman Odia evaluation cases. Do not change any status to REVIEWED or PUBLISHED without that.
3. Confirm provider eligibility in writing; with local credentials and Zero Data Retention enabled, run `npm run smoke` and then `npm run evaluate -- --provider groq` on synthetic cases only.
4. Get written organizer confirmation on the pre-window work (rule 4.1) and the official mid-evaluation slot.
