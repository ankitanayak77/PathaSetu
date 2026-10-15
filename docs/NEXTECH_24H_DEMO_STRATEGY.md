# Pathasetu — NEXTECH 2.0 24-hour demo strategy

**Prepared:** 14 October 2026 (IST), Iteration 11. **Basis:** the three photographed pages of the NEXTECH 2.0 problem statement and photographed 14–15 October agenda supplied by the team. The text below is a working transcription of those images, not a claim that the organizer's live webpages were independently reconciled in this pass. **Field size:** the team reports approximately 50 competing teams; this is team-reported, not independently verified. **Status:** planning aid, not an official scoring sheet.

## 1. Strategy in one sentence

Compete on a *single defensible learning journey* that visibly shows an agent selecting a next action, using the application’s real tools, explaining its decision, surviving a network interruption and preserving the learner's work—not on screen count, framework name-dropping, or unverified claims about AI or learning gain.

About 50 teams competing makes clear differentiation and low demo risk sensible priorities, but it does not reveal the other teams' quality, their projects or the probability of ranking. Do not estimate placement from team count alone.

## 2. What the photographed brief asks for

### Core criteria (must-have)

| Criterion in the handout | What judges are looking for | Pathasetu evidence today | Gap or honest limit | Demo action |
|---|---|---|---|---|
| Problem understanding | Clear learner, the language/geography gap and why the selected problem matters | Target is an Odia-medium Odisha learner studying Class X Electricity; the UX and project guide state weak connectivity/shared-device constraints | The handout's reference composite is a **fictional Class 9 Kui-speaking learner** in a tribal-majority block. Pathasetu is narrower (Class X Odia-medium); don't present the composite as a real interview or claim it represents every tribal learner | State the target in one sentence and connect each screen to one named failure: unfamiliar terms, weak network, no personalised follow-up |
| Technicalities | Sound architecture, depth of agentic implementation, decision loop/state and reliable working MVP | Deterministic controller, validator, planner, trace, durable retry queue; application routes include `/api/session`, `/api/pack` and `/api/recheck`; the re-check route can be demonstrated with the mock provider | Mock diagnosis is option-linked, not semantic interpretation of the free-text explanation; headless tests are not a real-phone test; no live provider call has been validated | Show the tool/route calls and trace in order; explicitly say which result is MOCK; demonstrate a re-check and queue outcome rather than a static screen |
| Presentation | Clear live demo and confident, evidence-backed answers | Pitch scripts and jury Q&A are in `docs/PITCH_SCRIPTS.md` and `docs/JURY_QA_BANK.md` | A script is not a timed rehearsal; no physical-device rehearsal is recorded in the evidence | Assign one narrator and one operator; rehearse from a reset state with a visible stop/fallback decision |
| Pitch deck | Story linking problem, users, solution, architecture, impact and feasibility | Existing pitch material is documented in the repository | The actual final deck, placeholders and uploaded version have not been verified as part of this iteration | Check the real file and every slide against the claim-evidence matrix; remove unsupported numbers or claims before submission |

### Bonus criteria (add-ons, not substitutes for core criteria)

| Bonus in the handout | Current status | Most credible demonstration or next action | Do not claim |
|---|---|---|---|
| Regional-language support | Odia-script text and the three-level everyday-Odia / school-Odia / English bridge exist, but all learning items and Odia strings are `UNREVIEWED_DRAFT`; input is text, not voice | Ask a qualified Odia-medium Science teacher to review the exact eight items and strings; test actual Odia typing/rendering on a phone if available | Native-quality translation, validated terminology, voice support or model understanding |
| Ease of use and accessibility | Headless automated accessibility tests are recorded in prior iterations; no current first-time learner observation or screen-reader run is recorded | Run a first-use task with a consenting adult tester or qualified reviewer; run keyboard and available screen-reader checks | That automated axe/static checks prove usability for low-digital-confidence learners |
| Offline compatibility | Shell/content caching, local queue, bounded retries, reconnect and state preservation are implemented and headless-tested in earlier evidence | Demonstrate offline-after-first-visit, answer queue, reconnect, re-check and restored plan; test on a real phone before claiming phone behaviour | First-visit offline use, fully local semantic diagnosis, uninterrupted service on every browser or proven low-end-device support |
| Agentic approach/framework | The implementation uses a custom deterministic workflow, not LangChain/AutoGen/CrewAI/LlamaIndex/Smolagents; it records planning and tool outcomes | Explain why deterministic orchestration is the fit for a bounded school concept and intermittent connectivity: reproducible actions, allow-listed diagnosis, inspectable traces, predictable offline fallback and lower dependence on open-ended model planning | Use of a third-party agent framework, autonomy, or a live LLM unless that specific component is actually present and verified |

