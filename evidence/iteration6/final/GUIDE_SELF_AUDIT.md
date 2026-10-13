# Iteration 6 self-audit: corrections made after the independent Iteration 5 audit

Scope: README, BUILD_STATUS, PROJECT_GUIDE_PLAIN_LANGUAGE, JURY_QA_BANK (151 questions), PITCH_SCRIPTS, CLAIM_EVIDENCE_MATRIX (50 rows), the runbooks, and `public/app.js`. Method: grep for each phrase the Iteration 6 brief lists, read each hit against the code and evidence, fix, then pin the fix with `tests/iteration6-claims.test.js` (wording gates) and browser scenario Q (labels).

## Corrections (audit item → what changed)

| Audit item | Before | After | Pinned by |
| --- | --- | --- | --- |
| 1. Name | "rationale unknown" (guide, Q12) | The team's intended meaning, "a bridge for learning between languages", in guide 2.1, Q12, pitch A0, README and matrix C48; no verified etymology claimed (the earlier "Sanskrit-origin" assertion was softened to "as we read it") | test 1 |
| 2. Test counts | Pitch and bank quoted 182 as if current | One marker in BUILD_STATUS (207 unit, 19 capture, 100 browser, 462 accessibility); 182 and 198 only as labelled history; marker also checked against saved final evidence | tests 2, 3 |
| 3. "Saves everything on the phone" | Pitch A2 said so | Pitch, guide 3.2, Q47, matrix C28: local storage when it works; explanation sent to the Pathasetu server on each re-check; to a hosted model only if configured | test 4 |
| 4. Shared devices | "shared phone" used as the setting without the bound | Guide 1.3 and its assumptions list, Q128, pitch A0, matrix C43: one local session record, no profiles, not safely separate | test 5 |
| 5. Automation vs learning evidence | Already stated (34/47, 2/12) | Kept; guide 3.1 now says what the tests prove and do not, and 2.9 sets out a future approved study | test 9 |
| 6. Live provider claim | Narrow already | Kept; guide 4.5 now lists what must be true before anyone can say "LLM-powered"; live Groq BLOCKED (no variables set) | test 6, 9 |
| 7. Shared truth labels | Present | Added the `learning-outcome-measured` label (none); still no phone, no TalkBack/VoiceOver, simulated tunnel only, content unreviewed | test 6 |
| Brief 2.3: provider labelling in the UI | **Defect:** the answer-box hint always said "This mock does not interpret the explanation", and was not refreshed when the health probe returned | `explanationPlaceholder()` follows the provider and is refreshed in `renderConnection`; cache v8 | e2e Q1–Q5, test 8 |
| Brief 2.4: permission and API use | "Verbal permission not confirmed in writing" / "unresolved" | Labelled **team-reported**; the rules and event-page wording kept separate; no claim of written permission; the four jury weights kept distinct from the 30/70 stage split | test 7 |

## Still open, and stated as open

- Live Groq: BLOCKED. `GROQ_API_KEY`, `PATHASETU_MODEL_PROVIDER`, `PATHASETU_DEMO_ACCESS_CODE`, `PATHASETU_PROVIDER_DATA_CONTROLS_ACK` are not set in the build environment; no value was requested or printed.
- HTTPS / tunnel: BLOCKED. Phones: NOT TESTED. Teacher review: NOT REVIEWED. Learning outcomes: not measured.
- Browser results are from this sandbox. A second audit environment and the team's managed machine could not navigate to localhost, so they are not reproduced there and are not claimed.
- The mock's abstention on ambiguous cases is weak (2 of 12); the 47 reference labels are team-written and unreviewed; nothing here shows Odia competence.
- The repository predates the competition window and every commit is authored "Claude (AI-assisted build)"; the team's own contribution is not recorded in git and must be described truthfully by the team.
- `PITCH_SCRIPTS.md` rehearsal: mapped to headless checks only; no person has run or timed the story.
