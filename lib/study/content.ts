/**
 * Study content shared by niallhighland.com and VEND/AI. Framework-free:
 * no React, Next or site imports. The two fact sets describe made-up places
 * so no student starts with prior knowledge of either.
 */

export type SetId = "harbor" | "orchard";

export interface Fact {
  id: string;
  /** Sentence shown during rereading. Contains the answer. */
  statement: string;
  /** Question shown on flashcards and in the quiz. */
  cue: string;
  answer: string;
  distractors: readonly [string, string, string];
}

export interface FactSet {
  id: SetId;
  title: string;
  facts: readonly Fact[];
}

export interface SourceRef {
  label: string;
  url: string;
}

export interface SubjectRoutine {
  subject: string;
  routine: string;
  why: string;
  source: string;
}

export const FACTS_PER_SET = 8;
export const STUDY_SECONDS = 60;
export const DISTRACT_SECONDS = 90;

export const FACT_SETS: Readonly<Record<SetId, FactSet>> = {
  harbor: {
    id: "harbor",
    title: "Port Veller",
    facts: [
      { id: "h1", statement: "The lighthouse in Port Veller is painted green.", cue: "What color is the Port Veller lighthouse?", answer: "Green", distractors: ["Red", "White", "Blue"] },
      { id: "h2", statement: "Port Veller's main export is kelp.", cue: "What is Port Veller's main export?", answer: "Kelp", distractors: ["Salt", "Timber", "Wool"] },
      { id: "h3", statement: "The harbor wall was finished in 1874.", cue: "When was the harbor wall finished?", answer: "1874", distractors: ["1792", "1915", "1838"] },
      { id: "h4", statement: "The oldest fishing boat in the harbor is called the Marigold.", cue: "What is the oldest fishing boat called?", answer: "Marigold", distractors: ["Seraphine", "Kestrel", "Dolores"] },
      { id: "h5", statement: "Seven bridges cross the river through town.", cue: "How many bridges cross the river?", answer: "Seven", distractors: ["Three", "Five", "Nine"] },
      { id: "h6", statement: "The town festival celebrates the first herring catch of the year.", cue: "What does the town festival celebrate?", answer: "The first herring catch", distractors: ["The founding of the town", "The end of winter", "A royal visit"] },
      { id: "h7", statement: "The town bell was cast from a ship's anchor.", cue: "What was the town bell made from?", answer: "A ship's anchor", distractors: ["A cannon", "Church silver", "A railway rail"] },
      { id: "h8", statement: "The harbor master holds the title Warden of the Tides.", cue: "What is the harbor master's title?", answer: "Warden of the Tides", distractors: ["Keeper of the Quay", "Lord of the Harbor", "Captain of the Port"] },
    ],
  },
  orchard: {
    id: "orchard",
    title: "Calder Valley",
    facts: [
      { id: "o1", statement: "Calder Valley is famous for an apple called the Russet Queen.", cue: "What apple is Calder Valley famous for?", answer: "Russet Queen", distractors: ["Golden Calder", "Red Baron", "Winter Pearl"] },
      { id: "o2", statement: "The valley holds its blossom festival in May.", cue: "In which month is the blossom festival?", answer: "May", distractors: ["March", "June", "August"] },
      { id: "o3", statement: "The river running through the valley is the Ossel.", cue: "What is the valley's river called?", answer: "The Ossel", distractors: ["The Brannock", "The Wey", "The Lune"] },
      { id: "o4", statement: "Orchard owners scare birds away with brass wind chimes.", cue: "What do orchard owners use to scare birds?", answer: "Brass wind chimes", distractors: ["Scarecrows", "Painted owls", "Bonfire smoke"] },
      { id: "o5", statement: "Twenty-two farms belong to the valley cooperative.", cue: "How many farms are in the cooperative?", answer: "Twenty-two", distractors: ["Twelve", "Thirty", "Forty-one"] },
      { id: "o6", statement: "The cider press is powered by a water wheel.", cue: "What powers the cider press?", answer: "A water wheel", distractors: ["A horse", "A steam engine", "Wind sails"] },
      { id: "o7", statement: "The oldest tree in the valley is nicknamed Old Sorrow.", cue: "What is the oldest tree's nickname?", answer: "Old Sorrow", distractors: ["Grandfather Oak", "The Duchess", "Long Tom"] },
      { id: "o8", statement: "The valley railway closed in 1961.", cue: "When did the valley railway close?", answer: "1961", distractors: ["1902", "1948", "1987"] },
    ],
  },
};

export const EXPERIMENT_SOURCES: readonly SourceRef[] = [
  { label: "Roediger & Karpicke (2006), the testing effect", url: "https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x" },
  { label: "Knoll et al. (2017), preference versus recall", url: "https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/bjop.12214" },
  { label: "Dunlosky et al. (2013), ranking study techniques", url: "https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html" },
];

export const SUBJECT_ROUTINES: readonly SubjectRoutine[] = [
  { subject: "Math", routine: "Mixed review sets including older problem types; worked example, then partial, then blank; error log with a redo a few days later", why: "Math is choosing the right method. Mixed practice is the only way to practice choosing.", source: "Rohrer et al. (2020); IES algebra practice guide" },
  { subject: "Biology", routine: "Self-quiz after each class; redraw key diagrams from memory and explain them aloud; concept map from memory, then check notes", why: "Biology is mechanisms and structures. You understand a process when you can rebuild it from nothing.", source: "McDaniel et al. (2011); Schroeder et al. concept-map meta-analysis" },
  { subject: "Chemistry & physics", routine: "The biology routine for concepts, plus the math routine for problem sets", why: "Half explanation, half calculation. Each half needs its own practice.", source: "Worked-example and testing-effect research" },
  { subject: "English & essays", routine: "After reading, a summary plus two questions from memory; planned and revised essays against the rubric; timed essays near exams", why: "Writing is a skill. Skills grow through practice and feedback, not rereading.", source: "Graham & Perin (2007), Writing Next" },
  { subject: "History", routine: "Spaced flashcards for facts; cause-and-effect chains from memory; sourcing practice with document sets; timed source essays", why: "History is argument from evidence. Students must practice interrogating sources.", source: "Wineburg (1991); Reisman (2012)" },
  { subject: "World languages", routine: "Daily spaced flashcards in both directions; daily listening, reading and speaking; memory images only for stubborn words", why: "Language is retrieval under time pressure. Output is the test, so output is the practice.", source: "Secondary-school spacing studies" },
  { subject: "Computer science", routine: "Trace worked code by hand; rearrange scrambled code into working order; then write your own", why: "Code is read before it is written. Tracing builds the mental model.", source: "Parsons-problem research, mostly undergraduate" },
  { subject: "Exams (SAT, AP, IB)", routine: "Cumulative spaced review from early in the year; full-length timed practice in the real format; error log sorted by cause", why: "The exam tests retrieval under real conditions. Rehearse those conditions.", source: "Coaching and testing-effect literature" },
];
