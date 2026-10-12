# Study Resource Page: Design

**Date:** 2026-10-11
**Status:** Approved in conversation, awaiting spec review
**Route:** `niallhighland.com/study`
**Branch:** `feat/study-resource-page` (from `feat/learning-styles-essay`, which carries the essay engine)

## Purpose

Turn the argument of the essay "Nobody is a visual learner" into something students use. The page is a showroom: interactive widgets let a student run small experiments on themselves and feel the evidence before reading the conclusion. The same widgets are the prototype for the Highland College study tools on VEND/AI (aitoolvending.com), which will add saving and tracking.

**Audience:** students first, with a section for parents and teachers. Copy uses Niall's real voice for this audience (see `docs/voice/niall-writing-persona.md`, student and parent register). No invented anecdotes.

**Success criteria**

1. A student can complete every widget on a phone in under five minutes each, with no account.
2. Each widget produces a result the student generated themselves, or is clearly labeled as an illustration from a model.
3. The logic layer can be copied into the VEND/AI repo unchanged and pass its own tests there.
4. No student data leaves the browser.

**Content source of truth:** `C:/Users/chigh/claude-projects/_research/reports/Validated study methods and learner profiles.md` and `content/essays/nobody-is-a-visual-learner.mdx`.

## Page structure

1. **Hero.** Title "How to actually study", a one-line case against learning styles, link to the essay.
2. **The engine.** Four moves (retrieve, space, explain, mix), one short paragraph each.
3. **The lab.** Five interactive widgets (below). The centerpiece.
4. **Five things worth knowing about yourself.** Self-check that returns support recommendations.
5. **Routines by subject.** The subject routine table from the essay, followed by the Routine Builder widget.
6. **For parents and teachers.** How to coach the method at home and in class.

The essay links to `/study`. The page is added to site navigation and `app/sitemap.ts`.

## Widgets

| Widget | Student action | What it demonstrates | Result type |
|---|---|---|---|
| Reread vs. Recall | Studies two short fact sets of 8 items each, rereading set A and self-testing on set B. Rates confidence for each set. Completes a 90-second distractor task. Takes a quiz on both sets. | Retrieval beats rereading, and confidence does not track recall (Roediger and Karpicke 2006; Knoll et al. 2017). | Own data |
| Cram vs. Space | Places a fixed number of study sessions on a two-week calendar before a test date. | The same total time spaced out yields higher retention on test day (Dunlosky et al. 2013; Cepeda et al. 2006). | Model illustration, labeled |
| Blocked vs. Mixed | Solves a blocked set of 6 short math problems, then a mixed set of 6. Timed and scored. | Mixed practice feels slower but trains method choice (Rohrer et al. 2020: 61% vs 38% a month later). | Own data plus the cited trial result |
| Confidence Check | Before each quiz inside the lab, predicts a score out of the item count. | Judgment of learning is an unreliable witness. | Own data, shown inside Reread vs. Recall and Blocked vs. Mixed rather than as a standalone widget |
| Routine Builder | Chooses subjects (from the routine table), a test date, and available hours per week. | Converts the method into a dated, spaced weekly plan. | Copyable text and a downloadable `.ics` calendar file |

Five-measures self-check (page section 4) is a short form of about ten questions across prior knowledge, reading, executive function, self-regulation and test anxiety. It returns support recommendations per area, matching the "What each difference changes" table in the essay. It never assigns a style and never diagnoses. When answers indicate persistent difficulty, it recommends a qualified evaluation.

## Architecture

Three layers, each with one job.

### `lib/study/` (logic)

Framework-free TypeScript. No imports from React, Next, or any site module, so VEND/AI can copy the folder unchanged. Strict mode, no `any`.

