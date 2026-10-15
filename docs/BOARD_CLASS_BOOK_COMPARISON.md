# Pathasetu — board, class, subject and book comparison

Written 13 October 2026 (Iteration 7); the board table and sources were extended in Iteration 8 on the same day (new rows are marked S11–S20 and section 5). This is a **decision record, not a feature**: nothing here adds a board switch, a second pack or textbook content. The machine-readable form of section 5, with every required field per track, is `docs/BOARD_COVERAGE_REGISTER.csv`; it is the same register, not a second one, and a test keeps the two in step. Decision IDs (`D0xx`) refer to `docs/DECISION_LOG.csv` and `docs/DECISION_REGISTER.md`.

## 0. How to read this page

Every statement carries one of three labels. They are never mixed.

- **SOURCE SAYS** — an official page or PDF that was actually opened in this iteration says it. The URL and what was read are in section 2.
- **CODE PROVES** — a file or test in this repository shows it.
- **TEAM CHOSE / ASSUMES** — a choice or belief of the team, or a statement carried over from the supplied `Pathasetu_Comprehensive_Decision_Register_2026-10-13.md` that this audit could not re-check. It is not a fact about the world.

`UNKNOWN` means the evidence available to this audit is insufficient. Nothing below was filled from memory.

## 1. The decision in four lines

1. **Keep** the MVP target: BSE Odisha Class X, Odia-medium, General Science (Physical Science), Electricity (D010, D022). No source read found a conflict with the submitted problem statement or with the 2026-27 syllabus. (TEAM CHOSE; SOURCE SAYS the topic exists.)
2. **Do not** say "HSC, not Madhyama" as a verified distinction. The BSE syllabus PDF does not contain either word as a pathway heading (D010, D011). Iteration 8 found that "HSC" is an official BSE term: the BSE question-pattern document is headed "Annual HSC Examination, 2026" for Classes IX and X (S12). "Madhyama" appears only as BSE menu entries with no content behind them (S11), so whether it is a separate pathway stays UNKNOWN. Say: *BSE Odisha Class X General Science, session 2026-27.*
3. **The exact book edition, chapter and page for each of the eight items is UNKNOWN** and stays UNKNOWN until a qualified reviewer, holding a legitimately accessed copy, fills `docs/BOOK_CROSSWALK.csv` (D024, D025).
4. **Other boards, classes and books are researched but not implemented**, each with a reopening trigger below (D012–D021, D204). Seven distinct tracks are now in the register: BSE Odisha HSC, BSE Odisha Madhyama, CBSE, CISCE (ICSE), CHSE Odisha (+2 only), NIOS and WBBSE, plus the retained "other state boards" row. A board counts as supported only when it has a sourced pack, a review, valid mappings, passing content checks and a tested selection path; none of the other tracks has any of these.

## 2. Sources checked in this iteration

Access date for every row: 13 October 2026. "Version/date" is what the source itself states; where it states none, that is recorded as a gap.

