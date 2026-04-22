import { z } from "zod";

/**
 * P4 Principal's Inbox scenario shape. Rendered in an email-client style
 * card before the visitor picks a response path.
 */
export const scenarioSchema = z.object({
  from: z
    .string()
    .min(2)
    .max(80)
    .describe("Role of the sender, e.g. 'Year 10 parent', 'Head of Mathematics', 'Board chair'."),
  role: z
    .string()
    .min(2)
    .max(120)
    .describe("One-phrase description of who this person is in the school context."),
  subject: z.string().min(3).max(140),
  body: z
    .string()
    .min(80)
    .max(1200)
    .describe("The actual message. 80–150 words. Specific, textured, emotionally real."),
  tags: z
    .array(z.string().min(1).max(30))
    .max(4)
    .describe("2–4 content tags for the scenario (e.g. 'assessment-integrity', 'parent-communication')."),
});

export type Scenario = z.infer<typeof scenarioSchema>;
