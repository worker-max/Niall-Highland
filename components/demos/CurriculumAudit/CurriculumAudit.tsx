"use client";

import { useCallback, useRef, useState, type FormEvent, type ReactElement } from "react";
import { cn } from "@/lib/cn";
import { DemoShell } from "@/components/primitives/DemoShell";
import { track } from "@/lib/analytics";
import {
  AIProofIcon,
  AIVulnerableIcon,
  AIAmplifiedIcon,
} from "@/components/icons";
import type { CurriculumAudit } from "@/lib/ai/schemas/curriculumAudit";

type Status = "idle" | "streaming" | "done" | "errored";

const SAMPLE = `Grade 10 English — "Voices of Protest" unit.

Learning outcomes:
1. Students will analyse the rhetorical strategies used in three protest speeches from different eras.
2. Students will write a 500-word persuasive essay on a current social issue of their choosing.
3. Students will deliver a 3-minute oral presentation defending their position.
4. Students will evaluate the credibility of sources cited in their peers' essays.
5. Students will reflect on how their own assumptions shifted through the unit.`;

type PartialAudit = Partial<CurriculumAudit>;

export function CurriculumAudit() {
  const [subject, setSubject] = useState("English Language & Literature");
  const [grade, setGrade] = useState("Grade 10");
  const [framework, setFramework] =
    useState<"IB" | "American" | "British" | "National">("IB");
  const [curriculum, setCurriculum] = useState(SAMPLE);
  const [status, setStatus] = useState<Status>("idle");
  const [audit, setAudit] = useState<PartialAudit>({});
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (status === "streaming") return;
      setStatus("streaming");
      setAudit({});
      setError(null);
      track("demo_started", { demo: "curriculum-audit", framework });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/demos/curriculum-audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, grade, framework, curriculum }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          const msg =
            typeof detail?.error === "string"
              ? detail.error
              : `Request failed (${res.status})`;
          if (res.status === 429) track("demo_rate_limited", { demo: "curriculum-audit" });
          throw new Error(msg);
        }
        const body = res.body;
        if (!body) throw new Error("No stream from server.");
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line) continue;
            try {
              const partial = JSON.parse(line) as
                | PartialAudit
                | { __error: string };
              if ("__error" in partial) throw new Error(partial.__error);
              setAudit(partial);
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message !== line) {
                throw parseErr;
              }
            }
          }
        }
        setStatus("done");
        track("demo_completed", { demo: "curriculum-audit" });
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
        setStatus("errored");
        track("demo_errored", { demo: "curriculum-audit", message });
      }
    },
    [curriculum, framework, grade, status, subject],
  );

  const reset = () => {
    abortRef.current?.abort();
    setStatus("idle");
    setAudit({});
    setError(null);
  };

  const streaming = status === "streaming";
  const done = status === "done";
  const rateLimited = error?.includes("rate limit");

  return (
    <DemoShell
      id="demo-curriculum-audit"
      label="P3 · The Curriculum Audit"
      title={streaming ? "Auditing\u2026" : done ? "Audit complete" : "Idle"}
      variant="ai-native"
      active={streaming}
      description={
        <p className="max-w-[var(--width-reading)] text-[length:var(--text-body)]">
          Paste a unit plan, syllabus excerpt, or list of learning outcomes.
          In thirty seconds you&rsquo;ll see which outcomes are AI-proof,
          which are AI-vulnerable, which are AI-amplifiable — and the two or
          three changes that matter most.
        </p>
      }
    >
      <form
        onSubmit={start}
        className="mb-[var(--space-8)] grid gap-[var(--space-4)]"
      >
        <div className="grid gap-[var(--space-4)] md:grid-cols-3">
          <label className="flex flex-col gap-[var(--space-1)]">
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              Subject
            </span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={streaming}
              maxLength={80}
              required
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-[var(--space-1)]">
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              Grade
            </span>
            <input
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              disabled={streaming}
              maxLength={40}
              required
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-[var(--space-1)]">
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              Framework
            </span>
            <select
              value={framework}
              onChange={(e) =>
                setFramework(e.target.value as typeof framework)
              }
              disabled={streaming}
              className={inputClass}
            >
              <option value="IB">IB</option>
              <option value="American">American</option>
              <option value="British">British</option>
              <option value="National">National</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-[var(--space-1)]">
          <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            Curriculum text
          </span>
          <textarea
            value={curriculum}
            onChange={(e) => setCurriculum(e.target.value)}
            disabled={streaming}
            minLength={40}
            maxLength={8000}
            rows={8}
            required
            className={cn(inputClass, "resize-y")}
          />
          <span className="font-mono text-[var(--text-caption)] text-[color:var(--text-faint)]">
            {curriculum.length.toLocaleString()} / 8,000 chars
          </span>
        </label>
        <div className="flex items-center gap-[var(--space-3)]">
          <button
            type="submit"
            disabled={streaming || curriculum.length < 40}
            className={cn(
              "inline-flex items-center gap-[var(--space-2)] rounded-full",
              "border border-[color:var(--signal)] bg-[color:var(--signal)]",
              "px-[var(--space-6)] py-[var(--space-3)]",
              "font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)]",
              "text-[color:var(--ink-900)] transition-opacity",
              "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {streaming ? "Auditing\u2026" : done ? "Audit another" : "Audit this"}
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

      <div className="grid gap-[var(--space-4)] md:grid-cols-3">
        <AuditColumn
          label="AI-Proof"
          tone="success"
          tagline="Safe. Double down."
          icon={<AIProofIcon size={40} />}
          items={(audit.aiProof ?? []).map((i) => ({
            heading: i?.outcome,
            body: i?.rationale,
          }))}
          placeholder={streaming ? "Classifying\u2026" : "Awaiting input"}
        />
        <AuditColumn
          label="AI-Vulnerable"
          tone="warning"
          tagline="Redesign, not remove."
          icon={<AIVulnerableIcon size={40} />}
          items={(audit.aiVulnerable ?? []).map((i) => ({
            heading: i?.outcome,
            body: i?.rationale,
            trailing: i?.redesign ? `Redesign: ${i.redesign}` : undefined,
          }))}
          placeholder={streaming ? "Classifying\u2026" : "Awaiting input"}
        />
        <AuditColumn
          label="AI-Amplified"
          tone="signal"
          tagline="Opportunity, not threat."
          icon={<AIAmplifiedIcon size={40} />}
          items={(audit.aiAmplified ?? []).map((i) => ({
            heading: i?.outcome,
            body: i?.rationale,
            trailing: i?.opportunity ? `Opportunity: ${i.opportunity}` : undefined,
          }))}
          placeholder={streaming ? "Classifying\u2026" : "Awaiting input"}
        />
      </div>

      {audit.whatIdDoNext ? (
        <div className="mt-[var(--space-8)] border-l-2 border-[color:var(--accent)] pl-[var(--space-6)]">
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
            What I&rsquo;d do next
          </p>
          <p className="mt-[var(--space-3)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text)]">
            {audit.whatIdDoNext}
          </p>
        </div>
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
              <a
                href="#engage"
                onClick={() =>
                  track("demo_cta_clicked", { demo: "curriculum-audit", cta: "engage" })
                }
                className="underline decoration-[color:var(--accent)] underline-offset-4"
              >
                Book a call
              </a>{" "}
              to see the full version.
            </>
          ) : null}
        </div>
      ) : null}

      {done && !error ? (
        <div
          data-surface="dark"
          className="mt-[var(--space-8)] rounded-[2px] border border-[color:var(--accent)] bg-[color:var(--accent-900)] p-[var(--space-6)]"
        >
          <p className="text-[length:var(--text-body)] text-[color:var(--text)]">
            This is the 30-second version. For your full K&ndash;12 curriculum,
            with department-by-department recommendations and a 12-month
            implementation roadmap &mdash;
          </p>
          <a
            href="#engage"
            onClick={() =>
              track("demo_cta_clicked", { demo: "curriculum-audit", cta: "engage-final" })
            }
            className={cn(
              "mt-[var(--space-3)] inline-flex items-center gap-[var(--space-2)]",
              "font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)]",
              "text-[color:var(--signal)] hover:text-[color:var(--paper-50)]",
            )}
          >
            Book a discovery call
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      ) : null}
    </DemoShell>
  );
}

