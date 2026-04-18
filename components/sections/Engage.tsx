import { EditorialSection } from "@/components/primitives/EditorialSection";
import { EngagementCard } from "@/components/primitives/EngagementCard";
import { ENGAGEMENT_TIERS } from "@/lib/engagement-tiers";

/**
 * \u00a74.5 \u2014 Engage section on the home page. Renders the three tiers
 * from the shared data source, with Tier 1 visually emphasised per \u00a71.3
 * (anchor engagement is the revenue centre and should be most prominent).
 */
export function Engage() {
  return (
    <EditorialSection
      id="engage"
      container="wide"
      padding="spacious"
      eyebrow="Engage"
    >
      <h2 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
        Most AI-in-education consulting ends when the deck closes.{" "}
        <span className="text-[color:var(--accent)]">
          I&rsquo;d rather be measured by what your teachers do six months
          after I leave.
        </span>
      </h2>

      <div className="mt-[var(--space-16)] grid gap-[var(--space-6)] lg:grid-cols-3">
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
          />
        ))}
      </div>
    </EditorialSection>
  );
}
