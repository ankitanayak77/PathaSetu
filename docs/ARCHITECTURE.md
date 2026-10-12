# Pathasetu — as-built MVP architecture

This diagram describes the code currently in this workspace. It is not a claim that the app is phone-tested or educationally validated.

```mermaid
flowchart TD
    Learner[Class 10 learner<br/>English + Odia draft content] --> UI[Mobile-first web UI<br/>public/app.js]
    UI <--> Store[IndexedDB<br/>state, content pack, drafts]
    UI --> Agent[Deterministic agent core<br/>src/core/agent.js]
    Agent --> Mock[Option-linked mock proposer<br/>always provisional]
    Mock --> Validator[Allowlisted diagnosis validator]
    Validator --> State[Learning state + decision trace]
    State --> Store
    State --> Queue[Pending re-check queue]
    SW[Service worker<br/>app shell only] --> UI
    SW -.->|bypasses /api/*| Routes[(API routes)]
    UI -->|same-origin fetch| Server[Same-origin Node server]
    Queue -->|when server reachable| Server
    Server --> Guard[Input, origin, length and publication guards]
    Guard --> Select{Configured provider}
    Select -->|default| ServerMock[Deterministic mock]
    Select -->|optional GROQ| Groq[Groq structured-output adapter]
    ServerMock --> ServerValidate[Core validator]
    Groq --> ServerValidate
    ServerValidate --> UIResponse[Provisional re-check response]
    UIResponse --> Recheck[Client re-validates and updates trace/plan]
    Recheck --> Store
```

## Important boundaries

- Local submission uses the deterministic mock to keep the learning path available offline. The mock uses the selected option plus an explanation-length check; it does not interpret free-text Odia or English.
- The queued re-check is sent to the server after a reachability probe succeeds. It can use the mock (default) or the optional Groq adapter.
- Both the server and client validate the returned diagnosis against the current item's allowed IDs. The model never writes the learner state directly.
- The answer and current question are preserved while a re-check proposes a next item. The learner explicitly applies the updated recommendation.
- The service worker caches the app shell and shared browser-safe core modules but never caches `/api/*` responses.
- Every current content item and Odia translation is `UNREVIEWED_DRAFT`. No learning outcome, language accuracy, live-provider quality, or real-device support has been validated.
