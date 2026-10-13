# Pathasetu — pitch and demo scripts

Written 13 October 2026. These scripts say only what the evidence supports. Every number and label can be traced in `CLAIM_EVIDENCE_MATRIX.csv`. If a sentence below is not true on the day (for example a phone test has not happened), cut it; do not soften the rule.

**Schedule.** The event page lists a 7-minute live MVP pitch and 5 minutes of CTO questions for the final (Day 2, 10:00 AM–3:00 PM) and a mid-evaluation (GitHub commit audit, working agent-workflow demo, architecture) on Day 1. The public pages disagree about the mid-evaluation hours (shown as 4:00–7:00 PM while Day 1 ends at 6:00 PM). **Use the slot the organisers assigned to your team. None has been given in writing, so treat all timings here as the plan, not the schedule.** Source: <https://www.nirmit.space/events/nextech>.

**Always on screen during the live demo:** the footer label "MOCK PROVIDER · DEMO RULES · NO LIVE AI", the "UNREVIEWED DRAFT" badge and the "Draft demo pack" strip. Do not hide or crop them.

**Words to use / not use.** Use: "workflow", "demo rule", "draft", "provisional", "headless-tested", "not yet tested on phones". Do not use: "fully offline", "understands Odia", "production secure", "low-end tested", "educationally validated", "AI-powered" (alone), "first", "only", "revolutionary".

## A. Short versions

### A0. Three precise lines to have ready (name, data, shared phones)

- **The name.** "Our intended meaning for Pathasetu is a bridge for learning between languages: everyday Odia, school terminology and English science terms. We use the name to express the product's purpose; we are not claiming a formally verified literal translation."
- **Where the words go.** "Progress, drafts and the waiting queue are kept in the phone's browser storage when storage works. When a re-check runs, the answer and the typed explanation are sent to the Pathasetu server; if a hosted model is ever switched on, the question, options and explanation go on to that provider. Today the checker is the demo rule."
- **Shared phones.** "The target setting can include a family phone, but today Pathasetu keeps one local session record and does not safely separate several learners on one browser profile."
- **Permission.** "The team reports that the organisers allowed early work and API use. That is team-reported; the saved message is not in the repository."

### A1. 15-second elevator introduction
"Pathasetu helps an Odia-medium Class 10 student find the wrong idea behind a wrong science answer, gives a small next step, and keeps working when the signal drops. It's an early prototype: tested in software, not yet on phones."

### A2. 30-second product explanation
"Many students learn science in a language different from the one they speak at home, on a shared phone with a weak signal, with no one to ask why they were wrong. Pathasetu is a phone-first helper for Class 10 Electricity. It names the likely misconception behind an answer, shows a next activity, explains why it chose the next question, and keeps the answer in the phone's browser storage when storage works, so it can be checked again after a dropped connection. Today the diagnosis step is a demo rule, the Odia is an unreviewed draft, and it has been tested in a browser, not yet on phones."

### A3. 60-second layman explanation
"Imagine a Class 10 student in Odisha. The textbook says one thing in Odia, the exam paper uses English terms, and at home she speaks something else. She answers a question about electricity wrongly. Nobody is there to ask why. Pathasetu is a small web app on her phone. After she answers and types a few words of her reasoning, it says what wrong idea might be behind it. For example, thinking a bulb uses up the current. It marks that as a guess, shows one small activity to fix it, and tells her why the next question was chosen. If the signal drops, her answer is saved on the phone and checked again when the network returns. A little matching game helps her connect everyday Odia, the textbook term and the English term. Honestly: the checker in our demo is a simple rule, not yet a live language model; the Odia is a draft no teacher has reviewed; we have tested it in a browser and not yet on phones. What we built and tested is the workflow around that checker."

### A4. Opening lines (pick one)
- "A student's phone loses signal at the exact moment she finally has an hour to study. What should the software do?"
- "We didn't build a chatbot. We built a loop that notices, decides, acts, records, and survives a lost connection."

### A5. Closing lines (pick one)
- "What is real today is a tested workflow that survives failure. What is next is the part only others can give us: a teacher's review, real phones, and a first honest evaluation in Odia."
- "We would rather show you exactly what is proven and what isn't, than ask you to trust a demo."

## B. Three-minute technical walkthrough (for a technical visitor at the stall)

| Time | Say | Show |
|---|---|---|
| 0:00–0:20 | "Goal: repair one misconception at a time for an Odia-medium Class 10 learner, offline-tolerant." | Landing page; point to the draft strip and provider label |
| 0:20–1:00 | "Observe state, propose a diagnosis, validate it, update state, choose the next action, write the reason. Proposer is a swappable slot; validator is an allow-list; only two functions write state." | `docs/SYSTEM_ARCHITECTURE.md` diagram, two boxes (phone and server) |
| 1:00–1:50 | "Submit → local rule → validator → save → queue entry → planner picks next question and explains why." | Answer EL01 option A with a typed reason; open **Agent decision trace** |
| 1:50–2:30 | "Offline: same loop with the network off. The re-check waits; five bounded tries, then paused with Retry now." | Browser offline switch; answer; show "pending re-checks 1"; turn network on |
| 2:30–3:00 | "Evidence: 207 unit tests, 100 browser checks in headless Chromium, 462 accessibility checks. Not on phones. No live model call yet." | `evidence/iteration6/final/` folder |

