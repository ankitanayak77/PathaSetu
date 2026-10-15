# Curriculum and learning-content audit

**Review date: 15 October 2026.** This is a file/content audit plus a limited check of official sources found online. It is not a subject-teacher or Odia-language review, and it does not establish syllabus compliance.

## Scope actually present in the app

| Area | What the repository contains | Evidence level | Required next action |
|---|---|---|---|
| Main diagnostic content | `content/electricity-pack.json` has eight Class 10 Electricity items; records are marked `UNREVIEWED_DRAFT`. | Direct repository inspection. | For each item, record official source, edition, page, learning outcome, concept, key/distractor reasoning and independent subject-review sign-off. |
| Broad catalog | `src/core/profiles.js` presents classes 1–10, multiple subjects and boards, textbook names/codes, summaries, formulas and sample questions. | Direct repository inspection only. The displayed metadata is not corroboration. | Treat every entry as a draft. Check each official board/book/code/edition and chapter before using; remove unsupported records or label them as unverified. |
| Odia text | Odia labels, explanations, translations and bridges are embedded in the draft catalog and main pack. | Not reviewed by a qualified Odia subject specialist in this workspace review. Mixed-script and spelling issues were already visible in the source. | A fluent Odia educator/community reviewer should assess script, dialect/register, terminology, age fit, correctness and accessibility. Store reviewer and version provenance. |
| Board/edition alignment | UI and data contain BSE Odisha, NCERT/CBSE and ICSE labels. | No item-to-syllabus/book/page crosswalk was established by this code review. | Create a per-item source crosswalk and treat each board/year as a separate curriculum release. Do not imply one set serves all boards. |
| Generated content | The draft-generation script can create `UNREVIEWED_DRAFT` files outside the app. | Output status is explicit; no generated item is automatically approved. | Keep a human review/publish workflow, immutable source provenance and correction history. |

## Independent source check

The official BSE Odisha site publishes a **2026–27** Class X General Science syllabus PDF. Its heading identifies the session, class and subject; it lists two prescribed books, and its Term II contents include Electricity under Physical Science. This supports a **high-level topic mapping** for the Class 10 Electricity demo to that BSE syllabus. It does **not** establish exact textbook chapter/page mapping, correctness of each Pathasetu question, or alignment to another board. The 2025–26 official PDF also exists, but it is not the current-year evidence used here. [BSE Odisha Class X syllabus 2026–27](https://bseodisha.nic.in/wp-content/uploads/2026/05/Subject_wise_syllabus_class_X_26_27.pdf)

On 15 October 2026, a further primary-source check found BSE Odisha's 2026–27 HSC Class IX syllabus and current IX/X break-up listings. The Class IX General Science PDF lists prescribed Physical Science and Life Science books and term-level topics. This confirms that current BSE documents exist for IX and X; it does not validate the app's multi-board, multi-subject catalog. No complete current BSE Odisha chapter inventory for Classes I–VIII was established in this check. [BSE Odisha Class IX 2026–27 syllabus PDF](https://bseodisha.nic.in/wp-content/uploads/2026/05/Subject_wise_syllabus_class_IX_26_27.pdf), [BSE Odisha current model-syllabus listings](https://bseodisha.nic.in/model_syllabus/), [BSE Odisha Class IX textbook and syllabus listings](https://bseodisha.nic.in/class_ix_text_books/)

The official CBSE academics page lists a 2026–27 curriculum for Classes IX and X, while NCERT's Grade IX Phase I syllabus page describes its 2026–27 syllabus as a **draft**. NCERT's online catalog also exposes 2026–27 textbook reprints, including books with chapter-level PDFs. Those sources need to be processed grade-by-grade, subject-by-subject, and matched to the exact CBSE release before they can support the app's catalog. They do not establish a complete current Class I–X syllabus by themselves. [CBSE curriculum 2026–27](https://cbseacademic.nic.in/curriculum_2027.html), [NCERT Grade IX Phase I draft syllabus](https://ncert.nic.in/pdf/announcement/Syllabus_Secondary_Stage_Phase_I_Grade_9_Part_2.pdf), [NCERT online textbooks and terms](https://ncert.nic.in/textbook.php/textbook/textbook/textbook/textbook.php)

For CISCE, the official site now lists an ICSE examination-year 2028 prescribed-textbooks appendix. This is secondary-stage evidence, not a Class I–VIII chapter map. “State Board Bridge” still does not name a specific board, so it cannot be verified as a single syllabus. [CISCE ICSE Examination Year 2028 prescribed-textbooks appendix](https://cisce.org/wp-content/uploads/2026/04/33.-Appendix-I-List-of-Prescribed-Textbooks.pdf)

NCERT's official online-textbook service provides chapter and full-book downloads, but its copyright notice says the books cannot be republished or redistributed as digital-content packages without permission. Therefore the removed prototype “download and ingest” claim must not be restored as a bulk textbook mirror. A future ingestion feature needs permitted source rights, citations, extraction quality checks, and an explicit policy for storing only derived material. [NCERT Online Textbooks and terms](https://ncert.nic.in/textbook.php/textbook/textbook/textbook/textbook.php)

NCERT's official exemplar page lists an Electricity unit among its Class X Science exemplars. That can help identify a possible topic cross-reference, but it does not prove the Pathasetu pack follows the current NCERT book, a particular board, or a local Odisha edition. [NCERT Exemplar Problems](https://ncert.nic.in/exemplar-problems.php?ln=hi)

## Correct product claim for the demo

“A local prototype with an unreviewed Class 10 Electricity question pack and draft Odia wording. It is not yet teacher-reviewed, language-reviewed, or verified against a current textbook edition.”

Do not claim “curriculum-aligned,” “official textbook corpus,” “works for classes 1–10,” “BSE/CBSE/ICSE approved,” or “high accuracy” until the evidence and review gates above are complete. For the broader roadmap, use separate content-ingestion, licensing, teacher workflow, and language/community-review phases; do not have an agent publish model-generated material directly to learners.
