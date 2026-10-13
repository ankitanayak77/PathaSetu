# Self-audit of the Iteration 5 explanation set (addendum, final step)

Scope: `docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md`, `SYSTEM_ARCHITECTURE.md`, `NAVIGATION_AND_WORKFLOW.md`, `JURY_QA_BANK.md`, `PITCH_SCRIPTS.md`, `CLAIM_EVIDENCE_MATRIX.csv`, and the edited README / BUILD_STATUS / DEMO_RUNBOOK / HTTPS_DEMO_RUNBOOK / ARCHITECTURE / REVIEWER_GUIDE. Audited 13 Oct 2026 against the committed tree. Method: reading each document against the code and evidence, plus mechanical checks in `tests/iteration5-docs.test.js` and `tests/iteration5-evidence.test.js` (198/198 unit tests pass in `final/`).

## 1. Statements without direct evidence

Each is already labelled in the documents; none is stated as fact.

| Statement | Why it has no direct evidence | How the documents treat it |
| --- | --- | --- |
| Any outcome for learners (learning gain, language understanding) | No learner has used the app | "Expected benefit", never "measured result" |
| Diagnosis quality of any live model | No live Groq call has ever been made (credentials absent) | Marked NOT TESTED / BLOCKED everywhere; the mock is called a rule |
| Behaviour on S23 / S25 / S25 FE / iPhone 16 | No phone reachable | NOT TESTED; every phone row in the results template stays NOT TESTED |
| HTTPS / tunnel behaviour, Host-rewriting proxies, iPhone Safari over HTTPS | No tunnel tool or account in the sandbox | BLOCKED; only a placeholder-origin preflight ran |
| Odia wording and science correctness | No reviewer | NOT REVIEWED; everything `UNREVIEWED_DRAFT` |
| The team's own environment result (capture/e2e BLOCKED by a machine policy) | Reported by the team, not reproduced here | Recorded as team-reported; not turned into a pass or a failure of the app |
| Organizer's verbal permission on pre-window work; the event's real hours; provider eligibility | Not confirmed in writing; the event page is inconsistent | Listed as UNKNOWN with the rule numbers (4.1, 3.3) |
| 7-minute timing of the pitch and the 8-step story on a phone | Never run by a person | Rehearsal mapping is headless only |

## 2. Contradictions across README, architecture, runbooks, status and code

Checked mechanically or by reading; all resolved before sealing.

- Cache name `pathasetu-shell-v7`: code (`public/sw.js`) and all 7 mentions in docs agree.
- Retry policy (5 attempts; 5, 10, 20, 40 s; cap 60 s; then paused with Retry now), client re-check timeout 8 s (`public/app.js`), Groq adapter timeout 5.2 s (`groqModel.js`), probe 15 s online / back-off to 30 s offline, re-check rate limit 24 per minute, body limit 16 KB: documents match code.
- Test totals: old docs say 151 or 182 only where they describe those earlier iterations; Iteration 5 documents say 182 at baseline and 198 final.
- `docs/ARCHITECTURE.md` earlier carried a diagram that duplicated and could drift from `SYSTEM_ARCHITECTURE.md`; it now points to the single source.
- Earlier wording that implied "security-tested" for headers and traversal was narrowed, then backed by the new tests rather than left as an assertion.
- Earlier navigation notes claimed a scenario submits the keyed option; no e2e scenario does. The claim was corrected.

Open: the event page, the rules page and the problem PDF disagree with each other on hours and on the criteria list (three lists). The documents quote each source and say which they used; they do not pick a winner.

## 3. Controls described but absent or only partly present

| Control | Reality |
| --- | --- |
| "Confirmed gap" (a trusted teacher-confirmed diagnosis) | The server supports `trusted`, but the shipped UI always sends `trusted:false` (pinned by a test). Confirmed gaps are therefore never set from the UI. The guide says so. |
| Shared-phone / multi-learner support | Not implemented. One learner per browser profile. |
| Teacher view, parent view, accounts, analytics | Not implemented. |
| Real Odia↔English translation | Not implemented. Bridge Practice uses a small hand-written mapping table. |
| Production authentication | Not claimed. One shared demo code, in-memory throttle that resets on restart. |
| Answer secrecy | Not provided. The draft pack, including the answer key, ships to the browser, so this is a practice tool, not an exam. |
| Audit log | None. |
| CI | None; verification is by the commands in the status file. |

## 4. Claims stronger than the evidence (removed or narrowed)

- "Works offline on phones": narrowed to "works offline in headless Chromium; phones NOT TESTED".
- "Diagnoses misconceptions": narrowed to "option-linked mock rule; a live model is untested".
- "Secure": replaced by the specific controls that exist and what each was tested with.
- "Teacher-approved" / "reviewed": removed; all content is `UNREVIEWED_DRAFT`.
- "Built during the event": removed; the repository predates the competition window and every commit is authored by the AI-assisted build (disclosed in README, BUILD_STATUS, the guide and the Q&A bank).

## 5. Questions in the jury bank answered UNKNOWN / NOT TESTED / NOT REVIEWED / NOT IMPLEMENTED

The bank has 150 questions (the 126 required plus extras). Questions on phone behaviour, tunnel use, live model accuracy, teacher review, learner outcomes, scale/cost at scale, shared phones, accounts and anything depending on organizer confirmation are answered with the honest status, a one-line reason and the next step. These are intended answers, not gaps in the bank. The test suite checks that every required question number is present, that no placeholder remains and that every claim status in the matrix uses the allowed vocabulary.

## 6. Residual risk for the person presenting

1. Do not say "tested on phones", "works with Groq", "teacher-reviewed", "built at the event" or "secure" without the qualifier in the matrix.
2. If the jury asks who wrote the code, the true answer is in the provenance section: an AI-assisted build under the team's direction. Decide the team's answer before the event and keep it consistent with the repository.
3. The headless results are real but come from a sandbox; if the team's machine blocks local navigation, report BLOCKED rather than PASS.
