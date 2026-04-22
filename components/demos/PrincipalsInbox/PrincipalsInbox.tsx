"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { DemoShell } from "@/components/primitives/DemoShell";
import { StreamingOutput } from "@/components/primitives/StreamingOutput";
import { track } from "@/lib/analytics";
import type { Scenario } from "@/lib/ai/schemas/principalsInbox";
import { SEED_SCENARIOS } from "./scenarios";

type Choice = "policing" | "permissive" | "niall";
type Phase = "picking" | "presenting" | "responding" | "revealed" | "errored";

const CHOICE_LABELS: Record<Choice, { heading: string; tagline: string }> = {
  policing: {
    heading: "The policing response",
    tagline: "Restrictive. Familiar. Names the rule and closes the matter.",
  },
  permissive: {
    heading: "The permissive response",
    tagline: "Open. Familiar. Trusts everyone. Produces no policy.",
  },
  niall: {
    heading: "The Niall response",
    tagline: "Values-led. Frames the underlying question. Builds shared language.",
  },
};

export function PrincipalsInbox() {
  const [phase, setPhase] = useState<Phase>("picking");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [responseText, setResponseText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const pickSeed = useCallback((s: Scenario) => {
    setScenario(s);
    setPhase("presenting");
    setChoice(null);
    setResponseText("");
    setError(null);
    track("demo_started", { demo: "principals-inbox", source: "seed" });
  }, []);

  const surpriseMe = useCallback(async () => {
    setScenarioLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/demos/principals-inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scenario" }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(
          typeof detail?.error === "string" ? detail.error : `Request failed (${res.status})`,
        );
      }
      const data = (await res.json()) as Scenario;
      setScenario(data);
      setPhase("presenting");
      setChoice(null);
      setResponseText("");
      track("demo_started", { demo: "principals-inbox", source: "surprise" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("errored");
    } finally {
      setScenarioLoading(false);
    }
  }, []);

  const chooseResponse = useCallback(
    async (c: Choice) => {
      if (!scenario) return;
      setChoice(c);
      setPhase("responding");
      setResponseText("");
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/demos/principals-inbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "respond",
            scenario: {
              from: scenario.from,
              subject: scenario.subject,
              body: scenario.body,
            },
            choice: c,
          }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          throw new Error(
            typeof detail?.error === "string" ? detail.error : `Request failed (${res.status})`,
          );
        }
        const body = res.body;
        if (!body) throw new Error("No stream from server.");
        const reader = body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) setResponseText((prev) => prev + decoder.decode(value, { stream: true }));
        }
        setPhase("revealed");
        track("demo_completed", { demo: "principals-inbox", choice: c });
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setPhase("errored");
      }
    },
    [scenario],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setPhase("picking");
    setScenario(null);
    setChoice(null);
    setResponseText("");
    setError(null);
  }, []);

  const streaming = phase === "responding";
  const rateLimited = error?.toLowerCase().includes("rate limit");

  return (
    <DemoShell
      id="demo-principals-inbox"
      label="P4 · The Principal's Inbox"
      title={phase === "picking" ? "Pick a scenario" : phase === "presenting" ? "Choose a response" : phase === "responding" ? "Drafting…" : phase === "revealed" ? "See the comparison" : "Error"}
      variant="ai-native"
      active={streaming}
      description={
        <p className="max-w-[var(--width-reading)] text-[length:var(--text-body)]">
          Five AI dilemmas, the way they actually hit a head&rsquo;s desk.
          Three response paths &mdash; policing, permissive, and the
          framework-led response Niall writes in paid engagements. Pick one
          and watch it draft live.
        </p>
      }
      footer={
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          This framework is the same one Niall uses inside school-wide
          partnerships. Deployed at your school, it replaces ad-hoc policy
          with shared language for every leader in the room.
        </p>
      }
    >
      {phase === "picking" ? (
        <PickingSurface
          onPickSeed={pickSeed}
          onSurpriseMe={surpriseMe}
          loading={scenarioLoading}
          error={error}
        />
      ) : null}

      {scenario && phase !== "picking" ? (
        <ScenarioCard scenario={scenario} onReset={reset} />
      ) : null}

      {scenario && phase === "presenting" ? (
        <div className="mt-[var(--space-8)]">
          <p className="mb-[var(--space-4)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            Three ways a leader tends to reply. Pick one.
          </p>
          <div className="grid gap-[var(--space-3)] md:grid-cols-3">
            {(Object.keys(CHOICE_LABELS) as Choice[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => chooseResponse(c)}
                className={cn(
                  "flex flex-col gap-[var(--space-2)] rounded-[2px] border p-[var(--space-5)] text-left",
                  "transition-colors duration-[var(--duration-default)] ease-[var(--ease-editorial)]",
                  c === "niall"
                    ? "border-[color:var(--signal)] bg-[color:var(--ink-800)] hover:bg-[color:var(--accent-900)]"
                    : "border-[color:var(--border)] bg-[color:var(--ink-800)] hover:border-[color:var(--accent)]",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]",
                    c === "niall" ? "text-[color:var(--signal)]" : "text-[color:var(--text-faint)]",
                  )}
                >
                  {c === "niall" ? "Option 03 · Niall" : c === "policing" ? "Option 01" : "Option 02"}
                </span>
                <span className="font-display text-[length:var(--text-h3)] leading-[1.15] text-[color:var(--text)]">
                  {CHOICE_LABELS[c].heading}
                </span>
                <span className="text-[length:var(--text-small)] text-[color:var(--text-muted)]">
                  {CHOICE_LABELS[c].tagline}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {scenario && (phase === "responding" || phase === "revealed") && choice ? (
        <div className="mt-[var(--space-8)]">
          <div className="mb-[var(--space-3)] flex items-baseline justify-between">
            <h3 className="font-display text-[length:var(--text-h3)] text-[color:var(--text)]">
              {CHOICE_LABELS[choice].heading}
            </h3>
            <span
              className={cn(
                "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]",
                choice === "niall" ? "text-[color:var(--signal)]" : "text-[color:var(--text-faint)]",
              )}
            >
              {streaming ? "Drafting…" : "Draft reply"}
            </span>
          </div>
          <StreamingOutput
            content={responseText}
            streaming={streaming}
            placeholder="Contacting model…"
          />
        </div>
      ) : null}

      {phase === "revealed" && choice ? (
        <Commentary choice={choice} onTryAnother={reset} />
      ) : null}

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
              <a href="#contact" className="underline decoration-[color:var(--accent)] underline-offset-4">
                Book a call
              </a>{" "}
              to see the full version.
            </>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="ml-[var(--space-4)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)] hover:text-[color:var(--text)]"
          >
            Reset
          </button>
        </div>
      ) : null}
    </DemoShell>
  );
}

