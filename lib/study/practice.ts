import { StudyInputError } from "./errors";
import { createRng, shuffle } from "./random";

export type ProblemType = "faces" | "edges" | "corners";

export const PROBLEM_TYPES: readonly ProblemType[] = ["faces", "edges", "corners"];

export const FORMULA_TEXT: Readonly<Record<ProblemType, string>> = {
  faces: "Faces = base sides + 2",
  edges: "Edges = base sides × 3",
  corners: "Corners = base sides × 2",
};

export interface Problem {
  id: string;
  type: ProblemType;
  baseSides: number;
  prompt: string;
  answer: number;
}

export const PROBLEMS_PER_SET = 6;

export const TRIAL_RESULT = {
  mixed: 61,
  blocked: 38,
  students: 787,
  label: "Rohrer et al. (2020), a preregistered trial with seventh graders",
  url: "https://ies.ed.gov/ncee/wwc/Study/88770",
} as const;

const RULES: Readonly<Record<ProblemType, (b: number) => number>> = {
  faces: (b) => b + 2,
  edges: (b) => b * 3,
  corners: (b) => b * 2,
};

function makeProblems(types: readonly ProblemType[], seed: number, prefix: string): Problem[] {
  const sides = shuffle([4, 5, 6, 7, 8, 9, 10, 11, 12], createRng(seed));
  return types.map((type, i) => {
    const baseSides = sides[i] as number;
    return {
      id: `${prefix}${i + 1}`,
      type,
      baseSides,
      prompt: `How many ${type} does a prism with ${baseSides} base sides have?`,
      answer: RULES[type](baseSides),
    };
  });
}

export function buildBlockedSet(seed: number): Problem[] {
  return makeProblems(PROBLEM_TYPES.flatMap((t) => [t, t]), seed, "b");
}

function hasRepeat(types: readonly ProblemType[]): boolean {
  return types.some((t, i) => i > 0 && t === types[i - 1]);
}

export function buildMixedSet(seed: number): Problem[] {
  const rng = createRng(seed ^ 0x9e3779b9);
  const pool = PROBLEM_TYPES.flatMap((t) => [t, t]);
  let order = shuffle(pool, rng);
  for (let attempt = 0; attempt < 100 && hasRepeat(order); attempt += 1) {
    order = shuffle(pool, rng);
  }
  if (hasRepeat(order)) order = [...PROBLEM_TYPES, ...PROBLEM_TYPES];
  return makeProblems(order, seed + 1, "m");
}

export function checkAnswer(problem: Problem, answer: number): boolean {
  return Number.isInteger(answer) && answer === problem.answer;
}

export function scoreSet(
  problems: readonly Problem[],
  answers: Readonly<Record<string, number>>,
): { correct: number; total: number } {
  let correct = 0;
  for (const p of problems) {
    const a = answers[p.id];
    if (a === undefined) throw new StudyInputError(`Missing an answer for "${p.prompt}".`);
    if (checkAnswer(p, a)) correct += 1;
  }
  return { correct, total: problems.length };
}
