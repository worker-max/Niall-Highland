import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDescriptor, getLandingPage, LANDING_PAGE_DESCRIPTORS } from "@/lib/press-kit/landing-pages";
import { getCtaColor } from "@/lib/press-kit/colors";
import { NHMonogram } from "@/components/icons";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const descriptor = getDescriptor(slug);
  const page = await getLandingPage(slug);
  return {
    title: page?.headline ?? descriptor?.label ?? "Niall Highland",
    description: page?.subhead ?? descriptor?.audience ?? undefined,
    robots: { index: false, follow: false },
  };
}

export async function generateStaticParams() {
  return LANDING_PAGE_DESCRIPTORS.map((d) => ({ slug: d.slug }));
}

/**
 * Public landing page. Renders the persisted settings; falls back to
 * descriptor defaults if the row hasn't been saved yet. Uses
 * force-dynamic so edits in the press-kit appear immediately without
 * a redeploy.
 */
export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params;
  const descriptor = getDescriptor(slug);
  if (!descriptor) notFound();

  const page = await getLandingPage(slug);
  const headline = page?.headline ?? descriptor.defaultHeadline;
  const subhead = page?.subhead ?? descriptor.defaultSubhead;
  const ctaText = page?.ctaText ?? descriptor.defaultCtaText;
  const ctaUrl = page?.ctaUrl ?? descriptor.defaultCtaUrl;
  const cta = getCtaColor(page?.ctaColor ?? "accent");
  const imageUrl = page?.imageUrl ?? null;
  const imageAlt = page?.imageAlt ?? "";

  return (
    <section
      className="relative -mt-[var(--space-5)] flex min-h-[calc(100vh-72px)] w-full flex-col"
      style={{
        backgroundColor: "#0B0D0E",
        color: "#F4EFE7",
      }}
    >
      {imageUrl ? (
        <div
          aria-label={imageAlt}
          role="img"
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : null}
      {/* Subtle overlay for legibility on bright images */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0B0D0E]/30 via-transparent to-[#0B0D0E]/40" />

      {/* Top brand bar */}
      <div className="flex items-center justify-between px-[5%] py-[5%]">
        <a href="/" className="inline-flex items-center gap-[var(--space-3)] text-[color:var(--paper-50)] hover:text-[color:var(--paper-200)]">
          <NHMonogram size={28} className="text-[color:var(--paper-50)]" />
          <span className="font-display text-[1.125rem] tracking-[-0.02em]">Niall Highland</span>
        </a>
      </div>

      {/* Centered headline area, biased away from the CTA corner. */}
      <div className="flex flex-1 items-center px-[5%]">
        <div className="max-w-[60%] drop-shadow-[0_2px_32px_rgba(0,0,0,0.55)]">
          <h1 className="font-display text-[clamp(2rem,5.5vw,5rem)] leading-[1.05] tracking-[-0.025em] text-[color:var(--paper-50)] [text-wrap:balance]">
            {headline}
          </h1>
          <p className="mt-[var(--space-6)] max-w-[55ch] text-[clamp(1rem,1.6vw,1.5rem)] leading-[1.4] text-[color:var(--paper-200)]">
            {subhead}
          </p>
        </div>
      </div>

      {/* CTA — pinned to the prompt-protected safe corner. */}
      <div className="flex justify-end px-[5%] pb-[5%]">
        <a
          href={ctaUrl}
          className="inline-flex items-center gap-[var(--space-2)] rounded-full px-[var(--space-6)] py-[var(--space-4)] font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)] transition-opacity hover:opacity-90"
          style={{
            background: cta.bg,
            color: cta.text,
            border: `1px solid ${cta.border}`,
          }}
        >
          {ctaText}
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </section>
  );
}
