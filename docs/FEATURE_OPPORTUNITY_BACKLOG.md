# Feature opportunity backlog (Iteration 8)

**Date:** 13 October 2026 (IST). **Machine-readable copy:** `docs/FEATURE_OPPORTUNITY_BACKLOG.csv` (one row per feature, generated together with this file). **Related:** `docs/COMPETITIVE_LANDSCAPE.md`, `docs/PHASE_COMPLETION_MATRIX.md`, `docs/BUILD_STATUS.md`.

This backlog reviews eleven domains (A to K) and **91 features**. It is a set of recommendations, **not a list of what is built**. The column "Current status" says what already exists in the repository; a feature suggested here is never reported as implemented merely because it is suggested. Decisions: **NOW 21**, **NEXT 34**, **LATER 31**, **REJECT 5**. Priorities: P0 21, P1 26, P2 23, P3 21.

## How decisions were made

- **NOW** means "in place or done in Iteration 8 and kept". Only low-risk, testable, necessary items were done in this iteration: the browser resolver (J01), the competitor audit (K03), the phase-matrix test (J10) and the board register (see A01 and the board comparison). Everything else is a recommendation.
- **NEXT** means the next iteration or the next human step. **LATER** needs scope, content, reviewers, devices or permissions that do not exist yet. **REJECT** means not to be built unless an ethics or safety review reopens it.
- **Scores** run 1 to 5 on eight dimensions. For the first five, 5 is better. For **engineering effort, validation burden and dependency risk, 5 means the highest burden or risk**. The scores are the assistant's judgement with a short reason on each row; there is **no combined score and no ranking by number**, on purpose. The team should change any score it disagrees with.
- Default policy buckets from the Iteration 8 brief were challenged, not accepted blindly. Examples: the board selector (B01) stays LATER because only one draft track exists and its board identity is not confirmed; STT (C04) and Bhashini (C09) stay LATER because child voice data and Odia quality are unverified; the CI service (J08) is REJECTed for now to avoid creating accounts without approval.
- **J09 (data-saver issue triage)** is listed because the brief names it, but the repository holds no description of the issue, so its scope is UNKNOWN. It cannot be scheduled until the team describes the failing behaviour.
- Competitor overlap cites `docs/COMPETITIVE_LANDSCAPE.md`; "SOURCE_ONLY" means a source page was read and the product was not used. Nothing here claims novelty.

## Summary by domain

| Domain | Features | NOW | NEXT | LATER | REJECT |
|---|---|---|---|---|---|
| A Curriculum, provenance and content governance | 7 | 0 | 5 | 2 | 0 |
| B Learner experience and pedagogy | 13 | 4 | 2 | 6 | 1 |
| C Multilingual bridge and inclusive access | 9 | 1 | 2 | 6 | 0 |
| D Subject-specific Science / Electricity | 5 | 0 | 2 | 3 | 0 |
| E Agent, AI and ML engineering | 10 | 3 | 4 | 2 | 1 |
| F Offline-first, sync and PWA reliability | 8 | 5 | 3 | 0 | 0 |
| G Analytics and recommendation quality | 6 | 2 | 2 | 1 | 1 |
| H Teacher, parent, reviewer and classroom operations | 6 | 0 | 1 | 4 | 1 |
| I Security, safety, privacy and compliance | 7 | 2 | 4 | 1 | 0 |
| J Platform, performance and engineering quality | 10 | 2 | 7 | 0 | 1 |
| K Product, trust, rollout and sustainability | 10 | 2 | 2 | 6 | 0 |
| **Total** | **91** | **21** | **34** | **31** | **5** |

## Index

| ID | Feature | Priority | Decision | Effort | Phase | Current status |
|---|---|---|---|---|---|---|
| A01 | Structured curriculum hierarchy | P2 | NEXT | L | P2 | PARTIAL (register CSV, flat pack) |
| A02 | Versioned source registry | P1 | NEXT | M | P2 | PARTIAL (S1-S20 table in the comparison document, no hashes) |
| A03 | Crosswalk overlap vocabulary | P1 | NEXT | S | P2 | PARTIAL (crosswalk exists; vocabulary not enforced) |
| A04 | Content lifecycle with reviewer evidence | P1 | NEXT | L | P3 | PARTIAL (status field and rubric only) |
| A05 | Rich item metadata | P1 | NEXT | M | P3 | PARTIAL (misconception and correct reasoning exist) |
| A06 | Import and authoring tool | P3 | LATER | XL | P17 | NOT_IMPLEMENTED |
| A07 | Cross-board reuse guard | P2 | LATER | S | P2 | NOT_IMPLEMENTED |
| B01 | Verified board/class/medium selector | P2 | LATER | L | P2 | NOT_IMPLEMENTED (no board picker, by decision) |
| B02 | Guest use with no forced account | P0 | NOW | S | P5 | IMPLEMENTED (draft scope) |
| B03 | Diagnostic pre-test with confidence rating | P1 | NEXT | M | P5 | NOT_IMPLEMENTED |
| B04 | One question at a time | P0 | NOW | S | P5 | IMPLEMENTED (draft scope) |
| B05 | Hint ladder per question | P1 | NEXT | L | P3 | NOT_IMPLEMENTED |
| B06 | Feedback tied to the learner's answer, with 'not sure' | P0 | NOW | M | P6 | PARTIAL (selected-answer logic and abstention exist; rationale unreviewed) |
| B07 | Bounded study actions | P2 | LATER | L | P5 | NOT_IMPLEMENTED |
| B08 | Retrieval practice and spaced review | P2 | LATER | L | P5 | NOT_IMPLEMENTED |
| B09 | Progress map with uncertainty and revision queue | P2 | LATER | L | P5 | PARTIAL (simple counts only) |
| B10 | Confidence calibration and reflection | P2 | LATER | S | P5 | NOT_IMPLEMENTED |
| B11 | Resume, reset and export controls | P0 | NOW | S | P7 | PARTIAL (resume and trace export exist; reset coverage to confirm) |
| B12 | Printable worksheet of reviewed items | P3 | LATER | M | P17 | NOT_IMPLEMENTED |
| B13 | Streak shaming, public leaderboards, addictive loops | P3 | REJECT | S | P4 | NOT_IMPLEMENTED (by decision) |
| C01 | Everyday Odia / school Odia / English bridge with visible status | P0 | NOW | M | P8 | IMPLEMENTED (draft scope, unreviewed) |
| C02 | Roman-Odia and Unicode normalisation | P2 | LATER | M | P8 | NOT_IMPLEMENTED |
| C03 | Reviewed glossary, audio and text-to-speech | P2 | LATER | L | P8 | NOT_IMPLEMENTED |
| C04 | Speech-to-text input | P3 | LATER | XL | P17 | NOT_IMPLEMENTED |
| C05 | Font shaping and rendering check on real phones | P1 | NEXT | S | P12 | NOT_TESTED |
| C06 | Font-size and contrast themes | P2 | LATER | M | P4 | PARTIAL (reduced-motion and system contrast only) |
| C07 | Low-data mode and pack downloads | P2 | NEXT | M | P4 | PARTIAL (text-only today) |
| C08 | QR or book-code deep link | P3 | LATER | L | P17 | NOT_IMPLEMENTED |
| C09 | Optional Bhashini adapter | P3 | LATER | L | P17 | NOT_IMPLEMENTED |
| D01 | Reviewed circuit diagrams | P1 | NEXT | M | P3 | NOT_IMPLEMENTED |
| D02 | Prediction-first virtual experiments | P2 | LATER | L | P3 | NOT_IMPLEMENTED |
| D03 | Interactive circuit builder | P3 | LATER | XL | P17 | NOT_IMPLEMENTED |
| D04 | Formula, units and numerical practice | P2 | LATER | L | P3 | NOT_IMPLEMENTED |
| D05 | Model versus real-world note, and no invented physics | P1 | NEXT | S | P6 | PARTIAL (allow-list only) |
| E01 | Bounded orchestration with visible lifecycle | P0 | NOW | L | P6 | IMPLEMENTED (draft scope) |
| E02 | Retrieval-grounded answers from the reviewed pack | P2 | LATER | L | P6 | NOT_IMPLEMENTED |
| E03 | Deterministic offline fallback | P0 | NOW | M | P6 | IMPLEMENTED (draft scope; a rule, not a model) |
| E04 | Prompt-injection resistance | P1 | NEXT | M | P9 | PARTIAL |
| E05 | Adapter hardening: timeout, retry, circuit breaker, budget | P2 | NEXT | S | P13 | PARTIAL |
| E06 | Teacher-labelled evaluation set and metrics | P1 | NEXT | L | P10 | PARTIAL (harness only, synthetic cases) |
| E07 | Preregistered thresholds | P1 | NEXT | S | P13 | NOT_IMPLEMENTED |
| E08 | No 'the AI understood the learner' claims | P0 | NOW | S | P16 | IMPLEMENTED |
| E09 | On-device small model | P3 | LATER | XL | P17 | NOT_IMPLEMENTED |
| E10 | Multi-agent orchestration | P3 | REJECT | L | P6 | NOT_IMPLEMENTED (by decision) |
| F01 | First-visit caching and offline banner | P0 | NOW | M | P7 | IMPLEMENTED (headless Chromium only) |
| F02 | Durable queue with idempotent ids and bounded backoff | P0 | NOW | M | P7 | IMPLEMENTED |
| F03 | Per-question draft isolation | P0 | NOW | S | P7 | IMPLEMENTED |
| F04 | Sync status, last synced time, update notice | P1 | NEXT | M | P7 | PARTIAL |
| F05 | Single-writer tab guard | P0 | NOW | M | P7 | IMPLEMENTED |
| F06 | Storage migration and corruption repair | P1 | NEXT | M | P7 | PARTIAL |
| F07 | Foreground reconnect retry, not Background Sync alone | P0 | NOW | S | P7 | IMPLEMENTED (Chromium only tested) |
| F08 | Separate cold-start and offline-after-visit tests | P1 | NEXT | S | P7 | PARTIAL |
| G01 | Local event taxonomy with schema version | P2 | NEXT | M | P10 | PARTIAL (trace) |
| G02 | Separate operational and learning metrics | P2 | LATER | M | P10 | NOT_IMPLEMENTED |
| G03 | Transparent recommendation reason | P0 | NOW | S | P6 | IMPLEMENTED |
| G04 | No external analytics SDK; anonymous export | P0 | NOW | S | P9 | IMPLEMENTED |
| G05 | Pre/post study design with consent | P1 | NEXT | L | P15 | NOT_IMPLEMENTED |
| G06 | Third-party analytics and ads | P3 | REJECT | S | P9 | NOT_IMPLEMENTED (by decision) |
| H01 | Reviewer workspace | P2 | LATER | XL | P17 | PARTIAL (worksheet CSV and rubric) |
| H02 | Parent or teacher progress summary | P3 | LATER | L | P17 | NOT_IMPLEMENTED |
| H03 | Report-an-error route | P2 | NEXT | M | P3 | NOT_IMPLEMENTED |
| H04 | Class dashboard with privacy thresholds | P3 | LATER | XL | P17 | NOT_IMPLEMENTED |
| H05 | Ranking or profiling children from uncertain AI predictions | P3 | REJECT | S | P9 | NOT_IMPLEMENTED (by decision) |
| H06 | Multiple learner profiles on a shared phone | P3 | LATER | L | P17 | NOT_IMPLEMENTED (single local record) |
| I01 | Server-side keys, redaction, headers, origin and rate limits | P0 | NOW | M | P9 | IMPLEMENTED (A1 only) |
| I02 | Threat model for minors and shared devices | P1 | NEXT | M | P9 | PARTIAL |
| I03 | Data inventory and retention table | P1 | NEXT | S | P9 | PARTIAL (data flow in the guide) |
| I04 | Synthetic data only for hosted-model tests | P0 | NOW | S | P13 | IMPLEMENTED |
| I05 | Consent, privacy notice and legal review before a pilot | P1 | NEXT | M | P9 | NOT_IMPLEMENTED |
| I06 | Off-topic, abusive and harm-disclosure handling | P1 | NEXT | M | P9 | NOT_IMPLEMENTED |
| I07 | Per-learner authentication beyond a shared code | P3 | LATER | L | P9 | NOT_IMPLEMENTED (A1 only) |
| J01 | Portable browser discovery | P0 | NOW | M | P11 | DONE IN ITERATION 8 (sandbox-tested; Mac NOT_TESTED) |
| J02 | Doctor command with PASS, FAIL or BLOCKED | P1 | NEXT (Iteration 8 priority) | S | P14 | IMPLEMENTED IN ITERATION 9 (local diagnostic only; not a browser journey) |
| J03 | PWA installability and performance budgets | P2 | NEXT | M | P7 | PARTIAL (installable shell, no budget test) |
| J04 | Low-end CPU and throttled network checks | P1 | NEXT | M | P11 | NOT_IMPLEMENTED |
| J05 | Device and browser matrix | P1 | NEXT | L | P12 | NOT_TESTED |
| J06 | Screen-reader checks (TalkBack, VoiceOver) | P1 | NEXT | M | P12 | NOT_TESTED |
| J07 | Fault-injection and property tests for queue invariants | P2 | NEXT (Iteration 8 priority) | M | P10 | IMPLEMENTED IN ITERATION 10 (synthetic engineering tests; no browser or phone claim) |
| J08 | CI service setup | P3 | REJECT | M | P14 | NOT_IMPLEMENTED (by decision) |
| J09 | Data-saver issue triage | P1 | NEXT | S | P11 | NOT_STARTED (issue UNKNOWN) |
| J10 | Phase matrix recomputation test | P0 | NOW | S | P10 | DONE IN ITERATION 8 |
| K01 | Clear promise, limits and first-run walkthrough | P1 | NEXT | S | P4 | PARTIAL (draft badge and trust strip) |
| K02 | Provenance label and provider badge | P0 | NOW | S | P5 | IMPLEMENTED |
| K03 | Competitor audit and position statement | P0 | NOW | M | P18 | DONE IN ITERATION 8 (desk review) |
| K04 | Practice packs and school distribution | P3 | LATER | L | P17 | NOT_IMPLEMENTED |
| K05 | Cost and latency estimates per provider | P2 | NEXT | S | P13 | NOT_IMPLEMENTED |
| K06 | Feature flags, rollback, backups, incident response | P3 | LATER | L | P14 | NOT_IMPLEMENTED |
| K07 | Multilingual roadmap and content-interchange standards | P3 | LATER | M | P17 | NOT_IMPLEMENTED |
| K08 | Public deployment | P2 | LATER | M | P14 | BLOCKED (no deployment authorised) |
| K09 | More subjects and grades | P3 | LATER | XL | P17 | NOT_IMPLEMENTED |
| K10 | DIKSHA or learning-platform link-out | P3 | LATER | M | P17 | NOT_IMPLEMENTED |

