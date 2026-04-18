import type { Metadata } from "next";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import { PullQuote } from "@/components/primitives/PullQuote";
import { CredentialChip } from "@/components/primitives/CredentialChip";

export const metadata: Metadata = {
  title: "About",
  description:
    "Twenty years of teaching and school leadership across three continents. Why AI. Why now. What Niall Highland believes about teachers.",
};

/**
 * About page (seed \u00a74.7). Essay-format bio, six sections, [VOICE-REVIEW]
 * structure preserved verbatim. Niall rewrites in first person before launch.
 */

const SECTIONS = [
  {
    eyebrow: "The classroom years",
    body:
      "I started teaching science in England in the early 2000s. Grades 6 through 10, the years where students either fall in love with how the world works or decide it\u2019s not for them. That\u2019s where I learned that the curriculum is never the product. The student\u2019s relationship to inquiry is.",
  },
  {
    eyebrow: "The Manila decade",
    body:
      "Twelve years at the International School Manila changed how I thought about education. Two years in middle school. Ten in high school. Four years leading the science department. In that time I watched education move from worksheet-and-textbook to something much closer to what it should always have been \u2014 students asking real questions, investigating real phenomena, building real explanations.",
  },
  {
    eyebrow: "The leadership move",
    body:
      "In 2025 I moved into school leadership as Associate Principal at the International School of Krakow. The reason was simple: the decisions that shape what happens in classrooms are made two levels above the classroom. If I wanted to change how AI was being handled by international schools, I needed to be in the room where those decisions were being made.",
  },
  {
    eyebrow: "Why AI, why now",
    body:
      "I started speaking about AI in education in 2023, when most international schools were still deciding whether to allow it. The premise of those talks was unchanged then, and is unchanged now: the question is not permission. The question is fluency. AI is already in your students\u2019 homework. It is in your colleagues\u2019 planning. The only variable is whether your teachers are confident enough to teach with it, or anxious enough to pretend it isn\u2019t there.",
  },
  {
    eyebrow: "What I believe about teachers",
    body:
      "I have not met an educator who wasn\u2019t capable of learning this. I have met many who had been told, directly or implicitly, that they weren\u2019t. The work I do now is about removing that false frame and replacing it with something more useful: a teacher who has used AI for twenty hours is not the same teacher they were before. They are faster, more differentiated, more ambitious, and more curious. That teacher is who I\u2019m trying to grow, at scale.",
  },
];

export default function AboutPage() {
  return (
    <>
      <EditorialSection
        container="wide"
        padding="spacious"
        eyebrow="About Niall Highland"
        className="pt-[var(--space-32)]"
      >
        <h1 className="max-w-[20ch] font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
          On teaching, leadership, and the job{" "}
          <span className="text-[color:var(--accent)]">
            we&rsquo;re actually doing now.
          </span>
        </h1>
      </EditorialSection>

      <EditorialSection container="reading" padding="default">
        <div className="flex flex-col gap-[var(--space-16)]">
          {SECTIONS.map((s, i) => (
            <section key={s.eyebrow} className="flex flex-col gap-[var(--space-4)]">
              <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                {String(i + 1).padStart(2, "0")} &mdash; {s.eyebrow}
              </p>
              <p className="text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text)]">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection container="reading" padding="default">
        <PullQuote source="Brand voice">
          A teacher who has used AI for twenty hours is not the same teacher
          they were before.
        </PullQuote>
      </EditorialSection>

      <EditorialSection
        container="reading"
        padding="spacious"
        eyebrow="Credentials, briefly"
      >
        <p className="text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          M.Ed. from the University of New Hampshire. IB-certified Biology
          teacher. Certificate in International School Leadership from the
          Principals Training Center. Twenty years in four countries. Three
          years speaking publicly on AI in education. A consulting practice
          that started with one school asking for help and now supports
          schools across Europe and Asia.
        </p>
        <ul className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
          <li>
            <CredentialChip tone="accent">M.Ed. UNH</CredentialChip>
          </li>
          <li>
            <CredentialChip>IB-certified Biology</CredentialChip>
          </li>
          <li>
            <CredentialChip>Principals Training Center</CredentialChip>
          </li>
          <li>
            <CredentialChip tone="muted">20 years &middot; 4 countries</CredentialChip>
          </li>
        </ul>
      </EditorialSection>
    </>
  );
}
