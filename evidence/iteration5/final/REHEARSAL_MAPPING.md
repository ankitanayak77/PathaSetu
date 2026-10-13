# Demo rehearsal mapping (Iteration 5, Task 6)

**What this is.** A map from the eight-step demo story in `docs/PITCH_SCRIPTS.md` and `docs/DEMO_RUNBOOK.md` to the automated browser checks that already exercise each step. Source of the check IDs: `evidence/iteration5/final/browser-regression.json` (e2e) and `capture.json` (capture journey).

**What this is not.** It is **not** a rehearsal by a person, **not** a timed run, and **not** a run on a phone. Every "pass" below is headless Chromium 141 on Linux in the build sandbox, driving the app programmatically. A human has not yet run the story end to end on the demo phone, so the 7-minute timing, the spoken narration and the physical offline toggle are **NOT TESTED**.

| # | Demo step | What the audience sees | Automated checks that cover it (headless) | Not covered by any check |
| --- | --- | --- | --- | --- |
| 1 | Unlock the demo (only in tunnel/public mode) | Overlay asks for the code; wrong code refused; right code loads question 1 | M1, M2, M3, M4, M5, M6, M7; throttle T1–T4 | A real HTTPS origin, a real phone keyboard entering the code |
| 2 | See why this question was chosen | First question and options, MOCK PROVIDER label, DRAFT badge, recommendation offered but not auto-applied | A1, A2, A3, B2, B3 | Whether a viewer finds the wording clear |
| 3 | Answer and type an explanation | Provisional feedback and remediation; the current question stays | B1, C1, C2 (double submit makes one answer, one session) | Odia text entry on a real keyboard |
| 4 | Read the diagnosis and the decision trace | Updated recommendation; trace panel lists the decisions | B1, B2; capture "decision trace is visible and records reconnect behavior"; S1–S3 (export without typed text) | Whether the diagnosis is *right* for a real learner (mock is a rule; no live model; content unreviewed) |
| 5 | Go offline and answer again | Offline indicator; answer saved and queued; reload still works | E1, E2; capture "offline answer is saved and queued…" | The physical airplane-mode toggle; iOS/Android service-worker behaviour |
| 6 | Reconnect: the queue drains | Queue empties on its own; draft, option, focus and caret stay on the same question | D1–D4, E3, E4, L1, L2, G6 | Real network flapping on mobile data |
| 7 | A failed re-check and the replan | Provider failure keeps the answer queued; bounded retry; paused state with Retry now | J1–J5 (HTTP 500, bad JSON, invalid diagnosis, hang), N1–N11 | A real provider outage (the mock server is stubbed in these tests) |
| 8 | Bridge Practice, then provider status | Local Odia↔English term exercise, reveal of source mapping, no API request; status says mock | K1–K10; A2 | Teacher review of the mappings (NOT REVIEWED) |

## Failure and storage branches also covered (not part of the main story)

Storage failure and repair: P1–P4, R1–R5. Second tab read-only: G1–G7. Service worker and caching: H1, I1, I2. Page errors: Z1.

## Result of the final run

Counts and exit codes for the run that produced these IDs are in `evidence/iteration5/final/README-final.txt` and `exit-codes.txt`. Every single check ID named above (and the ends of each range) was verified to exist in that file on 13 Oct 2026.

## Remaining rehearsal work (open)

1. A person runs the eight steps on the demo phone and a spare phone, with a stopwatch, using `docs/PITCH_SCRIPTS.md`.
2. The same person runs the fallback branch (no network, phone fails) from the pitch script.
3. Record the result in `docs/PHONE_TEST_RESULTS_TEMPLATE.csv`; until then every phone row stays NOT TESTED.
