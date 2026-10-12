# Pathasetu phone verification plan

**Do not mark any device/browser combination tested until a human runs these steps on the actual device.** Use the mock provider for offline tests. The content is unreviewed draft material and must not be used with real learners.

## Record for each run

- Tester and date/time (IST)
- Exact device model and OS version
- Browser name and exact version
- URL/host and whether HTTPS was used
- Network path: Wi-Fi, mobile data, hotspot, or airplane mode
- Result per step: PASS / FAIL / BLOCKED / NOT TESTED, with notes
- Screenshot or screen recording, with no keys, learner identifiers or private text

## Required device matrix

| Device | Browser(s) | Current status |
|---|---|---|
| Samsung Galaxy S23 | Chrome, Samsung Internet | NOT TESTED |
| Samsung Galaxy S25 | Chrome, Samsung Internet | NOT TESTED |
| Samsung Galaxy S25 FE | Chrome, Samsung Internet | NOT TESTED |
| iPhone 16 | Safari | NOT TESTED; use HTTPS |

Testing these flagship phones does not establish low-end-phone performance.

## 13-step protocol

1. Clear the site's data, open the URL online, wait for load, and record the connection indicator and current question.
2. Confirm that the service worker has registered where the browser exposes that information. On iPhone, mark this step NOT TESTED if it cannot be observed.
3. Enable airplane mode and reload. Verify that the app shell, current question and cached content return. Record failure if the app says there is no local pack.
4. Offline, choose an answer and enter a synthetic agreed explanation. Submit. Verify a local result and a queue count of one.
5. Disable airplane mode. Verify that the reachability indicator recovers, the re-check queue drains, a clearly labelled MOCK outcome appears, and the next-step recommendation is visible.
6. Select an option and type a draft with the caret in the middle of the text. Toggle airplane mode on/off three times, then let a queued re-check finish. Verify the text, option, focus and caret position remain on the same question and the on-screen keyboard stays open. (Headless Chromium passes this; a phone may behave differently.)
7. Type another draft, wait one second, then refresh. The app stores drafts per question in IndexedDB, so the text and option should return on the same question. Record what actually happens; headless Chromium passes, a phone has not been tested.
8. Queue a synthetic answer offline, close/swipe away the browser, reopen online, and verify automatic queue recovery without a tap.
9. Open a second tab. Verify that the second tab shows the persistent "Read-only session" banner, its controls (including Bridge Practice) are disabled, and it sends no re-check request. If the browser has no Web Locks, verify the persistent "Single-tab protection unavailable" warning instead; do not claim multi-tab protection in that case.
10. Repeat the main journey in each required browser; do not infer Samsung Internet or Safari behavior from Chrome.
11. Type a short synthetic phrase using the on-device Odia script keyboard and transliteration keyboard where available. Check rendering and caret position. This tests input rendering, not linguistic correctness.
12. Repeat a queued re-check using venue Wi-Fi and mobile hotspot; record actual time-to-recheck rather than estimating it.
13. Use Download Trace JSON. Verify the file is saved and inspect it for accidental secrets or sensitive information before retaining it.
14. Bridge Practice offline: with airplane mode on, check that three term-pair options appear with the UNREVIEWED DRAFT badge and the school and English terms hidden in the Language Bridge card. Choose each option, confirm immediate feedback, reveal the source mapping, press Try another, and confirm no network is needed. Open the trace and confirm the attempts are listed.
15. Bridge Practice input: operate it by touch; where a hardware keyboard or screen reader is available, also by keyboard (Tab, Enter or Space) and by screen reader. Record what works. Odia text must render, not appear as boxes.
16. Update behaviour: after deploying a new build, open the installed app online. Verify an "App update ready" notice appears once (not on the very first visit) and one reload runs the new version.

## Acceptance and claim limits

A device/browser combination passes only if all mandatory steps 1, 3–9 and 14 pass, with exceptions explicitly recorded. Report every combination and version actually tested. Do not claim offline capability on any device based solely on HTTP tests, source inspection, or headless Chromium; do not claim language understanding or educational validity from UI testing.