| # | Source (primary first) | URL | What was read | Version / date stated by the source | Limits |
|---|---|---|---|---|---|
| S1 | BSE Odisha, Class X subject-wise syllabus | <https://bseodisha.nic.in/wp-content/uploads/2026/05/Subject_wise_syllabus_class_X_26_27.pdf> | Heading, the General Science entry, the prescribed-book list, the Physical Science topic list | Heading "SYLLABUS FOR THE SESSION, 2026-27". No issue date inside the file (the URL path suggests a May 2026 upload; that is an inference). Assessment dates inside: IA-1 by the 2nd week of July 2026; annual examination in the last week of February 2027 | The Odia text extracts partly garbled. No page numbers, no publisher, edition or year for the General Science books. The words "HSC", "Madhyama" and "Madhyama Pariksha" do not appear in Latin script |
| S2 | Government of Odisha, School & Mass Education Department, Class X textbooks listing | <https://sme.odisha.gov.in/en/text-books-for-class-x> | **Not read.** The fetch tool was refused (`ROBOTS_DISALLOWED`) | — | Everything said about this page elsewhere is carried over from the supplied register (TEAM CHOSE / ASSUMES). A chapter-PDF listing would not prove the printed edition a learner holds |
| S3 | CBSE Academic Unit, Curriculum/Syllabus page | <https://cbseacademic.nic.in/curriculum_2027.html> | Page title, session, and the Class X Science link | "Curriculum for the Academic Year 2026-27". No publication date; footer "© 2026 CBSE Academic Unit" | The linked Science PDF (<https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart1/Science_SecP1_2026-27.pdf>) was **not opened**; no CBSE topic was mapped |
| S4 | CISCE home page | <https://cisce.org/> | Home page content | No syllabus date | The content fetched showed a "CISCE Publications & Resources" heading with no syllabus link, so **no ICSE syllabus was reached** |
| S5 | NIOS eContent, Secondary, Science & Technology | <https://digital.nios.ac.in/topic.php?id=212en> | Page title, 32 chapter titles | "© 2012 The National Institute of Open Schooling"; no edition or session | Chapter 16 "Electrical energy" and Chapter 17 "Magnetic effect of electric current" exist; the course code, assessment scheme and current edition are not shown. The chapter pages and the Electrical Energy chapter URL were not opened |
| S6 | WBBSE | <https://wbbse.wb.gov.in/> | **Not evaluated.** Only search-result titles from non-official sites were returned | — | No primary syllabus reached; nothing is claimed |
| S7 | NCERT ePathshala | <https://epathshala.nic.in/> | **Not re-read** in this iteration | — | The register's note that republication conditions exist is carried over, not verified |
| S8 | NEXTECH 2.0 event page | <https://www.nirmit.space/events/nextech> | Weights, API wording, dates, venue | Event dates "14 – 15 October 2026"; mid-evaluation "04:00 PM – 07:00 PM (Day 1)" | Public page; may change |
| S9 | NEXTECH 2.0 rules | <https://www.nirmit.space/rules> | Rules 3.3 and 4.1 | Undated | Contains no rule about APIs or LLMs |
| S10 | NEXTECH problem statement | <https://www.nirmit.space/docs/Nextech2.0_Problem_Statement_BW.pdf> | Read in earlier iterations; the team also uploaded it | Undated | — |
| S11 | BSE Odisha, syllabus page | <https://www.bseodisha.ac.in/syllabus.html> | Class X syllabus-update and new-chapter links; Madhyama menu entries | Filenames mention 2020-21 only; most items show no session | Menu entries "The Scheme of Studies for Madhyama Examination" and "Contd. of Madhyama Syllabus" link to "#"; no content. No General/Physical Science heading |
| S12 | BSE Odisha, question pattern | <https://cdn.bseodisha.ac.in/images12/Pattern%20of%20syllabus_2026.pdf> | Title, General Science marks and pattern | "Annual HSC Examination, 2026", Classes IX and X | General Science 100 marks, 2 h 30 min; Physical Science 50 (25 one-mark MCQs + 25 subjective), Life Science 50. Does not mention Madhyama or Electricity |
| S13 | CBSE Academic Unit, Class X Science curriculum | <https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart1/Science_SecP1_2026-27.pdf> | Units, the Effects of Current unit, textbook statement | Session 2026-27; Subject Code 086 | Read through a summarising tool, so wording is paraphrase; page numbers UNKNOWN. The "Reading Material" link beside it has "IX" in its filename and was not resolved |
| S14 | CBSE Academic Unit, Class X sample papers | <https://cbseacademic.nic.in/sqp_classx_2026-27.html> | Science sample paper and marking-scheme entry | "Exam 2026-27" | No dates for the entry |
| S15 | CHSE Odisha, syllabus list | <https://chseodisha.nic.in/syllabus/> | 43 entries; classes and sessions | "Rationalised 2023" (Physics etc.), "Rationalised 2024" (BFC) | All +2 or vocational; no Class X entry; the Physics document itself not opened |
| S16 | NIOS, Science and Technology (212) syllabus | <https://nios.ac.in/online-course-material/secondary-courses/science-and-technology-(212)-syllabus.aspx> | Lessons 16 and 17; media offered on that page | No year or revision | English and Hindi lesson files; an Urdu column with no entries |
| S17 | NIOS, secondary courses page | <https://nios.ac.in/online-course-material/secondary-courses.aspx> | Language groups | No year tied to the subject | Odia is among the secondary-course languages; which subjects have an Odia medium is not stated |
| S18 | NIOS Regional Centre Bhubaneswar, 212 Odia medium | <https://rcbhubaneswar.nios.ac.in/science-technology-212-odia-medium.html> | Title, Book-1 (ch. 1–18), Book-2 (ch. 19–32.3), lab file | No edition or year; file paths suggest a December 2021 upload | Chapter titles not shown; regional-centre page, not the main NIOS site |
| S19 | CISCE ICSE PDFs surfaced by site search | <https://cisce.org/wp-content/uploads/2025/03/10.-Physics.pdf>; <https://cisce.org/wp-content/uploads/2026/01/10.-Physics.pdf> | **Not opened.** Titles known only from search listings ("ICSE ... EXAMINATION YEAR 2027"; "... YEAR 2028 SCIENCE") | Examination years 2027 and 2028 | The reading tool could not open any CISCE PDF, including the regulations PDF; nothing about content is claimed |
| S20 | WBBSE, home page and a results booklet | <https://wbbse.wb.gov.in/>; <https://wbbse.wb.gov.in/ReadWriteData/Notification/133906519490276326.pdf> | Board name; "Madhyamik Pariksha(SE), 2025: Broad Features" | 2025 results | A results booklet is not a syllabus. No syllabus reached; WBCHSE not mentioned |

