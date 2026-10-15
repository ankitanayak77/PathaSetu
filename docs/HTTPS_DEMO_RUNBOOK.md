# Pathasetu — private HTTPS / tunnel demo runbook

Purpose: show the demo on real phones (iPhone Safari needs HTTPS) without leaving an open endpoint on the internet.

**What this is not.** The access code is lightweight demo protection for a private, short-lived tunnel. It is **not** production-grade authentication: one shared code, in-memory throttling that resets on restart, no user accounts, no audit log. Nothing in this repository has been deployed, no tunnel or host account was created, and no public endpoint was opened while writing this document. Every command below that runs on your own computer was executed locally against this build (see `evidence/iteration4/final/runbook-dry-run.txt`); the tunnel/host step itself is yours and has **not** been run.

**Iteration 5 gate status (13 Oct 2026).** The real tunnel step is still **BLOCKED / NOT TESTED**: the build sandbox has no tunnel tool, account or outbound route to one, so nothing here was run against a real HTTPS origin and no iPhone Safari result exists. Only the local preflight with a placeholder origin was re-run (`evidence/iteration5/gates/`). Iteration 6 (13 Oct 2026) re-checked this: still no tunnel tool or account, so the gate remains **BLOCKED / NOT TESTED** and the simulated dry run is not a deployment test. Record real results in `PHONE_TEST_RESULTS_TEMPLATE.csv`; do not treat this runbook as validated until you have.

**Hosting requirement.** The server is one long-running Node process (`src/server/server.js`, Node 20+). It keeps rate-limit counters in memory, reads the static app from disk and serves `/api/*` from the same process. It therefore needs a host that runs an ordinary persistent Node process, or a tunnel/reverse proxy in front of one on your own computer. It does **not** work as a serverless function, an edge worker or a static-only site (no process to hold the counters, no `/api/*`). Do not pick a platform that only offers those.

**Defaults that keep this safe.** Mock provider (no model calls), loopback bind (`127.0.0.1`), fail-closed public mode, an exact-origin allow-list, and no model-backed route reachable without the code. Never publish a model-backed proxy without the code.

---

## 1. Local mock-only smoke path (no code, no tunnel, no network)

```bash
npm ci
npm run preflight              # expect: PREFLIGHT: PASSED
npm start                      # listens on http://127.0.0.1:4173, provider=mock publicDemo=false
```

In a second terminal:

```bash
curl -s http://127.0.0.1:4173/api/health
# {"ok":true,"provider":"mock","model":null,"accessRequired":false,"publicDemo":false,"time":"..."}
```

Open `http://127.0.0.1:4173` in a browser. Stop the server with `Ctrl+C`. This path is only for your own computer: with no code set, anyone who can reach the port can read the draft pack and call the re-check route. **Never point a tunnel at a server started this way.**

## 2. Generate the access code locally

```bash
export PATHASETU_DEMO_ACCESS_CODE="$(node -e "console.log(require('node:crypto').randomBytes(24).toString('base64url'))")"
```

- 24 random bytes give a 32-character code. The server accepts 16 or more characters, no whitespace, not repetitive, not a sequence, not a placeholder word, and with enough distinct characters; it refuses to start otherwise and never prints the value it rejected.
- Do not `echo` it, paste it into chat, a ticket, an issue, a screenshot, a recording or the results sheet, and do not put it in a URL. Keep it in a password manager and share it with testers through a private channel.
- If you use a `.env` file, keep it untracked (`.env` is in `.gitignore`); this project does not load `.env` by itself, so export the variables in the shell that starts the server.

## 3. Configure the server for a tunnel demo

```bash
export NODE_ENV=production
export PATHASETU_PUBLIC_DEMO=true            # exactly "true" or "false"; anything else stops startup
export PATHASETU_ALLOW_DRAFT_DEMO=true       # explicit opt-in: you are showing UNREVIEWED_DRAFT content
export PATHASETU_ALLOWED_ORIGINS=https://YOUR-TUNNEL-HOST   # see section 4; leave unset only if the tunnel preserves Host
unset GROQ_API_KEY                           # tunnel demos stay on the mock provider
export PATHASETU_MODEL_PROVIDER=mock
```

What `PATHASETU_PUBLIC_DEMO=true` does: startup refuses without a strong `PATHASETU_DEMO_ACCESS_CODE` regardless of provider or `NODE_ENV`; `/api/session`, `/api/pack` and `/api/recheck` all require the code (header `x-pathasetu-demo-code`); `/api/health` stays open on purpose so the page can see whether the server is reachable, and reports only `provider`, `accessRequired` and `publicDemo`.

Without `PATHASETU_ALLOW_DRAFT_DEMO=true`, a production server serves no unreviewed item, so the learner screen is empty until content is reviewed and published. Preflight fails that combination so you notice before the event.

