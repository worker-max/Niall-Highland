import type { Metadata } from "next";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import { EngagementCard } from "@/components/primitives/EngagementCard";
import { ENGAGEMENT_TIERS } from "@/lib/engagement-tiers";
import { tierIcon } from "@/lib/tier-icon";

export const metadata: Metadata = {
  title: "Engage",
  description:
    "Three ways to work with Niall Highland: whole-school partnerships, focused consulting sprints, and single-event keynotes.",
};

export default function EngagePage() {
  return (
    <>
      <EditorialSection
        container="wide"
        padding="spacious"
        eyebrow="Engage"
        className="pt-[var(--space-32)]"
      >
        <h1 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
          Three ways in.{" "}
          <span className="text-[color:var(--accent)]">
            One conviction underneath them.
          </span>
        </h1>
        <p className="mt-[var(--space-8)] max-w-[var(--width-reading)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          Most AI-in-education consulting ends when the deck closes. I&rsquo;d
          rather be measured by what your teachers do six months after I
          leave. The work below is designed for that: each tier produces
          something your school owns and can iterate on, long after my
          engagement ends.
        </p>
      </EditorialSection>

      <EditorialSection container="wide" padding="default">
        <div className="grid gap-[var(--space-6)] lg:grid-cols-3">
          {ENGAGEMENT_TIERS.map((t, i) => (
            <EngagementCard
              key={t.id}
              tier={t.tier}
              title={t.title}
              duration={t.duration}
              description={t.shortDescription}
              includes={t.includes}
              pricing={t.pricing}
              href={`/engage/${t.id}`}
              cta="See engagement detail"
              emphasis={i === 0 ? "anchor" : "standard"}
              icon={tierIcon(t.id)}
            />
          ))}
        </div>
      </EditorialSection>
    </>
  );
}
