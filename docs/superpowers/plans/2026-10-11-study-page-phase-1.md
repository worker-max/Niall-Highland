# Study Page Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `niallhighland.com/study` with all six sections, the framework-free `lib/study/` foundation, the Reread vs. Recall widget (with the built-in confidence check), and the shared coaching doctrine.

**Architecture:** Pure TypeScript logic in `lib/study/` (no React, Next, or `@/` imports) holds content, seeded randomness, quiz scoring and the experiment's state machine as a reducer. One client widget in `components/study/` renders that reducer inside the site's `DemoShell`. A server page at `app/study/page.tsx` composes the sections using existing essay components.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind v4 design tokens, TypeScript strict, vitest (new dev dependency).

**Spec:** `docs/superpowers/specs/2026-10-11-study-resource-page-design.md`

## Global Constraints

- Repo: `C:/Users/chigh/Niall-Highland`, branch `feat/study-resource-page`. npm, not yarn.
- `lib/study/` imports nothing from React, Next, or any `@/` path. Relative imports between its own files only.
- TypeScript strict, no `any`, no implicit returns on non-void functions.
- No student data leaves the browser: no localStorage, no fetch, no analytics events with answers.
- All page and widget copy: no em dashes, en dashes or `--`; passes `python C:/Users/chigh/claude-projects/toolbox/writing-lint/ai_tell_lint.py <file>` with 0 findings. Niall's student/parent voice, no invented anecdotes.
- Styling uses only tokens from `styles/globals.css` (`--accent`, `--text`, `--text-muted`, `--text-faint`, `--border`, `--surface`, `--surface-raised`, `--space-*`, `--text-*`).
- `next-mdx-remote` drops array/object props, so essay components take string props only.
- Commit prefixes `feat:` / `fix:` / `chore:` / `docs:` / `test:`; every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Deploy is `vercel deploy --prod --yes --cwd C:/Users/chigh/Niall-Highland` (CLI, not git).

## Review Focus

1. A student taps a different option for a question they already answered: the new choice replaces the old one, never a duplicate answer. (Task 3 test: "answer replaces a previous choice")
2. A student types an out-of-range or blank prediction (9, -1, 2.5, NaN): it is ignored and Continue stays disabled. (Task 3 test: "predict ignores invalid values")
3. A student taps "See my results" before answering every question: nothing happens until all 16 are answered. (Task 3 test: "quiz cannot finish with unanswered items")
4. A student restarts halfway through: every prediction and answer is cleared and a new set order is drawn. (Task 3 test: "restart clears everything")
5. The two fact sets share an answer string, so a quiz option would be ambiguous: answers must be unique across both sets. (Task 2 test: "answers are unique across both sets")

---

## File Structure

| File | Responsibility |
|---|---|
| `vitest.config.ts` | Test runner config (node environment, `lib/**/*.test.ts`). |
| `lib/study/errors.ts` | `StudyInputError`. |
| `lib/study/random.ts` | Seeded RNG and shuffle, so quizzes are repeatable in tests. |
| `lib/study/content.ts` | Fact sets, timings, subject routines, experiment sources, shared types. |
| `lib/study/recall.ts` | Quiz building and scoring, prediction gap. |
| `lib/study/recallSession.ts` | Reread vs. Recall state machine (reducer) and results summary. |
| `lib/study/__tests__/*.test.ts` | Unit tests for the above. |
| `components/study/RereadVsRecall.tsx` | Client widget rendering the session reducer. |
| `app/study/page.tsx` | The six-section page. |
| `app/study/opengraph-image.tsx` | Social card. |
| `components/chrome/Nav.tsx`, `components/chrome/Footer.tsx`, `app/sitemap.ts` | Add the Study link and route. |
| `content/essays/nobody-is-a-visual-learner.mdx` | Link to `/study`. |
| `docs/study/coaching-doctrine.md` | Shared coaching rules for Niall's site and VEND/AI. |

---

### Task 1: Test runner, errors and seeded randomness

**Files:**
- Modify: `package.json` (devDependencies, scripts)
- Create: `vitest.config.ts`
- Create: `lib/study/errors.ts`
- Create: `lib/study/random.ts`
- Test: `lib/study/__tests__/random.test.ts`

**Interfaces:**
- Produces: `class StudyInputError extends Error`; `createRng(seed: number): () => number` (returns floats in [0, 1)); `shuffle<T>(items: readonly T[], rng: () => number): T[]` (new array, input untouched).

- [ ] **Step 1: Install vitest**

Run: `npm --prefix C:/Users/chigh/Niall-Highland install --save-dev vitest@3.2.4`
Expected: `package.json` gains `"vitest": "3.2.4"` (or `^3.2.4`) under devDependencies.

- [ ] **Step 2: Add the test script**

In `package.json` `"scripts"`, add after `"typecheck"`:

```json
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Write the failing test**

`lib/study/__tests__/random.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createRng, shuffle } from "../random";

