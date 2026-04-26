import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { POSTCARDS } from "@/lib/press-kit/templates";

export const metadata: Metadata = {
  title: "Postcard · Print",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostcardPrint({ params }: PageProps) {
  const { id } = await params;
  const card = POSTCARDS.find((p) => p.id === id);
  if (!card) notFound();

  return (
    <>
      <style>{`
        @page { size: 154mm 111mm; margin: 0; }
        @media print {
          html, body { background: white; margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print mx-auto max-w-[60ch] px-[var(--space-6)] py-[var(--space-8)]">
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Postcard · {card.label}
        </p>
        <p className="mt-[var(--space-3)] text-[length:var(--text-small)] text-[color:var(--text-muted)]">
          A6 (148×105mm) with 3mm bleed = 154×111mm. Print &rarr; Save as
          PDF, send to your print shop or mailing service.
        </p>
      </div>

      <div
        className="mx-auto my-[var(--space-12)] flex items-center justify-center"
        style={{
          width: "154mm",
          height: "111mm",
          background: "#0B0D0E",
          color: "#F4EFE7",
          padding: "12mm",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
          {/* Top: monogram */}
          <div style={{ display: "flex", alignItems: "center", gap: "4mm" }}>
            <svg width="48" height="24" viewBox="0 0 48 24" fill="none" stroke="#7FE3C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="4" x2="3" y2="20" />
              <line x1="3" y1="4" x2="15" y2="20" />
              <line x1="15" y1="4" x2="15" y2="20" />
              <line x1="24" y1="4" x2="24" y2="20" />
              <line x1="36" y1="4" x2="36" y2="20" />
              <line x1="24" y1="12" x2="40" y2="12" />
              <path d="M40 12 L43 10 L43 14 Z" fill="#7FE3C7" />
              <circle cx="19.5" cy="12" r="1.5" fill="#7FE3C7" />
            </svg>
            <span style={{ fontSize: "11pt", letterSpacing: "-0.01em" }}>Niall Highland</span>
          </div>

          {/* Quote */}
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <p style={{ fontSize: "20pt", lineHeight: 1.18, letterSpacing: "-0.02em", color: "#F4EFE7", textWrap: "balance" }}>
              &ldquo;{card.quote}&rdquo;
            </p>
          </div>

          {/* Body + CTA */}
          <div style={{ borderTop: "1px solid #2A2F35", paddingTop: "5mm", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "8mm" }}>
            <p
              style={{ fontSize: "8.5pt", lineHeight: 1.45, color: "#D9D2C5", maxWidth: "80mm" }}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: card.body }}
            />
            <span style={{ fontFamily: "monospace", fontSize: "8pt", letterSpacing: "0.18em", textTransform: "uppercase", color: "#7FE3C7", whiteSpace: "nowrap" }}>
              {card.cta}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
