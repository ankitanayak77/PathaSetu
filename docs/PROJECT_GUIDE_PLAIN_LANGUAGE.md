# Pathasetu in plain language — what it is, what it does today, and what we cannot yet claim

Written 13 October 2026 for every registered team member. You should be able to explain Pathasetu to a parent, a teacher and a CTO after reading this, without reading code. Every statement about the software points to a file you can open. Every statement about the event points to an official page. Nothing here is marketing: where the code or the evidence does not support an answer, this guide says **not implemented**, **not tested**, **not reviewed** or **unknown**.

Companion files: `SYSTEM_ARCHITECTURE.md` (the picture), `NAVIGATION_AND_WORKFLOW.md` (every screen and journey), `JURY_QA_BANK.md` (176 questions with answers), `PITCH_SCRIPTS.md` (what to say), `CLAIM_EVIDENCE_MATRIX.csv` (what we may say, and what we must not). Added in Iteration 7: `DECISION_REGISTER.md` (every significant decision and its status), `DECISION_LOG.csv` (one row per decision), `BOARD_CLASS_BOOK_COMPARISON.md` and `BOOK_CROSSWALK.csv` (board, class, book and the eight-item crosswalk), `AUTHENTICATION_AND_TRUST_LEVELS.md` (access levels A0–A6) and `DECISION_AUDIT_REPORT.md` (what the audit found).

## 0. How to read the status words

Every claim carries one of these labels. They are the only ones used.

| Label | Meaning here |
|---|---|
| **official rule/brief** | Stated on an official NEXTECH page. Cited by URL. |
| **implemented** | The code exists in this repository at the path given. It says nothing about whether it works well. |
| **unit-tested** | An automated test in `tests/` runs the code in Node and passes. |
| **browser-tested** | A scripted headless Chromium run (`npm run e2e`, `capture`, `a11y`) passed. Headless Chromium on Linux, not a phone. |
| **phone-tested** | A person ran the step on a real phone and wrote the result in the results sheet. **None yet.** |
| **live-API-tested** | A real request reached a real model provider and the response was checked. **None yet.** |
| **content-reviewed** | A named, qualified reviewer approved the content and recorded it. **None yet.** |
| **expected benefit** | What we hope the design does. Not measured. |
| **measured result** | A number from a run, with the environment named. |
| **team-reported** | The team told us; we have not seen the evidence. |
| **learning-outcome-measured** | A comparison showing learners improved. **None; no study has been run.** |
| **not tested / not reviewed** | Nobody has done it. |
| **unknown** | We do not have the information. |

Sources for the event: problem statement PDF <https://www.nirmit.space/docs/Nextech2.0_Problem_Statement_BW.pdf>, event page <https://www.nirmit.space/events/nextech>, rules <https://www.nirmit.space/rules>. These were read on 13 Oct 2026; the pages can change.

## 1. The problem

### 1.1 The official problem statement (official rule/brief)

The challenge is titled **"Agentic EdTech for Regional Language & Geography"**. In my own words: build an education product that helps learners who are held back by their language and by where they live, and make it *agentic*, meaning the software itself plans, decides, uses tools and acts toward a learning goal, instead of only replying when asked. The brief names the barriers: the language of home differs from the language of the classroom, a family shares one phone, the internet is weak or costs money, teachers cannot give every child attention, and there is no follow-up after a lesson.

Its worked example is a fictional Class 9 girl, Sunita, in rural southern Odisha. She speaks Kui at home, is taught in Odia, meets English in her textbooks, has the family phone for about an hour in the evening, and has a weak signal and limited data. The brief says teams may choose a different user, as long as they show comparable depth. It lists two other example cases (a teacher with several grades in one room, and a Class 12 Odia-medium exam candidate).

**In one sentence a school student could follow:** *"Some children have to learn science in a language they do not speak at home, on a phone that is not always connected, with nobody to check their thinking, so we built a helper that notices what they misunderstand and gives them the next small step even when the signal is gone."*

### 1.2 The exact gap Pathasetu targets (scoping decision)

Many learners can read a question and still fail it because the idea is stuck between three vocabularies: the **everyday Odia** they say aloud, the **school Odia** term in the textbook, and the **English** term in exam papers and reference books. When a learner gets a science question wrong there is often no one to ask *why*, and the next attempt repeats the same mistake. Weak connectivity makes online-only tools unreliable exactly when the learner finally has the phone.

Pathasetu's narrow target is that gap, for one concept area: catching a specific wrong belief (a **misconception**, such as "a bulb uses up the current") and giving a matching next step, while keeping every answer safe on the device if the connection drops.

This is a **scoping decision by the team**, not a research finding. We have no interviews, surveys or classroom data about real learners (**not tested**).

### 1.3 Who the user is today

| | Pathasetu today |
|---|---|
| Grade | Class 10 |
| Board and medium | BSE Odisha, Class X, General Science (Physical Science), Odia-medium, syllabus session 2026-27 (the official syllabus names the board, class, subject and session). The team calls this the "HSC" course; the syllabus PDF does not use that word, so the label is the team's until a teacher confirms it. Content **not reviewed** against the syllabus or any book |
| Subject and topic | Science, **Electricity** only — 8 questions in `content/electricity-pack.json` |
| Language assumption | Learner reads Odia and meets English terms. The screen shows English first with an Odia draft beside it. |
| Goal | Board-exam preparation |
| Device | A phone that may be shared by a family (assumption; **untested** with real learners). Today the app keeps **one local session record** per browser profile, so it does not safely separate several learners on one profile |
| Not supported | Kui or any tribal language; spoken or voice input; other grades, subjects or languages; teachers, parents or schools as users; accounts; an all-purpose chat tutor |

**What we borrowed from Sunita's case:** the Odisha setting, the shared phone, weak connectivity, Odia as the language of instruction and English terms in textbooks. **What is different:** her grade (we chose Class 10, not Class 9), no Kui, and a single subject chapter instead of a whole school programme. We say "Class 10 and Electricity" because it is a bounded exam topic with clear misconceptions that a small question set can cover; that is a team choice, not evidence that it is the most important topic.

