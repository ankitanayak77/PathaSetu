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
