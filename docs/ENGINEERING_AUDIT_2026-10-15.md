# Engineering audit — 15 October 2026

## Scope and confidence

This pass traced the learner-facing practice and Progress flows, the local answer/re-check queue, server provider configuration and `/api/recheck`, offline service-worker behavior, Firebase client/rules boundaries, and the relevant test harnesses. It is not a claim that every line of every source and historical evidence file has been independently reviewed. External providers, deployed Firebase rules, real phones, and classroom use were not available to verify.

## Confirmed architecture

1. The browser renders the learner experience and stores local progress in IndexedDB; the service worker caches the app shell, uses network-first retrieval while online, and does not cache `/api/` responses.
2. Answer selection first produces a local provisional result. A queued re-check can call the server when reachable; queue retries are bounded and persisted.
3. The server defaults to `mock`. When configured for a hosted model, provider calls are made server-side, structured output is checked against allowed diagnosis IDs, and the model may optionally make a separate next-question suggestion. A valid model suggestion is still provisional.
4. Firebase is an optional guardian sign-in and progress-sync path. The cloud projection excludes free-text explanation, retry queue, and trace. Firestore rules scope access to a verified Google guardian UID.

## Bloom and cognition findings

- Before this pass, Progress exposed taxonomy names without explanations and counted every untagged question as `UNDERSTAND`. That was misleading.
- The taxonomy map only covers eight Class 10 Electricity sample IDs; the wider class 1–10 draft pool has not been pedagogically tagged or reviewed. Taxonomy mapping is not used by the current deterministic question selector, which prioritizes seen-item counts, misconception links, and focused concept.
- The live learner practice uses local draft answer keys; the Progress counts are not evidence of mastery. The configured dashboard exercise is local and does not invoke a model.
- This pass changed learner-facing labels to plain-language goals (for example, “Explain the idea” and “Use the idea”), added concise explanations, and added an explicit “Thinking goal not tagged yet” bucket. It deliberately does not let unreviewed taxonomy metadata alter question order or claim token savings.
- A safe Bloom-based adaptive planner still needs educator-reviewed class/subject/chapter tags, grade-appropriate success criteria, and an evaluation plan. Token savings should be measured from provider-call and input/output token counts; no such measurement is currently available.

## Verification results

- `npm run check`: passed.
- `npm run check:content`: passed; eight question items are consistent and all remain `UNREVIEWED_DRAFT`.
- Focused Bloom/UI regression: 2/2 passed.
- Full unit/integration suite: 466/473 passed. The seven failures are stale history or baseline assertions: two recorded evidence hashes changed when the latest browser run rewrote `evidence/browser-regression-latest.json`; the profile test expects a retired parent-with-child-accounts schema; two old docs tests expect no Firebase dependencies; a runtime-hash chain does not declare newly added files; and a phrase-based novelty test flags the ordinary “Odia first” language toggle. These need test/evidence maintenance, not silent suppression.
- Browser regression: 95/101 passed; 0 uncaught browser errors. Failures: D3 and N7 focus/caret restoration after re-check; G7 persistence of the read-only banner after a transient notice; K.run keyboard activation in Bridge Practice; X.run timeout in the fake Ollama integration scenario; and U4 fixed Continue-bar positioning. The Ollama scenario is a local fake-provider test, not a live model call.
- Offline browser checks E1–E4 passed: shell/content/local answers load offline, the offline state is shown, queued re-check recovery works after reconnect/reload, and cold-start recovery works. H1 passed: API responses are not cached.
- Earlier 390px viewport emulation showed no horizontal overflow; physical phones and other mobile browsers remain untested. The revised learner wording was also visually checked in the running desktop browser, but was not retested on physical devices.
- The running app reports `MOCK RULES · NO LIVE LLM`. Thus Gemini/Groq were not verified live. The current run cannot prove those credentials, provider projects, or deployed rules are valid.

## Highest-priority findings

1. **Pedagogy/content:** eight Bloom tags are insufficient for a class 1–10 system, are unreviewed, and were not driving sequencing. The learner label correction is only a UX improvement, not full Bloom implementation.
2. **Product truthfulness:** the home and learning pages disclose mock/unreviewed state; the separate Doubt support route says live tutoring is unavailable. Do not describe the app as live agentic tutoring until the route makes a real provider call and is evaluated.
3. **Provider mismatch:** a legacy Ollama adapter remains technically selectable in code and is exercised by fake-provider tests, although the current provider guide and sample configuration say to use Gemini/Groq and not enable Ollama. Current runtime uses neither hosted provider. Remove or enforce that quarantine before a provider-enabled build. The current live smoke script only exercises Groq, so it cannot independently verify Gemini.
4. **Browser reliability:** reconnect/retry focus retention, read-only banner precedence, keyboard selection, and fixed Continue-bar placement need repair and regression coverage. The fake-provider test timeout should be debugged separately from real network-provider testing.
5. **Test/document drift:** old iteration tests assert obsolete dependencies, profile design, and frozen evidence hashes. Maintain immutable historical evidence separately from mutable `latest` evidence, and update active tests to the current product contract.
6. **External validation:** no live Gemini/Groq call, deployed Firebase-rule check, current class 1–10 full-board chapter map, subject/Odia review, physical-device, assistive-technology, or classroom validation is evidenced here.

## Security and privacy observations

The inspected implementation keeps provider API keys server-side, bounds answer explanation size, applies server-side rate limits and access controls in protected demo modes, validates provider output, and exports only redacted trace information. Firebase config contains a browser web API key by design; Firebase authorization still depends on provider configuration and deployed rules. Tests of local Firestore rules do not prove deployed project state. Avoid personal learner data while content and provider behavior remain unvalidated.
