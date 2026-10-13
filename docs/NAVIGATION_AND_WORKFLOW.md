# Pathasetu — navigation, controls and workflows (as built)

Written 13 October 2026 by reading `public/index.html` and `public/app.js` and comparing with the browser tests. Wording in quotes is what the screen shows. If a control a judge might expect is not here, it is listed in section 3 as **NOT IMPLEMENTED**.

**Test marks used below:** *unit* = a test in `tests/` passes in Node; *headless* = a check in `npm run e2e` / `capture` / `a11y` passed in headless Chromium on Linux (`evidence/iteration5/baseline/`); *phone* = a person ran it on a real phone — **NOT TESTED for every row in this document**; *not tested* = no automated or manual check exists.

## 1. Navigation map

Pathasetu is a **single page**. There are no tabs, menus, routes or back buttons. You never leave the page; cards on it change. The only full-screen state is the unlock dialog.

```
                      ┌───────────────────────────────────────────────┐
 Header: logo link · PROTOTYPE tag · connection pill
                      └───────────────────────────────────────────────┘
 Hero text · "Draft demo pack" strip
 Notice area (one message at a time)   ·   Banner (read-only / not saving)
 ┌──────────────────────────────────────┐  ┌──────────────────────────────┐
 │ YOUR LEARNING PATH: "One small step" │  │ AGENT'S PLAN: "Why this next?"│
 │  question card                        │  │   [Continue to EL0x →]        │
 │  options A–D + explanation box        │  │ LANGUAGE BRIDGE               │
 │  [Check my thinking]                  │  │ BRIDGE PRACTICE               │
 │  result card (after an answer)        │  │ YOUR PROGRESS (+ Retry now)   │
 └──────────────────────────────────────┘  └──────────────────────────────┘
 "Agent decision trace" (expand) → trace list · [Download trace JSON]
 Footer: provider label
 Overlay (only when a code is required): "Unlock Pathasetu"
```

To get back to the main learning path from anywhere, you do nothing: there is nowhere else to go. The unlock dialog disappears when the code is accepted; the trace folds with its header button.

## 2. Screen-by-screen, control-by-control

"Works offline" means: with the network off but the app already loaded or reloaded from the service worker. "Function" names the code that runs.

### 2.1 Header

| Control | Looks like | What you do | Function / endpoint | What changes | Offline | Failure message |
|---|---|---|---|---|---|---|
| Skip link "Skip to learning activity" | Hidden until focused with Tab | Press Enter | browser anchor to `#main` | Focus moves to main content | Yes | — |
| Logo / "Pathasetu home" | Mark + "Pathasetu — A bridge to understanding" | Tap | normal link to `/` | Reloads the page (state is kept in IndexedDB) | Yes, if the shell is cached | Browser offline page if the shell is not cached |
| PROTOTYPE tag | Small label | none | static | — | Yes | — |
| Connection pill | Dot + text: "Checking connection", "ONLINE · sync available", "OFFLINE · local mode" | none (it is a status, `role=status`) | `renderConnection`, fed by `refreshHealth` → `GET /api/health` | Updates every 15 s online; backs off to 30 s offline; also on the browser's `online`/`offline` events and when the tab becomes visible | Yes (shows OFFLINE) | — |

### 2.2 Hero and notice area

| Control | What it shows | Function | Offline |
|---|---|---|---|
| Headline and copy | "Understand the why, not just the answer." | static | Yes |
| "Draft demo pack" strip | "Odia wording awaits teacher review" | static | Yes |
| Notice area | One message with a ✓, ! or i icon: "Prototype content · not for real learners", "Demo unlocked", "Re-check processed · MOCK", "App update ready", and others. A new message replaces the old. | `notice()` / `renderNotice()` | Yes |
| Banner (`writer-banner`) | Persistent warnings that a transient notice cannot hide: "Read-only session", "Single-tab protection unavailable", "Progress is not being saved to this device" | `renderWriterBanner` | Yes |

### 2.3 Learning path: the question card

