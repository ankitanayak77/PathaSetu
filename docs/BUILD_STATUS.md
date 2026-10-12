# Pathasetu MVP — build and verification status (iteration 2)

**Scope:** one learner, Class 10 Science, Electricity, bilingual draft experience, deterministic learning loop, local state, offline queue and reconnect re-check, and a local Bridge Practice exercise.
**Status date:** 12 October 2026 (before the published competition build window).
**Environment of every result below:** Node v22.22.2, npm 10.9.7, headless Chromium 153.0.8010.0 (a bundled Linux build). Nothing here ran on a phone.

## Provenance

- `Pathasetu_MVP_2026-10-12.zip` (SHA-256 `514e5fa785d0728909557bfb3c76c857bb1c53ee25d86e061f82f18a7a9c4587`) was received with no git history. It was produced by an earlier AI-assisted session on 12 Oct 2026. The first commit in this repository records that archive exactly as received.
- Everything after that commit was done in this iteration with AI assistance (Claude). Commit times are the real clock times of the sandbox; nothing is backdated or rewritten.
- The competition rules say code must be built during competition hours. This work was done earlier, on the team's instruction, relying on a verbal organizer permission that has not been confirmed in writing. Keep these dates visible if the repository is submitted.

## Fresh verification (final run, files in `evidence/iteration2/final/`)

| Check | Result | Exit code |
| --- | --- | --- |
| `npm ci` | PASS (no third-party dependencies) | 0 |
| `npm test` | PASS: 66 of 66 (40 existing + 26 new), 0 skipped | 0 |
| `npm run check` | PASS | 0 |
| `npm run capture` | PASS: 19 passed, 0 failed, 0 blocked (HTTP/API guards and one browser journey) | 0 |
| `npm run e2e` | PASS: 53 passed, 0 failed across 14 scenarios, in 43 s | 0 |
| Physical Samsung or iPhone tests | NOT TESTED | n/a |
| Live Groq smoke test | NOT RUN | n/a |
| Odia and science review | NOT REVIEWED | n/a |

Browser checks need `CHROME_PATH`. In an earlier managed environment, local-URL navigation was blocked by policy; it was not blocked here. If your machine blocks it, report BLOCKED, not PASS.

## Before the fixes (files in `evidence/iteration2/baseline/`)

On the unmodified received code: `npm test` 40/40; `npm run capture` 18 passed and 1 failed. The new browser suite reproduced the defects below.

## Defects found and fixed

| # | Defect (reproduced on the received code) | Evidence before | Fix | Test now |
| --- | --- | --- | --- | --- |
| 1 | The provider label never said MOCK | capture check failed; suite A2 | Label reads "MOCK PROVIDER · DEMO RULES · NO LIVE AI" | A2, static test |
| 2 | A first visit showed "App update ready" | suite A4 | Only a controller change after a prior controller announces an update | A4, static test, I1/I2 |
| 3 | A double tap recorded 2 answers, 2 queue entries and used 2 sessions | suite C1/C2 | Core rejects a second submit for an answered, not-continued question; UI ignores it | C1/C2, unit tests |
| 4 | Focus and caret were lost when a re-check finished | suite D3 | Focus and caret restored after re-render, only for the same question | D3 |
| 5 | A recommendation pointing at a missing question survived recovery | suite F3 | `reconcileState` clears it and traces it | F3, unit tests |
| 6 | A read-only tab drained the queue itself (2 re-check requests for one answer); its warning was hidden by a transient notice | suite G5/G6/G7 | Read-only tabs do not save, process the queue or practise; persistent banner | G1, G3 to G7 |
| 7 | A provider request that never answered froze the queue until reload | suite J4/J4b | Re-check requests abort after 8 s, count an attempt and retry later | J4/J4b |
| 8 | Persistent failures flooded the 200-event trace | unit tests failed on received code | Repeats of one failure update one trace line | unit tests |

Not reproduced (kept as preventive guards only): a read-only tab overwriting the writer's progress when it closes (scenario G2 passed on the received code). Service-worker updates already worked.

## Claim ledger

| Claim | IMPLEMENTED | UNIT-TESTED | BROWSER-TESTED (headless) | PHONE-TESTED | CONTENT-REVIEWED |
| --- | --- | --- | --- | --- | --- |
| Observe, diagnose, validate, plan, act, trace | yes | yes | yes | no | no |
| Offline answer saved and queued exactly once | yes | yes | yes | no | n/a |
| Reconnect drains the queue; draft, option, focus and caret stay on the same question | yes | partly | yes | no | n/a |
| Reload and cold start restore state, queue and drafts | yes | partly | yes | no | n/a |
| Missing or stale content cannot strand the learner | yes | yes | yes | no | n/a |
| Second tab is read-only (Web Locks) or a persistent warning is shown | yes | static | yes | no | n/a |
| Service worker serves the offline shell, never caches `/api/*`, announces updates | yes | static | yes | no | n/a |
| Provider timeout, HTTP error, invalid JSON, invalid diagnosis leave state consistent and entries retryable | yes | yes | yes | no | n/a |
| Bridge Practice works offline, by keyboard, is traced, uses only local mappings | yes | yes | yes | no | no |
| Groq adapter | yes | fake-server tests only | no | no | n/a |
| Odia wording and science content | drafts only | n/a | n/a | n/a | **no** |
| Educational effect, language understanding | not claimed | not claimed | not claimed | not claimed | not claimed |

## Bridge Practice (Task 2)

Built from the current question's existing `bridge` fields only: nothing is invented and no model is called. The target is the current question's mapping; the two distractors are other distinct mappings in the pack that share no term with it (EL01/EL02 share "open circuit" and EL07/EL08 share "equivalent resistance", so they are never options for each other). The exercise is off, with a reason, when the pack has fewer than three distinct usable mappings. Options and their order are deterministic and rotate with the saved attempt count. An UNREVIEWED DRAFT badge is shown while any involved mapping is unreviewed. The school and English terms are hidden in the Language Bridge card until the learner attempts or reveals. Each attempt and reveal is written to the decision trace with `network: false`.

## Correction

An earlier note in this iteration said an unsent draft is lost on a full reload. That was wrong: drafts are stored per question in IndexedDB (about 150 ms after the last keystroke) and are restored on reload. Scenario L verifies it in headless Chromium.

## Limits and risks

- All eight items and all Odia text remain `UNREVIEWED_DRAFT`. Bridge mappings are drafts too; "correct" in Bridge Practice means "matches the pack", not "teacher-approved".
- The mock is option-linked and does not interpret free text. Groq has never been called.
- Failed re-checks retry on the reachability cycle (about every 15 s) with no maximum attempt count.
- A second tab never becomes writable by itself; the learner must close the other tab and reload.
- No Odia font is bundled; rendering depends on the device. It rendered correctly in headless Chromium here only because the sandbox has an Odia system font.
- The access-code gate and in-memory rate limits are demo protection, not production security.

## Next priorities

1. Run `npm ci && npm test && npm run check`, then `CHROME_PATH=... npm run capture` and `npm run e2e`, on the team's own machine and save the output.
2. Run `PHONE_TEST_PLAN.md` on the named devices (steps 14 to 16 cover Bridge Practice and updates).
3. Have an Odia-medium science teacher review the questions, explanations, misconception mappings and bridge fields. Do not change any status to REVIEWED or PUBLISHED without that.
4. Confirm model-provider eligibility in writing; only then run `npm run smoke` on synthetic cases.
