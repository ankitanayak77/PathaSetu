# Competitive and adjacent-systems landscape (Iteration 8)

**Date checked:** 13 October 2026 (IST), by the AI-assisted build, using web search and an automatic page reader. **Nothing below was tried as a user.** Every system has manual-test status `NOT_TESTED` or `SOURCE_ONLY`; none is `TRIED` or `INDEPENDENTLY_VERIFIED`.
**Purpose:** record what public sources say about systems that overlap Pathasetu, so that the pitch and the guide make no claim the scan cannot support. This is a desk review, not a market study.

## How to read this document

Each system has three separate parts, as the Iteration 8 prompt requires:

- **(a) Provider says:** what the cited page states, close to its words.
- **(b) Personally verified:** what the build actually tried. In this pass: **nothing**.
- **(c) Inference:** the build's reading, labelled as inference.

Manual-test status: `NOT_TESTED` (not opened as a user), `SOURCE_ONLY` (a source page was read; the product was not used), `TRIED`, `INDEPENDENTLY_VERIFIED`. Pathasetu's lesson for each: `ADOPT`, `ADAPT`, `DEFER` or `AVOID`.

**Limits of the evidence.** Pages were read through an automatic page reader that summarises text. It could not render pages that need JavaScript (Bhashini, Jigyaso) and returned only page metadata for them. Figures come from the pages as quoted and were not cross-checked against a second source unless stated. Pricing, availability by region and privacy terms were not checked. No product content, question text, translation or branding was copied.

## Required conclusion

Based on this scan, several systems already provide parts of the experience Pathasetu aims at. The scan has **not** established whether a product identical to Pathasetu exists, and it was too narrow to say that none does. Pathasetu therefore makes **no claim to be the first, the only or a unique product, and none to have no competitor**. A *potential differentiator* to test is the **combination** of: an offline-first learning flow, source-traceable board/class/book mapping, an everyday-Odia ↔ school-Odia ↔ English bridge, validated misconception feedback, and honest review and evaluation status. No single generic AI feature is a differentiator.

## Summary matrix

| # | System | Kind | Offline per its source | Odia per its source | Adaptive or AI per its source | Test status | Pathasetu lesson |
|---|---|---|---|---|---|---|---|
| 1 | DIKSHA | National content and distribution platform | Yes: download, then use offline | Yes: the app help page lists "Oriya" among app languages | Not established by the pages read | SOURCE_ONLY | ADAPT (metadata, QR entry); complement, not rival |
| 2 | PM eVIDYA | Programme: web, TV, radio | TV and radio need no internet | Not mentioned on the page read | No | SOURCE_ONLY | ADAPT (low-connectivity assumption) |
| 3 | ePathshala (NCERT) | E-textbooks and resources portal and app | Not established on the page read | No: Hindi, English, Urdu listed | No | SOURCE_ONLY | ADAPT (small asset budget) |
| 4 | Khan Academy India / Khanmigo | Free content; AI tutor in pilot | Not established | Odia listed as a site language; Class 10 Physics seen under other languages | Khanmigo is an AI tutor; Hindi and English in India per its blog | SOURCE_ONLY | ADAPT (practice and explanation quality); strong adjacent competitor |
| 5 | Jigyaso | Odisha-market AI learning product, per the team's brief | Unknown | Claimed by the brief's listing; page unreadable here | Claimed ("AI teacher"); unverified | NOT_TESTED | ADAPT (differentiate on evidence, not "AI in Odia") |
| 6 | Bhashini | Language-technology infrastructure | Unknown (online services) | Not mentioned on the pages read | Translation and speech services | SOURCE_ONLY | DEFER (optional adapter later) |
| 7 | ChatGPT Study Mode | General AI learning mode | No (hosted) | Not stated | Yes: Socratic prompts, quizzes | SOURCE_ONLY | ADAPT (hint ladder pattern); AVOID as a dependency |
| 8 | Gemini Guided Learning | General AI learning mode | No (hosted) | Not stated | Yes: guided steps, quizzes | SOURCE_ONLY | ADAPT (optional mode idea) |
| 9 | Carnegie Learning MATHia | Commercial adaptive maths | Not stated | Not stated | Yes, vendor-described | SOURCE_ONLY | ADAPT (explicit skill state); AVOID mastery claims |
| 10 | Kolibri (Learning Equality) | Open offline-first learning platform | Yes: designed for use without the internet | Not checked (library "over 173 languages") | Not its focus | SOURCE_ONLY | ADAPT (sync-when-back model); possible complement |
| 11 | Odisha state initiatives | State portals, apps, TV, YouTube | Mixed; not stated for most | Madhu App lessons are in Odia | Not stated | SOURCE_ONLY | ADAPT (state alignment); complement |
| 12 | UNESCO GEM 2023, ASER 2024 | Context, not competitors | n/a | n/a | n/a | SOURCE_ONLY | ADOPT as constraints (evidence, equity, privacy) |

