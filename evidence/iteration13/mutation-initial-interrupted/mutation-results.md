# Mutation results

Node v22.16.0. Mode: `plan`. Reporter: TAP (forced). Elapsed: 5.7 s. Catalogue: 46 mutants. Mutants are applied to a temporary copy of `src/core`; the project tree is not modified.

IN PROGRESS (this file is rewritten after every mutant; if the run was stopped, no score exists): 7 of 46 done.

| ID | Family | Test groups | Tests executed (unmutated / mutated) | Result | ms | First failing test |
|---|---|---|---|---|---|---|
| A1 | a | retry + manual + atomicity | 13 / 13 | KILLED | 400 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A2 | a | retry + manual + atomicity | 13 / 13 | KILLED | 372 | custom policies: the delay is base * factor^(n-1), never above maxDelayMs, and the number  |
| A3 | a | retry + manual + atomicity | 13 / 13 | KILLED | 342 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A4 | a | retry + manual + atomicity | 13 / 13 | KILLED | 315 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A5 | a | retry + manual + atomicity | 13 / 13 | KILLED | 309 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A6 | a | retry + manual + atomicity | 13 / 13 | KILLED | 283 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |
| A7 | a | retry + manual + atomicity | 13 / 13 | KILLED | 261 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |

family a: 7/10 killed; family b: 0/3 killed; family c: 0/3 killed

Families: a = retry timing or limit; b = queue drained on provider error; c = validator accepts a foreign misconception id or confirms uncertainty.
