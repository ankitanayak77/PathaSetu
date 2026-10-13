# Pathasetu — MVP workspace

Pathasetu is an offline-first, agentic science-learning prototype for an Odia-medium Class 10 learner. It aims to bridge everyday Odia, Odia school terminology and English scientific terms while helping a learner repair one concept at a time.

## Current status

**Iteration 5 (13 Oct 2026): field validation and demo lock.** No source file changed. The Iteration 4 package was re-run in the build sandbox (`evidence/iteration5/baseline/`: `npm test` 182/182, `capture` 19/19, `e2e` 95/95, `a11y` 462 checks with 0 failed, `check`, `check:content`, `preflight` exit 0; headless Chromium only). Every external gate stayed **BLOCKED or NOT TESTED** because it needs something this sandbox does not have: a real HTTPS tunnel, the four phones, a qualified Odia-medium science teacher, and Groq credentials (`evidence/iteration5/gates/GATE_STATUS.md`). New this iteration are explanation and defence documents, not features: `docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md`, `docs/SYSTEM_ARCHITECTURE.md` (the single architecture diagram), `docs/NAVIGATION_AND_WORKFLOW.md`, `docs/JURY_QA_BANK.md` (150 questions), `docs/PITCH_SCRIPTS.md` and `docs/CLAIM_EVIDENCE_MATRIX.csv`, plus reviewer-guide additions and tests that keep those documents honest (`tests/iteration5-docs.test.js`, `tests/iteration5-evidence.test.js`). The unit total after those tests is 198 (`evidence/iteration5/final/`).

What the documents say plainly, so it is not a surprise: the diagnosis step in the demo is a rule that does not read free text; no live model request has ever been made; the Odia wording and all eight questions are unreviewed drafts; no phone has run the app; the code was built on 12-13 Oct 2026 with AI assistance, before the 14-15 Oct event window, and rule 4.1 of the event rules needs written confirmation from the organisers.

Earlier iterations, unchanged:

Details, evidence and the claim ledger are in `docs/BUILD_STATUS.md`. Summary of the 13 Oct 2026 iteration 4 verification (headless Chromium 141, Node 22, not a phone):

