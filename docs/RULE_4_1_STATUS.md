# Rule 4.1 status record

**RULE_4_1_STATUS=UNCONFIRMED**

Recorded 13 October 2026 (IST), Iteration 8. This file records a **risk and a decision**. It is not a ruling and it is not legal or organiser advice.

## What the official pages say (read 13 October 2026)

- Rules page, Section 4.1: "all code and architecture must be built during the competition hours"; submissions pass through "automated GitHub repository plagiarism scanners and commit timeline analyzers". Source: <https://www.nirmit.space/rules>.
- The rules page says nothing about AI assistance or APIs.
- Event page: "Use of external open-source LLM APIs is permitted; all API keys must be configured via environment variables." Dates on the event page: "14 – 15 October 2026". The rules page separately says "Official event schedule: 11–15 October 2026". Source: <https://www.nirmit.space/events/nextech>.

## What the team has said

- The team reports that the organisers allowed early work and API use. That statement is **TEAM-REPORTED**. No saved organiser message is in the repository materials (decisions D180 to D182).
- On 13 October 2026 (second Iteration 8 prompt, 21:30 IST) the team **instructed the build to proceed with engineering now**, while keeping the written question open. That instruction is recorded in decision D205.

## What this means for the repository

| Item | Status |
|---|---|
| Written organiser clarification of Rule 4.1 | **UNCONFIRMED** (none saved) |
| Eligibility of the pre-event prototype for the competition | **UNKNOWN**; not claimed either way |
| Eligibility of a hosted open-weight model as an "external open-source LLM API" | **UNKNOWN**; the default stays the MOCK provider; no live call has been made |
| Exact start of the build window (11, 14 or another date) | **UNKNOWN** until stated in writing |
| Disclosure of pre-event, AI-assisted work | Done in `docs/BUILD_STATUS.md` (Provenance); wording for the organisers is in `docs/ORGANIZER_CLARIFICATION_UNSENT.md` |
| Git history | Preserved. Nothing is rewritten, squashed or backdated; every earlier commit remains authored "Claude (AI-assisted build)" |
| Earlier evidence folders (Iteration 2 to 7) | Preserved; protected by a digest record checked in the test suite |

## Rules the build follows while this is UNCONFIRMED

1. Local engineering proceeds on the team's instruction. The risk of ineligibility is the team's to carry and is stated here rather than hidden.
2. No document claims that the work complies with Rule 4.1, that early work was approved in writing, or that any provider is eligible.
3. The mock provider stays the default. No API key is requested, printed or stored; no live provider call is made.
4. No deployment, public endpoint or paid resource is created.
5. If a written reply arrives, store the **real message and its date** in the project records, change this status, and update decision D205. Do not change the commit timeline.

## Open external tasks

- [ ] Team sends the message in `docs/ORGANIZER_CLARIFICATION_UNSENT.md` (status **UNSENT**).
- [ ] Team saves any reply with its date.
- [ ] Team decides what to do about submission eligibility if the reply is unfavourable (not decided here).
