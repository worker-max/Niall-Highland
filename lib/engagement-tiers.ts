/**
 * Engagement tier content (seed \u00a71.3 / \u00a74.5). Source of truth shared
 * by the home Engage section, the /engage page, and the /engage/[tier]
 * detail pages. Copy is [VOICE-REVIEW] \u2014 Niall rewrites before launch.
 *
 * Pricing: seed recommends starting-from ranges over "contact for pricing".
 * Pending Niall's commercial sign-off, current values use the neutral
 * "Discussed per engagement" phrase. Update these strings (not the component)
 * once he confirms public ranges.
 */

export interface EngagementTier {
  id: "partnership" | "sprint" | "keynote";
  tier: string;
  title: string;
  duration: string;
  shortDescription: string;
  longDescription: string;
  includes: ReadonlyArray<string>;
  outcomes: ReadonlyArray<string>;
  idealFor: string;
  pricing: string;
}

export const ENGAGEMENT_TIERS: ReadonlyArray<EngagementTier> = [
  {
    id: "partnership",
    tier: "Tier 01 \u00b7 Anchor",
    title: "School-wide transformation partnerships",
    duration: "6\u201318 months",
    shortDescription:
      "Strategy, professional development, curriculum audit, leadership coaching, parent engagement \u2014 one integrated program, one point of accountability.",
    longDescription:
      "A full school moves from cautious policy to confident practice. We build a shared AI literacy across faculty, audit curriculum division-by-division, coach leadership through the decisions that matter, and shape how parents understand what their children are learning to do alongside AI. By the end, teachers at your school are not asking whether to use AI. They are comparing notes on how.",
    includes: [
      "Whole-faculty AI literacy program (quarterly cohorts)",
      "Division-by-division curriculum audit with written redesigns",
      "AI-integrity assessment framework and policy draft",
      "Leadership coaching for principals and deputy heads",
      "Parent engagement arc: town halls, written materials, FAQ",
      "Department-head playbooks for ongoing internal PD",
    ],
    outcomes: [
      "Measurable increase in teacher AI confidence across all divisions",
      "Written AI policy that parents, students, and inspectors can read",
      "A cohort of in-house AI-fluent teacher leaders",
      "Assessment practices that survive a post-AI inspection",
    ],
    idealFor:
      "K\u201312 international schools that want a coherent, multi-year transformation rather than a one-off consulting engagement.",
    pricing: "Discussed per engagement",
  },
  {
    id: "sprint",
    tier: "Tier 02 \u00b7 Focused",
    title: "Consulting sprints",
    duration: "2\u201312 weeks",
    shortDescription:
      "Focused work for a division, department, or specific problem. Curriculum audits. Policy drafting. Tool evaluation. Teacher coaching cohorts.",
    longDescription:
      "When the whole-school engagement is not yet the right move, a sprint produces one concrete artefact your team can act on when I leave. Typical outputs: a policy your board will approve, a curriculum audit your department heads can implement, a tool-evaluation matrix with real recommendations, or a coaching cohort that finishes with twenty teachers meaningfully more fluent.",
    includes: [
      "Scoping call + written engagement plan (week 1)",
      "One named deliverable at the end (policy, audit, framework)",
      "Weekly working sessions with the leadership contact",
      "Optional parallel teacher-coaching cohort",
    ],
    outcomes: [
      "A tangible artefact your team owns and can iterate on",
      "A clear recommendation for the next decision",
      "Faculty members who experienced AI-integrated planning first-hand",
    ],
    idealFor:
      "Divisions or departments that need to move on a specific problem \u2014 a policy, a subject-area audit, a teacher cohort \u2014 without committing to a full partnership yet.",
    pricing: "Discussed per engagement",
  },
  {
    id: "keynote",
    tier: "Tier 03 \u00b7 Single-event",
    title: "Keynotes, workshops, and single-event engagements",
    duration: "Half-day to 2 days",
    shortDescription:
      "Board presentations, staff INSETs, parent evenings, conference keynotes. Move a room from anxiety to agency in ninety minutes.",
    longDescription:
      "A single, high-energy session built around the thesis of this site: teachers are not being replaced by AI; they are being replaced by teachers who use it. Designed to leave the room with specific things to try on Monday, a shared language for what good AI practice looks like, and one fewer fear per participant.",
    includes: [
      "Custom keynote (45\u201390 min) tailored to your audience",
      "Optional hands-on workshop component for faculty",
      "Follow-up materials and reading for participants",
      "Q&A designed for the specific room \u2014 parents, staff, or board",
    ],
    outcomes: [
      "A measurable shift in the room\u2019s default stance toward AI",
      "Concrete next steps attendees commit to before they leave",
      "Shared vocabulary for follow-on internal conversations",
    ],
    idealFor:
      "Conferences (ECIS, NESA, EARCOS, AAIE, CIS), in-school INSET days, board meetings, and parent community events.",
    pricing: "Discussed per engagement",
  },
];

export function getTier(id: string): EngagementTier | undefined {
  return ENGAGEMENT_TIERS.find((t) => t.id === id);
}