## Scores

Columns: UV user value, LI learning impact, FIT fit for low-connectivity Odia learners, SAF safety and privacy benefit, DEMO demo feasibility, EFF engineering effort (5 = most), VAL validation burden (5 = most), DEP dependency risk (5 = most).

| ID | UV | LI | FIT | SAF | DEMO | EFF | VAL | DEP | Why these scores |
|---|---|---|---|---|---|---|---|---|---|
| A01 | 3 | 3 | 3 | 3 | 2 | 4 | 4 | 2 | Value is structural; heavy because real editions are UNKNOWN. |
| A02 | 3 | 2 | 2 | 3 | 3 | 2 | 2 | 1 | Cheap; mostly documentation discipline. |
| A03 | 3 | 3 | 2 | 3 | 4 | 1 | 2 | 1 | Small change with a clear test. |
| A04 | 5 | 4 | 3 | 5 | 3 | 4 | 5 | 4 | Value and safety are high; the reviewer is an external dependency. |
| A05 | 3 | 3 | 2 | 3 | 3 | 3 | 4 | 2 | Moderate effort; values need review. |
| A06 | 2 | 2 | 2 | 3 | 1 | 5 | 3 | 3 | High effort, low demo value now. |
| A07 | 2 | 3 | 1 | 3 | 2 | 1 | 2 | 1 | Cheap but idle until a second pack exists. |
| B01 | 3 | 2 | 3 | 3 | 2 | 4 | 4 | 3 | Deliberately later: no supported second track. |
| B02 | 4 | 2 | 5 | 4 | 5 | 1 | 1 | 1 | Already in place. |
| B03 | 4 | 4 | 3 | 3 | 3 | 3 | 4 | 2 | Needs more reviewed items than the eight. |
| B04 | 4 | 3 | 4 | 3 | 5 | 1 | 1 | 1 | Built and tested. |
| B05 | 5 | 5 | 3 | 3 | 3 | 4 | 5 | 3 | Content-heavy. |
| B06 | 5 | 5 | 3 | 4 | 4 | 2 | 4 | 2 | Core of the product; reviewer-limited. |
| B07 | 4 | 4 | 3 | 4 | 2 | 4 | 5 | 3 | Content volume is the cost. |
| B08 | 4 | 4 | 3 | 3 | 2 | 3 | 4 | 2 | Needs a bigger pack to be meaningful. |
| B09 | 3 | 3 | 3 | 3 | 2 | 3 | 5 | 3 | Risk of overclaiming dominates. |
| B10 | 2 | 3 | 3 | 3 | 3 | 2 | 3 | 1 | Modest. |
| B11 | 4 | 2 | 5 | 5 | 5 | 1 | 1 | 1 | Mostly built. |
| B12 | 3 | 2 | 5 | 3 | 2 | 2 | 3 | 2 | Useful later. |
| B13 | 1 | 1 | 1 | 1 | 3 | 1 | 1 | 1 | Rejected. |
| C01 | 5 | 4 | 5 | 4 | 5 | 2 | 5 | 2 | Central to the product; language review is the main gap. |
| C02 | 3 | 3 | 4 | 3 | 3 | 3 | 4 | 2 | Needs real samples. |
| C03 | 4 | 3 | 4 | 3 | 2 | 4 | 4 | 3 | Costly to review. |
| C04 | 4 | 3 | 4 | 1 | 1 | 5 | 5 | 5 | High risk and high burden. |
| C05 | 5 | 3 | 5 | 2 | 3 | 1 | 2 | 2 | Human step. |
| C06 | 4 | 2 | 4 | 3 | 4 | 2 | 2 | 1 | Sound but not blocking. |
| C07 | 4 | 2 | 5 | 3 | 4 | 2 | 2 | 1 | Low effort, matches the target context. |
| C08 | 3 | 2 | 4 | 3 | 1 | 3 | 4 | 5 | Dependent on permission. |
| C09 | 3 | 3 | 3 | 2 | 1 | 4 | 5 | 5 | External dependence. |
| D01 | 5 | 5 | 4 | 3 | 4 | 3 | 4 | 2 | Strong learning value. |
| D02 | 4 | 5 | 4 | 3 | 3 | 4 | 4 | 2 | Valuable later. |
| D03 | 4 | 5 | 3 | 3 | 1 | 5 | 5 | 2 | Costly and out of the demo's reach. |
| D04 | 5 | 4 | 3 | 3 | 2 | 3 | 4 | 3 | Depends on the exam format. |
| D05 | 4 | 4 | 3 | 5 | 4 | 1 | 2 | 1 | Cheap safety value. |
| E01 | 5 | 4 | 4 | 5 | 5 | 1 | 1 | 1 | Built. |
| E02 | 4 | 4 | 3 | 5 | 2 | 4 | 5 | 3 | Pack must be reviewed first. |
| E03 | 5 | 3 | 5 | 5 | 5 | 1 | 1 | 1 | Built. |
| E04 | 4 | 2 | 3 | 5 | 4 | 2 | 3 | 1 | Cheap and important. |
| E05 | 3 | 1 | 3 | 4 | 3 | 2 | 2 | 1 | Low effort. |
| E06 | 4 | 5 | 3 | 4 | 2 | 3 | 5 | 3 | Labels are the cost. |
| E07 | 3 | 3 | 2 | 4 | 4 | 1 | 2 | 1 | Cheap. |
| E08 | 4 | 1 | 2 | 5 | 5 | 1 | 1 | 1 | Built. |
| E09 | 3 | 3 | 5 | 5 | 1 | 5 | 5 | 5 | Research. |
| E10 | 1 | 1 | 1 | 1 | 1 | 5 | 3 | 3 | Rejected. |
| F01 | 5 | 3 | 5 | 3 | 5 | 1 | 1 | 1 | Built. |
| F02 | 5 | 2 | 5 | 3 | 5 | 1 | 1 | 1 | Built. |
| F03 | 4 | 2 | 3 | 3 | 5 | 1 | 1 | 1 | Built. |
| F04 | 4 | 2 | 5 | 4 | 4 | 2 | 2 | 1 | Moderate. |
| F05 | 4 | 1 | 3 | 4 | 5 | 1 | 1 | 1 | Built. |
| F06 | 3 | 1 | 4 | 4 | 4 | 2 | 2 | 1 | Moderate. |
| F07 | 4 | 1 | 5 | 3 | 5 | 1 | 1 | 1 | Built. |
| F08 | 3 | 1 | 4 | 4 | 5 | 1 | 1 | 1 | Cheap. |
| G01 | 3 | 3 | 3 | 5 | 4 | 2 | 2 | 1 | Moderate. |
| G02 | 2 | 2 | 2 | 3 | 2 | 2 | 2 | 1 | Low urgency. |
| G03 | 4 | 3 | 3 | 5 | 5 | 1 | 1 | 1 | Built. |
| G04 | 4 | 1 | 3 | 5 | 5 | 1 | 1 | 1 | Built. |
| G05 | 5 | 5 | 3 | 5 | 1 | 3 | 5 | 5 | Essential, external. |
| G06 | 1 | 1 | 1 | 1 | 3 | 1 | 1 | 1 | Rejected. |
| H01 | 4 | 3 | 2 | 4 | 1 | 5 | 4 | 3 | Costly now. |
| H02 | 3 | 3 | 2 | 3 | 1 | 3 | 4 | 3 | Later. |
| H03 | 4 | 3 | 3 | 4 | 4 | 2 | 2 | 1 | Cheap. |
| H04 | 3 | 3 | 2 | 3 | 1 | 5 | 4 | 5 | Out of scope now. |
| H05 | 1 | 1 | 1 | 1 | 3 | 1 | 1 | 1 | Rejected. |
| H06 | 4 | 2 | 5 | 4 | 2 | 4 | 4 | 2 | Valuable but large. |
| I01 | 4 | 1 | 3 | 5 | 5 | 1 | 1 | 1 | Built. |
| I02 | 3 | 1 | 3 | 5 | 4 | 2 | 3 | 1 | Moderate. |
| I03 | 3 | 1 | 3 | 5 | 5 | 1 | 2 | 1 | Cheap. |
| I04 | 4 | 1 | 2 | 5 | 5 | 1 | 1 | 1 | Built. |
| I05 | 4 | 1 | 2 | 5 | 1 | 2 | 5 | 5 | External. |
| I06 | 4 | 1 | 2 | 5 | 3 | 2 | 5 | 3 | Needs an expert. |
| I07 | 2 | 1 | 2 | 4 | 1 | 4 | 3 | 4 | Later. |
| J01 | 5 | 1 | 3 | 3 | 5 | 2 | 2 | 1 | Done; Mac result pending. |
| J02 | 3 | 1 | 3 | 3 | 5 | 1 | 1 | 1 | Cheap. |
| J03 | 4 | 2 | 5 | 3 | 4 | 2 | 2 | 1 | Cheap. |
| J04 | 4 | 1 | 5 | 3 | 3 | 2 | 2 | 1 | Useful. |
| J05 | 5 | 2 | 5 | 3 | 2 | 2 | 3 | 3 | Human work. |
| J06 | 4 | 2 | 3 | 4 | 2 | 2 | 3 | 2 | Human work. |
| J07 | 3 | 1 | 4 | 3 | 4 | 2 | 2 | 1 | Moderate. |
| J08 | 2 | 1 | 2 | 2 | 1 | 3 | 1 | 3 | Out of scope. |
| J09 | 3 | 1 | 4 | 2 | 3 | 1 | 2 | 1 | Scope unknown. |
| J10 | 3 | 1 | 2 | 4 | 5 | 1 | 1 | 1 | Done. |
| K01 | 4 | 2 | 3 | 5 | 5 | 1 | 1 | 1 | Cheap. |
| K02 | 4 | 1 | 2 | 5 | 5 | 1 | 1 | 1 | Built. |
| K03 | 4 | 1 | 1 | 4 | 5 | 2 | 2 | 1 | Done as a desk review. |
| K04 | 3 | 2 | 5 | 3 | 1 | 4 | 3 | 3 | Later. |
| K05 | 2 | 1 | 2 | 3 | 4 | 1 | 2 | 2 | Cheap. |
| K06 | 2 | 1 | 2 | 4 | 1 | 3 | 3 | 3 | Later. |
| K07 | 2 | 1 | 2 | 2 | 2 | 2 | 3 | 3 | Later. |
| K08 | 5 | 1 | 4 | 3 | 2 | 2 | 2 | 3 | Blocked by instruction. |
| K09 | 4 | 3 | 3 | 3 | 1 | 5 | 5 | 3 | Later. |
| K10 | 3 | 2 | 3 | 3 | 2 | 3 | 3 | 4 | Dependent. |