## Per-system records

### 1. DIKSHA (India's national digital education platform)

- **Owner and scope:** Government of India; school education; many states and UTs. Target: learners, teachers, parents.
- **(a) Provider says:**
  - A PIB factsheet, *DIKSHA: Powering India's Digital Learning Ecosystem*, dated **28 June 2026**, says learners can download content in advance and use it offline, and describes QR-coded energised textbooks that link physical NCERT books to videos, interactives and teacher guides. It states **135 languages** (128 Indian, seven foreign) and, as on 27 June 2026, about 2.25 crore registered users and about 3 lakh daily active users. Source: <https://pib.gov.in/FactsheetDetails.aspx?Id=150639>.
  - The DIKSHA mobile app help page says the app can be used "as a guest or anonymous user", content is downloaded from the repository when online, content can be consumed in online or offline mode, and the app languages include Hindi, English and "Oriya". Source: <https://diksha.gov.in/help/getting-started/diksha-mobile-app/>.
- **(b) Personally verified:** nothing. No download, QR scan or offline use was tried.
- **(c) Inference:** DIKSHA is a content and distribution layer with official provenance. The pages read do **not** establish an offline misconception-diagnosis loop, and they also do not rule out adaptive features elsewhere in DIKSHA; that is not claimed either way. DIKSHA is better treated as a **complement** (a possible link-out or QR entry point) than as a rival to rebuild.
- **Offline first use:** content must be downloaded while online first (per the help page).
- **Privacy and login:** guest use stated; data handling not read.
- **Status:** `SOURCE_ONLY`. **Lesson: ADAPT** curriculum metadata and the QR/book entry idea; **DEFER** any integration.

### 2. PM eVIDYA (programme combining digital, TV and radio)

- **(a) Provider says:** the SWAYAM Prabha page describes PM eVIDYA as including internet-based learning, radio, community radio, podcasts and TV, with DTH channels serving learners without stable internet; "12 (now 200)" TV channels under "One Class-One channel", covering classes 1 to 12; video content in "Hindi, English, and Regional languages"; QR codes on video content link to the same material on DIKSHA. Source: <https://swayamprabha.gov.in/about/pmevidya>. The page does not mention Odia or Odisha.
- **(b) Verified:** nothing. **(c) Inference:** it is a bundle of channels, not one app; its parts must not be merged into one feature claim. It confirms that low-connectivity alternatives to a smartphone session matter.
- **Status:** `SOURCE_ONLY`. **Lesson: ADAPT** (do not assume internet at the moment of learning).

### 3. ePathshala (NCERT)

- **(a) Provider says:** the portal describes itself as a "storehouse of- audios, videos, epubs, flipbooks etc.", shows "Total eTextbooks 504", says resources are in "Hindi, English, Urdu", and links a mobile app for Google Play and the App Store. Source: <https://epathshala.ncert.gov.in/>.
- **(b) Verified:** nothing. **(c) Inference:** the page does not show Odia support or a personalised tutor, and does not state offline behaviour; none is assumed.
- **Status:** `SOURCE_ONLY`. **Lesson: ADAPT** small asset budgets and accessible textbook formats.

### 4. Khan Academy India and Khanmigo

- **(a) Provider says:**
  - The India site headline reads "100% free content for Grade 1-12, aligned to India curriculum", and says it is "Available in English, Hinglish, Hindi, Gujarati, Assamese, Odia, Marathi, Punjabi and Kannada". "Class 10 physics" appeared under the English and Hinglish sections and a Class 10 Physical Science (India) entry under Gujarati on the page as read. Source: <https://india.khanacademy.org/>. No Odia Class 10 science entry was seen on that page.
  - The Khan Academy blog, last updated 4 December 2025, says Khanmigo for Teachers is a pilot in "more than 180 countries and territories", student access is limited to parents and learners in the U.S., and a 14 November 2024 update says Khanmigo "is now available in India in Hindi and English!". Source: <https://blog.khanacademy.org/teachers-in-44-countries-now-get-free-access-to-khanmigo-in-english-thanks-to-microsoft-support>.
