# Study Page Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Lab 02 (Cram vs. Space) and Lab 03 (Blocked vs. Mixed) to `niallhighland.com/study`, with their framework-free logic in `lib/study/`.

**Architecture:** Two new pure modules, `spacing.ts` (an illustrative memory model plus schedule editing) and `practice.ts` (prism problem sets, answer checking, scoring), each with vitest tests. Two client widgets render them inside `DemoShell`. The page adds both labs under "The lab".

**Tech Stack:** Next.js 15, React 19, Tailwind v4 tokens, TypeScript strict, vitest 3.2.4 (already installed).

**Spec:** `docs/superpowers/specs/2026-10-11-study-resource-page-design.md`

## Global Constraints

- Repo `C:/Users/chigh/Niall-Highland`, branch `feat/study-resource-page`. npm.
- `lib/study/` imports nothing from React, Next or `@/`. Relative imports only.
- TypeScript strict, no `any`.
- No student data leaves the browser.
- Copy: no em dashes, en dashes or `--`; `ai_tell_lint.py` reports 0 findings. Niall's student voice, no anecdotes.
- Model output is labeled as an illustration (coaching doctrine rule 4).
- Never run `npm run build` while the dev server is running (they share `.next/`).
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A student taps a fifth day when four sessions are already placed: nothing changes. (Task 1 test: "toggleSessionDay caps the number of sessions")
2. A student removes every session: the widget shows a prompt instead of a chart and never calls the forecast with an empty schedule. (Task 1 test: "forecastRetention rejects an empty schedule"; Task 3 renders the empty state)
3. A student types nothing, a letter or a decimal into a practice answer: it is marked wrong, never correct. (Task 2 test: "checkAnswer rejects blanks and non-integers")
4. The mixed set puts two problems of the same type next to each other, which turns it back into blocked practice. (Task 2 test: "mixed set never repeats a type back to back")
5. A forecast asked for a day before the last session: rejected with a clear error (the day grid itself never offers the test day). (Task 1 test: "rejects sessions after the forecast day")

## Ruling carried from the spec

The spec's test note says "more spaced sessions never lower test-day retention." Under the model, inserting a session immediately after another can lower final stability slightly, so the testable, true property is: **adding a session after the last one never lowers test-day retention.** The contrast the widget teaches is long-term: cramming scores about the same on test day and far worse a week later, which matches the research summary ("works for tomorrow, gone in a week").

---

### Task 1: Spacing model and schedule editing

**Files:**
- Create: `lib/study/spacing.ts`
- Test: `lib/study/__tests__/spacing.test.ts`

**Interfaces:**
- Consumes: `StudyInputError` from `./errors`.
- Produces:
  - `SPACING_MODEL: { readonly initialStabilityDays: 1; readonly growth: 2 }`
  - `TEST_DAY = 14`, `SESSION_COUNT = 4`, `FOLLOW_UP_DAYS = 7`
  - `CRAM_PRESET: readonly number[]` (`[10, 11, 12, 13]`), `SPACED_PRESET: readonly number[]` (`[0, 3, 7, 12]`)
  - `forecastRetention(sessionDays: readonly number[], day: number): number` (0 to 1)
  - `retentionCurve(sessionDays: readonly number[], horizonDays: number): number[]` (one value per day, 0 to horizon inclusive)
  - `toggleSessionDay(days: readonly number[], day: number): number[]` (sorted)

