# Diagnosis evaluation: deterministic baseline (option-linked mock rule)

**Dataset status: TEAM_AUTHORED_UNVALIDATED.** Reference labels were written by the team with AI assistance and have NOT been reviewed by a qualified science or Odia reviewer. Results are not educational accuracy. English only: no Odia script or Roman Odia case is included because no reviewer can check them yet.

Run: 2026-10-14T05:49:23.708Z · provider: mock-deterministic-baseline · cases: 47 · languages: en · Odia script and Roman Odia: **NOT EVALUATED**.

Reference class counts: NONE 8, MISCONCEPTION 27, UNCERTAIN 4, INSUFFICIENT_EVIDENCE 8.

## A. API and schema compatibility (independent of the reference labels)

| Measure | Result |
| --- | --- |
| Structurally valid and accepted by the validator | 47/47 (100%, 95% CI 92% to 100%) |
| Rejected by the validator | 0 |
| Request errors | 0 (timeouts 0) |
| Latency p50 / p95 | 0 ms / 0 ms |

A high value here means the request shape and response format work. It says nothing about whether the diagnoses are right.

## B. Agreement with the unvalidated reference labels

| Measure | Result |
| --- | --- |
| Agreement over all cases (errors and rejections count as disagreement) | 34/47 (72%, 95% CI 58% to 83%) |
| Agreement over valid outputs only | 34/47 (72%, 95% CI 58% to 83%) |
| · correct reasoning | 8/8 (100%, 95% CI 68% to 100%) |
| · genuine misconception | 24/27 (89%, 95% CI 72% to 96%) |
| · ambiguous | 0/4 (0%, 95% CI 0% to 49%) |
| · insufficient information | 2/8 (25%, 95% CI 7% to 59%) |
| False-positive misconceptions on correct reasoning | 0/8 (0%, 95% CI 0% to 32%) |
| Misconception cases: detected / with the reference id / another id / missed as NONE / abstained | 24 / 24 / 0 / 3 / 0 of 27 |
| "Right answer, wrong reason" cases agreed | 0/3 |
| Abstention overall | 2/47 (4%, 95% CI 1% to 14%) |
| Over-abstention on answerable cases | 0/35 (0%, 95% CI 0% to 10%) |
| Proper abstention on ambiguous or insufficient cases | 2/12 (17%, 95% CI 5% to 45%) |
| False confidence on ambiguous or insufficient cases | 10/12 (83%, 95% CI 55% to 95%) |

| Reference \ predicted | MISCONCEPTION | NONE | UNCERTAIN | not valid |
| --- | --- | --- | --- | --- |
| MISCONCEPTION | 24 | 3 | 0 | 0 |
| NONE | 0 | 8 | 0 | 0 |
| UNCERTAIN | 4 | 6 | 2 | 0 |

Per-type precision and recall: MISCONCEPTION P=86% R=89% (27 reference cases); NONE P=47% R=100% (8 reference cases); UNCERTAIN P=100% R=17% (12 reference cases).

Per-misconception precision and recall: ENERGY_CREATED P=100% R=67% (n=3).

Not reported because they have fewer than 3 reference cases each: ADDS_PARALLEL_RESISTANCES (n=1), BATTERY_INSTANTLY_EMPTY (n=2), CURRENT_ACCUMULATES (n=1), CURRENT_CONSUMED_BY_COMPONENT (n=2), CURRENT_FLOWS_WITHOUT_CLOSED_PATH (n=1), CURRENT_INDEPENDENT_OF_VOLTAGE (n=1), CURRENT_INVERSE_TO_VOLTAGE (n=1), CURRENT_STORED_IN_BULB (n=1), CURRENT_STORED_IN_COMPONENT (n=1), CURRENT_TURNS_INTO_AIR (n=1), DIVIDES_RESISTANCE_BY_VOLTAGE (n=1), ENERGY_DESTROYED (n=2), ENERGY_HAS_NO_TRANSFER (n=1), EQUIVALENT_PARALLEL_EQUALS_ONE_BRANCH (n=1), MULTIPLIES_SERIES_RESISTANCES (n=1), MULTIPLIES_VOLTAGE_AND_RESISTANCE (n=1), PARALLEL_RESISTANCE_ALWAYS_ZERO (n=1), TREATS_SERIES_AS_PARALLEL (n=1), USES_LARGEST_SERIES_RESISTOR_ONLY (n=1), USES_RESISTANCE_AS_CURRENT (n=1), VOLTAGE_DOUBLES_RESISTANCE (n=1).

Prompt-injection probe: E009 → NONE (did not follow it).

### Notable failures

| Case | Item | Category / variant | Reference | System result |
| --- | --- | --- | --- | --- |
| E005 | EL01 | genuine misconception / right_answer_wrong_reason | MISCONCEPTION:CURRENT_CONSUMED_BY_COMPONENT | NONE |
| E006 | EL01 | ambiguous / standard | UNCERTAIN | MISCONCEPTION:CURRENT_ACCUMULATES |
| E007 | EL01 | insufficient information / standard | INSUFFICIENT_EVIDENCE | MISCONCEPTION:CURRENT_ACCUMULATES |
| E008 | EL01 | insufficient information / standard | INSUFFICIENT_EVIDENCE | NONE |
| E009 | EL01 | insufficient information / prompt_injection_probe | INSUFFICIENT_EVIDENCE | NONE |
| E014 | EL02 | genuine misconception / right_answer_wrong_reason | MISCONCEPTION:BATTERY_INSTANTLY_EMPTY | NONE |
| E015 | EL02 | ambiguous / standard | UNCERTAIN | MISCONCEPTION:CURRENT_STORED_IN_BULB |
| E016 | EL02 | insufficient information / standard | INSUFFICIENT_EVIDENCE | NONE |
| E021 | EL03 | genuine misconception / right_answer_wrong_reason | MISCONCEPTION:ENERGY_CREATED | NONE |
| E027 | EL04 | ambiguous / standard | UNCERTAIN | NONE |
| E032 | EL05 | insufficient information / standard | INSUFFICIENT_EVIDENCE | NONE |
| E037 | EL06 | insufficient information / standard | INSUFFICIENT_EVIDENCE | NONE |
| E042 | EL07 | ambiguous / standard | UNCERTAIN | MISCONCEPTION:ADDS_PARALLEL_RESISTANCES |

## Limits

- Reference labels are team-authored and unvalidated: agreement is not educational accuracy.
- English only. Odia script and Roman Odia were NOT evaluated.
- With so few cases per class the intervals are wide; do not compare small differences.
- This is an engineering check of behaviour on team-written examples. It is not a validated benchmark, not evidence of Odia understanding, and not evidence of learning impact.

