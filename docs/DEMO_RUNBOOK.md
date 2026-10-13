# Pathasetu — quick runbook

## Local startup

```bash
npm ci
npm test
npm run check
npm start
```

Open `http://127.0.0.1:4173`. The normal mode is the deterministic mock. All content and Odia wording are marked `UNREVIEWED_DRAFT`; this is a prototype demonstration pack.

## Using a tunnel or HTTPS host

This server is a Node HTTP server, not a static-only site and not a serverless handler. Run it on a trusted host or behind an HTTPS tunnel/reverse proxy that forwards to `127.0.0.1:4173`. Nothing has been deployed from this repository and no tunnel has been tested here; verify the tool's current instructions. A quick tunnel's URL is reachable by anyone who has it, so protect the demo with the app's own access code and, if available, the tunnel's access policy. This MVP does not have production-grade per-user quotas or rate limiting.

- **Draft content needs the access code.** Whenever `PATHASETU_DEMO_ACCESS_CODE` is set and the server would serve unreviewed items, both `/api/pack` and `/api/recheck` require it (header `x-pathasetu-demo-code`). The page asks for it in an overlay and keeps it only in the current tab's session storage; closing the tab means entering it again.
- **Production-mode draft demo:** set `NODE_ENV=production`, `PATHASETU_ALLOW_DRAFT_DEMO=true` and a random `PATHASETU_DEMO_ACCESS_CODE` of at least 16 characters. Without the allow flag a production server serves no unreviewed item at all.
- **Host-rewriting proxy:** if re-checks fail with HTTP 403 `origin_not_allowed` while the page loads, the proxy changed the `Host` header. Preferably preserve it; otherwise set `PATHASETU_ALLOWED_ORIGINS=https://your-demo-host.example` (exact origins only).
- **Never** put a provider key, an access code or a real learner's text in a URL, screenshot, recording or the results sheet. Never expose a model-backed route without the code and an access-controlled host.
- Phone steps, per-device HTTPS notes (iPhone Safari needs HTTPS) and the results template: `PHONE_TEST_PLAN.md`, `PHONE_TEST_RESULTS_TEMPLATE.csv`.

## Optional Groq provider

Keep the default mock unless a real call is needed. If using Groq, configure `PATHASETU_MODEL_PROVIDER=groq`, `GROQ_API_KEY`, `GROQ_MODEL=openai/gpt-oss-20b` and `PATHASETU_DEMO_ACCESS_CODE` in the server process environment. Review current data-retention controls first. Run `npm run smoke` with synthetic samples only. Do not expose the key to the browser, and do not interpret a successful smoke call as model accuracy evidence.

## Verifying the build

```bash
npm ci
npm test               # unit and static tests
npm run check          # syntax checks
npm run check:content  # pack <-> worksheet <-> evaluation files agree; nothing is marked reviewed
CHROME_PATH=/path/to/chrome npm run capture   # server/API checks and one browser journey
CHROME_PATH=/path/to/chrome npm run e2e       # browser regression suite
CHROME_PATH=/path/to/chrome npm run a11y      # automated accessibility and mobile audit
npm run evaluate                              # deterministic baseline on 47 synthetic English cases
```

`CHROME_PATH` must point at a Chrome or Chromium binary on the machine running the browser tests. If your machine blocks local navigation, record the exact error and mark the browser checks BLOCKED rather than passed. Browser results do not replace the physical-phone protocol in `PHONE_TEST_PLAN.md`. `npm run evaluate -- --provider groq` and `npm run smoke` exit with code 2 (BLOCKED) unless Groq credentials are already in your local environment; nothing is requested or printed.

## Showing the retry behaviour

Re-checks that fail are retried with a growing delay (5 s, 10 s, 20 s, 40 s, 60 s) at most five times, then paused. The answer stays saved and queued; the card says the re-check is paused and offers **Retry now**. Say plainly that this is bounded retry for a stalled or failing provider, not a claim about model quality. The paused state has been shown in headless Chromium only.

## Bridge Practice in the demo

Offline-capable and local only: open a question, find the Bridge Practice card, choose a term pair, read the feedback, reveal the source mapping, and open the decision trace to show the recorded attempt. Every mapping is `UNREVIEWED_DRAFT`; say so, and do not describe the content as teacher-approved.
