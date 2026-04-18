export interface OtherTeacherPreset {
  id: string;
  label: string;
  grade: string;
  subject: string;
  objective: string;
}

export const presets: ReadonlyArray<OtherTeacherPreset> = [
  {
    id: "g9-bio-photosynthesis",
    label: "Grade 9 Biology — photosynthesis",
    grade: "Grade 9",
    subject: "Biology",
    objective:
      "Students will explain how light intensity, CO2 concentration, and temperature each affect the rate of photosynthesis, using evidence from a controlled investigation.",
  },
  {
    id: "g10-history-wwi-causes",
    label: "Grade 10 History — causes of WWI",
    grade: "Grade 10",
    subject: "History",
    objective:
      "Students will evaluate the relative importance of long-term vs. short-term causes of the First World War, using at least three pieces of contemporary evidence.",
  },
  {
    id: "ib-dp1-math-quadratics",
    label: "IB DP Year 1 Math — quadratic modelling",
    grade: "IB Diploma Year 1",
    subject: "Mathematics Applications & Interpretation SL",
    objective:
      "Students will model a real-world projectile scenario with a quadratic function and interpret the parameters in context, including domain, range, and vertex.",
  },
  {
    id: "g7-english-persuasive",
    label: "Grade 7 English — persuasive writing",
    grade: "Grade 7",
    subject: "English Language & Literature",
    objective:
      "Students will identify three rhetorical devices in a published op-ed and use two of them in a 150-word persuasive paragraph of their own.",
  },
];
