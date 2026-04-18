import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import { ENGAGEMENT_TIERS, getTier } from "@/lib/engagement-tiers";

interface PageProps {
  params: Promise<{ tier: string }>;
}

export async function generateStaticParams() {
  return ENGAGEMENT_TIERS.map((t) => ({ tier: t.id }));
}

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const { tier: id } = await params;
  const tier = getTier(id);
  if (!tier) return { title: "Not found" };
  return {
    title: tier.title,
    description: tier.shortDescription,
  };
}

export default async function EngagementTierPage({ params }: PageProps) {
  const { tier: id } = await params;
  const tier = getTier(id);
  if (!tier) notFound();

  return (
    <>
      <EditorialSection
        container="wide"
        padding="spacious"
        eyebrow={tier.tier}
        className="pt-[var(--space-32)]"
      >
        <h1 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
          {tier.title}
        </h1>
        <p className="mt-[var(--space-6)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          {tier.duration}
        </p>
        <p className="mt-[var(--space-8)] max-w-[var(--width-reading)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          {tier.longDescription}
        </p>
      </EditorialSection>

      <EditorialSection container="wide" padding="default">
        <div className="grid gap-[var(--space-16)] lg:grid-cols-2">
          <div>
            <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
              What&rsquo;s included
            </p>
            <ul className="mt-[var(--space-4)] flex flex-col gap-[var(--space-3)]">
              {tier.includes.map((item) => (
                <li
                  key={item}
                  className="flex gap-[var(--space-3)] text-[length:var(--text-body)] text-[color:var(--text)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.55em] size-[6px] shrink-0 rounded-full bg-[color:var(--accent)]"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
              Outcomes
            </p>
            <ul className="mt-[var(--space-4)] flex flex-col gap-[var(--space-3)]">
              {tier.outcomes.map((item) => (
                <li
                  key={item}
                  className="flex gap-[var(--space-3)] text-[length:var(--text-body)] text-[color:var(--text)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.55em] size-[6px] shrink-0 rounded-full bg-[color:var(--signal)]"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </EditorialSection>

      <EditorialSection container="reading" padding="default">
        <div className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-8)]">
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            Ideal for
          </p>
          <p className="mt-[var(--space-3)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
            {tier.idealFor}
          </p>
          <p className="mt-[var(--space-6)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            Pricing
          </p>
          <p className="mt-[var(--space-3)] text-[length:var(--text-body)] text-[color:var(--text)]">
            {tier.pricing}
          </p>
          <Link
            href="/#contact"
            className="mt-[var(--space-8)] inline-flex items-center gap-[var(--space-2)] rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-[var(--space-6)] py-[var(--space-3)] font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)] text-[color:var(--paper-50)] transition-colors hover:bg-[color:var(--accent-hover)] hover:border-[color:var(--accent-hover)]"
          >
            Start a conversation <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </EditorialSection>
    </>
  );
}