## 3. What the BSE Odisha source actually says (SOURCE SAYS)

From S1, read on 13 October 2026:

- The document is a set of subject syllabi for Class X headed "BOARD OF SECONDARY EDUCATION, ODISHA, CUTTACK — SYLLABUS FOR THE SESSION, 2026-27". The relevant entry is titled "CLASS-X SUBJECT – GENERAL SCIENCE (GSC)".
- It names two prescribed books for General Science: **Physical Science (ଭୌତିକ ବିଜ୍ଞାନ)** and **Life Science (ଜୀବ ବିଜ୍ଞାନ)**. It gives **no publisher, edition or year** for them. Other subjects in the same file do carry edition details (for example a First Language English entry names an NCERT "Revised Edition – October 2022"), so the absence for General Science is a real gap in the source, not an extraction accident.
- Physical Science topics, as extracted: Term I — chemical reactions and equations; acids, bases and salts; metals and non-metals. Term II — carbon and its compounds; periodic classification of elements; **Electricity (ବିଦ୍ୟୁତ୍)**, listed as one item with **no sub-topics**; later, magnetic effect of electric current; light (reflection and refraction); the human eye and the colourful world.
- Therefore the source does **not** list Ohm's law, resistance, series or parallel connection, or the heating effect as separate entries. The eight Pathasetu questions on those ideas sit under the single word "Electricity" only by our inference (D025).
- The layout is jumbled in extraction, so which topic belongs to which internal assessment (IA-1 to IA-4) could not be established.
- "HSC" does not appear. "Madhyama" and "Madhyama Pariksha" do not appear in Latin script. The Odia word for "secondary" (ମାଧ୍ୟମିକ) appears in Mathematics headings, and "Madhyamik" appears only in a Hindi grammar book title. None is a pathway heading for General Science.

## 4. Conflicts and gaps between the supplied register and the sources read

These are recorded, not silently reconciled.

