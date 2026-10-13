# Pathasetu — jury and CTO question bank

Written 13 October 2026. 126 anticipated questions in the order the team listed them, then further questions the repository and the official rules exposed (Q127 onward). Each answer has four parts:

- **Say (10–20 s):** what to say aloud, in everyday words.
- **Technical:** the deeper answer a CTO can check against the code.
- **Evidence:** the file, test, evidence folder or official page that backs it, with the status label from `PROJECT_GUIDE_PLAIN_LANGUAGE.md` section 0.
- **Avoid / status:** the exaggeration to avoid and the safer wording, or the honest status (NOT TESTED, NOT REVIEWED, NOT IMPLEMENTED, UNKNOWN).

Short spoken answers should be learned. The technical lines should be understood, not memorised. If you do not know, say "that is not tested yet" — every `NOT TESTED` below is true on 13 Oct 2026.

Official sources: problem PDF <https://www.nirmit.space/docs/Nextech2.0_Problem_Statement_BW.pdf>, event page <https://www.nirmit.space/events/nextech>, rules <https://www.nirmit.space/rules>. Test numbers (Iteration 6 final): 207 unit tests, 19 capture checks, 100 browser checks and 462 accessibility checks, run on 13 Oct 2026 in a Linux sandbox with headless Chromium 141 and Node 22.22.0 (`evidence/iteration6/final/`). Earlier figures are history: Iteration 5 final had 198 unit tests and 95 browser checks, and the Iteration 4 baseline had 182 unit tests (`evidence/iteration5/`). None of this ran on a phone, and browser navigation was blocked on the team's managed machine and in a second audit environment, so those browser results are not reproduced there.

## Problem and user

### Q1. What is the problem statement in our own words?
**Say (10–20 s):** The brief asks for an education tool, with software that plans and acts by itself, for learners who are held back by language and by where they live. We picked an Odia-medium Class 10 student who studies electricity on a shared phone with weak signal.
**Technical:** The PDF title is "Agentic EdTech for Regional Language & Geography". It requires an agentic core that plans, decides, uses tools and acts toward a learning goal, and it names language, device sharing, connectivity, personalisation and missing follow-up as barriers. It allows teams to choose their own user.
**Evidence:** official rule/brief — problem PDF (URL above). Repository: `docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md` section 1.
**Avoid / status:** Do not say the brief asks for a chatbot or for a particular framework. It does not.

### Q2. What exact learner problem are we solving?
**Say:** A learner gets a science question wrong and nobody tells them which wrong idea they hold, and a dropped connection makes things worse. We name the likely wrong idea and give the next small step, saving the work if the signal goes.
**Technical:** The unit of the problem is one misconception per answer. Each wrong option in the pack is linked to a listed misconception ID (for example `CURRENT_CONSUMED_BY_COMPONENT` for "the bulb uses up the current"). The agent proposes it, a validator checks it, and the learner sees a provisional label plus a remediation activity. The offline part is the queue and local storage.
**Evidence:** `content/electricity-pack.json`; `src/core/agent.js`; `tests/agent.test.js`. implemented; unit-tested; browser-tested. The size of this problem among real learners: **unknown** (no user research).
**Avoid / status:** Do not say "we interviewed students" or "teachers told us". No such evidence exists in the repository.

### Q3. Who is the target user today?
**Say:** One Odia-medium Class 10 student preparing for the board exam in Science, on a shared smartphone with an unreliable connection, working on the Electricity chapter.
**Technical:** Grade, medium, subject and topic come from the pack header (`odisha-class10-electricity-demo-v1`, Science, Electricity, Class 10, Odia-medium). Device and connectivity are assumptions, not measurements.
**Evidence:** `content/electricity-pack.json`; `docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md` section 1.3. The assumptions are **not tested** with real learners.
**Avoid / status:** Not "all rural students", not "all of Odisha". Not supported: other grades, subjects or languages; teachers; parents.

### Q4. Why Class 10 and why Electricity?
**Say:** It is a scoping choice. Class 10 is a board year, and Electricity has well-known misconceptions that eight questions can cover well enough to demonstrate the loop.
**Technical:** The pack has four concepts, two questions each: closed circuit, energy transfer, Ohm's law, resistance combinations. Eight items is the size that allowed every wrong option to carry a named misconception and every item to have a bilingual bridge.
**Evidence:** `content/electricity-pack.json` (8 items). The reasoning is the team's scoping decision, not research. content-reviewed: no.
**Avoid / status:** Do not claim Electricity is the hardest chapter or a measured pain point. Do not claim the questions match the BSE Odisha syllabus: **not reviewed** by a teacher.

### Q5. Why Odia and English technical terms?
**Say:** In an Odia-medium school the textbook says one thing, the exam paper and reference books often use English terms, and at home the child speaks something else. The bridge connects the three.
**Technical:** Each item has a `bridge` object with an everyday Odia sentence, the school Odia term and the English term. The Language Bridge card shows them; Bridge Practice makes a matching exercise from them.
**Evidence:** `content/electricity-pack.json` (`bridge`), `src/core/bridge.js`, `tests/bridge.test.js`, e2e K1–K10. content-reviewed: **no** (all `UNREVIEWED_DRAFT`).
**Avoid / status:** Do not say the Odia is correct or natural; no Odia-medium teacher has seen it. Safer: "draft Odia wording awaiting teacher review".

### Q6. What does "Geography" mean in this project?
**Say:** The learner's place and access: weak signal, expensive data, one shared phone. We are not teaching the subject Geography.
**Technical:** The product responds to access context by working offline-first: a service worker for the shell, IndexedDB for state, a queue for server-dependent work, and reachability probing rather than trusting the browser's online flag.
**Evidence:** `docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md` section 1.4; `public/sw.js`; `src/core/storage.js`.
**Avoid / status:** Do not imply it adapts to a learner's district, language variety or region. Nothing in the code uses location.

### Q7. How is this connected to the official fictional Kui-speaking Class 9 reference case?
**Say:** We took the setting: rural Odisha, Odia teaching, English textbooks, a shared phone and weak signal. We chose a different learner: Class 10, no Kui.
**Technical:** The PDF's example is Sunita, Class 9, Kui at home, a family phone for about an hour each evening, weak signal, limited data and an overloaded teacher. Pathasetu addresses the shared-phone and connectivity parts and the Odia-to-English term gap. It does not address Kui, or the teacher side.
**Evidence:** official rule/brief — problem PDF. `docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md` section 1.3.
**Avoid / status:** Never say we support Sunita's case fully. Kui is **NOT IMPLEMENTED** (no Kui text, no language switch).

### Q8. What is different between that official example and our user?
**Say:** Grade (10 not 9), no Kui, and we cover one chapter, not a whole school load. The PDF explicitly allows teams to pick another user as long as the depth is comparable.
**Technical:** Our depth is a working loop, state, offline queue, and trace for one chapter. Comparable depth is for the jury to judge.
**Evidence:** official rule/brief — the PDF says teams may choose their own user. Repository: pack header.
**Avoid / status:** Do not claim "comparable depth" as settled; say "we believe our loop is as deep as we can show in the time, you can judge".

### Q9. What learner assumptions are not validated yet?
**Say:** We have not tested with any learner. We assume they own or share a smartphone, can read the English and Odia text, and will type a short reason.
**Technical:** Unvalidated: device type and browser, Odia font rendering, reading level of the prompts, willingness to type explanations (the explanation field is optional), session length, shared-phone behaviour (the app has one local record and no profiles), and whether the misconception list matches real errors.
**Evidence:** `docs/BUILD_STATUS.md` limits; no user research files exist. status: not tested.
**Avoid / status:** Do not use "learners loved it" or any usability claim.

### Q10. Why not target all subjects and every language immediately?
**Say:** Because correct content in one language pair needs a reviewer for every item. We would rather show one reviewed-ready chapter and a clear process than many unchecked ones.
**Technical:** Adding content means adding items in the pack schema (validated by `src/core/content.js` and `scripts/check-content-consistency.mjs`) and a review pass for each. The code is not specific to Electricity, but nothing else has been built or tried.
**Evidence:** `src/core/content.js`; `docs/REVIEWER_GUIDE.md`. Multi-subject operation: **not tested**.
**Avoid / status:** Do not say "it scales to any subject" — say "the schema is generic; only one pack exists".

### Q11. What is the product's one-sentence value proposition?
**Say:** Pathasetu helps an Odia-medium Class 10 learner find and repair one science misconception at a time, in Odia and English terms, and keeps working when the signal drops.
**Technical:** The three capabilities: bounded misconception diagnosis, bilingual term bridging, offline-tolerant stateful workflow.
**Evidence:** `README.md` first paragraph; guide section 2.1.
**Avoid / status:** "Helps" is an intention. Do not say "improves marks".

## Solution and benefits

### Q12. What is Pathasetu and why that name?
**Say:** Our intended meaning for Pathasetu is a bridge for learning between languages: everyday Odia, school terminology and English science terms. We use the name to express the product's purpose; we are not claiming a formally verified literal translation.
**Technical:** As we read the words, *patha* is path and *setu* is bridge. The meaning is the team's stated intent, recorded here as the team's own explanation. The etymology has not been checked with a qualified language source, and the app shows the same idea as its tagline ("A bridge to understanding").
**Evidence:** team-reported intent; `public/index.html` (the header reads "A bridge to understanding"); `docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md` section 2.1.
**Avoid / status:** Do not call it a dictionary translation or an authoritative etymology. Do not say the name was reviewed by a language expert.

### Q13. Show the complete user journey in 30 seconds.
**Say:** Open the page, unlock with the code, read the question, pick an answer, type why, tap Check my thinking. See the possible gap and the next step. Switch off the network, answer another question, see it queued, switch on, see the re-check and the new plan.
**Technical:** `load` → `submitAnswer` → trace → queue → `drainQueue` → `recheckQueued` → `chooseNextItem`; journeys J1–J9 in `NAVIGATION_AND_WORKFLOW.md`.
**Evidence:** browser-tested in headless Chromium (e2e A–E); phone-tested: no.
**Avoid / status:** In the live demo, say the second check is the demo rule, not a live model.

### Q14. What changes for a learner using this instead of a normal quiz?
**Say:** A normal quiz says right or wrong. This one proposes why the answer might be wrong, gives a specific next activity, explains why the next question was chosen, and does not lose the work offline.
**Technical:** The result is a diagnosis object (`MISCONCEPTION`/`NONE`/`UNCERTAIN`) with rationale, plus remediation text and a recommended next item.
**Evidence:** guide section 4.9 comparison table.
**Avoid / status:** In the default demo the diagnosis follows the chosen option. Do not say it "reads the student's reasoning".

### Q15. What benefit is implemented, what is expected, and what is measured?
**Say:** Implemented: saved answers, queue, diagnosis labels, bridge practice, trace. Expected: faster misconception repair. Measured: only software tests — nothing about learners.
**Technical:** See the table in guide section 5.
**Evidence:** implemented/unit/browser as in the claim matrix; measured result: 207 unit tests etc.; learning gain: **none measured**.
**Avoid / status:** Never "increases scores". Safer: "we have not measured learning outcomes".

### Q16. How can it help a learner who gets a question wrong?
**Say:** It shows a possible wrong idea behind the answer, marked provisional, and a small activity, such as tracing the path of the current round a circuit and marking the break.
**Technical:** `remediation` text is stored per item in the pack and shown in the result card as "Next learning action".
**Evidence:** `renderQuestion` in `public/app.js`; e2e B1. content-reviewed: no.
**Avoid / status:** The activities are draft; no teacher has confirmed they work.

### Q17. How does it help when the learner cannot explain an answer?
**Say:** If they write almost nothing it says "not enough evidence yet" and asks for a little more reasoning; it makes no claim about them.
**Technical:** `proposeDiagnosis` returns `UNCERTAIN` (confidence 0.4) when the trimmed explanation is shorter than 8 characters. Longer text, even meaningless text, is treated as sufficient by the mock.
**Evidence:** `src/core/mockModel.js`; `tests/agent.test.js` ("uncertain/empty explanation never confirms a misconception"). On the 47-case set the rule abstained on 2 of 12 ambiguous or insufficient cases.
**Avoid / status:** Do not claim good handling of weak explanations. A real model might abstain more; **not measured**.

### Q18. What can it offer teachers, and what teacher functions do we not implement?
**Say:** Today almost nothing directly. A teacher can read the decision trace a learner downloads, and the reviewer files let a teacher check the content. There is no teacher screen.
**Technical:** Not implemented: teacher dashboard, class roster, assignments, reports, notifications, authoring tool. The trace export (JSON) omits typed answers, so it is a log of decisions, not a gradebook.
**Evidence:** `src/core/export.js`; `docs/REVIEWER_GUIDE.md`. teacher features: **NOT IMPLEMENTED**.
**Avoid / status:** Do not say "reduces teacher workload".

### Q19. How will we prove learning improvement in a future test?
**Say:** Not with this prototype. We would first get the content reviewed, then evaluate the diagnosis against teacher labels, then watch a few consenting learners, and only then run a small comparison study with approval.
**Technical:** Ladder: reviewed content → reviewer-authored Odia/Roman-Odia evaluation set → live model vs baseline with false-positive and abstention rates → observed task completion → a pre/post design with a comparison group and ethical approval.
**Evidence:** `docs/EVALUATION.md`; guide section 2.8. None of the steps beyond the first tooling has happened.
**Avoid / status:** Do not give any improvement percentage.

