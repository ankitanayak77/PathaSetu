# Demo quick card — one page for the operator

**Status:** an operator aid written on 14 Oct 2026 from the app source and the Iteration 11/12 test runs. It is not a rehearsal record, and nothing on it has been run on a phone. Longer material: `NEXTECH_24H_DEMO_STRATEGY.md` (criteria, agenda), `PITCH_SCRIPTS.md` (words), `EVENT_DAY_CHECKLIST.md` (phones and HTTPS). If this card and the app disagree, the app is right; fix the card.

## Start (laptop, mock provider, nothing public)

```bash
npm start          # prints: Pathasetu listening on http://127.0.0.1:4173 provider=mock publicDemo=false node=...
```

Say "provider=mock" out loud if it is on screen. Open `http://127.0.0.1:4173` once while online (the first visit saves the shell and the pack; offline use before that is not supported).

## What you should see, with the exact words on screen

| Where | Exact text | What to say |
|---|---|---|
| Footer | `MOCK PROVIDER · DEMO RULES · NO LIVE AI` | "This is a rule, not a language model." |
| Top right | `PROTOTYPE`, and the connection pill | "Prototype." |
| Under the heading | `Draft demo pack` / `Odia wording awaits teacher review` | "All eight questions and the Odia are unreviewed drafts." |
| Question card | `QUESTION EL01 · CLOSED CIRCUIT` with `UNREVIEWED DRAFT` | "One concept, one question." |
| Answer button | `Check my thinking` (enabled after an option is chosen) | Use synthetic text only, never a real child's. |
| Right column | `AGENT'S PLAN` / `Why this next?`; `YOUR PROGRESS` counters `answers saved`, `pending re-checks` | "The plan explains itself." |
| Offline result | `Saved offline · re-check queued` | "The answer is on the device; the check waits." |
| After reconnect | `Re-check processed · MOCK` and `Updated recommendation` | "Provisional; mastery is never confirmed automatically." |
| Bottom | `Agent decision trace` (open it); `Download trace JSON` | "Every step is recorded here." |
| After five failed re-checks | `Re-check paused · needs attention` and `Retry now` | "Bounded retry, then it asks the learner." |

## Optional: show a real model (only after you have run it once yourself)

See `docs/MODEL_PROVIDERS.md`. Local first: `PATHASETU_MODEL_PROVIDERS=ollama OLLAMA_MODEL=<name from ollama list> npm start`. The footer then reads `CONFIGURED · ollama · <model> · ACCURACY UNVALIDATED` and the plan area names the model that suggested the next question. **This has not been run against a real model by the build.** If the model is slow or down, the screen shows the queued re-check and the honest error; say so, and never describe the mock as a model. Use synthetic text only.

## Routes you can show (`GET /api/health`, `GET /api/session`, `GET /api/pack`, `POST /api/recheck`)

```bash
curl -s http://127.0.0.1:4173/api/health        # {"ok":true,"provider":"mock",...}
curl -s -X POST http://127.0.0.1:4173/api/recheck -H 'content-type: application/json' \
  -d '{"itemId":"EL01","optionId":"A","explanation":"Synthetic demo text only."}'
# -> provider "mock"; diagnosis MISCONCEPTION CURRENT_ACCUMULATES; note says it is an option-linked rule, not language understanding
```

A bad option (`"optionId":"Z"`) returns `{"error":"invalid_option"}`. Say: "a real request to the app's own tool route; the provider is mock, so this is not a model call."

## Three-minute order (rehearse it; the timings are a plan)

1. 0:00 Who and why: Odia-medium Class X learner, shared phone, weak network (no interview is claimed).
2. 0:25 Pick an option, type one synthetic sentence, press `Check my thinking`. Name the mock first.
3. 1:05 Open `Agent decision trace`: point to `plan_selected`, `answer_submitted`, `recheck_complete`. Say what the mock cannot do (it ignores the typed words).
4. 1:40 Offline: DevTools Network → Offline (call it a desktop simulation) → answer → `Saved offline · re-check queued` → back online → `Re-check processed · MOCK`; current question and draft unchanged.
5. 2:25 Close: the evidence file and the open gates (teacher review, phones, live provider). No learning-gain claim.

## Where the evidence is

Current run: `evidence/iteration12/final/` (command log `exit-codes.txt`, `capture.json`, `browser-regression.json`, `accessibility/`, `npm-test.txt`). Mutation check: `evidence/iteration12/mutation/`. Earlier runs, including the Iteration 9 BLOCKED one, stay in their own folders. Quote a number only with its environment.

## Stop conditions (stop repeating the step; use the fallback, never fake it)

- The footer does not say MOCK, or any key or access code is visible: stop, do not present.
- The offline step does not show `Saved offline · re-check queued` on the second try: describe it from the recorded test, say "recorded, not shown live".
- Browser navigation is blocked by the machine's policy: that is BLOCKED, not a pass; show `npm test` output, the routes above and the saved trace instead.
- A question is asked about phones, reviewed Odia, a live model or learning gain: the answer is "not done yet" with the open gate named (`docs/EVENT_DAY_CHECKLIST.md` section 5).
- Rule 4.1 stays UNCONFIRMED; the code was built with AI assistance before the event window. Say it if asked; do not soften it.