## 3. Minimal story that matches the brief

**One-sentence problem:** “An Odia-medium learner on a shared phone can lose access to understandable science support when the network drops, and may not know what to study next.” This is the team's scoped problem statement, not a statistic or a validated population-wide conclusion.

**One-sentence solution:** “Pathasetu runs a bounded learning workflow: it selects an Electricity question, validates a provisional option-linked result, records why it chose the next step, preserves queued re-checks when offline, and re-checks when connectivity returns.”

**What is agentic here:** the controller chooses an action and next item, calls its validator/planner and persistence/re-check paths, records a trace and handles failure/recovery. For HTTP evidence, use the routes implemented in `src/server/server.js`: `GET /api/session`, `GET /api/pack` and `POST /api/recheck`. State accurately that a real application request is not the same thing as a live model call; the default provider remains MOCK.

**Why deterministic rather than autonomous:** the current task has a small, known action space, a fixed content allow-list and strict correctness/privacy limits. A deterministic controller is auditable and can make offline/local progress without guessing. The supplied brief says neither deterministic nor autonomous is inherently better; the choice must fit the problem and be justified. Do not add a framework just to list its name if it makes the 24-hour deliverable less reliable.

## 4. Three-minute live demo run-of-show (proposal; must be rehearsed)

1. **0:00–0:25 — user and gap.** Name the target learner and explain shared-device/weak-network context. Do not claim an interview took place.
2. **0:25–1:05 — one question, one action.** Show the Electricity item and select an option; enter only synthetic demo text. Point out the draft badge. Say “MOCK” before the result appears.
3. **1:05–1:40 — decision trace and tool calls.** Show the route/tool sequence, selected concept and reason for the next recommendation. Explain the deterministic rule and the exact limitation: free text is not semantically interpreted by the mock.
4. **1:40–2:25 — offline and recovery.** After the app has loaded once online, switch the test connection off, submit/queue the action, restore connectivity, and show the queued re-check and preserved current question/draft. Prefer a real phone for the bonus; a DevTools simulation must be described as a desktop simulation.
5. **2:25–3:00 — close on evidence and limits.** State the automated test evidence for the environment actually run. Mention the eight draft items and what teacher/device/provider checks remain open. Do not announce learning gain or mastery.

If any step fails, stop repeating it and use the documented fallback: demonstrate the local mock flow, inspect the existing saved evidence and trace, and describe offline behaviour only to the level already tested. Never fake a network toggle, API call, model output or device result. The final demo must be timed with the actual deployed/build environment.

## 5. Agenda transcribed from the photographed handout

### Day 1 — Wednesday, 14 October 2026

| Time shown | Activity shown | Engineering consequence |
|---|---|---|
| 7:00–8:00 AM | Registration/check-in | Team and identity logistics; not a coding deliverable |
| 8:00–9:00 AM | Participant verification, seating and preparation | Confirm access to devices and power |
| 9:00–9:15 AM | Hackathon commencement, inauguration and lamp lighting | Attend opening |
| 9:15–9:30 AM | Briefing and instructions | Listen for live rule/scope updates; record only what organizers actually say |
| 9:30 AM onwards | Breakfast/refreshments; development continues | Start a clean, reproducible baseline and assign roles |
| 10:30 AM | Official GitHub repository/submission link shared | Follow the actual supplied repository instructions and preserve traceable history |
| 10:30 AM–12:00 PM | Development | Stabilize the core flow; don't start unrelated features |
| 12:00–2:00 PM | Lunch window; project work can continue | Take a short break; preserve tested build |
| 2:00–3:00 PM | Development; prepare mid-evaluation checkpoint | Prepare working skeleton, agent loop, architecture and bonus-feature plan |
| 3:00 PM onwards | Mid-evaluation begins as scheduled; checkpoint, not elimination | Demonstrate working progress and decision trace |
| 8:00–10:00 PM | Dinner window; dinner service ends at 10:00 PM | Rehearse before overnight work; keep a known-good copy |
| 10:00 PM onwards | Overnight development continues | Only low-risk changes; retest after every change |