function PickingSurface({
  onPickSeed,
  onSurpriseMe,
  loading,
  error,
}: {
  onPickSeed: (s: Scenario) => void;
  onSurpriseMe: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="flex flex-wrap items-center gap-[var(--space-3)]">
        <button
          type="button"
          onClick={onSurpriseMe}
          disabled={loading}
          className={cn(
            "inline-flex items-center gap-[var(--space-2)] rounded-full",
            "border border-[color:var(--signal)] bg-[color:var(--signal)]",
            "px-[var(--space-5)] py-[var(--space-2)]",
            "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]",
            "text-[color:var(--ink-900)] transition-opacity",
            "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          {loading ? "Generating…" : "Surprise me"}
        </button>
        <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          or pick one of the five below
        </span>
      </div>

      <ul className="grid gap-[var(--space-3)]">
        {SEED_SCENARIOS.map((s) => (
          <li key={s.subject}>
            <button
              type="button"
              onClick={() => onPickSeed(s)}
              className="group flex w-full flex-col gap-[var(--space-1)] rounded-[2px] border border-[color:var(--border)] bg-[color:var(--ink-800)] p-[var(--space-4)] text-left transition-colors hover:border-[color:var(--accent)]"
            >
              <div className="flex items-center justify-between gap-[var(--space-4)]">
                <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                  {s.from}
                </span>
                <span className="font-mono text-[var(--text-caption)] text-[color:var(--text-faint)]">
                  {s.tags.slice(0, 2).map((t) => `#${t}`).join(" ")}
                </span>
              </div>
              <span className="font-display text-[length:var(--text-h3)] leading-[1.2] tracking-[-0.01em] text-[color:var(--text)] group-hover:text-[color:var(--accent)]">
                {s.subject}
              </span>
              <span className="mt-[var(--space-1)] text-[length:var(--text-small)] text-[color:var(--text-muted)] line-clamp-2">
                {s.body}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {error ? (
        <p role="alert" className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--danger-500)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ScenarioCard({ scenario, onReset }: { scenario: Scenario; onReset: () => void }) {
  return (
    <article className="rounded-[2px] border border-[color:var(--border)] bg-[color:var(--ink-800)]">
      <header className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)] border-b border-[color:var(--border)] px-[var(--space-5)] py-[var(--space-3)]">
        <div className="flex flex-col">
          <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--signal)]">
            From: {scenario.from}
          </span>
          <span className="font-mono text-[var(--text-caption)] text-[color:var(--text-faint)]">
            {scenario.role}
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)] hover:text-[color:var(--text)]"
        >
          &larr; Pick another
        </button>
      </header>
      <div className="px-[var(--space-5)] py-[var(--space-4)]">
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Subject
        </p>
        <p className="font-display text-[length:var(--text-h3)] leading-[1.2] tracking-[-0.01em] text-[color:var(--text)]">
          {scenario.subject}
        </p>
        <div className="mt-[var(--space-4)] whitespace-pre-wrap text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          {scenario.body}
        </div>
      </div>
    </article>
  );
}

function Commentary({ choice, onTryAnother }: { choice: Choice; onTryAnother: () => void }) {
  const text =
    choice === "niall"
      ? "This response does three things the other two don't: it names which kind of question is actually being asked (policy, values, or fear), it commits to a concrete next step rather than a verdict, and it leaves the relationship intact. Leaders who default to this shape produce policies their teachers can implement, parents can read, and inspectors can verify. That's what partnerships are built to grow at scale."
      : choice === "policing"
        ? "Notice what this response doesn't do. It names the rule, but it doesn't name the underlying question. It closes the matter, but the matter will come back next month under a new name. The parent leaves the exchange more suspicious than they arrived. Policing responses feel decisive; they produce erosion. The framework-led response above is what replaces them."
        : "Notice what this response doesn't do. It's warm, it trusts everyone, and it produces no policy. Next term, a different teacher will handle the same situation differently. The student, the parent, and the faculty all learn that the school doesn't have a position — which is itself a position, just the weakest one. The framework-led response above is what replaces it.";

  return (
    <div
      data-surface="dark"
      className="mt-[var(--space-8)] rounded-[2px] border border-[color:var(--accent)] bg-[color:var(--accent-900)] p-[var(--space-6)]"
    >
      <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--signal)]">
        {choice === "niall" ? "Why this response tends to produce better outcomes" : "Why this response tends to produce worse outcomes"}
      </p>
      <p className="mt-[var(--space-3)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text)]">
        {text}
      </p>
      <div className="mt-[var(--space-6)] flex flex-wrap items-center gap-[var(--space-4)]">
        <button
          type="button"
          onClick={onTryAnother}
          className="inline-flex items-center gap-[var(--space-2)] rounded-full border border-[color:var(--signal)] px-[var(--space-5)] py-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--signal)] hover:bg-[color:var(--signal)] hover:text-[color:var(--ink-900)]"
        >
          Try another scenario
        </button>
        <a
          href="#engage"
          className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-muted)] hover:text-[color:var(--signal)]"
        >
          Deploy this framework at your school &rarr;
        </a>
      </div>
    </div>
  );
}
