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

This server is a Node HTTP server, not a static-only site and not a serverless handler. Run it on a trusted host or behind an HTTPS tunnel/reverse proxy that forwards to `127.0.0.1:4173`. The tunnel/host should have access protection. Do not publish a live model-backed route without the demo access code and an access-controlled host. This MVP does not have production-grade per-user quotas or rate limiting.

If showing draft content from a production-mode deployment, set both `PATHASETU_ALLOW_DRAFT_DEMO=true` and a random `PATHASETU_DEMO_ACCESS_CODE` of at least 16 characters. The access code is for the demo route, not the provider key. The code is stored only in the current browser tab's session storage.

## Optional Groq provider

Keep the default mock unless a real call is needed. If using Groq, configure `PATHASETU_MODEL_PROVIDER=groq`, `GROQ_API_KEY`, `GROQ_MODEL=openai/gpt-oss-20b` and `PATHASETU_DEMO_ACCESS_CODE` in the server process environment. Review current data-retention controls first. Run `npm run smoke` with synthetic samples only. Do not expose the key to the browser, and do not interpret a successful smoke call as model accuracy evidence.

## Known test limitation in this workspace

`npm test` passes and `npm run check` passes here. `npm run capture` passes its HTTP/API checks, but this managed environment blocks the Chromium local-URL navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. Run `npm run capture` from the team's development machine, use its installed Chromium/Chrome by setting `CHROME_PATH` if needed, and save the generated evidence JSON. This is not a reason to skip the phone protocol in `PHONE_TEST_PLAN.md`.
