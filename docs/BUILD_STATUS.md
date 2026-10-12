# Pathasetu MVP — build and verification status

**Project:** Pathasetu  
**Scope:** One-learner, Class 10 Science/Electricity, bilingual draft experience, deterministic learning loop, local state, offline queue and reconnect re-check.  
**Status date:** 12 October 2026  
**Source path:** an existing `Pathasetu_MVP` workspace was present in the active environment; it has no `.git` metadata, so this workspace alone does not establish prior source history. No patch command was run against the earlier B2 source in this session. This existing workspace already contains a Groq adapter, tested only against local fake responses.

## Current verification

| Check | Result | Qualification |
|---|---|---|
| `npm ci` | PASS | Node v22.16.0, npm 10.9.2; no third-party runtime dependencies |
| `npm test` | PASS — 40/40 | Core, schema, queue failure handling, Groq fake-fetch, server integration/rate-limit and static UI tests |
| `npm run check` | PASS | Node syntax checks for server, browser app, core agent and validator |
| `npm run capture` server/API checks | PASS — 10 checks; 0 failed | Includes HTTP server, draft pack, bounded re-check, invalid option, body limit, cross-origin rejection, module serving and no API caching |
| `npm run capture` browser E2E | BLOCKED | Managed Chromium navigation to local development URLs returned `ERR_BLOCKED_BY_ADMINISTRATOR`; do not count as passed |
| Groq live smoke test | NOT RUN | No live provider call was made in this workspace |
| Physical Samsung/iPhone tests | NOT RUN | Requires execution on the actual devices |
| Odia/science review | NOT VALIDATED | Odia text below is draft translation, not teacher-approved content |

## Implemented

- Feedback-first flow: after an answer, the current question remains visible with its result/remediation card; the learner explicitly continues to the recommended question. E2E script updated, but this interaction remains unverified here because Chromium navigation is blocked.
- Bumped the app-shell cache from v1 to v2 after changing offline client code so an already-installed v1 shell is invalidated on service-worker update.
- Content validation now requires each incorrect option to map to an allowed misconception, rejects misconception mappings on the correct option, rejects unused allowlisted IDs, and requires reviewer identity plus a valid timestamp for REVIEWED/PUBLISHED items.
- Queue handling now refuses new submissions at capacity rather than accepting an answer without a re-check slot; failed re-check attempts are recorded for persistence; a rejected diagnosis is no longer counted as a completed re-check.
- Added configurable process-local, per-client-IP fixed-window rate limits for session checks and model re-checks, with `429` and `Retry-After`. This is only baseline abuse protection, not a production quota gateway.

- Mobile-first UI with a visible Odia draft question and draft translations for answer options.
- Eight structured Electricity items across four concepts: closed circuits, energy transfer, Ohm’s law, and series/parallel resistance; all are drafts.
- Allowlisted misconception IDs, explicit `NONE` and `UNCERTAIN` results, and confidence validation.
- Deterministic, option-linked mock. It does not semantically interpret free-text Odia/English and cannot confirm mastery.
- State transitions, deterministic next-item planning and decision trace.
- IndexedDB storage with visible memory-only fallback if IndexedDB is unavailable.
- Per-question drafts, pending re-check queue, reconnect probing/backoff, re-check notices and proposed next step.
- App shell caching that intentionally excludes `/api/*` responses.
- Optional Groq adapter with structured schema, per-item ID restrictions, bounded timeout and safe provider errors. Its fake-fetch tests are not live API verification.
- Demo access-code protection when the Groq provider is enabled; production mode omits unreviewed items unless draft-demo mode is explicitly enabled.
- Server rejects invalid option IDs, overly long explanations, oversized JSON bodies, and cross-origin requests.

## Important limitations

- All eight content items and all Odia translations remain `UNREVIEWED_DRAFT`. A competent Odia-medium science reviewer must approve science correctness, language, terminology, answer rationales and misconception mapping before publication.
- The mock uses option mapping plus explanation-length checks; it does not understand the explanation. Never describe its output as semantic diagnosis or validated AI reasoning.
- Groq was tested only with local fake server responses. No live request was made; Odia accuracy and rate limits are unknown.
- The managed environment blocked Chromium navigation to local URLs. Browser UI, IndexedDB in a real browser, offline navigation and the end-to-end reconnect journey are not verified here.
- No real-device, learner, educational-outcome or performance validation exists.
- The server's access-code gate and in-memory fixed-window rate limits are demo protection, not a complete production security layer. Keep the real-model service behind a private/access-controlled tunnel or hosting layer.

## Next execution priorities

1. Run `npm ci && npm test && npm run check && npm run capture` on the team's development machine. Save the current output and the `evidence/capture-latest.json` produced by that run.
2. Run through the phone protocol in `docs/PHONE_TEST_PLAN.md` on the named real devices.
3. Have the content reviewer annotate and correct the content pack. Do not change statuses to `REVIEWED`/`PUBLISHED` without actual approval.
4. If using Groq, enable Zero Data Retention in the provider console, configure the key only in the environment, and run `npm run smoke` on synthetic cases only. Report response shape, errors and latency separately from accuracy.
5. Keep a claim ledger: each feature claim must be `IMPLEMENTED`, `TESTED`, `PHONE-TESTED`, `CONTENT-REVIEWED`, or `NOT VALIDATED` with evidence.
- Added `docs/CONTENT_REVIEW_WORKSHEET.csv` with one row per draft question and blank reviewer decision fields. It is a review aid, not proof that any content has been reviewed.
