import Link from "next/link";
import { EditorialSection } from "@/components/primitives/EditorialSection";

/**
 * \u00a74.2 \u2014 What Niall does. Three-column explainer positioned between
 * the first demo (thesis-made-visceral) and the track record. Each column
 * is a compressed version of an engagement tier (\u00a71.3 / \u00a74.5); the
 * detailed cards with pricing live in the Engage section.
 */

const TIERS = [
  {
    title: "School-wide partnerships",
    duration: "6\u201318 months",
    body:
      "Engagements that take a school from cautious AI policy to confident AI practice. Strategy, professional development, curriculum audit, leadership coaching, parent engagement \u2014 one integrated program, one point of accountability.",
  },
  {
    title: "Consulting sprints",
    duration: "2\u201312 weeks",
    body:
      "Focused work for a division, department, or specific problem. Curriculum audits. Policy drafting. Tool evaluation. Teacher coaching cohorts. Designed to produce something you can act on when I leave.",
  },
  {
    title: "Keynotes & workshops",
    duration: "single-event",
    body:
      "Board presentations, staff INSETs, parent evenings, conference keynotes. If you need to move a room of people from anxiety to agency in ninety minutes, this is what that looks like.",
  },
];

export function WhatNiallDoes() {
  return (
    <EditorialSection
      id="what-niall-does"
      container="wide"
      padding="spacious"
      eyebrow="What I do"
    >
      <h2 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
        I don&rsquo;t run AI workshops.{" "}
        <span className="text-[color:var(--accent)]">I embed AI fluency.</span>
      </h2>
      <p className="mt-[var(--space-6)] max-w-[var(--width-reading)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
        The difference matters. A workshop ends. Fluency compounds.
      </p>

      <div className="mt-[var(--space-16)] grid gap-[var(--space-8)] md:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.title}
            className="flex flex-col gap-[var(--space-4)] border-l border-[color:var(--border)] pl-[var(--space-6)]"
          >
            <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              {tier.duration}
            </p>
            <h3 className="font-display text-[length:var(--text-h2)] leading-[1.1] tracking-[-0.02em] text-[color:var(--text)]">
              {tier.title}
            </h3>
            <p className="text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
              {tier.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-[var(--space-12)]">
        <Link
          href="/engage"
          className="inline-flex items-center gap-[var(--space-2)] font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)] hover:text-[color:var(--signal)] transition-colors"
        >
          See detailed tiers <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </EditorialSection>
  );
}
