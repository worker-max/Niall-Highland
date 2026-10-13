import { describe, expect, it } from "vitest";
import { StudyInputError } from "../errors";
import { addDays, buildPlan, MAX_SESSIONS_PER_DAY, planToIcs, planToText } from "../planner";

const base = { subjects: ["Math", "History"], startDate: "2026-10-12", testDate: "2026-10-26", weeklyHours: 2 };

describe("buildPlan", () => {
  it("keeps every session between the start and the day before the test, in date order", () => {
    const plan = buildPlan(base);
    const dates = plan.map((s) => s.date);
    expect([...dates].sort()).toEqual(dates);
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

  it("finishes on the day before the test", () => {
    for (const input of [
      base,
      { ...base, subjects: ["Math", "History", "Biology"], weeklyHours: 3, testDate: "2026-11-23" },
      { ...base, subjects: ["Math"], weeklyHours: 1, testDate: "2026-11-23" },
      { ...base, subjects: ["Math"], weeklyHours: 1, testDate: "2026-10-15" },
    ]) {
      const plan = buildPlan(input);
      expect(plan[plan.length - 1]!.date).toBe(addDays(input.testDate, -1));
    }
  });

  it("includes every subject the student picked", () => {
    const all = ["Math", "Biology", "Chemistry & physics", "English & essays", "History", "World languages", "Computer science", "Exams (SAT, AP, IB)"];
    for (const input of [
      { ...base, subjects: all.slice(0, 4), weeklyHours: 1, testDate: "2026-10-19" },
      { ...base, subjects: all, weeklyHours: 2, testDate: "2026-10-19" },
      { ...base, subjects: all.slice(0, 5), weeklyHours: 1 },
    ]) {
      const covered = new Set(buildPlan(input).map((s) => s.subject));
      expect(covered.size).toBe(input.subjects.length);
    }
  });

  it("rejects more subjects than the days can hold", () => {
    expect(() => buildPlan({ ...base, subjects: ["Math", "History", "Biology", "World languages"], testDate: "2026-10-13" })).toThrow(
      StudyInputError,
    );
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
    expect(ics).toContain("DTSTART;VALUE=DATE:20261025");
    expect(ics.replace(/\r\n/g, "").includes("\n")).toBe(false);
  });

  it("folds long lines", () => {
    for (const line of ics.split("\r\n")) expect(line.length).toBeLessThanOrEqual(75);
  });

  it("escapes commas and semicolons in text", () => {
    expect(ics.replace(/\r\n /g, "")).toContain("\\;");
  });

  it("gives different plans different event IDs so imports never overwrite each other", () => {
    const uids = (text: string): string[] => text.replace(/\r\n /g, "").match(/UID:[^\r]+/g) ?? [];
    const other = planToIcs(buildPlan({ ...base, subjects: ["Biology"], testDate: "2026-11-09" }));
    const overlap = uids(ics).filter((u) => uids(other).includes(u));
    expect(overlap).toEqual([]);
    expect(uids(planToIcs(buildPlan(base)))).toEqual(uids(ics));
  });
});

describe("planToText", () => {
  it("writes one dated line per session", () => {
    const lines = planToText(buildPlan(base)).split("\n");
    expect(lines).toHaveLength(8);
    expect(lines[0]).toMatch(/^(Mon|Tue) 1[23] Oct: Math, learn \(30 min\)$/);
  });
});