- [ ] **Step 1: Write the failing test** at `lib/study/__tests__/spacing.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { StudyInputError } from "../errors";
import {
  CRAM_PRESET,
  FOLLOW_UP_DAYS,
  forecastRetention,
  retentionCurve,
  SESSION_COUNT,
  SPACED_PRESET,
  TEST_DAY,
  toggleSessionDay,
} from "../spacing";

describe("forecastRetention", () => {
  it("is 1 on the day of a session", () => {
    expect(forecastRetention([3], 3)).toBe(1);
  });

  it("spaced study is at least as good on test day and far better a week later", () => {
    const later = TEST_DAY + FOLLOW_UP_DAYS;
    expect(forecastRetention(SPACED_PRESET, TEST_DAY)).toBeGreaterThanOrEqual(forecastRetention(CRAM_PRESET, TEST_DAY));
    expect(forecastRetention(SPACED_PRESET, later) - forecastRetention(CRAM_PRESET, later)).toBeGreaterThan(0.2);
  });

  it("adding a session after the last one never lowers test-day retention", () => {
    const schedules = [[0], [0, 5], [2, 4, 9], [0, 3, 7], [10, 11, 12]];
    for (const s of schedules) {
      const last = s[s.length - 1] as number;
      for (let extra = last + 1; extra < TEST_DAY; extra += 1) {
        expect(forecastRetention([...s, extra], TEST_DAY)).toBeGreaterThanOrEqual(forecastRetention(s, TEST_DAY));
      }
    }
  });

  it("forecastRetention rejects an empty schedule", () => {
    expect(() => forecastRetention([], TEST_DAY)).toThrow(StudyInputError);
  });

  it("rejects sessions after the forecast day", () => {
    expect(() => forecastRetention([2, 9], 1)).toThrow(StudyInputError);
  });

  it("rejects duplicate, negative or fractional days", () => {
    expect(() => forecastRetention([2, 2], TEST_DAY)).toThrow(StudyInputError);
    expect(() => forecastRetention([-1], TEST_DAY)).toThrow(StudyInputError);
    expect(() => forecastRetention([1.5], TEST_DAY)).toThrow(StudyInputError);
  });
});

describe("retentionCurve", () => {
  it("has one value per day, zero before the first session and 1 on session days", () => {
    const curve = retentionCurve([3, 8], 21);
    expect(curve).toHaveLength(22);
    expect(curve.slice(0, 3)).toEqual([0, 0, 0]);
    expect(curve[3]).toBe(1);
    expect(curve[8]).toBe(1);
    for (const v of curve) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("is all zeros for an empty schedule", () => {
    expect(retentionCurve([], 5)).toEqual([0, 0, 0, 0, 0, 0]);
  });
});

describe("toggleSessionDay", () => {
  it("adds and removes days, keeping them sorted", () => {
    expect(toggleSessionDay([5, 1], 3)).toEqual([1, 3, 5]);
    expect(toggleSessionDay([1, 3, 5], 3)).toEqual([1, 5]);
  });

  it("toggleSessionDay caps the number of sessions", () => {
    const full = [0, 1, 2, 3];
    expect(full).toHaveLength(SESSION_COUNT);
    expect(toggleSessionDay(full, 9)).toEqual(full);
  });

  it("ignores days outside the plan", () => {
    expect(toggleSessionDay([1], TEST_DAY)).toEqual([1]);
    expect(toggleSessionDay([1], -1)).toEqual([1]);
  });
});
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL, cannot resolve `../spacing`.

- [ ] **Step 3: Implement** `lib/study/spacing.ts`:

```ts
import { StudyInputError } from "./errors";

/**
 * Illustrative memory model, not a fitted one. Each session sets retention to 1.
 * Retention then decays as exp(-days / stability). A session that comes after some
 * forgetting raises stability more than one that comes straight after the last
 * (growth * (1 - retention at that moment)), so cramming builds little stability.
 */
export const SPACING_MODEL = { initialStabilityDays: 1, growth: 2 } as const;

export const TEST_DAY = 14;
export const SESSION_COUNT = 4;
export const FOLLOW_UP_DAYS = 7;
export const CRAM_PRESET: readonly number[] = [10, 11, 12, 13];
export const SPACED_PRESET: readonly number[] = [0, 3, 7, 12];

function stabilityAfter(sorted: readonly number[]): number {
  let stability: number = SPACING_MODEL.initialStabilityDays;
  for (let i = 1; i < sorted.length; i += 1) {
    const gap = (sorted[i] as number) - (sorted[i - 1] as number);
    const retentionNow = Math.exp(-gap / stability);
    stability *= 1 + SPACING_MODEL.growth * (1 - retentionNow);
  }
  return stability;
}

function validated(sessionDays: readonly number[], day: number): number[] {
  if (sessionDays.length === 0) {
    throw new StudyInputError("Pick at least one study day.");
  }
  const sorted = [...sessionDays].sort((a, b) => a - b);
  sorted.forEach((d, i) => {
    if (!Number.isInteger(d) || d < 0) {
      throw new StudyInputError("Study days must be whole numbers from day 0.");
    }
    if (i > 0 && d === sorted[i - 1]) {
      throw new StudyInputError("Each study day can only be used once.");
    }
  });
  if ((sorted[sorted.length - 1] as number) > day) {
    throw new StudyInputError("Every study session has to come before the day you are forecasting.");
  }
  return sorted;
}