Failed attempts: a missing or wrong code counts against a per-client budget (`PATHASETU_FAILED_ATTEMPT_LIMIT`, default 20 per `PATHASETU_RATE_WINDOW_MS`, default 60 s), shared across the three routes. Over the budget the answer is `429 {"error":"too_many_attempts"}` with `Retry-After`. The window expires by itself and a request with the **correct** code is never refused by it, so one person guessing from a shared public IP cannot lock the team out. Authorised requests use the ordinary per-route limits. Because clients are keyed by socket address, a tunnel that connects from one local address puts every visitor in the same bucket: that is what makes the correct-code exception matter.

## 4. Exact `PATHASETU_ALLOWED_ORIGINS` behaviour (read this if a phone gets HTTP 403)

For every `/api/*` request that carries an `Origin` header, the server allows it only if the origin **equals the `Host` the server saw**, or is **listed** in `PATHASETU_ALLOWED_ORIGINS`.

- A tunnel or reverse proxy that **preserves** the `Host` header needs no setting. Prefer this.
- A tunnel that **rewrites** `Host` (for example to `127.0.0.1:4173`) makes every browser POST look cross-origin, so `/api/recheck` returns `403 origin_not_allowed` while the page itself still loads. Fix it by listing the exact external origin, e.g. `https://demo-team.example.net`.
- Entries are comma-separated **exact origins**: `https` (or `http` only for `localhost` / `127.0.0.1` / `[::1]`), lower-case host, optional non-default port, nothing else. Wildcards (`https://*.example.net`), paths or trailing slashes, query, fragment, credentials, default ports (`:443`) and plain-`http` hosts all stop startup with a `PATHASETU_ALLOWED_ORIGINS` message; credentials in a refused entry are masked in that message.
- A listed origin is **not** a login. The code is still required on every protected route.
- `https://demo.example.net` and `https://demo.example.net:8443` are different origins; list the one the phone's address bar shows.

## 5. Preflight (no live request, no secrets printed)

```bash
npm run preflight -- --expect-origin https://YOUR-TUNNEL-HOST
```

Expect `PREFLIGHT: PASSED`. It checks the Node version, required files, the pack load and consistency check (and states that the content is **not reviewed**), the provider label, code strength and public-demo settings, bind address, origin syntax and that your planned HTTPS origin is in the list, then starts a **mock-only** loopback harness server and verifies `/api/health`, `/api/session`, `/api/pack`, `/api/recheck`, wrong-code and no-code refusals, that served item statuses match the pack file (no promotion), and the Host-rewriting route. A `FAIL` means do not start the tunnel. Preflight does not call any provider and does not check your tunnel.

## 6. Start the server, then the tunnel

```bash
npm start      # leave HOST unset: the server binds 127.0.0.1 only
```

The start-up line must read `provider=mock publicDemo=true`. Then start your HTTPS tunnel or reverse proxy so that it forwards to `http://127.0.0.1:4173`. Provider-agnostic requirements for whatever you use:

1. It terminates HTTPS with a certificate the phones trust (iPhone Safari will not give you a service worker, installability or a trustworthy offline test without it).
2. It forwards to the loopback port only; the Node server is never bound to `0.0.0.0` for this.
3. It does not cache `/api/*` and does not add its own caching to `index.html` or `sw.js`.
4. It preserves `Host`; if it cannot, set `PATHASETU_ALLOWED_ORIGINS` (section 4) and restart.
5. If it offers its own access control (an access policy, IP allow-list or password), switch that on as well. It is an extra layer, not a replacement for the code.
6. Record which tool you used and its version in the phone results sheet. Verify the tool's current instructions yourself; this repository does not ship or vouch for any tunnel product.

## 7. Verify from outside

Set the external address once and use the exported code without printing it:

```bash
BASE=https://YOUR-TUNNEL-HOST

curl -s "$BASE/api/health"
# expect "provider":"mock", "accessRequired":true, "publicDemo":true   (if provider is not "mock", stop)

curl -s -o /dev/null -w "session  no code    %{http_code}\n" "$BASE/api/session"
curl -s -o /dev/null -w "session  wrong code %{http_code}\n" -H "x-pathasetu-demo-code: not-the-code-0000000000" "$BASE/api/session"
curl -s -o /dev/null -w "session  right code %{http_code}\n" -H "x-pathasetu-demo-code: $PATHASETU_DEMO_ACCESS_CODE" "$BASE/api/session"
curl -s -o /dev/null -w "pack     no code    %{http_code}\n" "$BASE/api/pack"
curl -s -o /dev/null -w "pack     right code %{http_code}\n" -H "x-pathasetu-demo-code: $PATHASETU_DEMO_ACCESS_CODE" "$BASE/api/pack"
curl -s -o /dev/null -w "recheck  no code    %{http_code}\n" -X POST -H "content-type: application/json" \
  -d '{"itemId":"EL01","optionId":"A","explanation":"A synthetic check with enough detail."}' "$BASE/api/recheck"
curl -s -o /dev/null -w "recheck  right code %{http_code}\n" -X POST -H "content-type: application/json" -H "origin: $BASE" \
  -H "x-pathasetu-demo-code: $PATHASETU_DEMO_ACCESS_CODE" \
  -d '{"itemId":"EL01","optionId":"A","explanation":"A synthetic check with enough detail."}' "$BASE/api/recheck"
```

