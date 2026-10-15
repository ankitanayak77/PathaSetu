# Pathasetu — quick runbook

## Local startup

```bash
npm ci
npm test
npm run check
npm start
```

Open `http://127.0.0.1:4173`. The normal mode is the deterministic mock. All content and Odia wording are marked `UNREVIEWED_DRAFT`; this is a prototype demonstration pack.

## The demo story and what to say

Use `PITCH_SCRIPTS.md` (start with section A0: the name, where the words go, shared phones and permission, each in one precise sentence; then the 7-minute pitch, 2-minute and 30-second versions, the live-demo narration and the fallback if the network or the phone fails) and keep `JURY_QA_BANK.md` open for the CTO round. The eight-step story is: unlock the demo, see why the next question was chosen, answer with a typed explanation, read the diagnosis and the decision trace, go offline and answer again, reconnect and watch the queue drain, show a failed re-check and the replan, then Bridge Practice and the provider status. Iteration 5 mapped each step to existing headless e2e/capture checks (`evidence/iteration5/final/REHEARSAL_MAPPING.md`); that is a headless mapping, not a rehearsal on a phone. Say out loud that the mock is a rule and not a model, that no live Groq call has been made, and that the content is an unreviewed draft.

## Using a tunnel or HTTPS host

Follow `HTTPS_DEMO_RUNBOOK.md` (exact commands, verified locally with a simulated tunnel; no tunnel or host was created). Summary:

- This server is a Node HTTP server and needs a persistent Node process. It is not a static site and not a serverless handler. Nothing has been deployed from this repository and no tunnel has been opened.
- **Never expose a plain `npm start`.** Set `PATHASETU_PUBLIC_DEMO=true` and a random `PATHASETU_DEMO_ACCESS_CODE` (startup refuses without a strong one). Session, pack and re-check then all require the code (header `x-pathasetu-demo-code`). The page asks for it in an overlay and keeps it in session storage only.
- **Draft demo in production mode:** `NODE_ENV=production` plus `PATHASETU_ALLOW_DRAFT_DEMO=true`. Without the flag a production server serves no unreviewed item, and `npm run preflight` fails that combination.
- **Host-rewriting proxy:** if re-checks fail with HTTP 403 `origin_not_allowed` while the page loads, the proxy changed the `Host` header. Prefer a proxy that preserves it; otherwise set `PATHASETU_ALLOWED_ORIGINS=https://your-demo-host.example` (an exact origin; no wildcard, path or default port).
- **Wrong guesses** are throttled per client (429 `too_many_attempts`); the correct code is never blocked by that.
- **Run `npm run preflight -- --expect-origin https://your-demo-host.example` first.** It must print `PREFLIGHT: PASSED`.
- **Never** put a provider key, an access code or a real learner's text in a URL, screenshot, recording or the results sheet. Never expose a model-backed route without the code and an access-controlled host. Keep the tunnel demo on the mock provider.
- Phone steps and the results template: `PHONE_TEST_PLAN.md`, `PHONE_TEST_RESULTS_TEMPLATE.csv`; event-day order and stop/go gates: `EVENT_DAY_CHECKLIST.md`.

## Optional Groq provider

Keep the default mock unless a real call is needed. If using Groq, configure `PATHASETU_MODEL_PROVIDER=groq`, `GROQ_API_KEY`, `GROQ_MODEL=openai/gpt-oss-20b` and `PATHASETU_DEMO_ACCESS_CODE` in the server process environment. Set `PATHASETU_PROVIDER_DATA_CONTROLS_ACK=true` only after you have reviewed the provider's current data controls (smoke and evaluate refuse without it). Review current data-retention controls first. Run `npm run smoke` with synthetic samples only. Do not expose the key to the browser, and do not interpret a successful smoke call as model accuracy evidence.

## Verifying the build

```bash
npm ci
npm test               # unit and static tests
npm run check          # syntax checks
npm run check:content  # pack <-> worksheet <-> evaluation files agree; nothing is marked reviewed
npm run preflight      # configuration and local routes (mock-only harness); no secrets printed, no provider call
CHROME_PATH=/path/to/chrome npm run capture   # server/API checks and one browser journey
CHROME_PATH=/path/to/chrome npm run e2e       # browser regression suite
CHROME_PATH=/path/to/chrome npm run a11y      # automated accessibility and mobile audit
npm run evaluate                              # deterministic baseline on 47 synthetic English cases
```

**Finding a browser (macOS, Linux, Windows).** The browser scripts use one shared finder (`scripts/lib/browser-path.mjs`). It tries `CHROME_PATH` first, then the standard install locations for your system, and it never installs or downloads anything. A Mac has no `/usr/bin/chromium`. On macOS check what exists and is allowed, then set the exact path:

```bash
for p in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "/Applications/Chromium.app/Contents/MacOS/Chromium" "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"; do  # prints only the ones that exist
  [ -x "$p" ] && printf 'Available browser: %s\n' "$p"
done
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"   # only if that file exists and your policy allows it
"$CHROME_PATH" --version
```

A wrong `CHROME_PATH` is reported as BLOCKED (it is not replaced by another browser). If no allowed browser exists, or the machine's policy blocks local pages, the browser checks stay BLOCKED: record that and the exact message; do not install a browser or bypass the policy without the team's permission. `capture`, `e2e` and `a11y` write the executable, how it was chosen and its version into their evidence files.

`CHROME_PATH` must point at a Chrome, Chromium or Edge binary on the machine running the browser tests. If your machine blocks local navigation, record the exact error and mark the browser checks BLOCKED rather than passed. Browser results do not replace the physical-phone protocol in `PHONE_TEST_PLAN.md`. `npm run evaluate -- --provider groq` and `npm run smoke` exit with code 2 (BLOCKED) unless Groq credentials are already in your local environment; nothing is requested or printed.

## Showing the retry behaviour

Re-checks that fail are retried with a growing delay (5 s, 10 s, 20 s, 40 s, 60 s) at most five times, then paused. The answer stays saved and queued; the card says the re-check is paused and offers **Retry now**. Say plainly that this is bounded retry for a stalled or failing provider, not a claim about model quality. The paused state has been shown in headless Chromium only.

## Bridge Practice in the demo

Offline-capable and local only: open a question, find the Bridge Practice card, choose a term pair, read the feedback, reveal the source mapping, and open the decision trace to show the recorded attempt. Every mapping is `UNREVIEWED_DRAFT`; say so, and do not describe the content as teacher-approved.
