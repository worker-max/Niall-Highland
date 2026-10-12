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
