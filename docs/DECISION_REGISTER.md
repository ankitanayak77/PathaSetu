# Pathasetu — decision register and evidence audit (authoritative, Iteration 7)

**Written:** 13 October 2026 (Iteration 7). **Base document:** the team's `Pathasetu_Comprehensive_Decision_Register_2026-10-13.md`, kept in substance and updated **only** where new evidence was found. Where this audit disagrees with that document, section 5 says so.
**Companion files:** `docs/DECISION_LOG.csv` (one row per decision; the index in section 7 is generated from it and a test keeps them equal), `docs/BOARD_CLASS_BOOK_COMPARISON.md`, `docs/BOOK_CROSSWALK.csv`, `docs/AUTHENTICATION_AND_TRUST_LEVELS.md`, `docs/DECISION_AUDIT_REPORT.md`, `docs/CLAIM_EVIDENCE_MATRIX.csv`.

> **Reading rule.** A decision made for the MVP is not a proven fact about learners. A passing software test is not educational validation. A team-reported message is not a saved written ruling. A passing build on one machine is not a pass on another. Nothing here was invented to look complete: where evidence is missing the row says `UNKNOWN`, `NOT TESTED`, `NOT REVIEWED` or `NOT FOUND IN EVIDENCE`.

## 0. What Iteration 7 changed

Documentation, tests and evidence only. `src/`, `public/`, `content/` and `scripts/` are byte-identical to Iteration 6 (service-worker cache stays `pathasetu-shell-v8`; all eight items stay `UNREVIEWED_DRAFT`). No board switch, account, profile, extra pack or textbook ingestion was built, although the alternatives are compared (D197, D096–D100).

## 1. Status vocabulary

- **DECIDED FOR MVP** — chosen on purpose for the current demonstration; reopening needs an explicit product decision.
- **TEAM-REPORTED** — said by the team; the external evidence is not saved here.
- **VERIFIED FROM SOURCE** — corroborated by a named primary source that was opened in this iteration.
- **VERIFIED IN CODE/TEST** — present in the package or shown by a recorded test. It does not mean it works on every device.
- **PROVISIONAL** — chosen on current information; reconsider when specific evidence arrives.
- **DEFERRED** — intentionally outside the MVP.
- **REJECTED FOR MVP** — considered and not chosen.
- **NOT SELECTED** — an alternative that was weighed and not chosen.
- **UNKNOWN** — evidence is insufficient.
- **NOT TESTED** — no test has been done for that environment or behaviour.
- **NOT REVIEWED** — no qualified reviewer has approved the content.
- **NOT IMPLEMENTED** — the product does not provide the capability.
- **NOT EVALUATED** — the alternative was not researched to a primary source in this audit.
- **BLOCKED** — a step could not be run (missing credentials, browser or access).
- **OUT OF SCOPE** — not part of the product's purpose.
- **NOT FOUND IN EVIDENCE** — the repository and supplied materials contain no record.

A decision may carry several statuses joined with `+` in the log. The claim matrix keeps its own lower-case vocabulary (`official rule/brief`, `implemented`, `unit-tested`, `browser-tested`, `phone-tested`, `live-api-tested`, `content-reviewed`, `expected benefit`, `measured result`, `team-reported`, `not tested`, `not reviewed`, `unknown`); the two vocabularies are deliberately not merged (D201).

## 2. Three environments, kept apart (D122)