#### Unvalidated assumptions about the user

- The learner reads Odia script comfortably and the draft wording matches how she speaks and how the textbook writes (not reviewed by anyone qualified).
- She can use a phone for short sessions; which phone and browser is **unknown**, because no phone has run the app.
- She is willing to type a short explanation (the box is optional).
- A phone may be shared by a family. Pathasetu keeps **one local session record** per browser profile and does not separate several learners, so shared use would mix their progress.
- The signal is weak, not absent: the first load needs the server once, after which the service worker keeps the shell.
- Electricity is a good first chapter. That is a team choice with no evidence behind it yet.
- No learner, parent or teacher has been interviewed or observed.

#### Board, class and book: what is verified and what is not (Iteration 7)

- **Verified from an official source (opened 13 Oct 2026):** the BSE Odisha Class X syllabus for session 2026-27 lists General Science with two prescribed books, Physical Science and Life Science, and Electricity (ବିଦ୍ୟୁତ୍) as one Physical Science entry <https://bseodisha.nic.in/wp-content/uploads/2026/05/Subject_wise_syllabus_class_X_26_27.pdf>.
- **Not verified:** the words "HSC" and "Madhyama" do not appear in that file, so we cannot prove an HSC-versus-Madhyama distinction; we do not make one. The book's publisher, edition, print year, chapter numbers and page numbers are **unknown**. The syllabus lists Electricity with no sub-topics, so which official outcome each of the eight questions serves is also unknown.
- **Other boards** (CBSE, CISCE/ICSE, NIOS, WBBSE and other state boards) are deferred or not evaluated. Class X on another board is a different syllabus. See `BOARD_CLASS_BOOK_COMPARISON.md`.
- **Say:** "Our topic is mapped at a high level to the BSE Odisha Class X General Science (Electricity) syllabus for 2026-27. Item-to-edition and page validation is pending a teacher." **Do not say** the questions are curriculum-aligned, syllabus-approved or teacher-approved, or "HSC, not Madhyama".
- **Content rights:** the questions are original draft text written for this MVP with AI help. No textbook page, diagram or scan is in the pack or the ZIP. A teacher fills `docs/BOOK_CROSSWALK.csv` (reviewer fields are blank on purpose).

### 1.4 "Geography" does not mean the subject

In this project "geography" means the learner's **place and access**: weak signal, patchy data, a shared phone in a village. Pathasetu does not teach the school subject Geography.

### 1.5 Illustrative learner scenario (made up, not a user study)

*Imagine Priya, Class 10, in a district town. She shares her brother's phone after dinner. She opens Pathasetu, answers "if a wire is disconnected, what happens to the current?" and picks "the bulb uses up the current before the gap". She types a short reason. The app records a possible gap ("current consumed by the bulb"), shows the next step ("trace the path from one battery terminal through the bulb and back to the other, and mark the break") and puts her answer in a waiting list for a second check. The signal drops. She keeps working. When the connection returns the second check runs and the app updates what it suggests next.*

This story is **illustrative**. No such learner exists in our evidence.

### 1.6 Before and after (expected benefit, not measured)

| | Without a tool like this | With Pathasetu as built |
|---|---|---|
| Wrong answer | Marked wrong, or checked later by someone else | A possible cause is named from a fixed list, shown as *provisional*, with a small activity |
| Vague or missing explanation | Nothing | App says "not enough evidence yet" (only when the explanation is very short; see 4.2) |
| Signal drops mid-lesson | Page fails, answer lost | Answer saved on the device and queued; learning continues |
| Language | One vocabulary at a time | Draft Odia and English side by side; a small matching exercise ties everyday Odia, school Odia and English together |
| What to do next | Learner guesses | A plan card explains why a particular next question was suggested |
| Learner's improvement | — | **Unknown.** No study. |

### 1.7 Why a quiz, a dashboard or a chat window is not enough (official brief)

The problem PDF contrasts agentic with conventional products and says, in effect, that if you remove the AI and are left with the same app, the AI was decoration. A fixed quiz grades and moves on. A dashboard shows numbers. A chat window answers when asked. None of them carries a goal across steps, watches the learner's state, decides the next action, handles a lost connection and records why. Section 5 explains how Pathasetu is built around that loop and, honestly, how far the "AI" part goes today.

## 2. The solution, topic by topic

Each topic uses five parts: **In one line**, **Explain like I'm new to software** (with an Electricity example), **Technical detail**, **Evidence/status**, **What not to claim**.

### 2.1 What Pathasetu is, and the name

**In one line.** A phone-first learning helper for Class 10 Electricity that finds the likely misconception behind a wrong answer, suggests the next step, and keeps working when the connection drops.

