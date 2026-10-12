import { describe, expect, it } from "vitest";
import { FACT_SETS, FACTS_PER_SET, SUBJECT_ROUTINES } from "../content";

const sets = Object.values(FACT_SETS);

describe("FACT_SETS", () => {
  it("has two sets of FACTS_PER_SET facts each", () => {
    expect(sets).toHaveLength(2);
    for (const set of sets) expect(set.facts).toHaveLength(FACTS_PER_SET);
  });

  it("uses unique fact ids across both sets", () => {
    const ids = sets.flatMap((s) => s.facts.map((f) => f.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("answers are unique across both sets", () => {
    const answers = sets.flatMap((s) => s.facts.map((f) => f.answer.toLowerCase()));
    expect(new Set(answers).size).toBe(answers.length);
  });

  it("gives every fact three distractors that differ from the answer and each other", () => {
    for (const fact of sets.flatMap((s) => s.facts)) {
      const options = [fact.answer, ...fact.distractors].map((o) => o.toLowerCase());
      expect(new Set(options).size).toBe(4);
    }
  });

  it("states each answer inside its statement", () => {
    for (const fact of sets.flatMap((s) => s.facts)) {
      expect(fact.statement.toLowerCase()).toContain(fact.answer.toLowerCase());
    }
  });
});

describe("SUBJECT_ROUTINES", () => {
  it("covers the eight subjects from the essay, each with a source", () => {
    expect(SUBJECT_ROUTINES).toHaveLength(8);
    for (const r of SUBJECT_ROUTINES) expect(r.source.length).toBeGreaterThan(0);
  });
});