- **(b) Verified:** nothing; **no Odia Class X Electricity lesson was opened.** **(c) Inference:** this is a strong adjacent competitor for instructional explanations and practice. Whether any Odia science content aligns to BSE Odisha is unknown and must be checked by opening it before any comparison is made.
- **Status:** `SOURCE_ONLY`. **Lesson: ADAPT** (explanation and practice quality bar); **AVOID** any "first Odia learning app" or "first personalised tutor" wording.

### 5. Jigyaso

- **(a) Provider says:** the team's brief describes a public site and search listing at <https://www.jigyaso.com/> marketing an Odia-language AI teacher, school and competitive-exam support, MCQs and performance tracking. **This pass could not read that page**: the page reader received only page metadata (a site builder tag and a viewport tag), and a plain web search for the name returned nothing relevant. The description above is therefore taken from the brief and is **unverified**.
- **(b) Verified:** nothing. **(c) Inference:** if the description is accurate, local Odia AI-learning products already market against a similar need, so "AI in Odia" is not a differentiator. Functionality, model, offline capability, curriculum provenance and metrics are all unknown.
- **Status:** `NOT_TESTED` (not even `SOURCE_ONLY`: no readable source). **Lesson: ADAPT** the positioning (evidence-backed mapping, review status, offline reliability, measured evaluation). **Manual action for the team:** open the product, record version, date and account, and update this row.

### 6. Bhashini

- **(a) Provider says:** the portal's description reads that it aims "every citizen can effortlessly access digital services in their own language"; the portal pages need JavaScript and gave no language list to the page reader. A PIB document dated 25 October 2025 says Bhashini enables "real-time translation for 22 Scheduled Languages and tribal languages", credits it with machine translation, speech recognition and language understanding, and lists deployments (a state helpline, eVidhan, a farmers' app, Maha Kumbh 2025 announcements, parliamentary translation). Source: <https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/oct/doc20251025675501.pdf>. That document does not mention Odia by name. The brief cites "36+ languages" on <https://bhashini.gov.in/services>; that page was not readable here, so the figure is **not confirmed** by this pass.
- **(b) Verified:** nothing; no API call. **(c) Inference:** Bhashini is language infrastructure, not an offline tutor. Odia quality, API terms, licence, data flow and latency are unknown and need fresh verification.
- **Status:** `SOURCE_ONLY`. **Lesson: DEFER** as an optional future speech or translation adapter; never a dependency of the offline core.

### 7. ChatGPT Study Mode

- **(a) Provider says:** launched **29 July 2025**; guides the user step by step using Socratic questions, hints and self-reflection prompts, scaffolded responses, quizzes and open-ended questions with feedback; can be turned on or off; available to logged-in users on several plans; the provider states it runs on custom system instructions, which "can produce inconsistent behavior and mistakes". Source: <https://openai.com/index/chatgpt-study-mode/>.
- **(b) Verified:** nothing. **(c) Inference:** hint ladders, "explain why" and misconception checks are existing industry patterns, not Pathasetu inventions. It is hosted and general, so it does not show board-specific reviewed content or offline behaviour. Nothing here says such a system is permitted in the competition.
- **Status:** `SOURCE_ONLY`. **Lesson: ADAPT** the interaction patterns; **AVOID** relying on it.

### 8. Gemini Guided Learning

- **(a) Provider says (as reported):** announced **6 August 2025**; breaks problems into steps, uses images, diagrams, videos and quizzes; a trade-press report adds that the tool is optional and learners can switch to direct answers, and that Google cannot require its use. Sources: <https://techcrunch.com/2025/08/06/google-takes-on-chatgpts-study-mode-with-new-guided-learning-tool-in-gemini/> and <https://www.maginative.com/article/google-launches-guided-learning-for-gemini-joining-the-ai-tutor-arms-race/>. Language support and availability were not stated in the pages read.
- **(b) Verified:** nothing. **(c) Inference:** same as row 7; the optional-mode weakness is a design reminder that a pedagogy mode that can be bypassed is only a suggestion.
- **Status:** `SOURCE_ONLY`. **Lesson: ADAPT** the stepwise pattern with grounding and consent; **AVOID** dependence.

### 9. Carnegie Learning MATHia

