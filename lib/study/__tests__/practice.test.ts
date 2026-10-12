import { describe, expect, it } from "vitest";
import { StudyInputError } from "../errors";
import { buildBlockedSet, buildMixedSet, checkAnswer, PROBLEMS_PER_SET, scoreSet } from "../practice";

describe("problem sets", () => {
  it("blocked set groups each type together", () => {
    expect(buildBlockedSet(3).map((p) => p.type)).toEqual(["faces", "faces", "edges", "edges", "corners", "corners"]);
  });

  it("mixed set never repeats a type back to back", () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const types = buildMixedSet(seed).map((p) => p.type);
      expect(types).toHaveLength(PROBLEMS_PER_SET);
      for (let i = 1; i < types.length; i += 1) expect(types[i]).not.toBe(types[i - 1]);
      for (const t of ["faces", "edges", "corners"]) expect(types.filter((x) => x === t)).toHaveLength(2);
    }
  });

  it("computes answers from the prism rules with distinct base sides from 4 to 12", () => {
    for (const p of [...buildBlockedSet(8), ...buildMixedSet(8)]) {
      const expected = { faces: p.baseSides + 2, edges: p.baseSides * 3, corners: p.baseSides * 2 }[p.type];
      expect(p.answer).toBe(expected);
      expect(p.baseSides).toBeGreaterThanOrEqual(4);
      expect(p.baseSides).toBeLessThanOrEqual(12);
      expect(p.prompt).toContain(String(p.baseSides));
    }
    const sides = buildBlockedSet(8).map((p) => p.baseSides);
    expect(new Set(sides).size).toBe(sides.length);
  });

  it("is repeatable for a seed", () => {
    expect(buildMixedSet(4)).toEqual(buildMixedSet(4));
  });
});

describe("checkAnswer", () => {
  it("accepts the right whole number", () => {
    const p = buildBlockedSet(1)[0]!;
    expect(checkAnswer(p, p.answer)).toBe(true);
    expect(checkAnswer(p, p.answer + 1)).toBe(false);
  });

  it("checkAnswer rejects blanks and non-integers", () => {
    const p = buildBlockedSet(1)[0]!;
    expect(checkAnswer(p, Number.NaN)).toBe(false);
    expect(checkAnswer(p, p.answer + 0.5)).toBe(false);
  });
});

describe("scoreSet", () => {
  it("counts correct answers and throws on a missing one", () => {
    const set = buildBlockedSet(2);
    const answers = Object.fromEntries(set.map((p, i) => [p.id, i < 4 ? p.answer : -1]));
    expect(scoreSet(set, answers)).toEqual({ correct: 4, total: 6 });
    delete answers[set[5]!.id];
    expect(() => scoreSet(set, answers)).toThrow(StudyInputError);
  });
});
