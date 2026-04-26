/**
 * Letterhead, document, and postcard template definitions. Drives both
 * preview rendering and downloadable .md / printable HTML emission.
 */

export interface LetterheadVariant {
  id: string;
  label: string;
  mood: string;
  /** Header rendering style. */
  style: "editorial" | "formal" | "conference";
}

export const LETTERHEADS: ReadonlyArray<LetterheadVariant> = [
  { id: "editorial", label: "Editorial", mood: "Day-to-day correspondence — schools, parents, colleagues.", style: "editorial" },
  { id: "formal", label: "Formal", mood: "Boards, inspectorates, regulators. Centered, restrained.", style: "formal" },
  { id: "conference", label: "Conference", mood: "Speaker proposals, conference organisers, festival circuits.", style: "conference" },
];

export interface DocumentTemplate {
  id: string;
  label: string;
  blurb: string;
  /** Plain Markdown payload, including AI-friendly frontmatter and prompts. */
  body: string;
}

const VOICE_NOTE = `<!--
  Voice notes for the model rewriting this template:
  - Direct, declarative. Allergic to "leverage", "synergy", "journey", "unlock".
  - Short sentence. Then a longer one. Then short again.
  - Warm on people, cold on bad ideas.
  - Never apologise for AI; name what it changes about the work.
-->`;

export const DOCUMENT_TEMPLATES: ReadonlyArray<DocumentTemplate> = [
  {
    id: "engagement-proposal",
    label: "Engagement proposal",
    blurb: "Cover proposal for school-wide partnership or sprint engagement. Drop into Claude/ChatGPT, fill the bracketed sections.",
    body: `# Engagement proposal

**Prepared for:** [School name and primary contact]
**Prepared by:** Niall Highland
**Date:** [Today]
**Engagement type:** [School-wide partnership / Consulting sprint / Single event]

${VOICE_NOTE}

---

## What you asked for

[One paragraph: the question this school brought to the engagement, in their own framing.]

## What I'm proposing

[One paragraph: the engagement shape — duration, scope, named deliverable. Match the seed §1.3 tier descriptions.]

## What you'll have when this is over

- [Concrete artefact 1 — a policy document, a fluency cohort, an audit, etc.]
- [Concrete artefact 2]
- [Concrete artefact 3]

## How we'll work

| Phase | Duration | What happens |
|-------|----------|--------------|
| Scoping | Week 1 | Stakeholder interviews, written engagement plan signed off. |
| Practice | Weeks 2–N | [Cohort cadence, on-site days, departmental work.] |
| Synthesis | Final two weeks | Written deliverables, leadership debrief, handover. |

## Investment

[Pricing — fixed-fee or daily rate, expenses, payment schedule.]

## Why now

[One paragraph: the specific cost of waiting another quarter, in this school's terms.]

---

Niall Highland · niallhighland.com · hello@niallhighland.com
`,
  },
  {
    id: "talk-confirmation",
    label: "Talk confirmation",
    blurb: "Reply to a confirmed conference invitation. Sets expectations on tech, A/V, abstract, and bio supply.",
    body: `# Talk confirmation

**To:** [Conference organiser]
**Re:** [Conference name] — confirming session

${VOICE_NOTE}

Dear [name],

Thank you for the invitation. I'm in.

Below is everything you should need from me up front. I'll send revised abstract and bio in your preferred format once you confirm the slot length.

## Session details (mine to confirm)

- **Working title:** [Working title]
- **Length needed:** [45 / 60 / 90 minutes — keynote vs workshop]
- **Audience:** [primary audience, level]
- **One-line abstract:** [single sentence the programme can use]
- **Two-paragraph abstract:** [provided in the bio attachment]

## A/V requirements

- Lavalier microphone, single screen, HDMI input.
- I bring my own clicker. I run from a 2024 MacBook Pro on macOS.
- Stage lighting low enough to see the audience from the lectern.
- Live demo requires reliable Wi-Fi (one device, ~10 Mbit). I will run a recorded fallback if Wi-Fi is uncertain.

## Headshot, bio, and other assets

- High-res headshot: attached / linked at niallhighland.com/press-kit
- 50-word bio: attached
- 150-word bio: attached
- Logo / monogram for programme: niallhighland.com/press-kit/brand-assets

## What I'd like from you

- Confirm slot date and time (and time zone).
- Confirm slot length and format (keynote / workshop / panel).
- Provide AV contact for a 10-minute soundcheck the day prior.
- Send the previous year's audience demographics if you have them — helps me calibrate.

I'll be in touch.

Niall
`,
  },
  {
    id: "policy-draft",
    label: "AI policy draft (school-facing)",
    blurb: "Skeleton AI policy a school's leadership team can fill in collaboratively. Reflects the framework principles.",
    body: `# AI in [School name] — Position and Practice

**Status:** Draft for faculty and board review
**Owner:** [Head of School]
**Last updated:** [Date]

${VOICE_NOTE}

## What we believe

Our position is simple. AI is not coming to our school. It is already here — in our students' homework, in our colleagues' planning, in the writing on this page. Our job is not to police it. Our job is to make sure our teachers can teach with it confidently and our students can learn with it honestly.

## What this means in practice

### For students
- [What students may use AI for, in plain language.]
- [What students may not pass off as their own work.]
- [How assessment will demonstrate genuine understanding.]

### For teachers
- [Expectations for fluency, with the school's commitment to training.]
- [How teachers should design assessments going forward.]
- [How the school supports — not polices — their use of AI.]

### For parents
- [What you will see different about your child's homework.]
- [How to talk to your child about AI without making it adversarial.]
- [How to reach us with questions.]

## Decision framework

When facing a specific AI-related decision, this leadership team asks:
1. Is this a policy question, a values question, or a fear question?
2. Does this centre the learning, or the tool?
3. Has the practice this rule describes actually happened yet?
4. Does this position the teacher as the hero, or the gatekeeper?
5. Are we being transparent with parents and specific with students?

## What this policy is not

- It is not a permanent answer. We expect to revise it within twelve months.
- It is not a list of approved tools. Tools change quarterly. Practices change less.
- It is not about catching cheating. It is about teaching well.

---

For questions, contact [Head of School] or refer to our forthcoming faculty handbook.
`,
  },
];