## C. Seven-minute final presentation and live demo

Based on the story order in the Iteration 5 brief: problem and persona → solution → why agentic → architecture → live learning loop → offline/reconnect → evidence → limits and next steps. If the organisers give a different slot, scale each part proportionally.

**Before you start (off stage):** laptop on mains; server started with `npm start` on `127.0.0.1:4173` (or the private HTTPS demo if it has passed `npm run preflight -- --expect-origin …` and the outside checks); browser profile cleared (Site settings → Clear data) so the first load is a true first visit; one earlier visit done online afterwards so the offline shell is cached; browser DevTools **Network → Offline** ready; the access code, if used, typed on a private screen and never shown; a screen recording of a previous run saved as a fallback and labelled "RECORDING". Close all other tabs (a second tab makes the first read-only).

| Time | Part | Say | Exact visible action | If it differs |
|---|---|---|---|---|
| 0:00–0:45 | 1. Problem and persona | Opening line A4. "The brief's example is a Class 9 girl in southern Odisha who shares a phone and has a weak signal. We chose a Class 10 Odia-medium learner studying Electricity for her board exam. 'Geography' for us means her access, not the subject. Illustrative persona, not a user study." | Slide with the one-line problem and the persona; no app yet | — |
| 0:45–1:15 | 2. Solution | "Pathasetu names the wrong idea behind a wrong answer, gives a next step, bridges everyday Odia, textbook Odia and English terms, and works through a dropped signal." | Show the app's landing page: headline, draft strip, provider label | Read the labels aloud |
| 1:15–2:00 | 3. Why this is agentic | "A quiz marks. A chatbot replies. Here the software holds a goal, observes the learner's state, picks a next action, uses tools, and records why. It's a deterministic workflow with a bounded slot for a model. Not multi-agent, no framework — nothing to install." | Slide: loop `observe → propose → validate → act → plan → trace`; point to the plan card "Why this next?" | If asked "is it LLM?": "In this demo the proposer is a rule; the adapter for a hosted model exists but has never been called live." |
| 2:00–2:45 | 4. Architecture | "Almost everything runs on the phone. The server serves files and the question pack and does the second check. The model slot sits behind a validator. The model can never write the learner's state." | Show `SYSTEM_ARCHITECTURE.md` Mermaid diagram (phone box, server box, dashed model box) | Skip the table; point at three arrows |
| 2:45–4:15 | 5. Live learning loop | "Question one. I pick the wrong option and give a reason." | (1) Show why EL01 was first on the plan card. (2) Pick option **A**, type "The current keeps building up in the wire." (3) Press **Check my thinking**. (4) Read "Possible concept gap — provisional" and the "Next learning action". (5) Open **Agent decision trace**. (6) Point at **Continue to EL02 →** and say it does not move by itself. | Headless runs recommended EL02 after answering EL01 with A. If your screen shows another, say what it shows and why (the plan card states the reason). |
| 4:15–5:30 | 6. Offline, reconnect, Bridge Practice | "Now I lose the network." | (1) DevTools **Network → Offline**; pill says OFFLINE. (2) Press **Continue**, answer the next question; point to "Saved offline · re-check queued" and "pending re-checks 1". (3) Do **Bridge Practice**: pick a pair, read the feedback, **Reveal the source mapping**, then show the trace line with `network:false`. (4) Network back **Online**; wait for "Re-check processed · MOCK"; point at the plan card's updated recommendation and say the open question and typed text did not move. | The re-check may take a few seconds. Fill the time with the trace explanation. |
| 5:30–6:10 | 7. Evidence | "207 unit tests, 100 browser checks, 462 accessibility checks. All in headless Chromium on Linux. The team's own managed machine blocked browsers by policy, so those are recorded as blocked. Evaluation: 47 English cases we wrote; 34 agree with our labels; the rule abstained on only 2 of 12 unclear cases. That is a weakness we know." | Slide of the evidence table (numbers from `evidence/iteration6/final/`) | Do not add numbers that are not on the slide |
| 6:10–7:00 | 8. Limits and next | "Before you ask: the diagnosis here is a rule; no live model call has been made; the Odia is a draft no teacher has reviewed; no phone has run it; the code was built with AI assistance on 12–13 October, before the event window, and we are being open about that. Next: teacher review, phones, an Odia evaluation. Closing line A5." | Slide: three limits, three next steps | — |

**Do not say during the demo:** "fully offline", "works on all phones", "understands what the child wrote", "the AI explains", "teacher-approved".

