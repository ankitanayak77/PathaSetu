# Mutation results

Node v22.22.0. Mode: `plan`. Reporter: TAP (forced). Elapsed: 0.7 s. Catalogue: 46 mutants. Mutants are applied to a temporary copy of `src/core`; the project tree is not modified.

PARTIAL RUN: 1 of 46 mutants selected with --only. This is not a mutation score. Killed 1; survived 0; errors 0.

| ID | Family | Test groups | Tests executed (unmutated / mutated) | Result | ms | First failing test |
|---|---|---|---|---|---|---|
| G1 | a | atomicity + retry | 9 / 9 | KILLED | 323 | scheduleAfterFailure rejects malformed timestamps before mutating any retry field |

family a: 1/1 killed; family b: 0/0 killed; family c: 0/0 killed

Families: a = retry timing or limit; b = queue drained on provider error; c = validator accepts a foreign misconception id or confirms uncertainty.
