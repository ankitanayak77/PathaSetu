Iteration 5 final regression - 13 Oct 2026, build sandbox, commit 9629263 (docs/tests/evidence only; src/ and public/ identical to Iteration 4 commit 937d42e - see environment.txt).
Environment: Node v22.22.0, npm 10.9.4, headless Chromium 141.0.7390.37 (CHROME_PATH=/tmp/chromium), Linux.

Results (exit-codes.txt):
  npm ci                     exit 0
  npm test                   exit 0   198 of 198 pass, 0 skipped (182 Iteration 4 + 16 new Iteration 5 tests)
  npm run check              exit 0
  npm run check:content      exit 0   8 items, nothing marked reviewed
  npm run preflight          exit 0   default local mock
  npm run capture            exit 0   19 passed, 0 failed, 0 blocked
  npm run e2e                exit 0   95 passed, 0 failed
  npm run a11y               exit 0   33 states, 462 checks, 0 failed
  npm run evaluate           exit 0   deterministic mock baseline on 47 synthetic English cases (a rule, not a model)
  npm run smoke              exit 2   BLOCKED - credentials not configured; no live call made
  npm run evaluate -- --provider groq   exit 2   BLOCKED - credentials not configured; no live evaluation run

Limits: headless Chromium in this sandbox only. Not a phone, not a tunnel, not the team's machine (the team reported capture/e2e BLOCKED there by a machine policy; that stays BLOCKED).
Not run and not claimed: real HTTPS/tunnel, S23/S25/S25 FE/iPhone 16, teacher review, live Groq.
Evaluate outputs were moved from evidence/iteration3/evaluation/ into evaluation-outputs/ here so that this folder holds the whole Iteration 5 record.
The test run rewrites evidence/browser-regression-latest.json, capture-latest.json and pathasetu-browser-latest.png (timestamps and run data).
