# Mutation results (current iteration)

Node v22.16.0. Test files: `tests/iteration11-retry-atomicity.test.js`. Mutants are applied to a temporary copy of `src/core`; the project tree is not modified.

Mutants: 1; killed 1; survived 0; errors 0.

| ID | Family | Fault | Result | Failing tests (first) |
|---|---|---|---|---|
| G1 | a | malformed clock is parsed without validation, allowing retry fields to mutate before timestamp failure | KILLED | scheduleAfterFailure rejects malformed timestamps before mutating any retry field |

Families: a = retry timing or limit; b = queue drained on provider error; c = validator accepts a foreign misconception id or confirms uncertainty.
