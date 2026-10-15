# Mutation results

Node v22.16.0. Mode: `plan`. Reporter: TAP (forced). Elapsed: 0.6 s. Catalogue: 46 mutants. Mutants are applied to a temporary copy of `src/core`; the project tree is not modified.

PARTIAL RUN: 1 of 46 mutants selected with --only. This is not a mutation score. Killed 1; survived 0; errors 0.

| ID | Family | Test groups | Tests executed (unmutated / mutated) | Result | ms | First failing test |
|---|---|---|---|---|---|---|
| A8 | a | retry + manual + atomicity | 13 / 13 | KILLED | 291 | default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry |

family a: 1/1 killed; family b: 0/0 killed; family c: 0/0 killed

Families: a = retry timing or limit; b = queue drained on provider error; c = validator accepts a foreign misconception id or confirms uncertainty.