### Q20. What is not novel about this idea, and what is specific about our implementation?
**Say:** Offline apps, quizzes, bilingual content and misconception diagnosis are all established. What we show is a bounded, traceable workflow: a diagnosis is only a proposal until a fixed check accepts it, and the system survives a lost connection without losing work.
**Technical:** Specific parts: allow-listed validator shared by browser and server, single-writer lock, bounded retry with a paused state and manual recovery, corrupt-state repair, a trace that records why each step happened.
**Evidence:** `src/core/validator.js`, `retry.js`, `recovery.js`; e2e G, N, R.
**Avoid / status:** Never "first", "only", "revolutionary".

### Q21. Why should anyone use it instead of a free video, textbook or chatbot?
**Say:** Honestly, nobody should yet — it has eight draft questions. The case is that it checks understanding, not just exposure, and keeps working offline; to prove that needs reviewed content and a learner study.
**Technical:** A video does not diagnose; a textbook does not adapt; a general chatbot needs a connection, can invent content and does not keep a bounded trace. Pathasetu's differences are structural, not yet evidenced as better learning.
**Evidence:** none for superiority. status: expected benefit only.
**Avoid / status:** Do not say it beats alternatives. Say what it does differently and that comparison has not been done.

## Agentic AI

### Q22. What is agentic AI in language a school student can understand?
**Say:** A quiz asks and marks. An agentic helper has a goal, looks at what you have done so far, chooses what to do next, uses tools, writes down what it did, and then looks again.
**Technical:** The loop here: observe state → propose a diagnosis → validate → update state → choose the next action → record the reason → repeat when the learner continues.
**Evidence:** `docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md` section 4. The PDF's own test: "if removing the AI leaves the same app, the AI was decoration" (official rule/brief).
**Avoid / status:** Do not define it as "uses ChatGPT". An LLM is not required for the loop, and in our default demo none is used.

### Q23. What makes Pathasetu agentic rather than a chatbot or fixed quiz?
**Say:** It carries a goal and state across steps. It chooses the next question itself, with a stated reason, handles a lost connection, and every decision goes into a trace you can read.
**Technical:** State (`learner`, `answers`, `queue`, `trace`) is changed only by `submitAnswer` and `recheckQueued`; `chooseNextItem` selects the next item from a scoring rule; `appendTrace` writes the reason. A chatbot has no such controlled state; a fixed quiz has no choice.
**Evidence:** `src/core/agent.js`; `tests/agent.test.js`; e2e B, D, E; guide section 4.9.
**Avoid / status:** Be ready for "this is a state machine". Answer: yes, a deliberately bounded one; section 4.4.

### Q24. What goal is pursued and what state is observed?
**Say:** The goal is to repair one misconception at a time. It observes your answers, which re-checks are waiting, how many learning sessions are left and which questions you have seen.
**Technical:** `initialState` creates `learner.{sessionsRemaining, confirmedMisconceptions, seenItemIds, currentItemId, nextRecommendedItemId}`, `answers`, `queue`, `trace`. The planner reads answers (counts per item) and the concept being re-checked.
**Evidence:** `src/core/agent.js` lines 13–27 and `chooseNextItem`.
**Avoid / status:** `confirmedMisconceptions` is read by the planner but never written in the shipped UI (Q129). Do not say the system "tracks the learner's confirmed gaps".

### Q25. Where are plan, decide, tool use, act, state update and loop?
**Say:** Plan: the next-question chooser. Decide: the validator accepts or rejects a diagnosis. Tool use: the rule, the validator and the server routes. Act and state update: saving the answer and queue. Loop: continue, then reconnect and re-check.
**Technical:** Plan `chooseNextItem`; decide `validateDiagnosis`; tools `proposeDiagnosis`, `buildBridgeExercise`, `GET /api/pack`, `POST /api/recheck`; act/update `submitAnswer`, `recheckQueued`, `saveRecord`; loop `drainQueue`, `scheduleRetryTimer`, **Continue**.
**Evidence:** guide section 4.2 table; `NAVIGATION_AND_WORKFLOW.md`.
**Avoid / status:** The "tool use" is calls to our own functions and routes; the only external tool (Groq) is optional and unused live.

### Q26. What is the planner? What is the validator? What is the executor?
**Say:** The planner picks the next question. The validator checks a proposed diagnosis against a fixed list. The executor is the code that changes the saved state once the check passes.
**Technical:** Planner `chooseNextItem(state, pack, excludeId, focusConceptId)`: score = −20 for the concept just re-checked, −10 if an item can address a confirmed gap, +5 per earlier answer, +1 if seen; lowest wins, ties by item ID. Validator `validateDiagnosis(proposal, item)`: right question ID, type in `MISCONCEPTION`/`NONE`/`UNCERTAIN`, misconception ID on the item's allow-list, confidence 0–1 (at least 0.65 unless `UNCERTAIN`), rationale at most 500 characters. Executor: `submitAnswer` and `recheckQueued`, which push the answer, queue entry, trace and timestamps.
**Evidence:** `src/core/agent.js`, `validator.js`; `tests/agent.test.js`, `validator.test.js`. unit-tested.
**Avoid / status:** "Planner" is a scoring rule, not a learned planner. The −10 term is inert in the app (Q129).

### Q27. What actual tools/functions/routes does the system call?
**Say:** Inside the browser: the rule that proposes a diagnosis, the validator, the question chooser, the bridge builder, and the browser's storage. Over the network: four routes — health, session, pack, re-check.
**Technical:** Functions: `proposeDiagnosis`, `validateDiagnosis`, `chooseNextItem`, `buildBridgeExercise`, `recordBridgeAttempt`, `repairSavedRecord`, `buildTraceExport`. Routes: `GET /api/health`, `GET /api/session`, `GET /api/pack`, `POST /api/recheck`. External: optional `POST https://api.groq.com/openai/v1/chat/completions` from the server only.
**Evidence:** `public/app.js`, `src/server/server.js`, `src/server/groqModel.js`.
**Avoid / status:** The Groq call has never been made.

### Q28. Are those tools or agents? How do we distinguish them?
**Say:** Tools. An agent here would be something with its own goal that decides what to do. Ours are functions with fixed jobs, used by one controlled workflow.
**Technical:** Rule of thumb used in the guide: if it has no goal of its own and returns the same output for the same input, it is a tool. `proposeDiagnosis` is deterministic; the Groq adapter is a tool that returns a proposal; neither can call another tool or write state.
**Evidence:** guide section 4.3.
**Avoid / status:** Do not call helper modules "agents". Do not say "multi-agent".

### Q29. Is this deterministic, autonomous or multi-agent?
**Say:** It is a deterministic workflow with one bounded slot for a model. It is not autonomous and it is not multi-agent, and I can show you why in the code.
**Technical:** Given the same pack, state and input, every transition is the same. The only non-deterministic component would be a hosted model's proposal, and that is confined to proposing one allowed ID.
**Evidence:** `src/core/agent.js` (pure given its inputs and a clock); `src/server/groqModel.js` (proposal only). The PDF allows deterministic or autonomous approaches but asks for a justification (official rule/brief).
**Avoid / status:** Do not claim "autonomous agent". Safer: "an agentic workflow with a deterministic controller".

### Q30. Why did we choose the current approach rather than an autonomous or multi-agent architecture?
**Say:** Because the learner's work must never be at the mercy of a model's mood or the signal. A fixed controller is predictable, testable and works offline; a model can still help inside it.
**Technical:** Autonomous tool use needs a model call at each decision, which fails offline and is hard to audit. Multi-agent adds coordination failures without benefit for one learner and one loop. Our design lets the same state machine run with the mock, a hosted model, or nothing.
**Evidence:** guide section 4.4. This is a design rationale (expected benefit), not a measured comparison.
**Avoid / status:** Do not say it is better than autonomous designs; say it fits these constraints.

### Q31. Are LangChain, CrewAI, AutoGen, Smolagents or LlamaIndex used? Prove it from code.
**Say:** No, none of them. The project has no dependencies at all, and I can open the package file to show you.
**Technical:** `package.json` has no `dependencies` or `devDependencies`; `package-lock.json` lists only the project; a search of `src/`, `public/` and `scripts/` found no import of any of them. The PDF allows any framework but asks for a justification; ours is that the loop is small and has to run offline.
**Evidence:** `package.json`, `package-lock.json`; `npm ci` installs nothing (`evidence/iteration5/baseline/npm-ci.txt`).
**Avoid / status:** Re-run the check if the tree changes: `grep -rn "langchain\|crewai\|autogen\|llamaindex\|smolagents" src public scripts package.json`.

### Q32. Is an actual LLM currently being called in the default demo?
**Say:** No. The default provider is a mock rule, and the screen footer says "MOCK PROVIDER · DEMO RULES · NO LIVE AI".
**Technical:** `PATHASETU_MODEL_PROVIDER` defaults to `mock`; `getDiagnosis` calls `proposeDiagnosis`. The Groq adapter is only constructed when the variable is `groq`.
**Evidence:** `src/server/server.js`; `public/index.html` footer; `GET /api/health` → `"provider":"mock"`.
**Avoid / status:** Do not use "AI-powered" without this qualification.

### Q33. What exactly does the mock model do — and not do?
**Say:** It looks at which option you chose. A wrong option returns the misconception linked to it; the keyed option returns "no misconception"; a reason shorter than eight characters returns "not enough evidence". It does not read the reason.
**Technical:** `proposeDiagnosis`: unknown option → `UNCERTAIN` (0.25); trimmed explanation under 8 characters → `UNCERTAIN` (0.4); option without `misconceptionId` → `NONE` (0.78); otherwise `MISCONCEPTION` with the option's ID (0.78). No parsing of the explanation, no Odia handling.
**Evidence:** `src/core/mockModel.js` (9 lines). unit-tested. Its agreement with team labels: 34 of 47 (`docs/EVALUATION.md`).
**Avoid / status:** Say "demo rule", never "model".

### Q34. Has Groq been called live, with which model, when, and what evidence proves it?
**Say:** No. It has never been called. The adapter exists and is tested only against a local fake server.
**Technical:** Configured default model `openai/gpt-oss-20b`. Credentials were not present on any run in this project: `npm run smoke` and `npm run evaluate -- --provider groq` stop with exit code 2 ("BLOCKED"). Presence of the variables was checked without printing values.
**Evidence:** `evidence/iteration5/gates/` (`npm-smoke.txt`, `npm-evaluate-groq.txt`, `credential-and-tool-presence.txt`), `evidence/iteration4/final/groq-status.txt`. status: **LIVE-API-TESTED: no (BLOCKED — credentials not configured)**.
**Avoid / status:** If asked "but have you tried it", answer exactly that. Never show a screenshot of another tool as if it were this.

### Q35. What happens when a model returns uncertainty or an invalid ID?
**Say:** Uncertainty is accepted as a valid answer and nothing is recorded as a misconception. An invalid ID is rejected, the learner's answer stays saved, and the check is retried later.
**Technical:** `validateDiagnosis` accepts `UNCERTAIN` without an ID; it rejects an ID not in the item's `allowedMisconceptionIds`, a wrong question ID or low confidence. The server answers 422 `diagnosis_rejected`; the browser's `recheckQueued` calls `registerFailure`, which counts an attempt and schedules the next retry.
**Evidence:** `tests/validator.test.js`, `tests/agent.test.js`, `tests/iteration2-core.test.js`; e2e J2, J3.
**Avoid / status:** Tested with stubbed failures, not with a real model's output.

### Q36. Can a model change learner state directly?
**Say:** No. A model only returns a suggestion. Our code checks it and then our code writes the state.
**Technical:** The server returns only `{provider, model, diagnosis, note}`. The browser calls `recheckQueued`, which re-validates and stores the diagnosis with `provisional: true`. There is no code path where provider output is written to state without `validateDiagnosis`.
**Evidence:** `src/core/agent.js` (`recheckQueued`), `src/server/server.js` (`/api/recheck`).
**Avoid / status:** Do not claim the validator guarantees the diagnosis is *correct* — only that it is well-formed, allowed and sufficiently confident.

### Q37. What keeps a diagnosis from becoming confirmed without enough evidence?
**Say:** In the app, nothing is ever confirmed. Every result is marked provisional and the screen says so.
**Technical:** `recheckQueued` is called with `trusted: false` in `drainQueue`; the code that would add to `confirmedMisconceptions` runs only when `trusted` is true. The labels "provisional", "possible concept gap", "answer key match (not independently verified)" are fixed text.
**Evidence:** `public/app.js` line with `recheckQueued(... trusted: false ...)`; `tests/agent.test.js` (trusted path tested in isolation).
**Avoid / status:** Do not say "it confirms mastery" or "tracks mastery". It does neither.

