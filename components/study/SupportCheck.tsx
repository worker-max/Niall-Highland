"use client";

import { useState } from "react";
import { Callout } from "@/components/essay";
import { DemoShell } from "@/components/primitives/DemoShell";
import { assessSupport, FREQUENCY_LABELS, LEVEL_LABEL, SUPPORT_QUESTIONS, type SupportLevel } from "@/lib/study/support";
import { ghostBtn, label, lead, muted, primaryBtn, usePhaseFocus } from "./ui";

type Phase = "questions" | "results";

const HEADING: Record<Phase, string> = {
  questions: "Ten statements. How often is each true for you?",
  results: "Your results",
};

const CHIP: Record<SupportLevel, string> = {
  "on-track": "border-[color:var(--border)] text-[color:var(--text-muted)]",
  some: "border-[color:var(--accent)] text-[color:var(--accent)]",
  more: "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--surface)]",
};

export function SupportCheck() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<Phase>("questions");
  const headingRef = usePhaseFocus(phase);
  const complete = SUPPORT_QUESTIONS.every((q) => answers[q.id] !== undefined);
  const result = phase === "results" ? assessSupport(answers) : null;

  return (
    <DemoShell label="Lab 04 · Five things check" title="About 2 minutes">
      <div className="flex flex-col gap-[var(--space-6)]">
        <p ref={headingRef} tabIndex={-1} className={`${label} outline-none`}>
          {HEADING[phase]}
        </p>
        <p role="status" className="sr-only">
          {HEADING[phase]}
        </p>

        {phase === "questions" ? (
          <>
            <p className={muted}>
              This is a conversation starter for you and the adults who help you. It cannot diagnose anything, and nothing
              you choose leaves this page.
            </p>
            <ol className="flex flex-col gap-[var(--space-6)]">
              {SUPPORT_QUESTIONS.map((q, i) => (
                <li key={q.id}>
                  <fieldset className="flex flex-col gap-[var(--space-2)]">
                    <legend className="mb-[var(--space-2)] text-[color:var(--text)]">
                      {i + 1}. {q.text}
                    </legend>
                    <div className="flex flex-wrap gap-[var(--space-2)]">
                      {FREQUENCY_LABELS.map((option, value) => (
                        <label key={option} className="cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            value={value}
                            checked={answers[q.id] === value}
                            onChange={() => setAnswers((a) => ({ ...a, [q.id]: value }))}
                            className="peer sr-only"
                          />
                          <span className="inline-flex rounded-full border border-[color:var(--border)] px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--text-small)] text-[color:var(--text)] peer-checked:border-[color:var(--accent)] peer-checked:bg-[color:var(--accent-tint)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--accent)]">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </li>
              ))}
            </ol>
            <div>
              <button type="button" className={primaryBtn} disabled={!complete} onClick={() => setPhase("results")}>
                Show my results
              </button>
            </div>
          </>
        ) : null}

        {result ? (
          <>
            <ul className="flex flex-col gap-[var(--space-4)]">
              {result.areas.map((a) => (
                <li key={a.area} className="flex flex-col gap-[var(--space-2)] border-b border-[color:var(--border)] pb-[var(--space-4)]">
                  <div className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
                    <p className="font-display text-[length:var(--text-h3)] text-[color:var(--text)]">{a.label}</p>
                    <span
                      className={`rounded-full border px-[var(--space-3)] py-[var(--space-1)] font-mono text-[length:var(--text-caption)] uppercase tracking-[var(--tracking-label)] ${CHIP[a.level]}`}
                    >
                      {LEVEL_LABEL[a.level]}
                    </span>
                  </div>
                  <p className={muted}>{a.advice}</p>
                </li>
              ))}
            </ul>
            {result.suggestEvaluation ? (
              <Callout tone="caution" label="Worth a conversation">
                If this has been true for a long time, even with good teaching and real effort, ask your school about a proper
                evaluation. A specialist can find out what is going on. A website cannot.
              </Callout>
            ) : null}
            {result.suggestCounselor ? (
              <Callout tone="info" label="You are not alone in this">
                Test worry that affects sleep or eating is worth talking about. A school counselor or a parent can help.
              </Callout>
            ) : null}
            <p className={lead}>
              None of this changes how you study. Retrieve, space, explain and mix work for everyone. These answers tell you how
              much help to ask for while you do it.
            </p>
            <div>
              <button
                type="button"
                className={ghostBtn}
                onClick={() => {
                  setAnswers({});
                  setPhase("questions");
                }}
              >
                Start over
              </button>
            </div>
          </>
        ) : null}
      </div>
    </DemoShell>
  );
}
