import type { Scenario } from "@/lib/ai/schemas/principalsInbox";

/**
 * Seed scenarios per seed §5.4. Five canonical AI-policy dilemmas that
 * realistically reach a principal's inbox. Used as the pre-baked options
 * before the visitor taps "Surprise me" for a fresh AI-generated one.
 */

export const SEED_SCENARIOS: ReadonlyArray<Scenario> = [
  {
    from: "Year 10 parent",
    role: "Parent of a Year 10 student",
    subject: "Accusation of AI use on Isla's History essay",
    body:
      "I'm writing because Ms Adebayo has just informed us that Isla's end-of-unit essay on the causes of the First World War was flagged for AI use, and she's being asked to redo the assessment from scratch under supervision. Isla is adamant she wrote every word of it herself. We have her research notes, her draft, and her handwritten outline. What evidence does the school actually have? And what happens if we don't accept the finding? This feels like being found guilty and then asked to prove your innocence.",
    tags: ["assessment-integrity", "parent-communication", "due-process"],
  },
  {
    from: "Head of Mathematics",
    role: "Veteran teacher, 23 years at the school",
    subject: "Re: the assessment review committee proposal",
    body:
      "I've had a look at the proposal to re-examine all summative assessments in light of AI usage. I want to register, formally, that I don't think this is my job. My role is to teach mathematics. The policing of whatever new technology students are using this year is a matter for the discipline office, not the department. I've spent twenty-three years designing assessments that worked and I'm not about to rebuild them because of a tool that may not be here in three years. Please remove me from the committee.",
    tags: ["faculty-pushback", "assessment-redesign"],
  },
  {
    from: "Board chair",
    role: "Board chair, former head of school",
    subject: "AI position statement — ahead of the admissions cycle",
    body:
      "Three of our admissions tours last week asked pointed questions about our AI policy. One family told us directly that the school they're comparing us to (I won't name it) has a written AI position they've published on their admissions page. I don't need us to publish ours tomorrow, but I do need to know: do we have one? If not, when will we? And if we do, is it something we can walk a prospective parent through in under two minutes?",
    tags: ["board", "positioning", "admissions"],
  },
  {
    from: "Grade 12 student council",
    role: "Student representatives",
    subject: "Proposal: officially endorse AI for homework assistance",
    body:
      "On behalf of the Grade 12 council, we'd like to propose that the school formally endorse ChatGPT (and equivalent tools) for homework assistance, with clear guidelines on what counts as acceptable use. Right now, every teacher has their own unwritten rules, and students are getting penalised for things one teacher allows and another doesn't. We think an explicit policy — \"use it like this, don't use it like that\" — would be better for everyone. We'd like the chance to co-draft this with leadership.",
    tags: ["student-voice", "policy-drafting"],
  },
  {
    from: "IB internal assessment coordinator",
    role: "External assessment liaison",
    subject: "How is the school adapting IAs for AI?",
    body:
      "Ahead of next month's moderation cycle, the IB is asking all schools a set of standard questions about AI and internal assessment. The specific one I need your input on is: \"What concrete steps has the school taken to adapt the design of internal assessments in response to generative AI, and how are you evidencing integrity of student work at submission?\" I have a response to draft by Friday. Can you give me 200 words I can build on, or point me to the policy document if one exists?",
    tags: ["IB", "assessment-integrity", "moderation"],
  },
];