### Q38. What continues to work with no provider at all?
**Say:** The whole learning loop: questions, answering, feedback, planning, Bridge Practice, saving and the trace. Only the second opinion on the server is missing.
**Technical:** The first diagnosis is computed in the browser by the same rule. With the server unreachable the queue waits.
**Evidence:** e2e E1–E4, K9 (Bridge Practice makes no API request).
**Avoid / status:** The server still hosts the pack the first time; without a first online visit there is nothing to load.

### Q39. How would we add an approved provider without changing the core state machine?
**Say:** By writing one adapter that returns the same proposal shape. The validator and the rest stay the same.
**Technical:** Add a module like `groqModel.js` exporting a function `({item, optionId, explanation}) → proposal`, add its name to the allowed values of `PATHASETU_MODEL_PROVIDER`, and select it in `getDiagnosis` in `server.js`. The browser, `agent.js` and `validator.js` do not change.
**Evidence:** `src/server/groqModel.js` is the working example; `tests/groqModel.test.js`.
**Avoid / status:** Provider eligibility is an open point: the event page says open-source LLM APIs are permitted, while the team's note says all APIs are allowed; not confirmed in writing.

### Q40. If a judge says "this is just rules, not AI," what is the truthful answer?
**Say:** In the default demo, the diagnosis step is a rule, yes. We built the workflow around a slot for a model: the checks, the retry and the state handling are what we engineered, and they work with a real model in the same slot once a live run is evidenced.
**Technical:** The agentic parts — stateful loop, planner, validator, queue, retry, recovery, trace — are real and tested. The semantic understanding is absent in the mock. The adapter exists but is unproven live. The PDF's own test ("remove the AI") would leave a quiz with a weaker diagnosis; we say plainly that the intelligence of the diagnosis is the part not yet shown.
**Evidence:** guide sections 4.5–4.8; `evidence/iteration5/gates/GATE_STATUS.md`.
**Avoid / status:** Do not argue that rules are AI. Agree on the facts, then point to what is engineered and tested.

## Tech stack and implementation

### Q41. What is the full tech stack, and why was each part chosen?
**Say:** Plain web technology: HTML, CSS and JavaScript in the browser, a small Node.js server, the browser's own database and offline cache. No frameworks. Chosen so there is nothing to install, little to break, and it runs on a phone browser.
**Technical:** HTML/CSS/vanilla ES modules; Node `http` module (no Express); IndexedDB; service worker + Cache Storage; Web Locks; `sessionStorage`; JSON content pack; Node's built-in test runner; headless Chromium driven through the DevTools Protocol with no library; an optional Groq adapter using Node's built-in `fetch`.
**Evidence:** guide section 3 (table with file paths); `package.json` (`engines.node >=20`, no dependencies).
**Avoid / status:** The reasons are design rationale (expected benefit). Do not claim the stack is "production grade".

### Q42. Why vanilla JavaScript and Node.js? Is Express present?
**Say:** Because the whole app is small, and a framework would be more code than the thing it supports. Express is not present.
**Technical:** The server is about 200 lines using `node:http`, with hand-written routing, headers and static-file handling. The front end is one module of about 625 lines plus six core modules.
**Evidence:** `src/server/server.js`, `public/app.js`; `package-lock.json` has no packages. unit-tested through `tests/server.test.js` and others.
**Avoid / status:** The trade-off is hand-rolled code that a framework would give for free (compression, routing, body parsing). Do not hide that (Q54).

