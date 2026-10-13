# Diagnosis evaluation — method, files and limits

**Nothing in this document is evidence of Odia understanding, educational accuracy or learning impact.**

## What it measures

`npm run evaluate` runs the diagnosis path on `evaluation/cases.json`: 47 English cases written by the team with AI assistance, labelled `TEAM_AUTHORED_UNVALIDATED`. They cover four categories: correct reasoning (8), genuine misconception (27, including 3 "right answer, wrong reason"), ambiguous (4) and insufficient information (8, including one prompt-injection probe). No Odia script or Roman Odia case exists because no reviewer can check them yet.

The report keeps two questions apart:

- **A. API and schema compatibility** — the response had the right shape, the question matched, the diagnosis ID was allowed for that item and the validator accepted it, with request errors, timeouts and latency. High here means the plumbing works. It says nothing about whether diagnoses are right.
- **B. Agreement with the reference labels** — agreement overall and by category, false-positive misconceptions on correct reasoning, abstention and over-abstention, a confusion matrix, per-type precision and recall, per-misconception precision and recall only where there are at least 3 reference cases, a list of failures, and Wilson 95% intervals. The labels are the team's, so this is agreement, not accuracy.

## Runs

| Run | Command | Status |
| --- | --- | --- |
| Deterministic baseline (option-linked mock rule, no network) | `npm run evaluate` | Done; `evidence/iteration3/evaluation/evaluation-baseline-*.md` and `.json` |
| Live Groq `openai/gpt-oss-20b` through the real server route | `PATHASETU_MODEL_PROVIDER=groq GROQ_API_KEY=… PATHASETU_DEMO_ACCESS_CODE=… npm run evaluate -- --provider groq` | **BLOCKED** (exit 2): no local credentials. Not run. |
| Optional larger Groq model | same, with `GROQ_MODEL` | Not run |

The live run goes through the same validated route as the app and always includes the baseline on identical cases. It never prints or stores keys, headers or raw provider bodies, and it uses the synthetic cases only. Enable Zero Data Retention in the Groq console first and review the provider's current terms.

## Baseline numbers (13 Oct 2026, rebuilt tree)

Compatibility 47/47. Agreement 34/47 (72%, 95% CI 58% to 83%). Correct reasoning 8/8; genuine misconception 24/27; ambiguous 0/4; insufficient information 2/8. False-positive misconceptions on correct reasoning 0/8. The rule abstained on 2 of 12 ambiguous or insufficient cases and was confidently wrong or confident on the other 10. It does not read the text, so these figures describe the rule, not a model.

## Reviewing the cases

`evaluation/EVALUATION_REVIEW_TEMPLATE.csv` lists the 47 English cases for a qualified reviewer to confirm or correct and 24 blank rows for Odia script and Roman Odia examples that only a reviewer may author. Instructions: `docs/REVIEWER_GUIDE.md`. `npm run check:content` verifies the English rows still match `cases.json` and that any row a reviewer completed is internally consistent (name, date, valid labels, allowed misconception IDs). It cannot verify identity or judge correctness. The shipped file has every reviewer field empty, which a unit test pins.

## Limits

Small counts give wide intervals; do not compare small differences. A real model may do better or worse than the baseline; that is unknown until the live run is done and the labels are reviewed. Smoke tests prove shape only.

## Live runs, false confidence and abstention (iteration 4)

- **Gate.** `npm run smoke` and `npm run evaluate -- --provider groq` need `PATHASETU_MODEL_PROVIDER=groq`, `GROQ_API_KEY`, a strong `PATHASETU_DEMO_ACCESS_CODE` and `PATHASETU_PROVIDER_DATA_CONTROLS_ACK=true` already set in your local environment (the last only records that you reviewed the provider's data controls). Otherwise they stop with `BLOCKED — credentials not configured` (exit 2) and make no request. Keys are never requested or printed. In this build both are BLOCKED (`evidence/iteration4/final/groq-status.txt`).
- **Synthetic data only.** Both commands send only the team-authored synthetic cases. Never send a real child's response.
- **Two questions stay apart.** Compatibility (A: valid shape, allowed IDs, accepted by the validator) says the plumbing works; agreement (B: match with the unvalidated reference labels) says nothing about correctness until a qualified reviewer confirms the labels.
- **Languages stay apart.** Only English cases exist. Odia script and Roman Odia are **NOT EVALUATED**, and no figure may be extrapolated to them.
- **False confidence and abstention are first-class outcomes.** A confident misconception on a correct explanation (false positive) and a confident answer on an ambiguous or insufficient-evidence case (false confidence) are reported on their own lines, as is correct abstention (`UNCERTAIN`/`INSUFFICIENT_EVIDENCE`) and over-abstention. The deterministic baseline abstains correctly on 2 of 12 such cases, so a high agreement figure must not be read as safe behaviour.
