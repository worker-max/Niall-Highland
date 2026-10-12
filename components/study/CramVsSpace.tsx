"use client";

import { useMemo, useState } from "react";
import { DemoShell } from "@/components/primitives/DemoShell";
import { EXPERIMENT_SOURCES } from "@/lib/study/content";
import {
  CRAM_PRESET,
  FOLLOW_UP_DAYS,
  forecastRetention,
  matchPreset,
  retentionCurve,
  retentionPoints,
  SESSION_COUNT,
  SPACED_PRESET,
  TEST_DAY,
  toggleSessionDay,
} from "@/lib/study/spacing";
import { ghostBtn, label, lead, muted, sourceLink } from "./ui";

const HORIZON = TEST_DAY + FOLLOW_UP_DAYS;
const W = 320;
const H = 170;
const PAD = { left: 34, right: 10, top: 14, bottom: 26 } as const;
const PLAN_DAYS = Array.from({ length: TEST_DAY }, (_, d) => d);

const EXPLANATION: Record<"cram" | "spaced" | "custom", string> = {
  cram: "Crammed into the last four days, you remember plenty on test day and lose most of it within a week. Now try spreading it out.",
  spaced:
    "Spread out, the same four sessions hold up a week later, because each one comes after a little forgetting and has to rebuild the memory.",
  custom:
    "This is your own schedule. Compare it with the two presets: sessions late in the plan help test day, and gaps between sessions decide what is left a week later.",
};

const x = (day: number): number => PAD.left + (day / HORIZON) * (W - PAD.left - PAD.right);
const y = (value: number): number => PAD.top + (1 - value) * (H - PAD.top - PAD.bottom);
const pct = (value: number): string => `${Math.round(value * 100)}%`;

function RetentionChart({ days, curve }: { days: readonly number[]; curve: readonly number[] }) {
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  const path = retentionPoints(days, HORIZON)
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.day).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(" ");
  const readoutDay = hoverDay ?? TEST_DAY;
  const step = (W - PAD.left - PAD.right) / HORIZON;

  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <p className={muted} aria-hidden="true">
        Day {readoutDay}
        {readoutDay === TEST_DAY ? " (test)" : ""}: {pct(curve[readoutDay] ?? 0)} remembered
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-full"
        role="img"
        aria-label={`Forecast memory curve over ${HORIZON} days. Test day ${pct(curve[TEST_DAY] ?? 0)}, one week later ${pct(curve[HORIZON] ?? 0)}.`}
        onMouseLeave={() => setHoverDay(null)}
      >
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeWidth={1} />
            <text x={PAD.left - 6} y={y(v) + 3} textAnchor="end" fontSize={11} fill="var(--text-muted)">
              {pct(v)}
            </text>
          </g>
        ))}
        {[0, 7, 14, 21].map((d) => (
          <text key={d} x={x(d)} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
            {d === 0 ? "Day 0" : d}
          </text>
        ))}
        <line
          x1={x(TEST_DAY)}
          x2={x(TEST_DAY)}
          y1={PAD.top}
          y2={H - PAD.bottom}
          stroke="var(--text-muted)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text x={x(TEST_DAY) + 4} y={PAD.top + 8} fontSize={11} fill="var(--text-muted)">
          Test
        </text>
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {days.map((d) => (
          <circle key={d} cx={x(d)} cy={y(1)} r={4} fill="var(--accent)" stroke="var(--surface-raised)" strokeWidth={2} />
        ))}
        {hoverDay !== null ? (
          <line x1={x(hoverDay)} x2={x(hoverDay)} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--accent)" strokeWidth={1} opacity={0.5} />
        ) : null}
        {curve.map((_, d) => (
          <rect
            key={d}
            x={x(d) - step / 2}
            y={PAD.top}
            width={step}
            height={H - PAD.top - PAD.bottom}
            fill="transparent"
            onMouseEnter={() => setHoverDay(d)}
            onTouchStart={() => setHoverDay(d)}
          />
        ))}
      </svg>
    </div>
  );
}

export function CramVsSpace() {
  const [days, setDays] = useState<number[]>([...CRAM_PRESET]);
  const curve = useMemo(() => retentionCurve(days, HORIZON), [days]);
  const hasSessions = days.length > 0;

  return (
    <DemoShell label="Lab 02 · Cram vs. Space" title="About 2 minutes">
      <div className="flex flex-col gap-[var(--space-6)]">
        <p className={lead}>
          You get {SESSION_COUNT} study sessions before a test on day {TEST_DAY}. Same total time either way. Tap the days
          to place them, or try the two presets, and watch what happens on test day and a week after.
        </p>

        <div className="flex flex-wrap gap-[var(--space-3)]">
          <button type="button" className={ghostBtn} onClick={() => setDays([...CRAM_PRESET])}>
            Cram the last four days
          </button>
          <button type="button" className={ghostBtn} onClick={() => setDays([...SPACED_PRESET])}>
            Spread it out
          </button>
        </div>

        <div className="flex flex-col gap-[var(--space-2)]">
          <p className={muted}>
            {days.length} of {SESSION_COUNT} sessions placed. The test is on day {TEST_DAY}.
          </p>
          <div className="grid grid-cols-7 gap-[var(--space-2)]">
            {PLAN_DAYS.map((d) => {
              const on = days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  aria-label={`Day ${d}`}
                  onClick={() => setDays((current) => toggleSessionDay(current, d))}
                  className={`rounded-[4px] border py-[var(--space-2)] font-mono text-[var(--text-caption)] tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${
                    on
                      ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--surface)]"
                      : "border-[color:var(--border)] text-[color:var(--text-muted)]"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {hasSessions ? (
          <>
            <div className="grid grid-cols-2 gap-[var(--space-4)]">
              {[
                { name: "On test day", value: forecastRetention(days, TEST_DAY) },
                { name: "One week later", value: forecastRetention(days, HORIZON) },
              ].map((s) => (
                <div key={s.name} className="flex flex-col gap-[var(--space-1)]">
                  <p className={label}>{s.name}</p>
                  <p className="font-display text-[length:var(--text-h1)] leading-none text-[color:var(--text)] tabular-nums">
                    {pct(s.value)}
                  </p>
                </div>
              ))}
            </div>
            <p role="status" className="sr-only">
              {`On test day ${pct(forecastRetention(days, TEST_DAY))}, one week later ${pct(forecastRetention(days, HORIZON))}.`}
            </p>
            <RetentionChart days={days} curve={curve} />
            <p className={lead}>{EXPLANATION[matchPreset(days) ?? "custom"]}</p>
          </>
        ) : (
          <p className={lead}>Pick at least one study day to see the forecast.</p>
        )}

        <p className={`border-t border-[color:var(--border)] pt-[var(--space-4)] ${muted}`}>
          This curve comes from a simple illustrative memory model, not from your own data. The pattern matches the research
          summarized in{" "}
          <a href={EXPERIMENT_SOURCES[2]?.url} target="_blank" rel="noopener noreferrer" className={sourceLink}>
            {EXPERIMENT_SOURCES[2]?.label}
          </a>
          .
        </p>
      </div>
    </DemoShell>
  );
}