### Q43. What runs in the browser, and what runs on the server?
**Say:** The browser runs almost everything: the screen, the rule, the validator, the planner, the storage and the queue. The server serves the files and the question pack, checks the demo code, and does the second check.
**Technical:** Browser: `public/*`, `src/core/*` (except `content.js`, which only the server imports). Server: `src/server/*`, `src/core/content.js`, `mockModel.js`, `validator.js`. `mockModel.js` and `validator.js` run in both places.
**Evidence:** `SYSTEM_ARCHITECTURE.md` section 1 (the diagram's two boxes).
**Avoid / status:** Do not say "all processing is on the server" or "all on device". Both are partly wrong.

### Q44. What are the main source files and entry points?
**Say:** Three files to know: `public/app.js` is the app on the phone, `src/core/agent.js` is the workflow, and `src/server/server.js` is the server.
**Technical:** Entry points: `npm start` → `src/server/server.js`; browser → `public/index.html` loads `/app.js` as a module; workflow entry `submitAnswer` in `src/core/agent.js`; tests `npm test` → `tests/*.test.js`; browser tests `scripts/browser-regression.mjs`.
**Evidence:** `package.json` scripts; `SYSTEM_ARCHITECTURE.md` section 3.
**Avoid / status:** Nothing to avoid; know the three names.

### Q45. What API endpoints exist and why?
**Say:** Four. Health tells the app whether the server is really reachable. Session checks the demo code. Pack sends the questions. Re-check gives the second opinion.
**Technical:** `GET /api/health` (open), `GET /api/session`, `GET /api/pack`, `POST /api/recheck {itemId, optionId, explanation}`. Responses and refusals are tabulated in `SYSTEM_ARCHITECTURE.md` section 5.
**Evidence:** `src/server/server.js`; `tests/server.test.js`, `tests/public-demo.test.js`; `npm run capture` HTTP checks.
**Avoid / status:** There is no login, no learner endpoint, no write endpoint for learner data.

### Q46. What schema does a question/content pack use?
**Say:** A list of items. Each has a prompt, four options, which one is correct, which wrong idea each wrong option stands for, an explanation, a next activity, Odia draft text, and the three-part language bridge.
**Technical:** Pack: `packId, subject, topic, classLevel, medium, languageBridge{status,...}, items[]`. Item: `id, conceptId, conceptTitle, status, prompt, promptOdiaDraft, options[{id,text,textOdiaDraft,misconceptionId}], correctOptionId, allowedMisconceptionIds[], explanation, explanationOdiaDraft, remediation, bridge{everydayOdia, schoolOdiaTerm, englishTerm, status}, review{status,reviewer,reviewedAt}, misconceptions[{id,description}]`. `validateItem` enforces: at least two options, the correct option carries no misconception, every wrong option maps to an allowed ID, every allowed ID is used, status values valid, review status equals item status, and a reviewer and date are required for `REVIEWED`/`PUBLISHED`.
**Evidence:** `src/core/content.js`; `tests/content.test.js`; `npm run check:content` (8 items, 0 problems).
**Avoid / status:** The checker validates structure, not correctness. All 8 items are `UNREVIEWED_DRAFT`.

### Q47. What is IndexedDB in simple terms and what records does it store?
**Say:** It is a small database inside the browser. When browser storage works, it keeps the learner's progress, drafts and waiting re-checks on their own phone. The typed explanation is still sent to the Pathasetu server whenever a re-check runs (Q89).
**Technical:** Database `pathasetu-local-v1`, store `records`. Key `session` holds `{pack, state, drafts, savedAt}`, where state has `learner`, `answers`, `queue`, `trace`, `schemaVersion`, `lastUpdated`; drafts are keyed by question ID. Key `session-unreadable-backup` holds a copy of a record that could not be read. If IndexedDB is unavailable the code uses an in-memory copy and says so on screen.
**Evidence:** `src/core/storage.js`; `tests/storage.test.js`; e2e L, P, R.
**Avoid / status:** Browsers can clear it; the app says it is best effort and never promises retention.

### Q48. What is a service worker and what files does it cache?
**Say:** A small script that sits between the page and the network so the page can open without a connection. It keeps the app's own files; it never keeps any answers from the server.
**Technical:** `public/sw.js`, cache name `pathasetu-shell-v8`. Pre-cached: `/`, `/index.html`, `/styles.css`, `/app.js`, `/manifest.webmanifest`, `/favicon.svg` and the core modules `agent`, `mockModel`, `validator`, `storage`, `bridge`, `retry`, `recovery`, `export`, `persistence`. It ignores `/api/*` and non-GET requests; navigations fall back to cached `/index.html`.
**Evidence:** `public/sw.js`; `tests/uiStatic.test.js` (fails if a module imported by the browser is missing from the list); e2e E1, H1, I1, I2.
**Avoid / status:** Verified in headless Chromium only. iPhone Safari and Samsung Internet behaviour: **NOT TESTED**.

### Q49. What is an API, an endpoint, an origin and a rate limit?
**Say:** An API is a set of doors a program offers. An endpoint is one door. An origin is the exact web address the page came from. A rate limit stops one visitor from knocking too many times a minute.
**Technical:** In this server: endpoints are the four `/api/*` paths; the Origin header on a request must equal the Host the server saw, or be listed in `PATHASETU_ALLOWED_ORIGINS`; rate limits are fixed windows per route and socket address (defaults: 30 per minute for session and pack, 24 per minute for re-check, 20 failed-code attempts per minute shared across routes).
**Evidence:** `src/server/server.js`, `src/server/access.js`; `tests/access-policy.test.js`, `proxy-origin.test.js`.
**Avoid / status:** The counters are in memory and reset on restart.

### Q50. How do local storage, session storage, memory and the server differ in this app?
**Say:** Memory is the open page and disappears on reload. IndexedDB is the long-lived progress on the phone. Session storage holds only the demo code and disappears when the tab closes. The server keeps nothing about learners.
**Technical:** Table in `SYSTEM_ARCHITECTURE.md` section 4. `localStorage` is not used for learner data; a browser test checks the access code is in neither IndexedDB nor `localStorage` (M7).
**Evidence:** `public/app.js`, `src/core/storage.js`; e2e M7.
**Avoid / status:** Do not say "no data leaves the device": the typed explanation is sent to the server at re-check time (Q89).

### Q51. What does Bridge Practice use to generate a practice question?
**Say:** Only the three-part mappings already in the content pack. It does not invent any word and does not call a model.
**Technical:** `buildBridgeExercise({pack, itemId, attempt})`: target = the current item's mapping; distractors = other items' mappings that share no term with the target (terms split on `/` and `;`); three options, with the correct one's position rotating with the attempt count; deterministic. Disabled with a reason if the item has no complete mapping or fewer than three clearly different mappings exist.
**Evidence:** `src/core/bridge.js`; `tests/bridge.test.js` (13 tests); e2e K1–K10.
**Avoid / status:** "Correct" means "matches the pack"; it does not prove the translation is right (Q69).

### Q52. What happens during a clean install and app startup?
**Say:** Run `npm ci` (installs nothing), `npm start`, open the address. The page asks the server for the questions, saves them, and shows the first one.
**Technical:** Server start: parse flags, load and validate the pack (invalid pack stops startup), check the access-code strength if required, listen on `127.0.0.1:4173`. Browser: `startApp` → acquire the single-writer lock → `load()` (IndexedDB read, `/api/pack`, repair/initialise, `reconcileState`) → `renderAll` → health probe → queue drain.
**Evidence:** `src/server/server.js`; `public/app.js`; `evidence/iteration5/baseline/npm-ci.txt`.
**Avoid / status:** First load needs the server; after one visit the shell and pack are available offline (headless-tested).

### Q53. What commands run tests, syntax checks, content checks and preflight?
**Say:** `npm test`, `npm run check`, `npm run check:content`, `npm run preflight`. Browser checks need a Chrome path: `npm run capture`, `npm run e2e`, `npm run a11y`.
**Technical:** `npm test` = `node --test tests/*.test.js`; `check` = `node --check` on all source and scripts; `check:content` = pack/worksheet/evaluation consistency (does not mark anything reviewed); `preflight` = configuration safety plus a mock-only loopback harness, exit 1 on any failure; browser commands need `CHROME_PATH`.
**Evidence:** `package.json`; `README.md`; `evidence/iteration5/baseline/exit-codes.txt` (all 0).
**Avoid / status:** On the team's managed machine the browser commands were reported BLOCKED by `ERR_BLOCKED_BY_ADMINISTRATOR`; say so if asked to run them there.

### Q54. What are the major trade-offs and technical-debt items?
**Say:** We chose small and auditable over feature-rich. The debts: unreviewed content, a rule instead of a real model in the demo, no phone testing, in-memory throttling, and hand-written server code.
**Technical:** (1) Planner's confirmed-gap term is inert (Q129). (2) One local record, no learner profiles (Q128). (3) The answer key ships to the browser (Q150). (4) Static route serves any `.js` in `src/core/` including `content.js`, which the browser never imports; harmless but wider than the comment says. (5) No response compression and no HTTP caching strategy beyond `must-revalidate`. (6) No bundled Odia font. (7) No CI. (8) In-memory rate counters keyed by socket address. (9) Large `app.js` (about 625 lines) without a component structure.
**Evidence:** `src/server/server.js`, `public/app.js`, `docs/BUILD_STATUS.md` "Limits and risks".
**Avoid / status:** Volunteer two or three of these rather than waiting to be asked.

## Architecture and workflow

### Q55. Explain the architecture diagram as if pointing to it on a screen.
**Say:** Left box is the phone: screen, workflow, rule, checker, local database, waiting list. Right box is the server: guards, four routes, the pack, the second check. The dashed box at the bottom is the optional outside model — never used live. Solid lines work offline; the line from the waiting list to the server needs a connection.
**Technical:** Walk the arrows in `SYSTEM_ARCHITECTURE.md` section 2: UI → agent → rule → validator → agent → trace/queue/database; queue → retry policy → `/api/recheck` → guards → mock → validator → agent.
**Evidence:** `docs/SYSTEM_ARCHITECTURE.md` (Mermaid source).
**Avoid / status:** Do not point at anything marked planned: there is none.

### Q56. What does each component receive and return?
**Say:** Short version: the rule gets a question, an option and a reason and returns a suggestion; the checker gets the suggestion and returns accept or reject; the chooser gets the saved state and returns the next question.
**Technical:** The full table is in `SYSTEM_ARCHITECTURE.md` section 3 (input and output columns).
**Evidence:** same.
**Avoid / status:** none.

### Q57. Walk from "Submit" to the next selected question.
**Say:** Tap Check my thinking → the answer is checked and saved → a result and next activity appear → the plan card says which question is next and why → tap Continue to move there.
**Technical:** `form submit` → `doSubmit` → `submitAnswer`: validate input; `proposeDiagnosis`; `validateDiagnosis`; push answer (mode `LOCAL_PROPOSAL_PENDING_RECHECK` online or `OFFLINE_RULE` offline), `seenItemIds`, queue entry; `chooseNextItem(state, pack, itemId)` → `nextRecommendedItemId`; `sessionsRemaining − 1`; `appendTrace('answer_submitted')`; `saveRecord`; if online `drainQueue`. **Continue** → `learner_applied_updated_plan` trace; `currentItemId = nextRecommendedItemId`.
**Evidence:** `src/core/agent.js` lines 81–125; e2e B1–B3, C1–C2.
**Avoid / status:** On submit the planner does not use the concept focus; only the re-check does.

### Q58. Walk through offline answer → queue → reconnect → re-check → replanning.
**Say:** Offline, the answer is saved and the card says "re-check queued". When the signal returns, the app notices, sends the answer for a second check, validates the reply, updates the result and may suggest a different next question.
**Technical:** `submitAnswer({online:false})` → `OFFLINE_RULE`. The probe `GET /api/health` returns OK → `refreshHealth` → `drainQueue` → for each due entry `POST /api/recheck` → `recheckQueued({diagnosisOverride, trusted:false, provider})` → answer `mode` becomes `RECHECKED_MOCK`, queue entry removed, `chooseNextItem(..., focusConceptId)` → `nextRecommendedItemId` → trace `recheck_complete`. The current question and draft are untouched.
**Evidence:** `public/app.js` `drainQueue`; `src/core/agent.js` `recheckQueued`; e2e D1–D4, E3, E4.
**Avoid / status:** Headless only. With the mock the re-check normally reproduces the first result.

### Q59. What happens if the browser closes before reconnecting?
**Say:** Nothing is lost. The answer and its waiting check are in the phone's database. On reopening, the check runs when the server can be reached.
**Technical:** `saveRecord` runs after every change and on `pagehide`. On the next load, `scheduleRetryTimer` and the health probe resume the queue; the retry schedule and paused flag persist in the queue entry.
**Evidence:** e2e E4 (cold start recovers a queue left by a closed tab), L2; `tests/storage.test.js`.
**Avoid / status:** Tested as a page reload/close in headless Chromium. A swipe-away on a real phone (phone step 8) is **NOT TESTED**.

### Q60. What happens after five failed retries?
**Say:** It stops trying on its own. The card says "Re-check paused · needs attention", the answer stays saved, and a Retry now button starts again.
**Technical:** `scheduleAfterFailure`: `cycleAttempts` reaches 5 → `needsAttention = true`, `nextAttemptAt = null`, trace `recheck_paused`. Delays before then: 5, 10, 20, 40 s (cap 60 s). `manualRetryQueue` clears the flags. Reachability events do not bypass the pause.
**Evidence:** `src/core/retry.js`; `tests/retry.test.js` (12 tests); e2e N1–N11.
**Avoid / status:** Headless with stubbed failures. This is a stalled-provider safeguard, not a quality claim.

### Q61. What happens if the saved state is corrupt?
**Say:** The app keeps what is valid, drops what is not, tells the learner, and starts fresh only if nothing is readable — after keeping a copy of the damaged record.
**Technical:** `repairSavedRecord` validates every field and collection, removes unusable entries, de-duplicates, trims to limits, and traces counts only. Unreadable → fresh state, `storage.quarantine` copies it to `session-unreadable-backup`, and a warning notice appears.
**Evidence:** `src/core/recovery.js`; `tests/storage-resilience.test.js` (16 tests); e2e R1–R5.
**Avoid / status:** Tested with synthetic corruption, not with natural browser corruption.

### Q62. What happens if a saved question no longer exists?
**Say:** The app picks another question and quietly drops waiting checks for the missing one, noting it in the trace.
**Technical:** `reconcileState` replaces a missing `currentItemId`, clears a recommendation that points at a missing item; `recheckQueued` drops a queue entry whose answer or item is gone (`queue_dropped`).
**Evidence:** `tests/iteration2-core.test.js`; e2e F1–F4.
**Avoid / status:** none.

### Q63. What happens if two tabs are opened?
**Say:** The first tab can write. The second says "Read-only session", its buttons are off, and it never sends a check.
**Technical:** `navigator.locks.request('pathasetu-single-writer', {ifAvailable:true})`. No lock → `ui.writable = false`; `saveRecord` and `drainQueue` return immediately. Without Web Locks a persistent single-tab warning is shown instead. A read-only tab never becomes writable by itself.
**Evidence:** e2e G1–G7, G4; `tests/uiStatic.test.js`.
**Avoid / status:** Phone behaviour (phone step 9): **NOT TESTED**.

### Q64. How are question drafts protected from moving to another item?
**Say:** The typed text and selected option are stored under the question they belong to and come back only on that question.
**Technical:** `ui.drafts[itemId] = {optionId, explanation, updatedAt}` saved with the record; focus and caret are restored after a re-render only if the same item is still displayed.
**Evidence:** e2e D2–D4, L1–L2.
**Avoid / status:** none.

### Q65. How does a user navigate each screen and get back to the main learning path?
**Say:** There is only one screen. Everything is cards on the same page; nothing needs a back button.
**Technical:** The only overlay is the unlock dialog. The trace panel folds and unfolds. See `NAVIGATION_AND_WORKFLOW.md` sections 1–2.
**Evidence:** `public/index.html`.
**Avoid / status:** A judge may ask for a menu, settings or a language toggle: say they are not implemented (list in `NAVIGATION_AND_WORKFLOW.md` section 3).

### Q66. What happens when the service worker detects an update?
**Say:** The page shows "App update ready — reload once to apply it". Your saved progress stays.
**Technical:** `registration.update()` on load and when the tab becomes visible; a `controllerchange` after the first install is treated as an update (the very first install is ignored). The new worker uses cache `pathasetu-shell-v8`; older `pathasetu-shell-*` caches are deleted on activate.
**Evidence:** `public/app.js`, `public/sw.js`; e2e A4, I1, I2.
**Avoid / status:** Needs a second deployed build to test on a phone (phone step 16: **NOT TESTED**).

## Language and pedagogy

### Q67. What exactly does the language bridge connect?
**Say:** Three forms of one idea: how a student might say it at home, the term in the Odia textbook, and the English term used in exams.
**Technical:** Each item's `bridge` has `everydayOdia` (a sentence), `schoolOdiaTerm`, `englishTerm` and a `status`. The Language Bridge card displays them; Bridge Practice quizzes them. Example, EL01: "when there is a gap in the wire the whole road for electricity is not there" → *ଖୋଲା ପରିପଥ / ବନ୍ଦ ପରିପଥ* → "open circuit / closed circuit".
**Evidence:** `content/electricity-pack.json`; `src/core/bridge.js`. content-reviewed: **no**.
**Avoid / status:** Not translation software. It is eight hand-written mappings.

### Q68. Are the language mappings teacher-reviewed?
**Say:** No. They are drafts written with AI assistance, and the screen says "Odia wording awaits teacher review".
**Technical:** All 8 `bridge.status` values and `languageBridge.status` are `UNREVIEWED_DRAFT`; `reviewer` and `reviewedAt` are null; a unit test pins that no reviewer field is filled and `npm run check:content` refuses a "reviewed" label without a name and date.
**Evidence:** `content/electricity-pack.json`; `tests/content-consistency.test.js`; `docs/REVIEWER_GUIDE.md`. status: **NOT REVIEWED**.
**Avoid / status:** Never say "teacher-approved", "verified" or "accurate Odia".

### Q69. Does the matching exercise prove a translation is correct?
**Say:** No. It only checks that the learner picked the pair that the pack says goes with the sentence.
**Technical:** `gradeBridgeAnswer` compares the chosen option ID with `correctOptionId` derived from the same pack. If the pack is wrong, the "correct" answer is wrong. The feedback text says so: "The mapping itself has not been teacher-reviewed."
**Evidence:** `src/core/bridge.js`; `public/app.js` feedback string; `tests/bridge.test.js`.
**Avoid / status:** "Consistent with the pack", never "correct translation".

### Q70. Does the app currently support Kui, speech input, voice output or transliteration? Show evidence.
**Say:** No to all four. The app has English questions with Odia draft text beside them and nothing else.
**Technical:** A search of `public/` and `src/` for Kui, speech, voice and transliteration terms found nothing relevant; `index.html` has `lang="en"` with Odia spans marked `lang="or"`; there is no language switch control and no microphone or speech API use. Typed Roman-Odia is passed through unchanged (and ignored by the mock).
**Evidence:** `public/index.html`, `public/app.js`; `NAVIGATION_AND_WORKFLOW.md` section 3. **NOT IMPLEMENTED.**
**Avoid / status:** The PDF's bonus criteria ask for regional-language support beyond translated labels. Be honest that ours is a bilingual draft display and a term-matching exercise, not deeper localisation.

### Q71. How are science explanations and misconception labels checked?
**Say:** They are not checked by a human yet. The software checks that the files agree with each other; a teacher has to check the science.
**Technical:** Automated: the structure rules in Q46, the consistency check between pack, worksheet and evaluation cases, and the allow-list at run time. Human: `docs/REVIEWER_GUIDE.md` lists 13 things a reviewer must judge per item; no reviewer has done so.
**Evidence:** `scripts/check-content-consistency.mjs`; `docs/CONTENT_REVIEW_WORKSHEET.csv` (all `NOT REVIEWED`). content-reviewed: **no**.
**Avoid / status:** `npm run check:content` printing OK means consistent, not correct.

### Q72. What happens if an explanation is wrong or culturally/linguistically unnatural?
**Say:** Today, nothing catches it. That is exactly why the content is marked draft and why a teacher review comes first.
**Technical:** There is no learner feedback channel, no report button and no automated language check. The pack is a JSON file that can be corrected after review, and the reviewer worksheet records the corrected wording.
**Evidence:** `docs/REVIEWER_GUIDE.md`. mitigation: process only, **not tested**.
**Avoid / status:** Do not say the system detects unnatural language.

### Q73. How are ambiguous answers handled?
**Say:** The mock calls an answer "not enough evidence" only when the reason is very short. A real model would be asked to abstain more; we have not measured that.
**Technical:** The validator accepts `UNCERTAIN` as a first-class result. Evaluation: of 12 ambiguous or insufficient-evidence cases, the rule abstained on 2 (the other 10 were confident answers). The Groq prompt tells the model to abstain when evidence is short, ambiguous, contradictory or unrelated, and to treat the learner's text as untrusted data; that prompt has never been run.
**Evidence:** `docs/EVALUATION.md`; `evidence/iteration4/final/evaluation/`; `src/server/groqModel.js`.
**Avoid / status:** The abstention weakness is real; say so before being asked.

### Q74. How would Odia script and Roman-Odia evaluation be performed?
**Say:** A teacher writes realistic answers in Odia script and in Roman letters, labels them, and we run the diagnosis on them and compare. We have not done it.
**Technical:** `evaluation/EVALUATION_REVIEW_TEMPLATE.csv` has 24 blank rows (12 `odia_script`, 12 `roman_odia`, three per category) for a reviewer to author. The team will not machine-translate the English cases. The evaluation harness reports validity and agreement separately, by language, with no extrapolation across languages.
**Evidence:** `docs/REVIEWER_GUIDE.md`; `docs/EVALUATION.md`; `scripts/evaluate-diagnosis.mjs`. status: **not yet done, no Odia case exists**.
**Avoid / status:** "Odia accuracy" has no number. Do not extrapolate from English.

### Q75. What is the content review process and who has approved the current pack?
**Say:** Nobody has approved it. The process is written down; a qualified Odia-medium science teacher fills a worksheet; only then do we change the status by hand.
**Technical:** `docs/REVIEWER_GUIDE.md` and `docs/CONTENT_REVIEW_RUBRIC.md`: thirteen judgements per item, a per-mapping review, a decision (`APPROVE`, `APPROVE_WITH_EDITS`, `NEEDS_CHANGES`, `REJECT`); the checker rejects an approval without a name and four PASS checks. The code cannot verify the reviewer's identity.
**Evidence:** `docs/CONTENT_REVIEW_WORKSHEET.csv` (blank). Reviewer for this iteration: **BLOCKED — none available** (`evidence/iteration5/gates/GATE_STATUS.md`).
**Avoid / status:** Never imply an approval exists.

## Offline, hosting and devices

### Q76. What exactly works when airplane mode is turned on?
**Say:** After one online visit: the page opens, the saved questions show, you can answer, get a first result, see the plan, practise the bridge and read the trace. The second check waits.
**Technical:** Service worker serves the shell and core modules; the pack and state come from IndexedDB; `submitAnswer` runs locally with mode `OFFLINE_RULE`; the queue holds the re-check. Unlock and re-check need the server.
**Evidence:** e2e E1–E3, K9, D1; the table in guide section 2.3. browser-tested (headless). phone-tested: **NOT TESTED**.
**Avoid / status:** Never "fully offline". Say: "the learning loop works offline; the server check waits".

### Q77. Is the LLM running on-device/offline?
**Say:** No. There is no language model on the phone. The "model" in the demo is a small rule.
**Technical:** No on-device inference library, model file or WebGPU/WASM runtime is present. Local inference is **NOT IMPLEMENTED**.
**Evidence:** `package.json` (no dependencies); `src/`, `public/`.
**Avoid / status:** If asked whether one could be added: possible in principle, not built, not tested, and Class-10-on-a-shared-phone devices may not hold it.

### Q78. Which actions must wait for the server/provider?
**Say:** First ever load, unlocking with the demo code, and the second check of an answer.
**Technical:** `GET /api/pack` (first load or refresh), `GET /api/session` (unlock), `POST /api/recheck` (queued). Everything else is local.
**Evidence:** guide section 2.3 table; `public/app.js`.
**Avoid / status:** none.

### Q79. How does actual reachability differ from `navigator.onLine`?
**Say:** The phone can say "online" while the server is unreachable (weak signal, captive Wi-Fi). The app checks the real server instead.
**Technical:** `refreshHealth` fetches `GET /api/health` with a 1.8 s timeout; `ui.reachable` is true only if it answers OK. Probe every 15 s when reachable; when not, back-off from 2 s to a 30 s cap. The browser's `online`/`offline` events and tab visibility only trigger an extra probe.
**Evidence:** `public/app.js` `refreshHealth`, `scheduleProbe`; e2e D, E2.
**Avoid / status:** The probe adds a small request every 15 s while the page is open; its data cost on mobile was not measured.

### Q80. What happens if browser storage is cleared or evicted?
**Say:** The saved progress is gone. The app starts fresh the next time it is online and says storage may be cleared; it asks the browser to protect the data but cannot force it.
**Technical:** `navigator.storage.persist()` is requested once after the first saved answer; the persistence line describes the outcome without promising retention. If storage is cleared while offline, the pack copy is also gone, and the app shows "Pathasetu has no local content pack yet. Open the app once online".
**Evidence:** `src/core/persistence.js`; `public/app.js` `load`; e2e P1–P4.
**Avoid / status:** iPhone Safari may clear script-writable storage for sites not added to the Home Screen after a period of non-use (browser policy; confirm on the device). Not tested.

### Q81. What has passed in headless Chromium and what has run on a physical device?
**Say:** All of the automated tests passed in headless Chromium on Linux. Nothing has run on a physical phone.
**Technical:** 207 unit/static tests; 19 capture checks; 100 browser regression checks; 462 accessibility checks, all on 13 Oct 2026 (Node 22.22.0, Chromium 141.0.7390.37; Iteration 5 had 198 and 95). Separately the team reported that on its managed machine the capture browser journey and e2e were blocked by browser policy (`ERR_BLOCKED_BY_ADMINISTRATOR`), and a second audit environment saw the same; that is recorded as BLOCKED, not as a pass.
**Evidence:** `evidence/iteration5/baseline/`; `docs/PHONE_TEST_RESULTS_TEMPLATE.csv` (161 rows, all `NOT TESTED`).
**Avoid / status:** Do not say "tested on mobile". Say "tested in headless Chromium with mobile-sized viewports".

### Q82. Have the S23, S25, S25 FE, Samsung Internet and iPhone 16 Safari passed? Where is evidence?
**Say:** Not yet. We have the plan, the checklist and a blank results sheet; no one has run them.
**Technical:** 7 device/browser combinations × 23 steps = 161 rows, all `NOT TESTED`. A combination counts as offline-tested only when its mandatory steps 1, 3–9, 14 and 18 are `PASS` with tester, IST date, OS and browser version, HTTPS status, network and an evidence reference.
**Evidence:** `docs/PHONE_TEST_PLAN.md`, `docs/EVENT_DAY_CHECKLIST.md`, `docs/PHONE_TEST_RESULTS_TEMPLATE.csv`; `evidence/iteration5/gates/GATE_STATUS.md`. status: **NOT TESTED**.
**Avoid / status:** If you test on the day, show the filled CSV, not a recollection.

### Q83. Why does the iPhone test need HTTPS?
**Say:** Service workers and some storage features only work on secure addresses, and an iPhone cannot reach a laptop's "localhost".
**Technical:** Browsers treat `https://` (and `localhost`) as secure contexts; service workers require one. A phone's `localhost` is the phone itself, so an Android phone can use USB reverse forwarding but an iPhone has no such shortcut; it needs a real HTTPS address.
**Evidence:** `docs/HTTPS_DEMO_RUNBOOK.md`; `docs/PHONE_TEST_PLAN.md`. The claim that the iPhone fails over plain HTTP is browser behaviour that the team has **not observed**.
**Avoid / status:** Say "needs a secure address", not "we saw it fail".

### Q84. Has a real tunnel/HTTPS host been deployed and independently verified?
**Say:** No. We prepared the runbook and a safety check, and tested every local step with a simulated tunnel. A real tunnel has not been opened.
**Technical:** `npm run preflight -- --expect-origin https://HOST` must pass first; the runbook's outside-checks list what to verify (no code → refused; wrong code → refused; right code works; unlisted origin refused; `/api/*` not cached). In this build no tunnel client was available; the preflight was run only against a placeholder origin.
**Evidence:** `docs/HTTPS_DEMO_RUNBOOK.md`; `evidence/iteration4/final/runbook-dry-run.txt`; `evidence/iteration5/gates/` (BLOCKED). status: **BLOCKED / NOT TESTED**.
**Avoid / status:** Do not call the placeholder-origin run "deployed". The server needs a persistent Node process, so a serverless host will not work unchanged.

### Q85. What is the fallback if network, tunnel, host or demo code fails?
**Say:** Run the demo on the laptop locally in front of the judges, and if needed play a clearly labelled recording of an earlier run.
**Technical:** Local run on `127.0.0.1:4173` needs no network; offline behaviour can be demonstrated live with the browser's offline mode. If the code is lost, restart the server with a new one. A recording must be introduced as a recording; the trace and the footer label stay visible.
**Evidence:** `docs/PITCH_SCRIPTS.md` ("demo breaks"); `docs/EVENT_DAY_CHECKLIST.md` sections 4–5.
**Avoid / status:** A recording is never a live test. Say what failed and what you are showing instead.

### Q86. Can we claim low-end phone support based on the current devices?
**Say:** No. The four phones we own are recent flagships, so they say nothing about low-end phones. Low-end support is untested.
**Technical:** The app is about 140 KB of source in total with no libraries, but memory, CPU and storage behaviour on low-end devices were not measured; Odia font rendering depends on the device and no font is bundled.
**Evidence:** file sizes measured on 13 Oct 2026 (`public/app.js` 43 KB, `styles.css` 20 KB, pack 27 KB); no device data. status: **NOT TESTED**.
**Avoid / status:** Never "runs on low-end phones" or "low-end tested".

## Privacy, access control and reliability

### Q87. What data is collected, stored, transmitted and exported?
**Say:** The learner's choices and typed reasons are stored on their own phone. The typed reason is sent to our server when the second check runs. The server keeps nothing. The downloadable trace leaves out the typed text.
**Technical:** Collected: option choice, typed explanation (up to 1,000 characters, optional), timestamps, decision events, drafts. Stored: IndexedDB on the device (Q47); the demo code in `sessionStorage`; server memory holds only rate counters keyed by socket address. Transmitted: `POST /api/recheck {itemId, optionId, explanation}`; with Groq configured, also the question and options to the provider (Q89). Exported: trace JSON with explanations replaced by character counts, drafts omitted, secrets redacted. The server logs one start-up line and nothing per request.
**Evidence:** `src/core/storage.js`, `src/core/export.js`, `src/server/server.js` (`console.log` appears once); e2e S1–S3, M7.
**Avoid / status:** No privacy notice or consent screen exists in the app (**NOT IMPLEMENTED**). Do not say "no data leaves the device".

### Q88. Is there a server-side learner database or account system?
**Say:** No. There are no accounts, no learner IDs and no database on the server. Progress lives only in the learner's own browser.
**Technical:** The server reads only the pack file and environment variables. `/api/recheck` is stateless.
**Evidence:** `src/server/server.js`; `README.md` "Security and privacy notes".
**Avoid / status:** Consequence: progress is per browser, cannot follow a learner to another phone, and a teacher cannot see it.

### Q89. Is typed explanation text ever sent to the model provider? Verify request payload.
**Say:** In the default demo, no: it goes only to our own server. If the Groq option were switched on, yes, the typed text would be sent to Groq with the question.
**Technical:** `buildBody` in `src/server/groqModel.js` builds a user record containing `questionId`, `question`, `questionOdiaDraft`, `options`, `correctOptionId`, `selectedOption`, `learnerExplanation` (first 1,000 characters), `allowedMisconceptions` and the content status; `store: false`, `max_completion_tokens: 500`, `stream: false`. A test with a fake fetch pins that the explanation, the answer key and the Odia drafts are in the body and that the remediation text is not (`tests/iteration5-evidence.test.js`, added in Iteration 5). The system message instructs the model to treat `learnerExplanation` as untrusted data.
**Evidence:** `src/server/groqModel.js` lines 26–57; `tests/groqModel.test.js`, `tests/iteration5-evidence.test.js`; no live request has been made (Q34).
**Avoid / status:** Do not send real student text to any provider until the data controls are reviewed (`PATHASETU_PROVIDER_DATA_CONTROLS_ACK`) and eligibility is confirmed. Never say "the provider does not store it": `store:false` is a request, and the provider's retention terms are unverified.

### Q90. How are API keys kept secret?
**Say:** They live only in the server's environment variables, never in the code, the browser, the pack, logs or the trace export.
**Technical:** `GROQ_API_KEY` is read once in `server.js` and handed to the adapter; it is not in any served file. The trace export, preflight output and smoke/evaluate scripts redact key-shaped strings. `.env.example` lists names only. The event page also requires keys to be set via environment variables (official rule/brief).
**Evidence:** `src/server/server.js`; `src/core/export.js`; `scripts/lib/preflight.mjs`; `tests/preflight.test.js` (no key printed); a leak scan of the repository found no key (`evidence/iteration4/final/`).
**Avoid / status:** No key exists in this project to protect so far; the claim is about the design and the scans.

### Q91. How is demo access control implemented?
**Say:** A shared secret code. The server will not start in public-demo mode without a strong one, and every protected request must carry it.
**Technical:** `PATHASETU_PUBLIC_DEMO=true` (exactly `true`/`false`) requires `PATHASETU_DEMO_ACCESS_CODE` of at least 16 characters, no whitespace, at least 6 distinct characters, not repetitive or sequential, not a placeholder word. `/api/session`, `/api/pack`, `/api/recheck` check header `x-pathasetu-demo-code` with a constant-time comparison. Wrong or missing codes share a failure window (default 20 per 60 s per client); over budget → 429 `too_many_attempts` with `Retry-After`; the correct code is never refused by that window. Exact-origin allow-list for tunnels; 16 KB body limit; strict CSP.
**Evidence:** `src/server/access.js`, `src/server/server.js`; `tests/access-policy.test.js`, `public-demo.test.js`, `preflight.test.js`, `proxy-origin.test.js`; e2e M1–M7, T1–T4.
**Avoid / status:** Demo protection, not authentication (Q92).

### Q92. Why is a shared demo access code not production authentication?
**Say:** Everyone has the same key, so you cannot tell users apart, revoke one person, or know who did what. It is a lock on a demo door.
**Technical:** One secret; no per-user identity; no audit log; counters in memory and reset on restart; keyed by socket address (visitors behind one tunnel connection share a bucket); a leaked code gives full access until rotated; the code travels in a header that must be protected by HTTPS.
**Evidence:** `docs/BUILD_STATUS.md` "Limits and risks"; `docs/HTTPS_DEMO_RUNBOOK.md` (rotate and discard after the event).
**Avoid / status:** Never "production secure".

### Q93. What does `/api/health` expose and why is it intentionally open?
**Say:** Whether the server is up, which provider it uses and whether a code is needed. It is open because the app's offline check has to work before the learner can unlock.
**Technical:** Response `{ok, provider, model, accessRequired, publicDemo, time}`; `model` is null for the mock. No pack, no learner data, no key. The Origin check still applies.
**Evidence:** `src/server/server.js`; `tests/server.test.js`; capture HTTP checks.
**Avoid / status:** It discloses that a code is required and which provider is configured; accept this as a conscious trade-off.

### Q94. What is the risk of a shared IP/tunnel and in-memory rate limits?
**Say:** Through a tunnel every visitor looks like the same address, so they share one allowance. Wrong guesses could slow others down, but never someone with the right code. A restart resets the counts.
**Technical:** Buckets are keyed by `req.socket.remoteAddress`; behind a tunnel client that is the tunnel's local address. The failed-attempt window is separate from the authorised-request limits, and `authorise()` verifies the code first, so a correct code bypasses the failure counter. The map is capped (2,048 entries).
**Evidence:** `src/server/server.js` `rateLimit`, `authorise`; `tests/public-demo.test.js`.
**Avoid / status:** Real-tunnel behaviour is unverified (BLOCKED).

### Q95. What happens on a 401, 403, 429, timeout, malformed JSON or provider failure?
**Say:** 401: the app asks for the code. 403: the request came from an unexpected web address and is refused. 429: "too many attempts, wait" while keeping the saved work. Timeouts, bad JSON and provider failures: the answer stays saved, one failed attempt is counted and it retries later.
**Technical:** 401 → overlay, stored code removed only on 401; 403 `origin_not_allowed` → check `PATHASETU_ALLOWED_ORIGINS` behind a Host-rewriting proxy; 429 → keep the code and the saved pack, show a wait message; re-check abort after 8 s, malformed JSON, invalid diagnosis or HTTP 5xx → `recordRecheckDeferred`/`registerFailure`, backoff, pause after 5.
**Evidence:** `public/app.js`; `SYSTEM_ARCHITECTURE.md` section 5; e2e J1–J5, M, T; unit `public-demo.test.js`, `proxy-origin.test.js`.
**Avoid / status:** Provider failures are simulated, not observed.

### Q96. How does the system avoid duplicate answers and unbounded retries?
**Say:** A second tap on an answered question is ignored, and retries stop after five tries.
**Technical:** `submitAnswer` throws `already_answered_awaiting_continue` while the answered question is still shown; `ui.submitting` blocks a double tap; the queue is capped at 100 and a full queue rejects a new answer without changing state; repeated failures are merged into one trace line; `retry.js` pauses an entry after five failures.
**Evidence:** `tests/iteration2-core.test.js`, `tests/retry.test.js`; e2e C1–C2, G6, N1–N2.
**Avoid / status:** none.

### Q97. What are the data/privacy safeguards for minors?
**Say:** The design keeps nothing on our server and the demo is meant for synthetic data only. We have no consent screen or privacy notice, and the app is not ready for real children until the content is reviewed and a proper privacy review is done.
**Technical:** Safeguards in code: no accounts, no server-side learner storage, redacted trace export, optional free-text field, bounded input. Missing: consent flow, privacy notice, parental information, data-retention controls beyond clearing the browser, any legal review.
**Evidence:** `README.md`; `docs/BUILD_STATUS.md`; the pack banner "Prototype content · not for real learners". Legal/privacy review: **NOT DONE**.
**Avoid / status:** Do not say "child-safe" or "compliant".

### Q98. What has been security-tested, and what still needs an independent security review?
**Say:** We have automated tests for the access rules and the safe-failure cases. Nobody independent has reviewed it.
**Technical:** Tested by our own automated tests: access-code strength rules, 401/403/429 behaviour, the origin allow-list, the 16 KB body limit, traversal and private-path refusal, the CSP / `nosniff` / `no-referrer` headers on every response (added in Iteration 5), secrets not printed by preflight and the trace export, no `/api` caching by the service worker. The constant-time code comparison is in the code (`timingSafeEqual`); no test measures timing. Not done: independent code review, penetration test, dependency audit (there are no dependencies), TLS configuration (outside our control), load testing.
**Evidence:** `tests/access-policy.test.js`, `public-demo.test.js`, `proxy-origin.test.js`, `server.test.js`, `preflight.test.js`, `iteration5-evidence.test.js`; `npm run capture` HTTP checks.
**Avoid / status:** "Security-tested" means unit tests of our own rules, not an audit.

## Testing and evaluation

### Q99. How many unit, browser, capture, accessibility and preflight checks passed in the exact current tree?
**Say:** 207 unit tests, 100 browser checks, 19 capture checks, 462 accessibility checks, and preflight passes — all in a Linux sandbox, none on a phone. Older figures (182 at the Iteration 4 baseline, 198 at Iteration 5) are history.
**Technical:** Iteration 6 final (`evidence/iteration6/final/`): `npm test` 207/207; `npm run capture` 19 passed, 0 failed, 0 blocked; `npm run e2e` 100 passed, 0 failed; `npm run a11y` 33 state/viewport combinations, 462 checks, 0 failed; `check`, `check:content`, `preflight` exit 0. Iteration 6 baseline on the untouched Iteration 5 tree reproduced 198 unit tests, 95 browser checks and the rest (`evidence/iteration6/baseline/`). Iteration 4 baseline: 182 unit tests.
**Evidence:** `evidence/iteration5/baseline/exit-codes.txt` and the `npm-*.txt` files.
**Avoid / status:** Always quote the environment with the number (Q100).

### Q100. Which numbers came from which environment?
**Say:** All numbers above came from our Linux build sandbox with headless Chromium. On the team's managed machine, the unit tests, syntax and content checks passed and the browser tests were blocked by a browser policy.
**Technical:** Sandbox: Node v22.22.0, npm 10.9.4, Chromium 141.0.7390.37. Team machine (Iteration 3 archive and an Iteration 4 verification): `npm test` passed, browser navigation blocked by `ERR_BLOCKED_BY_ADMINISTRATOR`; capture produced 10 passing HTTP/API checks and one blocked browser journey. Phone: none.
**Evidence:** `evidence/iteration5/baseline/environment.txt`; `docs/BUILD_STATUS.md` header. The managed-machine result is **team-reported**.
**Avoid / status:** Never merge the two sets of results.

### Q101. What does a unit test prove and what does it not prove?
**Say:** It proves a piece of code does what we wrote it to do in a controlled case. It does not prove the app is useful or works on a phone.
**Technical:** Unit tests here call functions with fixed inputs (for example `validateDiagnosis` with an unlisted ID) and also run the real server on a loopback port. They do not exercise a browser, a real network, a provider or a learner.
**Evidence:** `tests/*.test.js` (207 in the Iteration 6 final run).
**Avoid / status:** Do not use "207 tests passed" as evidence of quality of education or Odia.

### Q102. What does a headless browser test prove and what does it not prove?
**Say:** That the page behaves as scripted in a real browser engine, including going offline. It is not a phone and not a person.
**Technical:** `scripts/browser-regression.mjs` drives Chromium through the DevTools Protocol, toggles network emulation, reloads, checks DOM text, IndexedDB and cache contents. It does not exercise Safari/WebKit, Samsung Internet, real touch, real radios, battery or memory limits.
**Evidence:** `evidence/iteration5/baseline/browser-regression.json` (95 checks).
**Avoid / status:** Say "headless Chromium", not "tested on mobile".

### Q103. What do the accessibility viewport checks prove—and why are they not screen-reader tests?
**Say:** They check a list of measurable things: names on controls, touch size, focus visibility, contrast, text size, no sideways scrolling. They cannot tell how the app sounds with TalkBack or VoiceOver.
**Technical:** 33 state/viewport combinations over five widths (320, 360, 393, 412 and 768 px) and seven app states (initial, draft typed, result, trace open, Bridge Practice answered, offline with a queued re-check, unlock dialog), 462 checks, 0 failed. Not covered: screen-reader announcements, reading order as spoken, gestures, Odia legibility, zoom and font-scale settings on phones.
**Evidence:** `evidence/iteration5/baseline/accessibility/a11y-report.md`; `docs/BUILD_STATUS.md`. Screen-reader support: **NOT TESTED**.
**Avoid / status:** Never "accessible" or "WCAG compliant". Say "passes our automated accessibility checks in emulated viewports".

### Q104. What is the 47-case evaluation set, who wrote it, and has it been reviewed?
**Say:** 47 English test answers the team wrote with AI help, to test the diagnosis step. Nobody outside has reviewed the labels.
**Technical:** Categories: 8 correct reasoning, 27 genuine misconception (3 of them "right option, wrong reason"), 4 ambiguous, 8 insufficient information (one is a prompt-injection probe). Provenance field: "team, AI-assisted (Claude, 13 Oct 2026)"; review status `TEAM_AUTHORED_UNVALIDATED`; no Odia or Roman-Odia case.
**Evidence:** `evaluation/cases.json`; `docs/EVALUATION.md`; `evaluation/EVALUATION_REVIEW_TEMPLATE.csv`. content-reviewed: **no**.
**Avoid / status:** "Team-authored, unvalidated, English only."

### Q105. What does 47/47 schema compatibility mean?
**Say:** Every reply from the mock had the right shape and an allowed ID. It says the plumbing is consistent, not that the answers are right.
**Technical:** Part A of the report: valid shape, matching question, allowed misconception ID, accepted by the validator. The mock is written to satisfy this, so 47/47 is expected and almost uninformative; it would matter for a live model.
**Evidence:** `evidence/iteration4/final/evaluation/evaluation-baseline-*.md`.
**Avoid / status:** Never present 47/47 as accuracy.

### Q106. What does 34/47 agreement mean, and why is it not real-world accuracy?
**Say:** The rule gave the same label as the team's own label on 34 of the 47 cases. The labels are ours and unreviewed, the cases are English, and the rule only looks at the chosen option.
**Technical:** 72% (95% Wilson interval 58%–83%). By category: correct reasoning 8/8; genuine misconception 24/27; ambiguous 0/4; insufficient information 2/8. False-positive misconceptions on correct reasoning: 0/8.
**Evidence:** `docs/EVALUATION.md`; `evidence/iteration4/final/evaluation/`. measured result (rule, synthetic English).
**Avoid / status:** Not accuracy, not Odia performance, not a model result.

### Q107. Why is abstaining on only 2/12 ambiguous/insufficient examples a concern?
**Say:** Because it means that when the evidence is weak the rule still sounds sure. In teaching, confident wrong feedback is worse than saying "I'm not sure".
**Technical:** The mock abstains only for explanations shorter than 8 characters. Of the 12 ambiguous or insufficient cases, 10 received a confident label. The report lists false confidence and over-abstention as separate lines for exactly this reason.
**Evidence:** `docs/EVALUATION.md` "False confidence and abstention".
**Avoid / status:** Volunteer it. It is the strongest argument for a real model slot and for the evaluation.

### Q108. Has any live model been evaluated? Has Odia accuracy been measured?
**Say:** No live model has been evaluated, and no Odia accuracy has been measured. Both are blocked or not done yet, and we say so plainly.
**Technical:** `npm run evaluate -- --provider groq` exits 2 without credentials (and also needs a data-controls acknowledgement); nothing was sent. There are no Odia or Roman-Odia cases to measure with.
**Evidence:** `evidence/iteration5/gates/`; `docs/EVALUATION.md`. status: **NOT RUN / NOT EVALUATED**.
**Avoid / status:** Do not estimate.

### Q109. Has any real learner benefited or shown measured learning gain?
**Say:** No real learner has used it yet, so there is no measured benefit. What we have measured is software behaviour, not learning.
**Technical:** No pilot, no user study, no usability session, no analytics.
**Evidence:** none exists. status: **not tested**.
**Avoid / status:** Do not use testimonials or invented personas as evidence. The guide's learner scenario is marked illustrative.

### Q110. What would a valid future evaluation design look like?
**Say:** Teachers write and label answers in Odia and Roman Odia; we measure the model against them, including how often it is wrongly confident; then a few consenting learners try it; later a small comparison study with approval.
**Technical:** (1) Reviewer-authored cases with independent labels (at least two reviewers, agreement measured). (2) Live model vs the deterministic baseline on identical cases; report validity, agreement per language, false-positive misconceptions, false confidence, abstention, latency, errors, with intervals. (3) Think-aloud sessions for usability on the target phones. (4) Pre/post or A/B learning study with an ethics approval and informed consent.
**Evidence:** `docs/EVALUATION.md`; `docs/REVIEWER_GUIDE.md`. status: plan only.
**Avoid / status:** Do not promise dates or results.

## Product feasibility and scaling

### Q111. Where is Pathasetu currently deployed?
**Say:** Nowhere yet. It runs on a laptop, and no public address exists. A private HTTPS path is prepared but has not been run.
**Technical:** `npm start` listens on `127.0.0.1:4173`. No tunnel, host or cloud account was created. The server needs a persistent Node process, so a serverless host will not run it unchanged.
**Evidence:** `evidence/iteration5/gates/GATE_STATUS.md` (tunnel BLOCKED); `docs/HTTPS_DEMO_RUNBOOK.md`.
**Avoid / status:** Do not say "live" or "deployed". Say "runs locally; a private HTTPS demo path is prepared but untested".

### Q112. What provider/hosting cost has actually been measured, and what costs are unknown?
**Say:** None measured. We have not made a single paid or metered request, and we have no hosting bill.
**Technical:** Unknown: provider price per request and rate limits for the chosen model, tunnel/hosting cost, data-plan cost for learners. Known: the app itself has no dependencies and its served files total roughly 140 KB uncompressed (measured on 13 Oct 2026), served without compression.
**Evidence:** none for cost. status: **unknown**. File sizes: `public/`, `src/core/`, `content/`.
**Avoid / status:** Do not quote prices from memory.

### Q113. What would be needed to add another subject or grade?
**Say:** Questions written and reviewed by a teacher for that subject, each with its wrong ideas listed and linked to the wrong options. The software would not need to change much.
**Technical:** A new pack file in the existing schema (`validateItem` rules), misconception lists, remediation text, Odia drafts and bridge mappings; reviewers per item; evaluation cases. The server loads one fixed path (`content/electricity-pack.json`) and the browser stores one pack, so choosing among several packs is **not implemented**.
**Evidence:** `src/core/content.js`, `src/server/server.js` (`loadPack()` default path).
**Avoid / status:** "The schema is generic; only one pack has been built or tried."

### Q114. What would be needed to support a new language reliably?
**Say:** Native-speaker reviewers, a test set written by them, and evidence that whatever model is used handles that language. We cannot claim a language we have not measured.
**Technical:** Content fields (`*OdiaDraft`) are named for Odia; a second language needs schema and UI changes (there is no language switch), fonts and input handling, bridge mappings, an evaluation set per language, and a model evaluation per language. For Kui: the repository holds no Kui material or research, so what is feasible is **unknown**; any approach would need community and linguist input.
**Evidence:** `public/app.js` (`lang="or"` spans); `docs/EVALUATION.md` "Languages stay apart". status: **NOT IMPLEMENTED**.
**Avoid / status:** Never "supports tribal languages".

### Q115. How might the service scale to more users, and where are current bottlenecks?
**Say:** Almost all work happens on the learner's phone, so the server load is small: files, the question pack and the second check. The limits are the single server process and any outside model's limits and cost.
**Technical:** The server is stateless apart from in-memory rate counters, so it could be placed behind a load balancer only after the counters move to shared storage. A hosted model adds latency (timeout 5.2 s in the adapter, 8 s in the browser), rate limits and cost per re-check. No load test has been run.
**Evidence:** `src/server/server.js`; no performance data. status: **not tested**.
**Avoid / status:** Do not give user numbers.

### Q116. What needs to change before production use in a school?
**Say:** Teacher-reviewed content, real tests on the learners' phones, a privacy and consent process for children, proper sign-in if we keep any data, and a live-model evaluation if we use one.
**Technical:** Required before school use: content review; phone testing on the actual devices; privacy/legal review for minors; accounts or another way to separate learners on a shared phone (Q128); a teacher view if teachers are to use it; hosting with proper authentication and monitoring; an evaluation of any model; accessibility testing with screen readers; written organiser/ethics approvals as applicable.
**Evidence:** `docs/BUILD_STATUS.md` "Next priorities".
**Avoid / status:** Do not say it is "pilot-ready".

### Q117. What is the next development priority after the hackathon?
**Say:** Real-world validation, not more features: phones, a teacher review, and a first honest model evaluation in Odia.
**Technical:** (1) Run the phone plan on the seven combinations. (2) Teacher review of the 8 items and the 8 bridge mappings. (3) Reviewer-authored Odia/Roman-Odia evaluation set. (4) Live evaluation with a provider whose data terms are confirmed. (5) Decide on learner profiles for shared phones.
**Evidence:** `docs/BUILD_STATUS.md` "Next priorities".
**Avoid / status:** A priority list is a plan, not a commitment or a result.

## Competition and defence

### Q118. How does the implementation map to the official rubric?
**Say:** Strongest on the agentic workflow and offline behaviour in code and tests; the language side is draft; presentation depends on the pitch.
**Technical:** Three official lists exist and they must not be merged. (a) Event page jury metrics: Autonomous Agentic Architecture 30% (our loop, validator, planner, trace, honestly a deterministic workflow), Regional Language Localization 20% (Odia drafts and bridge; no Kui or voice; unreviewed), Offline & Edge 20% (service worker, IndexedDB, queue; headless-tested only), UI/UX & Grand Pitch Defense 30% (phone-first UI, automated a11y checks; pitch not yet delivered). (b) Problem PDF: core (problem understanding, technical implementation, presentation, pitch deck) and bonus (regional language beyond labels, ease of use/accessibility, offline compatibility, agentic framework fit). (c) Rules page 5.1: Innovation, Technical Execution, Presentation, Feasibility, Adherence to Constraints.
**Evidence:** official rule/brief — event page, problem PDF, rules page; `PROJECT_GUIDE_PLAIN_LANGUAGE.md` section 7.
**Avoid / status:** Do not predict scores. Do not claim "adherence to constraints" without resolving Q127.

### Q119. What is the strongest technically evidenced feature?
**Say:** The loop that keeps working through failure: answers are saved, queued, retried with a limit, recovered after a restart or corrupt state, and every step is traced.
**Technical:** 207 unit tests and 100 browser checks cover duplicate submits, two tabs, offline reload, cold-start recovery, provider failures and timeouts, paused retries, storage failure and corrupt state (headless Chromium).
**Evidence:** `tests/retry.test.js`, `storage-resilience.test.js`; e2e C–R. browser-tested, **not phone-tested**.
**Avoid / status:** "Evidenced in headless tests" is the honest phrase.

### Q120. What is the weakest part and how are we mitigating it?
**Say:** The intelligence of the diagnosis: in the demo it is a rule, the Odia is unreviewed, and no phone has tested it. We have built the review and evaluation tools to fix that, but the work itself is not done.
**Technical:** Mitigations in place: draft labels everywhere, provider label on screen, provisional wording, reviewer guide, evaluation harness, phone plan. Mitigations pending: all human validation.
**Evidence:** `README.md`; `docs/BUILD_STATUS.md`; `evidence/iteration5/gates/GATE_STATUS.md`.
**Avoid / status:** Do not call the tools "validation". They are preparation.

### Q121. What happens during the live demo if the provider/network fails?
**Say:** The demo doesn't depend on an outside provider; the default is the local rule. If the network fails we show it working offline on purpose. If the laptop server fails we show a recording that we label as a recording.
**Technical:** The demo story uses the mock provider. Network loss is a feature to demonstrate. If the tunnel or code fails: restart locally on the laptop. Fallback and wording are in `PITCH_SCRIPTS.md` ("demo breaks").
**Evidence:** `docs/PITCH_SCRIPTS.md`; `docs/EVENT_DAY_CHECKLIST.md`.
**Avoid / status:** Never present a recording as live. Never pretend the mock is a live model.

### Q122. How will the seven-minute pitch be divided minute by minute?
**Say:** Problem and learner (0:00–0:45), solution (0:45–1:15), why it is agentic (1:15–2:00), architecture (2:00–2:45), live learning loop (2:45–4:15), offline and reconnect with Bridge Practice (4:15–5:30), evidence (5:30–6:10), limits and next steps (6:10–7:00).
**Technical:** Cues, exact on-screen actions and fallbacks are in `docs/PITCH_SCRIPTS.md`. The event page lists a 7-minute live MVP pitch plus 5 minutes of CTO Q&A for the final.
**Evidence:** official rule/brief — event page; `docs/PITCH_SCRIPTS.md`.
**Avoid / status:** If the organisers give a different slot, adjust; the page is inconsistent about times (Q143).

### Q123. What will be shown at the mid-evaluation checkpoint?
**Say:** The commit history, the agent workflow running live, and the architecture picture — the three things the event page says the checkpoint covers.
**Technical:** Event page: Stage 2 covers a GitHub commit audit, a working agent-workflow demo and architecture, and is worth 30%; the bottom half is eliminated. Plan: two minutes, in the order commits → live loop (answer, trace) → offline/reconnect → architecture slide. Be ready for the history to show every commit authored as "Claude (AI-assisted build)", with dates 12–13 Oct 2026 (Q127, Q142).
**Evidence:** official rule/brief — event page; `docs/PITCH_SCRIPTS.md` (2-minute version); `git log`.
**Avoid / status:** The slot time is ambiguous on the public pages; use the assigned one. Missing the slot forfeits the stage (rules 4.2).

### Q124. What is the single most important limitation to volunteer before a judge asks?
**Say:** "In today's demo the diagnosis step is a rule, not a language model, and no live model call has ever been made. The Odia is a draft that no teacher has reviewed, and no phone has run it. What we are showing is the tested workflow around that slot."
**Technical:** If forced to choose one: the AI step is a stand-in. The other limits (unreviewed content, no phone test, build-window question) should be ready as follow-ups.
**Evidence:** `README.md`, footer label, `docs/PROJECT_GUIDE_PLAIN_LANGUAGE.md` section 6.
**Avoid / status:** Volunteering it turns the biggest risk into credibility.

### Q125. What did the team build, what did AI assist with, and how can the provenance be described accurately?
**Say:** The software was written with AI assistance: an earlier AI session made the first version, and later sessions with Claude added tests, reliability work, tooling and documents. The history is in Git and we do not hide it.
**Technical:** The repository began as an archive (`Pathasetu_MVP_2026-10-12.zip`, SHA-256 `514e5fa7…c4587`) produced by an earlier AI-assisted session. Iteration 2 (12 Oct) and iterations 3–5 (13 Oct) were AI-assisted (Claude). Every commit in the history carries the author "Claude (AI-assisted build)" (count: `git rev-list --count HEAD`). Iteration 3 was rebuilt after a sandbox reset (commit hashes and timestamps are the rebuild's); this is disclosed in `docs/BUILD_STATUS.md`. What the team members themselves wrote, decided or tested is **not recorded in the repository**: prepare a truthful statement.
**Evidence:** `git log`; `docs/BUILD_STATUS.md` Provenance; `README.md` Provenance.
**Avoid / status:** Never claim sole authorship, never claim the work was built during the event window, never backdate or rewrite history.

### Q126. What evidence supports every major slide claim?
**Say:** Each claim has a row in the claim matrix: what we may say, the file that proves it, its status and what not to say.
**Technical:** `docs/CLAIM_EVIDENCE_MATRIX.csv`; a test checks that every cited evidence path exists and that the documents contain none of the prohibited phrases outside a negation.
**Evidence:** `docs/CLAIM_EVIDENCE_MATRIX.csv`; `tests/iteration5-docs.test.js`.
**Avoid / status:** If a slide says something that is not in the matrix, take it off the slide.

## Further questions found in the repository and the official rules

### Q127. Was the code built during the competition hours?
**Say:** No. Most of it was built on 12–13 October with AI assistance, before the event, and the commit dates show that. The rules say code must be built during competition hours. The team reports that the organisers allowed early work; that is team-reported, and we have no saved message to show you.
**Technical:** The rules page (section 4.1) says all code and architecture must be built during the competition hours, forbids templates and pre-built repositories, and says GitHub plagiarism scanners and commit-timeline analysers are used. The event page says repositories are audited by commit diffs. `docs/BUILD_STATUS.md` records the organiser clarification as team-reported. Commit dates 12–13 Oct 2026 are visible and unaltered; every commit is authored "Claude (AI-assisted build)".
**Evidence:** official rule/brief — <https://www.nirmit.space/rules> and event page; team-reported clarification; `docs/BUILD_STATUS.md` Provenance; `git log --date=iso`.
**Avoid / status:** This is a high-risk topic, so state the facts plainly and keep the dates visible. Do not say "the organisers approved it in writing" unless a saved message is added to the repository. **Status: team-reported; not inspectable here.**

### Q128. What if two learners share the same phone?
**Say:** Today they would share one saved record, which is a real gap, since the official example is a shared family phone. Learner profiles are not built, so the app does not safely separate several learners.
**Technical:** One local session record in IndexedDB under the key `session`; no profile selector, no PIN, no way to separate learners. A second learner's answers would add to the first's state and the planner would treat them as one person.
**Evidence:** `src/core/storage.js`; `public/app.js`. **NOT IMPLEMENTED.**
**Avoid / status:** Do not say it supports shared devices. It supports a device with weak connectivity; sharing is an unaddressed part of the brief.

### Q129. The planner mentions confirmed gaps. Does the app ever record one?
**Say:** No. In the app every result stays provisional, so that part of the planner never fires. It is there for a future, trusted source.
**Technical:** `chooseNextItem` subtracts 10 for items that can address a confirmed misconception, but `confirmedMisconceptions` is only changed inside `recheckQueued` when `trusted` is true, and `drainQueue` always passes `trusted: false`. Only unit tests exercise the trusted path. In use, selection depends on the concept just re-checked and on how often each question was answered.
**Evidence:** `public/app.js` (the `recheckQueued` call); `src/core/agent.js`; `tests/agent.test.js`; `tests/iteration5-evidence.test.js` (pins it).
**Avoid / status:** Do not describe the planner as personalising on confirmed gaps. This is a deliberate safety choice, and also a limit.

### Q130. What if a learner types instructions to the AI in the explanation box (prompt injection)?
**Say:** With the default rule, nothing happens: the text is ignored. With a hosted model the text is passed as data and the answer still has to pass the validator, so the worst case is a rejected or wrong label, not a changed rule.
**Technical:** The Groq system prompt says the learner's explanation is untrusted data and instructions inside it are to be ignored; the response is constrained to an allow-list schema and re-validated server-side and client-side. The evaluation set includes one prompt-injection probe case. A model could still be misled into choosing a wrong allowed ID.
**Evidence:** `src/server/groqModel.js`; `evaluation/cases.json`; not run against a live model.
**Avoid / status:** "Constrained, not immune."

### Q131. What do "10 learning sessions left" mean, and what happens at zero?
**Say:** It is a simple counter of answers in the demo, from 10 down to 0. Nothing special happens at zero.
**Technical:** `sessionsRemaining` starts at 10 and drops by one per accepted answer, floored at 0; the progress bar fills accordingly. The code does not stop the learner at zero. The number is a placeholder with no pedagogical basis.
**Evidence:** `src/core/agent.js`, `public/app.js` `renderProgress`.
**Avoid / status:** Do not present "10 sessions" as a researched daily limit.

### Q132. Can a learner choose or skip a question, and what happens after all eight?
**Say:** No choosing or skipping: the planner picks. After all eight have been answered the planner keeps recycling, preferring those answered least.
**Technical:** `chooseNextItem` adds +5 per earlier answer to an item's score, so least-answered items win; ties by ID. There is no completion screen, summary or reset.
**Evidence:** `src/core/agent.js`; `NAVIGATION_AND_WORKFLOW.md` section 3.
**Avoid / status:** "End-of-chapter completion" is NOT IMPLEMENTED.

### Q133. The code comment says only browser-safe modules are exposed. Is that true?
**Say:** Almost. The server serves any JavaScript file in the shared core folder, including one the browser never uses. Nothing secret is in it, and the content and server folders are not reachable.
**Technical:** `safeStaticPath` allows `/core/<name>.js` for any file name matching `[a-zA-Z0-9_-]+\.js` in `src/core/`; that includes `content.js` (pack loader). Paths into `src/server/`, `content/` and above are refused; the service worker caches only its listed modules. Left unchanged because it exposes no data.
**Evidence:** `src/server/server.js`; `tests/iteration5-evidence.test.js` (traversal and private-path tests; content.js status pinned).
**Avoid / status:** Volunteer it as a minor tidy-up rather than a vulnerability.

### Q134. Can it be installed like an app on the home screen?
**Say:** It has the basic web-app files that allow it, but we have not tested installing it on any phone.
**Technical:** `public/manifest.webmanifest` (name, standalone display, theme colour, an SVG icon with "any maskable") and the service worker are present. The manifest lists only an SVG icon (some platforms expect PNG icons; not verified here); there is no install button in the app.
**Evidence:** `public/manifest.webmanifest`. status: implemented; **install on phone NOT TESTED**.
**Avoid / status:** Do not say "installable PWA" as a tested fact.

### Q135. Will the Odia text display correctly on every phone?
**Say:** We don't know. The app does not bring its own Odia font; the phone's fonts decide.
**Technical:** `styles.css` uses system fonts; text is marked `lang="or"` so the browser picks an Odia font if the device has one. In our sandbox the Odia rendered because the machine has a system Odia font. The automated 12 px text floor is a minimum, not a recommendation for Odia script.
**Evidence:** `docs/BUILD_STATUS.md` limits. status: **NOT TESTED on phones**; legibility **NOT REVIEWED**.
**Avoid / status:** Do not claim "renders Odia correctly".

### Q136. Why not run a small language model on the phone to make it truly offline?
**Say:** We did not build or test that. It would add large downloads and heavy use of memory on shared phones, and we have no evidence yet that a small model handles Odia science reasoning.
**Technical:** Option space (not built): WebGPU/WASM in-browser models; they would need hundreds of MB to GB of storage, capable hardware and a per-language evaluation. The current design keeps the model slot behind a validated interface so such a model could be tried later.
**Evidence:** none; **NOT IMPLEMENTED**, **NOT TESTED**.
**Avoid / status:** Do not promise it.

### Q137. Why Groq, and is it allowed under the event rules?
**Say:** Groq is the provider the team has access to and the adapter is built for. We have not used it live. The team reports that the organisers said any API may be used; that is team-reported, and the event page's own wording is narrower.
**Technical:** The event page says external open-source LLM API use is permitted and keys must be set through environment variables; the team's reported clarification says all APIs are allowed. Quote them separately. The default model name `openai/gpt-oss-20b` is an open-weight model served by Groq as far as we know. A free Gemini tier may train on submitted content, so it is not used for learner text.
**Evidence:** official rule/brief — event page; team-reported clarification; `docs/BUILD_STATUS.md` Limits. Live use: **not run (BLOCKED, no credentials)**.
**Avoid / status:** Do not say "the rules allow Groq" as if it were written on the event page; say what the page says and that the broader permission is team-reported.

### Q138. How much data does it use on a weak, expensive connection?
**Say:** The app is small, about 140 KB of its own files without compression, and loads once. After that the only traffic is a small health check every 15 seconds and a short request for each re-check.
**Technical:** Measured sizes (uncompressed): `app.js` 43 KB, `styles.css` 20 KB, `index.html` 7 KB, core modules about 42 KB, pack 27 KB. The server does not compress. A re-check body is at most 16 KB and typically a few hundred bytes. The 15 s health probe runs only while a tab is open. Real mobile data use has not been measured.
**Evidence:** file sizes on 13 Oct 2026; `src/server/server.js` (no compression).
**Avoid / status:** Do not claim "low data" as a measured property.

### Q139. Which of the problem PDF's bonus criteria do we claim?
**Say:** Offline compatibility, with a headless-test basis; ease of use and accessibility, with automated checks only; regional language support, in draft form; agentic framework fit, with a justified no-framework choice.
**Technical:** The PDF's bonus list: regional-language support beyond translated labels (we show bilingual draft text and a term-matching exercise; no Kui, no voice, unreviewed); ease of use/accessibility (44 px targets, contrast, focus visible, 320 px reflow; not screen-reader tested); offline compatibility (service worker, IndexedDB, queue; headless only); type of agentic framework (deterministic workflow, no framework, justified). The exact wording of the "ease of use/accessibility" bullet should be rechecked on the PDF before the pitch.
**Evidence:** official rule/brief — problem PDF; `PROJECT_GUIDE_PLAIN_LANGUAGE.md` section 7.
**Avoid / status:** Claim each with its caveat, never as full compliance.

### Q140. Is there RAG, embeddings or a vector database?
**Say:** No. Nothing like that is used. The content is eight hand-written questions in one file.
**Technical:** No retrieval step, no embedding model, no vector store, no document ingestion. The pack is read whole by the server and sent whole to the browser.
**Evidence:** `package.json` (no dependencies); `src/`.
**Avoid / status:** Do not mention RAG as a feature.

### Q141. What does "provisional" mean on the screen?
**Say:** It means "our best first guess, not a conclusion about you". Nothing in the app confirms mastery or a gap.
**Technical:** Every stored diagnosis carries `provisional: true`; the headings are "Possible concept gap — provisional", "Answer key match (not independently verified)" and "Let's clarify your thinking".
**Evidence:** `src/core/agent.js`; `public/app.js`; e2e B1.
**Avoid / status:** It is a safety label, not a confidence score.

### Q142. What will the GitHub commit audit show?
**Say:** Every commit is by one AI-assisted author name, dated 12 and 13 October, each with an honest message. We explain it before they ask.
**Technical:** `git log` shows: the imported archive commit (message records its SHA-256 and that it had no history), iteration 2 fixes and tests (12 Oct), iterations 3–5 (13 Oct) with a rebuild disclosure for iteration 3. No human author is recorded. No squash, no rewrite, no backdating. Prepare a short statement of which team member did what, since the history cannot show it.
**Evidence:** `git log --format='%an | %ad | %s' --date=iso`.
**Avoid / status:** Do not add false authorship to the history now.

### Q143. What is the exact assigned mid-evaluation and final slot?
**Say:** We have not been given one in writing. The public pages are inconsistent, so we will confirm it with the organisers.
**Technical:** Event page: Day 1 8:00 AM–6:00 PM, Day 2 10:00 AM–3:00 PM, and a mid-evaluation of "04:00 PM – 07:00 PM (Day 1)", which runs past the listed Day 1 end; the event is called 24 hours while the listed hours add up to about 31; weights are 30/70 for stages and 30/20/20/30 for jury metrics. Rule 4.2: missing the slot without written permission forfeits.
**Evidence:** official rule/brief — event page and rules page.
**Avoid / status:** Do not guess; ask and write the answer down.

### Q144. What happens in a private/incognito window?
**Say:** Storage may be blocked or deleted when the window closes. The app notices and tells the learner that progress is not being saved.
**Technical:** `createIndexedDbStorage` falls back to memory when IndexedDB fails; the storage line and a persistent banner say so. Behaviour in specific browsers' private modes: not tested.
**Evidence:** e2e P1–P4; `src/core/storage.js`.
**Avoid / status:** Do not name specific browsers' behaviour as tested.

### Q145. Can a learner change the saved data and fake their results?
**Say:** Yes, someone with developer tools could. It is local practice data on their own phone, not an exam record, and nothing else depends on it.
**Technical:** IndexedDB has no integrity protection; the validator and repair step check shape, not authenticity. Nothing downstream (no teacher, no certificate) depends on it today.
**Evidence:** `src/core/recovery.js`.
**Avoid / status:** Don't suggest the trace is tamper-proof evidence.

### Q146. How is the decision trace different from logging?
**Say:** The trace is the learner-visible record of why the app did each thing. It stays on the phone; the server does not receive it.
**Technical:** `appendTrace` writes structured events (type, ids, reason, `network:false` for bridge events) into the saved state (cap 200); the panel shows the newest 30; the export removes typed text and redacts secrets. Server logging is one start-up line.
**Evidence:** `src/core/agent.js`, `src/core/export.js`; e2e A, K7, K8, S1–S3.
**Avoid / status:** The trace records decisions, not a full audit trail.

### Q147. What does running the demo cost?
**Say:** Nothing so far. We use no paid services and have made no metered requests. Provider and hosting costs are unknown until we do.
**Technical:** The default stack is a laptop and Node. A tunnel or host, if used, may have its own limits or costs depending on the product the team chooses (**unknown**). A live model call has a cost (**unknown**, not measured).
**Evidence:** none. status: **unknown**.
**Avoid / status:** No numbers from memory.

### Q148. How will the demo reach the judges' devices on a monitored Wi-Fi?
**Say:** The main demo runs on our laptop; judges watch the screen. A phone demo over a tunnel is a bonus only if it has been tested.
**Technical:** The rules say the venue Wi-Fi is monitored (rules 3.3). A tunnel needs outbound access that may be blocked; the offline demo does not need it. The preflight and runbook reduce setup errors but a real tunnel run has not been done.
**Evidence:** `docs/HTTPS_DEMO_RUNBOOK.md`; `docs/EVENT_DAY_CHECKLIST.md`; official rule/brief — rules page.
**Avoid / status:** Don't promise a live phone demo you haven't rehearsed.

### Q149. What if the judges ask us to test it unguided with a first-time user?
**Say:** We should arrange that with a teammate who hasn't used it, and be open that no real learner has tried it.
**Technical:** The PDF's live-demo checks include a first-time user unguided, Odia text or voice, and switching the network off with later sync. We cover the network switch-off; voice is not implemented; the unguided first-time user test has not been done.
**Evidence:** official rule/brief — problem PDF; `docs/PITCH_SCRIPTS.md`.
**Avoid / status:** Don't rehearse the first-time user so much that it stops being first-time.

### Q150. Is the answer key visible to the learner's browser?
**Say:** Yes. The browser needs it to work offline, so the questions arrive with the correct option. This is practice, not a secured exam.
**Technical:** `/api/pack` returns each full item including `correctOptionId`, explanations and remediation; the browser stores it in IndexedDB. A curious learner can read it with developer tools. The server also keeps the key and uses it only in the Groq request context.
**Evidence:** `src/server/server.js` (`/api/pack`), `content/electricity-pack.json`.
**Avoid / status:** Do not call it an assessment tool.

### Q151. If a hosted model were switched on, how would the screen and the trace show it, and how do you know?
**Say:** The footer would read CONFIGURED · GROQ, the model name and ACCURACY UNVALIDATED, the box where she types would say her text goes on to a hosted model, and the saved record would say the re-check came from GROQ. By default it says MOCK PROVIDER · DEMO RULES · NO LIVE AI.
**Technical:** The labels come from the server's `/api/health` report, not from a setting in the page; each re-checked answer stores `RECHECKED_<PROVIDER>`, and the trace export carries the provider and model. A browser scenario (Q1–Q5) answers `/api/health` and `/api/recheck` with a stub that claims to be Groq and checks the footer, the hint, the result card, the notice and the exported trace. It found and fixed a defect: the answer-box hint used to say "This mock does not interpret the explanation" even for a Groq-configured server.
**Evidence:** `public/app.js` (`explanationPlaceholder`, `renderConnection`); `scripts/browser-regression.mjs` scenario Q; `tests/iteration6-claims.test.js`; headless Chromium with a stub, **no live model call**.
**Avoid / status:** The stub proves the labels, not model behaviour. Do not say the app is "LLM-powered": no live request has been made (live Groq is BLOCKED, credentials not configured).