/** Forecast share remembered on `day`, given study sessions on `sessionDays`. */
export function forecastRetention(sessionDays: readonly number[], day: number): number {
  const sorted = validated(sessionDays, day);
  const last = sorted[sorted.length - 1] as number;
  return Math.exp(-(day - last) / stabilityAfter(sorted));
}

/** Forecast for every day from 0 to `horizonDays`; 0 before the first session. */
export function retentionCurve(sessionDays: readonly number[], horizonDays: number): number[] {
  const sorted = [...sessionDays].sort((a, b) => a - b);
  return Array.from({ length: horizonDays + 1 }, (_, day) => {
    const sofar = sorted.filter((d) => d <= day);
    return sofar.length === 0 ? 0 : forecastRetention(sofar, day);
  });
}

/** Add or remove a study day. Ignores days outside the plan and a fifth session. */
export function toggleSessionDay(days: readonly number[], day: number): number[] {
  if (!Number.isInteger(day) || day < 0 || day >= TEST_DAY) return [...days];
  if (days.includes(day)) return days.filter((d) => d !== day);
  if (days.length >= SESSION_COUNT) return [...days];
  return [...days, day].sort((a, b) => a - b);
}
```

Note: the "rejects sessions after the forecast day" test passes day 1 with sessions [2, 9], so the last session (9) is after day 1 and the validator throws. A session exactly on the forecast day is allowed (retention 1), which keeps `retentionCurve` correct on session days; `toggleSessionDay` is what keeps students from placing a session on the test day itself.

- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add illustrative spacing model and schedule editing`.

---

### Task 2: Practice problem sets

**Files:**
- Create: `lib/study/practice.ts`
- Test: `lib/study/__tests__/practice.test.ts`

**Interfaces:**
- Consumes: `createRng`, `shuffle` (`./random`), `StudyInputError` (`./errors`).
- Produces:
  - `type ProblemType = "faces" | "edges" | "corners"`
  - `PROBLEM_TYPES: readonly ProblemType[]`
  - `FORMULA_TEXT: Readonly<Record<ProblemType, string>>`
  - `interface Problem { id: string; type: ProblemType; baseSides: number; prompt: string; answer: number }`
  - `PROBLEMS_PER_SET = 6`
  - `TRIAL_RESULT: { mixed: 61; blocked: 38; students: 787; label: string; url: string }`
  - `buildBlockedSet(seed: number): Problem[]`, `buildMixedSet(seed: number): Problem[]`
  - `checkAnswer(problem: Problem, answer: number): boolean`
  - `scoreSet(problems: readonly Problem[], answers: Readonly<Record<string, number>>): { correct: number; total: number }`