/* --------------------------------------------------------------------------
 * Internal components
 * ------------------------------------------------------------------------*/

const inputClass = cn(
  "rounded-[2px] border border-[color:var(--border)]",
  "bg-[color:var(--ink-900)] px-[var(--space-3)] py-[var(--space-2)]",
  "font-mono text-[length:var(--text-small)] text-[color:var(--text)]",
  "focus:border-[color:var(--accent)] focus:outline-none disabled:opacity-50",
);

type Tone = "success" | "warning" | "signal";

const toneColors: Record<Tone, { label: string; border: string }> = {
  success: {
    label: "text-[color:var(--success-500)]",
    border: "border-[color:var(--success-500)]",
  },
  warning: {
    label: "text-[color:var(--warning-500)]",
    border: "border-[color:var(--warning-500)]",
  },
  signal: {
    label: "text-[color:var(--signal)]",
    border: "border-[color:var(--signal)]",
  },
};

interface ColumnItem {
  heading?: string;
  body?: string;
  trailing?: string;
}

function AuditColumn({
  label,
  tone,
  tagline,
  icon,
  items,
  placeholder,
}: {
  label: string;
  tone: Tone;
  tagline: string;
  icon?: ReactElement;
  items: ColumnItem[];
  placeholder: string;
}) {
  const colors = toneColors[tone];
  return (
    <div
      className={cn(
        "flex flex-col rounded-[2px] border-t-2 bg-[color:var(--ink-800)]",
        colors.border,
      )}
    >
      <div className="border-b border-[color:var(--border)] px-[var(--space-4)] py-[var(--space-3)]">
        <div className="flex items-start justify-between gap-[var(--space-3)]">
          <div>
            <p
              className={cn(
                "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]",
                colors.label,
              )}
            >
              {label}
            </p>
            <p className="mt-[var(--space-1)] text-[length:var(--text-caption)] text-[color:var(--text-faint)]">
              {tagline}
            </p>
          </div>
          {icon ? (
            <span className={cn("shrink-0", colors.label)} data-active="true">
              {icon}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-[var(--space-4)] px-[var(--space-4)] py-[var(--space-4)]">
        {items.length === 0 ? (
          <p className="font-mono text-[var(--text-caption)] italic text-[color:var(--text-faint)]">
            {placeholder}
          </p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex flex-col gap-[var(--space-2)]">
              <p className="text-[length:var(--text-small)] font-medium text-[color:var(--text)]">
                {item.heading ?? "\u2026"}
              </p>
              {item.body ? (
                <p className="text-[length:var(--text-small)] text-[color:var(--text-muted)]">
                  {item.body}
                </p>
              ) : null}
              {item.trailing ? (
                <p className="font-mono text-[var(--text-caption)] text-[color:var(--text-faint)]">
                  {item.trailing}
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