| Module | Responsibility | Key exports |
|---|---|---|
| `content.ts` | Fact sets, math problem templates, subject routine table, support recommendation text. Each item carries a `source` citation. | `FACT_SETS`, `SUBJECT_ROUTINES`, `SUPPORT_TEXT` |
| `recall.ts` | Score quizzes, compute prediction gap. | `scoreQuiz(answers, key)`, `predictionGap(predicted, actual)` |
| `spacing.ts` | Retention forecast. A stated model: each session sets retention to 1, retention decays exponentially, and each successive spaced session lengthens the decay constant. Parameters live in one exported constant with a comment naming the model as illustrative. | `forecastRetention(sessionDays, testDay)`, `retentionCurve(sessionDays, horizonDays)` |
| `practice.ts` | Generate blocked and mixed problem sets from templates with a seeded random source for repeatable tests; check answers. | `buildBlockedSet(seed)`, `buildMixedSet(seed)`, `checkAnswer(problem, answer)` |
| `planner.ts` | Subjects, test date, weekly hours, start date to a dated list of sessions applying spacing (each unit revisited after roughly 1, 3 and 7 days) and the subject routine for each session. | `buildPlan(input)`, `planToIcs(plan)`, `planToText(plan)` |
| `support.ts` | Self-check answers to per-area support level (`low`, `some`, `high`) and recommendation text; flags when an evaluation should be suggested. | `assessSupport(answers)` |
| `errors.ts` | Named errors for impossible input. | `StudyInputError` |

### `components/study/` (widgets)

One client component per widget: `RereadVsRecall.tsx`, `CramVsSpace.tsx`, `BlockedVsMixed.tsx`, `RoutineBuilder.tsx`, `SupportCheck.tsx`. Each is wrapped in the existing `DemoShell` (`components/primitives/DemoShell.tsx`) to match the site's demos, uses only design tokens from `styles/globals.css`, and calls only `lib/study/`.

### `app/study/page.tsx` (page)

Server component composing the six sections and the widgets. Static, with metadata and an Open Graph image following the existing `app/writing/[slug]/opengraph-image.tsx` pattern.

## Data flow

All state lives in React component state. No localStorage, no network calls, no analytics events containing answers. Routine Builder output leaves only through the student's own copy action or `.ics` download (a generated Blob, triggered by a click).

## Coaching doctrine

Written to `docs/study/coaching-doctrine.md` as part of phase 1. Shared by niallhighland.com and VEND/AI for all study copy and widget design.

1. **Show, then tell.** The student runs the experiment before reading the conclusion.
2. **Warn that it will feel harder.** Every effective method is introduced with the expectation that it feels worse while it works.
3. **Support, never labels.** Learner differences change the amount of help, never the method.
4. **Honest evidence.** Every claim links to its source. Model output is labeled as a model.
5. **Plan, check, adjust.** Every tool ends with a concrete next session the student can schedule.
6. **No diagnosis.** Persistent difficulty routes to a qualified evaluation, never to a verdict.

## Error handling

- Widgets validate input inline and show a plain message that names the problem and the fix (for example, "Pick a test date after today").
- `lib/study/` throws `StudyInputError` with a specific message for impossible input (test date before start date, zero weekly hours, empty subject list, malformed answers). Widgets catch it and render the message. No silent fallbacks.

## Testing

- **Unit tests:** add `vitest` as a dev dependency (approved 2026-10-11) with a `test` script. Cover scoring, prediction gap, forecast monotonicity (more spaced sessions never lower test-day retention), seeded problem generation, planner spacing intervals and date math, `.ics` output validity, and support assessment including the evaluation flag.
- **Browser verification:** each widget checked on the dev server at phone (375px) and desktop widths, light and dark, with no console errors.
- **Copy:** every page and widget string passes `ai_tell_lint.py` with zero findings.
- **Build:** `npm run typecheck`, `npm run test`, `npm run build` pass before each phase ships.

## Phases

Each phase ships independently to production.

1. Page shell, all six sections with static content, `lib/study/` foundation (`content`, `recall`, `errors`), vitest setup, Reread vs. Recall with Confidence Check, coaching doctrine doc, essay link, nav and sitemap entries.
2. Cram vs. Space and Blocked vs. Mixed (`spacing`, `practice`).
3. Five-measures self-check and Routine Builder (`support`, `planner`), and the parents and teachers section in final form.

## VEND/AI follow-on

Out of scope for this spec. After phase 3, a separate spec covers porting to VEND/AI: copy `lib/study/` and its tests unchanged, rebuild widget UI in VEND/AI's design system, and add accounts, saved plans and progress tracking there.

## Out of scope

Accounts, persistence, progress tracking, AI-generated content, teacher dashboards, and any student data on niallhighland.com.
