# Study Page Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish `niallhighland.com/study`: the five-differences self-check (section 03), the Routine Builder with copyable text and a downloadable `.ics` calendar (section 04), and the final parents and teachers section.

**Architecture:** Two pure modules, `support.ts` (questions, scoring, advice, evaluation flag) and `planner.ts` (dated spaced plan, `.ics` and text export), with vitest tests. Two client widgets render them in `DemoShell` using `components/study/ui.ts`.

**Tech Stack:** Next.js 15, React 19, Tailwind v4 tokens, TypeScript strict, vitest.

**Spec:** `docs/superpowers/specs/2026-10-11-study-resource-page-design.md`

## Global Constraints

- Repo `C:/Users/chigh/Niall-Highland`, branch `feat/study-resource-page`. npm.
- `lib/study/` imports nothing from React, Next or `@/`.
- TypeScript strict, no `any`. No student data leaves the browser (no storage, no network).
- Copy passes `ai_tell_lint.py` with 0 findings; no em/en dashes or `--`. Niall's student voice.
- Doctrine rules 3 and 6: support never labels; no diagnosis, persistent difficulty routes to a qualified evaluation.
- Dates are calendar dates (`YYYY-MM-DD`) handled in UTC so time zones never shift a session.
- Never run `npm run build` while a dev server is running.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A student picks a test date on or before the start date: a plain error, no plan. (Task 2 test: "rejects a test date that is not after the start")
2. A student picks one subject and many hours: a subject never appears twice on one day. (Task 2 test: "never schedules a subject twice on one day")
3. Long routine text in the calendar file breaks some calendar apps: every `.ics` line is folded to 75 characters or fewer. (Task 2 test: "folds long lines")
4. The self-check result reads like a label or a diagnosis: no advice contains the word "style", and the evaluation note only appears for persistent reading or organization difficulty. (Task 1 tests: "never mentions styles", "suggests an evaluation only for persistent reading or organization difficulty")
5. A student submits the self-check with questions unanswered: it is rejected, never scored as zero. (Task 1 test: "rejects missing or invalid answers")

---

### Task 1: Support self-check logic

**Files:** Create `lib/study/support.ts`; Test `lib/study/__tests__/support.test.ts`.

**Interfaces:**
- Produces: `type SupportArea = "prior-knowledge" | "reading" | "executive-function" | "self-regulation" | "test-anxiety"`; `type SupportLevel = "on-track" | "some" | "more"`; `FREQUENCY_LABELS: readonly ["Rarely", "Sometimes", "Often"]`; `interface SupportQuestion { id: string; area: SupportArea; text: string }`; `SUPPORT_QUESTIONS` (10, two per area); `AREA_LABEL`; `LEVEL_LABEL`; `interface AreaResult { area; label: string; score: number; level: SupportLevel; advice: string }`; `interface SupportResult { areas: AreaResult[]; suggestEvaluation: boolean; suggestCounselor: boolean }`; `assessSupport(answers: Readonly<Record<string, number>>): SupportResult`.
- Scoring: each answer 0, 1 or 2; area score is the sum (0 to 4); level `on-track` at 0 to 1, `some` at 2, `more` at 3 to 4. `suggestEvaluation` when reading or executive-function scores 4. `suggestCounselor` when test-anxiety scores 4.