| # | Supplied register says | What this audit found | Handling |
|---|---|---|---|
| 1 | The "official 2026–27 HSC Class X General Science curriculum" | The PDF is titled "Class X" and "General Science"; the word HSC is absent | Use "BSE Odisha Class X General Science, session 2026-27" as the verified wording. "HSC" stays as the team's and the register's label until a teacher or the board confirms it (D010) |
| 2 | "The subject-wise syllabus file contains distinct pathways and entries"; Madhyama is "not targeted" | No Madhyama heading was found. Whether Madhyama is a separate pathway, another name for the same examination, or a different board stream is UNKNOWN | "NOT SELECTED + UNKNOWN" (D011). Do not claim a verified HSC-versus-Madhyama difference |
| 3 | The syllabus "includes electricity-related material" | True, but as one word, "Electricity", plus a separate magnetic-effect entry | Item-level syllabus mapping is UNKNOWN (D025) |
| 4 | SME Odisha lists "Physical Science Inner" and chapter PDFs | The page could not be opened by this audit's tool | Carried over, labelled unverified (S2) |
| 5 | CISCE "Physics syllabus path varies by year" | The home page fetched exposed no syllabus link | CISCE stays NOT EVALUATED for content (D013) |
| 6 | MeitY page is the source for the Digital Personal Data Protection Act and Rules | The fetched page returned only placeholder metadata, no legal text | Legal position is UNKNOWN to this audit; secondary summaries are named in `docs/AUTHENTICATION_AND_TRUST_LEVELS.md` and are not authority |
| 7 | Event page wording on APIs | Event page says "Use of external open-source LLM APIs is permitted; all API keys must be configured via environment variables." The team reports "all APIs allowed". The rules page has no API rule | Conflict preserved (D063). Only a saved written organiser message could settle it |
| 8 | The prompt says BSE Odisha Madhyama is a distinct pathway from HSC | The only Madhyama text found is two BSE menu entries with no content (S11); nothing shows how it differs | Madhyama is tracked as its own row, **BLOCKED**, and its distinctness is UNKNOWN (D011) |
| 9 | Iteration 7: "HSC" appears nowhere | True of the 2026-27 syllabus PDF (S1). The BSE question-pattern document says "Annual HSC Examination, 2026" (S12) | Refined, not reversed: "HSC" is an official BSE term for the annual exam; "HSC, not Madhyama" remains unverified |
| 10 | Iteration 7: CBSE "Science PDF linked but not opened" | Opened through a summarising tool (S13): Unit IV "Effects of Current" lists Ohm's law, resistance, heating and magnetic effects; the NCERT Class X Science textbook is named | CBSE moves from NOT EVALUATED to source-partly-verified; still not implemented; edition and pages UNKNOWN |
| 11 | The prompt calls CISCE/ICSE a Physics-within-Science structure | Not verifiable: no CISCE PDF could be opened (S19) | Recorded as NOT_VERIFIED; CISCE is the council and ICSE the examination |
| 12 | Iteration 7 had no CHSE row | CHSE lists +2 and vocational syllabi only (S15) | Added as its own track, **not Class X** (D204) |
| 13 | Iteration 7: NIOS has no medium evidence | An Odia-medium Science & Technology (212) course is listed (S18); the main NIOS page lists Odia among its languages (S17) | NIOS Odia medium is now source-supported at course level; chapter titles, edition and licence UNKNOWN |

## 5. Board and pathway comparison

Updated in Iteration 8 (retrieval date 13 October 2026). Scope words follow the project vocabulary used by the Iteration 8 prompt: `CURRENT_DRAFT_SCOPE`, `RESEARCHED_NOT_IMPLEMENTED`, `PLANNED`, `BLOCKED`, `OUT_OF_SCOPE_WITH_REASON`. Each track keeps four states apart: **source checked**, **content authored**, **subject/language reviewed**, **implemented and tested**. The full per-track field set (authority name, exam, subject division, URLs, session, edition, topic reference, medium evidence, crosswalk, terminology, every status, gaps, next action, evidence) is in `docs/BOARD_COVERAGE_REGISTER.csv`.

| Track (ID) | Authority and exam | Class level | Source checked | Content authored | Reviewed | Implemented and tested | Scope | Decision |
|---|---|---|---|---|---|---|---|---|
| **BSE-HSC-X** | Board of Secondary Education, Odisha: Annual HSC Examination (S12); General Science, Physical Science part (S1) | Class X | PARTIAL: 2026-27 syllabus and 2026 pattern read; "Electricity" has no sub-topics; book edition/chapter/page UNKNOWN | DRAFT: 8 items, all `UNREVIEWED_DRAFT` | NOT_REVIEWED | IMPLEMENTED (single launch path, no selector); automated checks pass | `CURRENT_DRAFT_SCOPE` | CURRENT MVP (D010, D022) |
| **BSE-MAD-X** | Board of Secondary Education, Odisha: "Madhyama Examination" (S11 menu entries only) | UNKNOWN | BLOCKED: no syllabus content reachable | NOT_STARTED | NOT_STARTED | NOT_IMPLEMENTED | `BLOCKED` | NOT SELECTED; distinctness from HSC UNKNOWN (D011) |
| **CBSE-X** | Central Board of Secondary Education: Class X Science (086) | Class X | PARTIAL: 2026-27 curriculum read (S13): Unit IV "Effects of Current", 13 of 80 theory marks; NCERT Class X Science named; edition and pages UNKNOWN | NOT_STARTED | NOT_STARTED | NOT_IMPLEMENTED | `RESEARCHED_NOT_IMPLEMENTED` | DEFERRED (D012) |
| **CISCE-ICSE-X** | Council for the Indian School Certificate Examinations (the council); ICSE is its examination | Class X | BLOCKED: PDFs for exam years 2027 and 2028 located by search, not openable by the tool (S19); subject structure NOT_VERIFIED | NOT_STARTED | NOT_STARTED | NOT_IMPLEMENTED | `RESEARCHED_NOT_IMPLEMENTED` | DEFERRED (D013) |
| **CHSE-PLUS2** | Council of Higher Secondary Education, Odisha: +2 | **+2 / XI–XII, not Class X** | PARTIAL: listing read (S15): "Physics (Rationalised 2023)", no Class X entry; document not opened | NOT_STARTED | NOT_STARTED | NOT_IMPLEMENTED | `PLANNED` (future class level) | New track; no Class X claim (D019, D204) |
| **NIOS-SEC** | National Institute of Open Schooling: Secondary, Science and Technology (212) | Secondary (open schooling) | PARTIAL: course and an Odia-medium listing seen (S16–S18); lessons 16 "Electrical Energy" and 17 "Magnetic Effect of Electric Current" in the English/Hindi list; edition and year UNKNOWN | NOT_STARTED | NOT_STARTED | NOT_IMPLEMENTED | `RESEARCHED_NOT_IMPLEMENTED` | DEFERRED (D014) |
| **WBBSE-X** | West Bengal Board of Secondary Education: Madhyamik (distinct from WBCHSE) | Class X | NOT_VERIFIED: only a 2025 results booklet reached (S20) | NOT_STARTED | NOT_STARTED | NOT_IMPLEMENTED | `RESEARCHED_NOT_IMPLEMENTED` | NOT EVALUATED for content (D015) |
| **OTHER-STATE-X** | Other state boards (none named) | Class X | NOT_VERIFIED | NOT_STARTED | NOT_STARTED | NOT_IMPLEMENTED | `OUT_OF_SCOPE_WITH_REASON` (no board named) | NOT EVALUATED (D016) |

