/**
 * Niall's decision framework for AI-related leadership dilemmas (seed
 * Appendix A). Used as system-prompt context for the P4 Principal's
 * Inbox demo and surfaced on Engage/partnership pages as a trust
 * signal.
 *
 * VOICE-REVIEW: Copy is the seed's placeholder structure. Niall to
 * replace with his actual principles before launch. Structure is stable;
 * only the prose needs calibration.
 */

export interface DecisionPrinciple {
  n: number;
  title: string;
  body: string;
}

export const NIALL_DECISION_PRINCIPLES: ReadonlyArray<DecisionPrinciple> = [
  {
    n: 1,
    title: "Name what's actually being asked.",
    body:
      "Is this a policy question, a values question, or a fear question? Most \"AI policy\" disputes are fear questions wearing policy clothes. You can't write your way out of a fear with a rule.",
  },
  {
    n: 2,
    title: "Centre the learning, not the tool.",
    body:
      "The question is never \"should we allow this AI tool?\" The question is \"what does this change about what we're asking students to demonstrate?\" Start there every time.",
  },
  {
    n: 3,
    title: "Build before you rule.",
    body:
      "Policies written before teachers have used AI produce brittle rules. Policies written after six months of faculty fluency produce durable practice. Give the practice time to show you what the policy should say.",
  },
  {
    n: 4,
    title: "Make the teacher the hero, not the gatekeeper.",
    body:
      "Any AI policy that positions teachers as enforcers will fail. Any policy that positions them as fluent practitioners will succeed. If your policy needs teachers to police, your policy is wrong.",
  },
  {
    n: 5,
    title: "Be transparent with parents, specific with students.",
    body:
      "Vague reassurance breeds more suspicion than honest complexity. Tell parents exactly what their children are being asked to do with AI and without it. Tell students exactly what counts as their own work.",
  },
];

/** Compact inline form used when injecting into an AI prompt context. */
export function frameworkAsPromptContext(): string {
  return NIALL_DECISION_PRINCIPLES.map(
    (p) => `${p.n}. ${p.title}\n   ${p.body}`,
  ).join("\n\n");
}
