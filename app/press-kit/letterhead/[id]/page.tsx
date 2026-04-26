import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LETTERHEADS } from "@/lib/press-kit/templates";

export const metadata: Metadata = {
  title: "Letterhead · Print",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LetterheadPrint({ params }: PageProps) {
  const { id } = await params;
  const variant = LETTERHEADS.find((l) => l.id === id);
  if (!variant) notFound();

  const editorial = variant.style === "editorial";
  const formal = variant.style === "formal";
  const conference = variant.style === "conference";

  return (
    <>
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { background: white; margin: 0; padding: 0; color: #0B0D0E; font-family: Georgia, serif; }
          .no-print { display: none !important; }
          .a4 { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>

      <div className="no-print mx-auto max-w-[60ch] px-[var(--space-6)] py-[var(--space-8)]">
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Letterhead · {variant.label}
        </p>
        <p className="mt-[var(--space-3)] text-[length:var(--text-small)] text-[color:var(--text-muted)]">
          Edit the placeholder body below in your browser&rsquo;s reader view if needed,
          then File &rarr; Print &rarr; Save as PDF (A4, no margins).
        </p>
      </div>

      <div
        className="a4 mx-auto bg-white text-[#0B0D0E]"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: editorial ? "28mm 24mm" : formal ? "32mm 28mm" : "24mm 22mm",
          fontFamily: "Georgia, 'Times New Roman', serif",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
          margin: "24px auto",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: formal ? "center" : "space-between",
            paddingBottom: "8mm",
            borderBottom: editorial ? "1px solid #C9C1B0" : conference ? "2px solid #3E8B87" : "none",
            textAlign: formal ? "center" : "left",
            flexDirection: formal ? "column" : "row",
            gap: formal ? "4mm" : 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10mm" }}>
            <svg width="76" height="38" viewBox="0 0 48 24" fill="none" stroke="#3E8B87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="4" x2="3" y2="20" />
              <line x1="3" y1="4" x2="15" y2="20" />
              <line x1="15" y1="4" x2="15" y2="20" />
              <line x1="24" y1="4" x2="24" y2="20" />
              <line x1="36" y1="4" x2="36" y2="20" />
              <line x1="24" y1="12" x2="40" y2="12" />
              <path d="M40 12 L43 10 L43 14 Z" fill="#3E8B87" />
              <circle cx="19.5" cy="12" r="1.5" fill="#3E8B87" />
            </svg>
            <div>
              <div style={{ fontSize: "20pt", letterSpacing: "-0.02em" }}>Niall Highland</div>
              <div style={{ fontSize: "9pt", color: "#5C5A52", marginTop: "1mm" }}>
                {conference ? "Keynote speaker · AI in international schools" : "Associate Principal · International School of Krakow"}
              </div>
            </div>
          </div>
          {!formal ? (
            <div style={{ textAlign: "right", fontSize: "9pt", color: "#5C5A52", lineHeight: 1.5 }}>
              niallhighland.com<br />
              hello@niallhighland.com
            </div>
          ) : null}
        </header>

        {/* Body */}
        <main style={{ paddingTop: "12mm", fontSize: "11pt", lineHeight: 1.6 }}>
          <p style={{ marginBottom: "6mm", color: "#5C5A52" }}>[Date]</p>
          <p style={{ marginBottom: "6mm" }}>[Recipient name]<br />[Recipient title]<br />[Recipient organisation]</p>

          <p style={{ marginBottom: "6mm" }}>Dear [first name],</p>

          <p style={{ marginBottom: "5mm" }}>
            [Replace this paragraph with your message. Brief, declarative,
            specific. The body of a letter that respects the reader&rsquo;s time.]
          </p>
          <p style={{ marginBottom: "5mm" }}>
            [Optional second paragraph. The case for the next step.]
          </p>
          <p style={{ marginBottom: "5mm" }}>
            [Optional close. One sentence is usually enough.]
          </p>

          <p style={{ marginTop: "10mm" }}>Yours,</p>
          <p style={{ marginTop: "6mm", fontSize: "13pt", letterSpacing: "-0.01em" }}>Niall Highland</p>
        </main>

        {/* Footer */}
        {formal ? (
          <footer
            style={{
              position: "absolute",
              bottom: "20mm",
              left: "28mm",
              right: "28mm",
              fontSize: "8pt",
              color: "#5C5A52",
              textAlign: "center",
              borderTop: "1px solid #C9C1B0",
              paddingTop: "4mm",
            }}
          >
            niallhighland.com · hello@niallhighland.com
          </footer>
        ) : null}
      </div>
    </>
  );
}