- [ ] **Step 1: Failing test** `lib/study/__tests__/support.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { StudyInputError } from "../errors";
import { assessSupport, SUPPORT_QUESTIONS, type SupportArea } from "../support";

function answersWith(scores: Partial<Record<SupportArea, readonly [number, number]>>): Record<string, number> {
  const seen: Partial<Record<SupportArea, number>> = {};
  return Object.fromEntries(
    SUPPORT_QUESTIONS.map((q) => {
      const i = seen[q.area] ?? 0;
      seen[q.area] = i + 1;
      return [q.id, scores[q.area]?.[i] ?? 0];
    }),
  );
}

describe("SUPPORT_QUESTIONS", () => {
  it("has two questions for each of the five areas", () => {
    expect(SUPPORT_QUESTIONS).toHaveLength(10);
    const areas = new Set(SUPPORT_QUESTIONS.map((q) => q.area));
    expect(areas.size).toBe(5);
  });
});

describe("assessSupport", () => {
  it("maps area scores to levels", () => {
    const result = assessSupport(answersWith({ reading: [1, 1], "test-anxiety": [2, 1], "prior-knowledge": [1, 0] }));
    const level = (a: SupportArea) => result.areas.find((r) => r.area === a)?.level;
    expect(level("prior-knowledge")).toBe("on-track");
    expect(level("reading")).toBe("some");
    expect(level("test-anxiety")).toBe("more");
  });

  it("suggests an evaluation only for persistent reading or organization difficulty", () => {
    expect(assessSupport(answersWith({ reading: [2, 1] })).suggestEvaluation).toBe(false);
    expect(assessSupport(answersWith({ reading: [2, 2] })).suggestEvaluation).toBe(true);
    expect(assessSupport(answersWith({ "executive-function": [2, 2] })).suggestEvaluation).toBe(true);
    expect(assessSupport(answersWith({ "self-regulation": [2, 2] })).suggestEvaluation).toBe(false);
  });

  it("suggests talking to a counselor only for maximum test anxiety", () => {
    expect(assessSupport(answersWith({ "test-anxiety": [2, 2] })).suggestCounselor).toBe(true);
    expect(assessSupport(answersWith({ "test-anxiety": [2, 1] })).suggestCounselor).toBe(false);
  });

  it("never mentions styles", () => {
    for (const scores of [{}, { reading: [2, 2] }, { reading: [1, 1] }] as const) {
      for (const r of assessSupport(answersWith(scores)).areas) expect(r.advice.toLowerCase()).not.toContain("style");
    }
  });

  it("rejects missing or invalid answers", () => {
    const answers = answersWith({});
    delete answers[SUPPORT_QUESTIONS[0]!.id];
    expect(() => assessSupport(answers)).toThrow(StudyInputError);
    expect(() => assessSupport({ ...answersWith({}), [SUPPORT_QUESTIONS[1]!.id]: 3 })).toThrow(StudyInputError);
  });
});
```

- [ ] **Step 2:** `npm test` fails (cannot resolve `../support`).
- [ ] **Step 3: Implement** `lib/study/support.ts`:

```ts
import { StudyInputError } from "./errors";

export type SupportArea = "prior-knowledge" | "reading" | "executive-function" | "self-regulation" | "test-anxiety";
export type SupportLevel = "on-track" | "some" | "more";

export const FREQUENCY_LABELS = ["Rarely", "Sometimes", "Often"] as const;

export interface SupportQuestion {
  id: string;
  area: SupportArea;
  text: string;
}

export const SUPPORT_QUESTIONS: readonly SupportQuestion[] = [
  { id: "pk1", area: "prior-knowledge", text: "New topics feel like they come out of nowhere." },
  { id: "pk2", area: "prior-knowledge", text: "I get lost in the first lesson of a new unit." },
  { id: "rd1", area: "reading", text: "I have to reread sentences to understand them." },
  { id: "rd2", area: "reading", text: "Reading for school takes me much longer than it takes my friends." },
  { id: "ef1", area: "executive-function", text: "I lose track of deadlines or start assignments late." },
  { id: "ef2", area: "executive-function", text: "Getting started on schoolwork is the hardest part." },
  { id: "sr1", area: "self-regulation", text: "I study by rereading my notes until they feel familiar." },
  { id: "sr2", area: "self-regulation", text: "My test scores surprise me." },
  { id: "ta1", area: "test-anxiety", text: "My mind goes blank in tests even when I knew the material." },
  { id: "ta2", area: "test-anxiety", text: "Worry about tests makes it hard to sleep or eat." },
];

export const AREA_LABEL: Readonly<Record<SupportArea, string>> = {
  "prior-knowledge": "Prior knowledge",
  reading: "Reading",
  "executive-function": "Organization",
  "self-regulation": "Checking what you know",
  "test-anxiety": "Test nerves",
};

export const LEVEL_LABEL: Readonly<Record<SupportLevel, string>> = {
  "on-track": "On track",
  some: "Some support",
  more: "More support",
};

const ADVICE: Readonly<Record<SupportArea, Readonly<Record<SupportLevel, string>>>> = {
  "prior-knowledge": {
    "on-track": "New material has something to hook onto. Keep reviewing old units so it stays that way.",
    some: "Before each new unit, spend ten minutes on the basics it builds on. Worked examples help more than jumping straight into problems.",
    more: "Ask for worked examples and a short review of the foundations before working alone. Filling gaps first makes everything after it faster.",
  },
  reading: {
    "on-track": "Reading is working for you. Make it count: read once, then recall.",
    some: "Read a section, then summarize it from memory before moving on. Audio versions of long texts can help you keep pace while your reading speeds up.",
    more: "Ask your school about reading support, and use audio for long assignments so the content keeps pace. Reading is a skill that improves at any age.",
  },
  "executive-function": {
    "on-track": "You manage deadlines well. A weekly plan will still make your study time count.",
    some: "Write every deadline in one place and break big assignments into small, dated steps. Put your phone in another room while you work.",
    more: "Use a pre-built schedule and a checklist for every assignment, and ask an adult to look over the plan each week. More structure makes the same work easier to start.",
  },
  "self-regulation": {
    "on-track": "You already check what you know. Keep using self-tests in place of rereading.",
    some: "Swap rereading for closing the book and writing what you remember. Predict your score before practice quizzes and compare.",
    more: "You may be studying hard in ways that feel productive and do little. Plan the week, test yourself without notes, and redo what you got wrong a few days later.",
  },
  "test-anxiety": {
    "on-track": "Nerves are staying out of your way. Timed practice keeps it that way.",
    some: "Take short timed practice tests often so the real one feels familiar. A racing heart before a test is your body getting ready.",
    more: "Frequent low-stakes timed practice helps most. If worry is affecting your sleep or eating, talk to a school counselor or a parent.",
  },
};

export interface AreaResult {
  area: SupportArea;
  label: string;
  score: number;
  level: SupportLevel;
  advice: string;
}

export interface SupportResult {
  areas: AreaResult[];
  suggestEvaluation: boolean;
  suggestCounselor: boolean;
}

const AREAS: readonly SupportArea[] = ["prior-knowledge", "reading", "executive-function", "self-regulation", "test-anxiety"];

function levelFor(score: number): SupportLevel {
  if (score >= 3) return "more";
  if (score === 2) return "some";
  return "on-track";
}

export function assessSupport(answers: Readonly<Record<string, number>>): SupportResult {
  const totals: Record<SupportArea, number> = {
    "prior-knowledge": 0,
    reading: 0,
    "executive-function": 0,
    "self-regulation": 0,
    "test-anxiety": 0,
  };
  for (const q of SUPPORT_QUESTIONS) {
    const a = answers[q.id];
    if (a === undefined) throw new StudyInputError("Answer every statement to see your results.");
    if (a !== 0 && a !== 1 && a !== 2) throw new StudyInputError("Each answer must be Rarely, Sometimes or Often.");
    totals[q.area] += a;
  }
  const areas = AREAS.map((area) => {
    const level = levelFor(totals[area]);
    return { area, label: AREA_LABEL[area], score: totals[area], level, advice: ADVICE[area][level] };
  });
  return {
    areas,
    suggestEvaluation: totals.reading === 4 || totals["executive-function"] === 4,
    suggestCounselor: totals["test-anxiety"] === 4,
  };
}
```

- [ ] **Step 4:** `npm test` passes. Lint `lib/study/support.ts`.
- [ ] **Step 5: Commit** `feat: add five-differences support self-check logic`.

---

### Task 2: Routine planner and calendar export

**Files:** Create `lib/study/planner.ts`; Test `lib/study/__tests__/planner.test.ts`.

**Interfaces:**
- Consumes: `SUBJECT_ROUTINES` (`./content`), `StudyInputError`.
- Produces: `SESSION_MINUTES = 30`, `MAX_SESSIONS_PER_DAY = 3`, `MAX_PLAN_DAYS = 120`; `type SessionKind = "learn" | "self-test" | "mixed-review"`; `KIND_LABEL`; `interface PlanInput { subjects: readonly string[]; startDate: string; testDate: string; weeklyHours: number }`; `interface StudySession { date: string; subject: string; kind: SessionKind; task: string; routine: string }`; `buildPlan(input: PlanInput): StudySession[]`; `planToIcs(plan: readonly StudySession[]): string`; `planToText(plan: readonly StudySession[]): string`; `addDays(iso: string, days: number): string`.
- Algorithm: study days run from `startDate` to the day before `testDate`. Total sessions = round(weeklyHours × 60 / 30 × days / 7), at least 1, capped at days × min(3, subject count). Session k lands on day floor(k × days / total), rotating through subjects, so each subject recurs every few days (spacing). Each subject's first session is `learn`, every third after that is `mixed-review`, the rest `self-test`. Every session on the final study day is `mixed-review`.

