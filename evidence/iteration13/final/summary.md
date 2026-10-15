# Iteration 13 — final regression summary

- Unit suite: 376/376 passed.
- Static syntax check: passed.
- Content consistency: 8 items and worksheet rows consistent; every item remains UNREVIEWED_DRAFT.
- Local preflight: 15 passed, 0 warnings, 0 failures; mock only.
- Doctor: passed required-file, syntax, content, preflight and browser executable discovery checks.
- Synthetic evaluation: 47/47 valid; 34/47 agreement; 0/8 false-positive misconceptions on correct reasoning; 2/12 proper abstentions. These are synthetic English cases, not model quality or learning-gain evidence.
- Mutation suite: FINISHED, 46/46 KILLED, 0 SURVIVED, 0 ERROR, 0 NOT_RUN. Exact command exit code 0.
- Browser capture: local API routes 10 pass, 0 fail; Chromium journey blocked by ERR_BLOCKED_BY_ADMINISTRATOR. Per the conservative policy, no browser journey pass is claimed.
- E2E: BLOCKED, zero browser checks completed.
- Accessibility: BLOCKED, zero checks completed.
- Runtime fixes: malformed bridge-attempt state is normalized during recovery and defensively during recording; reconciliation returns safely for malformed item collections. Three new tests were saved red-before-fix (23 pass, 3 fail), then green targeted suite (26/26), and the full suite passes.
- Human gates unchanged: 95/196 = 48.5% overall; implementation 95/148; readiness gates 0/48. Rule 4.1 remains UNCONFIRMED; organiser message remains UNSENT; no phone or qualified teacher review reported.
- D222 remains UNKNOWN; no causal claim was added. Node 23+ reporter behavior remains unverified because no Node 23+ binary was available.

The prior interrupted mutation invocation and its partial output are preserved separately. It was not counted as a pass. A subsequent full run completed successfully.
