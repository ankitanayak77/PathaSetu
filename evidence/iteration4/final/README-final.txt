Iteration 4 final verification record (13 Oct 2026, this sandbox: Node v22.22.0, npm 10.9.4, headless Chromium 141.0.7390.37).

Code under test: commit b3e70ea (HEAD when the run started). The commit that follows adds this evidence directory and updates the
documents (README, BUILD_STATUS, ARCHITECTURE, DEMO_RUNBOOK, EVALUATION); it changes no source, script, test or client file.
exit-codes.txt has the exact command, start time, duration and exit code of every run; each output is in npm-*.txt.
environment.txt records only whether credential variables were set, never their values. "git status entries before the run: 2" are
the two evidence files (environment.txt, exit-codes.txt) that the run script had just created; the tree was otherwise clean.

Expected non-zero exits (they prove the failure paths, they are not defects):
  npm-preflight-unsafe-no-code            exit 1  (PATHASETU_PUBLIC_DEMO=true without a code)
  npm-preflight-unsafe-tunnel-without-public-demo  exit 1  (HTTPS tunnel origin without public demo mode)
BLOCKED (exit 2, credentials not configured, no live request made): npm-smoke, npm-evaluate-groq.

The access code used for npm-preflight-public-demo was generated at run time, never written to a file, and a search of every file in
this directory for it found nothing. The same holds for runbook-dry-run.txt.

SEPARATE RECORD: in the team's own managed environment, capture's Chromium journey and `npm run e2e` were BLOCKED
(ERR_BLOCKED_BY_ADMINISTRATOR). That is an environment result, not a product failure and not a pass; nothing here replaces it.
Not tested by any of this: real phones, screen readers, a real HTTPS tunnel, live Groq, human content review.
