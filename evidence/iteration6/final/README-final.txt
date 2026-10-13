Iteration 6 final regression - 13 Oct 2026, build sandbox, run on commit 899357c (tree clean; the only changes since are evidence files written by this run).
Environment: Node v22.22.0, npm 10.9.4, headless Chromium 141.0.7390.37 (CHROME_PATH=/tmp/chromium), Linux. See environment.txt.

Results (exit-codes.txt):
  npm ci                     exit 0
  npm test                   exit 0   207 of 207 pass, 0 skipped (198 Iteration 5 + 9 new claim-integrity tests)
  npm run check              exit 0
  npm run check:content      exit 0   8 items, all UNREVIEWED_DRAFT
  npm run preflight          exit 0   default local mock
  npm run capture            exit 0   19 passed, 0 failed, 0 blocked
  npm run e2e                exit 0   100 passed, 0 failed (95 + scenario Q1-Q5, which uses a STUBBED Groq-configured server; no live call)
  npm run a11y               exit 0   33 states, 462 checks, 0 failed
  npm run evaluate           exit 0   deterministic mock baseline, 47 synthetic English cases
  npm run smoke              exit 2   BLOCKED - GROQ_API_KEY / PATHASETU_MODEL_PROVIDER not set; no live call
  npm run evaluate -- --provider groq   exit 2   BLOCKED - credentials/data-controls acknowledgement not set; no live evaluation

Live-model gate: GROQ_API_KEY, PATHASETU_MODEL_PROVIDER, PATHASETU_DEMO_ACCESS_CODE and PATHASETU_PROVIDER_DATA_CONTROLS_ACK are all NOT SET (names only recorded, never values). So there is no connectivity, schema, error-rate, agreement, false-positive, abstention or latency result for a live provider, and none is claimed.
Not run and not claimed: real HTTPS/tunnel, S23/S25/S25 FE/iPhone 16, teacher review, learning outcomes.
Reproduced here vs elsewhere: all counts above are this sandbox only. The team's managed machine and a second audit environment could not navigate to localhost for capture/e2e/a11y (ERR_BLOCKED_BY_ADMINISTRATOR); those stay BLOCKED there and are not turned into passes.
The run rewrites evidence/browser-regression-latest.json, capture-latest.json and pathasetu-browser-latest.png (timestamps and run data).