describe("createRng", () => {
  it("returns the same sequence for the same seed", () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("returns floats in [0, 1)", () => {
    const rng = createRng(7);
    for (let i = 0; i < 1000; i += 1) {
      const n = rng();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it("differs across seeds", () => {
    expect(createRng(1)()).not.toEqual(createRng(2)());
  });
});

describe("shuffle", () => {
  it("keeps every item exactly once and leaves the input untouched", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8] as const;
    const out = shuffle(input, createRng(3));
    expect([...out].sort()).toEqual([...input].sort());
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("is repeatable for a seed", () => {
    const items = ["a", "b", "c", "d", "e"];
    expect(shuffle(items, createRng(9))).toEqual(shuffle(items, createRng(9)));
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm --prefix C:/Users/chigh/Niall-Highland test`
Expected: FAIL, cannot resolve `../random`.

- [ ] **Step 6: Implement `errors.ts` and `random.ts`**

`lib/study/errors.ts`:

```ts
/** Thrown when study logic receives input it cannot act on. The message is shown to the student. */
export class StudyInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudyInputError";
  }
}
```

`lib/study/random.ts`:

```ts
/** Mulberry32: small, fast, seeded PRNG. Deterministic so quizzes and tests are repeatable. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle into a new array. */
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm --prefix C:/Users/chigh/Niall-Highland test`
Expected: PASS (5 tests).

- [ ] **Step 8: Commit**

```bash
git -C C:/Users/chigh/Niall-Highland add package.json package-lock.json vitest.config.ts lib/study/errors.ts lib/study/random.ts lib/study/__tests__/random.test.ts
git -C C:/Users/chigh/Niall-Highland commit -m "chore: add vitest and seeded randomness for study logic" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Study content and quiz scoring

**Files:**
- Create: `lib/study/content.ts`
- Create: `lib/study/recall.ts`
- Test: `lib/study/__tests__/content.test.ts`, `lib/study/__tests__/recall.test.ts`

**Interfaces:**
- Consumes: `StudyInputError`, `createRng`, `shuffle` (Task 1).
- Produces:
  - `type SetId = "harbor" | "orchard"`
  - `interface Fact { id: string; statement: string; cue: string; answer: string; distractors: readonly [string, string, string] }`
  - `interface FactSet { id: SetId; title: string; facts: readonly Fact[] }`
  - `interface SourceRef { label: string; url: string }`
  - `interface SubjectRoutine { subject: string; routine: string; why: string; source: string }`
  - `FACTS_PER_SET = 8`, `STUDY_SECONDS = 60`, `DISTRACT_SECONDS = 90`
  - `FACT_SETS: Readonly<Record<SetId, FactSet>>`, `SUBJECT_ROUTINES: readonly SubjectRoutine[]`, `EXPERIMENT_SOURCES: readonly SourceRef[]`
  - `interface QuizItem { factId: string; setId: SetId; cue: string; options: readonly string[] }`
  - `interface QuizScore { correct: number; total: number; percent: number }`
  - `buildQuiz(sets: readonly FactSet[], seed: number): QuizItem[]`
  - `scoreQuiz(answers: Readonly<Record<string, string>>, set: FactSet): QuizScore`
  - `predictionGap(predicted: number, actual: number): number` (predicted minus actual)

- [ ] **Step 1: Write the failing content test**

`lib/study/__tests__/content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { FACT_SETS, FACTS_PER_SET, SUBJECT_ROUTINES } from "../content";

const sets = Object.values(FACT_SETS);

describe("FACT_SETS", () => {
  it("has two sets of FACTS_PER_SET facts each", () => {
    expect(sets).toHaveLength(2);
    for (const set of sets) expect(set.facts).toHaveLength(FACTS_PER_SET);
  });

  it("uses unique fact ids across both sets", () => {
    const ids = sets.flatMap((s) => s.facts.map((f) => f.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("answers are unique across both sets", () => {
    const answers = sets.flatMap((s) => s.facts.map((f) => f.answer.toLowerCase()));
    expect(new Set(answers).size).toBe(answers.length);
  });

  it("gives every fact three distractors that differ from the answer and each other", () => {
    for (const fact of sets.flatMap((s) => s.facts)) {
      const options = [fact.answer, ...fact.distractors].map((o) => o.toLowerCase());
      expect(new Set(options).size).toBe(4);
    }
  });

  it("states each answer inside its statement", () => {
    for (const fact of sets.flatMap((s) => s.facts)) {
      expect(fact.statement.toLowerCase()).toContain(fact.answer.toLowerCase());
    }
  });
});

describe("SUBJECT_ROUTINES", () => {
  it("covers the eight subjects from the essay, each with a source", () => {
    expect(SUBJECT_ROUTINES).toHaveLength(8);
    for (const r of SUBJECT_ROUTINES) expect(r.source.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Write the failing recall test**

`lib/study/__tests__/recall.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { FACT_SETS } from "../content";
import { StudyInputError } from "../errors";
import { buildQuiz, predictionGap, scoreQuiz } from "../recall";

const harbor = FACT_SETS.harbor;
const orchard = FACT_SETS.orchard;

function answersFor(correctCount: number): Record<string, string> {
  return Object.fromEntries(
    harbor.facts.map((f, i) => [f.id, i < correctCount ? f.answer : f.distractors[0]]),
  );
}

describe("buildQuiz", () => {
  it("includes every fact from every set once, with four options containing the answer", () => {
    const quiz = buildQuiz([harbor, orchard], 11);
    expect(quiz).toHaveLength(16);
    expect(new Set(quiz.map((q) => q.factId)).size).toBe(16);
    for (const item of quiz) {
      const fact = [...harbor.facts, ...orchard.facts].find((f) => f.id === item.factId);
      expect(item.options).toHaveLength(4);
      expect(item.options).toContain(fact?.answer);
    }
  });

  it("is repeatable for a seed and varies across seeds", () => {
    const a = buildQuiz([harbor, orchard], 5).map((q) => q.factId);
    expect(buildQuiz([harbor, orchard], 5).map((q) => q.factId)).toEqual(a);
    expect(buildQuiz([harbor, orchard], 6).map((q) => q.factId)).not.toEqual(a);
  });
});

describe("scoreQuiz", () => {
  it("counts correct answers for one set", () => {
    expect(scoreQuiz(answersFor(6), harbor)).toEqual({ correct: 6, total: 8, percent: 75 });
  });

  it("ignores answers belonging to the other set", () => {
    const answers = { ...answersFor(8), [orchard.facts[0]!.id]: "anything" };
    expect(scoreQuiz(answers, harbor).correct).toBe(8);
  });

  it("throws when a fact in the set has no answer", () => {
    const answers = answersFor(8);
    delete answers[harbor.facts[3]!.id];
    expect(() => scoreQuiz(answers, harbor)).toThrow(StudyInputError);
  });
});

describe("predictionGap", () => {
  it("returns predicted minus actual", () => {
    expect(predictionGap(7, 4)).toBe(3);
    expect(predictionGap(2, 6)).toBe(-4);
  });

  it("rejects negative or fractional counts", () => {
    expect(() => predictionGap(-1, 3)).toThrow(StudyInputError);
    expect(() => predictionGap(2.5, 3)).toThrow(StudyInputError);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm --prefix C:/Users/chigh/Niall-Highland test`
Expected: FAIL, cannot resolve `../content` and `../recall`.

- [ ] **Step 4: Implement `content.ts`**

```ts
/**
 * Study content shared by niallhighland.com and VEND/AI. Framework-free:
 * no React, Next or site imports. The two fact sets describe made-up places
 * so no student starts with prior knowledge of either.
 */

export type SetId = "harbor" | "orchard";

export interface Fact {
  id: string;
  /** Sentence shown during rereading. Contains the answer. */
  statement: string;
  /** Question shown on flashcards and in the quiz. */
  cue: string;
  answer: string;
  distractors: readonly [string, string, string];
}

export interface FactSet {
  id: SetId;
  title: string;
  facts: readonly Fact[];
}

export interface SourceRef {
  label: string;
  url: string;
}

export interface SubjectRoutine {
  subject: string;
  routine: string;
  why: string;
  source: string;
}

export const FACTS_PER_SET = 8;
export const STUDY_SECONDS = 60;
export const DISTRACT_SECONDS = 90;

export const FACT_SETS: Readonly<Record<SetId, FactSet>> = {
  harbor: {
    id: "harbor",
    title: "Port Veller",
    facts: [
      { id: "h1", statement: "The lighthouse in Port Veller is painted green.", cue: "What color is the Port Veller lighthouse?", answer: "Green", distractors: ["Red", "White", "Blue"] },
      { id: "h2", statement: "Port Veller's main export is kelp.", cue: "What is Port Veller's main export?", answer: "Kelp", distractors: ["Salt", "Timber", "Wool"] },
      { id: "h3", statement: "The harbor wall was finished in 1874.", cue: "When was the harbor wall finished?", answer: "1874", distractors: ["1792", "1915", "1838"] },
      { id: "h4", statement: "The oldest fishing boat in the harbor is called the Marigold.", cue: "What is the oldest fishing boat called?", answer: "Marigold", distractors: ["Seraphine", "Kestrel", "Dolores"] },
      { id: "h5", statement: "Seven bridges cross the river through town.", cue: "How many bridges cross the river?", answer: "Seven", distractors: ["Three", "Five", "Nine"] },
      { id: "h6", statement: "The town festival celebrates the first herring catch of the year.", cue: "What does the town festival celebrate?", answer: "The first herring catch", distractors: ["The founding of the town", "The end of winter", "A royal visit"] },
      { id: "h7", statement: "The town bell was cast from a ship's anchor.", cue: "What was the town bell made from?", answer: "A ship's anchor", distractors: ["A cannon", "Church silver", "A railway rail"] },
      { id: "h8", statement: "The harbor master holds the title Warden of the Tides.", cue: "What is the harbor master's title?", answer: "Warden of the Tides", distractors: ["Keeper of the Quay", "Lord of the Harbor", "Captain of the Port"] },
    ],
  },
  orchard: {
    id: "orchard",
    title: "Calder Valley",
    facts: [
      { id: "o1", statement: "Calder Valley is famous for an apple called the Russet Queen.", cue: "What apple is Calder Valley famous for?", answer: "Russet Queen", distractors: ["Golden Calder", "Red Baron", "Winter Pearl"] },
      { id: "o2", statement: "The valley holds its blossom festival in May.", cue: "In which month is the blossom festival?", answer: "May", distractors: ["March", "June", "August"] },
      { id: "o3", statement: "The river running through the valley is the Ossel.", cue: "What is the valley's river called?", answer: "The Ossel", distractors: ["The Brannock", "The Wey", "The Lune"] },
      { id: "o4", statement: "Orchard owners scare birds away with brass wind chimes.", cue: "What do orchard owners use to scare birds?", answer: "Brass wind chimes", distractors: ["Scarecrows", "Painted owls", "Bonfire smoke"] },
      { id: "o5", statement: "Twenty-two farms belong to the valley cooperative.", cue: "How many farms are in the cooperative?", answer: "Twenty-two", distractors: ["Twelve", "Thirty", "Forty-one"] },
      { id: "o6", statement: "The cider press is powered by a water wheel.", cue: "What powers the cider press?", answer: "A water wheel", distractors: ["A horse", "A steam engine", "Wind sails"] },
      { id: "o7", statement: "The oldest tree in the valley is nicknamed Old Sorrow.", cue: "What is the oldest tree's nickname?", answer: "Old Sorrow", distractors: ["Grandfather Oak", "The Duchess", "Long Tom"] },
      { id: "o8", statement: "The valley railway closed in 1961.", cue: "When did the valley railway close?", answer: "1961", distractors: ["1902", "1948", "1987"] },
    ],
  },
};

export const EXPERIMENT_SOURCES: readonly SourceRef[] = [
  { label: "Roediger & Karpicke (2006), the testing effect", url: "https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x" },
  { label: "Knoll et al. (2017), preference versus recall", url: "https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/bjop.12214" },
  { label: "Dunlosky et al. (2013), ranking study techniques", url: "https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html" },
];

export const SUBJECT_ROUTINES: readonly SubjectRoutine[] = [
  { subject: "Math", routine: "Mixed review sets including older problem types; worked example, then partial, then blank; error log with a redo a few days later", why: "Math is choosing the right method. Mixed practice is the only way to practice choosing.", source: "Rohrer et al. (2020); IES algebra practice guide" },
  { subject: "Biology", routine: "Self-quiz after each class; redraw key diagrams from memory and explain them aloud; concept map from memory, then check notes", why: "Biology is mechanisms and structures. You understand a process when you can rebuild it from nothing.", source: "McDaniel et al. (2011); Schroeder et al. concept-map meta-analysis" },
  { subject: "Chemistry & physics", routine: "The biology routine for concepts, plus the math routine for problem sets", why: "Half explanation, half calculation. Each half needs its own practice.", source: "Worked-example and testing-effect research" },
  { subject: "English & essays", routine: "After reading, a summary plus two questions from memory; planned and revised essays against the rubric; timed essays near exams", why: "Writing is a skill. Skills grow through practice and feedback, not rereading.", source: "Graham & Perin (2007), Writing Next" },
  { subject: "History", routine: "Spaced flashcards for facts; cause-and-effect chains from memory; sourcing practice with document sets; timed source essays", why: "History is argument from evidence. Students must practice interrogating sources.", source: "Wineburg (1991); Reisman (2012)" },
  { subject: "World languages", routine: "Daily spaced flashcards in both directions; daily listening, reading and speaking; memory images only for stubborn words", why: "Language is retrieval under time pressure. Output is the test, so output is the practice.", source: "Secondary-school spacing studies" },
  { subject: "Computer science", routine: "Trace worked code by hand; rearrange scrambled code into working order; then write your own", why: "Code is read before it is written. Tracing builds the mental model.", source: "Parsons-problem research, mostly undergraduate" },
  { subject: "Exams (SAT, AP, IB)", routine: "Cumulative spaced review from early in the year; full-length timed practice in the real format; error log sorted by cause", why: "The exam tests retrieval under real conditions. Rehearse those conditions.", source: "Coaching and testing-effect literature" },
];
```

- [ ] **Step 5: Implement `recall.ts`**

```ts
import type { FactSet, SetId } from "./content";
import { StudyInputError } from "./errors";
import { createRng, shuffle } from "./random";

export interface QuizItem {
  factId: string;
  setId: SetId;
  cue: string;
  options: readonly string[];
}

export interface QuizScore {
  correct: number;
  total: number;
  percent: number;
}

/** Every fact from every set, interleaved, with shuffled options. Deterministic for a seed. */
export function buildQuiz(sets: readonly FactSet[], seed: number): QuizItem[] {
  const rng = createRng(seed);
  const items = sets.flatMap((set) =>
    set.facts.map((fact) => ({
      factId: fact.id,
      setId: set.id,
      cue: fact.cue,
      options: shuffle([fact.answer, ...fact.distractors], rng),
    })),
  );
  return shuffle(items, rng);
}

/** Score one set's facts. Answers for other sets are ignored; a missing answer is an error. */
export function scoreQuiz(answers: Readonly<Record<string, string>>, set: FactSet): QuizScore {
  let correct = 0;
  for (const fact of set.facts) {
    const choice = answers[fact.id];
    if (choice === undefined) {
      throw new StudyInputError(`Missing an answer for "${fact.cue}".`);
    }
    if (choice === fact.answer) correct += 1;
  }
  const total = set.facts.length;
  return { correct, total, percent: Math.round((correct / total) * 100) };
}

/** How far a prediction overshot (positive) or undershot (negative) the real score. */
export function predictionGap(predicted: number, actual: number): number {
  for (const n of [predicted, actual]) {
    if (!Number.isInteger(n) || n < 0) {
      throw new StudyInputError("Scores must be whole numbers of zero or more.");
    }
  }
  return predicted - actual;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm --prefix C:/Users/chigh/Niall-Highland test`
Expected: PASS (all content, recall and random tests).

- [ ] **Step 7: Commit**

```bash
git -C C:/Users/chigh/Niall-Highland add lib/study/content.ts lib/study/recall.ts lib/study/__tests__/content.test.ts lib/study/__tests__/recall.test.ts
git -C C:/Users/chigh/Niall-Highland commit -m "feat: add study fact sets, subject routines and quiz scoring" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Reread vs. Recall session state machine

**Files:**
- Create: `lib/study/recallSession.ts`
- Test: `lib/study/__tests__/recallSession.test.ts`

**Interfaces:**
- Consumes: `FACT_SETS`, `FACTS_PER_SET`, `FactSet`, `SetId` (Task 2); `scoreQuiz`, `predictionGap`, `QuizScore` (Task 2); `createRng`, `StudyInputError` (Task 1).
- Produces:
  - `type Condition = "reread" | "recall"`
  - `type SessionPhase = "intro" | "study-1" | "study-2" | "predict" | "distract" | "quiz" | "results"`
  - `interface SessionState { phase: SessionPhase; seed: number; order: readonly [Condition, Condition]; setFor: Readonly<Record<Condition, SetId>>; predictions: Readonly<Record<Condition, number | null>>; answers: Readonly<Record<string, string>> }`
  - `type SessionAction = { type: "start"; seed: number } | { type: "next" } | { type: "predict"; condition: Condition; value: number } | { type: "answer"; factId: string; choice: string } | { type: "restart"; seed: number }`
  - `createSession(seed: number): SessionState`
  - `sessionReducer(state: SessionState, action: SessionAction): SessionState`
  - `studyStep(state: SessionState): { condition: Condition; set: FactSet } | null`
  - `canAdvance(state: SessionState): boolean`
  - `interface ConditionResult { condition: Condition; set: FactSet; predicted: number; score: QuizScore; gap: number }`
  - `summarizeSession(state: SessionState): readonly [ConditionResult, ConditionResult]` (reread first, recall second)

- [ ] **Step 1: Write the failing test**

`lib/study/__tests__/recallSession.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { FACT_SETS } from "../content";
import { StudyInputError } from "../errors";
import {
  canAdvance,
  createSession,
  sessionReducer,
  studyStep,
  summarizeSession,
  type SessionAction,
  type SessionState,
} from "../recallSession";

function run(state: SessionState, ...actions: SessionAction[]): SessionState {
  return actions.reduce(sessionReducer, state);
}

const allFacts = [...FACT_SETS.harbor.facts, ...FACT_SETS.orchard.facts];

function toQuiz(): SessionState {
  return run(
    createSession(1),
    { type: "start", seed: 4 },
    { type: "next" },
    { type: "next" },
    { type: "predict", condition: "reread", value: 6 },
    { type: "predict", condition: "recall", value: 5 },
    { type: "next" },
    { type: "next" },
  );
}

function answerAll(state: SessionState, correct: (factId: string) => boolean): SessionState {
  return allFacts.reduce(
    (s, f) => sessionReducer(s, { type: "answer", factId: f.id, choice: correct(f.id) ? f.answer : f.distractors[0] }),
    state,
  );
}

describe("createSession", () => {
  it("starts at intro with one set per condition", () => {
    const s = createSession(1);
    expect(s.phase).toBe("intro");
    expect(new Set(Object.values(s.setFor)).size).toBe(2);
    expect(new Set(s.order).size).toBe(2);
  });

  it("counterbalances order and set assignment across seeds", () => {
    const orders = new Set<string>();
    const sets = new Set<string>();
    for (let seed = 1; seed <= 40; seed += 1) {
      const s = createSession(seed);
      orders.add(s.order.join());
      sets.add(s.setFor.reread);
    }
    expect(orders.size).toBe(2);
    expect(sets.size).toBe(2);
  });
});

describe("sessionReducer flow", () => {
  it("moves intro to study-1 to study-2 to predict", () => {
    const s = run(createSession(1), { type: "start", seed: 2 }, { type: "next" }, { type: "next" });
    expect(s.phase).toBe("predict");
  });

  it("serves each condition exactly once in the study phases", () => {
    const s1 = run(createSession(1), { type: "start", seed: 2 });
    const s2 = sessionReducer(s1, { type: "next" });
    const conditions = [studyStep(s1)?.condition, studyStep(s2)?.condition];
    expect(new Set(conditions)).toEqual(new Set(["reread", "recall"]));
    expect(studyStep(createSession(1))).toBeNull();
  });

  it("blocks predict -> distract until both predictions exist", () => {
    let s = run(createSession(1), { type: "start", seed: 2 }, { type: "next" }, { type: "next" });
    s = sessionReducer(s, { type: "predict", condition: "reread", value: 4 });
    expect(canAdvance(s)).toBe(false);
    expect(sessionReducer(s, { type: "next" }).phase).toBe("predict");
    s = sessionReducer(s, { type: "predict", condition: "recall", value: 3 });
    expect(canAdvance(s)).toBe(true);
    expect(sessionReducer(s, { type: "next" }).phase).toBe("distract");
  });

  it("predict ignores invalid values", () => {
    const s = run(createSession(1), { type: "start", seed: 2 }, { type: "next" }, { type: "next" });
    for (const value of [9, -1, 2.5, Number.NaN]) {
      expect(sessionReducer(s, { type: "predict", condition: "reread", value }).predictions.reread).toBeNull();
    }
  });

  it("quiz cannot finish with unanswered items", () => {
    let s = toQuiz();
    expect(s.phase).toBe("quiz");
    s = sessionReducer(s, { type: "answer", factId: "h1", choice: "Green" });
    expect(canAdvance(s)).toBe(false);
    expect(sessionReducer(s, { type: "next" }).phase).toBe("quiz");
    s = answerAll(s, () => true);
    expect(sessionReducer(s, { type: "next" }).phase).toBe("results");
  });

  it("answer replaces a previous choice", () => {
    let s = toQuiz();
    s = sessionReducer(s, { type: "answer", factId: "h1", choice: "Red" });
    s = sessionReducer(s, { type: "answer", factId: "h1", choice: "Green" });
    expect(Object.keys(s.answers)).toEqual(["h1"]);
    expect(s.answers.h1).toBe("Green");
  });

  it("ignores answers for unknown facts and answers outside the quiz", () => {
    const quiz = toQuiz();
    expect(sessionReducer(quiz, { type: "answer", factId: "zz", choice: "x" }).answers).toEqual({});
    const intro = createSession(1);
    expect(sessionReducer(intro, { type: "answer", factId: "h1", choice: "Green" })).toBe(intro);
  });

  it("restart clears everything", () => {
    const done = sessionReducer(answerAll(toQuiz(), () => true), { type: "next" });
    const fresh = sessionReducer(done, { type: "restart", seed: 99 });
    expect(fresh).toEqual(createSession(99));
  });
});

describe("summarizeSession", () => {
  it("scores each condition against its own set and computes the prediction gap", () => {
    let s = toQuiz();
    const rereadSet = FACT_SETS[s.setFor.reread];
    s = answerAll(s, (id) => !rereadSet.facts.some((f) => f.id === id));
    s = sessionReducer(s, { type: "next" });
    const [reread, recall] = summarizeSession(s);
    expect(reread.condition).toBe("reread");
    expect(reread.score.correct).toBe(0);
    expect(reread.gap).toBe(6);
    expect(recall.score.correct).toBe(8);
    expect(recall.gap).toBe(-3);
  });

  it("throws before results", () => {
    expect(() => summarizeSession(toQuiz())).toThrow(StudyInputError);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix C:/Users/chigh/Niall-Highland test`
Expected: FAIL, cannot resolve `../recallSession`.

- [ ] **Step 3: Implement `recallSession.ts`**

```ts
import { FACT_SETS, FACTS_PER_SET, type FactSet, type SetId } from "./content";
import { StudyInputError } from "./errors";
import { createRng } from "./random";
import { predictionGap, scoreQuiz, type QuizScore } from "./recall";

export type Condition = "reread" | "recall";

export type SessionPhase = "intro" | "study-1" | "study-2" | "predict" | "distract" | "quiz" | "results";

export interface SessionState {
  phase: SessionPhase;
  seed: number;
  order: readonly [Condition, Condition];
  setFor: Readonly<Record<Condition, SetId>>;
  predictions: Readonly<Record<Condition, number | null>>;
  answers: Readonly<Record<string, string>>;
}

export type SessionAction =
  | { type: "start"; seed: number }
  | { type: "next" }
  | { type: "predict"; condition: Condition; value: number }
  | { type: "answer"; factId: string; choice: string }
  | { type: "restart"; seed: number };

export interface ConditionResult {
  condition: Condition;
  set: FactSet;
  predicted: number;
  score: QuizScore;
  gap: number;
}

const ALL_FACT_IDS = new Set(Object.values(FACT_SETS).flatMap((s) => s.facts.map((f) => f.id)));
const TOTAL_FACTS = ALL_FACT_IDS.size;

const NEXT_PHASE: Readonly<Record<SessionPhase, SessionPhase>> = {
  intro: "study-1",
  "study-1": "study-2",
  "study-2": "predict",
  predict: "distract",
  distract: "quiz",
  quiz: "results",
  results: "results",
};

/** Seed decides which condition comes first and which set each condition uses (counterbalancing). */
export function createSession(seed: number): SessionState {
  const rng = createRng(seed);
  const rereadFirst = rng() < 0.5;
  const harborForReread = rng() < 0.5;
  return {
    phase: "intro",
    seed,
    order: rereadFirst ? ["reread", "recall"] : ["recall", "reread"],
    setFor: harborForReread ? { reread: "harbor", recall: "orchard" } : { reread: "orchard", recall: "harbor" },
    predictions: { reread: null, recall: null },
    answers: {},
  };
}

export function canAdvance(state: SessionState): boolean {
  if (state.phase === "predict") {
    return state.predictions.reread !== null && state.predictions.recall !== null;
  }
  if (state.phase === "quiz") {
    return Object.keys(state.answers).length === TOTAL_FACTS;
  }
  return state.phase !== "results";
}

function isValidPrediction(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= FACTS_PER_SET;
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "start":
      return { ...createSession(action.seed), phase: "study-1" };
    case "restart":
      return createSession(action.seed);
    case "next":
      return canAdvance(state) ? { ...state, phase: NEXT_PHASE[state.phase] } : state;
    case "predict":
      if (state.phase !== "predict" || !isValidPrediction(action.value)) return state;
      return { ...state, predictions: { ...state.predictions, [action.condition]: action.value } };
    case "answer":
      if (state.phase !== "quiz" || !ALL_FACT_IDS.has(action.factId)) return state;
      return { ...state, answers: { ...state.answers, [action.factId]: action.choice } };
  }
}

export function studyStep(state: SessionState): { condition: Condition; set: FactSet } | null {
  if (state.phase !== "study-1" && state.phase !== "study-2") return null;
  const condition = state.order[state.phase === "study-1" ? 0 : 1];
  return { condition, set: FACT_SETS[state.setFor[condition]] };
}

function resultFor(state: SessionState, condition: Condition): ConditionResult {
  const predicted = state.predictions[condition];
  if (predicted === null) {
    throw new StudyInputError("A prediction is missing.");
  }
  const set = FACT_SETS[state.setFor[condition]];
  const score = scoreQuiz(state.answers, set);
  return { condition, set, predicted, score, gap: predictionGap(predicted, score.correct) };
}

export function summarizeSession(state: SessionState): readonly [ConditionResult, ConditionResult] {
  if (state.phase !== "results") {
    throw new StudyInputError("Results are ready once the quiz is finished.");
  }
  return [resultFor(state, "reread"), resultFor(state, "recall")];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm --prefix C:/Users/chigh/Niall-Highland test`
Expected: PASS (all suites).

- [ ] **Step 5: Typecheck**

Run: `npm --prefix C:/Users/chigh/Niall-Highland run typecheck`
Expected: no errors. (The exhaustive `switch` returns on every action type, so `noImplicitReturns` is satisfied.)

- [ ] **Step 6: Commit**

```bash
git -C C:/Users/chigh/Niall-Highland add lib/study/recallSession.ts lib/study/__tests__/recallSession.test.ts
git -C C:/Users/chigh/Niall-Highland commit -m "feat: add reread vs recall session state machine" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Reread vs. Recall widget

**Files:**
- Create: `components/study/RereadVsRecall.tsx`

**Interfaces:**
- Consumes: `createSession`, `sessionReducer`, `studyStep`, `canAdvance`, `summarizeSession`, `Condition` (Task 3); `FACT_SETS`, `FACTS_PER_SET`, `STUDY_SECONDS`, `DISTRACT_SECONDS`, `EXPERIMENT_SOURCES`, `Fact` (Task 2); `buildQuiz` (Task 2); `DemoShell` from `@/components/primitives/DemoShell` (props: `label: string; title?: ReactNode; description?: ReactNode; footer?: ReactNode; variant?: "editorial" | "ai-native"; children`).
- Produces: `export function RereadVsRecall(): JSX.Element` (client component, no props).

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { DemoShell } from "@/components/primitives/DemoShell";
import {
  DISTRACT_SECONDS,
  EXPERIMENT_SOURCES,
  FACT_SETS,
  FACTS_PER_SET,
  STUDY_SECONDS,
  type Fact,
} from "@/lib/study/content";
import { buildQuiz } from "@/lib/study/recall";
import {
  canAdvance,
  createSession,
  sessionReducer,
  studyStep,
  summarizeSession,
  type Condition,
} from "@/lib/study/recallSession";

const primaryBtn =
  "inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-[var(--space-6)] py-[var(--space-3)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--surface)] transition-opacity disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]";
const ghostBtn =
  "inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-[var(--space-4)] py-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]";
const lead = "text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text)]";
const muted = "text-[length:var(--text-small)] leading-[1.6] text-[color:var(--text-muted)]";
const label = "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]";

const CONDITION_NAME: Record<Condition, string> = { reread: "Reread", recall: "Self-test" };

function Countdown({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left === 0) {
      onDone();
      return undefined;
    }
    const id = window.setTimeout(() => setLeft(left - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left, onDone]);
  return (
    <span className="font-mono text-[var(--text-caption)] tabular-nums text-[color:var(--text-faint)]" aria-live="off">
      {left}s left
    </span>
  );
}

function RereadList({ facts }: { facts: readonly Fact[] }) {
  return (
    <ul className="flex flex-col gap-[var(--space-2)]">
      {facts.map((f) => (
        <li key={f.id} className={lead}>
          {f.statement}
        </li>
      ))}
    </ul>
  );
}

function Flashcards({ facts }: { facts: readonly Fact[] }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const fact = facts[index % facts.length] as Fact;
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <p className={label}>
        Card {(index % facts.length) + 1} of {facts.length}
      </p>
      <p className="font-display text-[length:var(--text-h3)] leading-[1.3] text-[color:var(--text)]">{fact.cue}</p>
      <p className={muted}>Answer it in your head first. Then check.</p>
      {shown ? <p className={lead}>{fact.answer}</p> : null}
      <div className="flex flex-wrap gap-[var(--space-3)]">
        {shown ? (
          <button type="button" className={ghostBtn} onClick={() => { setShown(false); setIndex(index + 1); }}>
            Next card
          </button>
        ) : (
          <button type="button" className={ghostBtn} onClick={() => setShown(true)}>
            Show answer
          </button>
        )}
      </div>
    </div>
  );
}

export function RereadVsRecall() {
  const [state, dispatch] = useReducer(sessionReducer, 1, createSession);
  const next = useCallback(() => dispatch({ type: "next" }), []);
  const quiz = useMemo(() => buildQuiz(Object.values(FACT_SETS), state.seed), [state.seed]);
  const step = studyStep(state);

  return (
    <DemoShell
      label="Lab 01 · Reread vs. Recall"
      title="About 6 minutes"
      footer={
        <p className={muted}>
          Based on{" "}
          {EXPERIMENT_SOURCES.slice(0, 2).map((s, i) => (
            <span key={s.url}>
              {i > 0 ? " and " : null}
              <a href={s.url} className="text-[color:var(--accent)] underline underline-offset-4">
                {s.label}
              </a>
            </span>
          ))}
          . Nothing you enter leaves this page.
        </p>
      }
    >
      <div className="flex flex-col gap-[var(--space-6)]" aria-live="polite">
        {state.phase === "intro" ? (
          <>
            <p className={lead}>
              You are going to learn two short lists of facts about two made-up places. One list you will reread. The other
              you will quiz yourself on. Then a short break, then a quiz on both. Guess which method wins before you start.
            </p>
            <div>
              <button type="button" className={primaryBtn} onClick={() => dispatch({ type: "start", seed: Date.now() })}>
                Start the experiment
              </button>
            </div>
          </>
        ) : null}

        {step ? (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
              <p className={label}>
                Round {state.phase === "study-1" ? 1 : 2} · {CONDITION_NAME[step.condition]} · {step.set.title}
              </p>
              <Countdown key={state.phase} seconds={STUDY_SECONDS} onDone={next} />
            </div>
            <p className={muted}>
              {step.condition === "reread"
                ? "Read these facts. When you reach the end, read them again. Keep going until the timer runs out."
                : "Flip through the cards. Answer each one before you look. Keep cycling until the timer runs out."}
            </p>
            {step.condition === "reread" ? <RereadList facts={step.set.facts} /> : <Flashcards facts={step.set.facts} />}
          </>
        ) : null}

        {state.phase === "predict" ? (
          <>
            <p className={lead}>Before the quiz: how many of the {FACTS_PER_SET} facts do you think you will get right from each list?</p>
            {(["reread", "recall"] as const).map((condition) => (
              <label key={condition} className="flex flex-wrap items-center gap-[var(--space-3)]">
                <span className="min-w-[14ch] text-[color:var(--text)]">
                  {CONDITION_NAME[condition]} ({FACT_SETS[state.setFor[condition]].title})
                </span>
                <input
                  id={`predict-${condition}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={FACTS_PER_SET}
                  step={1}
                  value={state.predictions[condition] ?? ""}
                  onChange={(e) => dispatch({ type: "predict", condition, value: Number(e.target.value) })}
                  className="w-[5rem] rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[color:var(--text)]"
                />
                <span className={muted}>out of {FACTS_PER_SET}</span>
              </label>
            ))}
            <div>
              <button type="button" className={primaryBtn} disabled={!canAdvance(state)} onClick={next}>
                Lock in my guesses
              </button>
            </div>
          </>
        ) : null}

        {state.phase === "distract" ? (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
              <p className={label}>Short break</p>
              <Countdown key="distract" seconds={DISTRACT_SECONDS} onDone={next} />
            </div>
            <p className={lead}>
              Count backward from 300 by threes, out loud or in your head. This clears your short-term memory so the quiz
              measures what you actually learned.
            </p>
          </>
        ) : null}

        {state.phase === "quiz" ? (
          <>
            <p className={muted}>
              {Object.keys(state.answers).length} of {quiz.length} answered
            </p>
            <ol className="flex flex-col gap-[var(--space-6)]">
              {quiz.map((item, i) => (
                <li key={item.factId}>
                  <fieldset className="flex flex-col gap-[var(--space-2)]">
                    <legend className="mb-[var(--space-2)] text-[color:var(--text)]">
                      {i + 1}. {item.cue}
                    </legend>
                    <div className="flex flex-wrap gap-[var(--space-2)]">
                      {item.options.map((option) => {
                        const picked = state.answers[item.factId] === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={picked}
                            onClick={() => dispatch({ type: "answer", factId: item.factId, choice: option })}
                            className={`${ghostBtn} normal-case tracking-normal ${picked ? "border-[color:var(--accent)] bg-[color:var(--accent-tint)]" : ""}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                </li>
              ))}
            </ol>
            <div>
              <button type="button" className={primaryBtn} disabled={!canAdvance(state)} onClick={next}>
                See my results
              </button>
            </div>
          </>
        ) : null}

        {state.phase === "results" ? <Results state={state} onRestart={() => dispatch({ type: "restart", seed: Date.now() })} /> : null}
      </div>
    </DemoShell>
  );
}

function Results({ state, onRestart }: { state: Parameters<typeof summarizeSession>[0]; onRestart: () => void }) {
  const [reread, recall] = summarizeSession(state);
  const recallWon = recall.score.correct > reread.score.correct;
  return (
    <>
      <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
        {[reread, recall].map((r) => (
          <div key={r.condition} className="rounded-[4px] border border-[color:var(--border)] p-[var(--space-4)]">
            <p className={label}>{CONDITION_NAME[r.condition]}</p>
            <p className="mt-[var(--space-2)] font-display text-[length:var(--text-h1)] leading-none text-[color:var(--text)] tabular-nums">
              {r.score.correct}/{r.score.total}
            </p>
            <p className={`mt-[var(--space-2)] ${muted}`}>
              You guessed {r.predicted}.{" "}
              {r.gap > 0 ? `You overestimated by ${r.gap}.` : r.gap < 0 ? `You underestimated by ${-r.gap}.` : "Spot on."}
            </p>
          </div>
        ))}
      </div>
      <p className={lead}>
        {recallWon
          ? "Self-testing won. That is the result researchers keep finding, and the gap usually grows over the following days."
          : "Rereading held its own today. Over one sitting that happens. Researchers find the self-testing advantage grows over the next few days, so try the quiz again tomorrow from memory."}
      </p>
      <p className={muted}>
        Look at your guesses. Most people expect rereading to win because familiar text feels like knowledge. That feeling is
        the trap. Next time you study, close the book and write down what you remember before you look again.
      </p>
      <div>
        <button type="button" className={primaryBtn} onClick={onRestart}>
          Run it again
        </button>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm --prefix C:/Users/chigh/Niall-Highland run typecheck`
Expected: no errors.

- [ ] **Step 3: Lint the copy**

Run: `python C:/Users/chigh/claude-projects/toolbox/writing-lint/ai_tell_lint.py C:/Users/chigh/Niall-Highland/components/study/RereadVsRecall.tsx`
Expected: `0 finding(s)`. Fix any finding by rewording, then rerun.

- [ ] **Step 4: Commit**

```bash
git -C C:/Users/chigh/Niall-Highland add components/study/RereadVsRecall.tsx
git -C C:/Users/chigh/Niall-Highland commit -m "feat: add reread vs recall lab widget" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: The /study page, social card, navigation and essay link

**Files:**
- Create: `app/study/page.tsx`
- Create: `app/study/opengraph-image.tsx`
- Modify: `components/chrome/Nav.tsx:16-22` (LINKS)
- Modify: `components/chrome/Footer.tsx` (link list containing `{ href: "/writing", label: "Writing" }`)
- Modify: `app/sitemap.ts` (staticRoutes)
- Modify: `content/essays/nobody-is-a-visual-learner.mdx` (closing paragraph)

**Interfaces:**
- Consumes: `RereadVsRecall` (Task 4); `SUBJECT_ROUTINES` (Task 2); `EditorialSection` (`container`, `padding`, `className`); essay components `Section` (`label`, `index`), `Callout` (`tone`, `label`), `ComparisonTable` (`label`, `columnA`, `columnB`), `Compare` (`aspect`, `a`, `b`), `Sidebar` (`label`, `title`) from `@/components/essay`; `ogResponse`, `OG_SIZE`, `OG_CONTENT_TYPE` from `@/lib/og/render`.
- Produces: route `/study`.

- [ ] **Step 1: Create `app/study/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import { Callout, Compare, ComparisonTable, Section, Sidebar } from "@/components/essay";
import { RereadVsRecall } from "@/components/study/RereadVsRecall";
import { SUBJECT_ROUTINES } from "@/lib/study/content";

export const metadata: Metadata = {
  title: "How to actually study",
  description:
    "Learning styles are a myth. Run the experiments yourself, then build a study routine that works for every brain: retrieve, space, explain, mix.",
};

const body = "mt-[var(--space-4)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text)]";

export default function StudyPage() {
  return (
    <div data-accent="clay">
      <EditorialSection container="standard" padding="tight" className="pt-[var(--space-24)] md:pt-[var(--space-32)]">
        <p className="mb-[var(--space-6)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
          Study Lab · For students, parents & teachers
        </p>
        <h1 className="max-w-[16ch] font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[var(--tracking-hero)] text-[color:var(--text)] [text-wrap:balance]">
          How to actually study
        </h1>
        <div aria-hidden="true" className="mt-[var(--space-8)] h-[3px] w-[var(--space-16)] bg-[color:var(--accent)]" />
        <p className="mt-[var(--space-8)] max-w-[var(--width-reading)] font-display text-[length:var(--text-lead)] leading-[1.5] text-[color:var(--text-muted)]">
          Forget what kind of learner you were told you are. There is no such thing. There are a handful of study moves that
          work for every brain, and you can prove it to yourself in about six minutes.{" "}
          <Link href="/writing/nobody-is-a-visual-learner" className="text-[color:var(--accent)] underline underline-offset-4">
            Read why learning styles keep failing fair tests.
          </Link>
        </p>
      </EditorialSection>

      <EditorialSection container="reading" padding="tight" className="pt-0">
        <Section label="The engine" index="01">
          <p className={body}>
            Every effective study method in the research comes down to four moves. None of them depends on your
            personality, your preferences or a quiz result. All four feel harder than rereading, and that is exactly why
            they work.
          </p>
          <ComparisonTable label="The four moves" columnA="What you do" columnB="Why it works">
            <Compare aspect="Retrieve" a="Close the book. Write down everything you remember. Then check." b="Pulling a memory out strengthens it far more than looking at it again." />
            <Compare aspect="Space" a="Split the same study time across several days. Revisit each topic a week later." b="Letting yourself partly forget, then recalling, makes memories last." />
            <Compare aspect="Explain" a="Ask why each fact is true and answer in your own words." b="Explaining connects new ideas to what you already know." />
            <Compare aspect="Mix" a="Once you can do a skill, practice it alongside older ones." b="Mixing forces you to choose the method, which is what tests ask for." />
          </ComparisonTable>
        </Section>

        <Section label="The lab" index="02">
          <p className={body}>
            Do not take my word for any of this. Run the experiment. It takes about six minutes, it works on a phone, and
            nothing you type leaves this page.
          </p>
          <div className="mt-[var(--space-8)]">
            <RereadVsRecall />
          </div>
        </Section>

        <Section label="Five things worth knowing about yourself" index="03">
          <p className={body}>
            Students really are different. The differences that matter just are not styles. Five of them predict how a
            student does, and every one can be measured and improved. They change how much help you need, never which
            method works.
          </p>
          <ComparisonTable label="What each difference changes" columnA="What you notice" columnB="What helps">
            <Compare aspect="Prior knowledge" a="Lost from the first lesson; new ideas have nothing to attach to" b="More worked examples and foundational review before working alone" />
            <Compare aspect="Reading skill" a="Slow, effortful reading in every subject" b="Reading practice, plus audio support so the content keeps pace" />
            <Compare aspect="Executive function" a="Missed deadlines, trouble starting, loses track" b="Pre-built schedules, checklists, smaller chunks, phone out of the room" />
            <Compare aspect="Self-regulation" a="Rereads for hours, cannot tell what they actually know" b="A plan, a self-quiz to check, and an adjustment each week" />
            <Compare aspect="Test anxiety" a="Knows it at home, freezes in the exam" b="Frequent low-stakes timed practice; treating nerves as readiness" />
          </ComparisonTable>
          <Callout tone="caution" label="When to ask for more">
            If reading stays slow, math facts never stick, or disorganization shows up everywhere despite real effort, ask
            for a proper evaluation. No quiz on a website can diagnose dyslexia or ADHD.
          </Callout>
        </Section>

        <Section label="Routines by subject" index="04">
          <p className={body}>
            The engine stays the same in every subject. What you retrieve and how you practice it changes, because the
            content changes. You do not cook fish the way you cook brisket.
          </p>
          <ComparisonTable label="Weekly routines by subject" columnA="The routine" columnB="Why the content demands it">
            {SUBJECT_ROUTINES.map((r) => (
              <Compare key={r.subject} aspect={r.subject} a={r.routine} b={r.why} />
            ))}
          </ComparisonTable>
        </Section>

        <Section label="For parents and teachers" index="05">
          <p className={body}>
            The single most useful thing an adult can do is stop policing homework and start coaching the routine. Ask what
            the plan is this week. Ask how they will check what they know. Praise the strategy and the effort, not being
            smart.
          </p>
          <Sidebar label="Coaching checklist" title="Five questions to ask this week">
            <ul className="flex list-disc flex-col gap-[var(--space-2)] pl-[var(--space-4)]">
              <li>What will you study, and on which days?</li>
              <li>How will you test yourself without looking?</li>
              <li>What did you get wrong last time, and when will you redo it?</li>
              <li>Where will your phone be while you study?</li>
              <li>What time are you going to bed?</li>
            </ul>
          </Sidebar>
          <p className={body}>
            Teachers: five retrieval questions at the start of every lesson, on last week&rsquo;s material, ungraded. It is
            the cheapest high-impact change available to you.
          </p>
        </Section>
      </EditorialSection>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/study/opengraph-image.tsx`**

```tsx
import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/render";

export const runtime = "edge";
export const alt = "How to actually study, by Niall Highland";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogResponse({
    eyebrow: "Study Lab",
    title: "How to actually study",
    subtitle: "Learning styles are a myth. Run the experiment yourself, then build a routine that works for every brain.",
    meta: "Retrieve · Space · Explain · Mix",
  });
}
```

- [ ] **Step 3: Add the nav and footer links**

In `components/chrome/Nav.tsx`, replace the LINKS array:

```ts
const LINKS = [
  { href: "/#what-niall-does", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/study", label: "Study" },
  { href: "/talks", label: "Talks" },
  { href: "/demos", label: "Demos" },
  { href: "/engage", label: "Engage" },
] as const;
```

In `components/chrome/Footer.tsx`, directly after the line `{ href: "/writing", label: "Writing" },` add:

```ts
  { href: "/study", label: "Study" },
```

- [ ] **Step 4: Add the sitemap entry**

In `app/sitemap.ts` `staticRoutes`, after the `/writing` entry add:

```ts
    { url: `${BASE}/study`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
```

- [ ] **Step 5: Link the essay to the page**

In `content/essays/nobody-is-a-visual-learner.mdx`, replace the final paragraph (beginning "There are no visual learners and no auditory learners.") with:

```mdx
There are no visual learners and no auditory learners. There are students who know more and students who know less, students who read well and students who are still getting there, students who can manage themselves and students who need us to teach them how. Every one of those differences can be measured, and every one of them can be moved. That is the job.

Want to see it for yourself? [Run the experiment in the Study Lab](/study). It takes six minutes.
```

- [ ] **Step 6: Lint the copy**

Run each, expecting `0 finding(s)`:
`python C:/Users/chigh/claude-projects/toolbox/writing-lint/ai_tell_lint.py C:/Users/chigh/Niall-Highland/app/study/page.tsx`
`python C:/Users/chigh/claude-projects/toolbox/writing-lint/ai_tell_lint.py C:/Users/chigh/Niall-Highland/content/essays/nobody-is-a-visual-learner.mdx`

- [ ] **Step 7: Typecheck, test, build**

Run: `npm --prefix C:/Users/chigh/Niall-Highland run typecheck`
Run: `npm --prefix C:/Users/chigh/Niall-Highland test`
Run: `npm --prefix C:/Users/chigh/Niall-Highland run build`
Expected: all pass; the build route list includes `○ /study`.

- [ ] **Step 8: Commit**

```bash
git -C C:/Users/chigh/Niall-Highland add app/study components/chrome/Nav.tsx components/chrome/Footer.tsx app/sitemap.ts content/essays/nobody-is-a-visual-learner.mdx
git -C C:/Users/chigh/Niall-Highland commit -m "feat: add study lab page with navigation and essay link" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Coaching doctrine

**Files:**
- Create: `docs/study/coaching-doctrine.md`

**Interfaces:**
- Produces: the shared rules VEND/AI copies for its study tools.

- [ ] **Step 1: Write the doctrine**

```markdown
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
```

- [ ] **Step 2: Lint**

Run: `python C:/Users/chigh/claude-projects/toolbox/writing-lint/ai_tell_lint.py C:/Users/chigh/Niall-Highland/docs/study/coaching-doctrine.md`
Expected: `0 finding(s)`.

- [ ] **Step 3: Commit**

```bash
git -C C:/Users/chigh/Niall-Highland add docs/study/coaching-doctrine.md
git -C C:/Users/chigh/Niall-Highland commit -m "docs: add shared study coaching doctrine" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Browser verification and production deploy

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Use the Browser pane: `preview_start` with name `niall-dev` (port 3012), then navigate to `http://localhost:3012/study`.

- [ ] **Step 2: Walk the widget end to end at phone width**

Set the viewport to mobile (375x812). Click Start, let both study rounds and the break run (or confirm the countdowns tick), enter predictions 6 and 5, confirm "Lock in my guesses" is disabled until both are set, answer all 16 questions, confirm "See my results" stays disabled until the last answer, then confirm the results show two scores, the guesses and a gap message. Click "Run it again" and confirm it returns to the intro.

- [ ] **Step 3: Check console, desktop and dark mode**

Read console messages (expect no errors, especially no hydration warnings). Repeat a quick visual check at desktop width and with the dark color scheme. Confirm the tables stack on phone and render as tables on desktop. Reset the viewport to desktop afterwards.

- [ ] **Step 4: Push and deploy**

```bash
git -C C:/Users/chigh/Niall-Highland push -u origin feat/study-resource-page
vercel deploy --prod --yes --cwd C:/Users/chigh/Niall-Highland
```

Expected: deployment `READY`, aliased to `https://www.niallhighland.com`.

- [ ] **Step 5: Verify live**

Run: `curl -s -o /dev/null -w "%{http_code}\n" https://www.niallhighland.com/study`
Expected: `200`.