Nothing in this table implies the chapters, weightage, depth or books of two boards are equivalent. The words "Ohm's law" or "resistance" appearing in two documents are not alignment of wording, depth, examples, exam expectations or learning outcomes, and no reviewed common concept ID exists. A generic engine (CODE PROVES: one pack schema) is not a validated cross-board product. The learner path remains BSE Odisha Class X Electricity; there is no board picker, and none may route another board to BSE questions.

## 6. Grade comparison

| Class | Source consulted | Decision | Why (TEAM CHOSE) | What would need rework |
|---|---|---|---|---|
| I–VIII | None | OUT OF SCOPE (D020) | Different literacy, pedagogy and child-privacy needs | Everything; add a consent and safeguarding process |
| IX | The problem PDF's illustrative learner is in Class IX | NOT SELECTED (D018) | The brief lets teams choose; Class X is a board-examination year | New persona, syllabus map, book map, content review |
| **X** | S1 | **CURRENT** (D017) | Scoping choice; not a measured need | — |
| XI–XII | None | REJECTED FOR MVP (D019) | Subject-separated physics, different mathematics | A separate topic progression and validation |
| Open schooling | S5 | DEFERRED (D021) | Not standardised; no learner research | Confirm course path first |

"Class X" on two boards does not mean the same syllabus. The pack must never be described as "Class 10 Science" in general.

## 7. Subject and topic

- **Chosen:** General Science (Physical Science), Electricity (D022). SOURCE SAYS the topic exists in S1.
- **The four concepts** in the pack (CODE PROVES, `content/electricity-pack.json`): *closed circuit* (EL01, EL02), *energy transfer in a circuit* (EL03, EL04), *Ohm's law* (EL05, EL06), *series and parallel resistance* (EL07, EL08).
- **Which syllabus outcome each concept serves:** UNKNOWN. The source has no outcome statements for Electricity.

## 8. Books: what must be separated

Class X does not identify a book. Keep these as separate fields (this is the structure of `docs/BOOK_CROSSWALK.csv`):

1. board and examination pathway;
2. academic year / syllabus session;
3. class and the subject name as the board prints it;
4. exact book title as printed, language/script, publisher or authority, edition or print year, ISBN or catalogue number if present;
5. chapter number and title as printed in that exact edition;
6. page or section used for alignment (recorded for review, not copied into the app);
7. syllabus outcome or subsection;
8. item ID and reviewer decision;
9. licence or permission status for anything copied.

**Known (SOURCE SAYS):** the syllabus names the books "Physical Science" and "Life Science".
**UNKNOWN:** the printed title wording in Odia on the cover, publisher, edition, print year, chapter numbers, page numbers. A catalogue entry, a state PDF listing or a chapter file is not proof of the edition a particular learner or school uses (D024).