**Like I'm new to software.** *Pathasetu* is the team's name. As we read it, *patha* means path and *setu* means bridge; the intent is a bridge on the learner's path between the language they speak, the language the textbook uses and the English of exams. Our intended meaning for Pathasetu is a bridge for learning between languages: everyday Odia, school terminology and English science terms. We use the name to express the product's purpose; we are not claiming a formally verified literal translation. (team's stated intent; the Sanskrit-origin reading of *patha* and *setu* has not been checked with a qualified language source.) The "bridge" is also in the app: a card shows the three forms of one idea. For example, "when there is a gap in the wire, the electricity's whole road is not there" (everyday Odia, draft) → *ଖୋଲା ପରିପଥ / ବନ୍ଦ ପରିପଥ* (school Odia, draft) → *open circuit / closed circuit* (English).

**Technical detail.** A single-page web app in `public/` (HTML, CSS, vanilla JavaScript) plus a small Node server in `src/server/`. The shared logic (agent, validator, retry, bridge, storage) lives in `src/core/` and runs in the browser.

**Evidence/status.** implemented; unit-tested; browser-tested (headless). The Odia words are AI-assisted drafts (**not reviewed**).

**What not to claim.** Do not say the name or the Odia text was reviewed by a teacher or that it "supports Odia" in the sense of understanding it. Safer: *"It shows English questions with unreviewed draft Odia wording and a draft Odia-English term bridge."*

### 2.2 What the app does from first load to next action

**In one line.** Load a question, collect a choice and a short explanation, give a provisional diagnosis and a next activity, queue a second check, and suggest what to do next.

**Like I'm new to software.** Open the page; the first Electricity question appears with its four choices and Odia draft text. Pick an option. Type why. Press **Check my thinking**. The app tells you what it thinks you might be confused about (or that it needs more evidence), shows a small activity, and a plan card says which question comes next and why. A button ("Continue to EL0x →") offers to move on; the app never jumps by itself.

**Technical detail.** `public/app.js` `load()` fetches `/api/pack`, reads saved state from IndexedDB, repairs it if needed, then `renderAll()`. Submitting calls `submitAnswer()` in `src/core/agent.js`, which asks the mock proposer, validates the result, saves the answer, adds a queue entry, picks the next question with `chooseNextItem()`, and writes a trace event. The full journey is in `NAVIGATION_AND_WORKFLOW.md`.

**Evidence/status.** implemented; unit-tested (`tests/agent.test.js`, `tests/iteration2-core.test.js`); browser-tested (`scripts/browser-regression.mjs` scenarios A–D). phone-tested: **not tested**.

**What not to claim.** Not "adaptive learning path" in the sense of a learned model. The planner is a scoring rule (section 4).

### 2.3 What works offline, what waits, what needs the server

| Action | Offline (airplane mode) | Needs the Node server | Needs an outside model provider |
|---|---|---|---|
| Open the app again after one online visit | Yes: service worker serves the saved shell; question pack and progress come from IndexedDB | First ever visit | No |
| Answer a question and get a first, provisional result | Yes: the same rule runs in the browser (`mockModel.js`) | No | No |
| See remediation text and the plan card | Yes | No | No |
| Bridge Practice | Yes: pure local code, no network | No | No |
| Decision trace view and download | Yes | No | No |
| Second check ("re-check") of an answer | **Waits** in a queue | Yes: `POST /api/recheck` | Only if the server is set to Groq (not the default) |
| Unlock with the demo access code | **Waits** | Yes: `GET /api/session` | No |
| Fetch the question pack the first time | **Waits** | Yes: `GET /api/pack` | No |

**Evidence/status.** browser-tested in headless Chromium (e2e scenarios E, K, L). **Not phone-tested.** The app does not run a language model on the device (**not implemented**).

**What not to claim.** Never "fully offline". Safer: *"The learning loop, the saved answers and Bridge Practice work with the connection off; the second check waits until the server can be reached. Tested in headless Chromium; not yet on phones."*

### 2.4 How a wrong answer is handled; how uncertainty and remediation work

**In one line.** A wrong option points to a named misconception from a fixed list; if the explanation gives too little evidence the app says so; either way it shows a small activity and never says "mastered".

**Like I'm new to software.** In the question about the broken wire, option D says "the bulb uses up the current". That option is linked in the content file to the misconception `CURRENT_CONSUMED_BY_COMPONENT`. If Priya picks D and writes a reason, the app shows "Possible concept gap — provisional" and the matching activity. If she types fewer than eight characters, it says "Let's clarify your thinking": not enough to judge.

**Technical detail.** `src/core/mockModel.js` `proposeDiagnosis()` returns `MISCONCEPTION`, `NONE` or `UNCERTAIN`. `src/core/validator.js` `validateDiagnosis()` checks the result against the question's allowed IDs and a confidence of at least 0.65. The result is stored with `provisional: true`. The result card, text and next action are rendered in `renderQuestion()` in `public/app.js`.

**Evidence/status.** implemented; unit-tested (`tests/validator.test.js`, `tests/agent.test.js`); browser-tested (B1, B2). The rule does not read the explanation: with a normal-length reason it simply follows the chosen option. On 12 ambiguous or insufficient-evidence test cases it abstained on only 2 (`docs/EVALUATION.md`).

**What not to claim.** "It understands what the child wrote" or "it diagnoses reliably". Safer: *"The demo rule links the chosen option to a listed misconception and says clearly that the free text was not interpreted."*

### 2.5 Why the answer is re-checked

**In one line.** Every answer gets a second opinion from the server, because the first one is only a local rule.

**Technical detail.** `submitAnswer()` always adds a queue entry. When the server can be reached, `drainQueue()` in `public/app.js` sends `{itemId, optionId, explanation}` to `POST /api/recheck`; the server's reply is validated again in the browser by `recheckQueued()` in `agent.js` before anything changes. With the default mock provider the second opinion is the same kind of rule, so it normally agrees with the first.

**Evidence/status.** implemented; unit-tested; browser-tested (D1, E3, J1–J4). A real model second opinion: **live-API-tested: no**.

**What not to claim.** That the re-check is an independent expert or a real AI second opinion, unless the server is switched to Groq and a live run has been evidenced.

### 2.6 How it is meant to help learners with no one to follow up

**In one line.** It gives immediate, specific feedback and a next step on the device, 24 hours a day, within one small topic.

**Evidence/status.** expected benefit only. There are no teacher, parent or school workflows in the code: no teacher dashboard, no sharing of progress, no notifications, no accounts (**not implemented**). The trace download is a JSON file for demonstration, not a report for a teacher.

**What not to claim.** "Replaces tuition", "improves marks", "helps teachers" without qualifications.

### 2.7 What is ordinary prior art and what we are trying to show

Offline-capable web apps, multiple-choice quizzes, bilingual content and misconception-based diagnosis are all established ideas. Pathasetu does not claim to have invented any of them, and "first" or "only" must not be used. What the implementation tries to **demonstrate** is narrower: a **bounded, traceable, stateful learning workflow** that (1) lets a diagnosis be proposed, (2) accepts it only after a fixed check, (3) handles uncertainty and a lost connection without losing the learner's work, and (4) records why each step happened. That is an engineering claim about the workflow, and the evidence for it is the tests and the trace.

### 2.8 What would convince us that it works for learners

1. A qualified Odia-medium science teacher reviews the content and records decisions (`docs/REVIEWER_GUIDE.md`).
2. Reviewer-authored Odia-script and Roman-Odia evaluation cases exist; independent labels replace the team's labels.
3. A live model is evaluated against those cases and compared with the simple baseline, including false positives and wrong confidence, not only agreement.
4. Real phones complete the offline steps in `docs/PHONE_TEST_PLAN.md`.
5. Observed task completion by a few consenting learners using the app unaided.
6. Only then, and with proper approval, a small learning study with a comparison group. **None of these has happened.**

### 2.9 How we would measure learning improvement in a future approved study

This is a design, not a result. Nothing below has been run, and the label **learning-outcome-measured** applies to nothing today.

1. **Approvals first.** School and guardian permission and the institution's ethics or review route; consent for any logging beyond counts. Until then, synthetic text only.
2. **Frozen, reviewed content.** A qualified Odia-medium science teacher signs off the items and the bridge mappings; the version used is recorded.
3. **Pre-test and post-test** on the Electricity chapter, using questions that are not the practice questions.
4. **A comparison group** doing ordinary practice for the same time, assigned before the study starts.
5. **Outcomes** fixed in advance: post-test gain; whether a named misconception reappears on re-asked items after a delay; unaided task completion; time on task. Counts only; no typed text kept without consent.
6. **Diagnosis quality measured separately,** on reviewer-authored Odia-script and Roman-Odia cases, including false positives on correct reasoning and appropriate abstention.
7. **Report honestly:** small samples, effect sizes with uncertainty, and what did not work.

## 3. The real technology stack (checked against the files on 13 Oct 2026)

`package.json` declares **no `dependencies` and no `devDependencies`**; `package-lock.json` lists only the project itself; `npm ci` installs nothing. `engines.node` is `>=20`; the runs recorded here used Node v22.22.0. There is no `.github/` folder, so there is **no CI service** (tests are run by hand).

Plain-language definitions on first use: a **server** is a program that waits for requests and answers them; a **browser** is the app on the phone that shows the page; an **API** is a set of named doors a program offers to other programs; an **endpoint** is one door (like `/api/health`); a **model / LLM** is a large trained program that reads text and writes text; a **trace** is the list of decisions the app wrote down; a **queue** is a waiting list; a **retry** is trying again; an **origin** is the exact "https://host" the page came from; a **rate limit** is a cap on how many requests are allowed per minute; a **smoke test** is a tiny test showing that a connection works at all; an **evaluation** is a larger test comparing outputs with expected labels.

| Technology | File(s) | What it does here | Input → output | Status |
|---|---|---|---|---|
| HTML, CSS, vanilla JavaScript (ES modules), no framework | `public/index.html`, `public/styles.css`, `public/app.js` | The phone-first screen and all its behaviour | clicks and typing → updated page | implemented; browser-tested; a11y-audit (automated) |
| Node.js built-in `http` module (no Express) | `src/server/server.js` | Serves the files and four API routes | requests → files or JSON | implemented; unit-tested (`tests/server.test.js` and others) |
| API routes: `GET /api/health`, `GET /api/session`, `GET /api/pack`, `POST /api/recheck` | `src/server/server.js` | Health probe; check access code; send the question pack; second-check an answer | see `SYSTEM_ARCHITECTURE.md` | unit-tested; browser-tested |
| Service worker + Cache Storage | `public/sw.js` (current cache `pathasetu-shell-v12`) | Keeps the app shell and the browser-safe `/core/*.js` modules for offline reload. Never caches `/api/*`. The current UI retains its service worker across renders. | requests → cached or live files | earlier tests are historical; v12 has not been browser-tested in this review |
| IndexedDB (database `pathasetu-local-v1`, store `records`) | `src/core/storage.js` | Holds one record under key `session` (state, answers, queue, trace, drafts, the saved content pack) and, if needed, `session-unreadable-backup` | record ↔ browser database; memory fallback if blocked | unit-tested; browser-tested (L, P, R) |
| `sessionStorage` | `public/app.js` | Holds the demo access code for the open tab only (`pathasetu_demo_code`) | typed code → header | browser-tested (M7) |
| Content pack (JSON) | `content/electricity-pack.json`, validated by `src/core/content.js` | 8 Electricity questions, option→misconception links, remediation, Odia drafts, bridge fields | file → items | unit-tested; consistency-checked (`npm run check:content`); content-reviewed: **no** |
| Agent core: state, planner, executor, retry bookkeeping | `src/core/agent.js` | `initialState`, `submitAnswer`, `recheckQueued`, `chooseNextItem`, `reconcileState`, trace | state + event → new state | unit-tested; browser-tested |
| Mock proposer | `src/core/mockModel.js` | Option-linked rule; does not read text | question, option, text → proposal | unit-tested |
| Validator | `src/core/validator.js` | Allow-list and confidence check | proposal → accepted or rejected | unit-tested |
| Retry policy | `src/core/retry.js` | 5 automatic attempts, 5 s doubling to a 60 s cap, then pause | entry + clock → schedule | unit-tested; browser-tested (N) |
| Recovery | `src/core/recovery.js` | Repairs or quarantines a damaged saved record | saved record → safe state | unit-tested; browser-tested (R) |
| Persistence request | `src/core/persistence.js` | Asks the browser once to keep storage; describes the outcome | — | unit-tested; browser-tested |
| Bridge Practice | `src/core/bridge.js` | Builds a 3-choice matching exercise from the pack's `bridge` fields | pack + item + attempt → exercise | unit-tested; browser-tested (K) |
| Trace export | `src/core/export.js` | JSON download without typed text or secrets | state → JSON | unit-tested; browser-tested (S) |
| Mock provider (default) | `src/core/mockModel.js` (also called by the server) | Same rule server-side | — | unit-tested |
| Groq adapter (optional) | `src/server/groqModel.js` | Sends one chat-completion request to `https://api.groq.com/openai/v1/chat/completions` (default model `openai/gpt-oss-20b`, `store:false`, 5.2 s timeout) | item, option, text → proposal | unit-tested with a fake server only; **live-API-tested: no** |
| Access control | `src/server/access.js`, `server.js` | Demo code check, failed-attempt window, rate limits, exact origin list | headers → allow, 401, 403, 429 | unit-tested; browser-tested |
| Preflight | `scripts/preflight.mjs`, `scripts/lib/preflight.mjs` | Pre-demo safety check; mock-only loopback harness | env → PASS/FAIL | unit-tested |
| Tests | `tests/*.test.js` (Node's built-in `node:test`) | 252 unit and static tests in the Iteration 8 final run (217 in Iteration 7, 207 in Iteration 6, 198 in Iteration 5, 182 at the Iteration 4 baseline) | — | measured result (below) |
| Browser tests | `scripts/browser-regression.mjs`, `capture*.mjs`, `accessibility-audit.mjs`, `scripts/lib/devtools.mjs` | Drive headless Chromium over the Chrome DevTools Protocol, no library | — | measured result (below) |

**Technologies we verified are not used:** React, Next.js, Express, LangChain, CrewAI, AutoGen, LlamaIndex, Smolagents, RAG (retrieval-augmented generation), embeddings, a vector database, an on-device or local language model, speech recognition or speech synthesis, a native Android or iOS app, and multi-agent orchestration. The check was a search of `package.json`, `package-lock.json`, `src/`, `public/` and `scripts/` on 13 Oct 2026; none of these names is imported or called. We did not infer anything from the event's examples.


**Current Iteration 16 step 1 results:** 451 unit tests and 112 browser checks pass (records in `evidence/iteration16/final/`). **Earlier Iteration 15 results** (14 October 2026, Node 22.22.0, headless Chromium 141, Linux sandbox; records in `evidence/iteration15/final/`): 440/440 unit tests passed. `npm run check`, `npm run check:content`, `npm run preflight`, `npm run evaluate` (deterministic, no network), `npm run doctor` and the complete `npm run mutation` exited 0. Capture passed 19 checks, E2E passed 106 browser checks and accessibility ran 462 checks with 0 failed. The mutation check runs 46 deliberate faults against the queue, retry, validator and recovery code and all 46 are caught; this iteration made that run faster and stricter (only tests that really ran count) without removing any fault. These are synthetic engineering tests: they do not show that learners learn, that a model is accurate, or that the app works on a phone, and no real model was run (the model chain was exercised only against fake servers; see `docs/MODEL_PROVIDERS.md`). In the earlier Iteration 11 and Iteration 9 environments the browser commands were BLOCKED by `ERR_BLOCKED_BY_ADMINISTRATOR` (exit 2) and the Iteration 11 mutation sweep was INCOMPLETE; those records are historical and were not changed.

**Historical Iteration 10 results** (Node v22.22.0, headless Chromium 141, separate Linux sandbox; records in `evidence/iteration10/final/`): 337/337 unit tests passed; capture 19, E2E 100 and accessibility 462 checks all passed in that environment. It added 56 queue-invariant tests, 120 generated sequences and caught 45/45 deliberate faults in its mutation catalogue. These results remain historical and are not promoted into the current Iteration 11 environment. Synthetic engineering tests do not show that learners learn, that a model is accurate or that the app works on a phone. In the Iteration 9 environment, browser commands were BLOCKED by the same managed policy; that record is also preserved.

**Earlier, historical Iteration 8 results** (headless Chromium 141, Node 22.22.0, Linux sandbox, 13 Oct 2026, preserved in `evidence/iteration8/final/`): `npm test` 252 unit tests passed (the Iteration 7 final run had 217, the Iteration 6 final run had 207, Iteration 5 had 198 and the Iteration 4 baseline 182); `npm run capture` 19 capture checks; `npm run e2e` 100 browser checks (the Iteration 5 run had 95; scenario Q adds five); `npm run a11y` 462 accessibility checks, 0 failed; `npm run check`, `check:content` and `preflight` exit 0. These are historical results from one machine. The Iteration 8 baseline reproduced the 217 unit tests and the non-browser commands on the untouched Iteration 7 tree (`evidence/iteration8/baseline/`).

**Where each result came from (Iteration 7).** The sandbox above ran the browser suites. The team's own Mac log (Node 26.8.2, Iteration 6 package) passed `npm test` (207 tests), `check`, `check:content` and `preflight`, but `capture` made 10 passing API checks and then failed with `ENOENT '/usr/bin/chromium'`, and `e2e` and `a11y` reported BLOCKED, because the scripts look for a Linux browser path unless `CHROME_PATH` points at a real browser. That is a path gap on a Mac, not a product defect, and **no browser check has passed on the Mac**. The team's earlier managed machine reported browser navigation **BLOCKED** (`ERR_BLOCKED_BY_ADMINISTRATOR`). Those are different environments' results and are not promoted to passes anywhere. No phone has run any of this.

### 3.1 What the automated tests prove, and what they do not

**They do show,** on synthetic inputs and in headless Chromium on Linux: the validator rejects malformed or out-of-list diagnoses; a double submit makes one answer and one queue entry; an offline reload serves the shell and keeps the answer; retries stop after five and a paused state offers Retry now; a second tab is read-only; storage failure and corrupt records are reported and repaired; the access code gates the routes and wrong guesses are throttled; security headers are present and traversal paths are refused; the labels name the provider the server reports (a stubbed Groq-configured server, scenario Q); and the documents keep to the status words and the current counts.

**They do not show:** that a diagnosis is right for a real learner; that the Odia or the science is correct; how the app behaves on a Samsung or iPhone browser, with TalkBack or VoiceOver, or on a flaky mobile network; how any hosted model performs (none has been called); that anything is secure enough for production; that learners improve; or that every sentence in these documents is true (the document tests check wording and consistency, not truth). The 47 evaluation cases are English cases the team wrote; 34 of 47 agree with the team's labels, and that is a regression baseline for a rule, not accuracy.

### 3.2 Where the learner’s words go

| Moment | What leaves the phone | Where it goes |
|---|---|---|
| Typing, choosing an option | Nothing | Held in the page and saved to IndexedDB **when browser storage works** (otherwise memory only, and the screen says so) |
| Submit while offline | Nothing | Saved locally with a waiting re-check |
| A re-check runs (online) | Question ID, selected option and the typed explanation (up to 1,000 characters), sent to the Pathasetu server | The server runs the rule (mock) and replies; it keeps no learner data (only in-memory rate counters) |
| Only if Groq is configured | Question, options, answer key, Odia drafts, selected option and explanation, sent on by the server to Groq with `store:false` requested | Groq's API. **Never run live.** Provider retention is unverified |
| Download trace | A file the learner chooses to save | Typed text is replaced by its length; no access code |
| Health probe | A GET with no learner data | `/api/health` |

It is not true that everything stays on the phone: local state stays on the device, but the explanation is sent to the server whenever a re-check is attempted.

### 3.3 Which routes need the access code, and the known security limits

`/api/health` is open on purpose (the offline probe uses it) and reveals the provider label and whether a code is required. `/api/session`, `/api/pack` and `/api/recheck` need the code whenever one is configured, which is always in public-demo mode, with Groq, or for a production draft demo. The Groq key lives only in the server's environment and is never sent to the browser; the demo code is compared in constant time, kept in `sessionStorage` for the open tab, and kept out of IndexedDB, the trace export and logs. Other controls: a failed-attempt window (20 per 60 s per client), an exact-origin allow-list, a 16 KB body limit, a re-check rate limit, and security headers.

**Known limits:** one shared code; in-memory counters that reset on restart and are keyed by socket address, so visitors behind one tunnel connection share a bucket; no accounts and no audit log; the answer key and draft pack reach any authorised browser, so this is practice, not an exam; browser modules are served from `src/core` by a file-name pattern. This is demo-grade protection, not production authentication.

### 3.4 Where every data field goes

"Page memory" is the open tab. "IndexedDB" is the browser's saved copy on the phone, when browser storage works. "Server" is the Pathasetu Node process. "Hosted model" applies **only if** a provider such as Groq is configured, which has never been done live. Our server code writes one start-up log line and keeps only in-memory counters; a tunnel or host in front of it may keep its own logs, which we have not read.

| Field | Page memory | IndexedDB | Sent to the Pathasetu server | Forwarded to a hosted model (only if configured) | In the trace export | Logged by our code |
|---|---|---|---|---|---|---|
| Typed explanation (up to 1,000 characters) | yes | yes (draft and saved answer) | yes, on a re-check only | yes | no: replaced by its length | no |
| Chosen option and item ID | yes | yes | yes, on a re-check | yes | yes | no |
| Question, options, Odia drafts | yes | yes (saved pack) | served from the server to the browser | yes | item IDs only | no |
| Correct option (answer key) | yes (it ships to the browser) | yes | served to the browser | yes (`correctOptionId`) | no | no |
| Learning state: attempts, queue, decision trace | yes | yes | no | no | yes (queue and trace) | no |
| Access code | yes, for the tab (`sessionStorage`) | no | yes, in the `x-pathasetu-demo-code` header on protected routes | no | no (redacted) | no |
| Provider API key | no | no | no (lives in the server's environment only) | used by the server to call the provider | no (redacted) | no |
| Health probe | — | — | a GET with no learner data | no | — | no |

Evidence: `src/server/server.js`, `src/server/groqModel.js`, `src/core/export.js`, `src/core/storage.js`, `tests/iteration5-evidence.test.js`, `tests/storage-resilience.test.js`. Status: implemented; unit-tested (the hosted-model request is checked against a fake fetch only); live provider not tested. Never say "no data leaves the phone".

### 3.5 Access levels in plain words (Iteration 7)

There are seven levels, A0 to A6 (`AUTHENTICATION_AND_TRUST_LEVELS.md`). **Pathasetu is at A1: a private demonstration gate.** One shared code lets invited people in; an origin check stops another website from using a visitor's browser to call the server; throttles slow guessing; HTTPS (supplied by the tunnel or host) hides traffic from people on the Wi-Fi. Keep these apart: *authentication* proves who you are (we have none), *authorisation* decides what that person may do (we have none beyond code or no code), *HTTPS* protects the connection, the *origin check* blocks other websites (it does not stop a command-line client), *rate limiting* slows repeated tries, and the *shared code* admits whoever knows it. If the code leaks, anyone with it can read the draft pack and answer key and call the re-check route until we restart with a new code; there are no stored learner records to expose. Accounts (A3), profiles (A2), roles (A4), school sign-in (A5) and a production service (A6) are **not implemented**. We make no claim of compliance with any data-protection law; that needs a qualified lawyer.

## 4. What "agentic" means here, precisely

### 4.1 Layman version

A normal quiz asks a fixed question and marks it. A chatbot answers whatever you type. An **agentic workflow** has a goal, looks at the current situation, picks a next action, uses a tool, changes some controlled record of what happened, and then loops with the new situation. Pathasetu's goal is: *help this learner repair one misconception at a time*. It looks at the learner's answers, the waiting re-checks, how many learning sessions remain and which questions were seen. It chooses what to do next and writes the reason down.

### 4.2 Technical version — where each step lives

| Step in the loop | Where it happens (function, file) | Kind of call |
|---|---|---|
| Observe state | `initialState`, `reconcileState`, `repairSavedRecord` (`agent.js`, `recovery.js`) | internal function |
| Entry to the flow | `submitAnswer({state, pack, itemId, optionId, explanation, online})` in `src/core/agent.js`, called from `doSubmit()` in `public/app.js` | internal function |
| Propose a diagnosis | `proposeDiagnosis()` (`mockModel.js`) in the browser; on re-check the server runs the mock or, if configured, the Groq adapter | internal rule; HTTP route `POST /api/recheck`; optional external call |
| Validate | `validateDiagnosis()` (`validator.js`), run in the browser **and** on the server | internal function |
| Act / change state | `submitAnswer` pushes the answer and the queue entry; `recheckQueued` updates the answer; only these two functions write learner state | internal function |
| Plan the next step | `chooseNextItem()` scores questions: concept being re-checked (−20), a confirmed gap (−10, see below), already answered (+5 each), already seen (+1); lowest score wins, ties by ID | internal function |
| Record why | `appendTrace()` (200-event cap) | internal function |
| Loop | the learner presses **Continue**; the queue drains on reconnect | UI + timers |

Two precise caveats a judge may find, so you should say them first:

1. **The "confirmed gap" term of the planner is inert in the shipped app.** `drainQueue()` always calls `recheckQueued(... trusted: false ...)`, so `confirmedMisconceptions` never changes in normal use. Only unit tests exercise the trusted path. In practice the next question is chosen by "same concept as the one just re-checked" and "how often already answered". This is by design caution (nothing is ever treated as confirmed mastery or confirmed gap automatically) but you must not describe the planner as tracking confirmed gaps.
2. **The free text never changes the mock's answer** beyond a length test. The agentic loop (observe → propose → validate → act → plan → trace) is real and tested; the "AI" inside the proposer, in the default demo, is a rule.

### 4.3 Which calls are tools, which are agents?

Pathasetu has one **workflow** and several **tools**. A tool is a function or a route with a fixed job: `proposeDiagnosis`, `validateDiagnosis`, `chooseNextItem`, `buildBridgeExercise`, `GET /api/pack`, `POST /api/recheck`, the Groq adapter. The "agent" is the controlled sequence that calls them in order and owns the state. We do **not** describe helper functions as separate agents.

### 4.4 Deterministic, autonomous or multi-agent?

- **Deterministic workflow with a bounded proposer.** Transitions are fixed in code, the same state and input give the same result, and the proposer can only suggest one of a small allow-listed set of diagnoses. This fits our constraints: predictable and auditable, works without a connection, and a model can be swapped in without being allowed to act freely.
- **Not autonomous:** no step is chosen by a model, there is no free-form tool use, no planning by a model.
- **Not multi-agent:** there are no cooperating agents with separate goals or messages. For one learner and one loop, extra agents would add failure points without adding capability.
- **No agent framework** (no LangChain, CrewAI, AutoGen, LlamaIndex, Smolagents) — `package.json` has no dependencies and no source file imports one. The problem PDF allows any framework but asks teams to justify their choice; our justification is the one above (small, auditable, offline-capable, nothing to install).

### 4.5 What "AI" means in the demo you run today

- Default provider: **mock**. It is an option-linked rule. It does not understand Odia, English free text or anything else. The screen says so: "MOCK PROVIDER · DEMO RULES · NO LIVE AI".
- Optional provider: **Groq** adapter exists (`src/server/groqModel.js`), checked only against a local fake server. **No live request has ever been sent** (`evidence/iteration5/gates/`: BLOCKED — credentials not configured). Until a live request is evidenced, do not call Pathasetu "LLM-powered".
- **Before anyone can say "LLM-powered":** (1) a live request must reach a configured provider and the saved run must show it; (2) the UI footer and the trace must name that provider and model (they do, from the server's health report, and scenario Q tests the labels against a stub); (3) the same 47 cases must be evaluated against the rule and reported as agreement with team-written labels; (4) reviewer-authored Odia cases must exist before any claim about Odia. Until then do not use the phrase.
- If Groq were switched on, the learner's typed explanation, the question, the options, the Odia drafts and the answer key for that item would be sent to Groq for each re-check (`buildBody` in `groqModel.js`). With the default mock the typed text goes only to the Pathasetu server on re-check and is not stored there (**the server keeps no learner data**).

### 4.6 What happens when the model side fails

| Failure | What the code does | Tested |
|---|---|---|
| Provider unreachable, 5xx, or the request takes more than 8 s | The answer stays saved; the queue entry stays; one failed attempt is counted; retry later | browser-tested J1, J4 |
| Invalid JSON | Same | J2 |
| A diagnosis ID that the question does not allow | Rejected by the validator; the answer stays; one failed attempt is counted | J3; unit-tested |
| The model cannot decide | `UNCERTAIN` is accepted as a valid result; no misconception is recorded | unit-tested |
| Five failed attempts | The entry is paused and flagged "needs attention"; **Retry now** restarts the cycle | N1–N11 |

A model can never write learner state directly: its output is only a proposal, passed through `validateDiagnosis` and then `recheckQueued`, and in the app the resulting diagnosis is always stored as provisional.

### 4.7 What continues with the model removed

Everything in the learning loop: questions, answering, local provisional results, remediation, planning, Bridge Practice, saving, the queue, the trace. Only the "second opinion" changes character: with the mock it is the same rule.

### 4.8 What we can defend and what we must not say

We can defend: a working, tested, traceable, offline-tolerant agentic *workflow* with a safe interface for an optional model. We must not call the demo a functioning LLM application until one live request is evidenced.

### 4.9 "Ordinary quiz or chatbot" versus "Pathasetu as built"

| Quality | Ordinary quiz / chatbot | Pathasetu as implemented | Evidence |
|---|---|---|---|
| Goal | None, or "answer the question" | Repair one misconception at a time (stated goal) | `agent.js` flow; trace |
| Observes learner state | Score only, or chat history | Answers, queue, sessions left, seen questions, drafts | `initialState`, `tests/agent.test.js` |
| Chooses the next step | Fixed order, or whatever the user asks | `chooseNextItem` scoring with a visible reason | `renderPlan`, trace |
| Tool use | None | Local rule, validator, bridge builder, HTTP routes | table 4.2 |
| Changes controlled state | Not applicable | Only `submitAnswer` and `recheckQueued` write state | `agent.js` |
| Handles uncertainty | Guesses | Allows `UNCERTAIN`; never marks mastery | `validator.js` |
| Works through a lost connection | Fails or loses work | Saves, queues, retries with a bound, recovers | e2e D, E, N |
| Explains why | Rarely | "Why this next?" card and a downloadable trace | `index.html`, `export.js` |
| A real language model | Often yes | **No** in the default demo; optional adapter not live-tested | `groq-status` evidence |

## 5. Benefits: implemented, expected, measured

| Benefit | Implemented? | Expected benefit | Measured result |
|---|---|---|---|
| Answers survive a lost connection | yes (browser-tested) | Fewer lost attempts on patchy networks | none on phones |
| Specific next step per wrong option | yes | Faster repair of misconceptions | none |
| Honest "not enough evidence" | partly (very short text only) | Less false confidence | 2 of 12 ambiguous/insufficient test cases abstained (team-written English cases; a rule, not a model) |
| Bilingual draft display and term matching | yes (drafts) | Better recall of terms across Odia and English | none; content not reviewed |
| Clear trace of decisions | yes | Trust, debugging, judging | 34 events rendered in the capture journey |
| Improved exam marks or learning gain | **not implemented / no evidence** | — | **none** |

### 5.1 How to find the evidence for any claim

Open `docs/CLAIM_EVIDENCE_MATRIX.csv`. Each row has a claim ID, the claim, the file or URL that backs it, the status label from section 0, the wording you may use and the wording you may not. To check a claim: find its row, open the evidence path, run the named command if it is a test, and compare the label with what you find. A claim with no row has no evidence trail and should not be said. The labels run from implemented through unit-tested, browser-tested (headless), phone-tested, live-API-tested and content-reviewed to learning-outcome-measured; today the last four have no entries.

## 6. Limits to volunteer before a judge asks

1. All 8 questions and all Odia wording are AI-assisted drafts that no teacher has reviewed.
2. The default "AI" is a rule that ignores the meaning of the explanation; no live model request has ever been made.
3. No phone has run the app; every browser result is headless Chromium on Linux.
4. Nothing is deployed; no tunnel has been run. The demo needs a persistent Node process and the team's own laptop.
5. Iterations 1–10 contain AI-assisted pre-event work from 12–13 October; Iteration 11 changes were made on 14 October during the Day-1 schedule shown in the supplied handout. Rule 4.1 (<https://www.nirmit.space/rules>) says all code must be built during competition hours. The team reports a verbal clarification allowing early work and API use; that is **team-reported**, no dated written organizer reply is saved, and the status remains `UNCONFIRMED`. The Iteration 11 archive has no `.git` history, so it cannot establish a complete commit timeline. Keep this chronology visible; no later change retroactively authorizes earlier work.
6. One shared demo code, in-memory limits that reset on restart: demo-grade protection, not production authentication.
7. Class 10 Electricity only; one language pair (Odia/English); no Kui, no voice.
8. The book edition, chapter and page for each question are **unknown**, and the syllabus lists Electricity without sub-topics, so the questions are mapped to the topic only at a high level. The pathway label "HSC" is the team's; the official syllabus does not use it (`BOARD_CLASS_BOOK_COMPARISON.md`).
9. Other boards (CBSE, ICSE, NIOS, WBBSE) are deferred or not evaluated; the app does not switch board or class.
10. The access code is not authentication. There are no accounts, profiles or roles; siblings on one browser share one record.
11. Browser tests have never passed on the team's Mac, because the scripts look for `/usr/bin/chromium`; the sandbox results are a different environment's.

## 7. The event and how Pathasetu maps to it (official rule/brief, with ambiguities named)

- **Dates and place** (event page): 14–15 Oct 2026, NMIET, Bhubaneswar (MBA Block auditorium); reporting 8:00 AM.
- **Stages** (event page): Stage 2 mid-evaluation (a GitHub commit audit, a working agent-workflow demo and the architecture), the bottom half eliminated; Stage 3 final on Day 2, a 7-minute live MVP pitch and 5 minutes of CTO questions. Weights on the event page: Autonomous Agentic Architecture 30%, Regional Language Localization 20%, Offline & Edge 20%, UI/UX & Grand Pitch Defense 30%; mid-evaluation 30% and final 70%.
- **Problem PDF** separates **core criteria** (problem understanding, technical implementation, presentation, pitch deck) from **bonus criteria** (regional-language support beyond translated labels, ease of use/accessibility, offline compatibility, type of agentic framework). These are *not* the same list as the event-page weights, and the rules page has a third list (Innovation, Technical Execution, Presentation, Feasibility, Adherence to Constraints). Do not blend them; cite the page you are quoting.
- **Ambiguities in the public pages:** the mid-evaluation slot is shown as 4:00–7:00 PM on Day 1 while Day 1 is listed as ending at 6:00 PM; the event is described as 24 hours while the listed hours add up to about 31; the weights (30/70) and the four jury metrics (30/20/20/30) are two different splits; the page says open-source LLM APIs are permitted while the team's note says all APIs are allowed. **Use the slot your team is assigned; if none has been given, say the schedule is ambiguous.** Do not guess.
- **APIs and keys** (event page): external APIs are permitted and keys must be set through environment variables. The team reports an organiser clarification that all APIs are allowed (team-reported; the event page wording is narrower, so quote them separately). Pathasetu reads `GROQ_API_KEY` and the access code from environment variables only (`src/server/server.js`).
- **Rule 4.1 / plagiarism checks** (rules page): code must be built during the event; diffs and commit timelines are audited. See limit 5 above.

Pathasetu's mapping (implemented/status, not scores): agentic architecture → section 4 (deterministic workflow; honest about the mock); regional language → Odia drafts and the bridge (**draft, not reviewed; no Kui, no voice**); offline and edge → service worker + IndexedDB + queue (**headless-tested, not phone-tested**); UI/UX and pitch → `PITCH_SCRIPTS.md`, accessibility audit (automated only).

## 8. Self-audit of this guide (13 Oct 2026)

See `evidence/iteration5/final/GUIDE_SELF_AUDIT.md` (Iteration 5) and `docs/DECISION_AUDIT_REPORT.md` (Iteration 7: what changed, every unknown, the inconsistent claims found and the sources checked). In short: every code statement above was checked against the file named; numbers come from `evidence/iteration5/`; the open items are the questions in `JURY_QA_BANK.md` whose answer is UNKNOWN, NOT TESTED, NOT REVIEWED or NOT IMPLEMENTED.