| Control | Looks like | What you do | Function / endpoint | What changes | Offline | Failure messages |
|---|---|---|---|---|---|---|
| Step counter | "STEP 01" | none | `renderQuestion` | Shows the position of the current question in the pack | Yes | — |
| Question header | "QUESTION EL01 · CLOSED CIRCUIT" and an "UNREVIEWED DRAFT" badge | none | static from the pack | — | Yes | — |
| Question text and Odia draft block | English prompt; then "ODIA QUESTION · UNREVIEWED DRAFT" with the draft | read | pack fields `prompt`, `promptOdiaDraft` | — | Yes | "[Odia wording needs review]" if the field is empty |
| Options A–D | Radio buttons with English text and the Odia draft beside it, marked "· draft" | Tap one | change event → `persistDraftFromDom` | Draft saved under this question; the submit button turns on | Yes | Disabled in a read-only tab or while waiting to continue |
| Explanation box | "How would you explain your choice?" (optional, up to 1,000 characters) | Type | `persistDraftFromDom` | Draft saved on each input, under this question only | Yes | — |
| **Check my thinking** | Primary button, disabled until an option is chosen | Tap | `doSubmit` → `submitAnswer` (`agent.js`) → `saveRecord` → `drainQueue` if the server is reachable | Answer stored; one learning session used; queue entry added; result card and notice appear; the question stays on screen | Yes; the re-check waits | "Choose an option first"; "Read-only session"; "Re-check queue is full"; "Could not save this answer" |
| Result card | "LATEST ATTEMPT · <mode>", a heading ("Let's clarify your thinking" / "Answer key match (not independently verified)" / "Possible concept gap — provisional"), the rationale, and "Next learning action" with the remediation text | read | `renderQuestion` | Updates again after the re-check | Yes | — |
| Notice after submit | "Saved offline · re-check queued", "Not enough evidence yet · re-check pending", "Possible concept gap · provisional" or "Answer-key match · re-check pending", with the candidate ID and suggested activity | read | `doSubmit` | — | Yes | — |
| Continue (see the plan card) | — | — | — | — | — | — |

After answering, the question stays on screen on purpose so you can read the feedback. The inputs are disabled until you choose to continue ("Review the feedback and remediation below, then continue...").

### 2.4 Plan card: "Why this next?"

| Control | What it shows / does | Function | Offline |
|---|---|---|---|
| Reason text | One of: "Starting with EL01, the first available question..." (no history); "The deterministic planner selected EL0x ... using concept focus and prior attempts"; "The latest re-check recommends EL0x because it revisits the same concept with a different question"; "You have N re-check(s) waiting..." | `renderPlan` | Yes |
| Recommendation box | "Updated recommendation · EL0x" with the concept name and "Your current question and its draft remain unchanged until you choose to switch." | `renderPlan` | Yes |
| **Continue to EL0x →** (button label starts as "Use updated plan") | Appears only when the recommended question differs from the current one | click → sets `currentItemId`, clears the recommendation, writes `learner_applied_updated_plan` to the trace, saves | Yes |

### 2.5 Language Bridge card ("Meaning across languages")

Three rows: Everyday Odia, School Odia term, English term, from the current question's `bridge` fields, with a footnote that they must be reviewed by a qualified speaker or teacher. While an unanswered practice exercise is open, the school term and the English term show "Hidden for practice" so the exercise is not a lookup. No controls. Works offline. Shows "Awaiting reviewed content" if an item has no bridge.

### 2.6 Bridge Practice card ("Match the meaning")

| Control | What you see / do | Function | What changes | Offline | Messages |
|---|---|---|---|---|---|
| Badges | "UNREVIEWED DRAFT" and "Offline · no AI · no network" | — | — | Yes | — |
| Prompt | The everyday-Odia sentence; "Which school Odia term and English term name this idea?" | `buildBridgeExercise` | Built from the pack; deterministic, rotates with the attempt count | Yes | If not enough clearly different mappings: "Bridge Practice is off for this question." plus a reason |
| Three choices (A–C) | Buttons with an Odia term and an English term | tap | `recordBridgeAttempt` | Attempt counter +1; trace event `bridge_practice_attempt` with `network: false`; the chosen button turns correct or wrong; the full mapping appears in the Bridge card | Yes | "Matches the pack's draft mapping. The mapping itself has not been teacher-reviewed." / "Not this pair. Try another option, or reveal the source mapping." |
| Reveal the source mapping | Text button | tap | `recordBridgeReveal` | Shows the three fields and "Source: ... status UNREVIEWED_DRAFT"; trace event `bridge_mapping_revealed` | Yes | — |
| Try another → | Text button | tap | `newBridgeSession` | A fresh exercise from the saved attempt count; no trace event | Yes | — |
| (read-only tab) | Controls disabled; "Read-only session: practice is disabled here." | — | — | — | — |

