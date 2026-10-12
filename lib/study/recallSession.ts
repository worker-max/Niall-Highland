import { FACT_SETS, FACTS_PER_SET, type FactSet, type SetId } from "./content";
import { StudyInputError } from "./errors";
import { createRng } from "./random";
import { predictionGap, scoreQuiz, type QuizScore } from "./recall";

export type Condition = "reread" | "recall";

export type SessionPhase = "intro" | "study-1" | "study-2" | "predict" | "distract" | "quiz" | "results";

export interface SessionState {
  phase: SessionPhase;
  seed: number;
  order: readonly [Condition, Condition];
  setFor: Readonly<Record<Condition, SetId>>;
  predictions: Readonly<Record<Condition, number | null>>;
  answers: Readonly<Record<string, string>>;
}

export type SessionAction =
  | { type: "start"; seed: number }
  | { type: "next" }
  | { type: "predict"; condition: Condition; value: number }
  | { type: "answer"; factId: string; choice: string }
  | { type: "restart"; seed: number };

export interface ConditionResult {
  condition: Condition;
  set: FactSet;
  predicted: number;
  score: QuizScore;
  gap: number;
}

const ALL_FACT_IDS = new Set(Object.values(FACT_SETS).flatMap((s) => s.facts.map((f) => f.id)));
const TOTAL_FACTS = ALL_FACT_IDS.size;

const NEXT_PHASE: Readonly<Record<SessionPhase, SessionPhase>> = {
  intro: "study-1",
  "study-1": "study-2",
  "study-2": "predict",
  predict: "distract",
  distract: "quiz",
  quiz: "results",
  results: "results",
};

/** Seed decides which condition comes first and which set each condition uses (counterbalancing). */
export function createSession(seed: number): SessionState {
  const rng = createRng(seed);
  const rereadFirst = rng() < 0.5;
  const harborForReread = rng() < 0.5;
  return {
    phase: "intro",
    seed,
    order: rereadFirst ? ["reread", "recall"] : ["recall", "reread"],
    setFor: harborForReread ? { reread: "harbor", recall: "orchard" } : { reread: "orchard", recall: "harbor" },
    predictions: { reread: null, recall: null },
    answers: {},
  };
}

export function canAdvance(state: SessionState): boolean {
  if (state.phase === "predict") {
    return state.predictions.reread !== null && state.predictions.recall !== null;
  }
  if (state.phase === "quiz") {
    return Object.keys(state.answers).length === TOTAL_FACTS;
  }
  return state.phase !== "results";
}

function isValidPrediction(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= FACTS_PER_SET;
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "start":
      return { ...createSession(action.seed), phase: "study-1" };
    case "restart":
      return createSession(action.seed);
    case "next":
      return canAdvance(state) ? { ...state, phase: NEXT_PHASE[state.phase] } : state;
    case "predict":
      if (state.phase !== "predict" || !isValidPrediction(action.value)) return state;
      return { ...state, predictions: { ...state.predictions, [action.condition]: action.value } };
    case "answer":
      if (state.phase !== "quiz" || !ALL_FACT_IDS.has(action.factId)) return state;
      return { ...state, answers: { ...state.answers, [action.factId]: action.choice } };
  }
}

export function studyStep(state: SessionState): { condition: Condition; set: FactSet } | null {
  if (state.phase !== "study-1" && state.phase !== "study-2") return null;
  const condition = state.order[state.phase === "study-1" ? 0 : 1];
  return { condition, set: FACT_SETS[state.setFor[condition]] };
}

function resultFor(state: SessionState, condition: Condition): ConditionResult {
  const predicted = state.predictions[condition];
  if (predicted === null) {
    throw new StudyInputError("A prediction is missing.");
  }
  const set = FACT_SETS[state.setFor[condition]];
  const score = scoreQuiz(state.answers, set);
  return { condition, set, predicted, score, gap: predictionGap(predicted, score.correct) };
}

export function summarizeSession(state: SessionState): readonly [ConditionResult, ConditionResult] {
  if (state.phase !== "results") {
    throw new StudyInputError("Results are ready once the quiz is finished.");
  }
  return [resultFor(state, "reread"), resultFor(state, "recall")];
}
