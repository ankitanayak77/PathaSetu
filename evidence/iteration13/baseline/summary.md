# Iteration 13 baseline (before product edits)

Archive verified against `SHA256SUMS_Iteration12.txt`; ZIP integrity passed. Environment: Linux, Node v22.16.0, npm 10.9.2, Chromium executable `/usr/bin/chromium`.

| Command | Result | Detail |
|---|---|---|
| `npm ci` | PASS (0) | Up to date; 0 vulnerabilities |
| `npm test` | PASS (0) | 373/373 |
| `npm run check` | PASS (0) | Syntax checks |
| `npm run check:content` | PASS (0) | 8 items, all UNREVIEWED_DRAFT; consistency OK |
| `npm run preflight` | PASS (0) | 15 pass, 0 warn, 0 fail; local mock routes only |
| `npm run doctor` | PASS (0) | Required files, syntax, content consistency, preflight, browser executable discovery |
| `npm run evaluate -- --out evidence/iteration13/baseline/evaluation` | PASS (0) | 47 synthetic English cases; agreement 34/47; not a quality or learning-gain result |
| `npm run mutation -- --out evidence/iteration13/mutation` | INTERRUPTED | First invocation stopped externally after 7 mutants; its partial output is retained but is not counted as a pass |
| `npm run mutation -- --out evidence/iteration13/mutation-baseline-retry` | PASS (0) | 46/46 KILLED, 0 SURVIVED, 0 ERROR, 0 NOT_RUN; FINISHED in 14.0 s |
| `npm run capture` | BLOCKED (2) | 10 local API checks passed; Chromium journey blocked by ERR_BLOCKED_BY_ADMINISTRATOR |
| `npm run e2e` | BLOCKED (2) | 0 browser checks completed; ERR_BLOCKED_BY_ADMINISTRATOR |
| `A11Y_OUT=... npm run a11y` | BLOCKED (2) | 0 accessibility checks completed; ERR_BLOCKED_BY_ADMINISTRATOR |

The first interrupted mutation output is not overwritten. Browser latest-file evidence was backed up before browser runs and restored afterward. Iteration 12's earlier browser passes are not carried forward.
