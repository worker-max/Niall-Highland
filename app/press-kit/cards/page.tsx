import type { Metadata } from "next";
import Link from "next/link";
import { BusinessCard } from "@/components/primitives/BusinessCard";
import {
  GapIcon,
  FluencyIcon,
  AnchorTierIcon,
  KeynoteTierIcon,
  AIAmplifiedIcon,
  OtherTeacherIcon,
} from "@/components/icons";
import { CARDS, type CardVariant } from "@/lib/press-kit/cards";
import type { ReactElement } from "react";

export const metadata: Metadata = {
  title: "Business cards · Press kit",
  robots: { index: false, follow: false },
};

function iconFor(key: CardVariant["icon"]): ReactElement {
  switch (key) {
    case "gap":           return <GapIcon size={160} active />;
    case "fluency":       return <FluencyIcon size={160} active />;
    case "anchor":        return <AnchorTierIcon size={160} />;
    case "keynote":       return <KeynoteTierIcon size={160} />;
    case "amplified":     return <AIAmplifiedIcon size={160} />;
    case "other-teacher": return <OtherTeacherIcon size={160} active />;
  }
}

export default function CardsPage() {
  return (
    <div className="flex flex-col gap-[var(--space-12)]">
      <header>
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Business cards
        </p>
        <h1 className="mt-[var(--space-3)] font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em]">
          Five variants.{" "}
          <span className="text-[color:var(--accent)]">Same family, different moods.</span>
        </h1>
        <p className="mt-[var(--space-4)] max-w-[var(--width-reading)] text-[length:var(--text-body)] text-[color:var(--text-muted)]">
          Each card uses a different surface + icon + layout combination so
          Niall can pick the version that matches the audience. <strong>Print</strong> opens
          a print-optimised page sized for standard 88×55 mm cards (UK / EU)
          with bleed marks &mdash; use your browser&rsquo;s &ldquo;Save as PDF&rdquo; and
          send to any print shop. <strong>Digital PNG</strong> downloads a 1500×857 px
          image suitable for LinkedIn DMs, email signatures, virtual cards.
        </p>
      </header>

      <ul className="flex flex-col gap-[var(--space-12)]">
        {CARDS.map((card) => (
          <li key={card.id} className="flex flex-col gap-[var(--space-4)]">
            <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
              <div>
                <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                  {card.mood}
                </p>
                <p className="mt-[var(--space-1)] font-mono text-[var(--text-caption)] text-[color:var(--text-faint)]">
                  surface: {card.surface} · layout: {card.layout} · icon: {card.icon}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-[var(--space-3)]">
                <Link
                  href={`/press-kit/cards/print/${card.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-[var(--space-2)] rounded-full border border-[color:var(--accent)] px-[var(--space-4)] py-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-[color:var(--paper-50)]"
                >
                  Print
                </Link>
                <a
                  href={`/api/press-kit/cards/${card.id}/png`}
                  download
                  className="inline-flex items-center gap-[var(--space-2)] rounded-full border border-[color:var(--signal)] bg-[color:var(--signal)] px-[var(--space-4)] py-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--ink-900)] hover:opacity-90"
                >
                  PNG &darr;
                </a>
              </div>
            </div>
            <BusinessCard
              surface={card.surface}
              layout={card.layout}
              icon={iconFor(card.icon)}
              eyebrow={card.eyebrow}
              title={card.title}
              role={card.role}
              contacts={card.contacts}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
