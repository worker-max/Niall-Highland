"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Interactive figure for "Program before platform." The reader sorts real
 * classroom tasks into a Red / Amber / Green zone — the shared-language
 * framework the essay argues a school should build *before* it buys a tool.
 * Each choice reveals the reasoning; the point is not to be "right" but to feel
 * how quickly a common vocabulary resolves an argument. Keyboard-operable,
 * touch-friendly, no external calls.
 *
 * Renders inside <ExplanatoryFigure> → DemoShell(ai-native), so semantic tokens
 * resolve to the dark studio surface. --accent still flows from the essay's
 * data-accent island. Zone hues use the semantic danger/warning/success tokens.
 */

type Zone = "red" | "amber" | "green";

const ZONES: ReadonlyArray<{
  key: Zone;
  label: string;
  sub: string;
  color: string;
}> = [
  { key: "red", label: "Red", sub: "Do it yourself", color: "var(--danger-500)" },
  { key: "amber", label: "Amber", sub: "Use, then disclose", color: "var(--warning-500)" },
  { key: "green", label: "Green", sub: "Use freely", color: "var(--success-500)" },
];

interface Task {
  id: string;
  text: string;
  intended: Zone;
  rationale: string;
}

const TASKS: ReadonlyArray<Task> = [
  {
    id: "brainstorm",
    text: "A student uses AI to brainstorm essay angles, then writes the essay themselves.",
    intended: "green",
    rationale:
      "Ideation is fair game. The thinking being assessed — the drafting — stays with the student.",
  },
  {
    id: "rewrite",
    text: "A student asks AI to rewrite their paragraph to “sound smarter,” and submits it.",
    intended: "red",
    rationale:
      "The voice being assessed is no longer the student’s. This is the line, and everyone can see it.",
  },
  {
    id: "translate",
    text: "A student uses AI to translate a foreign-language source, quotes it, and notes the tool.",
    intended: "amber",
    rationale:
      "Useful and legitimate — because it’s disclosed. Amber is about transparency, not permission.",
  },
  {
    id: "verbatim",
    text: "A student pastes the homework prompt into AI and submits the answer verbatim.",
    intended: "red",
    rationale:
      "No learning happened, and the assessment signal is gone. The clearest Red there is.",
  },
  {
    id: "check-math",
    text: "A student uses AI to check their math and explain the problems they got wrong.",
    intended: "green",
    rationale:
      "A feedback loop — arguably better than the answer key at the back of the book.",
  },
];

function zoneColor(zone: Zone): string {
  return ZONES.find((z) => z.key === zone)!.color;
}

export function TrafficLightsClassifier() {
  const reduce = useReducedMotion();
  const [choices, setChoices] = useState<Record<string, Zone>>({});

  const classified = Object.keys(choices).length;
  const total = TASKS.length;
  const complete = classified === total;

  const agreements = useMemo(
    () =>
      TASKS.filter((t) => choices[t.id] && choices[t.id] === t.intended).length,
    [choices],
  );

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* Prompt */}
      <p className="max-w-[54ch] text-[length:var(--text-small)] leading-[1.6] text-[color:var(--text-muted)]">
        Sort each task into the zone where it belongs. There are no trick
        questions — only the conversation a faculty has to have out loud, once,
        so it never has to have it again.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-[var(--space-3)]">
        {ZONES.map((z) => (
          <span
            key={z.key}
            className="inline-flex items-center gap-[var(--space-2)] rounded-full border px-[var(--space-3)] py-[var(--space-1)]"
            style={{ borderColor: z.color }}
          >
            <span
              aria-hidden="true"
              className="size-[8px] rounded-full"
              style={{ backgroundColor: z.color }}
            />
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text)]">
              {z.label}
            </span>
            <span className="text-[var(--text-caption)] text-[color:var(--text-faint)]">
              {z.sub}
            </span>
          </span>
        ))}
      </div>

      {/* Tasks */}
      <ul className="flex flex-col gap-[var(--space-3)]">
        {TASKS.map((task) => {
          const chosen = choices[task.id];
          return (
            <li
              key={task.id}
              role="group"
              aria-label={task.text}
              className="rounded-[4px] border p-[var(--space-4)] transition-colors"
              style={{
                borderColor: chosen ? zoneColor(chosen) : "var(--border)",
                backgroundColor: chosen
                  ? "color-mix(in srgb, var(--surface-elevated) 80%, transparent)"
                  : "transparent",
              }}
            >
              <div className="grid gap-[var(--space-4)] md:grid-cols-[1fr_auto] md:items-center">
                <p className="text-[length:var(--text-small)] leading-[1.5] text-[color:var(--text)]">
                  {task.text}
                </p>

                <div className="flex gap-[var(--space-2)]" role="radiogroup" aria-label="Assign a zone">
                  {ZONES.map((z) => {
                    const active = chosen === z.key;
                    return (
                      <button
                        key={z.key}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={`${z.label} — ${z.sub}`}
                        onClick={() =>
                          setChoices((prev) => ({ ...prev, [task.id]: z.key }))
                        }
                        className="rounded-[3px] border px-[var(--space-3)] py-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] transition-all"
                        style={{
                          borderColor: z.color,
                          backgroundColor: active ? z.color : "transparent",
                          color: active ? "var(--ink-900)" : z.color,
                        }}
                      >
                        {z.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence initial={false}>
                {chosen ? (
                  <motion.p
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduce ? undefined : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <span className="mt-[var(--space-3)] flex gap-[var(--space-3)] text-[length:var(--text-small)] leading-[1.5] text-[color:var(--text-muted)]">
                      <span
                        aria-hidden="true"
                        className="mt-[0.45em] size-[6px] shrink-0 rounded-full"
                        style={{ backgroundColor: zoneColor(task.intended) }}
                      />
                      <span>
                        {chosen !== task.intended ? (
                          <span className="text-[color:var(--text-faint)]">
                            Most faculties land on{" "}
                            <span style={{ color: zoneColor(task.intended) }}>
                              {task.intended}
                            </span>{" "}
                            here.{" "}
                          </span>
                        ) : null}
                        {task.rationale}
                      </span>
                    </span>
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      {/* Tally / payoff */}
      <div
        className="flex flex-wrap items-center justify-between gap-[var(--space-4)] border-t pt-[var(--space-4)]"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--signal)]">
          {classified} / {total} classified
          {complete ? ` · ${agreements}/${total} matched the room` : ""}
        </p>
        <AnimatePresence>
          {complete ? (
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-[46ch] text-[length:var(--text-small)] leading-[1.5] text-[color:var(--text-muted)]"
            >
              Notice what just happened: you didn’t reach for a policy document.
              You reached for a shared language — and the hard cases resolved
              themselves.
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
