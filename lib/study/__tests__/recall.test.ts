import { describe, expect, it } from "vitest";
import { FACT_SETS } from "../content";
import { StudyInputError } from "../errors";
import { buildQuiz, predictionGap, scoreQuiz } from "../recall";

const harbor = FACT_SETS.harbor;
const orchard = FACT_SETS.orchard;

function answersFor(correctCount: number): Record<string, string> {
  return Object.fromEntries(
    harbor.facts.map((f, i) => [f.id, i < correctCount ? f.answer : f.distractors[0]]),
  );
}

describe("buildQuiz", () => {
  it("includes every fact from every set once, with four options containing the answer", () => {
    const quiz = buildQuiz([harbor, orchard], 11);
    expect(quiz).toHaveLength(16);
    expect(new Set(quiz.map((q) => q.factId)).size).toBe(16);
    for (const item of quiz) {
      const fact = [...harbor.facts, ...orchard.facts].find((f) => f.id === item.factId);
      expect(item.options).toHaveLength(4);
      expect(item.options).toContain(fact?.answer);
    }
  });

  it("is repeatable for a seed and varies across seeds", () => {
    const a = buildQuiz([harbor, orchard], 5).map((q) => q.factId);
    expect(buildQuiz([harbor, orchard], 5).map((q) => q.factId)).toEqual(a);
    expect(buildQuiz([harbor, orchard], 6).map((q) => q.factId)).not.toEqual(a);
  });
});

describe("scoreQuiz", () => {
  it("counts correct answers for one set", () => {
    expect(scoreQuiz(answersFor(6), harbor)).toEqual({ correct: 6, total: 8, percent: 75 });
  });

  it("ignores answers belonging to the other set", () => {
    const answers = { ...answersFor(8), [orchard.facts[0]!.id]: "anything" };
    expect(scoreQuiz(answers, harbor).correct).toBe(8);
  });

  it("throws when a fact in the set has no answer", () => {
    const answers = answersFor(8);
    delete answers[harbor.facts[3]!.id];
    expect(() => scoreQuiz(answers, harbor)).toThrow(StudyInputError);
  });
});

describe("predictionGap", () => {
  it("returns predicted minus actual", () => {
    expect(predictionGap(7, 4)).toBe(3);
    expect(predictionGap(2, 6)).toBe(-4);
  });

  it("rejects negative or fractional counts", () => {
    expect(() => predictionGap(-1, 3)).toThrow(StudyInputError);
    expect(() => predictionGap(2.5, 3)).toThrow(StudyInputError);
  });
});
