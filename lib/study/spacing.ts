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

export interface CurvePoint {
  day: number;
  value: number;
}

/**
 * Chart points from the first session to `horizonDays`. At each later session the
 * curve steps straight up (two points on that day), so no line implies memory
 * building on a day without study. Empty schedule gives no points.
 */
export function retentionPoints(sessionDays: readonly number[], horizonDays: number): CurvePoint[] {
  if (sessionDays.length === 0) return [];
  const sorted = [...sessionDays].sort((a, b) => a - b);
  const first = sorted[0] as number;
  const points: CurvePoint[] = [];
  for (let day = first; day <= horizonDays; day += 1) {
    const before = sorted.filter((d) => d < day);
    if (sorted.includes(day) && before.length > 0) {
      points.push({ day, value: forecastRetention(before, day) });
    }
    points.push({ day, value: forecastRetention(sorted.filter((d) => d <= day), day) });
  }
  return points;
}

/** Which preset a schedule matches, if any. */
export function matchPreset(days: readonly number[]): "cram" | "spaced" | null {
  const key = [...days].sort((a, b) => a - b).join(",");
  if (key === CRAM_PRESET.join(",")) return "cram";
  if (key === SPACED_PRESET.join(",")) return "spaced";
  return null;
}

/** Add or remove a study day. Ignores days outside the plan and a fifth session. */
export function toggleSessionDay(days: readonly number[], day: number): number[] {
  if (!Number.isInteger(day) || day < 0 || day >= TEST_DAY) return [...days];
  if (days.includes(day)) return days.filter((d) => d !== day);
  if (days.length >= SESSION_COUNT) return [...days];
  return [...days, day].sort((a, b) => a - b);
}