## 9. The eight-row crosswalk

The full 24-column worksheet is `docs/BOOK_CROSSWALK.csv` (eight rows, generated from the pack and tested against it). Reviewer, decision and date columns are **blank on purpose**: no reviewer has been named, and none is invented.

### 9.1 Item facts (CODE PROVES)

| Item | Concept | Correct option | Allowed misconception IDs (wrong options) | Everyday Odia (draft) | School Odia term (draft) | English term |
|---|---|---|---|---|---|---|
| EL01 | closed_circuit | B | CURRENT_ACCUMULATES; CURRENT_FLOWS_WITHOUT_CLOSED_PATH; CURRENT_CONSUMED_BY_COMPONENT | ତାର ମଝିରେ ଫାଙ୍କ ରହିଲେ ବିଦ୍ୟୁତ୍ ଚାଲିବାର ପୂରା ରାସ୍ତା ରହେ ନାହିଁ। | ଖୋଲା ପରିପଥ / ବନ୍ଦ ପରିପଥ | open circuit / closed circuit |
| EL02 | closed_circuit | A | BATTERY_INSTANTLY_EMPTY; CURRENT_STORED_IN_BULB; CURRENT_TURNS_INTO_AIR | ସ୍ୱିଚ୍ ଖୋଲିଲେ ବିଦ୍ୟୁତ୍ ଯିବାର ପଥ ଭାଙ୍ଗିଯାଏ, ତେଣୁ ବଲ୍ବ ନିଭିଯାଏ। | ଖୋଲା ପରିପଥ | open circuit / switch |
| EL03 | energy_transfer | B | ENERGY_DESTROYED; ENERGY_CREATED; ENERGY_HAS_NO_TRANSFER | ଶକ୍ତି ନଷ୍ଟ ହୁଏ ନାହିଁ; ଏହା ଅନ୍ୟ ରୂପକୁ ବଦଳେ କିମ୍ବା ଅନ୍ୟଠାରେ ପହଞ୍ଚେ। | ଶକ୍ତି ସ୍ଥାନାନ୍ତର | energy transfer |
| EL04 | energy_transfer | B | ENERGY_CREATED; ENERGY_DESTROYED; CURRENT_STORED_IN_COMPONENT | ପ୍ରତିରୋଧକ ଗରମ ହେଲେ ତାହାର ଅର୍ଥ କିଛି ଶକ୍ତି ତାପ ଭାବେ ଚାରିପାଖକୁ ଯାଉଛି। | ପ୍ରତିରୋଧକ / ତାପ ଶକ୍ତି | resistor / thermal energy |
| EL05 | ohms_law | B | CURRENT_INVERSE_TO_VOLTAGE; CURRENT_INDEPENDENT_OF_VOLTAGE; VOLTAGE_DOUBLES_RESISTANCE | ଭୋଲ୍ଟେଜ୍ ବଢ଼ିଲେ ଏବଂ ପ୍ରତିରୋଧ ସେହିପରି ରହିଲେ ଧାରା ମଧ୍ୟ ଅନୁପାତରେ ବଢ଼େ। | ଓମ୍‌ଙ୍କ ନିୟମ | Ohm’s law |
| EL06 | ohms_law | C | MULTIPLIES_VOLTAGE_AND_RESISTANCE; DIVIDES_RESISTANCE_BY_VOLTAGE; USES_RESISTANCE_AS_CURRENT | ଧାରା ହେଉଛି ଭୋଲ୍ଟେଜ୍‌କୁ ପ୍ରତିରୋଧରେ ଭାଗ କରି ମିଳୁଥିବା ମାନ। | ବିଦ୍ୟୁତ୍ ଧାରା; ବିଭବାନ୍ତର; ପ୍ରତିରୋଧ | current; potential difference; resistance |
| EL07 | resistance_combinations | C | ADDS_PARALLEL_RESISTANCES; EQUIVALENT_PARALLEL_EQUALS_ONE_BRANCH; PARALLEL_RESISTANCE_ALWAYS_ZERO | ସମାନ୍ତରାଳରେ ଆଉ ଏକ ପଥ ଯୋଡ଼ିଲେ ସମୁଦାୟ ପ୍ରତିରୋଧ ପ୍ରତ୍ୟେକ ଶାଖାର ପ୍ରତିରୋଧଠାରୁ କମ୍ ହୁଏ। | ସମାନ୍ତରାଳ ସଂଯୋଗ; ସମତୁଲ୍ୟ ପ୍ରତିରୋଧ | parallel connection; equivalent resistance |
| EL08 | resistance_combinations | D | TREATS_SERIES_AS_PARALLEL; MULTIPLIES_SERIES_RESISTANCES; USES_LARGEST_SERIES_RESISTOR_ONLY | ଶ୍ରେଣୀ ସଂଯୋଗରେ ପ୍ରତିରୋଧଗୁଡ଼ିକୁ ଯୋଗ କରାଯାଏ। | ଶ୍ରେଣୀ ସଂଯୋଗ; ସମତୁଲ୍ୟ ପ୍ରତିରୋଧ | series connection; equivalent resistance |