Correct here means **consistent with the pack**. It does not show the translation is right.

### 2.7 Progress card ("Learning state")

| Element | Shows | Function | Notes |
|---|---|---|---|
| "answers saved" | Number of stored answers | `renderProgress` | |
| "pending re-checks" | Queue length | | |
| "N learning sessions left" and bar | Starts at 10 and drops by one per submitted answer; at 0 the number stays 0 | | The bar fills as sessions are used. No other behaviour is attached to reaching zero (**not tested**) |
| Storage line | "Saved in this browser's IndexedDB on this device." / "Not saved to this device yet." / "Not saved to this device: the browser blocked local storage (<reason>)..." | `renderStorageStatus` | Never says "saved" unless the last durable write worked |
| Persistence line | After the first saved answer: granted / not granted / unsupported / error wording that never promises retention | `describePersistence` | |
| Queue status (appears only when a re-check failed) | "Re-check waiting · attempt N of 5 failed — Next automatic try in about S s. [Retry now]" or "Re-check paused · needs attention ... [Retry now]" | `renderQueueStatus`, `scheduleRetryTimer`, `manualRetryQueue` | Button disabled in a read-only tab |

### 2.8 Agent decision trace

| Control | What it does | Function | Offline |
|---|---|---|---|
| "Agent decision trace" header button | Expands or folds the panel (`aria-expanded`) | toggle | Yes |
| Trace list | Newest first, up to 30 shown (200 kept): time, event name, details such as `type`, `itemId`, `reason`, `network:false` | `renderTrace` | Yes |
| **Download trace JSON** | Saves `pathasetu-trace-<date>.json` (export format 2): typed explanations replaced by character counts; access codes and API-key patterns redacted; drafts omitted | `buildTraceExport` | Yes |

### 2.9 Footer

Provider label: "MOCK PROVIDER · DEMO RULES · NO LIVE AI" by default; "CONFIGURED · GROQ · <model> · ACCURACY UNVALIDATED" if the server reports Groq. Updated from `/api/health`.

### 2.10 Unlock dialog ("Unlock Pathasetu")

| Control | Behaviour |
|---|---|
| Password field "Session access code" and **Unlock demo →** | Sends the code in the header `x-pathasetu-demo-code` to `GET /api/session`. Accepted → stores it in `sessionStorage` for this tab, closes the dialog, shows "Demo unlocked", loads the pack if it is not loaded, drains the queue. |
| Messages | 401: "That session code was not accepted." 429: "Too many attempts from this connection. Wait about N seconds, then try again. The correct code is still accepted." Other HTTP error: "The server could not check the code right now (HTTP n). Try again shortly." Network error: "The server could not verify the code. Check the connection and try again." |
| When it appears | Only if `/api/health` reports `accessRequired` and the page has no accepted code, or a protected request returns 401. Offline, the dialog cannot be passed (the check needs the server) but a previously loaded page and its saved pack still work. |

### 2.11 Other notices you may see

"Connection changed — Pathasetu will keep local progress and retry reachability" (browser went offline); "Re-check processed · MOCK" / "partially processed"; "Re-check deferred"; "Re-check paused"; "Server still unreachable"; "Learning plan updated"; "Saved progress could not be read" / "partly repaired"; "Local save warning"; "Progress is no longer being saved to this device"; "App update ready — Reload once to apply it"; "Offline shell unavailable" (service worker failed to install).

## 3. Controls a judge might expect that are **NOT IMPLEMENTED**

Language switch (Odia/English toggle); Kui or any other language; speech input; read-aloud; transliteration or Roman-Odia input handling; a question list or free choice of question (the planner chooses); skip or "I don't know" button (an empty explanation is allowed); progress reset; delete my data; log out or lock; settings; hint; timer; score or streak; sharing or export for a teacher; a teacher or parent view; notifications; help screen; a manual "refresh content" button (the pack refreshes on each load when online); an accounts page. Nothing in the code or the HTML provides them.

## 4. Fifteen journeys

