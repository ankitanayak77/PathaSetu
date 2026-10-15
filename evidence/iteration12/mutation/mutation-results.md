# Mutation results

Node v22.22.0. Mode: `plan`. Reporter: TAP (forced). Elapsed: 12.8 s. Catalogue: 46 mutants. Mutants are applied to a temporary copy of `src/core`; the project tree is not modified.

Complete run: 46 of 46 mutants; killed 46; survived 0; errors 0.

| ID | Family | Test groups | Tests executed (unmutated / mutated) | Result | ms | First failing test |
|---|---|---|---|---|---|---|
| A1 | a | retry + manual + atomicity | 13 / 13 | KILLED | 308 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A2 | a | retry + manual + atomicity | 13 / 13 | KILLED | 280 | custom policies: the delay is base * factor^(n-1), never above maxDelayMs, and the number  |
| A3 | a | retry + manual + atomicity | 13 / 13 | KILLED | 255 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A4 | a | retry + manual + atomicity | 13 / 13 | KILLED | 264 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A5 | a | retry + manual + atomicity | 13 / 13 | KILLED | 333 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A6 | a | retry + manual + atomicity | 13 / 13 | KILLED | 298 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A7 | a | retry + manual + atomicity | 13 / 13 | KILLED | 321 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A8 | a | retry + manual + atomicity | 13 / 13 | KILLED | 329 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A9 | a | retry + legacy | 5 / 5 | KILLED | 178 | legacy entries without retry fields are recoverable: kept by repair, due now, bounded when |
| B1 | b | faults + success + retry | 29 / 29 | KILLED | 168 | fault network_error: the entry is not drained, the answer is untouched, one attempt is cou |
| B2 | b | faults + success + retry | 29 / 29 | KILLED | 193 | fault null_body: the entry is not drained, the answer is untouched, one attempt is counted |
| B3 | b | faults + retry + manual | 30 / 30 | KILLED | 190 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| B4 |  | faults | 23 / 23 | KILLED | 214 | fault null_body: the entry is not drained, the answer is untouched, one attempt is counted |
| B5 |  | faults | 23 / 23 | KILLED | 210 | fault null_body: the entry is not drained, the answer is untouched, one attempt is counted |
| C1 | c | validator + faults | 26 / 26 | KILLED | 187 | fault foreign_misconception_id: the entry is not drained, the answer is untouched, one att |
| C2 | c | validator + success | 5 / 5 | KILLED | 165 | validator, exhaustive grid: accepted if and only if the documented contract holds, and an  |
| C3 | c | validator + faults | 26 / 26 | KILLED | 181 | fault low_confidence_misconception: the entry is not drained, the answer is untouched, one |
| C4 |  | validator | 3 / 3 | KILLED | 136 | validator, exhaustive grid: accepted if and only if the documented contract holds, and an  |
| C5 |  | validator + faults | 26 / 26 | KILLED | 204 | fault wrong_question: the entry is not drained, the answer is untouched, one attempt is co |
| C6 |  | validator + faults | 26 / 26 | KILLED | 168 | fault confidence_nan: the entry is not drained, the answer is untouched, one attempt is co |
| C7 |  | validator + faults | 26 / 26 | KILLED | 196 | fault confidence_above_one: the entry is not drained, the answer is untouched, one attempt |
| C8 |  | validator + faults | 26 / 26 | KILLED | 212 | validator, exhaustive grid: accepted if and only if the documented contract holds, and an  |
| C9 |  | validator + faults | 26 / 26 | KILLED | 204 | validator, exhaustive grid: accepted if and only if the documented contract holds, and an  |
| D1 |  | success + faults | 26 / 26 | KILLED | 230 | fault network_error: the entry is not drained, the answer is untouched, one attempt is cou |
| D2 |  | success | 3 / 3 | KILLED | 151 | background re-check never switches the current question, discards the learner draft or spe |
| D3 |  | manual | 4 / 4 | KILLED | 168 | manual retry changes only the retry fields of the chosen entry and nothing else in the sta |
| D4 |  | manual | 4 / 4 | KILLED | 163 | manual retry changes only the retry fields of the chosen entry and nothing else in the sta |
| D5 |  | manual | 4 / 4 | KILLED | 139 | repeating a manual retry is a no-op: state is identical, no new trace line, no extra manua |
| D6 |  | manual | 4 / 4 | KILLED | 149 | manual retry changes only the retry fields of the chosen entry and nothing else in the sta |
| D7 |  | ids | 6 / 6 | KILLED | 175 | every refused submission is atomic: unknown question, unknown option, duplicate and full q |
| D8 |  | ids | 6 / 6 | KILLED | 186 | every refused submission is atomic: unknown question, unknown option, duplicate and full q |
| D9 |  | ids | 6 / 6 | KILLED | 186 | duplicate submit (double tap) is refused before anything changes: no extra answer, queue e |
| D10 |  | ids | 6 / 6 | KILLED | 182 | identity (fault injection): ids stay unique when the clock and the random suffix repeat, s |
| D11 |  | trace | 2 / 2 | KILLED | 177 | adjacent repeats of the same failure for the same entry coalesce; any intervening event ke |
| D12 |  | trace | 2 / 2 | KILLED | 179 | adjacent repeats of the same failure for the same entry coalesce; any intervening event ke |
| D13 |  | trace | 2 / 2 | KILLED | 134 | trace is bounded by 200 lines under thousands of failures, keeps the newest events, and pa |
| E1 |  | repair + persist + legacy | 10 / 10 | KILLED | 297 | repair keeps every usable record around the damage and removes duplicates and junk |
| E2 |  | repair + persist + legacy | 10 / 10 | KILLED | 179 | JSON save and restore preserves answers, drafts and every queue entry, and the restored en |
| E3 |  | repair + persist + legacy | 10 / 10 | KILLED | 258 | repair keeps every usable record around the damage and removes duplicates and junk |
| E4 |  | repair + persist + legacy | 10 / 10 | KILLED | 304 | malformed records of every shape are repaired or replaced without throwing, and the repair |
| E5 |  | repair + persist + legacy | 10 / 10 | KILLED | 334 | oversized saved collections are cut to their limits: the newest answers and the oldest que |
| E6 |  | repair + persist + legacy | 10 / 10 | KILLED | 266 | trace stays within its limit through repair, even when the saved trace is far over it |
| E7 |  | repair + persist + legacy | 10 / 10 | KILLED | 242 | JSON save and restore preserves answers, drafts and every queue entry, and the restored en |
| F1 |  | persist | 3 / 3 | KILLED | 160 | persistence: a saved record comes back as an independent copy with the whole queue and ret |
| F2 |  | persist | 3 / 3 | KILLED | 141 | persistence fault: when a write is rejected, the older durable record is left alone, the n |
| G1 | a | atomicity + retry | 9 / 9 | KILLED | 257 | scheduleAfterFailure rejects malformed timestamps before mutating any retry field |

family a: 10/10 killed; family b: 3/3 killed; family c: 3/3 killed

Families: a = retry timing or limit; b = queue drained on provider error; c = validator accepts a foreign misconception id or confirms uncertainty.