- **Implemented and browser-tested:** mobile-first shell, Electricity demo pack, option-linked mock, diagnosis validator, deterministic planner, IndexedDB state and per-question drafts, offline queue with reachability probing, bounded retries (5 attempts, backoff, paused state, Retry now), honest storage status and corrupt-state repair, trace export without typed text or secrets, feedback-first flow, read-only second tab, service-worker offline shell and update notice, decision trace, and Bridge Practice (local matching exercise built only from the pack's bridge fields).
- **New in iteration 4 (unit-tested and browser-tested):** a fail-closed **public demo mode** (`PATHASETU_PUBLIC_DEMO=true`: the server refuses to start without a strong random `PATHASETU_DEMO_ACCESS_CODE`; session, pack and re-check all need it), a **bounded failed-attempt throttle** that never locks out the correct code, stricter **exact-origin validation** (wildcards, paths and credentials rejected), a **`npm run preflight`** command, and the private HTTPS demo runbook and event-day checklist.
- **Verified:** `npm test` 182/182, `npm run capture` 19 passed / 0 failed, `npm run e2e` 95 passed / 0 failed, `npm run a11y` 462 automated checks / 0 failed, `npm run check`, `npm run check:content` and `npm run preflight` exit 0. Records: `evidence/iteration4/final/`. In the team's own managed environment the capture browser journey and `npm run e2e` were **BLOCKED** (`ERR_BLOCKED_BY_ADMINISTRATOR`); that is an environment result, not a product failure and not a pass, and it is kept separate from this sandbox's results (`evidence/iteration4/baseline/README-baseline.txt`).
- **Evaluation tooling:** 47 team-authored English cases; deterministic baseline reported (compatibility apart from agreement). Live Groq smoke and evaluation are **BLOCKED — credentials not configured** and have not run.
- **Not done or not validated:** physical-phone tests (S23, S25, S25 FE, iPhone 16: **NOT TESTED**), screen-reader tests, teacher review of content and Odia wording (**NOT REVIEWED**), language understanding by any model, learning impact, deployment and any real HTTPS tunnel (nothing is deployed; no tunnel was opened).

All items and Odia text are `UNREVIEWED_DRAFT`. The mock does not interpret free text and never confirms mastery. Do not use this pack with real learners before a qualified reviewer approves it.

## Requirements

- Node.js 20 or later; no npm dependencies.
- A Chrome or Chromium binary for `npm run capture`, `npm run e2e`, `npm run a11y` and `scripts/capture-screens.mjs`, supplied through `CHROME_PATH`.

## Run

```bash
npm ci
npm test
npm run check
npm start
```

The default server binds to `127.0.0.1:4173` and uses the mock. Draft demonstration content is deliberately exposed in development mode, with prominent draft labels. Production mode excludes unreviewed content unless `PATHASETU_ALLOW_DRAFT_DEMO=true` is explicitly configured for a protected demonstration environment.

Before showing the demo to anyone else, run `npm run preflight`. It checks configuration and the local routes through a mock-only harness, prints no secret, makes no provider call, and exits nonzero on unsafe or demo-blocking settings (for example a tunnel origin without `PATHASETU_PUBLIC_DEMO=true`, a weak access code, or a server that would bind to all interfaces).

**Private HTTPS / tunnel demo:** never point a tunnel at a plain `npm start`. Set `PATHASETU_PUBLIC_DEMO=true` with a random `PATHASETU_DEMO_ACCESS_CODE` (startup refuses otherwise) and follow `docs/HTTPS_DEMO_RUNBOOK.md`. This is lightweight demo protection, **not production-grade authentication**, and the server needs a persistent Node process: it does not run as a serverless function.

Open `http://127.0.0.1:4173`. The app saves the pack and learning state locally on first online load. For an actual offline test, open it online once, allow the service worker to install, then use the browser/DevTools to emulate network interruption. `/api/*` responses are deliberately not cached by the service worker.

## Commands and evidence

| Command | Purpose |
| --- | --- |
| `npm test` | Unit and static tests (core, validator, content gates, queue, retry policy, storage resilience, trace export, evaluation tooling, content consistency, accessibility-audit logic, phone matrix, access and origin policy, Groq fake server, API guards, service-worker and UI wiring, Bridge Practice) |
| `npm run check` | Syntax checks |
| `npm run preflight` | Pre-demo configuration and local-route check (`-- --expect-origin https://your-host` also checks the planned HTTPS origin); no secrets printed, no provider call |
| `npm run check:content` | Pack, review worksheet and evaluation files agree; every item must still be a draft until a human reviewer approves it |
| `CHROME_PATH=... npm run capture` | HTTP/API guard checks and one browser journey; writes `evidence/capture-latest.json` |
| `CHROME_PATH=... npm run e2e` | Browser regression suite (offline reload, cold start, double submit, focus, stale content, two tabs, service-worker update, provider failures, draft reload, Bridge Practice, protected demo, bounded retries, storage failure and repair, trace export); writes `evidence/browser-regression-latest.json` |
| `CHROME_PATH=... npm run a11y` | Automated accessibility and mobile audit across five viewports and seven states; writes `evidence/iteration3/accessibility/` |
| `npm run evaluate` | Deterministic baseline on the 47 synthetic English cases; `-- --provider groq` is BLOCKED without local credentials |
| `npm run generate:eval-template` / `npm run generate:phone-matrix` | Regenerate the reviewer evaluation template and the blank phone results template |
| `CHROME_PATH=... node scripts/capture-screens.mjs` | Phone-sized screenshots into `evidence/iteration2/screenshots/` |
| `npm run smoke` | Live provider smoke test with 13 synthetic cases; needs an explicit Groq key; BLOCKED without it; not run |

Saved results: `evidence/iteration2/`, `evidence/iteration3/baseline/` and `final/`, and for this iteration `evidence/iteration4/baseline/` (the Iteration 3 archive re-run) and `evidence/iteration4/final/`, each with exit codes. Browser results do not replace the physical-phone protocol in `docs/PHONE_TEST_PLAN.md`.

Other documents: `docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md` (start here), `docs/SYSTEM_ARCHITECTURE.md`, `docs/NAVIGATION_AND_WORKFLOW.md`, `docs/JURY_QA_BANK.md`, `docs/PITCH_SCRIPTS.md`, `docs/CLAIM_EVIDENCE_MATRIX.csv`, `docs/ARCHITECTURE.md` (enforced boundaries and test layers), `docs/DEMO_RUNBOOK.md`, `docs/EVALUATION.md`, `docs/REVIEWER_GUIDE.md`, `docs/CONTENT_REVIEW_RUBRIC.md`, `docs/PHONE_TEST_PLAN.md`, `docs/HTTPS_DEMO_RUNBOOK.md`, `docs/EVENT_DAY_CHECKLIST.md`.

## Security and privacy notes

- The default provider is mock-only and requires no API key. Groq is optional and must be explicitly configured.
- Server API requests are same-origin checked when an Origin header is present and limited to 16 KB JSON payloads. Exact extra origins can be listed in `PATHASETU_ALLOWED_ORIGINS` for a Host-rewriting tunnel; they are validated at startup (https, or http for localhost; wildcards, paths, credentials, default ports and upper-case hosts are refused) and never replace the access code.
- `PATHASETU_PUBLIC_DEMO=true` is fail-closed and independent of provider and `NODE_ENV`: startup refuses unless `PATHASETU_DEMO_ACCESS_CODE` is at least 16 characters with no whitespace, not repetitive or sequential and not a placeholder word (the message names the problem category, never the value); any value other than exactly `true` or `false` stops startup. Then `/api/session`, `/api/pack` and `/api/recheck` all need the code. `/api/health` stays open and reports only provider, `accessRequired` and `publicDemo`.
- Missing or wrong codes count against a per-client failure budget (`PATHASETU_FAILED_ATTEMPT_LIMIT`, default 20 per window) shared by the three routes; over budget the answer is `429 too_many_attempts` with `Retry-After`. It is a fixed window that expires on its own, and a request with the correct code is never refused by it, so a shared public IP cannot lock the right code out. Authorised requests use the ordinary per-route limits (`PATHASETU_SESSION_RATE_LIMIT`, `PATHASETU_RECHECK_RATE_LIMIT`, `PATHASETU_RATE_WINDOW_MS`). The counters are in memory, keyed by socket address (every visitor behind one tunnel connection shares a bucket) and reset on restart. The code is never logged and lives only in the browser tab's session storage.
- The server does not accept learner IDs or persist server-side learner state.
- A Groq endpoint, a public demo and a production draft demo all require the strong code. Do not expose a model-backed route without access protection, rate/quota controls, privacy review and provider permission/retention review. Live Groq runs (`npm run smoke`, `npm run evaluate -- --provider groq`) also require `PATHASETU_PROVIDER_DATA_CONTROLS_ACK=true`, which only records that you reviewed the provider's data controls; they send synthetic text only. This is not a production API gateway: use a private tunnel or access-controlled host, mock mode, and the runbook.
- In production, draft items are hidden unless `PATHASETU_ALLOW_DRAFT_DEMO=true` is explicitly configured, which also requires the strong code. Whenever a code is set and drafts would be served, `/api/pack` as well as `/api/recheck` require it. Never enable that flag for real learners.
- The trace export replaces typed explanations with a length marker and redacts access codes, API-key patterns and bearer tokens; read it before sharing anyway.

## Provenance

This workspace was generated with AI assistance: an earlier session produced the archive that the first commit records, iteration 2 (12 Oct 2026, Claude) added the browser suite, fixes and Bridge Practice, and iteration 3 (13 Oct 2026, Claude) added access control for draft content, bounded retries, storage resilience, evaluation and review tooling, and accessibility work, and iteration 4 (13 Oct 2026, Claude) added the fail-closed public demo mode, the failed-attempt throttle, preflight, the HTTPS runbook and the real-world validation handoff, and iteration 5 (13 Oct 2026, Claude) was a documentation and validation iteration: it changed no source or browser code, added the plain-language guide, architecture, navigation, jury Q&A, pitch scripts, claim-evidence matrix and a few tests that pin documented behaviour, and recorded the tunnel, phone, teacher and live Groq gates as blocked. Iteration 3 was rebuilt from the session record after a sandbox reset (see `docs/BUILD_STATUS.md`). The work predates the published competition build window and relied on a verbal organizer permission that is not confirmed in writing. Record the real dates, tools, collaborators and permissions for any submission. Do not backdate commits or misstate when or how code was written.

## Optional live Groq check (synthetic cases only)

Do not run a live provider until you have reviewed the provider's current retention/data-control settings and accepted the cost/rate-limit implications. Never use real children's explanations in the smoke test. Enable Groq Zero Data Retention in the account console before a live call if your account supports it.

```bash
export PATHASETU_MODEL_PROVIDER=groq
export GROQ_MODEL=openai/gpt-oss-20b
export GROQ_API_KEY='set-this-locally-never-in-chat'
export PATHASETU_PROVIDER_DATA_CONTROLS_ACK=true   # only after you have reviewed the provider's data controls
export PATHASETU_DEMO_ACCESS_CODE="$(node -e "console.log(require('node:crypto').randomBytes(24).toString('hex'))")"
npm run preflight   # presence-only checks; no provider call
npm run smoke
```

The 13 smoke cases test the live endpoint and response shape only. They do not evaluate correctness, language proficiency or educational effect. To return to the safe default, unset the Groq key/provider variables or start a new shell with `PATHASETU_MODEL_PROVIDER=mock`.
