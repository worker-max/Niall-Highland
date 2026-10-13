"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { DemoShell } from "@/components/primitives/DemoShell";
import {
  buildBlockedSet,
  buildMixedSet,
  checkAnswer,
  FORMULA_TEXT,
  PROBLEM_TYPES,
  scoreSet,
  TRIAL_RESULT,
  type Problem,
} from "@/lib/study/practice";
import { ghostBtn, label, lead, muted, primaryBtn, sourceLink, usePhaseFocus } from "./ui";

type Phase = "intro" | "blocked" | "mixed" | "results";
type SetName = "blocked" | "mixed";

const HEADING: Record<Phase, string> = {
  intro: "Blocked vs. Mixed experiment, ready to start",
  blocked: "Set 1: blocked practice, one type at a time",
  mixed: "Set 2: mixed practice, types shuffled",
  results: "Your results are ready",
};

const SET_NAME: Record<SetName, string> = { blocked: "Blocked", mixed: "Mixed" };

interface Timing {
  start: number;
  end: number;
}

function ProblemRunner({
  problems,
  onDone,
}: {
  problems: readonly Problem[];
  onDone: (answers: Record<string, number>, timing: Timing) => void;
}) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<boolean | null>(null);
  const [start] = useState(() => Date.now());
  const problem = problems[index] as Problem;
  const last = index === problems.length - 1;
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Check and Next swap places, so focus would fall to the page; keep it on the control the student needs next.
  useEffect(() => {
    if (index > 0) inputRef.current?.focus();
  }, [index]);
  useEffect(() => {
    if (checked !== null) nextRef.current?.focus();
  }, [checked]);

  function check(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = Number(input);
    setAnswers((a) => ({ ...a, [problem.id]: value }));
    setChecked(checkAnswer(problem, value));
  }

  function advance() {
    if (last) {
      onDone(answers, { start, end: Date.now() });
      return;
    }
    setIndex(index + 1);
    setInput("");
    setChecked(null);
  }

  return (
    <form onSubmit={check} className="flex flex-col gap-[var(--space-4)]">
      <p className={muted}>
        Problem {index + 1} of {problems.length}
      </p>
      <label htmlFor="practice-answer" className="font-display text-[length:var(--text-h3)] leading-[1.3] text-[color:var(--text)]">
        {problem.prompt}
      </label>
      <input
        id="practice-answer"
        ref={inputRef}
        type="number"
        inputMode="numeric"
        step={1}
        value={input}
        disabled={checked !== null}
        onChange={(e) => setInput(e.target.value)}
        className="w-[7rem] rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[color:var(--text)]"
      />
      {checked === null ? (
        <div>
          <button type="submit" className={primaryBtn} disabled={input.trim() === ""}>
            Check
          </button>
        </div>
      ) : (
        <>
          <p role="status" className={lead}>
            {checked ? "Correct." : `Not quite. It was ${problem.answer}.`}
          </p>
          <div>
            <button ref={nextRef} type="button" className={primaryBtn} onClick={advance}>
              {last ? "Finish this set" : "Next problem"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}

export function BlockedVsMixed() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [seed, setSeed] = useState(1);
  const [answers, setAnswers] = useState<Record<SetName, Record<string, number>>>({ blocked: {}, mixed: {} });
  const [timings, setTimings] = useState<Partial<Record<SetName, Timing>>>({});
  const sets = useMemo(() => ({ blocked: buildBlockedSet(seed), mixed: buildMixedSet(seed) }), [seed]);
  const headingRef = usePhaseFocus(phase);

  function start() {
    setSeed(Date.now());
    setAnswers({ blocked: {}, mixed: {} });
    setTimings({});
    setPhase("blocked");
  }

  function finish(set: SetName, setAnswersFor: Record<string, number>, timing: Timing) {
    setAnswers((a) => ({ ...a, [set]: setAnswersFor }));
    setTimings((t) => ({ ...t, [set]: timing }));
    setPhase(set === "blocked" ? "mixed" : "results");
  }

  return (
    <DemoShell label="Lab 03 · Blocked vs. Mixed" title="About 4 minutes">
      <div className="flex flex-col gap-[var(--space-6)]">
        <p ref={headingRef} tabIndex={-1} className={`${label} outline-none`}>
          {HEADING[phase]}
        </p>
        <p role="status" className="sr-only">
          {HEADING[phase]}
        </p>

        {phase === "intro" ? (
          <>
            <p className={lead}>
              Three rules about prisms. Learn them, then solve two sets of six problems. The first set gives you each type in
              a block. The second shuffles them, so you have to work out which rule each problem needs.
            </p>
            <ul className="flex flex-col gap-[var(--space-2)]">
              {PROBLEM_TYPES.map((t) => (
                <li key={t} className="font-mono text-[length:var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text)]">
                  {FORMULA_TEXT[t]}
                </li>
              ))}
            </ul>
            <div>
              <button type="button" className={primaryBtn} onClick={start}>
                Start the experiment
              </button>
            </div>
          </>
        ) : null}

        {phase === "blocked" ? (
          <ProblemRunner key={`b-${seed}`} problems={sets.blocked} onDone={(a, t) => finish("blocked", a, t)} />
        ) : null}
        {phase === "mixed" ? (
          <ProblemRunner key={`m-${seed}`} problems={sets.mixed} onDone={(a, t) => finish("mixed", a, t)} />
        ) : null}

        {phase === "results" ? (
          <>
            <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
              {(["blocked", "mixed"] as const).map((set) => {
                const score = scoreSet(sets[set], answers[set]);
                const timing = timings[set];
                const seconds = timing ? Math.round((timing.end - timing.start) / 1000) : 0;
                return (
                  <div key={set} className="rounded-[4px] border border-[color:var(--border)] p-[var(--space-4)]">
                    <p className={label}>{SET_NAME[set]}</p>
                    <p className="mt-[var(--space-2)] font-display text-[length:var(--text-h1)] leading-none text-[color:var(--text)] tabular-nums">
                      {score.correct}/{score.total}
                    </p>
                    <p className={`mt-[var(--space-2)] ${muted}`}>{seconds} seconds</p>
                  </div>
                );
              })}
            </div>
            <p className={lead}>
              Most people find the mixed set slower and harder. That is the point. In the blocked set you already knew which
              rule to use before you read the problem. In the mixed set you had to choose, and choosing is exactly what a real
              test asks of you.
            </p>
            <p className={muted}>
              In a large trial with {TRIAL_RESULT.students} seventh graders, students who practiced with mixed sets scored{" "}
              {TRIAL_RESULT.mixed}% on a test a month later, against {TRIAL_RESULT.blocked}% for students who practiced in
              blocks.
            </p>
            <div>
              <button type="button" className={ghostBtn} onClick={start}>
                Run it again
              </button>
            </div>
          </>
        ) : null}

        <p className={`border-t border-[color:var(--border)] pt-[var(--space-4)] ${muted}`}>
          Based on{" "}
          <a href={TRIAL_RESULT.url} target="_blank" rel="noopener noreferrer" className={sourceLink}>
            {TRIAL_RESULT.label}
          </a>
          . Nothing you enter leaves this page.
        </p>
      </div>
    </DemoShell>
  );
}
