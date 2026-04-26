import type { Metadata } from "next";
import Link from "next/link";
import { LANDING_PAGE_DESCRIPTORS, getLandingPage } from "@/lib/press-kit/landing-pages";
import { getSql } from "@/lib/ai/rag";

export const metadata: Metadata = {
  title: "Landing pages · Press kit",
  robots: { index: false, follow: false },
};

export default async function LandingPagesIndex() {
  const dbReady = !!getSql();
  const pages = dbReady
    ? await Promise.all(
        LANDING_PAGE_DESCRIPTORS.map(async (d) => ({
          d,
          page: await getLandingPage(d.slug),
        })),
      )
    : LANDING_PAGE_DESCRIPTORS.map((d) => ({ d, page: null }));

  return (
    <div className="flex flex-col gap-[var(--space-12)]">
      <header>
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Landing pages
        </p>
        <h1 className="mt-[var(--space-3)] font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em]">
          Two campaign surfaces.{" "}
          <span className="text-[color:var(--accent)]">Niall edits independently.</span>
        </h1>
        <p className="mt-[var(--space-4)] max-w-[var(--width-reading)] text-[length:var(--text-body)] text-[color:var(--text-muted)]">
          Each page lives at <code className="font-mono text-[var(--text-small)]">/lp/&lt;slug&gt;</code> and
          renders an AI-generated background, headline, and a permanently
          positioned CTA in your chosen colour. The CTA never overlaps the
          image because the LLM prompt below the upload tells the image
          generator where to leave canvas empty.
        </p>
      </header>

      {!dbReady ? (
        <div className="rounded-[4px] border border-[color:var(--warning-500)] bg-[color:var(--surface-raised)] p-[var(--space-6)]">
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--warning-500)]">
            Database not configured
          </p>
          <p className="mt-[var(--space-3)] text-[length:var(--text-body)] text-[color:var(--text-muted)]">
            Landing-page editing requires <code className="font-mono">DATABASE_URL</code> (Neon Postgres) and{" "}
            <code className="font-mono">BLOB_READ_WRITE_TOKEN</code> (Vercel Blob). Set both in Vercel and redeploy.
          </p>
        </div>
      ) : null}

      <ul className="grid gap-[var(--space-4)] md:grid-cols-2">
        {pages.map(({ d, page }) => (
          <li key={d.slug}>
            <article className="flex h-full flex-col gap-[var(--space-3)] rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-6)]">
              <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                /lp/{d.slug}
              </p>
              <p className="font-display text-[length:var(--text-h3)] tracking-[-0.01em] text-[color:var(--text)]">
                {d.label}
              </p>
              <p className="text-[length:var(--text-small)] text-[color:var(--text-muted)]">
                {d.audience}
              </p>
              <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
                Status: {page?.imageUrl ? "Published with image" : page ? "Saved (no image yet)" : "Defaults only"}
              </p>
              <div className="mt-auto flex flex-wrap gap-[var(--space-3)]">
                <Link
                  href={`/press-kit/landing-pages/${d.slug}`}
                  className="inline-flex items-center gap-[var(--space-2)] rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-[var(--space-4)] py-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--paper-50)] hover:opacity-90"
                >
                  Edit
                </Link>
                <Link
                  href={`/lp/${d.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-[var(--space-2)] rounded-full border border-[color:var(--border)] px-[var(--space-4)] py-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--text)]"
                >
                  View live
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
