"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { DemoShell } from "@/components/primitives/DemoShell";
import { StreamingOutput } from "@/components/primitives/StreamingOutput";
import { presets, type OtherTeacherPreset } from "./presets";
import { useOtherTeacherRace } from "./useOtherTeacherRace";

/** Left-pane rotating status (seed §5.1 — "honest visualisation, not a fake human writing"). */
const HUMAN_STATUSES = [
  "Still opening the textbook\u2026",
  "Looking up last year\u2019s lesson plan\u2026",
  "Photocopier jammed again\u2026",
  "Finding the worksheet from 2019\u2026",
  "Trying to remember what the IB guide said\u2026",
];

/** Template skeleton shown in the left pane — headers, no content. */
const HUMAN_TEMPLATE =
  "Learning Objective:\n\n\nStarter:\n\n\nMain Activity:\n\n\nDifferentiation:\n\n\nAssessment:\n\n\nReflection:\n\n\nHomework:\n";

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function OtherTeacher() {
  const race = useOtherTeacherRace();

  const [grade, setGrade] = useState("Grade 9");
  const [subject, setSubject] = useState("Biology");
  const [objective, setObjective] = useState(presets[0]?.objective ?? "");
  const [statusIdx, setStatusIdx] = useState(0);

  // Rotate the left-pane status every 4s while running.
  useEffect(() => {
    if (race.state !== "running") return;
    const id = setInterval(
      () => setStatusIdx((i) => (i + 1) % HUMAN_STATUSES.length),
      4000,
    );
    return () => clearInterval(id);
  }, [race.state]);

  const applyPreset = (p: OtherTeacherPreset) => {
    if (race.state === "running") return;
    setGrade(p.grade);
    setSubject(p.subject);
    setObjective(p.objective);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (race.state === "running") return;
    if (race.state === "finished") race.reset();
    await race.start({ grade, subject, objective });
  };

  const idle = race.state === "idle";
  const running = race.state === "running";
  const finished = race.state === "finished";
  const clock = useMemo(
    () => formatClock(running ? race.remaining : finished ? 0 : 5 * 60),
    [race.remaining, running, finished],
  );

  const rateLimited = race.error?.includes("rate limit");

  return (
    <DemoShell
      id="demo-the-other-teacher"
      label="P1 · The Other Teacher"
      title={running ? `Timer: ${clock}` : finished ? "Race over" : "Ready"}
      variant="ai-native"
      active={running}
      description={
        <p className="max-w-[var(--width-reading)] text-[length:var(--text-body)]">
          Same objective. Five minutes on the clock. One teacher plans by hand.
          One teaches alongside AI. This is the difference the seed document
          calls out — made visceral.
        </p>
      }
      footer={
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          This isn&rsquo;t a parlor trick. This is what a teacher using AI
          produces in five minutes. Imagine twenty teachers doing this every
          week.
        </p>
      }
    >
      <form
        onSubmit={onSubmit}
        className="mb-[var(--space-8)] flex flex-col gap-[var(--space-4)]"
      >
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              disabled={running}
              className={cn(
                "rounded-full border border-[color:var(--border)] px-[var(--space-4)] py-[var(--space-2)]",
                "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]",
                "text-[color:var(--text-muted)] transition-colors",
                "hover:border-[color:var(--accent)] hover:text-[color:var(--text)]",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid gap-[var(--space-4)] md:grid-cols-[160px_240px_1fr]">
          <label className="flex flex-col gap-[var(--space-1)]">
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              Grade
            </span>
            <input
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              disabled={running}
              maxLength={40}
              required
              className={cn(
                "rounded-[2px] border border-[color:var(--border)]",
                "bg-[color:var(--ink-900)] px-[var(--space-3)] py-[var(--space-2)]",
                "font-mono text-[length:var(--text-small)] text-[color:var(--text)]",
                "focus:border-[color:var(--accent)] focus:outline-none",
                "disabled:opacity-50",
              )}
            />
          </label>
          <label className="flex flex-col gap-[var(--space-1)]">
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              Subject
            </span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={running}
              maxLength={60}
              required
              className={cn(
                "rounded-[2px] border border-[color:var(--border)]",
                "bg-[color:var(--ink-900)] px-[var(--space-3)] py-[var(--space-2)]",
                "font-mono text-[length:var(--text-small)] text-[color:var(--text)]",
                "focus:border-[color:var(--accent)] focus:outline-none",
                "disabled:opacity-50",
              )}
            />
          </label>
          <label className="flex flex-col gap-[var(--space-1)]">
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              Learning objective
            </span>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              disabled={running}
              maxLength={400}
              rows={2}
              required
              className={cn(
                "rounded-[2px] border border-[color:var(--border)]",
                "bg-[color:var(--ink-900)] px-[var(--space-3)] py-[var(--space-2)]",
                "font-mono text-[length:var(--text-small)] text-[color:var(--text)]",
                "focus:border-[color:var(--accent)] focus:outline-none",
                "disabled:opacity-50",
                "resize-none",
              )}
            />
          </label>
        </div>

        <div className="flex items-center gap-[var(--space-4)]">
          <button
            type="submit"
            disabled={running || objective.trim().length < 3}
            className={cn(
              "inline-flex items-center gap-[var(--space-2)] rounded-full",
              "border border-[color:var(--signal)] bg-[color:var(--signal)]",
              "px-[var(--space-6)] py-[var(--space-3)]",
              "font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)]",
              "text-[color:var(--ink-900)] transition-opacity",
              "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {idle ? "Start the race" : running ? "Running\u2026" : "Try another"}
          </button>
          {finished ? (
            <button
              type="button"
              onClick={race.reset}
              className={cn(
                "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]",
                "text-[color:var(--text-faint)] hover:text-[color:var(--text)]",
              )}
            >
              Reset
            </button>
          ) : null}
          <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            {running ? `${clock} remaining` : finished ? "0:00 remaining" : "5:00 on the clock"}
          </span>
        </div>
      </form>

      <div className="grid gap-[var(--space-6)] lg:grid-cols-2">
        {/* Left pane — Teacher A, planning by hand */}
        <div className="flex flex-col gap-[var(--space-3)]">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-[length:var(--text-h3)] text-[color:var(--text-muted)]">
              Teacher A
            </h3>
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              Planning by hand
            </span>
          </div>
          <div
            className={cn(
              "relative min-h-[28rem] rounded-[2px] border border-[color:var(--border)]",
              "bg-[color:var(--ink-800)] p-[var(--space-6)]",
              "font-mono text-[length:var(--text-small)] leading-[var(--leading-mono)]",
              "text-[color:var(--text-faint)]",
            )}
          >
            <pre className="whitespace-pre-wrap opacity-40">{HUMAN_TEMPLATE}</pre>
            {running ? (
              <span
                aria-hidden="true"
                className="absolute left-[var(--space-6)] top-[calc(var(--space-6)+1.4em)] inline-block h-[1em] w-[0.5ch] translate-y-[2px] bg-[color:var(--text-faint)] animate-pulse"
              />
            ) : null}
          </div>
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            {idle
              ? "Waiting for start"
              : running
                ? HUMAN_STATUSES[statusIdx]
                : finished
                  ? "0% complete"
                  : ""}
          </p>
        </div>

        {/* Right pane — Teacher B, planning with AI */}
        <div className="flex flex-col gap-[var(--space-3)]">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-[length:var(--text-h3)] text-[color:var(--text)]">
              Teacher B
            </h3>
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--signal)]">
              Planning with AI
            </span>
          </div>
          <StreamingOutput
            content={race.content}
            streaming={race.streaming}
            placeholder={idle ? "Press start to begin." : "Contacting model\u2026"}
            className="min-h-[28rem]"
          />
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--signal)]">
            {idle
              ? "Standing by"
              : running
                ? `Streaming\u2026 ${race.content.length.toLocaleString()} chars`
                : race.error
                  ? "Error"
                  : "Ready to teach"}
          </p>
        </div>
      </div>

      {race.error ? (
        <div
          role="alert"
          className={cn(
            "mt-[var(--space-6)] rounded-[2px] border border-[color:var(--danger-500)]",
            "bg-[color:var(--ink-900)] p-[var(--space-4)]",
            "text-[length:var(--text-small)] text-[color:var(--text-muted)]",
          )}
        >
          {race.error}
          {rateLimited ? (
            <>
              {" "}
              <a
                href="#contact"
                className="underline decoration-[color:var(--accent)] underline-offset-4"
              >
                Book a call
              </a>{" "}
              to see the full version.
            </>
          ) : null}
        </div>
      ) : null}

      {finished && !race.error ? (
        <div
          data-surface="dark"
          className="mt-[var(--space-8)] rounded-[2px] border border-[color:var(--accent)] bg-[color:var(--accent-900)] p-[var(--space-6)]"
        >
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--signal)]">
            What Teacher B did with the other{" "}
            {Math.max(0, 5 - Math.ceil(race.elapsed / 60))} minutes
          </p>
          <p className="mt-[var(--space-3)] text-[length:var(--text-body)] text-[color:var(--text)]">
            Built a three-tier differentiated homework set. Drafted the parent
            email explaining how AI is used in the unit. Roughed in next
            week&rsquo;s formative assessment. Got a coffee.
          </p>
          <a
            href="#engage"
            className={cn(
              "mt-[var(--space-4)] inline-flex items-center gap-[var(--space-2)]",
              "font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)]",
              "text-[color:var(--signal)] hover:text-[color:var(--paper-50)]",
            )}
          >
            Want this capability for your whole faculty?
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      ) : null}
    </DemoShell>
  );
}