Each has a plain version and a technical version, then the test marks. IDs like "E1" are checks in `scripts/browser-regression.mjs`. Unit tests are in the named file.

### J1. First visit, unlock and content load
**Plain.** Open the address. If the demo is protected, a dialog asks for the code. Type it. The first question appears.
**Technical.** `startApp` → `acquireWriterLock` → `load()`: IndexedDB read; `GET /api/pack` (with the code from `sessionStorage` if present); on 401 the dialog opens and the saved pack, if any, is kept; on success the pack is stored with the record; `initialState` or `repairSavedRecord`; `renderAll`; `refreshHealth`.
**Marks.** unit: `access-policy.test.js`, `public-demo.test.js`, `server.test.js`. headless: A1–A4, M1–M7, T1–T4. phone: NOT TESTED.

### J2. Correct answer
**Plain.** Choose the right option and give a reason of at least a few words: "Answer key match (not independently verified)". Never "mastered".
**Technical.** `proposeDiagnosis` returns `NONE` (0.78) for an option without a misconception ID; validator passes; stored provisional; queue entry added.
**Marks.** unit: `agent.test.js` (submission and re-check), `validator.test.js`. headless: **no scenario submits the keyed option** (scenario B submits the misconception option A of EL01), so the correct-answer wording has no browser check. phone: NOT TESTED.

### J3. Incorrect answer and remediation
**Plain.** A wrong option shows "Possible concept gap — provisional", the candidate misconception, and a "Next learning action".
**Technical.** `proposeDiagnosis` returns `MISCONCEPTION` with the option's linked ID; validator checks the allow-list; `remediation` text from the pack is shown.
**Marks.** unit: `agent.test.js`. headless: B1, B2, B3. phone: NOT TESTED.

### J4. Ambiguous or insufficient explanation
**Plain.** If the reason is under 8 characters (or empty), the app says "Not enough evidence yet" and makes no claim about a misconception.
**Technical.** `proposeDiagnosis` → `UNCERTAIN` (0.4). Anything 8 characters or longer is treated as enough, whatever it says.
**Marks.** unit: "uncertain/empty explanation never confirms a misconception". headless: no dedicated check. The rule abstained on 2 of 12 ambiguous or insufficient evaluation cases. phone: NOT TESTED.

### J5. Invalid model response or disallowed diagnosis
**Plain.** If the second opinion is garbage, or names a misconception that does not belong to this question, the app keeps the answer, counts a failed attempt and tries again later.
**Technical.** Server `validateDiagnosis` → 422 `diagnosis_rejected`; browser `recheckQueued` → `registerFailure`; invalid JSON or HTTP 5xx → `recordRecheckDeferred`.
**Marks.** unit: `validator.test.js`, `iteration2-core.test.js`, `groqModel.test.js` (fake server). headless: J1–J5 (stubbed provider failures). Real provider: not tested. phone: NOT TESTED.

### J6. Offline answer and queued re-check
**Plain.** Turn the network off, answer, and see "Saved offline · re-check queued" and "pending re-checks: 1".
**Technical.** `submitAnswer({online: false})` → mode `OFFLINE_RULE`, queue entry `PENDING_RECHECK`; saved to IndexedDB.
**Marks.** unit: `agent.test.js`. headless: E1–E3 (reload while offline included), D2. phone: NOT TESTED (mandatory steps 3–5 in `PHONE_TEST_PLAN.md`).

### J7. Reconnect and replan
**Plain.** When the server can be reached again, the waiting check runs, the notice says "Re-check processed · MOCK", and the plan card may offer a different next question. Your open question and typed text stay as they are.
**Technical.** `refreshHealth` → `drainQueue` → `POST /api/recheck` → `recheckQueued` (provisional, `trusted:false`) → `chooseNextItem` with the re-checked concept as focus → `nextRecommendedItemId`; the learner presses **Continue to ...**.
**Marks.** unit: `agent.test.js`. headless: D1–D4, E3, E4, B2, B3. phone: NOT TESTED.

### J8. Retry limit reached, paused queue, manual recovery
**Plain.** After five failed tries the card says "Re-check paused · needs attention". Your answer is safe. **Retry now** tries again.
**Technical.** `scheduleAfterFailure` sets `needsAttention`; `isDue` is false; `manualRetryQueue` resets the cycle; backoff 5, 10, 20, 40, 60 s.
**Marks.** unit: `retry.test.js`. headless: N1–N11. phone: NOT TESTED.

