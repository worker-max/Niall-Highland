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
  const parts: string[] = [line.slice(0, 75)];
  let rest = line.slice(75);
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