- [ ] **Step 1: Write the failing test** at `lib/study/__tests__/practice.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { StudyInputError } from "../errors";
import { buildBlockedSet, buildMixedSet, checkAnswer, PROBLEMS_PER_SET, scoreSet } from "../practice";

describe("problem sets", () => {
  it("blocked set groups each type together", () => {
    expect(buildBlockedSet(3).map((p) => p.type)).toEqual(["faces", "faces", "edges", "edges", "corners", "corners"]);
  });

  it("mixed set never repeats a type back to back", () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const types = buildMixedSet(seed).map((p) => p.type);
      expect(types).toHaveLength(PROBLEMS_PER_SET);
      for (let i = 1; i < types.length; i += 1) expect(types[i]).not.toBe(types[i - 1]);
      for (const t of ["faces", "edges", "corners"]) expect(types.filter((x) => x === t)).toHaveLength(2);
    }
  });

  it("computes answers from the prism rules with distinct base sides from 4 to 12", () => {
    for (const p of [...buildBlockedSet(8), ...buildMixedSet(8)]) {
      const expected = { faces: p.baseSides + 2, edges: p.baseSides * 3, corners: p.baseSides * 2 }[p.type];
      expect(p.answer).toBe(expected);
      expect(p.baseSides).toBeGreaterThanOrEqual(4);
      expect(p.baseSides).toBeLessThanOrEqual(12);
      expect(p.prompt).toContain(String(p.baseSides));
    }
    const sides = buildBlockedSet(8).map((p) => p.baseSides);
    expect(new Set(sides).size).toBe(sides.length);
  });

  it("is repeatable for a seed", () => {
    expect(buildMixedSet(4)).toEqual(buildMixedSet(4));
  });
});

describe("checkAnswer", () => {
  it("accepts the right whole number", () => {
    const p = buildBlockedSet(1)[0]!;
    expect(checkAnswer(p, p.answer)).toBe(true);
    expect(checkAnswer(p, p.answer + 1)).toBe(false);
  });

  it("checkAnswer rejects blanks and non-integers", () => {
    const p = buildBlockedSet(1)[0]!;
    expect(checkAnswer(p, Number.NaN)).toBe(false);
    expect(checkAnswer(p, p.answer + 0.5)).toBe(false);
  });
});

describe("scoreSet", () => {
  it("counts correct answers and throws on a missing one", () => {
    const set = buildBlockedSet(2);
    const answers = Object.fromEntries(set.map((p, i) => [p.id, i < 4 ? p.answer : -1]));
    expect(scoreSet(set, answers)).toEqual({ correct: 4, total: 6 });
    delete answers[set[5]!.id];
    expect(() => scoreSet(set, answers)).toThrow(StudyInputError);
  });
});
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL, cannot resolve `../practice`.

- [ ] **Step 3: Implement** `lib/study/practice.ts`:

```ts
import { StudyInputError } from "./errors";
import { createRng, shuffle } from "./random";

export type ProblemType = "faces" | "edges" | "corners";

export const PROBLEM_TYPES: readonly ProblemType[] = ["faces", "edges", "corners"];

export const FORMULA_TEXT: Readonly<Record<ProblemType, string>> = {
  faces: "Faces = base sides + 2",
  edges: "Edges = base sides × 3",
  corners: "Corners = base sides × 2",
};

export interface Problem {
  id: string;
  type: ProblemType;
  baseSides: number;
  prompt: string;
  answer: number;
}

export const PROBLEMS_PER_SET = 6;

export const TRIAL_RESULT = {
  mixed: 61,
  blocked: 38,
  students: 787,
  label: "Rohrer et al. (2020), a preregistered trial with seventh graders",
  url: "https://ies.ed.gov/ncee/wwc/Study/88770",
} as const;

const RULES: Readonly<Record<ProblemType, (b: number) => number>> = {
  faces: (b) => b + 2,
  edges: (b) => b * 3,
  corners: (b) => b * 2,
};

function makeProblems(types: readonly ProblemType[], seed: number, prefix: string): Problem[] {
  const sides = shuffle([4, 5, 6, 7, 8, 9, 10, 11, 12], createRng(seed));
  return types.map((type, i) => {
    const baseSides = sides[i] as number;
    return {
      id: `${prefix}${i + 1}`,
      type,
      baseSides,
      prompt: `How many ${type} does a prism with ${baseSides} base sides have?`,
      answer: RULES[type](baseSides),
    };
  });
}

export function buildBlockedSet(seed: number): Problem[] {
  return makeProblems(PROBLEM_TYPES.flatMap((t) => [t, t]), seed, "b");
}

function hasRepeat(types: readonly ProblemType[]): boolean {
  return types.some((t, i) => i > 0 && t === types[i - 1]);
}

export function buildMixedSet(seed: number): Problem[] {
  const rng = createRng(seed ^ 0x9e3779b9);
  const pool = PROBLEM_TYPES.flatMap((t) => [t, t]);
  let order = shuffle(pool, rng);
  for (let attempt = 0; attempt < 100 && hasRepeat(order); attempt += 1) {
    order = shuffle(pool, rng);
  }
  if (hasRepeat(order)) order = [...PROBLEM_TYPES, ...PROBLEM_TYPES];
  return makeProblems(order, seed + 1, "m");
}

export function checkAnswer(problem: Problem, answer: number): boolean {
  return Number.isInteger(answer) && answer === problem.answer;
}

