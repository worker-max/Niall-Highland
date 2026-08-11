"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Interactive figure for "Built to bend." The same five years of change hit
 * every school; the reader flips the school's *starting point* — platform-first
 * vs program-first — and watches the identical run of events resolve into a
 * brittle policy (rewrite after rewrite) or a durable one (bends, holds). The
 * flip IS the argument: same world, opposite outcomes.
 *
 * Renders inside <ExplanatoryFigure> → DemoShell(ai-native): tokens resolve to
 * the dark studio surface, --accent flows from the essay's data-accent island.
 */

type Mode = "platform" | "program";

interface Event {
  id: string;
  trigger: string;
  platform: { text: string; rewrite: boolean };
  program: { text: string };
}

const EVENTS: ReadonlyArray<Event> = [
  {
    id: "model",
    trigger: "A markedly more capable model ships.",
    platform: {
      text: "Your rules assume limits that no longer exist. The policy is behind the frontier the week it’s approved. Rewrite.",
      rewrite: true,
    },
    program: {
      text: "Your teachers reason about capability, not a fixed tool. The guidance bends; nothing to rewrite.",
    },
  },
  {
    id: "tool",
    trigger: "A better platform appears.",
    platform: {
      text: "You standardised on the last one. Switching means retraining everyone and rewriting the rules around it. Rewrite.",
      rewrite: true,
    },
    program: {
      text: "Tools were chosen to serve the program. Swap the tool; the learning goals hold.",
    },
  },
  {
    id: "inspect",
    trigger: "An inspector asks what you actually do.",
    platform: {
      text: "You have a document describing a piece of software. So you describe the software.",
      rewrite: false,
    },
    program: {
      text: "You describe classroom practice — and your teachers can speak to it in their own words.",
    },
  },
  {
    id: "edge",
    trigger: "A teacher finds a use nobody foresaw.",
    platform: {
      text: "It isn’t in the policy. So it’s banned by default, or quietly ignored. Rewrite — eventually.",
      rewrite: true,
    },
    program: {
      text: "It maps to your shared language — Red, Amber, or Green — and the faculty places it in a minute.",
    },
  },
  {
    id: "parent",
    trigger: "A parent compares you to the school down the road.",
    platform: {
      text: "You point to a subscription.",
      rewrite: false,
    },
    program: {
      text: "You point to what changed in your classrooms.",
    },
  },
];

const MODES: Record<Mode, { label: string; sub: string }> = {
  platform: { label: "Start with the platform", sub: "Buy first, justify later" },
  program: { label: "Start with the program", sub: "Decide learning, then choose tools" },
};

export function TheInversion() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("platform");

  const rewrites = useMemo(
    () => EVENTS.filter((e) => e.platform.rewrite).length,
    [],
  );
  const isPlatform = mode === "platform";
  const good = "var(--signal)";
  const bad = "var(--danger-500)";
  const accent = isPlatform ? bad : good;

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <p className="max-w-[56ch] text-[length:var(--text-small)] leading-[1.6] text-[color:var(--text-muted)]">
        The same five years hit every school. Flip the starting point and watch
        how each one holds up when the ground moves.
      </p>

      {/* The switch */}
      <div
        role="radiogroup"
        aria-label="Choose the school's starting point"
        className="grid gap-[var(--space-3)] sm:grid-cols-2"
      >
        {(Object.keys(MODES) as Mode[]).map((m) => {
          const active = mode === m;
          const tone = m === "platform" ? bad : good;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMode(m)}
              className="rounded-[4px] border p-[var(--space-4)] text-left transition-all"
              style={{
                borderColor: active ? tone : "var(--border)",
                backgroundColor: active
                  ? "color-mix(in srgb, var(--surface-elevated) 78%, transparent)"
                  : "transparent",
              }}
            >
              <span
                className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]"
                style={{ color: active ? tone : "var(--text-faint)" }}
              >
                {MODES[m].label}
              </span>
              <span className="mt-[var(--space-1)] block text-[length:var(--text-small)] text-[color:var(--text-muted)]">
                {MODES[m].sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* The run of events */}
      <ol className="flex flex-col">
        {EVENTS.map((event, i) => {
          const outcome = isPlatform ? event.platform : event.program;
          const showRewrite = isPlatform && event.platform.rewrite;
          return (
            <li
              key={event.id}
              className="grid grid-cols-[auto_1fr] gap-x-[var(--space-4)] border-t border-[color:var(--border)] py-[var(--space-4)] first:border-t-0"
            >
              {/* Year rail */}
              <span
                aria-hidden="true"
                className="mt-[0.15em] font-mono text-[var(--text-caption)] tabular-nums text-[color:var(--text-faint)]"
              >
                Y{i + 1}
              </span>
              <div>
                <p className="font-display text-[length:var(--text-h3)] leading-[1.25] text-[color:var(--text)]">
                  {event.trigger}
                </p>
                <motion.div
                  key={mode}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-[var(--space-2)] flex items-start gap-[var(--space-3)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.5em] size-[6px] shrink-0 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <p className="text-[length:var(--text-small)] leading-[1.55] text-[color:var(--text-muted)]">
                    {outcome.text}
                    {showRewrite ? (
                      <span
                        className="ml-[var(--space-2)] inline-block rounded-[2px] px-[var(--space-2)] py-[1px] font-mono text-[0.62rem] uppercase tracking-[var(--tracking-label)]"
                        style={{ color: bad, border: `1px solid ${bad}` }}
                      >
                        Rewrite
                      </span>
                    ) : null}
                  </p>
                </motion.div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Tally */}
      <div
        className="flex flex-wrap items-baseline justify-between gap-[var(--space-4)] border-t pt-[var(--space-4)]"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Forced policy rewrites over five years
        </span>
        <span
          className="font-display text-[length:var(--text-h1)] leading-none tabular-nums"
          style={{ color: accent }}
        >
          {isPlatform ? rewrites : 0}
        </span>
      </div>
    </div>
  );
}
