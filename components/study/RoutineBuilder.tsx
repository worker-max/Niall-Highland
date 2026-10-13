"use client";

import { useEffect, useRef, useState } from "react";
import { DemoShell } from "@/components/primitives/DemoShell";
import { SUBJECT_ROUTINES } from "@/lib/study/content";
import { StudyInputError } from "@/lib/study/errors";
import { buildPlan, KIND_LABEL, planToIcs, planToText, SESSION_MINUTES, type StudySession } from "@/lib/study/planner";
import { ghostBtn, label, lead, muted, primaryBtn } from "./ui";

const field =
  "rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[color:var(--text)]";

function localToday(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

function formatDay(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function groupByDate(plan: readonly StudySession[]): Array<[string, StudySession[]]> {
  const groups = new Map<string, StudySession[]>();
  for (const s of plan) groups.set(s.date, [...(groups.get(s.date) ?? []), s]);
  return [...groups.entries()];
}

export function RoutineBuilder() {
  const [subjects, setSubjects] = useState<string[]>(["Math"]);
  const [startDate, setStartDate] = useState("");
  const [testDate, setTestDate] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("3");
  const [plan, setPlan] = useState<StudySession[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Today's date is filled in after mount so the server render and the first client render match.
  useEffect(() => {
    setStartDate(localToday());
  }, []);

  function toggleSubject(subject: string) {
    setSubjects((current) => (current.includes(subject) ? current.filter((s) => s !== subject) : [...current, subject]));
  }

  function build() {
    setCopied(false);
    if (testDate === "") {
      setPlan(null);
      setError("Pick your test date first.");
      return;
    }
    try {
      setPlan(buildPlan({ subjects, startDate, testDate, weeklyHours: Number(weeklyHours) }));
      setError(null);
    } catch (e) {
      if (!(e instanceof StudyInputError)) throw e;
      setPlan(null);
      setError(e.message);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      textRef.current?.select();
    }
  }

  function download(ics: string) {
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "study-plan.ics";
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <DemoShell label="Lab 05 · Routine Builder" title="Your plan, dated">
      <div className="flex flex-col gap-[var(--space-6)]">
        <p className={lead}>
          Pick your subjects, your test date and how much time you really have each week. You get a dated plan of
          {` ${SESSION_MINUTES}`}-minute sessions that spaces each subject out and ends with mixed review.
        </p>

        <fieldset className="flex flex-col gap-[var(--space-2)]">
          <legend className={`${label} mb-[var(--space-2)]`}>Subjects</legend>
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {SUBJECT_ROUTINES.map((r) => (
              <label key={r.subject} className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={subjects.includes(r.subject)}
                  onChange={() => toggleSubject(r.subject)}
                  className="peer sr-only"
                />
                <span className="inline-flex rounded-full border border-[color:var(--border)] px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--text-small)] text-[color:var(--text)] peer-checked:border-[color:var(--accent)] peer-checked:bg-[color:var(--accent-tint)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--accent)]">
                  {r.subject}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-[var(--space-4)] sm:grid-cols-3">
          <label className="flex flex-col gap-[var(--space-1)]">
            <span className={muted}>Start</span>
            <input id="plan-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={field} />
          </label>
          <label className="flex flex-col gap-[var(--space-1)]">
            <span className={muted}>Test date</span>
            <input id="plan-test" type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} className={field} />
          </label>
          <label className="flex flex-col gap-[var(--space-1)]">
            <span className={muted}>Hours per week</span>
            <input
              id="plan-hours"
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(e.target.value)}
              className={field}
            />
          </label>
        </div>

        <div>
          <button type="button" className={primaryBtn} onClick={build}>
            Build my plan
          </button>
        </div>

        {error ? (
          <p role="alert" className="text-[color:var(--accent)]">
            {error}
          </p>
        ) : null}

        {plan ? (
          <>
            <p role="status" className={muted}>
              {plan.length} sessions from {formatDay(plan[0]!.date)} to {formatDay(plan[plan.length - 1]!.date)}.
            </p>
            <ol className="flex flex-col gap-[var(--space-4)]">
              {groupByDate(plan).map(([date, sessions]) => (
                <li key={date} className="flex flex-col gap-[var(--space-1)] border-b border-[color:var(--border)] pb-[var(--space-3)]">
                  <p className={label}>{formatDay(date)}</p>
                  {sessions.map((s) => (
                    <p key={`${date}-${s.subject}`} className={muted}>
                      <span className="text-[color:var(--text)]">
                        {s.subject}, {KIND_LABEL[s.kind]}.
                      </span>{" "}
                      {s.task}
                    </p>
                  ))}
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-[var(--space-3)]">
              <button type="button" className={ghostBtn} onClick={() => void copy(planToText(plan))}>
                {copied ? "Copied" : "Copy as text"}
              </button>
              <button type="button" className={ghostBtn} onClick={() => download(planToIcs(plan))}>
                Download calendar (.ics)
              </button>
            </div>
            <textarea
              ref={textRef}
              readOnly
              aria-label="Plan as text"
              value={planToText(plan)}
              rows={4}
              className={`${field} w-full font-mono text-[length:var(--text-caption)]`}
            />
            <p className={muted}>
              Every session follows the engine: retrieve, space, explain, mix. Use the routine for each subject from the table
              above.
            </p>
          </>
        ) : null}
      </div>
    </DemoShell>
  );
}
