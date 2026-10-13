Iteration 4 baseline, run 2026-10-13 on the extracted Iteration 3 archive (sha256 e3abdd99...10ed, matches the supplied value).
This is a SEPARATE current-environment record. It does not replace or overwrite the Iteration 3 report (evidence/iteration3/) or the
results the user obtained in their own managed environment, where capture's Chromium journey and `npm run e2e` were BLOCKED by
ERR_BLOCKED_BY_ADMINISTRATOR (environment policy, not a product failure, and not a pass).
In THIS environment headless Chromium 141 (/opt/pw-browsers, via CHROME_PATH=/tmp/chromium) was able to navigate to local URLs, so the
browser suites ran. Each line in exit-codes.txt records the exact command, start time, duration and exit code; outputs are in npm-*.txt.
No Groq credentials are set here. No phone or human review is involved.
Tree check: 'diff -rq' between two fresh extractions of the archive showed no differences; git status was clean (0 entries) before the run created evidence/iteration4.