export function scoreSet(
  problems: readonly Problem[],
  answers: Readonly<Record<string, number>>,
): { correct: number; total: number } {
  let correct = 0;
  for (const p of problems) {
    const a = answers[p.id];
    if (a === undefined) throw new StudyInputError(`Missing an answer for "${p.prompt}".`);
    if (checkAnswer(p, a)) correct += 1;
  }
  return { correct, total: problems.length };
}
```

- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add prism practice sets for blocked vs mixed lab`.

---

### Task 3: Cram vs. Space widget

**Files:** Create `components/study/CramVsSpace.tsx`.

**Interfaces:** Consumes everything Task 1 produces; `DemoShell`.

- [ ] **Step 1: Write the component** (full code in the implementation; requirements):
  - State `days`, initial `CRAM_PRESET`. Two preset buttons: "Cram the last four days" and "Spread it out".
  - A 14-cell day grid (two rows of seven) of `aria-pressed` buttons labeled "Day N", plus a final non-interactive "Test" cell. Taps go through `toggleSessionDay`. A counter reads "N of 4 sessions placed".
  - When `days` is empty: show "Pick at least one study day to see the forecast." and no chart or numbers.
  - Otherwise two stat blocks: "On test day" (`forecastRetention(days, TEST_DAY)`) and "One week later" (`forecastRetention(days, TEST_DAY + FOLLOW_UP_DAYS)`), as whole percentages.
  - An SVG line chart of `retentionCurve(days, TEST_DAY + FOLLOW_UP_DAYS)`: 2px line in `--accent`, 8px markers on session days, dashed rule at the test day labeled "Test", recessive gridlines at 0/50/100% in `--border`, axis text in `--text-muted`, x labels at days 0, 7, 14, 21. Per-day hit rectangles drive a readout line "Day N: X% remembered". Single series, so no legend.
  - A visually hidden summary with both percentages for screen readers.
  - Caption: the curve comes from a simple illustrative memory model, not the student's data, with a link to Dunlosky et al. (2013) opening in a new tab.
- [ ] **Step 2:** `npm run typecheck` passes; lint the file to 0 findings.
- [ ] **Step 3: Commit** `feat: add cram vs space lab widget`.

### Task 4: Blocked vs. Mixed widget

**Files:** Create `components/study/BlockedVsMixed.tsx`.

**Interfaces:** Consumes everything Task 2 produces; `DemoShell`.

- [ ] **Step 1: Write the component** (requirements):
  - Phases `intro`, `blocked`, `mixed`, `results`. Intro lists the three `FORMULA_TEXT` rules and a Start button that seeds both sets with `Date.now()`.
  - One problem at a time: prompt, a numeric input, a Check button disabled while the input is empty. After Check, show "Correct" or "Not quite. It was N." and a Next button. Record the answer with `valueAsNumber`.
  - Time each set from its first problem to its last answer.
  - Results: two cards (Blocked, Mixed) with `scoreSet` scores and seconds taken, then copy explaining that mixed practice usually feels slower and harder, that it trains choosing the method, and the trial result (`TRIAL_RESULT`: 61% vs 38% a month later, 787 seventh graders) with its source link in a new tab. A "Run it again" button.
  - Focus moves to a phase heading on each phase change (same pattern as Lab 01), with a `role="status"` line.
- [ ] **Step 2:** typecheck passes; lint 0 findings.
- [ ] **Step 3: Commit** `feat: add blocked vs mixed lab widget`.

### Task 5: Page wiring, verification and deploy

**Files:** Modify `app/study/page.tsx` ("The lab" section).

- [ ] **Step 1:** Change the lab intro to cover three experiments and render `<CramVsSpace />` and `<BlockedVsMixed />` after `<RereadVsRecall />`, each with one short framing paragraph.
- [ ] **Step 2:** lint, `npm run typecheck`, `npm test`.
- [ ] **Step 3:** Browser check on the dev server at 375px and desktop, light and dark: presets and day toggles update numbers and chart, empty schedule shows the prompt, fifth day is ignored, blocked and mixed sets run to results, no console errors, no horizontal overflow.
- [ ] **Step 4:** Commit `feat: add cram vs space and blocked vs mixed labs to study page`.
- [ ] **Step 5:** Stop the dev server, `npm run build`, push, `vercel deploy --prod --yes --cwd C:/Users/chigh/Niall-Highland`, verify `https://www.niallhighland.com/study` returns 200.