## Features by domain

### A Curriculum, provenance and content governance

#### A01 Structured curriculum hierarchy — P2 / NEXT / effort L / phase P2

- **User problem:** Items are a flat list; nothing says which board, class, book or chapter an item belongs to.
- **Proposed behaviour:** Represent board > qualification/exam > class > subject/paper > session > textbook/edition > chapter > concept > question as typed data with UNKNOWN allowed at every level.
- **Target user:** Class X learner
- **Learning rationale:** Makes it visible when content does not match the learner's actual book.
- **Competitor overlap:** DIKSHA holds board, medium, grade and subject metadata (SOURCE_ONLY).
- **Evidence and confidence:** MEDIUM: structure is standard; the real book data is UNKNOWN
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** Exact editions and chapters for each board (UNKNOWN today)
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** A schema file exists; every pack item resolves to a node or an explicit UNKNOWN; a test fails on an item with no node.
- **Tests needed:** Schema validation test; pack-to-node coverage test.
- **Dependency:** A02, source verification
- **Rationale:** Needed before any second board; the register CSV already lists the nodes at board level.
- **Current status:** PARTIAL (register CSV, flat pack)

#### A02 Versioned source registry — P1 / NEXT / effort M / phase P2

- **User problem:** Source claims sit in prose and can drift or lose their retrieval date.
- **Proposed behaviour:** One registry file: source id, URL, retrieval date, content hash, exact excerpt or page, and mapping rationale.
- **Target user:** Class X learner
- **Learning rationale:** Lets a reviewer check a mapping against its source.
- **Competitor overlap:** None found in the scan.
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: copies of public pages only; respect their terms before storing
- **Acceptance criteria:** Every source cited in the comparison document has a registry row with a date and hash; a test fails on a cited id missing from the registry.
- **Tests needed:** Registry integrity test; hash re-check script (offline against saved copies).
- **Dependency:** A01
- **Rationale:** Turns the S1-S20 table into checkable data.
- **Current status:** PARTIAL (S1-S20 table in the comparison document, no hashes)

#### A03 Crosswalk overlap vocabulary — P1 / NEXT / effort S / phase P2

- **User problem:** Two boards may name the same idea differently, or cover different depth.
- **Proposed behaviour:** Each crosswalk row carries SAME_CONCEPT, PARTIAL_OVERLAP, BOARD_SPECIFIC or UNKNOWN with the evidence; no silent reuse between boards.
- **Target user:** Class X learner
- **Learning rationale:** Prevents teaching a board-specific fact to the wrong learner.
- **Competitor overlap:** None found.
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Crosswalk columns validated against the four words; UNKNOWN is the default; a test fails on any other word.
- **Tests needed:** Vocabulary test over docs/BOOK_CROSSWALK.csv.
- **Dependency:** A01
- **Rationale:** Small and testable; the crosswalk exists but does not yet use this vocabulary.
- **Current status:** PARTIAL (crosswalk exists; vocabulary not enforced)

#### A04 Content lifecycle with reviewer evidence — P1 / NEXT / effort L / phase P3

