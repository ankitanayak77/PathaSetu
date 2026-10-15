# Pathasetu — authentication, authorisation and trust levels

Written 13 October 2026 (Iteration 7). This page **documents** access levels A0–A6 and says honestly where the current build sits. It adds no code. Decision IDs (`D09x`, `D10x`) point to `docs/DECISION_LOG.csv`.

**One-sentence summary:** Pathasetu today is a private demonstration (level **A1**): HTTPS in front, one shared access code, an exact-origin check and bounded throttles. That keeps strangers off a short-lived demo. It does **not** identify any person, separate any learner, or make the service production-grade.

Labels used: **SOURCE SAYS** (an official page that was opened), **CODE PROVES** (a file or test in this repository), **TEAM CHOSE** (a decision or assumption), **NOT IMPLEMENTED** (the capability does not exist).

## 1. Six different things that are often called "security"

| Thing | The question it answers | What Pathasetu does today (CODE PROVES) | What it does **not** do |
|---|---|---|---|
| **Authentication** | Who are you? | Nothing. There is no account, login, password or user identity. | Distinguish one human from another |
| **Authorisation** | What may this identity do? | One binary rule: a request either presents the shared demo code or it does not. There are no roles. | Let a teacher, reviewer and learner do different things |
| **TLS / HTTPS** | Can someone on the network read or alter the traffic? | The Node server speaks plain HTTP. HTTPS is supplied by the tunnel or host in front of it (`docs/HTTPS_DEMO_RUNBOOK.md`). The app cannot verify that HTTPS is present. | Prove who is at the other end; protect data once it reaches the server; protect the code if typed into a look-alike site |
| **CORS / origin check** | Did a web page from a *different site* trigger this request in a visitor's browser? | For every `/api/` request carrying an `Origin` header, the server allows only the same host or an exact allow-listed `https` origin (`PATHASETU_ALLOWED_ORIGINS`); otherwise `403 origin_not_allowed`. | Stop `curl`, scripts or any non-browser client: they send no `Origin` header and pass this check. It is not a login. |
| **Rate limiting / throttling** | Is something being tried too often? | Per route and per socket address, in memory, fixed window: failed or missing-code attempts 20 per 60 s (`429 too_many_attempts`, never blocks the correct code); re-check 24 per minute; session and pack 30 per minute; request body 16 KB. | Survive a restart (counters reset), tell apart visitors who share one tunnel connection (they share a bucket), or lock a particular account |
| **Shared-code gating** | Does this caller know today's demo secret? | Header `x-pathasetu-demo-code`, compared in constant time; the server refuses to start in public-demo mode without a code of at least 16 characters that is not repetitive, sequential or a placeholder. The tab keeps the code in `sessionStorage` (`pathasetu_demo_code`). | Say who used the code, revoke one person, expire by itself, or keep a record of use |

None of these six is a synonym for another. A site can have all of them and no authentication (Pathasetu today), or authentication with no rate limit.

## 2. Where Pathasetu is today: level A1, route by route

| Route | Needs the code? | Throttled? | Origin check? | What it exposes |
|---|---|---|---|---|
| `GET /api/health` | **No** (open by design: the offline probe needs it) | No | Yes | Provider label, model, whether a code is required, whether public-demo mode is on |
| `GET /api/session` | Yes, when a code is configured | Yes | Yes | An acknowledgement only |
| `GET /api/pack` | Yes in public-demo mode, or whenever draft content is exposed with a code configured | Yes | Yes | The eight **draft** items **including the answer key** (by design, so practice works offline) |
| `POST /api/recheck` | Yes, when a code is configured | Yes | Yes | The mock result, or a forwarded request to the hosted model if configured |
| Static files (`/`, `/app.js`, `/sw.js`, …) | No | No | n/a | The application shell; no learner data |

Evidence: `src/server/server.js`, `src/server/access.js`, `tests/public-demo.test.js`, `tests/access-policy.test.js`, `tests/proxy-origin.test.js`, `tests/server.test.js`. A code is also required whenever the Groq provider is configured, or in a production draft demo (`CODE_REQUIRED` in `server.js`). In plain local development with no code and a loopback address, everything is open (level A0).

