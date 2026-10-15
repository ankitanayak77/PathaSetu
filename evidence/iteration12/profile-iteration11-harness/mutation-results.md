# Mutation results (current iteration)

Node v22.22.0. Test files: `tests/queue-invariants.test.js, tests/iteration11-retry-atomicity.test.js`. Mutants are applied to a temporary copy of `src/core`; the project tree is not modified.

Mutants: 46; killed 46; survived 0; errors 0.

| ID | Family | Fault | Result | Failing tests (first) |
|---|---|---|---|---|
| A1 | a | backoff exponent off by one (waits 10 s, 20 s, ... instead of 5 s, 10 s, ...) | KILLED | a valid ISO timestamp retains the existing bounded retry behaviour |
| A2 | a | backoff is never capped at maxDelayMs | KILLED | custom policies: the delay is base * factor^(n-1), never above maxDelayMs, and the number of provider calls equals maxAutomaticAttempts |
| A3 | a | retry limit allows one extra automatic attempt (> instead of >=) | KILLED | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry pauses and is never due again |
| A4 | a | retry limit stops one attempt early | KILLED | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry pauses and is never due again |
| A5 | a | no retry limit at all (entries never pause) | KILLED | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry pauses and is never due again |
| A6 | a | no backoff scheduled after a failure (immediate hot retry) | KILLED | a valid ISO timestamp retains the existing bounded retry behaviour |
| A7 | a | a paused entry is treated as due | KILLED | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry pauses and is never due again |
| A8 | a | default base delay changed from 5 s to 4 s | KILLED | a valid ISO timestamp retains the existing bounded retry behaviour |
| A9 | a | entries saved before bounded retry lose their old attempts count | KILLED | legacy entries without retry fields are recoverable: kept by repair, due now, bounded when they fail, and drained on success |
| B1 | b | a provider exception removes the queue entry | KILLED | recordRecheckDeferred is atomic when the injected clock is invalid |
| B2 | b | a rejected diagnosis removes the queue entry | KILLED | fault null_body: the entry is not drained, the answer is untouched, one attempt is counted, and it recovers when the provider works |
| B3 | b | an entry is deleted at the moment it pauses | KILLED | a repeated failure report or a repeated manual retry never creates a second entry, answer or session |
| B4 |  | the provider-supplied result is ignored when it is missing (Iteration 9 behaviour: silent local fallback) | KILLED | fault null_body: the entry is not drained, the answer is untouched, one attempt is counted, and it recovers when the provider works |
| B5 |  | a rejected diagnosis overwrites the stored answer before it is validated | KILLED | a provider diagnosis rejected by the validator leaves the queue state unchanged when its clock is invalid |
| C1 | c | validator accepts a misconception id from a different question | KILLED | fault foreign_misconception_id: the entry is not drained, the answer is untouched, one attempt is counted, and it recovers when the provider works |
| C2 | c | validator lets an UNCERTAIN or NONE result carry a misconception id, and the planner then confirms it | KILLED | fault uncertain_with_misconception_id: the entry is not drained, the answer is untouched, one attempt is counted, and it recovers when the provider works |
| C3 | c | validator accepts a low-confidence misconception (threshold check removed) | KILLED | fault low_confidence_misconception: the entry is not drained, the answer is untouched, one attempt is counted, and it recovers when the provider works |
| C4 |  | validator confidence threshold lowered from 0.65 to 0.60 | KILLED | validator, exhaustive grid: accepted if and only if the documented contract holds, and an accepted result never confirms uncertainty |
| C5 |  | validator ignores a question-id mismatch | KILLED | fault wrong_question: the entry is not drained, the answer is untouched, one attempt is counted, and it recovers when the provider works |
| C6 |  | validator accepts NaN confidence (finite check removed) | KILLED | fault confidence_nan: the entry is not drained, the answer is untouched, one attempt is counted, and it recovers when the provider works |
| C7 |  | validator accepts confidence outside 0..1 | KILLED | fault confidence_above_one: the entry is not drained, the answer is untouched, one attempt is counted, and it recovers when the provider works |
| C8 |  | validator reports an array as a different kind of problem (reason code drifts) | KILLED | validator, exhaustive grid: accepted if and only if the documented contract holds, and an accepted result never confirms uncertainty |
| C9 |  | an accepted diagnosis is no longer immutable | KILLED | validator, exhaustive grid: accepted if and only if the documented contract holds, and an accepted result never confirms uncertainty |
| D1 |  | success does not remove the processed entry (it would be processed again) | KILLED | identity (fault injection): ids stay unique when the clock and the random suffix repeat, so one re-check cannot swallow another entry |
| D2 |  | a background re-check switches the question on screen | KILLED | background re-check never switches the current question, discards the learner draft or spends a session |
| D3 |  | manual retry also erases the cumulative attempts history | KILLED | manual retry changes only the retry fields of the chosen entry and nothing else in the state |
| D4 |  | manual retry does not clear the paused flag | KILLED | manual retry changes only the retry fields of the chosen entry and nothing else in the state |
| D5 |  | a repeated manual retry counts again (not idempotent) | KILLED | repeating a manual retry is a no-op: state is identical, no new trace line, no extra manual-retry count |
| D6 |  | manual retry of one entry resets every entry | KILLED | manual retry changes only the retry fields of the chosen entry and nothing else in the state |
| D7 |  | queue capacity allows one entry too many | KILLED | every refused submission is atomic: unknown question, unknown option, duplicate and full queue leave no partial change |
| D8 |  | queue capacity is checked after the answer is stored (non-atomic refusal) | KILLED | every refused submission is atomic: unknown question, unknown option, duplicate and full queue leave no partial change |
| D9 |  | the double-submit guard is removed | KILLED | the shipped eight-question pack refuses a duplicate answer before the learner continues |
| D10 |  | ids are no longer checked for uniqueness (Iteration 9 behaviour) | KILLED | identity (fault injection): ids stay unique when the clock and the random suffix repeat, so one re-check cannot swallow another entry |
| D11 |  | failure trace lines coalesce across different queue entries | KILLED | adjacent repeats of the same failure for the same entry coalesce; any intervening event keeps them separate and readable |
| D12 |  | failure trace lines never coalesce | KILLED | seeded fuzz: random damage to a valid record never throws, never leaves an unusable entry, is idempotent, and spares untouched entries |
| D13 |  | the trace is no longer bounded | KILLED | trace stays within its limit through repair, even when the saved trace is far over it |
| E1 |  | repair keeps duplicate queue ids | KILLED | repair keeps every usable record around the damage and removes duplicates and junk |
| E2 |  | repair adds a trace line even when nothing needed repair (not idempotent) | KILLED | JSON save and restore preserves answers, drafts and every queue entry, and the restored entries behave identically |
| E3 |  | repair silently drops all but the first valid queue entry | KILLED | repair keeps every usable record around the damage and removes duplicates and junk |
| E4 |  | repair can throw on a hostile record (safety net removed) | KILLED | malformed records of every shape are repaired or replaced without throwing, and the repaired record is a fixed point |
| E5 |  | repair does not cap an oversized queue | KILLED | oversized saved collections are cut to their limits: the newest answers and the oldest queue entries are kept |
| E6 |  | repair does not cap an oversized trace | KILLED | trace stays within its limit through repair, even when the saved trace is far over it |
| E7 |  | repair drops saved drafts | KILLED | JSON save and restore preserves answers, drafts and every queue entry, and the restored entries behave identically |
| F1 |  | memory storage hands out the stored object itself instead of a copy | KILLED | persistence: a saved record comes back as an independent copy with the whole queue and retry state, and repair finds nothing to fix |
| F2 |  | a rejected durable write overwrites the older durable record with an empty one | KILLED | persistence fault: when a write is rejected, the older durable record is left alone, the newest state stays available in memory with its whole queue, and the reason holds no learner text |
| G1 | a | malformed clock is parsed without validation, allowing retry fields to mutate before timestamp failure | KILLED | scheduleAfterFailure rejects malformed timestamps before mutating any retry field |

Families: a = retry timing or limit; b = queue drained on provider error; c = validator accepts a foreign misconception id or confirms uncertainty.
