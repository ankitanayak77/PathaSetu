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
6. Select an option and type a draft. Toggle airplane mode on/off three times. Verify the text, option and focus remain associated with the same question.
7. Type another draft and refresh. Record whether it survives; current intended behavior permits unsent in-memory draft loss after full reload, so do not mark preservation as a pass unless implemented and tested.
8. Queue a synthetic answer offline, close/swipe away the browser, reopen online, and verify automatic queue recovery without a tap.
9. Open a second tab. Verify that the app either enforces a single writable session or clearly blocks/warns on a safe fallback; do not silently claim multi-tab protection if unsupported.
10. Repeat the main journey in each required browser; do not infer Samsung Internet or Safari behavior from Chrome.
11. Type a short synthetic phrase using the on-device Odia script keyboard and transliteration keyboard where available. Check rendering and caret position. This tests input rendering, not linguistic correctness.
12. Repeat a queued re-check using venue Wi-Fi and mobile hotspot; record actual time-to-recheck rather than estimating it.
13. Use Download Trace JSON. Verify the file is saved and inspect it for accidental secrets or sensitive information before retaining it.

## Acceptance and claim limits

A device/browser combination passes only if all mandatory steps 1, 3–6, 8 and 9 pass, with exceptions explicitly recorded. Report every combination and version actually tested. Do not claim offline capability on any device based solely on HTTP tests, source inspection, or headless Chromium; do not claim language understanding or educational validity from UI testing.
