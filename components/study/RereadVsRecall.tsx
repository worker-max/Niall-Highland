"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { DemoShell } from "@/components/primitives/DemoShell";
import {
  DISTRACT_SECONDS,
  EXPERIMENT_SOURCES,
  FACT_SETS,
  FACTS_PER_SET,
  STUDY_SECONDS,
  type Fact,
} from "@/lib/study/content";
import { buildQuiz } from "@/lib/study/recall";
import {
  canAdvance,
  createSession,
  sessionReducer,
  studyStep,
  summarizeSession,
  type Condition,
} from "@/lib/study/recallSession";

const primaryBtn =
  "inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-[var(--space-6)] py-[var(--space-3)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--surface)] transition-opacity disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]";
const ghostBtn =
  "inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-[var(--space-4)] py-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]";
const lead = "text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text)]";
const muted = "text-[length:var(--text-small)] leading-[1.6] text-[color:var(--text-muted)]";
const label = "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]";

const CONDITION_NAME: Record<Condition, string> = { reread: "Reread", recall: "Self-test" };

function Countdown({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left === 0) {
      onDone();
      return undefined;
    }
    const id = window.setTimeout(() => setLeft(left - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left, onDone]);
  return (
    <span className="font-mono text-[var(--text-caption)] tabular-nums text-[color:var(--text-faint)]" aria-live="off">
      {left}s left
    </span>
  );
}

function RereadList({ facts }: { facts: readonly Fact[] }) {
  return (
    <ul className="flex flex-col gap-[var(--space-2)]">
      {facts.map((f) => (
        <li key={f.id} className={lead}>
          {f.statement}
        </li>
      ))}
    </ul>
  );
}

function Flashcards({ facts }: { facts: readonly Fact[] }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const fact = facts[index % facts.length] as Fact;
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <p className={label}>
        Card {(index % facts.length) + 1} of {facts.length}
      </p>
      <p className="font-display text-[length:var(--text-h3)] leading-[1.3] text-[color:var(--text)]">{fact.cue}</p>
      <p className={muted}>Answer it in your head first. Then check.</p>
      {shown ? <p className={lead}>{fact.answer}</p> : null}
      <div className="flex flex-wrap gap-[var(--space-3)]">
        {shown ? (
          <button type="button" className={ghostBtn} onClick={() => { setShown(false); setIndex(index + 1); }}>
            Next card
          </button>
        ) : (
          <button type="button" className={ghostBtn} onClick={() => setShown(true)}>
            Show answer
          </button>
        )}
      </div>
    </div>
  );
}

