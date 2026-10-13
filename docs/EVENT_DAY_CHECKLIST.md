# Event-day checklist — Samsung Galaxy S23, S25, S25 FE and iPhone 16

**Status of this document: instructions only. No phone has been tested, no reviewer has seen the content, and every result row stays `NOT TESTED` until a person runs the step on the real device and writes down what happened.** Nothing here is pre-filled, and a headless-browser pass is never a substitute for a phone.

Companion files: `PHONE_TEST_PLAN.md` (the 23 steps), `PHONE_TEST_RESULTS_TEMPLATE.csv` (161 rows: 7 device/browser combinations × 23 steps), `HTTPS_DEMO_RUNBOOK.md` (server, tunnel, code), `REVIEWER_GUIDE.md`.

## 1. Before the event (laptop, about 30 minutes)

- [ ] `npm ci`, then `npm test`, `npm run check` and `npm run check:content` all succeed. The last one printing `OK` means the files agree with each other; it does **not** mean the content is reviewed.
- [ ] Follow `HTTPS_DEMO_RUNBOOK.md` sections 2–3: generate a fresh random access code, set `PATHASETU_PUBLIC_DEMO=true`, `PATHASETU_ALLOWED_ORIGINS` and the draft flag, keep the mock provider.
- [ ] `npm run preflight -- --expect-origin https://YOUR-HTTPS-HOST` prints `PREFLIGHT: PASSED`. Any `FAIL`: stop and fix before anyone touches a phone.
- [ ] `npm start`; the start-up line must say `provider=mock publicDemo=true`. Start your HTTPS tunnel or host (your choice; the repository does not ship one).
- [ ] Run the "verify from outside" requests in the runbook (section 7). A `200` with no code means stop the tunnel at once.
- [ ] Share the code with testers privately, never in a screenshot, recording or the results sheet.
- [ ] Make one copy of `PHONE_TEST_RESULTS_TEMPLATE.csv` per tester or device so two people never edit one file.

## 2. Per-device fields (write exactly what the device shows; do not guess)

Fill these in every row you actually run. Leave a row `NOT TESTED` if you did not run it, and use `BLOCKED` with a reason if you tried and could not.

| Device | Browsers (run separately) | Address to open | `os_version` — where to read it | `browser_version` — where to read it |
|---|---|---|---|---|
| Samsung Galaxy S23 | Chrome, Samsung Internet | the HTTPS address; `https` = `yes` | Settings → About phone → Software information: write the Android version and One UI version | Chrome: `chrome://version` or Chrome → Settings → About Chrome. Samsung Internet: its menu → Settings → About Samsung Internet |
| Samsung Galaxy S25 | Chrome, Samsung Internet | same | same | same |
| Samsung Galaxy S25 FE | Chrome, Samsung Internet | same | same | same |
| iPhone 16 | Safari | **HTTPS address only; there is no `localhost` shortcut on the phone** | Settings → General → About → iOS Version | Safari's version follows iOS: write `Safari on iOS <the version above>`. Do not guess a separate Safari build number |

Other columns: `tester`, `date_ist` (IST), `https` (`yes`/`no`; an Android USB `localhost` run is `no (localhost)`), `network` (Wi-Fi, mobile data, hotspot or airplane mode as in the step), `evidence_ref` (a file name for a screenshot or recording that shows no code and no learner data), `notes`.

## 3. Order of operations on the day

Work in two passes so the mandatory evidence exists even if time runs out.

**Pass 1 — mandatory steps 1, 3–9, 14 and 18 on every combination, iPhone first (it is the least certain and the only one that cannot use USB `localhost`).** Order: iPhone 16 Safari → S25 Chrome → S25 Samsung Internet → S25 FE Chrome → S25 FE Samsung Internet → S23 Chrome → S23 Samsung Internet. For each combination, in this order:

1. Record `os_version` and `browser_version` first, then clear the site's data. Open the HTTPS address and enter the code (it asks before any question; step 20 is covered here for free).
2. Step 1: online load. Step 3: airplane mode on, reload; the shell and question must return.
3. Step 4: answer offline with a synthetic explanation; queue count one. Step 5: airplane mode off; the queue drains with a clearly labelled MOCK outcome.
4. Steps 6 and 7: draft with the caret mid-text, toggle connectivity, refresh. Step 8: queue an answer offline, swipe the browser away, reopen online.
5. Step 9: second tab shows the read-only banner (or the single-tab warning where Web Locks is missing).
6. Step 14: Bridge Practice offline. Step 18: write down the exact storage wording shown.
7. Write the results into that device's CSV immediately, while the screen is in front of you.

**Pass 2 — the remaining steps as time allows:** 2, 10–13, 15, 16, 19–23. Two need arrangement: step 17 stops the server for every phone, so do it last, with all testers told; step 16 needs a second build deployed, so leave it `NOT TESTED` unless you prepared one. Screen-reader runs (step 21) need TalkBack on Samsung and VoiceOver on iPhone; do not describe the app as screen-reader tested on any other basis.

**After:** close the tunnel, stop the server, `unset` the variables and discard the code (`HTTPS_DEMO_RUNBOOK.md` section 8). Search each CSV and every saved screenshot name for the code before you share or commit anything. Keep the CSVs; they are the evidence.

## 4. Stop immediately if

- any protected request answers `200` without the code, or the code appears in an address bar, screenshot, recording or CSV;
- a real child's name, answer or school detail enters the app or a file;
- `npm run preflight` fails after a change;
- someone is about to record a result they did not observe.

## 5. Stop / go gates for what you say on stage

| Claim | GO only when | Otherwise (NO-GO) say |
|---|---|---|
| "This runs through a private HTTPS demo safely" | preflight `PASSED`, the outside checks match the runbook table, provider is `mock`, the code is fresh | "local demo only" |
| "It works offline and recovers when the connection returns" on a given phone | the actual-device offline and reconnect steps pass: for that exact device and browser, mandatory steps 1, 3–9, 14 and 18 are `PASS` in the results CSV with `tester`, `date_ist`, `os_version`, `browser_version` and `https` filled in | NO-GO for any offline-reliability demo or claim: say "designed offline-first and tested in headless Chromium; phones NOT TESTED" |
| "The content is reviewed" | a qualified Odia-medium science reviewer has recorded the decision themselves: their `reviewer_name`, the four checks `PASS` and `review_decision` of `APPROVE` or `APPROVE_WITH_EDITS` in the worksheet; the pack statuses were then changed by hand; `npm run check:content` prints `OK` | NO-GO: every item is `UNREVIEWED_DRAFT` and the demo must say so; do not put it in front of real learners |
| "The model understands Odia" | never from the current evidence (47 synthetic English cases; a live Groq run has not happened) | "mock rule; model evaluation pending" |
| "It works with screen readers" | step 21 passes on TalkBack and VoiceOver | NO-GO; the automated audit is not screen-reader testing |
| "It runs well on low-end phones" | never from these four flagship phones | NO-GO |

These are rules for what you may claim, not results. Until the evidence exists, the honest status of every phone row is `NOT TESTED` and of every content item `UNREVIEWED_DRAFT`.
