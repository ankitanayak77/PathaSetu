# Pathasetu — MVP workspace

Pathasetu is an offline-first, agentic science-learning prototype for an Odia-medium Class 10 learner. It aims to bridge everyday Odia, Odia school terminology and English scientific terms while helping a learner repair one concept at a time.

## Current status

Details, evidence and the claim ledger are in `docs/BUILD_STATUS.md`. Summary of the 12 Oct 2026 verification (headless Chromium 153, Node 22, not a phone):

- **Implemented and browser-tested:** mobile-first shell, Electricity demo pack, option-linked mock, diagnosis validator, deterministic planner, IndexedDB state and per-question drafts, offline queue with reachability probing and bounded re-check requests, feedback-first flow with explicit continue, read-only second tab, service-worker offline shell and update notice, decision trace, and **Bridge Practice** (local matching exercise built only from the pack's bridge fields).
- **Verified:** `npm test` 66/66, `npm run capture` 19 passed / 0 failed, `npm run e2e` 53 passed / 0 failed (14 scenarios), `npm run check` exit 0.
- **Implemented but never run live:** the optional Groq adapter (tested only against local fake responses). The default is the labelled mock.
- **Not done or not validated:** physical-phone tests, teacher review of content and Odia wording, language understanding by any model, learning impact, deployment hardening.

All items and Odia text are `UNREVIEWED_DRAFT`. The mock does not interpret free text and never confirms mastery. Do not use this pack with real learners before a qualified reviewer approves it.

## Requirements

- Node.js 20 or later; no npm dependencies.
- A Chrome or Chromium binary for `npm run capture`, `npm run e2e` and `scripts/capture-screens.mjs`, supplied through `CHROME_PATH`.

## Run

```bash
npm ci
npm test
npm run check
npm start
```

The default server binds to `127.0.0.1:4173` and uses the mock. Draft demonstration content is deliberately exposed in development mode, with prominent draft labels. Production mode excludes unreviewed content unless `PATHASETU_ALLOW_DRAFT_DEMO=true` is explicitly configured for a protected demonstration environment.

Open `http://127.0.0.1:4173`. The app saves the pack and learning state locally on first online load. For an actual offline test, open it online once, allow the service worker to install, then use the browser/DevTools to emulate network interruption. `/api/*` responses are deliberately not cached by the service worker.

## Commands and evidence

| Command | Purpose |
| --- | --- |
| `npm test` | Unit and static tests (core, validator, content gates, queue, Groq fake server, API guards, service-worker and UI wiring, Bridge Practice) |
| `npm run check` | Syntax checks |
| `CHROME_PATH=... npm run capture` | HTTP/API guard checks and one browser journey; writes `evidence/capture-latest.json` |
| `CHROME_PATH=... npm run e2e` | Browser regression suite (offline reload, cold start, double submit, focus, stale content, two tabs, service-worker update, provider failures, draft reload, Bridge Practice); writes `evidence/browser-regression-latest.json` |
| `CHROME_PATH=... node scripts/capture-screens.mjs` | Phone-sized screenshots into `evidence/iteration2/screenshots/` |
| `npm run smoke` | Live provider smoke test with 13 synthetic cases; needs an explicit Groq key; not run |

Saved results: `evidence/iteration2/baseline/` (the received code) and `evidence/iteration2/final/` (this iteration), with exit codes. Browser results do not replace the physical-phone protocol in `docs/PHONE_TEST_PLAN.md`.

## Security and privacy notes

- The default provider is mock-only and requires no API key. Groq is optional and must be explicitly configured.
- Server API requests are same-origin checked when an Origin header is present and limited to 16 KB JSON payloads. `/api/session` and `/api/recheck` also have configurable, in-memory, per-client-IP fixed-window limits (`PATHASETU_SESSION_RATE_LIMIT`, `PATHASETU_RECHECK_RATE_LIMIT`, `PATHASETU_RATE_WINDOW_MS`). A 429 response includes `Retry-After`.
- The server does not accept learner IDs or persist server-side learner state.
- When Groq is enabled, `PATHASETU_DEMO_ACCESS_CODE` must be at least 16 characters. The model-backed route must not be exposed publicly without access protection, rate/quota controls, privacy review and provider permission/retention review. The limiter is process-local and uses the socket peer IP; clients may share a quota behind a proxy/tunnel, and limits reset on restart. It is not a production API gateway; use a private tunnel or access-controlled host for the demo.
- In production, draft items are hidden unless `PATHASETU_ALLOW_DRAFT_DEMO=true` is explicitly configured; a production draft demo also requires a random `PATHASETU_DEMO_ACCESS_CODE` of at least 16 characters. Never enable that flag for real learners.

## Provenance

This workspace was generated with AI assistance: an earlier session produced the archive that the first commit records, and iteration 2 (12 Oct 2026, Claude) added the browser suite, the fixes in `docs/BUILD_STATUS.md` and Bridge Practice. The work predates the published competition build window and relied on a verbal organizer permission that is not confirmed in writing. Record the real dates, tools, collaborators and permissions for any submission. Do not backdate commits or misstate when or how code was written.

## Optional live Groq check (synthetic cases only)

Do not run a live provider until you have reviewed the provider's current retention/data-control settings and accepted the cost/rate-limit implications. Never use real children's explanations in the smoke test. Enable Groq Zero Data Retention in the account console before a live call if your account supports it.

```bash
export PATHASETU_MODEL_PROVIDER=groq
export GROQ_MODEL=openai/gpt-oss-20b
export GROQ_API_KEY='set-this-locally-never-in-chat'
export PATHASETU_DEMO_ACCESS_CODE="$(node -e "console.log(require('node:crypto').randomBytes(24).toString('hex'))")"
npm run smoke
```

The 13 smoke cases test the live endpoint and response shape only. They do not evaluate correctness, language proficiency or educational effect. To return to the safe default, unset the Groq key/provider variables or start a new shell with `PATHASETU_MODEL_PROVIDER=mock`.
