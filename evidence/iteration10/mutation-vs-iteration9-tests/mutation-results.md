# Mutation results (Iteration 10)

Node v22.22.0. Test files: `tests/retry.test.js, tests/agent.test.js, tests/validator.test.js, tests/storage.test.js, tests/storage-resilience.test.js, tests/iteration2-core.test.js`. Mutants are applied to a temporary copy of `src/core`; the project tree is not modified.

Mutants: 45; killed 33; survived 12; errors 0.

| ID | Family | Fault | Result | Failing tests (first) |
|---|---|---|---|---|
| A1 | a | backoff exponent off by one (waits 10 s, 20 s, ... instead of 5 s, 10 s, ...) | KILLED | the default policy is conservative: 5 automatic attempts, 5 s base, doubling, 60 s cap |
| A2 | a | backoff is never capped at maxDelayMs | KILLED | the default policy is conservative: 5 automatic attempts, 5 s base, doubling, 60 s cap |
| A3 | a | retry limit allows one extra automatic attempt (> instead of >=) | KILLED | 50 repeated provider failures count 50 attempts but occupy one trace line |
| A4 | a | retry limit stops one attempt early | KILLED | 50 repeated provider failures count 50 attempts but occupy one trace line |
| A5 | a | no retry limit at all (entries never pause) | KILLED | 50 repeated provider failures count 50 attempts but occupy one trace line |
| A6 | a | no backoff scheduled after a failure (immediate hot retry) | KILLED | backoff progression is written onto the entry after each failure, with the injected clock |
| A7 | a | a paused entry is treated as due | KILLED | after the maximum the entry pauses, stays queued with its answer, and is never due again automatically |
| A8 | a | default base delay changed from 5 s to 4 s | KILLED | the default policy is conservative: 5 automatic attempts, 5 s base, doubling, 60 s cap |
| A9 | a | entries saved before bounded retry lose their old attempts count | KILLED | an entry saved by an earlier version (no retry fields) is due, and still becomes bounded |
| B1 | b | a provider exception removes the queue entry | KILLED | deferred provider failures increment attempts and append a durable diagnostic trace |
| B2 | b | a rejected diagnosis removes the queue entry | KILLED | recheck with an invalid diagnosis is rejected and leaves the queue pending |
| B3 | b | an entry is deleted at the moment it pauses | KILLED | 50 repeated provider failures count 50 attempts but occupy one trace line |
| B4 |  | the provider-supplied result is ignored when it is missing (Iteration 9 behaviour: silent local fallback) | SURVIVED |  |
| B5 |  | a rejected diagnosis overwrites the stored answer before it is validated | SURVIVED |  |
| C1 | c | validator accepts a misconception id from a different question | KILLED | recheck with an invalid diagnosis is rejected and leaves the queue pending |
| C2 | c | validator lets an UNCERTAIN or NONE result carry a misconception id, and the planner then confirms it | SURVIVED |  |
| C3 | c | validator accepts a low-confidence misconception (threshold check removed) | KILLED | non-uncertain output below the confidence threshold is rejected |
| C4 |  | validator confidence threshold lowered from 0.65 to 0.60 | SURVIVED |  |
| C5 |  | validator ignores a question-id mismatch | KILLED | validator rejects a question-ID mismatch |
| C6 |  | validator accepts NaN confidence (finite check removed) | SURVIVED |  |
| C7 |  | validator accepts confidence outside 0..1 | KILLED | validator rejects malformed output and invalid confidence |
| C8 |  | validator reports an array as a different kind of problem (reason code drifts) | SURVIVED |  |
| C9 |  | an accepted diagnosis is no longer immutable | SURVIVED |  |
| D1 |  | success does not remove the processed entry (it would be processed again) | KILLED | mock re-check drains the queue but remains provisional and preserves current question |
| D2 |  | a background re-check switches the question on screen | KILLED | mock re-check drains the queue but remains provisional and preserves current question |
| D3 |  | manual retry also erases the cumulative attempts history | KILLED | manual retry resets only retry state: no new answer, session, queue entry, draft or current question |
| D4 |  | manual retry does not clear the paused flag | KILLED | manual retry resets only retry state: no new answer, session, queue entry, draft or current question |
| D5 |  | a repeated manual retry counts again (not idempotent) | KILLED | manual retry resets only retry state: no new answer, session, queue entry, draft or current question |
| D6 |  | manual retry of one entry resets every entry | SURVIVED |  |
| D7 |  | queue capacity allows one entry too many | KILLED | queue capacity rejects another answer without partially changing learner state |
| D8 |  | queue capacity is checked after the answer is stored (non-atomic refusal) | KILLED | queue capacity rejects another answer without partially changing learner state |
| D9 |  | the double-submit guard is removed | KILLED | a second submit for an already-answered question that has not been continued is rejected (double tap) |
| D10 |  | ids are no longer checked for uniqueness (Iteration 9 behaviour) | SURVIVED |  |
| D11 |  | failure trace lines coalesce across different queue entries | SURVIVED |  |
| D12 |  | failure trace lines never coalesce | KILLED | 50 repeated provider failures count 50 attempts but occupy one trace line |
| D13 |  | the trace is no longer bounded | SURVIVED |  |
| E1 |  | repair keeps duplicate queue ids | KILLED | partial corruption keeps every usable answer, queue entry, draft and counter and removes only the broken ones |
| E2 |  | repair adds a trace line even when nothing needed repair (not idempotent) | KILLED | a valid record passes through untouched with no repairs |
| E3 |  | repair silently drops all but the first valid queue entry | KILLED | partial corruption keeps every usable answer, queue entry, draft and counter and removes only the broken ones |
| E4 |  | repair can throw on a hostile record (safety net removed) | KILLED | repair never throws on hostile input shapes |
| E5 |  | repair does not cap an oversized queue | SURVIVED |  |
| E6 |  | repair does not cap an oversized trace | KILLED | oversized collections are capped instead of growing without bound |
| E7 |  | repair drops saved drafts | KILLED | a valid record passes through untouched with no repairs |
| F1 |  | memory storage hands out the stored object itself instead of a copy | KILLED | memory storage returns copies and can clear state |
| F2 |  | a rejected durable write overwrites the older durable record with an empty one | KILLED | a rejected write downgrades visibly: durable saved time stops, reason is the error name only, latest data stays in memory |

Families: a = retry timing or limit; b = queue drained on provider error; c = validator accepts a foreign misconception id or confirms uncertainty.