- **User problem:** Every item is UNREVIEWED_DRAFT; there is no path to reviewed, no record of who or when.
- **Proposed behaviour:** States UNREVIEWED_DRAFT > subject-reviewed > language-reviewed > approved > published, each needing a named reviewer, date and version; immutable versions, change diff, rollback, expiry.
- **Target user:** Class X learner
- **Learning rationale:** Prevents unreviewed content being presented as correct.
- **Competitor overlap:** None found.
- **Evidence and confidence:** HIGH that governance is needed (review gap is the project's main open gate)
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** Reviewer access (NOT_REVIEWED today)
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Status changes require reviewer and date fields; a test refuses 'approved' without both; rollback restores a prior version byte for byte.
- **Tests needed:** State-machine test; version immutability test; rollback test.
- **Dependency:** Qualified human reviewer (external)
- **Rationale:** The review pipeline is the highest-value near-term item; code is the smaller half, the reviewer is the larger.
- **Current status:** PARTIAL (status field and rubric only)

#### A05 Rich item metadata — P1 / NEXT / effort M / phase P3

- **User problem:** An item lacks stated learning outcome, difficulty, distractor rationale, language variant and accessibility equivalents.
- **Proposed behaviour:** Add fields: intended outcome, difficulty, misconception, correct reasoning, distractor rationale, script/variant, citation, accessibility equivalent, status, tags.
- **Target user:** Class X learner
- **Learning rationale:** Supports review, hint ladders and evaluation.
- **Competitor overlap:** None found.
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** All eight items carry every field or an explicit UNKNOWN; check:content fails on a missing field. Content text is not changed by this ticket.
- **Tests needed:** Extension of the content consistency check.
- **Dependency:** Reviewer for the values
- **Rationale:** Adds structure only; the values need a reviewer.
- **Current status:** PARTIAL (misconception and correct reasoning exist)

#### A06 Import and authoring tool — P3 / LATER / effort XL / phase P17

- **User problem:** Authoring is hand-edited JSON.
- **Proposed behaviour:** A guided tool that imports items and prints a validation report; never marks anything approved.
- **Target user:** Class X learner
- **Learning rationale:** Lowers the cost of review cycles.
- **Competitor overlap:** Kolibri and DIKSHA have authoring tools (SOURCE_ONLY).
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Imported items arrive as UNREVIEWED_DRAFT with a report; invalid files are rejected with reasons.
- **Tests needed:** Import fixtures; negative cases.
- **Dependency:** A04, A05
- **Rationale:** Large; premature before the lifecycle and metadata exist.
- **Current status:** NOT_IMPLEMENTED

#### A07 Cross-board reuse guard — P2 / LATER / effort S / phase P2

- **User problem:** A future second pack could silently reuse another board's items.
- **Proposed behaviour:** Test: an item may appear under a second board only through a crosswalk row of SAME_CONCEPT with evidence.
- **Target user:** Class X learner
- **Learning rationale:** Protects against board-specific errors.
- **Competitor overlap:** None found.
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** With two packs present, the test fails on an item id or text shared without a crosswalk row.
- **Tests needed:** Cross-pack uniqueness test (fixture packs until a second real pack exists).
- **Dependency:** A03, a second pack
- **Rationale:** Nothing to guard until a second pack exists.
- **Current status:** NOT_IMPLEMENTED

### B Learner experience and pedagogy

#### B01 Verified board/class/medium selector — P2 / LATER / effort L / phase P2

- **User problem:** A learner on another board could be shown BSE-aligned draft items.
- **Proposed behaviour:** Show a selector only for tracks that have a reviewed pack; others display 'not available'. No automatic board inference.
- **Target user:** Class X learner
- **Learning rationale:** Prevents mismatched practice.
- **Competitor overlap:** DIKSHA and Khan Academy India filter by board or language (SOURCE_ONLY).
- **Evidence and confidence:** HIGH that mismatch is a risk
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Medium: selecting a board is profile data; keep local
- **Acceptance criteria:** The selector lists only tracks with a reviewed pack; with none reviewed it shows the single draft track labelled DRAFT.
- **Tests needed:** UI test per state; negative test for an unavailable track.
- **Dependency:** A01, A04, reviewed packs for each board
- **Rationale:** Only one draft track exists, and its board identity is not confirmed; a selector now would imply support that does not exist.
- **Current status:** NOT_IMPLEMENTED (no board picker, by decision)

#### B02 Guest use with no forced account — P0 / NOW / effort S / phase P5

- **User problem:** Forcing sign-up blocks shared-phone learners.
- **Proposed behaviour:** The learning flow works without an account; the demo access code is a deployment lock, not a learner login.
- **Target user:** Class X learner
- **Learning rationale:** Lowers friction.
- **Competitor overlap:** DIKSHA allows guest use (SOURCE_ONLY).
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** No account screen precedes the question; a test confirms the first screen is the question view after the demo code.
- **Tests needed:** Existing end-to-end journey.
- **Dependency:** None
- **Rationale:** Already true for the MVP; keep it.
- **Current status:** IMPLEMENTED (draft scope)

#### B03 Diagnostic pre-test with confidence rating — P1 / NEXT / effort M / phase P5

- **User problem:** The first question may be too hard or easy; confidence is never captured.
- **Proposed behaviour:** Three to five short reviewed questions with a 'how sure are you' rating, before the learning loop.
- **Target user:** Class X learner
- **Learning rationale:** Separates unknown from confident error.
- **Competitor overlap:** Adaptive products start with diagnostics (MATHia, vendor claim).
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Pre-test results change the first recommended action by a stated, tested rule; no mastery label is shown.
- **Tests needed:** Rule tests; UI test; review of pre-test items.
- **Dependency:** Reviewed items
- **Rationale:** Valuable once reviewed items exist.
- **Current status:** NOT_IMPLEMENTED

#### B04 One question at a time — P0 / NOW / effort S / phase P5

- **User problem:** Long lists overwhelm small screens.
- **Proposed behaviour:** Show a single question with a step counter.
- **Target user:** Class X learner
- **Learning rationale:** Reduces cognitive load.
- **Competitor overlap:** Common pattern.
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Only one question is visible; the counter updates; keyboard navigation works.
- **Tests needed:** Existing end-to-end and accessibility checks.
- **Dependency:** None
- **Rationale:** Already built.
- **Current status:** IMPLEMENTED (draft scope)

#### B05 Hint ladder per question — P1 / NEXT / effort L / phase P3

- **User problem:** A learner who is stuck gets only the diagnosis.
- **Proposed behaviour:** Four rungs: small hint, representation or analogy, worked example, explanation; reveal an answer only after an attempt.
- **Target user:** Class X learner
- **Learning rationale:** Supports productive struggle.
- **Competitor overlap:** ChatGPT Study Mode and Gemini Guided Learning use stepwise guidance (SOURCE_ONLY).
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Each of the eight items has four reviewed rungs; the UI never shows rung N+1 before N; tests cover order and the attempt rule.
- **Tests needed:** Order test; content check for four rungs; reviewer sign-off.
- **Dependency:** Reviewer-approved hint text
- **Rationale:** High value but the text must be written and reviewed.
- **Current status:** NOT_IMPLEMENTED

#### B06 Feedback tied to the learner's answer, with 'not sure' — P0 / NOW / effort M / phase P6

- **User problem:** Generic feedback ignores what the learner chose.
- **Proposed behaviour:** Feedback names the selected option and why it is wrong or right; an explicit 'I am not sure' path and abstention when the explanation is unclear.
- **Target user:** Class X learner
- **Learning rationale:** Targets the specific misconception.
- **Competitor overlap:** Common in tutoring systems.
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Each distractor has a reviewed rationale; the agent abstains on empty or unclear text in tests.
- **Tests needed:** Existing diagnosis tests plus new abstention cases.
- **Dependency:** Reviewed distractor rationale
- **Rationale:** Partly built; the review is what remains.
- **Current status:** PARTIAL (selected-answer logic and abstention exist; rationale unreviewed)

#### B07 Bounded study actions — P2 / LATER / effort L / phase P5

- **User problem:** Learners may want a simpler explanation or another example.
- **Proposed behaviour:** Buttons: simpler words, worked example, new practice question, why my reasoning is wrong; each served only from reviewed content.
- **Target user:** Class X learner
- **Learning rationale:** Gives agency without free-form generation.
- **Competitor overlap:** General AI tutors do this freely (SOURCE_ONLY).
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Each action returns reviewed text or a refusal; none calls a model with free text.
- **Tests needed:** Action table tests.
- **Dependency:** B05, reviewed content
- **Rationale:** Needs reviewed variants for each item.
- **Current status:** NOT_IMPLEMENTED

#### B08 Retrieval practice and spaced review — P2 / LATER / effort L / phase P5

- **User problem:** One pass leaves forgetting unaddressed.
- **Proposed behaviour:** Deterministic schedule (fixed intervals) that re-asks previously missed items; rules shown to the learner.
- **Target user:** Class X learner
- **Learning rationale:** Retrieval practice and spacing are standard learning-science techniques.
- **Competitor overlap:** General practice apps.
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** A scheduled item reappears at the stated interval in a time-controlled test; the rule is displayed.
- **Tests needed:** Fake-clock tests.
- **Dependency:** Enough reviewed items
- **Rationale:** Eight items are too few for spacing.
- **Current status:** NOT_IMPLEMENTED

#### B09 Progress map with uncertainty and revision queue — P2 / LATER / effort L / phase P5

- **User problem:** The learner cannot see where they stand.
- **Proposed behaviour:** Per-concept status with stated uncertainty and a revision list; one answer never produces 'mastered'.
- **Target user:** Class X learner
- **Learning rationale:** Orients the learner.
- **Competitor overlap:** MATHia shows skill state (vendor claim).
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Labels use evidence counts; no 'mastered' text unless a validated threshold exists (none today).
- **Tests needed:** Label tests; threshold absence test.
- **Dependency:** B03, B08, validated thresholds
- **Rationale:** No validated threshold exists.
- **Current status:** PARTIAL (simple counts only)

#### B10 Confidence calibration and reflection — P2 / LATER / effort S / phase P5

- **User problem:** Learners may guess confidently.
- **Proposed behaviour:** Optional 'how sure were you' and a short reflection after feedback; no streaks, no public ranking.
- **Target user:** Class X learner
- **Learning rationale:** Supports metacognition.
- **Competitor overlap:** Common in study apps.
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Optional; skipping never blocks progress; nothing is shared.
- **Tests needed:** UI and storage tests.
- **Dependency:** B03
- **Rationale:** Nice, not necessary.
- **Current status:** NOT_IMPLEMENTED

#### B11 Resume, reset and export controls — P0 / NOW / effort S / phase P7

- **User problem:** A learner may lose context or want to wipe the phone's record.
- **Proposed behaviour:** Resume where the learner stopped; a clear reset; a visible export of the trace.
- **Target user:** Class X learner
- **Learning rationale:** Trust and control.
- **Competitor overlap:** Typical.
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** After reload the last question and draft are restored; reset clears local state; export contains no secrets.
- **Tests needed:** Existing persistence and export tests; add a reset test if missing.
- **Dependency:** None
- **Rationale:** Mostly built; confirm the reset path is tested.
- **Current status:** PARTIAL (resume and trace export exist; reset coverage to confirm)

#### B12 Printable worksheet of reviewed items — P3 / LATER / effort M / phase P17

- **User problem:** A teacher may want paper practice.
- **Proposed behaviour:** Print stylesheet for reviewed items only.
- **Target user:** Class X learner
- **Learning rationale:** Paper is the lowest-connectivity medium.
- **Competitor overlap:** Textbook-based programmes.
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Only reviewed items print; draft items print with a visible DRAFT label or are blocked.
- **Tests needed:** Print stylesheet test.
- **Dependency:** A04
- **Rationale:** Needs reviewed items.
- **Current status:** NOT_IMPLEMENTED

#### B13 Streak shaming, public leaderboards, addictive loops — P3 / REJECT / effort S / phase P4

- **User problem:** These can pressure or expose children.
- **Proposed behaviour:** Not built.
- **Target user:** Class X learner
- **Learning rationale:** Extrinsic pressure can harm.
- **Competitor overlap:** Common in consumer apps.
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** No such feature appears in the UI; a text scan finds no streak or leaderboard strings.
- **Tests needed:** String scan test.
- **Dependency:** None
- **Rationale:** Rejected on safety grounds; reopen only with ethics review.
- **Current status:** NOT_IMPLEMENTED (by decision)

### C Multilingual bridge and inclusive access

#### C01 Everyday Odia / school Odia / English bridge with visible status — P0 / NOW / effort M / phase P8

- **User problem:** A learner may know the idea in everyday words but not the textbook term.
- **Proposed behaviour:** Offline mapping of everyday Odia, school Odia and English terms, with source and review status visible and a reveal of the mapping.
- **Target user:** Class X learner
- **Learning rationale:** Connects prior knowledge to school terminology.
- **Competitor overlap:** No scanned product was seen to show this combination; that is not evidence that none exists.
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Every mapping shows its status (all UNREVIEWED_DRAFT today); the offline practice runs with no network.
- **Tests needed:** Existing bridge tests and end-to-end checks; reviewer worksheet.
- **Dependency:** Language reviewer for P1 follow-up
- **Rationale:** Built as a draft; review is outstanding.
- **Current status:** IMPLEMENTED (draft scope, unreviewed)

#### C02 Roman-Odia and Unicode normalisation — P2 / LATER / effort M / phase P8

- **User problem:** Learners type Odia, English or Roman-Odia mixes; spelling varies.
- **Proposed behaviour:** Normalise Unicode forms and common variants before matching; never treat transliteration as proof of understanding.
- **Target user:** Class X learner
- **Learning rationale:** Reduces false negatives from spelling.
- **Competitor overlap:** General input methods.
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** A fixture list of variants maps to the same token; ambiguous cases are flagged.
- **Tests needed:** Normalisation fixtures reviewed by a speaker.
- **Dependency:** Language reviewer
- **Rationale:** Needs real learner text samples that do not exist yet.
- **Current status:** NOT_IMPLEMENTED

#### C03 Reviewed glossary, audio and text-to-speech — P2 / LATER / effort L / phase P8

- **User problem:** Reading Odia terms may be hard; pronunciation is unknown.
- **Proposed behaviour:** Glossary entries with examples and optional recorded or synthesised audio, all reviewed.
- **Target user:** Class X learner
- **Learning rationale:** Supports listeners and weak readers.
- **Competitor overlap:** DIKSHA and PM eVIDYA use video and audio (SOURCE_ONLY).
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline once downloaded
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low if recorded locally; synthetic voice from a hosted service would need review
- **Acceptance criteria:** Audio is optional, never autoplays, has a text equivalent and a visible size.
- **Tests needed:** Asset budget test; text-equivalent test.
- **Dependency:** C01 review, audio source and licence
- **Rationale:** Asset and review burden.
- **Current status:** NOT_IMPLEMENTED

#### C04 Speech-to-text input — P3 / LATER / effort XL / phase P17

- **User problem:** Typing Odia on a phone is slow.
- **Proposed behaviour:** Optional voice input only after a benchmark, privacy review and a visible offline/online disclosure.
- **Target user:** Class X learner
- **Learning rationale:** Removes a typing barrier.
- **Competitor overlap:** Bhashini offers speech services; quality for Odia unverified here.
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Likely online
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** High: voice of a minor
- **Acceptance criteria:** Word-error rate on a labelled Odia set meets a preregistered threshold; consent text shows whether audio leaves the device.
- **Tests needed:** Benchmark; privacy review.
- **Dependency:** Labelled audio, privacy review, C09
- **Rationale:** Child voice data is sensitive.
- **Current status:** NOT_IMPLEMENTED

#### C05 Font shaping and rendering check on real phones — P1 / NEXT / effort S / phase P12

- **User problem:** Odia conjuncts may render wrongly on some Android or iOS builds.
- **Proposed behaviour:** Capture screenshots of fixed Odia strings on the four target phones and compare.
- **Target user:** Class X learner
- **Learning rationale:** A rendering failure makes the product unreadable.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH that it is a risk; no result yet
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Each phone has a screenshot and a PASS/FAIL row; failures create a fallback font ticket.
- **Tests needed:** Manual device protocol (PHONE_TEST_PLAN).
- **Dependency:** Physical phones (NOT_TESTED)
- **Rationale:** Cheap but needs the devices.
- **Current status:** NOT_TESTED

#### C06 Font-size and contrast themes — P2 / LATER / effort M / phase P4

- **User problem:** Small text and low contrast hurt many learners.
- **Proposed behaviour:** Selectable text size and a high-contrast theme, stored locally.
- **Target user:** Class X learner
- **Learning rationale:** Readability.
- **Competitor overlap:** Common.
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Text scales to 200 percent without clipping; contrast of 4.5:1 or better in both themes.
- **Tests needed:** Accessibility audit extension.
- **Dependency:** None
- **Rationale:** Useful; after review gates.
- **Current status:** PARTIAL (reduced-motion and system contrast only)

#### C07 Low-data mode and pack downloads — P2 / NEXT / effort M / phase P4

- **User problem:** Data cost limits use.
- **Proposed behaviour:** Text-first fallback for every asset, no autoplay, visible sizes, optional downloadable packs.
- **Target user:** Class X learner
- **Learning rationale:** Access.
- **Competitor overlap:** Kolibri and DIKSHA support downloads (SOURCE_ONLY).
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Core flow works with images disabled; the total first-load weight is stated and tested against a budget.
- **Tests needed:** Byte-budget test.
- **Dependency:** None
- **Rationale:** The product is already text-first; formalise a budget.
- **Current status:** PARTIAL (text-only today)

#### C08 QR or book-code deep link — P3 / LATER / effort L / phase P17

- **User problem:** A learner holds a textbook, not a URL.
- **Proposed behaviour:** Scan a code in a book to open the mapped item.
- **Target user:** Class X learner
- **Learning rationale:** Connects print to practice.
- **Competitor overlap:** DIKSHA energised textbooks (SOURCE_ONLY).
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** Book edition, page and permission (UNKNOWN)
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Only after the book licence and mapping are confirmed; the link opens the mapped item or a clear 'not mapped'.
- **Tests needed:** Link resolution tests.
- **Dependency:** Publisher or board permission, A01
- **Rationale:** Licence unknown.
- **Current status:** NOT_IMPLEMENTED

#### C09 Optional Bhashini adapter — P3 / LATER / effort L / phase P17

- **User problem:** Hosted language services might improve translation or speech.
- **Proposed behaviour:** An optional adapter behind a flag; the offline core never depends on it.
- **Target user:** Class X learner
- **Learning rationale:** Possible quality gain.
- **Competitor overlap:** Bhashini is language infrastructure (SOURCE_ONLY).
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Online only
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Medium: learner text would leave the device
- **Acceptance criteria:** Odia quality measured on a labelled set; terms, licence and data flow documented before any call.
- **Tests needed:** Adapter contract tests with a stub.
- **Dependency:** Evaluation, terms review, approval
- **Rationale:** Needs verification of Odia coverage and terms.
- **Current status:** NOT_IMPLEMENTED

### D Subject-specific Science / Electricity

#### D01 Reviewed circuit diagrams — P1 / NEXT / effort M / phase P3

- **User problem:** Words alone are weak for circuits.
- **Proposed behaviour:** Static SVG circuit diagrams reviewed for correct symbols and current direction, with text descriptions.
- **Target user:** Class X learner
- **Learning rationale:** Representations aid understanding.
- **Competitor overlap:** Khan Academy and DIKSHA use video and diagrams (SOURCE_ONLY).
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Each of the eight items has a diagram or an explicit reason it does not; each has alt text; a reviewer signs off.
- **Tests needed:** Diagram checks; accessibility audit.
- **Dependency:** Subject reviewer; board-source check
- **Rationale:** High value; review is the gate.
- **Current status:** NOT_IMPLEMENTED

#### D02 Prediction-first virtual experiments — P2 / LATER / effort L / phase P3

- **User problem:** Learners watch results without predicting.
- **Proposed behaviour:** 'What happens if this switch is open?' with a choice, then a diagram and explanation; virtual only.
- **Target user:** Class X learner
- **Learning rationale:** Prediction improves engagement.
- **Competitor overlap:** General simulators.
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Each experiment states the model's assumptions; no physical hazard instructions.
- **Tests needed:** Scenario tests; reviewer check.
- **Dependency:** D01
- **Rationale:** Needs diagrams first.
- **Current status:** NOT_IMPLEMENTED

#### D03 Interactive circuit builder — P3 / LATER / effort XL / phase P17

- **User problem:** A simulator lets learners explore series and parallel.
- **Proposed behaviour:** Small builder for battery, wire, bulb, switch with correct outcomes for a limited set.
- **Target user:** Class X learner
- **Learning rationale:** Exploration.
- **Competitor overlap:** General simulators.
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Outcomes match a reviewed truth table for every supported layout; unsupported layouts are refused.
- **Tests needed:** Truth-table tests.
- **Dependency:** D01, D02
- **Rationale:** Large build.
- **Current status:** NOT_IMPLEMENTED

#### D04 Formula, units and numerical practice — P2 / LATER / effort L / phase P3

- **User problem:** Numerical problems are a large part of the exam.
- **Proposed behaviour:** Worked calculation steps and unit checks for V = IR and related relations.
- **Target user:** Class X learner
- **Learning rationale:** Exam fit.
- **Competitor overlap:** General practice apps.
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** Board exam pattern for Class X Science
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Each numerical item has a reviewed worked answer; unit mismatches are caught by a deterministic check.
- **Tests needed:** Calculation tests.
- **Dependency:** Board exam format (UNKNOWN)
- **Rationale:** Format depends on the unconfirmed board source.
- **Current status:** NOT_IMPLEMENTED

#### D05 Model versus real-world note, and no invented physics — P1 / NEXT / effort S / phase P6

- **User problem:** A model must not invent physical results.
- **Proposed behaviour:** Each explanation states idealisations; model-generated physics is never presented as authoritative.
- **Target user:** Class X learner
- **Learning rationale:** Prevents false claims.
- **Competitor overlap:** General AI tutors can err (provider notes on inconsistent behaviour).
- **Evidence and confidence:** HIGH that the risk exists
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Validator allow-list already prevents free-form claims; add a content rule that each item names its idealisation.
- **Tests needed:** Content check rule.
- **Dependency:** Reviewer
- **Rationale:** Low-cost safeguard.
- **Current status:** PARTIAL (allow-list only)

### E Agent, AI and ML engineering

#### E01 Bounded orchestration with visible lifecycle — P0 / NOW / effort L / phase P6

- **User problem:** An unconstrained agent is hard to trust.
- **Proposed behaviour:** observe > propose > validate > plan > act > save/trace > optional re-check, with typed output and per-item allow-lists.
- **Target user:** Class X learner
- **Learning rationale:** Predictable behaviour.
- **Competitor overlap:** General AI tutors are less constrained.
- **Evidence and confidence:** HIGH (tests)
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Implemented and covered by unit and browser tests.
- **Tests needed:** Existing suites.
- **Dependency:** None
- **Rationale:** Core of the MVP.
- **Current status:** IMPLEMENTED (draft scope)

#### E02 Retrieval-grounded answers from the reviewed pack — P2 / LATER / effort L / phase P6

- **User problem:** Free-form answers can invent facts.
- **Proposed behaviour:** Answers draw only from reviewed pack passages with citations.
- **Target user:** Class X learner
- **Learning rationale:** Grounding.
- **Competitor overlap:** Common in educational RAG.
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline for local retrieval
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Every answer cites a pack passage id; a test fails on an uncited claim.
- **Tests needed:** Citation tests.
- **Dependency:** A04 reviewed pack
- **Rationale:** Needs a reviewed pack to ground against.
- **Current status:** NOT_IMPLEMENTED

#### E03 Deterministic offline fallback — P0 / NOW / effort M / phase P6

- **User problem:** Network loss must not end learning.
- **Proposed behaviour:** A local rule-based diagnosis runs with no model or network.
- **Target user:** Class X learner
- **Learning rationale:** Continuity.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH (tests)
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Mock provider is the default; offline journeys pass.
- **Tests needed:** Existing e2e and unit tests.
- **Dependency:** None
- **Rationale:** Built.
- **Current status:** IMPLEMENTED (draft scope; a rule, not a model)

#### E04 Prompt-injection resistance — P1 / NEXT / effort M / phase P9

- **User problem:** Learner text is untrusted.
- **Proposed behaviour:** Learner text never becomes instructions; strict output schema; independent ID validation.
- **Target user:** Class X learner
- **Learning rationale:** Safety.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM (tests exist for the shipped adapter; no live model run)
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Injection fixtures produce only allow-listed output.
- **Tests needed:** Existing validator tests plus more fixtures.
- **Dependency:** None
- **Rationale:** Extend the fixtures before any live run.
- **Current status:** PARTIAL

#### E05 Adapter hardening: timeout, retry, circuit breaker, budget — P2 / NEXT / effort S / phase P13

- **User problem:** A hosted provider can fail or cost money.
- **Proposed behaviour:** Bounded timeout and retry exist; add a circuit breaker and a rate budget.
- **Target user:** Class X learner
- **Learning rationale:** Reliability.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** After N failures the adapter stops calling for a stated interval; tested with a stub.
- **Tests needed:** Stub-server tests.
- **Dependency:** None
- **Rationale:** Small hardening before any live trial.
- **Current status:** PARTIAL

#### E06 Teacher-labelled evaluation set and metrics — P1 / NEXT / effort L / phase P10

- **User problem:** Anecdotes cannot choose a model.
- **Proposed behaviour:** Labelled cases with per-misconception precision and recall, false positives on correct answers, abstention, latency and cost.
- **Target user:** Class X learner
- **Learning rationale:** Evidence-based selection.
- **Competitor overlap:** Vendors publish few comparable numbers.
- **Evidence and confidence:** HIGH that it is needed
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** A frozen labelled set exists; metrics print for every provider; the deterministic baseline is included.
- **Tests needed:** Evaluation harness (exists) plus labelled data.
- **Dependency:** Qualified labeller
- **Rationale:** Harness exists; labelled data does not.
- **Current status:** PARTIAL (harness only, synthetic cases)

#### E07 Preregistered thresholds — P1 / NEXT / effort S / phase P13

- **User problem:** Thresholds chosen after seeing results bias the choice.
- **Proposed behaviour:** Write acceptance thresholds before any comparison run.
- **Target user:** Class X learner
- **Learning rationale:** Honest selection.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** A threshold file is committed before the first labelled run.
- **Tests needed:** Process check.
- **Dependency:** E06
- **Rationale:** Documentation step.
- **Current status:** NOT_IMPLEMENTED

#### E08 No 'the AI understood the learner' claims — P0 / NOW / effort S / phase P16

- **User problem:** Schema-valid JSON is not understanding.
- **Proposed behaviour:** Claim guard in documents and UI.
- **Target user:** Class X learner
- **Learning rationale:** Honesty.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Claims tests fail on banned wording.
- **Tests needed:** Existing claims tests.
- **Dependency:** None
- **Rationale:** Built.
- **Current status:** IMPLEMENTED

#### E09 On-device small model — P3 / LATER / effort XL / phase P17

- **User problem:** Hosted models need data.
- **Proposed behaviour:** Evaluate a small local model for offline diagnosis.
- **Target user:** Class X learner
- **Learning rationale:** Offline intelligence.
- **Competitor overlap:** None assessed.
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Meets the preregistered thresholds on a phone within a memory budget.
- **Tests needed:** Benchmark on devices.
- **Dependency:** E06, E07
- **Rationale:** Research item.
- **Current status:** NOT_IMPLEMENTED

#### E10 Multi-agent orchestration — P3 / REJECT / effort L / phase P6

- **User problem:** A deterministic function can do the job.
- **Proposed behaviour:** Not built.
- **Target user:** Class X learner
- **Learning rationale:** n/a
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** n/a
- **Tests needed:** n/a
- **Dependency:** None
- **Rationale:** Added complexity without a demonstrated benefit.
- **Current status:** NOT_IMPLEMENTED (by decision)

### F Offline-first, sync and PWA reliability

#### F01 First-visit caching and offline banner — P0 / NOW / effort M / phase P7

- **User problem:** Learners lose access when the network drops.
- **Proposed behaviour:** Cache the shell and pack on the first visit; show a clear offline state.
- **Target user:** Class X learner
- **Learning rationale:** Access.
- **Competitor overlap:** Kolibri and DIKSHA are offline capable (SOURCE_ONLY).
- **Evidence and confidence:** HIGH (headless tests)
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Offline reload after one online visit passes in the browser check.
- **Tests needed:** Existing e2e.
- **Dependency:** None
- **Rationale:** Built. Cold-start-offline with no prior visit is not supported.
- **Current status:** IMPLEMENTED (headless Chromium only)

#### F02 Durable queue with idempotent ids and bounded backoff — P0 / NOW / effort M / phase P7

- **User problem:** Answers must survive disconnection.
- **Proposed behaviour:** IndexedDB queue, stable ids, bounded exponential backoff, manual retry after the pause.
- **Target user:** Class X learner
- **Learning rationale:** Reliability.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH (tests)
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Existing queue tests pass.
- **Tests needed:** Existing suites.
- **Dependency:** None
- **Rationale:** Built.
- **Current status:** IMPLEMENTED

#### F03 Per-question draft isolation — P0 / NOW / effort S / phase P7

- **User problem:** Drafts must not leak between questions.
- **Proposed behaviour:** A draft and selection stay with their question.
- **Target user:** Class X learner
- **Learning rationale:** Correctness.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Switching questions never migrates text.
- **Tests needed:** Existing e2e.
- **Dependency:** None
- **Rationale:** Built.
- **Current status:** IMPLEMENTED

#### F04 Sync status, last synced time, update notice — P1 / NEXT / effort M / phase P7

- **User problem:** Learners cannot tell whether work was saved.
- **Proposed behaviour:** Show queue count, next retry time, last sync and a stale-cache notice with a one-tap update that saves the draft first.
- **Target user:** Class X learner
- **Learning rationale:** Trust.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Each state has text and a test; update never loses a draft.
- **Tests needed:** UI and e2e tests.
- **Dependency:** None
- **Rationale:** Some of it exists; complete it.
- **Current status:** PARTIAL

#### F05 Single-writer tab guard — P0 / NOW / effort M / phase P7

- **User problem:** Two tabs could overwrite each other.
- **Proposed behaviour:** Web Locks based writer; other tabs read-only with a banner.
- **Target user:** Class X learner
- **Learning rationale:** Correctness.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Second tab becomes read-only; banner shown.
- **Tests needed:** Existing tests.
- **Dependency:** None
- **Rationale:** Built.
- **Current status:** IMPLEMENTED

#### F06 Storage migration and corruption repair — P1 / NEXT / effort M / phase P7

- **User problem:** Old or damaged state could break the app.
- **Proposed behaviour:** Versioned state with migration and safe reset on corruption.
- **Target user:** Class X learner
- **Learning rationale:** Resilience.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Fixtures for an old version and a corrupted record load without a crash.
- **Tests needed:** Fixture tests.
- **Dependency:** None
- **Rationale:** Needed before any second release.
- **Current status:** PARTIAL

#### F07 Foreground reconnect retry, not Background Sync alone — P0 / NOW / effort S / phase P7

- **User problem:** Background Sync support is limited.
- **Proposed behaviour:** Retry on reconnect and visibility events; do not rely on Background Sync.
- **Target user:** Class X learner
- **Learning rationale:** Reliability.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH (documented browser limitation)
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Retry runs on events in tests; cross-browser results remain NOT_TESTED outside Chromium.
- **Tests needed:** Existing tests.
- **Dependency:** None
- **Rationale:** Built; other browsers untested.
- **Current status:** IMPLEMENTED (Chromium only tested)

#### F08 Separate cold-start and offline-after-visit tests — P1 / NEXT / effort S / phase P7

- **User problem:** These are different claims.
- **Proposed behaviour:** A test for offline after one visit exists; document that first-visit-offline is unsupported.
- **Target user:** Class X learner
- **Learning rationale:** Honest claims.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Docs state the limit; a test checks the wording.
- **Tests needed:** Wording test.
- **Dependency:** None
- **Rationale:** Cheap clarification.
- **Current status:** PARTIAL

### G Analytics and recommendation quality

#### G01 Local event taxonomy with schema version — P2 / NEXT / effort M / phase P10

- **User problem:** Ad hoc events cannot be compared.
- **Proposed behaviour:** Typed local events (question viewed, answer selected, explanation saved, queued, re-checked, recommendation shown, bridge practice done) with timestamps and no raw explanation.
- **Target user:** Class X learner
- **Learning rationale:** Evaluation.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Export validates against a schema; raw explanation text is absent.
- **Tests needed:** Schema test.
- **Dependency:** None
- **Rationale:** Builds on the trace.
- **Current status:** PARTIAL (trace)

#### G02 Separate operational and learning metrics — P2 / LATER / effort M / phase P10

- **User problem:** Crashes and learning are different things.
- **Proposed behaviour:** Report timeouts and queue age separately from pre/post gains.
- **Target user:** Class X learner
- **Learning rationale:** Clarity.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Two report sections; no mixed number.
- **Tests needed:** Report test.
- **Dependency:** G01
- **Rationale:** After events exist.
- **Current status:** NOT_IMPLEMENTED

#### G03 Transparent recommendation reason — P0 / NOW / effort S / phase P6

- **User problem:** Learners should see why.
- **Proposed behaviour:** Show the reason and the uncertainty for each recommendation; avoid 'mastered'.
- **Target user:** Class X learner
- **Learning rationale:** Trust.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Trace shows reason; no mastery text.
- **Tests needed:** Existing tests.
- **Dependency:** None
- **Rationale:** Built.
- **Current status:** IMPLEMENTED

#### G04 No external analytics SDK; anonymous export — P0 / NOW / effort S / phase P9

- **User problem:** Third parties see children's data.
- **Proposed behaviour:** No SDK; export is local and aggregate.
- **Target user:** Class X learner
- **Learning rationale:** Privacy.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** A scan finds no third-party script.
- **Tests needed:** Static scan.
- **Dependency:** None
- **Rationale:** Built.
- **Current status:** IMPLEMENTED

#### G05 Pre/post study design with consent — P1 / NEXT / effort L / phase P15

- **User problem:** No evidence of learning gain exists.
- **Proposed behaviour:** A small consented study with assent, minimal data and teacher review.
- **Target user:** Class X learner
- **Learning rationale:** Evidence.
- **Competitor overlap:** UNESCO urges evidence (SOURCE_ONLY).
- **Evidence and confidence:** HIGH that it is needed
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** High: minors; needs consent and assent
- **Acceptance criteria:** A written protocol approved by a responsible adult body exists before any child data is collected.
- **Tests needed:** Protocol review.
- **Dependency:** Ethics approval, school access (external)
- **Rationale:** Required before any efficacy statement.
- **Current status:** NOT_IMPLEMENTED

#### G06 Third-party analytics and ads — P3 / REJECT / effort S / phase P9

- **User problem:** Not needed for the goal.
- **Proposed behaviour:** Not built.
- **Target user:** Class X learner
- **Learning rationale:** n/a
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** n/a
- **Tests needed:** n/a
- **Dependency:** None
- **Rationale:** Rejected: privacy risk with no benefit.
- **Current status:** NOT_IMPLEMENTED (by decision)

### H Teacher, parent, reviewer and classroom operations

#### H01 Reviewer workspace — P2 / LATER / effort XL / phase P17

- **User problem:** Review is by spreadsheet.
- **Proposed behaviour:** A page for status, rubric, conflicting translations, version comparison and approvals.
- **Target user:** Teacher reviewer
- **Learning rationale:** Review quality.
- **Competitor overlap:** Authoring tools exist elsewhere.
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Medium: reviewer identity
- **Acceptance criteria:** Reviewers can approve with name and date; the audit log is append-only.
- **Tests needed:** Workflow tests.
- **Dependency:** A04
- **Rationale:** Large; the spreadsheet and rubric suffice for the first review.
- **Current status:** PARTIAL (worksheet CSV and rubric)

#### H02 Parent or teacher progress summary — P3 / LATER / effort L / phase P17

- **User problem:** Adults may want to see progress.
- **Proposed behaviour:** A consented summary; typed explanations stay private by default.
- **Target user:** Parent or teacher
- **Learning rationale:** Support.
- **Competitor overlap:** Typical.
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Medium
- **Acceptance criteria:** Opt-in; a summary excludes raw text.
- **Tests needed:** Privacy tests.
- **Dependency:** Consent design
- **Rationale:** Privacy design needed first.
- **Current status:** NOT_IMPLEMENTED

#### H03 Report-an-error route — P2 / NEXT / effort M / phase P3

- **User problem:** Learners and teachers find content errors.
- **Proposed behaviour:** A control that exports item id and version, with no name.
- **Target user:** Class X learner
- **Learning rationale:** Content quality.
- **Competitor overlap:** Typical.
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** The export has item id, version and note only.
- **Tests needed:** Export test.
- **Dependency:** None
- **Rationale:** Useful once review starts.
- **Current status:** NOT_IMPLEMENTED

#### H04 Class dashboard with privacy thresholds — P3 / LATER / effort XL / phase P17

- **User problem:** Teachers want aggregate views.
- **Proposed behaviour:** Aggregate-only output above a minimum group size.
- **Target user:** Teacher
- **Learning rationale:** Teaching support.
- **Competitor overlap:** Platform dashboards exist.
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** High if mishandled
- **Acceptance criteria:** No individual shown; minimum group size enforced.
- **Tests needed:** Threshold tests.
- **Dependency:** Server, accounts, consent
- **Rationale:** Needs accounts the MVP lacks.
- **Current status:** NOT_IMPLEMENTED

#### H05 Ranking or profiling children from uncertain AI predictions — P3 / REJECT / effort S / phase P9

- **User problem:** Harmful and unreliable.
- **Proposed behaviour:** Not built.
- **Target user:** Class X learner
- **Learning rationale:** n/a
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** n/a
- **Tests needed:** n/a
- **Dependency:** None
- **Rationale:** Rejected on safety grounds.
- **Current status:** NOT_IMPLEMENTED (by decision)

#### H06 Multiple learner profiles on a shared phone — P3 / LATER / effort L / phase P17

- **User problem:** Families share phones.
- **Proposed behaviour:** Switch and lock profiles; isolate data.
- **Target user:** Class X learner
- **Learning rationale:** Fits the shared-device context.
- **Competitor overlap:** Typical.
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Medium: a child's profile on a shared device
- **Acceptance criteria:** Switching changes all data; a profile cannot read another's data.
- **Tests needed:** Isolation tests.
- **Dependency:** Storage migration F06
- **Rationale:** The current build has one local session record and does not support shared phones.
- **Current status:** NOT_IMPLEMENTED (single local record)

### I Security, safety, privacy and compliance

#### I01 Server-side keys, redaction, headers, origin and rate limits — P0 / NOW / effort M / phase P9

- **User problem:** Keys and abuse are the common failures.
- **Proposed behaviour:** Keys only on the server; redaction in logs; CSP and headers; origin check; throttling.
- **Target user:** Class X learner
- **Learning rationale:** Safety.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH (tests)
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Existing security tests pass.
- **Tests needed:** Existing suites.
- **Dependency:** None
- **Rationale:** Built for the demo (level A1).
- **Current status:** IMPLEMENTED (A1 only)

#### I02 Threat model for minors and shared devices — P1 / NEXT / effort M / phase P9

- **User problem:** Risks are scattered in documents.
- **Proposed behaviour:** One model: XSS, CSRF, host header, prompt injection, stored data theft, leaked traces, provider retention, denial of service.
- **Target user:** Class X learner
- **Learning rationale:** Completeness.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** A reviewed document lists each threat, a control and a test or a gap.
- **Tests needed:** Document check.
- **Dependency:** None
- **Rationale:** Consolidates existing work.
- **Current status:** PARTIAL

#### I03 Data inventory and retention table — P1 / NEXT / effort S / phase P9

- **User problem:** The team cannot say where each field goes.
- **Proposed behaviour:** Table: field, location, purpose, retention, export or delete, access, network yes/no.
- **Target user:** Class X learner
- **Learning rationale:** Transparency.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Every stored field appears; a test compares fields in code to the table.
- **Tests needed:** Field-coverage test.
- **Dependency:** None
- **Rationale:** Cheap and valuable.
- **Current status:** PARTIAL (data flow in the guide)

#### I04 Synthetic data only for hosted-model tests — P0 / NOW / effort S / phase P13

- **User problem:** Real children's text must not reach a provider.
- **Proposed behaviour:** Evaluation uses synthetic cases only.
- **Target user:** Class X learner
- **Learning rationale:** Safety.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** The evaluation cases are labelled synthetic.
- **Tests needed:** Existing check.
- **Dependency:** None
- **Rationale:** Built as a rule.
- **Current status:** IMPLEMENTED

#### I05 Consent, privacy notice and legal review before a pilot — P1 / NEXT / effort M / phase P9

- **User problem:** A pilot with minors needs a lawful basis.
- **Proposed behaviour:** Plain-language notice, consent and assent; review of the applicable Indian child-data rules by a qualified person.
- **Target user:** Class X learner
- **Learning rationale:** Compliance.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH that it is required
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** High: minors
- **Acceptance criteria:** Notice and consent exist and are reviewed by a qualified person; no compliance claim before that.
- **Tests needed:** Review record.
- **Dependency:** Legal reviewer (external)
- **Rationale:** Gate for any pilot.
- **Current status:** NOT_IMPLEMENTED

#### I06 Off-topic, abusive and harm-disclosure handling — P1 / NEXT / effort M / phase P9

- **User problem:** A child may type something serious.
- **Proposed behaviour:** A safe, bounded reply and a pointer to a trusted adult; no counselling.
- **Target user:** Class X learner
- **Learning rationale:** Safety.
- **Competitor overlap:** General AI tutors have policies.
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** High: sensitive disclosures
- **Acceptance criteria:** Fixtures for such inputs produce the bounded reply and are never sent to a model.
- **Tests needed:** Fixture tests; reviewer-approved wording.
- **Dependency:** Child-safety reviewer
- **Rationale:** Needs wording from a qualified person.
- **Current status:** NOT_IMPLEMENTED

#### I07 Per-learner authentication beyond a shared code — P3 / LATER / effort L / phase P9

- **User problem:** A shared demo code does not identify anyone.
- **Proposed behaviour:** A higher trust level only if a real need appears.
- **Target user:** Class X learner
- **Learning rationale:** Control.
- **Competitor overlap:** n/a
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Documented in AUTHENTICATION_AND_TRUST_LEVELS.
- **Tests needed:** Constants tests.
- **Dependency:** H06, hosting
- **Rationale:** Not needed for the MVP.
- **Current status:** NOT_IMPLEMENTED (A1 only)

### J Platform, performance and engineering quality

#### J01 Portable browser discovery — P0 / NOW / effort M / phase P11

- **User problem:** The Mac log showed the browser steps failing on a Linux-only path.
- **Proposed behaviour:** One offline resolver: CHROME_PATH first (invalid means BLOCKED), then standard macOS, Linux and Windows locations.
- **Target user:** Class X learner
- **Learning rationale:** Reproducible evidence.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH (tests)
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Resolver tests pass; the browser steps use it; a missing browser is BLOCKED, not ENOENT.
- **Tests needed:** tests/browser-path.test.js and the guard refactor.
- **Dependency:** None
- **Rationale:** Done in Iteration 8; unproven on a real Mac until the team runs it.
- **Current status:** DONE IN ITERATION 8 (sandbox-tested; Mac NOT_TESTED)

#### J02 Doctor command with PASS, FAIL or BLOCKED — P1 / NEXT at Iteration 8; completed in Iteration 9 / effort S / phase P14

- **User problem:** Operators need one clear check.
- **Implemented in Iteration 9:** `npm run doctor` prints PASS, FAIL or BLOCKED for runtime, required files, syntax, content consistency, local preflight and browser executable discovery. A found browser path is shown with the home-directory prefix shortened to `~`; an invalid explicit `CHROME_PATH` is BLOCKED without echoing the value.
- **Target user:** Class X learner
- **Learning rationale:** Operator clarity.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** The doctor report has six deterministic check IDs, PASS/FAIL/BLOCKED statuses, safe browser-path reporting, JSON output and exit codes 0/1/2; it makes no live provider call and does not run browser suites.
- **Tests:** `tests/doctor.test.js` (six tests).
- **Dependency:** J01
- **Rationale:** Small follow-up.
- **Current status:** IMPLEMENTED IN ITERATION 9 (local checks; browser journeys still require `npm run capture`, `npm run e2e` and `npm run a11y`).

#### J03 PWA installability and performance budgets — P2 / NEXT / effort M / phase P7

- **User problem:** Low-end phones need small downloads.
- **Proposed behaviour:** Byte and time budgets for first load and a store-independent update strategy.
- **Target user:** Class X learner
- **Learning rationale:** Access.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Budgets stated; a test fails above the budget.
- **Tests needed:** Budget test.
- **Dependency:** None
- **Rationale:** Pairs with C07.
- **Current status:** PARTIAL (installable shell, no budget test)

#### J04 Low-end CPU and throttled network checks — P1 / NEXT / effort M / phase P11

- **User problem:** Real phones are slower than a sandbox.
- **Proposed behaviour:** Run the journey under CPU and network throttling.
- **Target user:** Class X learner
- **Learning rationale:** Realism.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Journey passes under a stated throttle profile.
- **Tests needed:** Throttled browser run.
- **Dependency:** A browser (J01)
- **Rationale:** Needs a real browser run on the team's machine.
- **Current status:** NOT_IMPLEMENTED

#### J05 Device and browser matrix — P1 / NEXT / effort L / phase P12

- **User problem:** Only headless Chromium has run.
- **Proposed behaviour:** Fill the phone matrix for the S23, S25, S25 FE and iPhone 16 and for Chrome, Samsung Internet and Safari.
- **Target user:** Class X learner
- **Learning rationale:** Real evidence.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH that it is needed
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Each row has a dated PASS or FAIL with the device and browser version.
- **Tests needed:** Human protocol.
- **Dependency:** Physical devices (NOT_TESTED)
- **Rationale:** Largest evidence gap.
- **Current status:** NOT_TESTED

#### J06 Screen-reader checks (TalkBack, VoiceOver) — P1 / NEXT / effort M / phase P12

- **User problem:** Automated checks cannot judge reading order.
- **Proposed behaviour:** Manual pass with each screen reader.
- **Target user:** Class X learner
- **Learning rationale:** Inclusion.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** A written result per reader; defects ticketed.
- **Tests needed:** Manual protocol.
- **Dependency:** Devices, tester
- **Rationale:** Human step.
- **Current status:** NOT_TESTED

#### J07 Fault-injection and property tests for queue invariants — P2 / NEXT at Iteration 8; completed in Iteration 10 / effort M / phase P10

- **User problem:** Edge cases hide in queues.
- **Implemented in Iteration 10:** deterministic fault-injection tests, 120 seeded operation sequences (add/submit, fail, advance the clock, retry, succeed, save/restore, corrupt-and-repair) and a mutation runner (`npm run mutation`) for the re-check queue, bounded retry, validator, recovery and persistence code. Two small defects the tests found were fixed in `src/core/agent.js` (D213).
- **Target user:** Class X learner
- **Learning rationale:** Reliability.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** A property test with fixed seeds passes; 45 deliberate faults, including the three required families (retry timing or limit, queue drained on error, validator accepting a foreign misconception id or confirming uncertainty), are all caught by the tests.
- **Tests:** `tests/queue-invariants.test.js` (56 tests, written first and run red against the Iteration 9 source), `tests/mutation-catalogue.test.js` (5 tests) and `npm run mutation`.
- **Dependency:** None
- **Rationale:** Synthetic engineering tests only. They use the core modules and a test-side copy of the drain loop, not the browser; they say nothing about learning gain or model accuracy.
- **Current status:** IMPLEMENTED IN ITERATION 10 (synthetic engineering tests; two source defects fixed; no browser or phone claim)

#### J08 CI service setup — P3 / REJECT / effort M / phase P14

- **User problem:** Automation is useful but not needed to demo.
- **Proposed behaviour:** Not set up in this iteration; no account is created.
- **Target user:** Class X learner
- **Learning rationale:** n/a
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** n/a
- **Tests needed:** n/a
- **Dependency:** Team decision
- **Rationale:** Rejected for now to avoid unapproved accounts; reopen after the event.
- **Current status:** NOT_IMPLEMENTED (by decision)

#### J09 Data-saver issue triage — P1 / NEXT / effort S / phase P11

- **User problem:** The brief lists a data-saver issue.
- **Proposed behaviour:** Triage with a specific regression test once the issue is described.
- **Target user:** Class X learner
- **Learning rationale:** Access.
- **Competitor overlap:** n/a
- **Evidence and confidence:** LOW: the issue is not described in the repository
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** UNKNOWN until the team supplies the failing behaviour.
- **Tests needed:** A regression test named after the issue.
- **Dependency:** The team's description
- **Rationale:** Cannot be scoped without the report.
- **Current status:** NOT_STARTED (issue UNKNOWN)

#### J10 Phase matrix recomputation test — P0 / NOW / effort S / phase P10

- **User problem:** Progress numbers drift.
- **Proposed behaviour:** A test recomputes the phase table from the criteria file.
- **Target user:** Class X learner
- **Learning rationale:** Honest reporting.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Matrix numbers equal the CSV counts.
- **Tests needed:** tests/iteration8-docs.test.js.
- **Dependency:** None
- **Rationale:** Done in Iteration 8.
- **Current status:** DONE IN ITERATION 8

### K Product, trust, rollout and sustainability

#### K01 Clear promise, limits and first-run walkthrough — P1 / NEXT / effort S / phase P4

- **User problem:** New users do not know what the draft is.
- **Proposed behaviour:** A short first-run screen stating what it is, that it is a draft, and what it does not do.
- **Target user:** Class X learner
- **Learning rationale:** Trust.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Text approved by the team; a test checks the draft wording appears.
- **Tests needed:** UI test.
- **Dependency:** None
- **Rationale:** Cheap.
- **Current status:** PARTIAL (draft badge and trust strip)

#### K02 Provenance label and provider badge — P0 / NOW / effort S / phase P5

- **User problem:** Users should see mock versus model.
- **Proposed behaviour:** Show the provider and the draft status.
- **Target user:** Class X learner
- **Learning rationale:** Honesty.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Footer and trace show the provider.
- **Tests needed:** Existing e2e.
- **Dependency:** None
- **Rationale:** Built.
- **Current status:** IMPLEMENTED

#### K03 Competitor audit and position statement — P0 / NOW / effort M / phase P18

- **User problem:** Claims need an evidence base.
- **Proposed behaviour:** Dated, cited landscape with no first/only/unique claim.
- **Target user:** Class X learner
- **Learning rationale:** Honest pitch.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM (desk review)
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** docs/COMPETITIVE_LANDSCAPE.md exists with statuses SOURCE_ONLY or NOT_TESTED.
- **Tests needed:** docs test.
- **Dependency:** None
- **Rationale:** Done in Iteration 8; no product was tried.
- **Current status:** DONE IN ITERATION 8 (desk review)

#### K04 Practice packs and school distribution — P3 / LATER / effort L / phase P17

- **User problem:** Schools may share packs offline.
- **Proposed behaviour:** Signed pack updates and school distribution.
- **Target user:** Class X learner
- **Learning rationale:** Reach.
- **Competitor overlap:** Kolibri servers (SOURCE_ONLY).
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Pack integrity verified; update never loses progress.
- **Tests needed:** Update tests.
- **Dependency:** A04
- **Rationale:** Later.
- **Current status:** NOT_IMPLEMENTED

#### K05 Cost and latency estimates per provider — P2 / NEXT / effort S / phase P13

- **User problem:** The team needs a budget view.
- **Proposed behaviour:** A table from published pricing; no account and no live call.
- **Target user:** Class X learner
- **Learning rationale:** Planning.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Each figure cites a dated public page.
- **Tests needed:** Document check.
- **Dependency:** None
- **Rationale:** Documentation only.
- **Current status:** NOT_IMPLEMENTED

#### K06 Feature flags, rollback, backups, incident response — P3 / LATER / effort L / phase P14

- **User problem:** A hosted demo needs operations.
- **Proposed behaviour:** A runbook and flags for a hosted demo.
- **Target user:** Class X learner
- **Learning rationale:** Operations.
- **Competitor overlap:** n/a
- **Evidence and confidence:** MEDIUM
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Runbook exercised once.
- **Tests needed:** Drill record.
- **Dependency:** Hosting decision
- **Rationale:** No deployment approved.
- **Current status:** NOT_IMPLEMENTED

#### K07 Multilingual roadmap and content-interchange standards — P3 / LATER / effort M / phase P17

- **User problem:** Growth needs a plan.
- **Proposed behaviour:** Roadmap after licence review.
- **Target user:** Class X learner
- **Learning rationale:** Planning.
- **Competitor overlap:** Kolibri and DIKSHA interchange (SOURCE_ONLY).
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** A roadmap document with licences cited.
- **Tests needed:** Document check.
- **Dependency:** Licence review
- **Rationale:** Later.
- **Current status:** NOT_IMPLEMENTED

#### K08 Public deployment — P2 / LATER / effort M / phase P14

- **User problem:** A phone test needs HTTPS.
- **Proposed behaviour:** Not done in this iteration; no deployment, paid resource or public endpoint.
- **Target user:** Class X learner
- **Learning rationale:** Reach.
- **Competitor overlap:** n/a
- **Evidence and confidence:** HIGH
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** A team-approved HTTPS origin and the preflight in public-demo mode.
- **Tests needed:** Preflight; phone tests.
- **Dependency:** Explicit team instruction and rule status (RULE_4_1_STATUS=UNCONFIRMED)
- **Rationale:** Excluded by the Iteration 8 instructions.
- **Current status:** BLOCKED (no deployment authorised)

#### K09 More subjects and grades — P3 / LATER / effort XL / phase P17

- **User problem:** Learners need other chapters.
- **Proposed behaviour:** Add chapters and subjects after the review pipeline works.
- **Target user:** Class X learner
- **Learning rationale:** Reach.
- **Competitor overlap:** Khan Academy, DIKSHA (SOURCE_ONLY).
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Each addition has a source map and a reviewer.
- **Tests needed:** Per-pack checks.
- **Dependency:** A01, A04
- **Rationale:** Scope control.
- **Current status:** NOT_IMPLEMENTED

#### K10 DIKSHA or learning-platform link-out — P3 / LATER / effort M / phase P17

- **User problem:** Official content is richer than ours.
- **Proposed behaviour:** Link to official pages where permitted.
- **Target user:** Class X learner
- **Learning rationale:** Complement.
- **Competitor overlap:** DIKSHA (SOURCE_ONLY).
- **Evidence and confidence:** LOW
- **Accessibility:** Must keep keyboard operation, visible focus, 44px targets, lang attributes and the existing accessibility audit green
- **Offline or online:** Offline after first visit
- **Curriculum source dependency:** None beyond the reviewed pack
- **Privacy and safety risk:** Low: local only, no new data leaves the device
- **Acceptance criteria:** Links open the mapped official page or say 'not mapped'.
- **Tests needed:** Link tests.
- **Dependency:** Permission, A01
- **Rationale:** Needs mapping and permission.
- **Current status:** NOT_IMPLEMENTED

## Phase links

Each feature names the phase of `docs/PHASE_COMPLETION_MATRIX.md` where its work would be counted. Backlog items are **not** counted as criteria in that matrix unless they are also listed there as P19 criteria; the matrix counts the existence and quality of this backlog, not the delivery of its features.

## Next review

Review this backlog after the first qualified content review and the first real-phone session, because those two events will change many scores. Features marked NEXT depend on a human or device that does not yet exist; the status of those gates is in `docs/PHASE_COMPLETION_MATRIX.md`.
