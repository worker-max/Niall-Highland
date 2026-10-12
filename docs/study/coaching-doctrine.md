# Study Coaching Doctrine

Shared by niallhighland.com (`/study`) and the VEND/AI study tools. Every study widget, page and piece of copy follows these rules. Content source of truth: `C:/Users/chigh/claude-projects/_research/reports/Validated study methods and learner profiles.md`.

## The six rules

1. **Show, then tell.** The student runs the experiment before reading the conclusion. Results come from their own answers wherever possible.
2. **Warn that it will feel harder.** Introduce every effective method with the expectation that it feels slower and messier while it works. Students judge effort as failure unless told otherwise.
3. **Support, never labels.** Learner differences (prior knowledge, reading skill, executive function, self-regulation, test anxiety) change how much help a student gets. They never change which method the student uses. Never assign a learning style.
4. **Honest evidence.** Every claim links to its source. Output from a model (for example a forecast memory curve) is labeled as an illustration. Gaps in the evidence are stated plainly.
5. **Plan, check, adjust.** Every tool ends with a concrete next study session the student can schedule, and a way to check whether it worked.
6. **No diagnosis.** Persistent difficulty despite good teaching routes to a qualified evaluation. No tool offers a verdict on dyslexia, ADHD or any condition.

## The core engine

Retrieve, space, explain, mix. These four moves are the method for every learner and every subject. Subjects change what is retrieved and practiced, never the engine.

## Data

niallhighland.com stores nothing about students. Saving, history and progress tracking live only in VEND/AI.

## Voice

Student and parent copy uses Niall's real voice (`docs/voice/niall-writing-persona.md`): direct, warm, a little irreverent, analogies over anecdotes. No em dashes. Every string passes `ai_tell_lint.py` with zero findings.

## Shared logic

`lib/study/` is framework-free TypeScript with its own tests. VEND/AI copies the folder unchanged and rebuilds only the UI in its own design system. Changes to the logic land in niallhighland.com first, then get copied across.
