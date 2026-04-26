import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusinessCard } from "@/components/primitives/BusinessCard";
import {
  GapIcon,
  FluencyIcon,
  AnchorTierIcon,
  KeynoteTierIcon,
  AIAmplifiedIcon,
  OtherTeacherIcon,
} from "@/components/icons";
import { getCard, type CardVariant } from "@/lib/press-kit/cards";
import type { ReactElement } from "react";

export const metadata: Metadata = {
  title: "Print preview · Press kit",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

function iconFor(key: CardVariant["icon"]): ReactElement {
  switch (key) {
    case "gap":           return <GapIcon size={160} />;
    case "fluency":       return <FluencyIcon size={160} />;
    case "anchor":        return <AnchorTierIcon size={160} />;
    case "keynote":       return <KeynoteTierIcon size={160} />;
    case "amplified":     return <AIAmplifiedIcon size={160} />;
    case "other-teacher": return <OtherTeacherIcon size={160} />;
  }
}

/**
 * Print-optimised card page. Two states:
 *  - On-screen: shows the card centered with print instructions and trim
 *    marks so Niall can preview before sending to a print shop.
 *  - On print: drops everything except the card itself, sized to 88×55mm
 *    trim with 3mm bleed (94×61mm total). Crop marks render at corners.
 */
export default async function PrintCardPage({ params }: PageProps) {
  const { id } = await params;
  const card = getCard(id);
  if (!card) notFound();

  return (
    <>
      <style>{`
        @page { size: 94mm 61mm; margin: 0; }
        @media print {
          html, body { background: white; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-wrap {
            width: 94mm; height: 61mm;
            padding: 0; margin: 0;
            page-break-after: always;
          }
          .card-area {
            width: 88mm; height: 55mm;
            margin: 3mm;
          }
          .crop { display: block; }
        }
        @media screen {
          .crop { display: none; }
        }
      `}</style>

      <div className="no-print mx-auto max-w-[60ch] px-[var(--space-6)] py-[var(--space-12)]">
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Print preview · {card.id}
        </p>
        <h1 className="mt-[var(--space-3)] font-display text-[length:var(--text-h2)] leading-[1.1] tracking-[-0.02em]">
          Save as PDF, then send to your print shop.
        </h1>
        <ul className="mt-[var(--space-6)] flex flex-col gap-[var(--space-2)] text-[length:var(--text-small)] text-[color:var(--text-muted)]">
          <li>1. Open your browser&rsquo;s print dialog (Cmd/Ctrl + P).</li>
          <li>2. Destination: <strong>Save as PDF</strong>.</li>
          <li>3. Paper size: <strong>94 × 61 mm</strong> (custom). If your browser doesn&rsquo;t allow custom sizes, use A4 and your print shop will trim to 88×55 mm.</li>
          <li>4. Margins: <strong>None</strong>. Background graphics: <strong>On</strong>.</li>
          <li>5. Send the PDF to your print shop. Standard order: 250 gsm matte coated, 88×55 mm trim, 3 mm bleed.</li>
        </ul>
      </div>

      <div className="print-wrap mx-auto my-[var(--space-12)] flex items-center justify-center" style={{ width: "94mm", height: "61mm", background: "white", boxShadow: "0 0 0 1px rgba(0,0,0,0.08)" }}>
        <div className="card-area relative" style={{ width: "88mm", height: "55mm" }}>
          {/* Crop marks */}
          <div className="crop" style={{ position: "absolute", top: "-3mm", left: "0", width: "1mm", height: "1.5mm", background: "black" }} />
          <div className="crop" style={{ position: "absolute", top: "-3mm", right: "0", width: "1mm", height: "1.5mm", background: "black" }} />
          <div className="crop" style={{ position: "absolute", bottom: "-3mm", left: "0", width: "1mm", height: "1.5mm", background: "black" }} />
          <div className="crop" style={{ position: "absolute", bottom: "-3mm", right: "0", width: "1mm", height: "1.5mm", background: "black" }} />

          <BusinessCard
            surface={card.surface}
            layout={card.layout}
            icon={iconFor(card.icon)}
            eyebrow={card.eyebrow}
            title={card.title}
            role={card.role}
            contacts={card.contacts}
          />
        </div>
      </div>
    </>
  );
}
