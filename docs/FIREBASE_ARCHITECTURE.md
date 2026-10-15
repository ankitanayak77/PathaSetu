# Firebase architecture and activation gates

**Status (15 October 2026): integration code and deny-by-default Rules are implemented in the workspace; the web app is not configured, Rules are not deployed, and no emulator or live Firebase run has yet verified the integration.** Do not enter real learner data. The project ID is `pathasetu-demo`; the Firebase web app API key and app ID, Google provider enablement, authorized domains, Firestore database/region, and deployed Rules still need project-owner setup.

## What changed in the working build

The previous unsafe `/api/firebase/config`, `/api/firebase/auth`, and `/api/sync` routes were removed. The new `/api/firebase/config` returns only the project owner's public web config from server environment; it accepts no client-supplied config and contains no server secret. The browser uses the official modular Firebase Web SDK, Google redirect sign-in with session persistence, and direct Firestore access protected by `firestore.rules`. Progress sync is manual and explicit. The local demo still works without Firebase. Server-side `/api/recheck` is a separate demo/model route and is **not** authorized by Firebase guardian sign-in.

The former `/api/ai-live` and `/api/textbook-ingest` prototype routes were removed as well. They bypassed the configured model chain, could report a PDF as ingested after only probing its URL, and had no complete authorization/rate-limit/provenance workflow. The production diagnostic chain remains separate and accepts only its current validated task schema.

## Target service map

| Firebase service | Decision | Purpose and boundary | Activation prerequisite |
|---|---|---|---|
| Authentication | Implemented for Google guardian sign-in | Google sign-in uses redirect, with browser-session persistence. No child account is created. Auth email is provider-managed and is not written to Firestore. | Owner enables Google provider and authorized app domain; test redirect on desktop/mobile and emulator; review guardian consent and account recovery. |
| Cloud Firestore | Implemented client sync and Rules | Manual, explicit merge of up to 500 answer records under `guardians/{uid}/learners/{profileId}/attempts/{answerId}`. Stored fields are allowlisted: item/option IDs, timestamp, provisional category, schema version. Written reasoning, drafts, retry queue and traces are excluded. | Create database and choose region; deploy Rules; run emulator, two-device, shared-device, deletion and reconnect checks. No cloud sync has run yet. |
| App Check | Required for a public web app as an abuse-reduction layer | Verify App Check tokens at the server boundary where supported. It supplements user authentication and authorization; it does not replace them. | Choose supported provider, register web app, configure enforcement, verify tokens server-side, and monitor legitimate-device rejection. |
| Cloud Functions / Cloud Run | Candidate backend boundary for hosted models | Keep Gemini and Groq keys on the server; enforce identity, request limits, schema validation, timeouts, provider fallback policy, redaction, and audit-safe errors. | Select hosting, region, IAM, cost limits, model/data-processing review, and deployable operational monitoring. Firebase Functions supports Secret Manager-bound secrets. |
| Cloud Storage for Firebase | Not currently needed | The current app has no reviewed audio or uploaded textbook asset that requires per-user object storage. Store approved static learning assets in the versioned content pack/CDN until a concrete media workflow exists. | A user need, file ownership/consent, licensing, upload validation, retention, malware/content controls, and Storage rules. |
| Analytics / Remote Config / Messaging | Not enabled | No current decision requires learner-level tracking, remote experimentation, or push messages. Avoid collecting child telemetry as a default. | Separate purpose, minimal event taxonomy, consent and age review, retention, opt-out and operational owner. |

Firestore web persistence is not enabled; Firebase's default memory cache avoids retaining a cloud cache between sessions. Local IndexedDB remains device-local. Rules require a matching authenticated UID, verified email, Google provider claim, valid profile path, and exact attempt fields. The app uses the client SDK, so these Firestore Rules apply directly. No Admin SDK/service-account key is used. ([Firestore offline persistence](https://firebase.google.com/docs/firestore/manage-data/enable-offline), [Firestore rule conditions](https://firebase.google.com/docs/firestore/security/rules-conditions), [Firebase security checklist](https://firebase.google.com/support/guides/security-checklist))