| Request | Expected |
|---|---|
| `/api/health` | `200`, `provider: mock`, `accessRequired: true`, `publicDemo: true` |
| `/api/session`, `/api/pack`, `/api/recheck` with no code or a wrong code | `401` (and no pack content in the body) |
| the same three with the right code | `200` |
| `/api/recheck` with the right code but an unlisted `Origin` | `403 origin_not_allowed` |
| repeated wrong codes beyond the budget | `429 too_many_attempts` with `Retry-After`; the right code still gets `200` |

If the right-code POST returns `403`, the proxy rewrote `Host`: list the exact origin and restart. If any "no code" request returns `200`, **stop the tunnel at once** and run preflight.

Then, in the phone's browser, open the HTTPS address. You should see the unlock dialog first and no question. Enter the code once; it is kept in that tab's session storage only (never IndexedDB, localStorage, the exported trace, screenshots or the app bundle) and is forgotten when the tab closes. Do not photograph or record the code.

## 8. Stop, rotate and remove the code after the demo

1. Close the tunnel first (the public address stops answering), then stop the server (`Ctrl+C` or `SIGTERM`).
2. Remove the settings from the shell:
   ```bash
   unset PATHASETU_DEMO_ACCESS_CODE PATHASETU_PUBLIC_DEMO PATHASETU_ALLOW_DRAFT_DEMO PATHASETU_ALLOWED_ORIGINS NODE_ENV
   ```
3. The throttle counters live in the process and vanish with it. The code exists only in your shell environment and your password manager: delete the stored entry, and clear shell history if you ever typed it literally.
4. **Rotate during a demo** (code shared too widely, or suspected leak): stop the server, run section 2 again, restart, and give testers the new code. Old codes stop working at once; phones that still hold the old one in their tab are sent back to the unlock dialog on their next request.
5. Generate a fresh code for every event. Do not reuse one.

## 9. Roll back to mock mode

```bash
unset GROQ_API_KEY GROQ_MODEL PATHASETU_PROVIDER_DATA_CONTROLS_ACK PATHASETU_PUBLIC_DEMO PATHASETU_ALLOW_DRAFT_DEMO PATHASETU_ALLOWED_ORIGINS PATHASETU_DEMO_ACCESS_CODE
export PATHASETU_MODEL_PROVIDER=mock NODE_ENV=development
npm run preflight && npm start
curl -s http://127.0.0.1:4173/api/health      # provider "mock", publicDemo false
```

## 10. Optional Groq run (local only; synthetic data only)

Do not run Groq behind the tunnel for the phone tests; the offline and reconnect steps do not need it. If you later want one, run it on your own computer only: set `PATHASETU_MODEL_PROVIDER=groq`, `GROQ_API_KEY`, a strong `PATHASETU_DEMO_ACCESS_CODE` and `PATHASETU_PROVIDER_DATA_CONTROLS_ACK=true` (set that only after you have read the provider's current data controls; the project only ever sends synthetic text). `npm run preflight` must pass (it checks presence, never prints a key and makes no provider call), then `npm run smoke` and `npm run evaluate -- --provider groq`. Those results prove API/schema compatibility, **not** diagnostic accuracy and **not** Odia competence; the evaluation set is 47 synthetic English cases. Never send a real child's response. The key stays in the server process; the browser never sees it.

## 11. Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| Server exits at start with `PATHASETU_DEMO_ACCESS_CODE ...` | public/Groq/production-draft mode needs a strong code; generate one (section 2). The message lists categories (for example `shorter_than_16_characters`), never the value. |
| `PATHASETU_PUBLIC_DEMO must be true or false` | use the exact lower-case words; `TRUE`, `1`, `yes` are refused on purpose. |
| `PATHASETU_ALLOWED_ORIGINS ...` at start | an entry is a wildcard, has a path, a default port, credentials, upper-case, or is `http` for a non-local host. |
| Page loads, re-check fails with 403 | Host-rewriting tunnel; list the exact origin (section 4). |
| Unlock dialog says "Too many attempts" | the failure budget is used up for this client; wait the stated seconds, or enter the correct code, which is still accepted. |
| Learner screen empty in production | `PATHASETU_ALLOW_DRAFT_DEMO=true` is missing (no item is reviewed and published). |
| Phone keeps showing an old screen after an update | the app shell is cached by the service worker (current cache `pathasetu-shell-v12`); close all tabs of the app and reload. If the issue persists, record browser/device details before clearing site data. |
| Mixed-content or "not secure" warning | the phone is not on the HTTPS address. |

## 12. What passing this runbook does and does not establish

It establishes that the server refuses to run an open public demo, that protected routes and the origin allow-list behave as specified, and that you can start, check, rotate and roll back. It does **not** establish that a phone works offline (that is `PHONE_TEST_PLAN.md`, still NOT TESTED), that your tunnel is configured safely, that the content is correct (all items are `UNREVIEWED_DRAFT`), or that this protection resists a determined attacker.
