Iteration 6 baseline - untouched Iteration 5 checkout, 13 Oct 2026, build sandbox. HEAD aafa63f (see environment.txt for tree hash, ZIP/patch SHA-256 and recorded checksums).
Environment: Node v22.22.0, npm 10.9.4, headless Chromium 141.0.7390.37 (CHROME_PATH=/tmp/chromium), Linux.

All nine commands exited 0 (exit-codes.txt): npm ci; npm test 198/198; npm run check; npm run check:content; npm run preflight; npm run capture 19/0/0; npm run e2e 95/0; npm run a11y 462 checks 0 failed; npm run evaluate (deterministic mock baseline).

Reproduced HERE (this sandbox): all of the above, headless Chromium only.
NOT reproduced here and not claimed: the team's managed machine (reported capture/e2e BLOCKED by ERR_BLOCKED_BY_ADMINISTRATOR; a second independent audit environment also reported browser navigation blocked while its 198 unit tests, check, check:content and preflight passed). Those are separate environment results and stay BLOCKED there.
Live Groq gate: GROQ_API_KEY, PATHASETU_MODEL_PROVIDER, PATHASETU_DEMO_ACCESS_CODE and PATHASETU_PROVIDER_DATA_CONTROLS_ACK are all NOT SET; no smoke and no live evaluation were run.