| Environment | Who ran it | Node | What ran | Result | Not established |
|---|---|---|---|---|---|
| **A. The team's Mac** (terminal log uploaded by the team; not re-run here) | The team | 26.8.2 | `npm ci`, `npm test`, `check`, `check:content`, `preflight`, `capture`, `e2e`, `a11y`, `evaluate`, `smoke`, Groq `evaluate` | Unit tests: 207 pass, 0 fail (Iteration 6 package). `check`, `check:content` (8 items, 8 `UNREVIEWED_DRAFT`, 0 problems) and `preflight` (15 pass) succeeded. **Capture: 10 passed, 1 failed** (`ENOENT … '/usr/bin/chromium'`). **e2e: BLOCKED** (no Chrome/Chromium binary, set `CHROME_PATH`). **a11y: BLOCKED** (same `ENOENT`). Mock evaluation: 47/47 valid, 34/47 agreement, 0/8 false positives, 2/12 abstentions. `smoke` and Groq evaluation: BLOCKED (no credentials) | The archive SHA-256, git state, macOS version, whether Chrome is installed; **no browser check has passed on the Mac** |
| **B. The build sandbox** (this iteration's own runs) | The AI-assisted build | 22.22.0 (npm 10.9.4), headless Chromium 141.0.7390.37 | All nine commands on the untouched Iteration 6 checkout (`evidence/iteration7/baseline/`) | `npm ci`, `check`, `check:content`, `preflight`, `evaluate` exit 0; unit tests 207/207; capture 19/19; e2e 100/100; accessibility 33 states, 462 checks, 0 failed. Smoke and Groq evaluation BLOCKED (credentials absent) | Anything on a phone, a real tunnel or another machine |
| **C. The team's earlier managed environment** (Iteration 3 archive; recorded in `docs/BUILD_STATUS.md`) | The team | — | Capture's browser journey and `e2e` | BLOCKED by `ERR_BLOCKED_BY_ADMINISTRATOR` while 151 unit tests passed there | Never promoted to a pass |
| **D. The received package** | — | — | Iteration 6 ZIP SHA-256 `1147807d06f546eb5e8d0bc60904101a0ae42f737c8abb28a40ade4b5ddeb735`, matched to `SHA256SUMS.txt` | HEAD `beb9596`, 23 commits, tree `69a86803fa007a62b35967562c2647a78fad1500` before Iteration 7 | — |

**Why the Mac lacked `/usr/bin/chromium`.** The browser scripts default to that Linux path unless `CHROME_PATH` names an existing executable; macOS does not have it (D057). It is a path gap, not a product defect. To go further on the Mac without bypassing any administrator policy: run `ls "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` and **only if that file exists** set `CHROME_PATH` to it for that terminal session. If it does not exist, or the managed machine blocks local navigation, the honest result is `BLOCKED`. Nothing should be installed or unblocked for the mock demo itself.

## 3. Executive decisions (updated)

| Decision area | Current decision | Status | Log IDs | What would change it |
|---|---|---|---|---|
| Project name | **Pathasetu**; the team's intended meaning is a bridge for learning between languages; no etymology claimed | DECIDED FOR MVP; TEAM-REPORTED | D001 | Rebranding; a linguist's verified derivation |
| Product category | Mobile-first, offline-first agentic learning workflow | DECIDED FOR MVP | D002 | Organisers clarify a different target |
| Official rubric | Weights 30 / 20 / 20 / 30; the 30% / 70% figures are the stage split | VERIFIED FROM SOURCE | D003 | Event page changes |
| Primary learner | One Odia-medium Class X learner on a shared phone; persona untested | DECIDED FOR MVP; NOT TESTED | D005, D006 | User research |
| Board / curriculum | BSE Odisha Class X General Science (Physical Science), session 2026-27. "HSC" is the team's label; the syllabus PDF does not use it. Madhyama is not targeted, and what it is stays UNKNOWN | DECIDED FOR MVP; VERIFIED FROM SOURCE (board, class, subject, session); UNKNOWN (pathway label) | D010, D011 | Teacher or board confirms a different label or scope |
| Topic | General Science (Physical Science), Electricity. The syllabus lists "Electricity" with no sub-topics | DECIDED FOR MVP; item-level fit UNKNOWN | D022, D025 | Scope mismatch in the prescribed book |
| Book / edition / chapter / page | UNKNOWN for all eight items | UNKNOWN | D024, D025 | Reviewer fills `docs/BOOK_CROSSWALK.csv` |
| Content size | Eight draft items, four concepts, two each | VERIFIED IN CODE/TEST; NOT REVIEWED | D023 | Review results |
| Language bridge | Everyday Odia → formal school Odia → English term; fixed pack fields; all unreviewed | DECIDED FOR MVP; NOT REVIEWED | D030, D031 | Reviewer changes terms |
| "Geography" | Learner access context, not the subject | DECIDED FOR MVP | D004 | Goal changes |
| Agentic design | Deterministic controller with proposer, validator, planner, executor, trace, bounded retry | DECIDED FOR MVP; VERIFIED IN CODE/TEST | D040–D044 | Evidence a model planner is needed and safe |
| Default provider | Option-linked mock rule, labelled | DECIDED FOR MVP | D060 | A permitted provider is evaluated; the mock stays as fallback |
| Live Groq | Optional adapter; never run live | NOT TESTED; BLOCKED | D061, D065, D152 | Local credentials and settings, then synthetic smoke |
| Access | A1 private demo gate; not authentication | DECIDED FOR MVP; VERIFIED IN CODE/TEST (headless); real tunnel NOT TESTED | D090–D095, D101 | Any real learner use |
| Learner profiles / accounts / roles | None; one local session record | NOT IMPLEMENTED | D096–D100 | Owner decision, threat model, tests |
| Offline boundary | After one online load, shell and local state work; re-check needs the server | VERIFIED IN CODE/TEST (headless); phones NOT TESTED | D053, D080–D083 | Phone tests |
| Frameworks | Vanilla JS, Node built-in HTTP; no agent or UI framework | VERIFIED IN CODE/TEST | D050–D056 | A named need |
| Hosting | Long-running Node behind a private HTTPS host or tunnel; not serverless | DECIDED FOR MVP; real tunnel NOT TESTED; BLOCKED | D110, D111 | Hosting chosen |
| Devices | S23, S25, S25 FE (Chrome, Samsung Internet), iPhone 16 Safari: a plan only | NOT TESTED | D120, D121 | Real tests |
| Accessibility | 462 automated checks pass in headless Chromium; no screen-reader test | VERIFIED IN CODE/TEST; NOT TESTED | D130 | TalkBack / VoiceOver pass |
| Educational benefit | Expected, not measured | NOT TESTED | D153 | Approved study |
| Provenance | Built before the window; AI-assisted; permission team-reported only | TEAM-REPORTED; UNKNOWN | D180, D183 | Saved written ruling |

## 4. New evidence found in Iteration 7

1. **BSE Odisha syllabus read** (S1 in the comparison): heading "SYLLABUS FOR THE SESSION, 2026-27"; General Science books named Physical Science and Life Science with no publisher, edition or year; Physical Science lists "Electricity" (ବିଦ୍ୟୁତ୍) without sub-topics and a separate "magnetic effect of electric current". The words HSC and Madhyama do not appear as headings.
2. **Event page and rules re-read:** judging metrics 30 / 20 / 20 / 30; Stage 2 "30% Weightage • 50% Elimination", Stage 3 "70% Weightage • CTO Jury Defense"; "Use of external open-source LLM APIs is permitted"; dates 14–15 October 2026; mid-evaluation 04:00 PM–07:00 PM Day 1; Rule 4.1 "all code and architecture must be built during the competition hours"; Rule 3.3 "Network usage is monitored in real-time". The rules page has **no** API or LLM rule.
3. **Other boards' official pages opened:** CBSE (2026-27 page, Science link not opened), NIOS (Chapters 16 and 17, © 2012), CISCE (no syllabus link reached). WBBSE and other state boards were not reached.
4. **OWASP cheat sheets read** for the authentication tiers; **MeitY page unreadable**; a secondary summary of the Data Protection Rules is named in the authentication document and treated as non-authoritative.
5. **The team's Mac log** recorded as environment A, separate from the sandbox.
6. **Baseline re-run** of the untouched Iteration 6 source in the sandbox: every command exit 0.

## 5. Corrections and conflicts against the supplied register

| # | Supplied register | This audit | Effect |
|---|---|---|---|
| 1 | "official 2026–27 HSC Class X General Science curriculum" | The PDF says "Class X … General Science" and does not contain "HSC" | Verified wording changed to "BSE Odisha Class X General Science, session 2026-27" (D010) |
| 2 | HSC and Madhyama are distinct pathways in the same file | No Madhyama heading found; relationship UNKNOWN | "NOT SELECTED + UNKNOWN" (D011); never say "HSC, not Madhyama" as verified |
| 3 | The syllabus "includes electricity-related material" | Correct, but as one entry | Item-level mapping UNKNOWN (D025) |
| 4 | MeitY page as the source for the data-protection law | Page returned placeholder metadata only | No legal statement made; no compliance claim (D074) |
| 5 | CISCE "Physics syllabus path varies" | No syllabus link found on the home page | NOT EVALUATED (D013) |
| 6 | SME Odisha textbook listing details | Fetch refused by the site's robots policy | Carried over, labelled unverified (comparison S2) |
| 7 | Event-page API wording versus "all APIs allowed" | Event page says "external open-source LLM APIs"; rules page is silent | Conflict preserved (D063) |

Internal inconsistencies in earlier project documents found by this audit are listed in `docs/DECISION_AUDIT_REPORT.md`.

## 6. Open gates

| Gate | Status | Evidence or action needed | Owner |
|---|---|---|---|
| Exact book edition and chapter/page crosswalk | UNKNOWN; NOT REVIEWED | Reviewer fills `docs/BOOK_CROSSWALK.csv` from a legitimately accessed copy | Qualified reviewer (unassigned) |
| Pathway label (HSC / Madhyama) | UNKNOWN | Check the learner's own documents and the board | Teacher |
| Odia script and Roman-Odia quality | NOT REVIEWED; NOT EVALUATED | Reviewer reads the pack and authors evaluation rows | Qualified reviewer (unassigned) |
| Real phone and browser flow | NOT TESTED | 23-step plan on seven combinations | Team |
| Mac browser checks | BLOCKED | Set `CHROME_PATH` only to a Chrome that exists and policy allows | Team |
| Live Groq request | BLOCKED | Local credentials, data-controls acknowledgement, synthetic smoke | Team |
| Real HTTPS tunnel | NOT TESTED | Run the runbook for real with mock only | Team |
| Written organiser clarification on pre-window work and API use | UNKNOWN; TEAM-REPORTED | Save the actual message | Team / organisers |
| Access model for real learners | NOT DECIDED beyond A1 | Threat model, privacy and legal review | Project owner |
| Learning impact | NOT TESTED | Approved study after content review | Team |

## 7. Decision index (generated from `docs/DECISION_LOG.csv`)

Each row below is one decision with its status. The full alternatives, reason, evidence, owner, risk, reopen trigger and next action are in the CSV. A test checks that this table and the CSV agree.

<!-- DECISION_INDEX_START -->
| D001 | Product | Project name is Pathasetu; the team's intended meaning is a bridge for learning between languages. No etymology is claimed. | DECIDED FOR MVP + TEAM-REPORTED |
| D002 | Product | Product category: a mobile-first, offline-first agentic learning workflow for one learner and one misconception at a time. | DECIDED FOR MVP |
| D003 | Event | Official judging weights are 30% agentic design, 20% regional-language localisation, 20% offline/edge, 30% UI/UX and pitch; the 30%/70% figures are the stage split, not the weights. | VERIFIED FROM SOURCE |
| D004 | Product | 'Geography' is interpreted as learner access context (weak signal, shared phone, data cost), not the school subject Geography. No GPS or location is used. | DECIDED FOR MVP |
| D005 | Persona | Primary learner: one Odia-medium Class X student studying Electricity for the board examination, on a shared phone with unreliable signal. | DECIDED FOR MVP + NOT TESTED |
| D006 | Persona | No user research, interview, teacher conversation or learner trial is recorded anywhere in the repository. | NOT FOUND IN EVIDENCE |
| D010 | Curriculum | Board and pathway: BSE Odisha Class X, General Science (Physical Science), session 2026-27. The register and team call this 'HSC Class X'; the syllabus PDF does not use the word HSC. | DECIDED FOR MVP + VERIFIED FROM SOURCE |
| D011 | Curriculum | BSE Odisha 'Madhyama' is not targeted. Whether Madhyama is a separate pathway, the same examination under another name, or something else is UNKNOWN from the sources read. | NOT SELECTED + UNKNOWN |
| D012 | Curriculum | CBSE Class X Science is deferred as a separate future pack; the 2026-27 CBSE curriculum page lists a Class X Science syllabus link, which was not read for item mapping. | DEFERRED + NOT EVALUATED |
| D013 | Curriculum | CISCE / ICSE Class X (Physics) is deferred. The CISCE home page read did not expose a syllabus link, so no syllabus was read. | DEFERRED + NOT EVALUATED |
| D014 | Curriculum | NIOS Secondary Science & Technology is deferred. The portal lists Chapter 16 Electrical energy and Chapter 17 Magnetic effect of electric current; the page shows a 2012 NIOS copyright and no edition. | DEFERRED + VERIFIED FROM SOURCE |
| D015 | Curriculum | WBBSE (West Bengal) is not evaluated: no primary official syllabus was reached in this audit. | NOT EVALUATED + DEFERRED |
| D016 | Curriculum | Other state boards (for example Maharashtra, Uttar Pradesh) are not evaluated. | NOT EVALUATED + DEFERRED |
| D017 | Curriculum | Grade: Class X, the year of the board examination. | DECIDED FOR MVP |
| D018 | Curriculum | Class IX is considered and not selected. The brief's illustrative learner is in Class IX, but the product target is Class X. | NOT SELECTED |
| D019 | Curriculum | Classes XI-XII are rejected for the MVP. | REJECTED FOR MVP |
| D020 | Curriculum | Classes I-VIII are out of scope. | OUT OF SCOPE |
| D021 | Curriculum | Open schooling and home learners beyond a named board are deferred. | DEFERRED |
| D022 | Curriculum | Subject and topic: General Science (Physical Science), Electricity. | DECIDED FOR MVP |
| D023 | Content | The pack has eight draft questions: four concepts (closed circuit, energy transfer, Ohm's law, series/parallel resistance), two questions each. | DECIDED FOR MVP + VERIFIED IN CODE/TEST + NOT REVIEWED |
| D024 | Content | Exact prescribed book title as printed, publisher or authority, edition or print year, chapter and page for each item: UNKNOWN. The syllabus PDF names the books only as Physical Science and Life Science. | UNKNOWN |
| D025 | Content | Mapping of the resistance_combinations items (EL07, EL08) and Ohm's-law items to a syllabus outcome is UNKNOWN: the syllabus lists Electricity with no sub-topic. | UNKNOWN + NOT REVIEWED |
| D026 | Content | Permitted wording: 'our topic is mapped at a high level to the BSE Odisha Class X General Science (Electricity) syllabus; item-to-edition and page validation is pending'. The pack is not called curriculum-aligned, syllabus-approved or teacher-approved. | DECIDED FOR MVP |
| D027 | Licensing | Questions, distractors, explanations and remediation are original draft text written for this MVP with AI assistance. No textbook text, diagram, scan or answer key is copied into the pack, app or ZIP. | DECIDED FOR MVP |
| D028 | Licensing | Where a book is cited, give an official link and citation fields only; do not redistribute pages. Check the licence of each individual resource. | DECIDED FOR MVP |
| D030 | Language | Language bridge: everyday Odia, then formal school Odia term, then English science term, stored as fixed fields on each item. | DECIDED FOR MVP + NOT REVIEWED |
| D031 | Language | All Odia text (prompts, options, explanations, bridge terms) is unreviewed draft. No claim of Odia proficiency or dialect validity. | NOT REVIEWED |
| D032 | Language | Roman Odia and Odia-script evaluation cases are not authored: the 47 evaluation cases are English. The review template has 24 blank rows for reviewer-authored cases. | NOT IMPLEMENTED + NOT EVALUATED |
| D033 | Language | Kui is not implemented. The brief's fictional case mentions Kui; the product does not. | NOT IMPLEMENTED |
| D034 | Language | Voice input, speech output, ASR, TTS and transliteration are not implemented. | REJECTED FOR MVP + NOT IMPLEMENTED |
| D035 | Language | No Odia font is bundled. Rendering depends on the device's fonts. | DECIDED FOR MVP + NOT TESTED |
| D040 | Agentic | Deterministic controller with a bounded loop: observe, propose, validate, plan, act, save and trace, then re-check and re-plan. Agentic but not fully autonomous. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D041 | Agentic | Validator allow-list: a proposal must name the current item, an allowed misconception ID or null, and meet the confidence rule, or it is rejected. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D042 | Agentic | Planner: a deterministic scoring chooser picks the next item; the shipped UI always sends trusted:false so a confirmed gap is never set from the UI. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D043 | Agentic | Bounded retry for the queued re-check: five automatic attempts at 5, 10, 20 and 40 s steps (capped at 60 s), then paused with a Retry now control. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D044 | Agentic | Multi-agent orchestration is rejected for the MVP. | REJECTED FOR MVP |
| D050 | Technology | Client: HTML, CSS and vanilla JavaScript ES modules; no UI framework. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D051 | Technology | Server: Node.js built-in http module only; engines >=20; no npm dependency. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D052 | Technology | Local storage: IndexedDB database pathasetu-local-v1 with an in-memory fallback and an honest storage-status message. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D053 | Technology | Offline shell: service worker with Cache Storage (cache pathasetu-shell-v10). API responses are never cached. | DECIDED FOR MVP + VERIFIED IN CODE/TEST + NOT TESTED |
| D054 | Technology | Web Locks gives a single writer tab; a second tab is read-only, or a persistent warning is shown where the API is unavailable. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D055 | Technology | No LangChain, CrewAI, AutoGen, LlamaIndex or Smolagents; the package has no dependencies. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D056 | Technology | Testing uses the Node built-in test runner plus custom Chrome DevTools Protocol scripts; no test framework dependency. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D057 | Technology | Browser scripts find Chrome through CHROME_PATH, otherwise a Linux default of /usr/bin/chromium. macOS has no such file, so the scripts report ENOENT or BLOCKED there until CHROME_PATH names an existing executable. | VERIFIED IN CODE/TEST |
| D060 | Provider | Default diagnosis provider is an option-linked mock rule, labelled MOCK PROVIDER · DEMO RULES · NO LIVE AI. It does not read free text. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D061 | Provider | Optional Groq adapter (model openai/gpt-oss-20b, store:false, 5.2 s timeout, server-side key). It has never been run live. | DECIDED FOR MVP + NOT TESTED + BLOCKED |
| D062 | Provider | A larger Groq-hosted model (120B) is deferred. | DEFERRED |
| D063 | Provider | Claude, Gemini or other hosted APIs are not selected. The public event page says external open-source LLM APIs; the team later reports 'all APIs allowed'. The conflict is preserved, not resolved. | NOT SELECTED + TEAM-REPORTED |
| D064 | Provider | On-device or local model inference is not implemented. Offline capability is deterministic learning plus a queued re-check, not offline LLM inference. | NOT IMPLEMENTED |
| D065 | Provider | Live-provider gate: no live call unless the team has set the provider and key locally, reviewed the account's data controls, set PATHASETU_PROVIDER_DATA_CONTROLS_ACK=true, passed preflight, and uses synthetic cases only. A key is never requested in chat or stored. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D070 | Data | Data-flow statement: progress is saved in the browser when storage works; a re-check sends the typed explanation, item and options to the Pathasetu server; if Groq is configured, the server forwards a bounded request including the answer key and Odia drafts. 'No data leaves the device' is never said. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D071 | Data | Trace export is allowed and excludes typed explanations and secret-like values. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D072 | Data | The answer key and the draft pack ship to the browser by design, so offline practice works; this is not a secured exam. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D073 | Data | Synthetic data only for the hackathon; no real school or learner data. Learners under 18 are a privacy and safeguarding matter for any real use. | DECIDED FOR MVP |
| D074 | Data | No Indian data-protection compliance claim. The DPDP Act and Rules need a date-current review by qualified counsel; this audit read only secondary summaries because the MeitY page returned no usable content. | NOT EVALUATED |
| D080 | Offline | First use needs a connection to the server to fetch the page, pack and service worker. Repeat use can work offline after that. First-use-offline is not claimed. | DECIDED FOR MVP + VERIFIED IN CODE/TEST + NOT TESTED |
| D081 | Offline | Re-check requires the server; an offline answer is saved locally and queued once, then re-checked on reconnect. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D082 | Offline | Persistence is best effort; the app requests persistent storage and tells the learner when progress is not being saved. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D083 | Offline | Corrupt or partly corrupt saved state is repaired and the unreadable copy is kept (quarantine); a trace can be exported. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D090 | Access | Current access model is A1: a private demonstration gate with one shared access code. It does not identify a person and is not user authentication or production security. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D091 | Access | Fail-closed public mode: PATHASETU_PUBLIC_DEMO=true refuses to start without a strong code (16 or more characters, no whitespace, not repetitive, sequential or a placeholder, at least 6 distinct characters). | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D092 | Access | Exact-origin allow-list for state-changing requests: https only, no wildcard, path, credentials or default port; cross-origin POSTs return 403. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D093 | Access | Throttles: failed or missing-code attempts share a per-client window of 20 per 60 s and answer 429 without blocking the correct code; re-checks are limited to 24 per minute; request bodies to 16 KB. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D094 | Access | /api/health stays open so the offline probe works; it discloses the provider label and whether a code is required. /api/session, /api/pack and /api/recheck need the code when one is configured. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D095 | Access | The code is kept in the tab's sessionStorage under pathasetu_demo_code; it is never put in IndexedDB, localStorage, the trace export, logs or the client bundle. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D096 | Access | A2 anonymous per-device learner profiles are not implemented. There is one local session record, so siblings sharing a browser share progress. | NOT IMPLEMENTED |
| D097 | Access | A3 individual accounts are not implemented. There is no server-side learner database. | NOT IMPLEMENTED |
| D098 | Access | A4 role-based access (learner, teacher, reviewer, admin) is not implemented. The reviewer spreadsheet is a human process, not application authorisation. | NOT IMPLEMENTED |
| D099 | Access | A5 school or organisation single sign-on is deferred and out of MVP scope. | DEFERRED + OUT OF SCOPE |
| D100 | Access | A6 production or minor-user service: not production-ready. It needs a threat model, privacy notices and consent, deletion, retention, monitoring, backups, abuse response, security and legal review and an approved user study. | NOT IMPLEMENTED + NOT TESTED |
| D101 | Access | Security headers (CSP and others) are sent on every response; traversal and private paths are refused. No independent security review has been done. | VERIFIED IN CODE/TEST + NOT TESTED |
| D110 | Hosting | Hosting target: a long-running Node process on the laptop, optionally behind a private HTTPS tunnel. Serverless or static-only hosting does not fit. | DECIDED FOR MVP |
| D111 | Hosting | HTTPS is required for a realistic iPhone Safari or PWA test. No real tunnel, host or account has been used; the runbook was dry-run locally only. | NOT TESTED + BLOCKED |
| D120 | Devices | Target device matrix: Galaxy S23, S25, S25 FE (Chrome and Samsung Internet) and iPhone 16 (Safari): seven combinations. All NOT TESTED. | DECIDED FOR MVP + NOT TESTED |
| D121 | Devices | Low-end device support is not claimed. | NOT TESTED |
| D122 | Devices | Evidence from different machines is kept apart: the team's earlier managed environment (browser blocked by administrator policy), the team's Mac log (Node 26.8.2, browser scripts BLOCKED/ENOENT), and the build sandbox (Chromium 141, all checks pass). None is promoted into another. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D130 | Accessibility | Automated accessibility audit: 33 state/viewport combinations, 462 checks, 0 failed (names, 44 px targets, focus, contrast, size, reflow, lang, landmarks) in headless Chromium. Not a screen-reader or real-phone test. | VERIFIED IN CODE/TEST + NOT TESTED |
| D140 | Content review | Status machine: items stay UNREVIEWED_DRAFT until a qualified reviewer approves; reviewer name and date are blank; code never promotes a status. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D150 | Evaluation | Evaluation dataset: 47 English synthetic cases written by the team with AI help and labelled TEAM_AUTHORED_UNVALIDATED (27 misconception, 8 correct, 4 ambiguous, 8 insufficient). No Odia or Roman-Odia cases. | DECIDED FOR MVP + NOT REVIEWED |
| D151 | Evaluation | Mock baseline: 47/47 valid, 34/47 agreement (72%), 0/8 false positives on correct reasoning, 2/12 correct abstentions. These are weak internal numbers about a rule, not accuracy of any model. | VERIFIED IN CODE/TEST |
| D152 | Evaluation | Live Groq evaluation: BLOCKED (credentials not configured). Not run. | BLOCKED + NOT TESTED |
| D153 | Evaluation | No learning outcome has been measured: no pre/post test, no comparison group, no learner. | NOT TESTED |
| D160 | UX | Feedback-first flow: answer, explain in your own words, get a provisional label and a next step; notices and an exportable decision trace show what the agent did. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D161 | UX | Bridge Practice: an offline match-the-meaning exercise built only from the pack's three-part mappings; exact match means 'matches the pack'. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D162 | UX | Access overlay: when the server needs a code, the app shows an Unlock demo overlay; the code is held for the tab only. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D170 | Impact | No 'first', 'only', 'revolutionary' or proven-benefit claims. Offline learning, diagnostic questions and bilingual tools already exist. | DECIDED FOR MVP |
| D180 | Event | Rule 4.1 says all code and architecture must be built during competition hours. This repository was built earlier. The team reports that the organisers allowed early work, and API use; no saved message exists. | TEAM-REPORTED + UNKNOWN |
| D181 | Event | Team-reported event facts: shortlisted, continuous overnight event, all APIs allowed, HTTPS tunnel and personal devices allowed. None is saved in writing in the repository. | TEAM-REPORTED |
| D182 | Event | Public pages are inconsistent about the mid-evaluation time. Plan to the assigned slot in writing and treat the earliest plausible time as a contingency, not as an official time. | UNKNOWN |
| D183 | Event | Provenance: AI-assisted build; every commit is authored 'Claude (AI-assisted build)'; Iteration 3 history was rebuilt after a sandbox reset and disclosed; history is appended and never rewritten. | DECIDED FOR MVP |
| D190 | Scope | RAG over full textbooks and textbook ingestion are deferred or rejected for the MVP. | REJECTED FOR MVP + DEFERRED |
| D191 | Scope | Teacher dashboard and reviewer accounts are not implemented. | NOT IMPLEMENTED + DEFERRED |
| D192 | Scope | Parent portal and notifications are not implemented. | NOT IMPLEMENTED + OUT OF SCOPE |
| D193 | Scope | Analytics and usage tracking are not implemented; nothing is collected about the learner beyond the local record and the re-check request. | NOT IMPLEMENTED |
| D194 | Scope | Learner location and GPS are not used. | NOT IMPLEMENTED |
| D195 | Scope | Camera, OCR and photo-of-question input are not implemented. | NOT IMPLEMENTED + DEFERRED |
| D196 | Scope | Gamification, payments, LMS integration and school SSO are out of scope. No repository record of a gamification decision was found. | OUT OF SCOPE + NOT FOUND IN EVIDENCE |
| D197 | Scope | Multiple subjects, extra packs and a board/class switcher are not implemented; the engine is generic but only one pack exists. | NOT IMPLEMENTED + DEFERRED |
| D200 | Process | Iteration 7 is documentation-only: runtime behaviour, pack, statuses and service-worker cache are unchanged from Iteration 6. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D201 | Process | Decision-record vocabulary: DECIDED FOR MVP, TEAM-REPORTED, VERIFIED FROM SOURCE, VERIFIED IN CODE/TEST, PROVISIONAL, DEFERRED, REJECTED FOR MVP, UNKNOWN, NOT TESTED, NOT REVIEWED, NOT IMPLEMENTED, plus NOT EVALUATED, BLOCKED, OUT OF SCOPE, NOT FOUND IN EVIDENCE and NOT SELECTED. A claim-matrix status vocabulary also exists and stays. | DECIDED FOR MVP |
| D202 | Process | Dates are filled only where a dated source exists. Git commit dates are not decision dates (Iteration 3 history was rebuilt). | DECIDED FOR MVP |
| D203 | Tooling | Browser tests find an already-installed Chrome, Chromium or Edge through one shared, offline resolver: an explicit CHROME_PATH first (invalid means BLOCKED, never another browser), then standard macOS, Linux and Windows locations. A missing or policy-blocked browser leaves the browser checks BLOCKED. Nothing is installed or downloaded. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D204 | Curriculum | CHSE Odisha (+2, Classes XI-XII) is tracked as its own future higher-secondary track. It is not a Class X board and no Class X support is implied. ICSE is the examination of the council CISCE; WBBSE is kept apart from WBCHSE. | DEFERRED + NOT IMPLEMENTED |
| D205 | Event | RULE_4_1_STATUS=UNCONFIRMED. The team instructed engineering to proceed on 13 October without a saved written ruling. Local engineering proceeds; eligibility is a separate reported risk; history, timestamps and AI-assisted provenance are preserved; no claim of rule compliance, early-work approval or provider eligibility is made. | TEAM-REPORTED + UNKNOWN |
| D206 | Market | Pathasetu makes no claim to be first, only, unique or without a competitor. Adjacent systems exist per public pages (DIKSHA, ePathshala, Khan Academy India, general AI study modes, Kolibri); the team-named Jigyaso could not be read or verified in this pass. The combination of offline-first flow, source-traceable board mapping, an Odia bridge and honest review status is only a potential differentiator to test. | DECIDED FOR MVP + NOT EVALUATED |
| D207 | Product | The feature opportunity backlog assigns each idea NOW, NEXT, LATER or REJECT with scores and acceptance criteria. Only low-risk, testable, necessary items are implemented in an iteration; everything else stays a recommendation. | DECIDED FOR MVP |
| D208 | Process | Whole-project progress is reported as completed over applicable atomic criteria, per phase P0-P19 and overall from unique criteria (never the mean of phase percentages). Blocked and not-tested criteria stay in the denominator. A percentage is checklist coverage, not quality or eligibility. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D209 | Process | Iteration 8 changed only declared browser-tooling files. The old runtime-unchanged guard was split: historical Iteration 2-7 evidence is protected by recorded digests, and the Iteration 8 changes are declared and hash-recorded. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D210 | Tooling | Added `npm run doctor` as a local diagnostic that reports PASS, FAIL or BLOCKED for Node, required files, syntax, content consistency, mock-only preflight and browser executable discovery. It does not make a live model call or run browser suites. | VERIFIED IN CODE/TEST |
| D211 | Process | Iteration 9 was built in an extracted working copy of the supplied Iteration 8 ZIP. The ZIP has no .git directory; no commit was created and the prior HEAD is inherited from Iteration 8 records rather than independently verified. | DECIDED FOR MVP |
| D212 | Tooling | Iteration 10 added deterministic fault-injection, generated-sequence and mutation tests for the re-check queue, bounded retry, validator, recovery and persistence invariants (criterion P10-09, feature J07). They use injected clocks and providers and a seeded generator. They are synthetic engineering evidence; they say nothing about learning gain, model accuracy or mastery. | VERIFIED IN CODE/TEST |
| D213 | Product | A re-check result that the caller supplies but that is missing (null or undefined) is a rejected provider result: the entry stays queued, one attempt is counted and the retry policy applies. Only a call that omits the diagnosisOverride key uses the local rule. Queue and answer ids are checked against the ids already in the state, so a repeated clock-and-random id cannot give two entries the same id. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D214 | Process | Iteration 10 results are reported per environment. The Iteration 9 results (managed policy blocked navigation, capture/e2e/a11y BLOCKED) stay as that environment's record. The Iteration 10 build sandbox could navigate, so its capture, e2e and accessibility results are its own, are labelled with that environment, and do not replace or overwrite the Iteration 9 files. Neither says anything about a phone. | DECIDED FOR MVP + VERIFIED IN CODE/TEST |
| D215 | Scope | Two edge cases found while reading the code are documented, not changed: (1) with a content pack of only one question, the double-submit guard cannot tell a double tap from a deliberate re-answer; the shipped pack has eight questions. (2) A malformed clock string passed to the failure recorder throws a RangeError after the retry count has already changed; the app always passes a valid time. | DEFERRED + NOT IMPLEMENTED |
| D216 | Reliability | Retry failure recording validates its clock input before changing queue fields. Invalid or noncanonical timestamps throw RangeError `invalid_retry_timestamp`; the entry and surrounding state remain unchanged. The shipped eight-question double-submit guard is unchanged; single-question behaviour remains open. | VERIFIED IN CODE/TEST |
| D217 | Event | For the 24-hour NEXTECH demo, prioritise one inspectable end-to-end learning journey and map current evidence to four core and four bonus criteria; do not add a feature solely to increase screen count. The estimate of approximately 50 competing teams remains team-reported. | DECIDED FOR MVP + TEAM-REPORTED |
| D218 | Tooling | Each of the 46 mutants runs only the test groups for the behaviour it changes (a per-mutant plan in scripts/lib/mutants.mjs), instead of every invariant test. `npm run mutation -- --full` still runs every mutant against every invariant test as a cross-check, and `--tests` still runs other files. No mutant was removed, renamed or reordered, and no assertion was changed. | VERIFIED IN CODE/TEST |
| D219 | Tooling | A mutant is KILLED only if the unmutated selected tests pass, at least one test really executed (skipped and unmatched tests, and the runner's own line for the test file, do not count), the mutated run executed the same number of tests and at least one failed. Anything else irregular is ERROR. A run that exhausts its time budget (default 600 s) is INCOMPLETE: unrun mutants are NOT_RUN, no score is claimed and the exit code is 3. The report is rewritten after every mutant, and the TAP reporter is forced because Node 23 changed the default non-TTY reporter from tap to spec. | VERIFIED IN CODE/TEST |
| D220 | Process | An existing mutation-results.json is never replaced without `--overwrite`, and the default output folder is evidence/iteration12/mutation. During the red phase of this iteration the old runner, run by the new tests without an output folder, overwrote the Iteration 10 mutation record; the tests noticed, and the two files were restored byte for byte from the Iteration 11 archive before anything was built on them. | VERIFIED IN CODE/TEST |
| D221 | Event | A one-page operator card was added (docs/DEMO_QUICK_CARD.md) after comparing the strategy, checklist, runbook and pitch documents. They had the order and the claim limits but not the exact on-screen wording, the four real routes with a tested request, where the current evidence is, or compact stop conditions. The card makes no new claim: it says the mock is a rule, nothing ran on a phone, and a policy block is BLOCKED. | DECIDED FOR MVP |
| D222 | Scope | The cause of the Iteration 11 mutation timeout is not established. The supplied report says only that the sweep exceeded the execution limit after partial output through C7. In this sandbox the unchanged Iteration 11 harness completed all 46 mutants in about 37 s (46 killed), so the repeated 62-test combination is not shown to be the cause. Iteration 11's INCOMPLETE record stays as written and is not replaced by this iteration's completed run. | UNKNOWN |
| D223 | Product | The re-check recommendation no longer pulls the plan back to a question the learner has already answered. The same-concept bonus in chooseNextItem applies only to unanswered questions. A wrong first answer still gets its companion question in the same concept; the plan then moves forward. No question, answer label, board or UI file changed. | VERIFIED IN CODE/TEST |
| D224 | Provider | Diagnosis is proposed by an ordered chain of model providers chosen only by environment variables (Ollama, Gemini, Groq; PATHASETU_MODEL_PROVIDERS). No model name or key is built in; each provider needs an explicit model. The first answer that passes the existing allow-list validator wins. If every provider fails, /api/recheck returns an honest 502 with codes only and the fixed option-linked rule is never substituted. With no provider configured the labelled mock remains the default. | VERIFIED IN CODE/TEST + NOT TESTED |
| D225 | Product | The next question can be suggested by the model. The server asks the same chain for a next question id and a short reason; the suggestion is accepted only if it names a different question that exists and carries a reason of at most 300 characters. Otherwise the built-in planner is used and the record and the screen say so (planSource model, deterministic_fallback, or deterministic_local). The browser sends only an id-only history, never the learner's free text. | VERIFIED IN CODE/TEST + NOT TESTED |
| D226 | Technology | Retry limits and timings, and the model time budgets, come from the environment (PATHASETU_RETRY_MAX_ATTEMPTS, _BASE_DELAY_MS, _FACTOR, _MAX_DELAY_MS, PATHASETU_MODEL_TIMEOUT_MS, _DEADLINE_MS). The documented defaults (5 attempts, 5 s base, factor 2, 60 s cap, 20 s per provider, 45 s per chain) apply only when a variable is unset; a set but invalid value stops startup. The server reports the values in /api/health and the browser uses them, including the re-check timeout. | VERIFIED IN CODE/TEST |
| D227 | Content | A draft-question generator (npm run generate:drafts) asks the configured chain for new questions on a concept already in the pack. Output is written outside content/, public/, src/ and scripts/, every item is forced to UNREVIEWED_DRAFT with no reviewer, carries provenance (provider, model, time, reviewRequired), and is validated structurally; nothing is loaded by the app. | VERIFIED IN CODE/TEST + NOT REVIEWED |
| D228 | Access | A hosted provider (Gemini, Groq, or an Ollama URL that is not loopback) requires a strong demo access code at startup, and preflight requires PATHASETU_PROVIDER_DATA_CONTROLS_ACK=true. API keys travel only in request headers, never in a URL, body, log or error. Failed provider calls expose stable codes only, never an upstream body. Test, capture and preflight servers blank PATHASETU_MODEL_PROVIDERS so a shell variable cannot send test data to a model. | VERIFIED IN CODE/TEST |
| D229 | Provider | Gemini is called with responseMimeType application/json and the JSON Schema is placed in the system instruction, not in a schema field, because the Gemini documentation fetched during research did not let the build confirm a responseSchema or responseJsonSchema field for generateContent. Every model name must be set explicitly. | VERIFIED IN CODE/TEST + NOT TESTED |
| D230 | Reliability | A saved record with a missing answers, queue or trace array was previously returned unrepaired and reported as having no repairs, which would crash the page later. Missing is now treated as damage, repaired to an empty array and reported. The seeded fuzz found it only after a new learner field changed which paths the random edits hit. | VERIFIED IN CODE/TEST |
| D231 | Scope | What is still fixed, stated plainly: the list of allowed misconceptions for each question (content, set by the pack), the 0.65 confidence floor in the validator, the option-linked rule that gives the very first offline feedback in the browser (before any model is reachable), the built-in planner used as the labelled fallback, and the default retry and time numbers. The request that nothing be hard-coded is therefore met for the online diagnosis, the next-question choice, the retry settings and question drafting, and not met for the offline first feedback or the safety validator. | DECIDED FOR MVP |
| D232 | Technology | The service-worker cache name moves from pathasetu-shell-v8 to pathasetu-shell-v9 because public/app.js changed and the shell is cache-first; old caches are deleted on activate. | VERIFIED IN CODE/TEST |
| D233 | Reliability | The unit tests build the environment of every server or script they start with tests/helpers/cleanEnv.js, which drops PATHASETU_*, provider, model, host, port and NODE_ENV variables inherited from the terminal. A new test runs the server and preflight suites under a fully exported provider chain. | VERIFIED IN CODE/TEST |
| D234 | Learning UX | After an answer the result card states whether the choice matches the draft answer key, shows the key with its Odia and English explanation, and carries a Continue button; a fixed Continue bar stays at the bottom of the screen while an answered question waits. | VERIFIED IN CODE/TEST |
| D235 | AI reasoning | A model result that names a misconception (or NONE) with confidence below 0.65 is kept as UNCERTAIN instead of being rejected; every other validator rejection is unchanged and the threshold itself is unchanged. | VERIFIED IN CODE/TEST |
| D236 | Technology | The service worker fetches app files network first (3 s, then the cached copy), the cache name moves from pathasetu-shell-v9 to pathasetu-shell-v10, and a confirmed Reset demo button clears this device's saved data, caches and service worker. | VERIFIED IN CODE/TEST |
| D237 | Honesty | Re-check replies carry planAttempted, and the browser labels a missing plan as a planner fallback only when a model plan was really tried; the plan sentence now names who chose the next question. | VERIFIED IN CODE/TEST |
<!-- DECISION_INDEX_END -->

## 8. Decisions to keep fixed unless evidence requires change

1. Product name: Pathasetu (D001).
2. Target: one Odia-medium BSE Odisha Class X learner (D005, D010).
3. Subject and topic: General Science (Physical Science), Electricity (D022).
4. Language bridge: everyday Odia → formal school Odia → English term (D030).
5. Core loop: observe → propose → validate → plan → act → save and trace → re-check and re-plan (D040).
6. Deterministic controller; no multi-agent claim (D044).
7. The mock stays the default; a live provider only after a local, configured, synthetic smoke and an honest label (D060, D065).
8. All content stays draft until a qualified review (D140).
9. No production authentication, learner profiles or teacher dashboard claim (D096–D100, D191).
10. No outcome or phone-compatibility claim until measured (D120, D153).

## 9. How the next agent or teammate must use this register

- Read the files named in `docs/DECISION_AUDIT_REPORT.md` before editing; re-run the checks that apply to the environment and label an unavailable browser `BLOCKED`, never `PASS`.
- Change a decision only with new evidence, and add or amend its row in `docs/DECISION_LOG.csv`; the index here must then be regenerated (the test names the mismatch).
- Never auto-promote content status, invent a reviewer, a learner study, an organiser approval or a date, or turn a team-reported claim into a verified fact.
- Treat any real learner under 18 as a privacy and safeguarding matter. Use synthetic data in tests and demos.
- A board list is a comparison, not a request for a board selector.