- **(a) Provider says:** a supplemental adaptive maths product for grades 6 to 12 with hints and coaching and teacher insight reports; "30 years of research backing MATHia"; a district study reports correlations of r = 0.40 to 0.56 between usage-based achievement and state test scores. Source: <https://www.carnegielearning.com/solutions/math/high-school-math-solution>. Languages and offline use are not stated.
- **(b) Verified:** nothing. **(c) Inference:** the page is vendor marketing; correlations do not show causation, and the larger trials it mentions concern the wider curriculum, not MATHia alone. It supports a design lesson (explicit skill state, actionable next step) but is not evidence about Odia science.
- **Status:** `SOURCE_ONLY`. **Lesson: ADAPT** explicit concept state; **AVOID** "mastery" or "adaptive" claims for Pathasetu until measured.

### 10. Kolibri (Learning Equality)

- **(a) Provider says:** "an ecosystem of open digital products and tools centered around an offline-first learning platform"; "especially designed to enable quality teaching and learning with tech but without the Internet"; learners can use the Kolibri Android app at home and sync back to a school server; installed in "220+ countries and territories"; library materials in "over 173 languages". Sources: <https://learningequality.org/kolibri/> and <https://www.learningequality.org/about/>. The page does not mention India, and the software licence was not stated there.
- **(b) Verified:** nothing. **(c) Inference:** this is a mature offline-first platform; "offline-first" is therefore not a differentiator by itself. It may be a complement for distribution.
- **Status:** `SOURCE_ONLY`. **Lesson: ADAPT** the sync-when-back pattern; **DEFER** any content-interchange work until licences are reviewed.

### 11. Odisha state initiatives

- **(a) Provider says:** a CIET/NCERT presentation on digital initiatives in Odisha (undated) lists ten items, including "Odisha Shiksha Sanjog", telecast of video lessons on "Doordarshan Odia", "DIKSHA Portal", "Madhu App", "Live YouTube classes form class 1 to 10", "E-Vidyalaya App" and "Odisha Education Resource Portal"; it gives no feature detail for most. Source: <https://ciet.ncert.gov.in/storage/app/public/files/17/Presentation PDF/Digital initiative in Odisha.pptx.pdf>. A news report of 4 December 2019 describes Madhu App as an Android app with video lectures and exercises **in Odia** for Classes 5 to 8, initially maths and science. Source: <https://odisha.plus/?p=4383>.
- **(b) Verified:** nothing. **(c) Inference:** current availability, class coverage and offline behaviour of these items are unknown (the sources are old or undated). State platforms are potential complements and alignment targets.
- **Status:** `SOURCE_ONLY`. **Lesson: ADAPT** state alignment and Odia terminology; check each item's current status before citing it in a pitch.

### 12. UNESCO and ASER (context, not competitors)

- **(a) Provider says:** the 2023 UNESCO Global Education Monitoring Report, *Technology in education: A tool on whose terms?*, states that technology can affect education as an input, a means of delivery, a skill, a planning tool and a social context, notes that views are sharply divided and that some proposed solutions may cause harm, and names access to technology, governance and regulation, and teacher preparation as enabling conditions. Source: <https://inee.org/resources/2023-gem-report-technology-education-tool-whose-terms>. ASER 2024 was released on 28 January and tracks foundational literacy and numeracy; the ASER page lists an Odisha state report in English and Odia, but **no ASER figure was read in this pass**. Sources: <https://www.printweek.in/news/aser-2024-education-goals-demand-more-as-tech-reshapes-books-60056> and <https://asercentre.org/aser-2024/>.
- **(b) Verified:** nothing. **(c) Inference:** these set constraints (human review, privacy, evaluation, equity) but do not validate Pathasetu. **No ASER or smartphone-access number may be quoted in any Pathasetu document until the report itself has been read.**
- **Status:** `SOURCE_ONLY`. **Lesson: ADOPT** as design constraints.

## Other India and local-language offline products

Only Kolibri and the Odisha state items were examined. These were **not** researched and are listed so that the gap is visible rather than hidden: SWAYAM and SWAYAM Prabha course platforms beyond the PM eVIDYA page, NIOS's own learning material and apps, Pratham programmes, other state learning apps, commercial exam-preparation apps for Odia-medium learners, and offline school-server products. Absence from this table is not evidence that they are irrelevant or that they do not exist. A "no competitor" statement is **not** permitted until this search is done and recorded.

## What Pathasetu can learn (decisions)

