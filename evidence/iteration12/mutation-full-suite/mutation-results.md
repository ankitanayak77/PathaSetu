# Mutation results

Node v22.22.0. Mode: `full-suite`. Reporter: TAP (forced). Elapsed: 39.0 s. Catalogue: 46 mutants. Mutants are applied to a temporary copy of `src/core`; the project tree is not modified.

Complete run: 46 of 46 mutants; killed 46; survived 0; errors 0.

| ID | Family | Test groups | Tests executed (unmutated / mutated) | Result | ms | First failing test |
|---|---|---|---|---|---|---|
| A1 | a | all | 62 / 62 | KILLED | 1219 | fault network_error: the entry is not drained, the answer is untouched, one attempt is cou |
| A2 | a | all | 62 / 62 | KILLED | 1182 | custom policies: the delay is base * factor^(n-1), never above maxDelayMs, and the number  |
| A3 | a | all | 62 / 62 | KILLED | 904 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A4 | a | all | 62 / 62 | KILLED | 872 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A5 | a | all | 62 / 62 | KILLED | 815 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A6 | a | all | 62 / 62 | KILLED | 504 | fault network_error: the entry is not drained, the answer is untouched, one attempt is cou |
| A7 | a | all | 62 / 62 | KILLED | 836 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A8 | a | all | 62 / 62 | KILLED | 1181 | fault network_error: the entry is not drained, the answer is untouched, one attempt is cou |
| A9 | a | all | 62 / 62 | KILLED | 1161 | legacy entries without retry fields are recoverable: kept by repair, due now, bounded when |
| B1 | b | all | 62 / 62 | KILLED | 461 | a repeated failure report or a repeated manual retry never creates a second entry, answer  |
| B2 | b | all | 62 / 62 | KILLED | 515 | fault null_body: the entry is not drained, the answer is untouched, one attempt is counted |
| B3 | b | all | 62 / 62 | KILLED | 967 | a repeated failure report or a repeated manual retry never creates a second entry, answer  |
| B4 |  | all | 62 / 62 | KILLED | 504 | fault null_body: the entry is not drained, the answer is untouched, one attempt is counted |
| B5 |  | all | 62 / 62 | KILLED | 500 | fault null_body: the entry is not drained, the answer is untouched, one attempt is counted |
| C1 | c | all | 62 / 62 | KILLED | 552 | fault foreign_misconception_id: the entry is not drained, the answer is untouched, one att |
| C2 | c | all | 62 / 62 | KILLED | 573 | fault uncertain_with_misconception_id: the entry is not drained, the answer is untouched,  |
| C3 | c | all | 62 / 62 | KILLED | 578 | fault low_confidence_misconception: the entry is not drained, the answer is untouched, one |
| C4 |  | all | 62 / 62 | KILLED | 1365 | validator, exhaustive grid: accepted if and only if the documented contract holds, and an  |
| C5 |  | all | 62 / 62 | KILLED | 539 | fault wrong_question: the entry is not drained, the answer is untouched, one attempt is co |
| C6 |  | all | 62 / 62 | KILLED | 493 | fault confidence_nan: the entry is not drained, the answer is untouched, one attempt is co |
| C7 |  | all | 62 / 62 | KILLED | 560 | fault confidence_above_one: the entry is not drained, the answer is untouched, one attempt |
| C8 |  | all | 62 / 62 | KILLED | 1139 | validator, exhaustive grid: accepted if and only if the documented contract holds, and an  |
| C9 |  | all | 62 / 62 | KILLED | 1265 | validator, exhaustive grid: accepted if and only if the documented contract holds, and an  |
| D1 |  | all | 62 / 62 | KILLED | 482 | identity (fault injection): ids stay unique when the clock and the random suffix repeat, s |
| D2 |  | all | 62 / 62 | KILLED | 495 | background re-check never switches the current question, discards the learner draft or spe |
| D3 |  | all | 62 / 62 | KILLED | 1097 | manual retry changes only the retry fields of the chosen entry and nothing else in the sta |
| D4 |  | all | 62 / 62 | KILLED | 855 | manual retry changes only the retry fields of the chosen entry and nothing else in the sta |
| D5 |  | all | 62 / 62 | KILLED | 499 | repeating a manual retry is a no-op: state is identical, no new trace line, no extra manua |
| D6 |  | all | 62 / 62 | KILLED | 1174 | manual retry changes only the retry fields of the chosen entry and nothing else in the sta |
| D7 |  | all | 62 / 62 | KILLED | 1057 | every refused submission is atomic: unknown question, unknown option, duplicate and full q |
| D8 |  | all | 62 / 62 | KILLED | 1171 | every refused submission is atomic: unknown question, unknown option, duplicate and full q |
| D9 |  | all | 62 / 62 | KILLED | 468 | duplicate submit (double tap) is refused before anything changes: no extra answer, queue e |
| D10 |  | all | 62 / 62 | KILLED | 465 | identity (fault injection): ids stay unique when the clock and the random suffix repeat, s |
| D11 |  | all | 62 / 62 | KILLED | 1075 | adjacent repeats of the same failure for the same entry coalesce; any intervening event ke |
| D12 |  | all | 62 / 62 | KILLED | 1071 | seeded fuzz: random damage to a valid record never throws, never leaves an unusable entry, |
| D13 |  | all | 62 / 62 | KILLED | 961 | trace stays within its limit through repair, even when the saved trace is far over it |
| E1 |  | all | 62 / 62 | KILLED | 464 | repair keeps every usable record around the damage and removes duplicates and junk |
| E2 |  | all | 62 / 62 | KILLED | 411 | JSON save and restore preserves answers, drafts and every queue entry, and the restored en |
| E3 |  | all | 62 / 62 | KILLED | 482 | repair keeps every usable record around the damage and removes duplicates and junk |
| E4 |  | all | 62 / 62 | KILLED | 1086 | malformed records of every shape are repaired or replaced without throwing, and the repair |
| E5 |  | all | 62 / 62 | KILLED | 1157 | oversized saved collections are cut to their limits: the newest answers and the oldest que |
| E6 |  | all | 62 / 62 | KILLED | 1108 | trace stays within its limit through repair, even when the saved trace is far over it |
| E7 |  | all | 62 / 62 | KILLED | 465 | JSON save and restore preserves answers, drafts and every queue entry, and the restored en |
| F1 |  | all | 62 / 62 | KILLED | 1100 | persistence: a saved record comes back as an independent copy with the whole queue and ret |
| F2 |  | all | 62 / 62 | KILLED | 1010 | persistence fault: when a write is rejected, the older durable record is left alone, the n |
| G1 | a | all | 62 / 62 | KILLED | 1035 | scheduleAfterFailure rejects malformed timestamps before mutating any retry field |

family a: 10/10 killed; family b: 3/3 killed; family c: 3/3 killed

Families: a = retry timing or limit; b = queue drained on provider error; c = validator accepts a foreign misconception id or confirms uncertainty.
