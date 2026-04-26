import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Press kit",
  robots: { index: false, follow: false },
};

const SECTIONS = [
  {
    href: "/press-kit/bio",
    label: "Bio",
    blurb: "Three lengths — 50, 150, 400 words. Click to copy. Use them in event programmes, conference materials, intros.",
  },
  {
    href: "/press-kit/cards",
    label: "Business cards",
    blurb: "Five printable variants for print shops + five digital variants downloadable as PNG. Each variant uses a different mood from the same family.",
  },
  {
    href: "/press-kit/email-signature",
    label: "Email signature",
    blurb: "HTML signature ready to paste into Gmail, Outlook, Apple Mail. Includes the monogram and accent rule.",
  },
  {
    href: "/press-kit/letterhead",
    label: "Letterhead",
    blurb: "Three printable letterhead designs — formal, editorial, conference. Use the browser's print dialog to save as PDF.",
  },
  {
    href: "/press-kit/documents",
    label: "Document templates",
    blurb: "Three Markdown templates pre-loaded with brand voice and structure. Download or paste into ChatGPT/Claude to draft.",
  },
  {
    href: "/press-kit/postcards",
    label: "Postcards",
    blurb: "Three printable postcard designs — single-sided, A6, ready to send to prospective schools or conference organisers.",
  },
  {
    href: "/press-kit/landing-pages",
    label: "Landing pages",
    blurb: "Two campaign landing pages (/lp/leaders, /lp/conferences). Upload an AI-generated background, choose a CTA colour, and the page is live.",
  },
  {
    href: "/press-kit/speaker",
    label: "Speaker pack",
    blurb: "Single-page printable for conference organisers — bio, talk topics, A/V requirements, contact.",
  },
  {
    href: "/press-kit/brand-assets",
    label: "Brand assets",
    blurb: "Downloadable SVGs of the icon family + the NH monogram. Color hex values for designers.",
  },
];

export default function PressKitOverview() {
  return (
    <div className="flex flex-col gap-[var(--space-12)]">
      <header>
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Press kit
        </p>
        <h1 className="mt-[var(--space-3)] font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
          Everything Niall needs to land in someone&rsquo;s inbox or on their stage{" "}
          <span className="text-[color:var(--accent)]">already on-brand.</span>
        </h1>
        <p className="mt-[var(--space-6)] max-w-[var(--width-reading)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          A complete kit of printable cards, downloadable assets, editable
          templates, and customisable landing pages. Designed to outlast
          single events and stay coherent across every surface someone
          encounters Niall on.
        </p>
      </header>

      <ul className="grid gap-[var(--space-4)] md:grid-cols-2">
        {SECTIONS.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="group flex h-full flex-col gap-[var(--space-3)] rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-6)] transition-colors hover:border-[color:var(--accent)]"
            >
              <span className="font-display text-[length:var(--text-h3)] tracking-[-0.01em] text-[color:var(--text)] group-hover:text-[color:var(--accent)]">
                {s.label}
              </span>
              <span className="text-[length:var(--text-small)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
                {s.blurb}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
