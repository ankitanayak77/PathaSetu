Iteration 5 baseline - rerun of the Iteration 4 package at commit 937d42e (2026-10-13, this sandbox).
Environment: Node v22.22.0, npm 10.9.4, headless Chromium 141.0.7390.37 (CHROME_PATH=/tmp/chromium). See environment.txt.

Result: every command exited 0 (exit-codes.txt):
  npm ci, npm test (182/182), npm run check, npm run check:content, npm run preflight,
  npm run capture (19 passed, 0 failed, 0 blocked), npm run e2e (95 passed, 0 failed),
  npm run a11y (see accessibility/a11y-report.md).

Scope and limits:
- This is a HEADLESS Chromium result in the build sandbox. It is not a phone result and not a result on the team's own machine.
- The team separately reported that on THEIR environment the capture Chromium journey and e2e were BLOCKED by ERR_BLOCKED_BY_ADMINISTRATOR
  (a machine browser policy). That report is kept as BLOCKED. Nothing here turns it into a pass and the app was not changed to work around it.
- The test runs rewrite three tracked "latest" evidence files (evidence/browser-regression-latest.json, capture-latest.json,
  pathasetu-browser-latest.png). Their changes in the commit that adds this baseline are timestamps and run data only.
- No credentials were present (presence checked only; values never printed): GROQ_API_KEY, PATHASETU_MODEL_PROVIDER, GROQ_MODEL,
  PATHASETU_DEMO_ACCESS_CODE, PATHASETU_PROVIDER_DATA_CONTROLS_ACK were all NOT SET. Provider = mock.
