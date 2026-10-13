# Reviewer guide and checklist (Electricity pack)

**Status today: all 8 items are `UNREVIEWED_DRAFT`. No reviewer has seen them. Nothing in this repository is approved content.**
Only a named, qualified person (a Class 10 BSE Odisha science teacher and an Odia-medium language reviewer, who may be the same person) can change that. Software here only checks that the files agree with each other; it cannot judge science or Odia.

## Files you will work in

| File | What it is | What you fill |
|---|---|---|
| `docs/CONTENT_REVIEW_WORKSHEET.csv` | One row per question (EL01–EL08) copied from `content/electricity-pack.json` | The last seven columns only: `reviewer_name`, four check columns, `review_decision`, `reviewer_notes` |
| `evaluation/EVALUATION_REVIEW_TEMPLATE.csv` | 47 English test explanations the team wrote, plus 24 blank rows | `reviewer_agrees`, `reviewer_label`, `reviewer_misconception_id`, `reviewer_notes`, `reviewer_name`, `review_date`; and author the blank Odia-script / Roman-Odia rows yourself |

Do not edit the copied columns (prompt, options, explanations, Odia drafts). If wording must change, write the corrected wording in `reviewer_notes`; the team edits the JSON pack, regenerates or updates the worksheet, and you re-review the changed row.

## Per-item checklist (worksheet)

Mark each of the four check columns `PASS`, `FAIL` or `NEEDS_CHANGES`. Leave `NOT REVIEWED` until you have actually checked it.

1. **Science correctness** (`science_accuracy`)
   - The keyed correct option is right for the Class 10 syllabus; every other option is wrong.
   - The English explanation and the remediation activity are correct and safe to do offline.
2. **Misconception validity** (`misconception_mapping`)
   - Each wrong option maps to a misconception a real learner plausibly holds.
   - The misconception descriptions match the option and are distinguishable from one another.
   - No option maps to a misconception that is not in the item's allowed list.
3. **Natural Odia and readability** (`odia_language_quality`)
   - Prompt, option text and explanation read naturally to an Odia-medium Class 10 learner; no machine-sounding phrasing.
   - Sentences are short enough to read on a phone; script renders correctly.
4. **School terminology and English equivalent** (`terminology_mapping`)
   - The everyday Odia phrase, the school Odia term and the English term all name the same concept, as in the textbook.
5. **Assessment design** (record in `reviewer_notes`; a problem here makes the decision `NEEDS_CHANGES`)
   - Exactly one option is correct.
   - No ambiguity in the question; distractors do not depend on trick wording.

Then set `review_decision` to one of `APPROVE`, `APPROVE_WITH_EDITS`, `NEEDS_CHANGES`, `REJECT`, and write your name in `reviewer_name`.
An approval is only valid when your name is present and all four checks are `PASS`. The checker rejects anything else.

## Evaluation template (47 English rows + blank rows)

- For each English row, `team_reference_label` is the team's own, unvalidated label. Set `reviewer_agrees` to `yes` or `no`. If `no`, give `reviewer_label` (`NONE`, `MISCONCEPTION`, `UNCERTAIN` or `INSUFFICIENT_EVIDENCE`) and, for a misconception, `reviewer_misconception_id` from that item's allowed list.
- Check that each category is what it claims to be: correct reasoning, genuine misconception, ambiguous, insufficient information.
- Blank rows are for Odia-script and Roman-Odia learner explanations. Write realistic examples a Class 10 learner might type; leave `team_reference_label` empty and give your own label. Do not copy text from a real child's work.
- Fill `reviewer_name` and `review_date` (as `YYYY-MM-DD`) on every row you touch. For your own Odia-script or Roman-Odia examples fill `item_id`, `option_id`, `explanation` and `reviewer_label` too (and `reviewer_misconception_id` when the label is `MISCONCEPTION`, using an ID from that item's allowed list). `npm run check:content` will then verify the rows are complete; it cannot verify who you are.

## What the team does after your review

1. Checks the files: `npm run check:content` (must print `OK`).
2. Updates the pack by hand, never by script: item `status` and `review.status` to `REVIEWED`, `review.reviewer` and `review.reviewedAt` to match your worksheet row, `bridge.status` likewise. The checker verifies the match.
3. Only then may the interface drop the draft label for that item, and only for what you approved.

## What a review does not prove

A passing review makes the content *reviewed*. It does not show that learners improve, that the model diagnoses Odia correctly, or that the app is accessible on real phones. Those are separate claims with separate evidence (`docs/BUILD_STATUS.md`).

## Do not

- Do not enter a name, date or approval for anyone else.
- Do not mark `PASS` for a check you did not do.
- Do not paste real student answers, names or school details into either file.