All Odia text is an unreviewed draft. The three-part terms are the team's draft; no teacher has confirmed any of them.

### 9.2 Fields that are the same for all eight rows today

| Field | Value now | Label |
|---|---|---|
| Board / pathway / class | BSE Odisha, Class X, General Science; pathway label (HSC or Madhyama) UNKNOWN from the syllabus PDF | SOURCE SAYS (board, class, subject); UNKNOWN (label) |
| Academic or exam year | Syllabus session 2026-27 (S1); the learner's exam year UNKNOWN | SOURCE SAYS / UNKNOWN |
| Official syllabus section | General Science > Physical Science > Electricity (ବିଦ୍ୟୁତ୍), one entry, no sub-topics; item-level outcome UNKNOWN | SOURCE SAYS / UNKNOWN |
| Exact book title as printed | UNKNOWN (the syllabus says only "Physical Science", ଭୌତିକ ବିଜ୍ଞାନ) | UNKNOWN |
| Publisher or authority | UNKNOWN | UNKNOWN |
| Edition, print year, language | UNKNOWN | UNKNOWN |
| Chapter number and title | UNKNOWN | UNKNOWN |
| Page or section | UNKNOWN | UNKNOWN |
| Question, explanation and remediation source | Original draft text written for this MVP with AI assistance; not copied from a textbook; similarity to printed exercises not checked by a person | TEAM CHOSE |
| Licence note | The text is this project's own draft. No textbook text, diagram, scan or answer key is in the pack, the app or the ZIP | CODE PROVES (no such files); TEAM CHOSE (policy) |
| Reviewer name and role | blank — not supplied | — |
| Science correctness / language / age and reading-level decisions and review date | blank — not supplied | — |
| Status | `UNREVIEWED_DRAFT` for all eight | CODE PROVES |

## 10. Copyright and licensing approach (TEAM CHOSE)

- Write original questions, distractors, explanations and remediation. Do not paste textbook pages, diagrams, scans or answer-key pages into the pack or the ZIP because a website lets anyone download them.
- Record title, edition, chapter and page **for review**, and give an official link rather than redistributing the book.
- A website's general licence does not prove the reuse terms of each uploaded book. The Odisha books' terms were not read (D028). ePathshala and NIOS terms were not re-read in this iteration (S5, S7).

## 11. What a reviewer must do to close this page

1. Hold a legitimately accessed copy of the Physical Science book the learner uses and record the exact printed title, publisher or authority, language/script, edition or print year and any ISBN.
2. Confirm the pathway name printed on the learner's own documents (HSC, Madhyama or another).
3. For each of EL01–EL08, record the chapter number and title and the page or section, and the syllabus outcome, in `docs/BOOK_CROSSWALK.csv`. Mark items that fall outside the prescribed scope.
4. Record your own name, role and date, and your science, language and reading-level decisions, using `docs/REVIEWER_GUIDE.md`. Code never promotes a status; `npm run check:content` only checks consistency.

## 12. Wording that is safe now

- Say: "Our topic is mapped at a high level to the BSE Odisha Class X General Science (Electricity) syllabus for 2026-27. Item-to-edition and page validation is pending a teacher."
- Do not say: the questions are syllabus-approved, curriculum-aligned or teacher-approved; that the pack follows a named edition; that Pathasetu works for CBSE, ICSE, NIOS or WBBSE learners; or that "HSC, not Madhyama" is a verified distinction; or that CHSE Odisha is a Class X board (it lists +2 and vocational syllabi only); or that ICSE is a separate board from CISCE.