export interface PostcardVariant {
  id: string;
  label: string;
  mood: string;
  /** Front/A-side hero quote. */
  quote: string;
  /** B-side body. */
  body: string;
  cta: string;
}

export const POSTCARDS: ReadonlyArray<PostcardVariant> = [
  {
    id: "fluency-quote",
    label: "Fluency quote",
    mood: "Provocative · Conference handout",
    quote: "Teachers aren’t being replaced by AI. They’re being replaced by teachers who use it.",
    body: "If your faculty is still in the &lsquo;should we allow it&rsquo; conversation, this is the year that conversation costs you. Niall Highland helps international schools build AI fluency across the whole faculty — six months from cautious policy to confident practice.",
    cta: "niallhighland.com/engage",
  },
  {
    id: "leaders-invite",
    label: "Leadership invite",
    mood: "Direct · Mailer to heads",
    quote: "What if the AI policy you’re writing is the wrong artefact?",
    body: "The schools getting this right are inverting the sequence: practice first, language second, policy last. Twenty minutes on the phone is enough to know whether the framework would help your school. Book a leadership conversation — no pitch, just a clear next step.",
    cta: "niallhighland.com/engage/partnership",
  },
  {
    id: "demo-postcard",
    label: "Live demo postcard",
    mood: "Curious · Direct mail to teachers",
    quote: "Five minutes. One lesson plan. Side by side.",
    body: "On the home page of niallhighland.com, two teachers race the same objective — one by hand, one alongside AI. The difference is exactly the difference your faculty is currently navigating, made visceral. Try it before your next planning afternoon.",
    cta: "niallhighland.com/#demo-the-other-teacher",
  },
];

export function getDocumentTemplate(id: string): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES.find((t) => t.id === id);
}