### J9. Browser closed or swiped away, then reopened
**Plain.** Your saved answer and the waiting check are still there. When the server is reachable the check runs without a tap.
**Technical.** `load()` reads the record; `scheduleRetryTimer`; `refreshHealth` → `drainQueue`. `pagehide` releases the lock and saves.
**Marks.** unit: `storage*.test.js`. headless: E4, L1, L2 (full page reload, not a killed app process). phone: NOT TESTED (swipe-away is phone step 8).

### J10. Missing content ID or corrupt saved state
**Plain.** If a saved question no longer exists, the app picks another and drops stale waiting checks. If the saved record cannot be read, it starts fresh, keeps a copy aside and says so.
**Technical.** `reconcileState`; `repairSavedRecord`; `storage.quarantine`.
**Marks.** unit: `iteration2-core.test.js`, `storage-resilience.test.js`. headless: F1–F4, R1–R5. phone: NOT TESTED.

### J11. Two tabs, single writer, read-only
**Plain.** The second tab shows "Read-only session" and its controls are off. Close the other tab and reload to write again.
**Technical.** `navigator.locks.request('pathasetu-single-writer', {ifAvailable:true})`; no lock → `writable=false`; `saveRecord` and `drainQueue` do nothing. Without Web Locks: "Single-tab protection unavailable".
**Marks.** unit/static: `uiStatic.test.js`. headless: G1–G7. phone: NOT TESTED (phone step 9).

### J12. Bridge Practice, insufficient mappings, reveal, trace
**Plain.** Pick a pair; get feedback; reveal the source; open the trace to see the recorded attempt. If the pack had fewer than three clearly different mappings, the card says it is off and why.
**Technical.** `buildBridgeExercise`, `recordBridgeAttempt`, `recordBridgeReveal`. With the current pack all eight questions yield an exercise.
**Marks.** unit: `bridge.test.js`. headless: K1–K10. phone: NOT TESTED (phone step 14). content-reviewed: no.

### J13. Access code, 401, 403, 429, correct code
**Plain.** No code or a wrong code → refused ("That session code was not accepted."). Many wrong guesses → "Too many attempts... wait". The right code always works. A request from an unexpected website address → refused (403).
**Technical.** `authorise()` first, failed-attempt bucket, then per-route rate limits; `originAllowed` for 403; `PATHASETU_ALLOWED_ORIGINS` for Host-rewriting tunnels.
**Marks.** unit: `access-policy.test.js`, `public-demo.test.js`, `proxy-origin.test.js`. headless: M1–M7, T1–T4; capture's HTTP checks. Real tunnel: BLOCKED/NOT TESTED. phone: NOT TESTED.

### J14. Service-worker update
**Plain.** After a new version is deployed, the next visit shows "App update ready — Reload once to apply it". One reload loads the new code.
**Technical.** `registration.update()`; `controllerchange` (ignored on first install); cache name `pathasetu-shell-v8` replaced on activate.
**Marks.** unit/static: `uiStatic.test.js`. headless: I1, I2, A4, H1. phone: NOT TESTED (phone step 16 also needs a second build).

### J15. IndexedDB write failure, persistence warning and trace export
**Plain.** If the browser blocks storage, the screen says progress is **not** being saved and a banner stays on. After your first saved answer, the app asks the browser to keep the data and tells you the answer without promising. **Download trace JSON** gives you the record without your typed text.
**Technical.** `createIndexedDbStorage` falls back to memory and reports the error name; `maybeRequestPersistence` (asks once); `buildTraceExport`.
**Marks.** unit: `storage.test.js`, `storage-resilience.test.js`. headless: P1–P4, S1–S3. phone: NOT TESTED (phone step 18 records the exact storage wording on each browser).

## 5. State changes at a glance

`learner.currentItemId` changes only when the app starts, when `reconcileState` repairs a missing question, or when you press **Continue to ...**. `learner.nextRecommendedItemId` changes on submit and on each re-check. `sessionsRemaining` falls by one per accepted answer. `queue` grows on submit and shrinks on a successful (or stale-dropped) re-check. `trace` grows on every decision and is capped at 200.
