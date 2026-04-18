"use client";

import { useCallback, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { DemoShell } from "@/components/primitives/DemoShell";
import { StreamingOutput } from "@/components/primitives/StreamingOutput";
import { track } from "@/lib/analytics";

type Status = "idle" | "streaming" | "done" | "errored";

export function LessonPlanAlchemist() {
  const [topic, setTopic] = useState(
    "Photosynthesis — the relationship between light intensity and oxygen production.",
  );
  const [grade, setGrade] = useState("Grade 9");
  const [duration, setDuration] = useState(50);
  const [status, setStatus] = useState<Status>("idle");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (status === "streaming") return;
      setStatus("streaming");
      setContent("");
      setError(null);
      track("demo_started", { demo: "lesson-plan", grade, duration });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/demos/lesson-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, grade, duration }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          const msg =
            typeof detail?.error === "string"
              ? detail.error
              : `Request failed (${res.status})`;
          if (res.status === 429) {
            track("demo_rate_limited", { demo: "lesson-plan" });
          }
          throw new Error(msg);
        }
        const body = res.body;
        if (!body) throw new Error("No stream from server.");

        const reader = body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            setContent((prev) => prev + decoder.decode(value, { stream: true }));
          }
        }
        setStatus("done");
        track("demo_completed", { demo: "lesson-plan" });
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
        setStatus("errored");
        track("demo_errored", { demo: "lesson-plan", message });
      }
    },
    [duration, grade, status, topic],
  );

  const reset = () => {
    abortRef.current?.abort();
    setStatus("idle");
    setContent("");
    setError(null);
  };

  const handlePrint = () => {
    track("demo_cta_clicked", { demo: "lesson-plan", cta: "print" });
    window.print();
  };

  const handleEngageClick = () => {
    track("demo_cta_clicked", { demo: "lesson-plan", cta: "engage" });
  };

  const streaming = status === "streaming";
  const done = status === "done";
  const rateLimited = error?.includes("rate limit");

  return (
    <DemoShell
      id="demo-lesson-plan-alchemist"
      label="P2 · Lesson Plan Alchemist"
      title={streaming ? "Streaming\u2026" : done ? "Ready to teach" : "Idle"}
      variant="ai-native"
      active={streaming}
      description={
        <p className="max-w-[var(--width-reading)] text-[length:var(--text-body)]">
          Say what you&rsquo;re teaching next. Get a complete, specific plan
          back in about the time it takes to make coffee. Save it, print it,
          teach it Monday.
        </p>
      }
    >
      <form
        onSubmit={start}
        className="mb-[var(--space-8)] grid gap-[var(--space-4)] md:grid-cols-[1fr_160px_140px_auto] md:items-end"
      >
        <label className="flex flex-col gap-[var(--space-1)] md:col-span-4">
          <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            What are you teaching next?
          </span>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={streaming}
            maxLength={400}
            rows={2}
            required
            className={cn(
              "rounded-[2px] border border-[color:var(--border)]",
              "bg-[color:var(--ink-900)] px-[var(--space-3)] py-[var(--space-2)]",
              "font-mono text-[length:var(--text-small)] text-[color:var(--text)]",
              "focus:border-[color:var(--accent)] focus:outline-none",
              "disabled:opacity-50 resize-none",
            )}
          />
        </label>
        <label className="flex flex-col gap-[var(--space-1)]">
          <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            Grade band
          </span>
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            disabled={streaming}
            maxLength={40}
            required
            className={cn(
              "rounded-[2px] border border-[color:var(--border)]",
              "bg-[color:var(--ink-900)] px-[var(--space-3)] py-[var(--space-2)]",
              "font-mono text-[length:var(--text-small)] text-[color:var(--text)]",
              "focus:border-[color:var(--accent)] focus:outline-none disabled:opacity-50",
            )}
          />
        </label>
        <label className="flex flex-col gap-[var(--space-1)]">
          <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            Duration (min)
          </span>
          <input
            type="number"
            min={20}
            max={180}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) || 50)}
            disabled={streaming}
            className={cn(
              "rounded-[2px] border border-[color:var(--border)]",
              "bg-[color:var(--ink-900)] px-[var(--space-3)] py-[var(--space-2)]",
              "font-mono text-[length:var(--text-small)] text-[color:var(--text)]",
              "focus:border-[color:var(--accent)] focus:outline-none disabled:opacity-50",
            )}
          />
        </label>
        <div className="flex items-center gap-[var(--space-3)]">
          <button
            type="submit"
            disabled={streaming || topic.trim().length < 3}
            className={cn(
              "inline-flex items-center gap-[var(--space-2)] rounded-full",
              "border border-[color:var(--signal)] bg-[color:var(--signal)]",
              "px-[var(--space-6)] py-[var(--space-3)]",
              "font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)]",
              "text-[color:var(--ink-900)] transition-opacity",
              "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {streaming ? "Planning\u2026" : done ? "Try another" : "Plan this lesson"}
          </button>
          {done || status === "errored" ? (
            <button
              type="button"
              onClick={reset}
              className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)] hover:text-[color:var(--text)]"
            >
              Reset
            </button>
          ) : null}
        </div>
      </form>

      <StreamingOutput
        content={content}
        streaming={streaming}
        placeholder="Your plan will appear here."
        className="min-h-[28rem]"
      />

      {error ? (
        <div
          role="alert"
          className={cn(
            "mt-[var(--space-6)] rounded-[2px] border border-[color:var(--danger-500)]",
            "bg-[color:var(--ink-900)] p-[var(--space-4)]",
            "text-[length:var(--text-small)] text-[color:var(--text-muted)]",
          )}
        >
          {error}
          {rateLimited ? (
            <>
              {" "}
              <a
                href="#engage"
                onClick={handleEngageClick}
                className="underline decoration-[color:var(--accent)] underline-offset-4"
              >
                Book a call
              </a>{" "}
              to see the full version.
            </>
          ) : null}
        </div>
      ) : null}

      {done ? (
        <div className="mt-[var(--space-6)] flex flex-wrap items-center gap-[var(--space-6)]">
          <button
            type="button"
            onClick={handlePrint}
            className={cn(
              "font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)]",
              "text-[color:var(--text-muted)] hover:text-[color:var(--text)]",
            )}
          >
            Save as PDF &rarr;
          </button>
          <a
            href="#engage"
            onClick={handleEngageClick}
            className={cn(
              "font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)]",
              "text-[color:var(--signal)] hover:text-[color:var(--paper-50)]",
            )}
          >
            Imagine twenty teachers doing this every week &rarr;
          </a>
        </div>
      ) : null}
    </DemoShell>
  );
}