export function RereadVsRecall() {
  const [state, dispatch] = useReducer(sessionReducer, 1, createSession);
  const next = useCallback(() => dispatch({ type: "next" }), []);
  const quiz = useMemo(() => buildQuiz(Object.values(FACT_SETS), state.seed), [state.seed]);
  const step = studyStep(state);

  return (
    <DemoShell label="Lab 01 · Reread vs. Recall" title="About 6 minutes">
      <div className="flex flex-col gap-[var(--space-6)]" aria-live="polite">
        {state.phase === "intro" ? (
          <>
            <p className={lead}>
              You are going to learn two short lists of facts about two made-up places. One list you will reread. The other
              you will quiz yourself on. Then a short break, then a quiz on both. Guess which method wins before you start.
            </p>
            <div>
              <button type="button" className={primaryBtn} onClick={() => dispatch({ type: "start", seed: Date.now() })}>
                Start the experiment
              </button>
            </div>
          </>
        ) : null}

        {step ? (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
              <p className={label}>
                Round {state.phase === "study-1" ? 1 : 2} · {CONDITION_NAME[step.condition]} · {step.set.title}
              </p>
              <Countdown key={state.phase} seconds={STUDY_SECONDS} onDone={next} />
            </div>
            <p className={muted}>
              {step.condition === "reread"
                ? "Read these facts. When you reach the end, read them again. Keep going until the timer runs out."
                : "Flip through the cards. Answer each one before you look. Keep cycling until the timer runs out."}
            </p>
            {step.condition === "reread" ? <RereadList facts={step.set.facts} /> : <Flashcards facts={step.set.facts} />}
          </>
        ) : null}

        {state.phase === "predict" ? (
          <>
            <p className={lead}>Before the quiz: how many of the {FACTS_PER_SET} facts do you think you will get right from each list?</p>
            {(["reread", "recall"] as const).map((condition) => (
              <label key={condition} className="flex flex-wrap items-center gap-[var(--space-3)]">
                <span className="min-w-[14ch] text-[color:var(--text)]">
                  {CONDITION_NAME[condition]} ({FACT_SETS[state.setFor[condition]].title})
                </span>
                <input
                  id={`predict-${condition}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={FACTS_PER_SET}
                  step={1}
                  value={state.predictions[condition] ?? ""}
                  onChange={(e) => dispatch({ type: "predict", condition, value: Number(e.target.value) })}
                  className="w-[5rem] rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[color:var(--text)]"
                />
                <span className={muted}>out of {FACTS_PER_SET}</span>
              </label>
            ))}
            <div>
              <button type="button" className={primaryBtn} disabled={!canAdvance(state)} onClick={next}>
                Lock in my guesses
              </button>
            </div>
          </>
        ) : null}

        {state.phase === "distract" ? (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
              <p className={label}>Short break</p>
              <Countdown key="distract" seconds={DISTRACT_SECONDS} onDone={next} />
            </div>
            <p className={lead}>
              Count backward from 300 by threes, out loud or in your head. This clears your short-term memory so the quiz
              measures what you actually learned.
            </p>
          </>
        ) : null}

        {state.phase === "quiz" ? (
          <>
            <p className={muted}>
              {Object.keys(state.answers).length} of {quiz.length} answered
            </p>
            <ol className="flex flex-col gap-[var(--space-6)]">
              {quiz.map((item, i) => (
                <li key={item.factId}>
                  <fieldset className="flex flex-col gap-[var(--space-2)]">
                    <legend className="mb-[var(--space-2)] text-[color:var(--text)]">
                      {i + 1}. {item.cue}
                    </legend>
                    <div className="flex flex-wrap gap-[var(--space-2)]">
                      {item.options.map((option) => {
                        const picked = state.answers[item.factId] === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={picked}
                            onClick={() => dispatch({ type: "answer", factId: item.factId, choice: option })}
                            className={`${ghostBtn} normal-case tracking-normal ${picked ? "border-[color:var(--accent)] bg-[color:var(--accent-tint)]" : ""}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                </li>
              ))}
            </ol>
            <div>
              <button type="button" className={primaryBtn} disabled={!canAdvance(state)} onClick={next}>
                See my results
              </button>
            </div>
          </>
        ) : null}

        {state.phase === "results" ? <Results state={state} onRestart={() => dispatch({ type: "restart", seed: Date.now() })} /> : null}

        <p className={`border-t border-[color:var(--border)] pt-[var(--space-4)] ${muted}`}>
          Based on{" "}
          {EXPERIMENT_SOURCES.slice(0, 2).map((s, i) => (
            <span key={s.url}>
              {i > 0 ? " and " : null}
              <a href={s.url} className="text-[color:var(--accent)] underline underline-offset-4">
                {s.label}
              </a>
            </span>
          ))}
          . Nothing you enter leaves this page.
        </p>
      </div>
    </DemoShell>
  );
}

function Results({ state, onRestart }: { state: Parameters<typeof summarizeSession>[0]; onRestart: () => void }) {
  const [reread, recall] = summarizeSession(state);
  const recallWon = recall.score.correct > reread.score.correct;
  return (
    <>
      <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
        {[reread, recall].map((r) => (
          <div key={r.condition} className="rounded-[4px] border border-[color:var(--border)] p-[var(--space-4)]">
            <p className={label}>{CONDITION_NAME[r.condition]}</p>
            <p className="mt-[var(--space-2)] font-display text-[length:var(--text-h1)] leading-none text-[color:var(--text)] tabular-nums">
              {r.score.correct}/{r.score.total}
            </p>
            <p className={`mt-[var(--space-2)] ${muted}`}>
              You guessed {r.predicted}.{" "}
              {r.gap > 0 ? `You overestimated by ${r.gap}.` : r.gap < 0 ? `You underestimated by ${-r.gap}.` : "Spot on."}
            </p>
          </div>
        ))}
      </div>
      <p className={lead}>
        {recallWon
          ? "Self-testing won. That is the result researchers keep finding, and the gap usually grows over the following days."
          : "Rereading held its own today. Over one sitting that happens. Researchers find the self-testing advantage grows over the next few days, so try the quiz again tomorrow from memory."}
      </p>
      <p className={muted}>
        Look at your guesses. Most people expect rereading to win because familiar text feels like knowledge. That feeling is
        the trap. Next time you study, close the book and write down what you remember before you look again.
      </p>
      <div>
        <button type="button" className={primaryBtn} onClick={onRestart}>
          Run it again
        </button>
      </div>
    </>
  );
}