### Day 2 — Thursday, 15 October 2026

| Time shown | Activity shown | Engineering consequence |
|---|---|---|
| 7:00–8:00 AM | Final development/wrap-up | Freeze features, run final checks and prepare submission |
| 8:00 AM | GitHub submission access closes; all pushes must finish before this | Treat 8:00 AM as a hard deadline; don't depend on a last-second push |
| 8:00–9:00 AM | Final setup; no further code pushes unless authorised | Rehearse only, verify the working build and deck |
| 9:00 AM | 24-hour hackathon concludes; final evaluation begins | Start from a known state |
| 9:00 AM–12:30 PM | Final evaluation, demonstrations and jury interaction | Keep demo under control and answer from evidence |
| 12:30–2:00 PM | Break | Preserve materials |
| 2:30 PM | Results announced | Follow organizers' instructions |
| 3:00–5:30 PM | NIRMIT 2.0 opening ceremony and related programme | Attend as directed |
| By 5:30 PM | Departure | No project dependency |

Treat this schedule as the printed handout supplied by the team. The web rule and event pages previously had conflicting date text; this transcription does not itself constitute a written organizer ruling about Rule 4.1 or pre-event code eligibility.

## 6. Priority order for a field of approximately 50 teams

1. **Prove the must-have workflow.** One learner, one chapter, one clear agent loop, inspectable trace, and reliable recovery beat a wide but shallow feature list.
2. **Use evidence as the differentiator.** Show exact calls, traces, exit codes and limits. Keep source claims, team-reported facts, test results and inference separate.
3. **Protect the demo from failure.** Rehearse from a clean state; prepare the offline fallback; keep a known-good copy; avoid new dependencies unless a specific judging gap cannot otherwise be met.
4. **Treat language as a quality gate, not decoration.** A prominent Odia badge cannot substitute for review by a qualified speaker/teacher. No voice is implemented; do not claim voice support.
5. **Do not chase competitor features blindly.** The Iteration 8 landscape is a public-page desk review (`docs/COMPETITIVE_LANDSCAPE.md`), not hands-on testing. Complementary products and broader AI tutors already exist. Pathasetu should show evidence for its combination of constrained concept repair, source status and offline recovery instead of claiming “first”, “only” or “unique”.
6. **Use the mid-evaluation to validate the story.** Bring the working skeleton, agent-loop diagram, actual tool-call trace, bonus feature choices and the known-gaps list. Do not wait until final judging to reveal the MOCK/content-review limits.

## 7. Final pre-demo go/no-go checklist

- [ ] `npm test`, `npm run check`, `npm run check:content`, `npm run preflight`, `npm run doctor`, `npm run capture`, `npm run e2e` and `npm run a11y` have fresh outputs or are clearly marked BLOCKED with the exact reason.
- [ ] The app visibly identifies the provider as MOCK; no API key is in the browser, deck, trace or screenshot.
- [ ] All eight Electricity items still say `UNREVIEWED_DRAFT` unless a qualified reviewer has actually completed the defined review workflow.
- [ ] No board other than BSE Odisha HSC Class X is presented as implemented; no board picker is implied.
- [ ] The demonstrator can point to the `plan_selected`, answer, re-check and retry/failure trace events and explain why each action ran.
- [ ] Offline mode begins only after the required first online visit; queue-and-reconnect has been demonstrated in the same environment being claimed.
- [ ] Any phone/browser listed as tested has an actual completed results row with model, OS, browser version, date and tester.
- [ ] Pitch deck claims map to `docs/CLAIM_EVIDENCE_MATRIX.csv`; the final deck file was opened and checked, not inferred from an earlier deck.
- [ ] GitHub deadline and organizer instructions are followed; the provenance record and unresolved Rule 4.1 status remain honest.

## 8. Claims this document explicitly forbids

Do not claim: “50 teams verified” (team estimate only); a particular rank or probability of winning; first/only/unique product; a live model call; semantic free-text understanding from the mock; reviewed Odia or Science items; language support on all boards; real-phone compatibility; full offline first-use; learning gain; adaptive mastery; organizer approval that is not saved in writing; or that an automated check proves competition eligibility.
