Pathasetu — Iteration 7 baseline (written before any Iteration 7 edit)
======================================================================

THREE ENVIRONMENTS ARE KEPT SEPARATE. None of the results below is copied from another environment.

(1) THE BUILD SANDBOX THAT PRODUCED THIS FILE (this folder's *.txt, *.json, accessibility/)
    Starting point : the received Iteration 6 repository, HEAD beb9596, 23 commits, tree 69a86803fa007a62b35967562c2647a78fad1500.
    Iteration 6 ZIP sha256  : 1147807d06f546eb5e8d0bc60904101a0ae42f737c8abb28a40ade4b5ddeb735  (matches SHA256SUMS.txt)
    Iteration 6 patch sha256: 82a32c406183b81e3c4a270926ddee3a579f5853adb2cf0a54974250a099a847  (matches SHA256SUMS.txt)
    Node v22.22.0, npm 10.9.4, Linux 6.18.44; browser Chromium 141.0.7390.37 via CHROME_PATH=/tmp/chromium.
    git status before any command: only the evidence/iteration7/ folder being written (nothing tracked was modified;
    the tracked evidence/*-latest.* files are rewritten by capture/e2e exactly as in earlier iterations).
    Exit codes are in exit-codes.txt (every command has exit=0). Browser steps here DID run, because a browser exists here.
    capture 19 pass / 0 fail; e2e 100/100; a11y 33 states, 462 checks, 0 failed (see npm-*.txt).
    GROQ credentials were not set, so smoke and the live Groq evaluation were not run (BLOCKED, as before).
    This sandbox is NOT the team's Mac and NOT a phone.

(2) THE TEAM'S MAC TERMINAL LOG (uploaded by the team; we did not run it and cannot re-verify it)
    Node 26.8.2. npm ci: up to date, 0 vulnerabilities. npm test: 207 tests, 207 pass, 0 fail.
    npm run check: no error printed. check:content: OK, 8 items, all UNREVIEWED_DRAFT, problems 0.
    preflight: PASSED (15 pass, 0 warn, 0 fail).
    capture: 10 passed, 1 failed, 0 blocked — the failure is "ENOENT: no such file or directory, access '/usr/bin/chromium'".
    e2e: "BLOCKED: no Chrome/Chromium binary. Set CHROME_PATH."
    a11y: "BLOCKED: no usable browser: ENOENT ... '/usr/bin/chromium'".
    evaluate (mock): valid 47/47, agreement 34/47, false-positive misconceptions on correct reasoning 0/8, proper abstention 2/12.
    smoke and the Groq evaluation: BLOCKED (no credentials/settings), as designed.
    Not in the log: the archive SHA-256, git status/HEAD, the macOS version, and whether Google Chrome is installed. These are UNKNOWN.
    The Mac log must not be read as "browser tests passed" — they did not run there.

(3) THE RECEIVED PACKAGE
    Is the Iteration 6 ZIP above. Its recorded sandbox results (207 unit, 19 capture, 100 e2e, 462 a11y) belong to environment (1)
    of Iteration 6, not to the Mac.

Why the Mac failed: the browser scripts default to the Linux path /usr/bin/chromium unless CHROME_PATH names an existing
executable. macOS has no /usr/bin/chromium. This is a path/tooling gap, not a product defect.
What can be done without bypassing any administrator policy: if Google Chrome is already installed, run
  ls "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
and only if that file exists, set CHROME_PATH to it for that terminal session. If it does not exist or policy blocks it,
leave the browser steps labelled BLOCKED. Nothing needs to be installed or unblocked for the mock demo to run.
