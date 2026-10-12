import { describe, expect, it } from "vitest";
import { FACT_SETS } from "../content";
import { StudyInputError } from "../errors";
import {
  canAdvance,
  createSession,
  phaseAnnouncement,
  sessionReducer,
  studyStep,
  summarizeSession,
  type SessionAction,
  type SessionState,
} from "../recallSession";

function run(state: SessionState, ...actions: SessionAction[]): SessionState {
  return actions.reduce(sessionReducer, state);
}

const allFacts = [...FACT_SETS.harbor.facts, ...FACT_SETS.orchard.facts];

function toQuiz(): SessionState {
  return run(
    createSession(1),
    { type: "start", seed: 4 },
    { type: "next" },
    { type: "next" },
    { type: "predict", condition: "reread", value: 6 },
    { type: "predict", condition: "recall", value: 5 },
    { type: "next" },
    { type: "next" },
  );
}

function answerAll(state: SessionState, correct: (factId: string) => boolean): SessionState {
  return allFacts.reduce(
    (s, f) => sessionReducer(s, { type: "answer", factId: f.id, choice: correct(f.id) ? f.answer : f.distractors[0] }),
    state,
  );
}

describe("createSession", () => {
  it("starts at intro with one set per condition", () => {
    const s = createSession(1);
    expect(s.phase).toBe("intro");
    expect(new Set(Object.values(s.setFor)).size).toBe(2);
    expect(new Set(s.order).size).toBe(2);
  });

  it("counterbalances order and set assignment across seeds", () => {
    const orders = new Set<string>();
    const sets = new Set<string>();
    for (let seed = 1; seed <= 40; seed += 1) {
      const s = createSession(seed);
      orders.add(s.order.join());
      sets.add(s.setFor.reread);
    }
    expect(orders.size).toBe(2);
    expect(sets.size).toBe(2);
  });
});

describe("sessionReducer flow", () => {
  it("moves intro to study-1 to study-2 to predict", () => {
    const s = run(createSession(1), { type: "start", seed: 2 }, { type: "next" }, { type: "next" });
    expect(s.phase).toBe("predict");
  });

  it("serves each condition exactly once in the study phases", () => {
    const s1 = run(createSession(1), { type: "start", seed: 2 });
    const s2 = sessionReducer(s1, { type: "next" });
    const conditions = [studyStep(s1)?.condition, studyStep(s2)?.condition];
    expect(new Set(conditions)).toEqual(new Set(["reread", "recall"]));
    expect(studyStep(createSession(1))).toBeNull();
  });

  it("blocks predict -> distract until both predictions exist", () => {
    let s = run(createSession(1), { type: "start", seed: 2 }, { type: "next" }, { type: "next" });
    s = sessionReducer(s, { type: "predict", condition: "reread", value: 4 });
    expect(canAdvance(s)).toBe(false);
    expect(sessionReducer(s, { type: "next" }).phase).toBe("predict");
    s = sessionReducer(s, { type: "predict", condition: "recall", value: 3 });
    expect(canAdvance(s)).toBe(true);
    expect(sessionReducer(s, { type: "next" }).phase).toBe("distract");
  });

  it("predict ignores invalid values", () => {
    const s = run(createSession(1), { type: "start", seed: 2 }, { type: "next" }, { type: "next" });
    for (const value of [9, -1, 2.5, Number.NaN]) {
      expect(sessionReducer(s, { type: "predict", condition: "reread", value }).predictions.reread).toBeNull();
    }
  });

  it("clearing a prediction sets it back to null and blocks advancing", () => {
    let s = run(
      createSession(1),
      { type: "start", seed: 2 },
      { type: "next" },
      { type: "next" },
      { type: "predict", condition: "reread", value: 4 },
      { type: "predict", condition: "recall", value: 3 },
    );
    s = sessionReducer(s, { type: "clearPrediction", condition: "reread" });
    expect(s.predictions.reread).toBeNull();
    expect(canAdvance(s)).toBe(false);
  });

  it("quiz cannot finish with unanswered items", () => {
    let s = toQuiz();
    expect(s.phase).toBe("quiz");
    s = sessionReducer(s, { type: "answer", factId: "h1", choice: "Green" });
    expect(canAdvance(s)).toBe(false);
    expect(sessionReducer(s, { type: "next" }).phase).toBe("quiz");
    s = answerAll(s, () => true);
    expect(sessionReducer(s, { type: "next" }).phase).toBe("results");
  });

  it("answer replaces a previous choice", () => {
    let s = toQuiz();
    s = sessionReducer(s, { type: "answer", factId: "h1", choice: "Red" });
    s = sessionReducer(s, { type: "answer", factId: "h1", choice: "Green" });
    expect(Object.keys(s.answers)).toEqual(["h1"]);
    expect(s.answers.h1).toBe("Green");
  });

  it("ignores answers for unknown facts and answers outside the quiz", () => {
    const quiz = toQuiz();
    expect(sessionReducer(quiz, { type: "answer", factId: "zz", choice: "x" }).answers).toEqual({});
    const intro = createSession(1);
    expect(sessionReducer(intro, { type: "answer", factId: "h1", choice: "Green" })).toBe(intro);
  });

  it("restart clears everything", () => {
    const done = sessionReducer(answerAll(toQuiz(), () => true), { type: "next" });
    const fresh = sessionReducer(done, { type: "restart", seed: 99 });
    expect(fresh).toEqual(createSession(99));
  });
});

describe("phaseAnnouncement", () => {
  it("gives a short status line for every phase", () => {
    let s = run(createSession(1), { type: "start", seed: 2 });
    const step = studyStep(s);
    expect(phaseAnnouncement(s)).toBe(
      `Round 1: ${step?.condition === "reread" ? "Reread" : "Self-test"}, 60 seconds`,
    );
    expect(phaseAnnouncement(createSession(1))).toBe("Reread vs. Recall experiment, ready to start");
    s = run(s, { type: "next" }, { type: "next" });
    expect(phaseAnnouncement(s)).toBe("Predict your scores");
    expect(phaseAnnouncement(toQuiz())).toBe("Quiz: 16 questions");
  });
});

describe("summarizeSession", () => {
  it("scores each condition against its own set and computes the prediction gap", () => {
    let s = toQuiz();
    const rereadSet = FACT_SETS[s.setFor.reread];
    s = answerAll(s, (id) => !rereadSet.facts.some((f) => f.id === id));
    s = sessionReducer(s, { type: "next" });
    const [reread, recall] = summarizeSession(s);
    expect(reread.condition).toBe("reread");
    expect(reread.score.correct).toBe(0);
    expect(reread.gap).toBe(6);
    expect(recall.score.correct).toBe(8);
    expect(recall.gap).toBe(-3);
  });

  it("throws before results", () => {
    expect(() => summarizeSession(toQuiz())).toThrow(StudyInputError);
  });
});