## D. Two-minute mid-evaluation checkpoint

The event page says the checkpoint covers a GitHub commit audit, a working agent-workflow demo and the architecture. Plan:

| Time | Show | Say |
|---|---|---|
| 0:00–0:25 | GitHub (or `git log`): the history | "Full history, nothing rewritten. It began from an AI-generated archive on 12 Oct (hash in the first commit message). Every commit is authored by the AI-assisted build; here is what each of us did: *[team: fill in truthfully]*. The team reports that the organisers allowed early work (team-reported; the saved message is not in the repository), and rule 4.1 says code is built during competition hours, so we say it openly." |
| 0:25–1:15 | Live: answer EL01 option A with a reason, open the trace | "Observe, propose, validate, act, plan, trace." |
| 1:15–1:40 | Network offline → answer → online | "Queued, re-checked, replanned." |
| 1:40–2:00 | Architecture diagram | "Phone box, server box, model slot behind a validator." |

## E. Five-minute CTO Q&A reference sheet

Use the bank (`JURY_QA_BANK.md`). Most-likely first; spend the first 30 seconds of any hard answer on what is true.

| Likely question | Bank | Core of the answer (≤20 s) |
|---|---|---|
| "Is an LLM actually called?" | Q32, Q34, Q40 | "Not in this demo. The adapter exists and has only run against a fake server. Credentials weren't available; the live run is blocked, not done." |
| "Is this just rules?" | Q40 | "The diagnosis step in the demo is. The workflow around it — state, validator, queue, retry, recovery, trace — is what we engineered and tested." |
| "Why not an agent framework / multi-agent?" | Q29–Q31 | "A deterministic loop is auditable and works offline. Nothing is imported; package.json has no dependencies." |
| "What's agentic here?" | Q23–Q26 | "Goal, state, planner, validator, executor, trace, loop." |
| "What about Odia, Kui and voice?" | Q5, Q68, Q70 | "Odia draft text and a term bridge, not reviewed. No Kui, no voice." |
| "Did you test on phones?" | Q81, Q82 | "Not yet; headless Chromium only. Plan and sheet are ready." |
| "Is it secure?" | Q91–Q98 | "Demo-grade: a shared code, failed-attempt throttle, origin allow-list; not production authentication; no independent review." |
| "Was it built here?" | Q127, Q142 | State the facts of provenance; ask for written confirmation. |
| "What's your weakest part?" | Q120, Q124 | Volunteer it. |
| "Does it help learners?" | Q15, Q19, Q109 | "Unknown; no learner has used it. Here is how we'd find out." |

Rules for the Q&A: one speaker; if you do not know, say "we haven't tested that"; point to the evidence folder instead of improvising numbers; never contradict the claim matrix.

## F. When the demo breaks

| What breaks | What to do | What to say |
|---|---|---|
| Browser tests/permissions blocked on the laptop (`ERR_BLOCKED_BY_ADMINISTRATOR`) | Open the app in a normal browser window (not a test harness); if local navigation itself is blocked, use the recording | "This laptop's browser policy blocks local pages. This is a recording of the same build from <date>; it is not a live run." |
| Server won't start | Read the error; most likely a port in use or a weak/missing access code in public mode; start without public mode on `127.0.0.1` | Say exactly what failed. |
| Tunnel or HTTPS host down, or the code is lost | Run the local demo on the laptop; do not improvise a new tunnel on stage | "The phone demo depends on a network we don't control; here is the same app locally." |
| The re-check never finishes | Show the queue status card: "Re-check waiting … attempt N of 5" and **Retry now**; open the trace | "This is the bounded-retry behaviour working: the answer is safe." |
| Second tab shows "Read-only session" | Close other tabs, reload | Explain the single-writer lock; it is a feature. |
| Odia text shows as boxes | Switch to a device/browser with an Odia font; otherwise describe the problem | "The device has no Odia font; we bundle none. Rendering on phones is untested." |
| A judge asks for a live model | Say it has not been called; offer the evaluation plan | Never switch providers on stage. |
| Fallback recording | Start it with a visible caption "RECORDING — not live". Keep the footer label visible in the recording. | Say the date and what condition made you use it. |

Keep the provider on **mock** for every phone and stage demo unless a live run has been deliberately approved and evidenced beforehand. Show the trace and the evidence folder when something fails: they are the honest answer.

## G. Rehearsal record

The 8-step story (unlock; why this question; answer and diagnosis; airplane mode; queue and restore; re-check, failure, replanning; Bridge Practice offline; provider status and limits) is mapped to the automated checks that exercised each step in `evidence/iteration6/final/REHEARSAL_MAPPING.md` (updated from the Iteration 5 mapping in `evidence/iteration5/final/`). That mapping is **headless Chromium evidence only**; a human rehearsal on the event laptop and phone is **NOT DONE** and should be done and timed before the event.
