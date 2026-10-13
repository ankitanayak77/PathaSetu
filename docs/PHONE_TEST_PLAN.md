# Pathasetu phone verification plan

**Status: no phone has been tested. Every cell in `docs/PHONE_TEST_RESULTS_TEMPLATE.csv` is `NOT TESTED`. Do not mark any device/browser combination tested until a human runs these steps on the actual device.** Use the mock provider for offline tests. The content is unreviewed draft material and must not be used with real learners.

## Record for each run

- Tester and date/time (IST)
- Exact device model and OS version
- Browser name and exact version
- URL/host and whether HTTPS was used
- Network path: Wi-Fi, mobile data, hotspot, or airplane mode
- Result per step: PASS / FAIL / BLOCKED / NOT TESTED, with notes
- Screenshot or screen recording, with no keys, learner identifiers or private text

## Required device matrix

| Device | Browser(s) | Needs | Current status |
|---|---|---|---|
| Samsung Galaxy S23 | Chrome, Samsung Internet | HTTPS or `localhost` via USB reverse-forwarding | NOT TESTED |
| Samsung Galaxy S25 | Chrome, Samsung Internet | HTTPS or `localhost` via USB reverse-forwarding | NOT TESTED |
| Samsung Galaxy S25 FE | Chrome, Samsung Internet | HTTPS or `localhost` via USB reverse-forwarding | NOT TESTED |
| iPhone 16 | Safari | **HTTPS is required** (no `localhost` shortcut on the phone) | NOT TESTED |

That is seven device/browser combinations. Each one is tested separately: nothing is inferred from Chrome, from another Samsung model, or from headless Chromium. Installed-app (home-screen) behaviour is a further variant to record, not a substitute for the in-browser run.

Testing these flagship phones does not establish low-end-phone performance.

## 23-step protocol

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
17. Server unreachable while the phone has Wi‑Fi: stop the server process (or block the host) so the phone is online but the app cannot be reached. Submit a synthetic answer. Verify it is saved locally, the queue shows one pending re-check and the connection indicator does not claim sync is available. Restart the server and verify the queue drains without a tap. (The bounded-retry pause and **Retry now** button are covered by headless tests only. Seeing the paused state on a phone needs a deliberately failing provider; record it as NOT TESTED unless you arranged one.)
18. Storage and persistence reporting: after the first saved answer, read the storage line and the persistent-storage line and write down the exact wording shown (granted, denied, unsupported or not yet requested). Verify the wording promises nothing about retention. On iPhone Safari, note that websites not added to the Home Screen can have script-writable storage cleared after a period of inactivity; record what you actually observe, not what is documented.
19. Storage failure honesty: open the app in a private or incognito tab and, if the browser blocks IndexedDB there, verify the app still works and the interface says progress is **not saved to this device**. If the browser allows storage, record that and mark the step NOT TESTED for the failure case.
20. Access overlay (only when the server has `PATHASETU_DEMO_ACCESS_CODE`): verify the overlay appears before any question, a wrong code is refused, the right code unlocks and loads the first question without a manual reload, and the code is not visible in the address bar. Closing the tab and reopening should ask for the code again.
21. Accessibility settings: set the system font size to its largest and the display size to its largest and reload; verify nothing is cut off or overlapping and every button is still reachable. Rotate to landscape. With TalkBack (Samsung) or VoiceOver (iPhone) on, move through the question, the options, the explanation box and **Check my thinking**; verify each control is announced with a sensible name and the result and connection changes are announced. With an external keyboard (if available) verify Tab order and a visible focus ring. The automated audit (`npm run a11y`) does none of this on a real device.
22. Trace export content: open the downloaded JSON and confirm the typed explanation text is replaced by a `redacted` marker with a character count, there is no access code, no API key, no learner name, and the file states that content is `UNREVIEWED_DRAFT`.
23. Home-screen install: add the app to the Home Screen (iPhone Safari: Share → Add to Home Screen; Android: Install app or Add to Home screen), launch it from the icon with airplane mode on, and verify the shell, current question and saved progress load. Record whether the installed app and the browser tab share the same saved progress; do not assume they do.

## HTTPS access for the phones

Service workers, installability and (on iPhone) a trustworthy offline test need a secure origin. Nothing below has been deployed or run from this repository's build environment; verify each tool's current instructions before relying on it.

- **Android over USB (no certificate needed):** enable USB debugging, connect, open `chrome://inspect` on a computer running Chrome, forward the phone's port 4173 to the computer's `127.0.0.1:4173` ("Port forwarding"), then open `http://localhost:4173` on the phone. `localhost` is treated as a secure origin by Chrome. This path does not apply to iPhone and has not been verified for Samsung Internet.
- **Any phone, HTTPS tunnel or reverse proxy:** run `npm start`, then expose `127.0.0.1:4173` through an HTTPS tunnel or reverse proxy you control (for example Cloudflare's `cloudflared tunnel --url http://127.0.0.1:4173` for a quick tunnel). A quick tunnel's URL is reachable by anyone who has it. Therefore set `PATHASETU_DEMO_ACCESS_CODE` (16+ characters, random) and, outside local development, `NODE_ENV=production` with `PATHASETU_ALLOW_DRAFT_DEMO=true`; the access code then protects the draft question pack and the re-check route. Keep `PATHASETU_MODEL_PROVIDER=mock` for phone tests.
- **Proxies that rewrite the Host header:** the server refuses a POST whose `Origin` host differs from the `Host` it receives. If the proxy cannot preserve the original `Host`, list the exact public origin in `PATHASETU_ALLOWED_ORIGINS` (for example `https://your-demo-host.example`). Symptom if missing: re-checks fail with `origin_not_allowed` (HTTP 403) while the page itself loads.
- **iPhone Safari:** use the HTTPS URL only. Record the URL scheme in the results sheet.
- Never put a provider key, an access code or a real learner's text in a screenshot, a recording, a URL or the results sheet.

## Recording results

Copy `docs/PHONE_TEST_RESULTS_TEMPLATE.csv` (one row per device/browser/step, all `NOT TESTED`) and fill in `result` (PASS / FAIL / BLOCKED / NOT TESTED), `tester`, `date_ist`, `os_version`, `browser_version`, `https` (yes/no), `network`, `evidence_ref` and `notes` for each row you actually run. Leave a row `NOT TESTED` if you did not run it. Regenerate a blank template with `npm run generate:phone-matrix` after editing this plan.

## Acceptance and claim limits

A device/browser combination passes only if all mandatory steps 1, 3–9, 14 and 18 pass, with exceptions explicitly recorded. Steps 2, 10–13, 15–17 and 19–23 are recorded but do not by themselves decide a pass: step 10 is the instruction to repeat the journey per browser, and steps 2, 19 and 20 depend on what the browser exposes or how the server is configured. Report every combination and version actually tested. Do not claim offline capability on any device based solely on HTTP tests, source inspection, or headless Chromium; do not claim language understanding or educational validity from UI testing; do not claim low-end-phone performance from flagship phones; do not claim screen-reader support from the automated audit.