**What a leaked code means.** Anyone holding it can read the draft pack and answer key and call the re-check route until the process is restarted with a new code. If the hosted model were configured, they could spend its quota (bounded by the throttles, which are per address and can be sidestepped from many addresses). There is no server-side learner database, so a leak exposes no stored learner records; it does not touch the learner's own browser storage. Rotation means restarting the server with a new random code and sharing it again. **UNKNOWN / NOT TESTED:** behaviour on a real tunnel (D111).

**What the origin check and HTTPS buy, and do not buy.** HTTPS hides the code and the typed explanation from people on the Wi-Fi and is required for a service worker on iPhone Safari. The origin check stops *another website* from quietly driving a visitor's browser to call the API. Neither proves who the visitor is, and neither protects against a person who has the code.

**Siblings sharing one phone (D096).** The app keeps **one local session record**. There is no profile picker, PIN or switch. Two children using the same browser see and overwrite the same progress. A separate browser profile or operating-system user would normally have separate storage, but that is browser behaviour that has not been tested for Pathasetu and is not a supported feature. Do not say the app supports a family phone.

## 3. The seven levels

Each level lists its goal, identities, credential or session mechanism, authorisation boundary, data store, threats, pros and cons, the tests that would be **mandatory** before any claim at that level, its status and the wording permitted now.

### A0 — local development

- **Goal:** one developer runs and tests the app on their own machine.
- **Identities:** none.
- **Credentials / session:** none. Mock provider, no access code, bound to `127.0.0.1`.
- **Authorisation boundary:** the machine's loopback interface only. Anyone who can reach that port can call every route.
- **Data store:** the browser's IndexedDB on that machine; no server-side learner data.
- **Threats:** exposing the port through a tunnel or a `0.0.0.0` bind with no code; leaving a developer key in the environment.
- **Pros:** zero friction; reproducible tests. **Cons:** unsafe the moment it is reachable by others.
- **Mandatory tests (exist):** preflight checks the bind address and reports a non-loopback host; the mock harness checks the routes; `tests/preflight.test.js`.
- **Status:** **CURRENT** for development (D090 note). Never tunnel this configuration.
- **Permitted claims:** "Runs locally with a mock provider." **Not permitted:** "safe to share a link".

### A1 — private demonstration gate (where the current public/tunnel mode belongs)

- **Goal:** let a small invited audience use a short-lived demo over HTTPS without exposing an open endpoint.
- **Identities:** none; all visitors with the code look identical.
- **Credentials / session:** one shared secret in the `x-pathasetu-demo-code` header; the tab remembers it in `sessionStorage`. No server-side session exists.
- **Authorisation boundary:** code or no code. Exact-origin allow-list for browser-driven calls; per-address throttles.
- **Data store:** none for learners on the server. In-memory throttle counters only.
- **Threats:** code leak (screenshots, chat, shoulder-surfing); guessing (bounded by the throttle); a shared tunnel address making the throttle coarse; a Host-rewriting tunnel breaking the origin check; model quota abuse if a provider is configured; browser script injection reading `sessionStorage` (headers include a Content-Security-Policy, but no independent review has been done, D101).
- **Pros:** cheap, testable, fail-closed at start-up. **Cons:** no identity, no revocation of one person, no audit trail, no expiry, restart clears counters.
- **Mandatory tests:** the unit and headless tests listed in section 2 (CODE PROVES, headless only); plus, on a real tunnel and **not yet done**: unauthenticated request returns 401 from outside; cross-origin POST returns 403; the 21st wrong guess in a window returns 429; the correct code still works during it; the code does not appear in the server log; the service worker registers over HTTPS on iPhone Safari.
- **Status:** **CURRENT**, demo-grade only (D090–D095, D101). Real tunnel NOT TESTED.
- **Permitted claims:** "A shared access code, an origin check and throttles keep a private demo from being open to anyone; this is not user authentication and not production security." **Not permitted:** "secure", "authenticated users", "production secure".

### A2 — anonymous local profiles

