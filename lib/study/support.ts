import { StudyInputError } from "./errors";

export type SupportArea = "prior-knowledge" | "reading" | "executive-function" | "self-regulation" | "test-anxiety";
export type SupportLevel = "on-track" | "some" | "more";

export const FREQUENCY_LABELS = ["Rarely", "Sometimes", "Often"] as const;

export interface SupportQuestion {
  id: string;
  area: SupportArea;
  text: string;
}

export const SUPPORT_QUESTIONS: readonly SupportQuestion[] = [
  { id: "pk1", area: "prior-knowledge", text: "New topics feel like they come out of nowhere." },
  { id: "pk2", area: "prior-knowledge", text: "I get lost in the first lesson of a new unit." },
  { id: "rd1", area: "reading", text: "I have to reread sentences to understand them." },
  { id: "rd2", area: "reading", text: "Reading for school takes me much longer than it takes my friends." },
  { id: "ef1", area: "executive-function", text: "I lose track of deadlines or start assignments late." },
  { id: "ef2", area: "executive-function", text: "Getting started on schoolwork is the hardest part." },
  { id: "sr1", area: "self-regulation", text: "I study by rereading my notes until they feel familiar." },
  { id: "sr2", area: "self-regulation", text: "My test scores surprise me." },
  { id: "ta1", area: "test-anxiety", text: "My mind goes blank in tests even when I knew the material." },
  { id: "ta2", area: "test-anxiety", text: "Worry about tests makes it hard to sleep or eat." },
];

export const AREA_LABEL: Readonly<Record<SupportArea, string>> = {
  "prior-knowledge": "Prior knowledge",
  reading: "Reading",
  "executive-function": "Organization",
  "self-regulation": "Checking what you know",
  "test-anxiety": "Test nerves",
};

export const LEVEL_LABEL: Readonly<Record<SupportLevel, string>> = {
  "on-track": "On track",
  some: "Some support",
  more: "More support",
};

const ADVICE: Readonly<Record<SupportArea, Readonly<Record<SupportLevel, string>>>> = {
  "prior-knowledge": {
    "on-track": "New material has something to hook onto. Keep reviewing old units so it stays that way.",
    some: "Before each new unit, spend ten minutes on the basics it builds on. Worked examples help more than jumping straight into problems.",
    more: "Ask for worked examples and a short review of the foundations before working alone. Filling gaps first makes everything after it faster.",
  },
  reading: {
    "on-track": "Reading is working for you. Make it count: read once, then recall.",
    some: "Read a section, then summarize it from memory before moving on. Audio versions of long texts can help you keep pace while your reading speeds up.",
    more: "Ask your school about reading support, and use audio for long assignments so the content keeps pace. Reading is a skill that improves at any age.",
  },
  "executive-function": {
    "on-track": "You manage deadlines well. A weekly plan will still make your study time count.",
    some: "Write every deadline in one place and break big assignments into small, dated steps. Put your phone in another room while you work.",
    more: "Use a pre-built schedule and a checklist for every assignment, and ask an adult to look over the plan each week. More structure makes the same work easier to start.",
  },
  "self-regulation": {
    "on-track": "You already check what you know. Keep using self-tests in place of rereading.",
    some: "Swap rereading for closing the book and writing what you remember. Predict your score before practice quizzes and compare.",
    more: "You may be studying hard in ways that feel productive and do little. Plan the week, test yourself without notes, and redo what you got wrong a few days later.",
  },
  "test-anxiety": {
    "on-track": "Nerves are staying out of your way. Timed practice keeps it that way.",
    some: "Take short timed practice tests often so the real one feels familiar. A racing heart before a test is your body getting ready.",
    more: "Frequent low-stakes timed practice helps most. If worry is affecting your sleep or eating, talk to a school counselor or a parent.",
  },
};

export interface AreaResult {
  area: SupportArea;
  label: string;
  score: number;
  level: SupportLevel;
  advice: string;
}

export interface SupportResult {
  areas: AreaResult[];
  suggestEvaluation: boolean;
  suggestCounselor: boolean;
}

const AREAS: readonly SupportArea[] = ["prior-knowledge", "reading", "executive-function", "self-regulation", "test-anxiety"];

function levelFor(score: number): SupportLevel {
  if (score >= 3) return "more";
  if (score === 2) return "some";
  return "on-track";
}

export function assessSupport(answers: Readonly<Record<string, number>>): SupportResult {
  const totals: Record<SupportArea, number> = {
    "prior-knowledge": 0,
    reading: 0,
    "executive-function": 0,
    "self-regulation": 0,
    "test-anxiety": 0,
  };
  for (const q of SUPPORT_QUESTIONS) {
    const a = answers[q.id];
    if (a === undefined) throw new StudyInputError("Answer every statement to see your results.");
    if (a !== 0 && a !== 1 && a !== 2) throw new StudyInputError("Each answer must be Rarely, Sometimes or Often.");
    totals[q.area] += a;
  }
  const areas = AREAS.map((area) => {
    const level = levelFor(totals[area]);
    return { area, label: AREA_LABEL[area], score: totals[area], level, advice: ADVICE[area][level] };
  });
  return {
    areas,
    suggestEvaluation: totals.reading === 4 || totals["executive-function"] === 4,
    suggestCounselor: totals["test-anxiety"] === 4,
  };
}
