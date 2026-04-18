import { z } from "zod";

/**
 * P3 Curriculum Audit structured output (seed §5.3). Three classification
 * buckets plus a synthesis paragraph. streamObject will emit partial
 * updates as each bucket fills, so the client can render the three
 * columns progressively.
 */

const outcomeItem = z.object({
  /** The learning outcome as it appeared (or as it was paraphrased from) in the input. */
  outcome: z.string().min(5).max(300),
  /** One-sentence rationale — why this outcome falls in this bucket. */
  rationale: z.string().min(10).max(240),
});

const vulnerableItem = outcomeItem.extend({
  /** Concrete redesign suggestion — what to change in the unit. */
  redesign: z.string().min(10).max(240),
});

const amplifiedItem = outcomeItem.extend({
  /** Concrete amplification opportunity — what becomes reachable. */
  opportunity: z.string().min(10).max(240),
});

export const curriculumAuditSchema = z.object({
  aiProof: z
    .array(outcomeItem)
    .describe(
      "Outcomes requiring human presence, judgment, collaboration, or physical skill. Safe — double down.",
    ),
  aiVulnerable: z
    .array(vulnerableItem)
    .describe(
      "Outcomes a student with AI assistance can short-circuit in ways you haven't accounted for. Need redesign.",
    ),
  aiAmplified: z
    .array(amplifiedItem)
    .describe(
      "Outcomes where deliberate AI use can multiply student achievement beyond the current target.",
    ),
  whatIdDoNext: z
    .string()
    .min(80)
    .max(1400)
    .describe(
      "2–3 most important redesigns, framed as a consultant recommending next steps.",
    ),
});

export type CurriculumAudit = z.infer<typeof curriculumAuditSchema>;
