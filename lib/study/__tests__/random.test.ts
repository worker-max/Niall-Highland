import { describe, expect, it } from "vitest";
import { createRng, shuffle } from "../random";

describe("createRng", () => {
  it("returns the same sequence for the same seed", () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("returns floats in [0, 1)", () => {
    const rng = createRng(7);
    for (let i = 0; i < 1000; i += 1) {
      const n = rng();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it("differs across seeds", () => {
    expect(createRng(1)()).not.toEqual(createRng(2)());
  });
});

describe("shuffle", () => {
  it("keeps every item exactly once and leaves the input untouched", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8] as const;
    const out = shuffle(input, createRng(3));
    expect([...out].sort()).toEqual([...input].sort());
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("is repeatable for a seed", () => {
    const items = ["a", "b", "c", "d", "e"];
    expect(shuffle(items, createRng(9))).toEqual(shuffle(items, createRng(9)));
  });
});