- [ ] **Step 1: Failing test** `lib/study/__tests__/planner.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { StudyInputError } from "../errors";
import { addDays, buildPlan, MAX_SESSIONS_PER_DAY, planToIcs, planToText } from "../planner";

const base = { subjects: ["Math", "History"], startDate: "2026-10-12", testDate: "2026-10-26", weeklyHours: 2 };

describe("buildPlan", () => {
  it("keeps every session between the start and the day before the test, in date order", () => {
    const plan = buildPlan(base);
    const dates = plan.map((s) => s.date);
    expect([...dates].sort()).toEqual(dates);
    expect(dates[0]).toBe("2026-10-12");
    for (const d of dates) {
      expect(d >= base.startDate).toBe(true);
      expect(d < base.testDate).toBe(true);
    }
  });

  it("scales the number of sessions with weekly hours", () => {
    expect(buildPlan(base)).toHaveLength(8);
    expect(buildPlan({ ...base, weeklyHours: 4 })).toHaveLength(16);
  });

  it("starts each subject with a learn session and ends with mixed review", () => {
    const plan = buildPlan(base);
    for (const subject of base.subjects) expect(plan.find((s) => s.subject === subject)?.kind).toBe("learn");
    const lastDay = plan[plan.length - 1]!.date;
    for (const s of plan.filter((p) => p.date === lastDay)) expect(s.kind).toBe("mixed-review");
  });

  it("never schedules a subject twice on one day", () => {
    const plan = buildPlan({ ...base, subjects: ["Math"], weeklyHours: 20 });
    const days = plan.map((s) => s.date);
    expect(new Set(days).size).toBe(days.length);
  });

  it("caps sessions per day", () => {
    const plan = buildPlan({ ...base, subjects: ["Math", "History", "Biology", "World languages"], weeklyHours: 20 });
    const perDay = new Map<string, number>();
    for (const s of plan) perDay.set(s.date, (perDay.get(s.date) ?? 0) + 1);
    for (const n of perDay.values()) expect(n).toBeLessThanOrEqual(MAX_SESSIONS_PER_DAY);
  });

  it("attaches the routine for each subject", () => {
    expect(buildPlan(base)[0]!.routine.length).toBeGreaterThan(20);
  });

  it("rejects a test date that is not after the start", () => {
    expect(() => buildPlan({ ...base, testDate: "2026-10-12" })).toThrow(StudyInputError);
  });

  it("rejects bad input", () => {
    expect(() => buildPlan({ ...base, startDate: "12/10/2026" })).toThrow(StudyInputError);
    expect(() => buildPlan({ ...base, weeklyHours: 0 })).toThrow(StudyInputError);
    expect(() => buildPlan({ ...base, weeklyHours: 21 })).toThrow(StudyInputError);
    expect(() => buildPlan({ ...base, subjects: [] })).toThrow(StudyInputError);
    expect(() => buildPlan({ ...base, subjects: ["Juggling"] })).toThrow(StudyInputError);
    expect(() => buildPlan({ ...base, testDate: "2027-06-01" })).toThrow(StudyInputError);
  });
});

describe("addDays", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
  });
});

describe("planToIcs", () => {
  const ics = planToIcs(buildPlan(base));

  it("wraps one all-day event per session in a calendar with CRLF lines", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(8);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261012");
    expect(ics.replace(/\r\n/g, "").includes("\n")).toBe(false);
  });

  it("folds long lines", () => {
    for (const line of ics.split("\r\n")) expect(line.length).toBeLessThanOrEqual(75);
  });

  it("escapes commas and semicolons in text", () => {
    expect(ics.replace(/\r\n /g, "")).toContain("\\;");
  });
});

describe("planToText", () => {
  it("writes one dated line per session", () => {
    const lines = planToText(buildPlan(base)).split("\n");
    expect(lines).toHaveLength(8);
    expect(lines[0]).toBe("Mon 12 Oct: Math, learn (30 min)");
  });
});
```

