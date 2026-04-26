/**
 * Niall Highland — bio in three lengths. Used across the press kit and
 * surfaced as copy-to-clipboard blocks. Niall replaces these once he
 * supplies his preferred phrasing; the structure stays.
 */

export interface BioVariant {
  id: "short" | "medium" | "long";
  label: string;
  wordTarget: number;
  body: string;
}

export const BIOS: ReadonlyArray<BioVariant> = [
  {
    id: "short",
    label: "Short — 50 words",
    wordTarget: 50,
    body:
      "Niall Highland is Associate Principal at the International School of Krakow. For three years he has helped international schools build AI fluency across faculty, curriculum, and leadership — the work that decides which schools age well in the next decade.",
  },
  {
    id: "medium",
    label: "Medium — 150 words",
    wordTarget: 150,
    body:
      "Niall Highland is Associate Principal at the International School of Krakow and an AI-in-education consultant working with international schools across Europe and Asia. He spent twelve years at the International School Manila — the last four leading the science department — before moving into school leadership in 2025.\n\nSince 2023 he has built a practice around a single conviction: teachers aren't being replaced by AI; they're being replaced by teachers who use it. The work focuses on faculty fluency, assessment redesign, and the leadership decisions that shape how AI lands in a classroom.\n\nNiall holds an M.Ed. from the University of New Hampshire, the Principals Training Center's Certificate in International School Leadership, and IB certification in Biology. He speaks regularly at ECIS, NESA, AAIE, and other international school conferences.",
  },
  {
    id: "long",
    label: "Long — 400 words",
    wordTarget: 400,
    body:
      "Niall Highland is Associate Principal at the International School of Krakow and runs a consulting practice supporting international schools through AI strategy, faculty fluency programs, and curriculum redesign. His work focuses on the international school sector specifically — IB, American, British, and national curriculum schools whose leadership teams have to make AI decisions before the rest of the system has worked out what those decisions should be.\n\nHe began teaching science in England in the early 2000s, then moved to the International School Manila, where he spent twelve years — two in middle school, ten in high school, and four leading the science department through the implementation of Next Generation Science Standards. He introduced IB Biology SL and HL refinements that measurably improved student engagement and assessment outcomes, and organised the IB Group 4 interdisciplinary project across three successive cohorts.\n\nIn 2025 he moved into school leadership as Associate Principal at the International School of Krakow. The reason was direct: the decisions that shape what happens in classrooms are made two levels above the classroom, and he wanted to be in the room where AI decisions were actually being made.\n\nNiall began speaking publicly on AI in education in 2023, when most international schools were still deciding whether to allow it. His message has been consistent since: the question is not permission, it is fluency. He has presented at ECIS, NESA, AAIE, and similar conferences across Europe and Asia, and his frameworks for AI-inclusive lesson design, assessment-integrity policy, and department-level tool adoption are now being adapted at schools across both continents.\n\nHis consulting practice operates in three modes: school-wide transformation partnerships (six to eighteen months), focused consulting sprints (two to twelve weeks), and single-event keynotes for boards, faculty, parents, and conferences.\n\nNiall holds an M.Ed. in Secondary Education and Teaching from the University of New Hampshire, the Principals Training Center's Certificate in International School Leadership, and IB certification in Biology. He has worked in four countries and speaks at international schools across Europe and Asia.\n\nHe is contactable at hello@niallhighland.com and at niallhighland.com, where his current frameworks, talk archive, and live AI demonstrations are available for school leaders to use directly.",
  },
];
