import type { FactSet, SetId } from "./content";
import { StudyInputError } from "./errors";
import { createRng, shuffle } from "./random";

export interface QuizItem {
  factId: string;
  setId: SetId;
  cue: string;
  options: readonly string[];
}

export interface QuizScore {
  correct: number;
  total: number;
  percent: number;
}

/** Every fact from every set, interleaved, with shuffled options. Deterministic for a seed. */
export function buildQuiz(sets: readonly FactSet[], seed: number): QuizItem[] {
  const rng = createRng(seed);
  const items = sets.flatMap((set) =>
    set.facts.map((fact) => ({
      factId: fact.id,
      setId: set.id,
      cue: fact.cue,
      options: shuffle([fact.answer, ...fact.distractors], rng),
    })),
  );
  return shuffle(items, rng);
}

/** Score one set's facts. Answers for other sets are ignored; a missing answer is an error. */
export function scoreQuiz(answers: Readonly<Record<string, string>>, set: FactSet): QuizScore {
  let correct = 0;
  for (const fact of set.facts) {
    const choice = answers[fact.id];
    if (choice === undefined) {
      throw new StudyInputError(`Missing an answer for "${fact.cue}".`);
    }
    if (choice === fact.answer) correct += 1;
  }
  const total = set.facts.length;
  return { correct, total, percent: Math.round((correct / total) * 100) };
}

/** How far a prediction overshot (positive) or undershot (negative) the real score. */
export function predictionGap(predicted: number, actual: number): number {
  for (const n of [predicted, actual]) {
    if (!Number.isInteger(n) || n < 0) {
      throw new StudyInputError("Scores must be whole numbers of zero or more.");
    }
  }
  return predicted - actual;
}