- [ ] **Step 2:** `npm test` fails (cannot resolve `../planner`).
- [ ] **Step 3: Implement** `lib/study/planner.ts`:

```ts
import { SUBJECT_ROUTINES } from "./content";
import { StudyInputError } from "./errors";

export const SESSION_MINUTES = 30;
export const MAX_SESSIONS_PER_DAY = 3;
export const MAX_PLAN_DAYS = 120;

export type SessionKind = "learn" | "self-test" | "mixed-review";

export const KIND_LABEL: Readonly<Record<SessionKind, string>> = {
  learn: "learn",
  "self-test": "self-test",
  "mixed-review": "mixed review",
};

const TASK: Readonly<Record<SessionKind, string>> = {
  learn: "Learn the new material, then close the book, write what you remember and check it.",
  "self-test": "Close the book, test yourself and fix what you missed.",
  "mixed-review": "Mixed review: old and new material together, against the clock.",
};

export interface PlanInput {
  subjects: readonly string[];
  startDate: string;
  testDate: string;
  weeklyHours: number;
}

export interface StudySession {
  date: string;
  subject: string;
  kind: SessionKind;
  task: string;
  routine: string;
}

const DAY_MS = 86_400_000;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

function parseDay(iso: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new StudyInputError("Dates must look like 2026-10-12.");
  const ms = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(ms)) throw new StudyInputError(`"${iso}" is not a real date.`);
  return Math.round(ms / DAY_MS);
}

function isoFromDay(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  return isoFromDay(parseDay(iso) + days);
}

export function buildPlan(input: PlanInput): StudySession[] {
  const start = parseDay(input.startDate);
  const test = parseDay(input.testDate);
  const days = test - start;
  if (days < 1) throw new StudyInputError("Pick a test date after your start date.");
  if (days > MAX_PLAN_DAYS) throw new StudyInputError(`Plans can cover up to ${MAX_PLAN_DAYS} days. Pick a closer test date.`);
  if (!Number.isFinite(input.weeklyHours) || input.weeklyHours < 1 || input.weeklyHours > 20) {
    throw new StudyInputError("Weekly study time must be between 1 and 20 hours.");
  }
  if (input.subjects.length === 0) throw new StudyInputError("Pick at least one subject.");
  const routines = input.subjects.map((subject) => {
    const r = SUBJECT_ROUTINES.find((s) => s.subject === subject);
    if (!r) throw new StudyInputError(`"${subject}" is not one of the listed subjects.`);
    return r;
  });

  const perDayCap = Math.min(MAX_SESSIONS_PER_DAY, routines.length);
  const wanted = Math.round(((input.weeklyHours * 60) / SESSION_MINUTES) * (days / 7));
  const total = Math.max(1, Math.min(wanted, days * perDayCap));
  const seen = new Map<string, number>();
  const sessions: StudySession[] = [];

  for (let k = 0; k < total; k += 1) {
    const day = Math.floor((k * days) / total);
    const routine = routines[k % routines.length]!;
    const count = seen.get(routine.subject) ?? 0;
    seen.set(routine.subject, count + 1);
    const kind: SessionKind = count === 0 ? "learn" : count % 3 === 2 ? "mixed-review" : "self-test";
    sessions.push({ date: isoFromDay(start + day), subject: routine.subject, kind, task: TASK[kind], routine: routine.routine });
  }

  const lastDay = sessions[sessions.length - 1]!.date;
  return sessions.map((s) =>
    s.date === lastDay && s.kind !== "learn" ? { ...s, kind: "mixed-review", task: TASK["mixed-review"] } : s,
  );
}

function escapeText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function fold(line: string): string {
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  return parts.join("\r\n");
}

export function planToIcs(plan: readonly StudySession[]): string {
  const compact = (iso: string) => iso.replace(/-/g, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Niall Highland//Study Lab//EN", "CALSCALE:GREGORIAN"];
  plan.forEach((s, i) => {
    lines.push(
      "BEGIN:VEVENT",
      `UID:study-${i + 1}-${compact(s.date)}@niallhighland.com`,
      `DTSTAMP:${compact(plan[0]!.date)}T000000Z`,
      `DTSTART;VALUE=DATE:${compact(s.date)}`,
      `DTEND;VALUE=DATE:${compact(addDays(s.date, 1))}`,
      `SUMMARY:${escapeText(`Study: ${s.subject} (${KIND_LABEL[s.kind]})`)}`,
      `DESCRIPTION:${escapeText(`${s.task} Routine: ${s.routine}`)}`,
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

export function planToText(plan: readonly StudySession[]): string {
  return plan
    .map((s) => {
      const d = new Date(`${s.date}T00:00:00Z`);
      return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}: ${s.subject}, ${KIND_LABEL[s.kind]} (${SESSION_MINUTES} min)`;
    })
    .join("\n");
}
```

Note: the final-day rule leaves a subject's first `learn` session alone (a subject first met on the last day is still learning), so the "ends with mixed review" test uses two subjects whose first sessions come earlier.

- [ ] **Step 4:** `npm test` passes. Lint `lib/study/planner.ts`.
- [ ] **Step 5: Commit** `feat: add routine planner with calendar and text export`.

---

### Task 3: Support self-check widget

**Files:** Create `components/study/SupportCheck.tsx`.

- [ ] **Step 1: Write the component** (requirements): `DemoShell` labeled "Lab 04 · Five things check", title "About 2 minutes". A short intro saying it is a conversation starter, not a test or a diagnosis, and that nothing leaves the page. Each of the ten `SUPPORT_QUESTIONS` is a `fieldset` with a `legend` and three native radio inputs styled as pills (`FREQUENCY_LABELS`). A "Show my results" button disabled until all ten are answered. Results: one row per area with `AREA_LABEL`, a level chip (`LEVEL_LABEL`) and the advice. If `suggestEvaluation`, a caution note recommending a conversation with the school about a proper evaluation if the difficulty persists despite good teaching. If `suggestCounselor`, a note about talking to a counselor or parent. Focus moves to the results heading on submit (use `usePhaseFocus`), with a `role="status"` line. "Start over" clears answers.
- [ ] **Step 2:** typecheck, lint 0. **Step 3: Commit** `feat: add five-things support check widget`.

### Task 4: Routine Builder widget

**Files:** Create `components/study/RoutineBuilder.tsx`.

- [ ] **Step 1: Write the component** (requirements): `DemoShell` labeled "Lab 05 · Routine Builder". Subject checkboxes from `SUBJECT_ROUTINES`. Start date input (filled with today's local date after mount, to avoid a hydration mismatch), test date input, weekly hours number input (1 to 20, default 3). "Build my plan" calls `buildPlan`; a `StudyInputError` shows its message inline in a `role="alert"` paragraph. The plan shows as a list grouped by date (weekday, date, then each subject with kind and the task), followed by "Copy as text" (clipboard, inside the click handler, falling back to selecting a read-only textarea with the text) and "Download calendar (.ics)" (Blob, object URL, a temporary anchor with `download="study-plan.ics"`, revoked after click). A closing line: every session follows the engine (retrieve, space, explain, mix) and the subject routine from the table above.
- [ ] **Step 2:** typecheck, lint 0. **Step 3: Commit** `feat: add routine builder widget`.

### Task 5: Page wiring, parents and teachers section, verification, deploy

**Files:** Modify `app/study/page.tsx`.

- [ ] **Step 1:** Render `<SupportCheck />` after the "What each difference changes" table in section 03, and `<RoutineBuilder />` after the routines table in section 04, each with one framing sentence. Extend "For parents and teachers" with a short paragraph on using the labs together (run Lab 01 side by side, build the routine together, review it on Sundays) and keep the coaching checklist.
- [ ] **Step 2:** lint, typecheck, `npm test`.
- [ ] **Step 3:** Browser check at 375px and desktop, light and dark: self-check disabled until complete, results and notes render; Routine Builder errors on a past test date, builds a plan, copy works, the `.ics` downloads with the right event count; no console errors; no horizontal overflow.
- [ ] **Step 4:** Commit `feat: add support check, routine builder and parent guidance to study page`.
- [ ] **Step 5:** Final review, fixes, stop the dev server, build, push, deploy, verify 200.