## Proposed data flow

```text
Browser PWA
  ├─ Local answer + IndexedDB queue (offline-first, remains available without login)
  ├─ Guardian signs in through Firebase Auth (Google redirect; no child credentials)
  ├─ Local state stays in IndexedDB; cloud operation requires a confirmation click
  └─ Firebase Web SDK writes minimal attempt records directly to Firestore
        ↓ Firestore Rules verify Google identity, UID path, schema and fields
     guardians/{uid}/learners/{opaque-profile-id}/attempts/{answer-id}
  Separate /api/recheck → optional Gemini/Groq; it does not use Firebase identity today
```

The Firebase UI/config path and Firestore client are present, but no project config is active; until configured, behavior is local-only. The client must not treat a session-storage Boolean, an email string, an email-derived document ID, an Origin header, or an App Check token as proof of account ownership.

## Sync semantics to implement

1. Keep IndexedDB as the offline source of truth. No Firebase persistence cache is enabled.
2. A guardian explicitly confirms before a merge; this avoids silently uploading one shared-device user's history to another account.
3. Store deterministic answer IDs for idempotent writes. Read up to 500 cloud events and merge by answer ID; newest events survive the local 500-answer cap.
4. Cloud failure leaves the local record unchanged and reports failure; the learner can retry manually.
5. A guardian can delete one profile's cloud attempt records and can sign out while clearing this browser's local learning record. Account deletion itself is not implemented.
6. Emulator and real-device tests must verify shared-device switching, redirect, cross-device merge, deletion, and offline/reconnect before pilot use.

Open decisions: exact Firestore region; retention period; full guardian-account deletion; whether App Check is required before wider public launch; and who approves child-data processing. Google is selected for this first sign-in slice. No database has been created or written by this implementation.

## Delivery roadmap and gates

| Phase | Deliverable | Gate before next phase |
|---|---|---|
| 0. Local-first base | Preserved: IndexedDB and offline behavior; Firebase config is optional. | Local and browser regression checks. |
| 1. Firebase project hardening | Implemented locally: Google provider client, public config endpoint, UID-scoped Rules, local emulator config. | Owner registers web app, supplies public web config locally, enables Google provider, selects region, deploys Rules, adds billing alerts. |
| 2. Auth vertical slice | Implemented locally: Google redirect, session persistence, sign-out and local-clear path. | Auth Emulator plus live-project login/redirect check; verified and signed-out behavior. |
| 3. Progress sync | Implemented locally: explicit idempotent merge, privacy-minimal answer schema, profile cloud deletion. | Rules Emulator; then two-device sync, shared-device, offline/reconnect, and deletion checks. |
| 4. Hosted model route | Gemini primary and Groq fallback (or chosen order), secret-managed keys, synthetic prompts, rate/cost limits, validated structured response, provider-specific retention review. | Live provider canary with synthetic data, failure/fallback/timeout checks, latency and cost baseline, owner-approved data handling. |
| 5. Pilot | Approved learning content, guardian-facing privacy copy, monitored small cohort, support and rollback. | Qualified legal/privacy and educator/community review; classroom/phone/accessibility evidence. |

## Credentials and setup boundary

Do not paste keys into chat, source files, browser storage, screenshots, commits, or this document. Firebase web `apiKey` is a project identifier and is expected to be visible in browser configuration; it is not a server credential. Gemini and Groq keys are secrets and must stay in server-side environment/Secret Manager. For Cloud Functions, Firebase documents binding secrets to only the functions that need them through Secret Manager. ([Cloud Functions secrets](https://firebase.google.com/docs/functions/config-env))

The project ID is `pathasetu-demo`, Google sign-in is selected for this slice, and Rules/config/emulator files are in the workspace. The Firebase web app API key and app ID are still needed locally; these are public web configuration values, not service-account credentials. The project owner must enable Google Auth, register authorized domains, create/select Firestore and choose its region, and deploy Rules from an authenticated Firebase CLI session. Never provide a service-account JSON or model key in chat. This workspace has not verified project ownership or deployed state.