- **Goal:** separate on-device progress for several learners on one phone, without accounts.
- **Identities:** a locally generated profile ID, optionally a PIN. It proves nothing about who a person is.
- **Credentials / session:** none on the server; a profile switch inside the app.
- **Authorisation boundary:** application logic decides which profile's records the UI reads. Anyone holding the phone can open any profile unless a PIN is added, and a PIN stored locally is weak protection.
- **Data store:** per-profile records in IndexedDB; export per profile.
- **Threats:** one child viewing or deleting another's progress; mixing records after a crash; storage eviction wiping all profiles; a typed explanation exposed to the next user on screen.
- **Pros:** fits the shared-phone setting without server accounts or personal data. **Cons:** no recovery across devices; PIN is not secure against a determined person; more states to test.
- **Mandatory tests:** isolation (answers, queue, trace and export never cross profiles); switching during a queued re-check; delete one profile without touching others; recovery after storage clearing; accessibility of the picker; no profile data in the re-check request beyond what is needed.
- **Status:** **NOT IMPLEMENTED**, deferred (D096).
- **Permitted claims:** "One local session record; separate learner profiles are not built." **Not permitted:** "supports several learners".

### A3 — individual accounts

- **Goal:** a learner (or guardian) has a server-side identity, so progress follows them across devices.
- **Identities:** a verified account; for learners under 18 the identity and consent flow needs legal advice (section 5).
- **Credentials / session:** a password, passkey or one-time code, then a server-side session. OWASP guidance (SOURCE SAYS, opened 13 October 2026) includes: a minimum password length of 8 characters with multi-factor authentication or 15 without, allowing at least 64; blocking commonly used or breached passwords; throttling attempts, with counters tied to the account rather than only the IP address; generic error messages that do not reveal whether an account exists; serving login and all authenticated pages only over TLS; treating account recovery as high risk; and for sessions, an unpredictable ID with at least 64 bits of entropy from a cryptographically secure generator, `Secure`, `HttpOnly` and `SameSite` cookie attributes, server-enforced idle and absolute timeouts, a new session ID after login or any privilege change, and a logout that invalidates the session on the server.
- **Authorisation boundary:** each request is checked against the signed-in user's own records.
- **Data store:** a server database of accounts and progress, with backups.
- **Threats:** credential stuffing, account enumeration, session fixation, broken object-level access (user A reads user B's progress), insecure recovery, data breach of children's records.
- **Pros:** continuity across devices; per-user limits. **Cons:** the project becomes a data controller for minors; recovery, deletion and support burden; the offline queue must reconcile with server state.
- **Mandatory tests:** all of OWASP's controls above as automated and manual tests; object-level authorisation tests; lockout without denial of service; recovery flow tests; deletion and retention tests; TLS-only tests.
- **Status:** **NOT IMPLEMENTED**, deferred (D097).
- **Permitted claims:** "There are no accounts." **Not permitted:** "login", "secure accounts".

### A4 — role-based access control

- **Goal:** different people do different things: learner practises; teacher sees permitted progress; content reviewer approves items; administrator manages users.
- **Identities:** authenticated users (needs A3) with one or more roles.
- **Credentials / session:** as A3, plus role claims checked on the server for every request.
- **Authorisation boundary:** deny by default; a reviewer cannot publish their own authored item; a teacher sees only their own class.
- **Data store:** users, roles, assignments, review decisions, and an append-only audit log.
- **Threats:** privilege escalation, role confusion, stale permissions after a person leaves, tampered review records.
- **Pros:** real review workflow; accountable approvals. **Cons:** large design surface; not appropriate for the 24-hour MVP.
- **Mandatory tests:** per-endpoint role tests (every route with every role, including none); escalation attempts; audit-log completeness; separation of duties; revocation takes effect immediately.
- **Status:** **NOT IMPLEMENTED**, deferred (D098, D191). The reviewer **spreadsheet** (`docs/CONTENT_REVIEW_WORKSHEET.csv`) and the check that no draft carries a reviewer name are a human process with a consistency checker, **not** application RBAC.
- **Permitted claims:** "Review is done offline with a worksheet." **Not permitted:** "teacher dashboard", "role-based access".

### A5 — school or organisation identity

- **Goal:** a school or district manages its own learners, teachers and groups.
- **Identities:** institutional identities from the organisation's identity provider.
- **Credentials / session:** single sign-on (for example OpenID Connect or SAML) with the organisation's directory.
- **Authorisation boundary:** tenancy: one school never sees another's data; organisation administrators manage only their tenant.
- **Data store:** multi-tenant database with per-tenant retention.
- **Threats:** tenant crossover, mis-provisioned or lingering accounts, contractual and governance failures.
- **Pros:** fits how schools already manage identity. **Cons:** contracts, provisioning, support and governance; far beyond the MVP.
- **Mandatory tests:** tenant-isolation tests on every query; de-provisioning; token validation; organisation-administrator boundary tests.
- **Status:** **DEFERRED and out of MVP scope** (D099).
- **Permitted claims:** none beyond "not built".

### A6 — production or minor-user service

- **Goal:** a real service that children and schools can rely on.
- **Identities:** as justified by A3–A5, with the minimum data collection.
- **Credentials / session:** as above, plus monitoring of misuse.
- **Authorisation boundary:** as above, reviewed by security and legal advisers.
- **Data store:** hardened, backed up, with defined retention and deletion.
- **Threats:** all of the above plus incident response, abuse, vendor/provider data handling (a hosted model receives the typed explanation), regulatory exposure.
- **Pros:** an actual product. **Cons:** a separate project with legal, security and safeguarding work.
- **Mandatory tests and reviews before any claim:** a written threat model; independent security testing; privacy notice and consent and age handling reviewed by counsel; deletion and retention jobs tested; backup-restore drill; monitoring and alerting; incident-response drill; provider data-processing review; teacher-reviewed content; an approved user study.
- **Status:** **NOT PRODUCTION-READY**, rejected for the MVP (D100). None of the mandatory items exists.
- **Permitted claims:** "A demonstration prototype with synthetic data." **Not permitted:** "production-ready", "child-safe", "compliant".

## 4. Decision gates for moving up a level

| Move | Gate before starting |
|---|---|
| A1 → A2 | A named reason (families do share phones, from real research); a design for profile switching and accidental disclosure; tests above |
| A2 → A3 | A threat model; a privacy, consent and deletion design; legal review for under-18 users; a database and an owner who can operate it |
| A3 → A4 | A real reviewer/teacher workflow that cannot be done with the worksheet; audit-log design |
| A4 → A5 | A school partner and contract |
| any → A6 | Section A6 mandatory list |

The project owner makes each decision; nobody should add accounts quietly. This record is not that decision.

## 5. India data-protection note (no compliance claim)

- SOURCE SAYS: the official MeitY page given in the brief, <https://www.meity.gov.in/data-protection-framework>, returned only placeholder page metadata to the tool used in this audit. **The legal text was not read.**
- A secondary summary opened on 13 October 2026 (a BDO India article, <https://www.bdo.in/en-gb/news/2025/digital-personal-data-protection-rules-2025-%E2%80%94-check-provisions,-implementation-plan,-penalties>) says the Digital Personal Data Protection Rules 2025 were notified on 14 November 2025, that implementation runs in phases (with core obligations on an 18-month window), that verifiable consent of a parent or guardian is needed before processing the personal data of children under 18, and that some education-related exceptions exist but are worded ambiguously. That is a law firm's summary, not authority.
- Therefore: **commencement dates, children's-data duties and any education exemption need a date-current review by a qualified lawyer.** Pathasetu makes no statement that it complies with any data-protection law. The hackathon demo uses synthetic data only (D073, D074).

## 6. Sources

- OWASP Authentication Cheat Sheet: <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html> (opened 13 October 2026).
- OWASP Session Management Cheat Sheet: <https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html> (opened 13 October 2026).
- MeitY data-protection framework page: <https://www.meity.gov.in/data-protection-framework> (opened; no legal text returned).
- Repository evidence: `src/server/server.js`, `src/server/access.js`, `scripts/preflight.mjs`, `docs/HTTPS_DEMO_RUNBOOK.md`, `tests/public-demo.test.js`.