| Decision | Item | Why |
|---|---|---|
| ADOPT | Human review, privacy and evaluation as product requirements (UNESCO) | They are constraints from policy guidance, already reflected in the review gates |
| ADAPT | Hint ladders, "explain why" and misconception checks (rows 7, 8) | Existing patterns; implement only on reviewed content |
| ADAPT | Board, medium and book metadata with a QR or book entry point (rows 1, 3) | Fits the source-traceable mapping already drafted |
| ADAPT | Sync-when-back (row 10); assume weak connectivity (row 2) | Matches the offline queue already built |
| DEFER | Bhashini speech or translation adapter (row 6) | Needs an evaluation and a privacy review; must not become a core dependency |
| DEFER | DIKSHA, Kolibri or state-platform integration | Needs licence review and a partner decision |
| AVOID | "First", "only", "unique", "no competitor", "India's first", "Odisha's first" | Not supported by this scan |
| AVOID | "Adaptive mastery", "improves learning" | No measurement exists |

## Position statement (one page)

**Target user.** A Class X learner in Odisha who studies in Odia and meets English terms in school science, on a phone that may be shared, with weak or costly data. The first slice is one chapter, Electricity, in a draft pack of eight items.

**Painful job to be done.** "When I give a wrong or half-right explanation, tell me which idea I am mixing up, in words I understand, even when the network drops, and let me come back to it."

**Strongest alternatives today.** DIKSHA and state platforms for official content and offline download; Khan Academy India for free practice with Odia among its listed site languages; hosted AI study modes for guided explanations; local products that market an Odia AI teacher (unverified here); Kolibri for offline-first delivery. Printed textbooks and teachers remain the baseline.

**What Pathasetu does that these may not combine (potential differentiator, not verified).** An offline-first loop that observes a learner's explanation, proposes one misconception from an allow-list, validates it, plans one next step and saves a trace; a source-traceable board/class/book mapping with draft status shown; an everyday-Odia ↔ school-Odia ↔ English bridge; and honest review and evaluation status. Each part exists elsewhere in some form; the combination is the hypothesis.

**Proven now (from repository evidence, not from users).**

- The code runs offline after a first visit in headless Chromium (sandbox).
- The mock provider is the default and no live model call has been made.
- The validator rejects off-list outputs in tests.
- The pack is `UNREVIEWED_DRAFT`.

**Hypotheses, not proven.**

- Learners find the diagnosis helpful and correct.
- The bridge helps comprehension.
- The loop is faster or clearer than the alternatives above.
- Odia wording is acceptable to teachers.
- It works on the four target phones.

**How to validate.**

1. A qualified subject and language review of the eight items.
2. Real-phone checks using `PHONE_TEST_PLAN.md`.
3. A teacher-labelled evaluation set before any model is used.
4. A small, consented pre/post study under approved ethics, which is not yet designed.
5. A manual try-out of the named alternatives, with results written back to this file.

**Competitors versus complements.** DIKSHA, Bhashini, Kolibri and state platforms may be partners or infrastructure as much as competitors.

## Sources and access date

All pages were opened on 13 October 2026. URLs are those cited above: <https://pib.gov.in/FactsheetDetails.aspx?Id=150639>; <https://diksha.gov.in/help/getting-started/diksha-mobile-app/>; <https://swayamprabha.gov.in/about/pmevidya>; <https://epathshala.ncert.gov.in/>; <https://india.khanacademy.org/>; <https://blog.khanacademy.org/teachers-in-44-countries-now-get-free-access-to-khanmigo-in-english-thanks-to-microsoft-support>; <https://www.jigyaso.com/> (unreadable here); <https://bhashini.gov.in/services> (unreadable here); <https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/oct/doc20251025675501.pdf>; <https://openai.com/index/chatgpt-study-mode/>; <https://techcrunch.com/2025/08/06/google-takes-on-chatgpts-study-mode-with-new-guided-learning-tool-in-gemini/>; <https://www.maginative.com/article/google-launches-guided-learning-for-gemini-joining-the-ai-tutor-arms-race/>; <https://www.carnegielearning.com/solutions/math/high-school-math-solution>; <https://learningequality.org/kolibri/>; <https://www.learningequality.org/about/>; <https://odisha.plus/?p=4383>; <https://inee.org/resources/2023-gem-report-technology-education-tool-whose-terms>; <https://asercentre.org/aser-2024/>.

**Re-check triggers.** Before any pitch line about a competitor, re-open its page; claims about languages, offline mode, grades and pricing change.
