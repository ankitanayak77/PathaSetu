# Firebase setup and verification

**Project:** `pathasetu-demo`  
**First guardian provider:** Google sign-in by redirect  
**Status:** source integration is present; Firebase Console setup and emulator verification remain.

## Data boundary

Cloud sync is manual. The guardian confirms before merging this browser's selected learner history with the signed-in account. Firestore stores at most the latest 500 answer records with only `schemaVersion`, item ID, option ID, submission timestamp, provisional diagnosis category, and misconception ID. It does not store written reasoning, answer drafts, queued retries, profile names, the decision trace, or provider rationale. Firestore browser persistence is left at its in-memory default. Local IndexedDB remains available while signed out or offline.

The path is `guardians/{Firebase UID}/learners/{local profile ID}/attempts/{answer ID}`. `firestore.rules` requires a verified Google identity, matching guardian UID, and an exact field allowlist. Firebase Auth and Firestore data do not pass through the Pathasetu server. `/api/recheck` is a separate endpoint and is not guarded by Firebase identity.

## Project owner setup

1. In Firebase Console, select the development project `pathasetu-demo`.
2. Register a Web app in Project settings and copy its Web API key and App ID. Those are public client configuration values; never use or provide a service-account JSON for this client-side design.
3. In Authentication → Sign-in method, enable Google. Confirm the OAuth support email and authorized domains include `localhost` for local use and the eventual HTTPS demo host.
4. Create/select Cloud Firestore and choose its location. The location choice can be difficult to change later; confirm the intended region with the project owner before creating a production database. This prototype has no database-region requirement recorded.
5. Add billing alerts and review Firebase Auth/Firestore quotas before inviting users.

## Local configuration (zsh)

Run in a private Terminal from the repository root. These values are read only by the running server; no `.env` loader or file is used.

```zsh
cd "/Users/kamal/Downloads/New Folder With Items 3/Pathasetu_MVP"
export FIREBASE_PROJECT_ID=pathasetu-demo
read -s "FIREBASE_WEB_API_KEY?Firebase Web API key (hidden): "; export FIREBASE_WEB_API_KEY; printf '\n'
read -s "FIREBASE_WEB_APP_ID?Firebase Web App ID (hidden): "; export FIREBASE_WEB_APP_ID; printf '\n'
export FIREBASE_AUTH_DOMAIN=pathasetu-demo.firebaseapp.com
npm start
```

Open `http://127.0.0.1:4173`, choose **Parent / Switch Profile**, sign in as the guardian, select a learner profile, and press **Sync … answer history**. Confirm the merge. The status reports success or failure. Use synthetic data until educator and privacy review is complete.

## Firestore Rules deployment

After confirming the database region and project, install/sign in to the Firebase CLI in the project owner's terminal, then deploy only the rules:

```zsh
cd "/Users/kamal/Downloads/New Folder With Items 3/Pathasetu_MVP"
firebase login
firebase use pathasetu-demo
firebase deploy --only firestore:rules --project pathasetu-demo
```

The deploy command changes the selected Firebase project's Firestore Security Rules. Check that `pathasetu-demo` is the intended development project before running it. Do not use `firebase deploy` without the target.

## Emulator checks

Firebase Local Emulator Suite requires Java JDK 11 or newer, and Node.js. The current build host has no Java runtime, so the emulator has not started here yet. The Rules test uses a non-existent `demo-pathasetu` project ID to avoid contacting a live Firebase project.

```zsh
cd "/Users/kamal/Downloads/New Folder With Items 3/Pathasetu_MVP"
npx --yes firebase-tools@latest emulators:exec --only firestore --project demo-pathasetu "npm run test:firebase"
```

The test verifies owner access, denial for unsigned and wrong-owner users, Google/verified-email requirements, exact-field rejection, and owner deletion. It does not prove live-project configuration, Google OAuth redirect behavior, two-device merge, or classroom readiness. After emulator tests pass, perform the live login and two-device checks only with synthetic data.

## Manual acceptance checklist

- Signed out: local answer can be saved; no cloud write is attempted.
- Guardian login: Google redirect returns to the app; Auth session lasts only for the browser session.
- Manual sync: two devices signed into the same guardian account converge on the same attempt IDs; repeated sync does not duplicate records.
- Isolation: another guardian cannot read, write, or delete the first guardian's records.
- Data minimization: Firestore has no explanation text, draft answer, trace, retry queue, guardian email, or child name.
- Failure: offline/rules rejection leaves the local IndexedDB record unchanged and displays a retryable failure.
- Shared device: sign-out warns that local answer history/drafts/queue will be cleared; after confirmation, reload shows no previous learner record.
- Cloud deletion: selected learner cloud attempts are deleted; local copy remains until separately reset or signed out/cleared.

## Boundaries

This first slice does not implement Firebase App Check, guardian-account deletion, automatic background sync, persistent Firestore cache, storage uploads, analytics, remote config, push messaging, or Firebase Auth protection for `/api/recheck`. Do not claim production readiness until live configuration, emulator and browser flows, Rules deployment, device checks, privacy review, and recovery/deletion policy are complete.
