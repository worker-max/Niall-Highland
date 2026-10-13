import { describe, expect, it } from "vitest";
import { StudyInputError } from "../errors";
import { assessSupport, SUPPORT_QUESTIONS, type SupportArea } from "../support";

function answersWith(scores: Partial<Record<SupportArea, readonly [number, number]>>): Record<string, number> {
  const seen: Partial<Record<SupportArea, number>> = {};
  return Object.fromEntries(
    SUPPORT_QUESTIONS.map((q) => {
      const i = seen[q.area] ?? 0;
      seen[q.area] = i + 1;
      return [q.id, scores[q.area]?.[i] ?? 0];
    }),
  );
}

describe("SUPPORT_QUESTIONS", () => {
  it("has two questions for each of the five areas", () => {
    expect(SUPPORT_QUESTIONS).toHaveLength(10);
    const areas = new Set(SUPPORT_QUESTIONS.map((q) => q.area));
    expect(areas.size).toBe(5);
  });
});

describe("assessSupport", () => {
  it("maps area scores to levels", () => {
    const result = assessSupport(answersWith({ reading: [1, 1], "test-anxiety": [2, 1], "prior-knowledge": [1, 0] }));
    const level = (a: SupportArea) => result.areas.find((r) => r.area === a)?.level;
    expect(level("prior-knowledge")).toBe("on-track");
    expect(level("reading")).toBe("some");
    expect(level("test-anxiety")).toBe("more");
  });

  it("suggests an evaluation only for persistent reading or organization difficulty", () => {
    expect(assessSupport(answersWith({ reading: [2, 1] })).suggestEvaluation).toBe(false);
    expect(assessSupport(answersWith({ reading: [2, 2] })).suggestEvaluation).toBe(true);
    expect(assessSupport(answersWith({ "executive-function": [2, 2] })).suggestEvaluation).toBe(true);
    expect(assessSupport(answersWith({ "self-regulation": [2, 2] })).suggestEvaluation).toBe(false);
  });

  it("suggests talking to a counselor only for maximum test anxiety", () => {
    expect(assessSupport(answersWith({ "test-anxiety": [2, 2] })).suggestCounselor).toBe(true);
    expect(assessSupport(answersWith({ "test-anxiety": [2, 1] })).suggestCounselor).toBe(false);
  });

  it("never mentions styles", () => {
    for (const scores of [{}, { reading: [2, 2] }, { reading: [1, 1] }] as const) {
      for (const r of assessSupport(answersWith(scores)).areas) expect(r.advice.toLowerCase()).not.toContain("style");
    }
  });

  it("rejects missing or invalid answers", () => {
    const answers = answersWith({});
    delete answers[SUPPORT_QUESTIONS[0]!.id];
    expect(() => assessSupport(answers)).toThrow(StudyInputError);
    expect(() => assessSupport({ ...answersWith({}), [SUPPORT_QUESTIONS[1]!.id]: 3 })).toThrow(StudyInputError);
  });
});
