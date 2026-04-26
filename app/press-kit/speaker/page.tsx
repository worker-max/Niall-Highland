import type { Metadata } from "next";
import { BIOS } from "@/lib/press-kit/bio";
import { listTalks } from "@/lib/content";

export const metadata: Metadata = {
  title: "Speaker pack · Press kit",
  robots: { index: false, follow: false },
};

export default async function SpeakerPackPage() {
  const talks = await listTalks();
  const mediumBio = BIOS.find((b) => b.id === "medium")?.body ?? "";

  return (
    <>
      <style>{`
        @page { size: A4; margin: 18mm; }
        @media print {
          html, body { background: white; color: #0B0D0E; margin: 0; padding: 0; font-family: Georgia, serif; }
          .no-print { display: none !important; }
          a { color: #0B0D0E !important; text-decoration: none !important; }
          .pack { box-shadow: none !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
          .pack section { break-inside: avoid; }
        }
      `}</style>

      <div className="no-print mb-[var(--space-8)]">
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Speaker pack
        </p>
        <h1 className="mt-[var(--space-3)] font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em]">
          One page.{" "}
          <span className="text-[color:var(--accent)]">Everything an organiser needs.</span>
        </h1>
        <p className="mt-[var(--space-4)] max-w-[var(--width-reading)] text-[length:var(--text-body)] text-[color:var(--text-muted)]">
          Print-ready single-page brief: bio, talk topics, AV requirements,
          contact. Print to PDF and email to conference organisers, or send
          the live URL.
        </p>
      </div>

      <article
        className="pack mx-auto bg-white p-[var(--space-12)] text-[#0B0D0E]"
        style={{ maxWidth: "210mm", boxShadow: "0 0 0 1px rgba(0,0,0,0.08)", fontFamily: "Georgia, serif" }}
      >
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid #C9C1B0", paddingBottom: "8mm" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5mm" }}>
            <svg width="60" height="30" viewBox="0 0 48 24" fill="none" stroke="#3E8B87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <p style={{ fontSize: "20pt", letterSpacing: "-0.02em" }}>Niall Highland</p>
              <p style={{ fontSize: "10pt", color: "#5C5A52", marginTop: "1mm" }}>Speaker · AI in international schools</p>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "9pt", color: "#5C5A52", lineHeight: 1.5 }}>
            niallhighland.com<br />
            hello@niallhighland.com
          </div>
        </header>

        <section style={{ marginTop: "8mm" }}>
          <p style={{ fontFamily: "monospace", fontSize: "9pt", letterSpacing: "0.18em", textTransform: "uppercase", color: "#3E8B87" }}>Bio</p>
          <p style={{ marginTop: "2mm", fontSize: "10.5pt", lineHeight: 1.55, whiteSpace: "pre-line" }}>{mediumBio}</p>
        </section>

        <section style={{ marginTop: "8mm" }}>
          <p style={{ fontFamily: "monospace", fontSize: "9pt", letterSpacing: "0.18em", textTransform: "uppercase", color: "#3E8B87" }}>Signature talk topics</p>
          <ul style={{ marginTop: "3mm", paddingLeft: "5mm", fontSize: "10pt", lineHeight: 1.6 }}>
            {talks.length === 0 ? (
              <li>Topics added as the archive grows. Contact for a current list.</li>
            ) : (
              talks.map((t) => (
                <li key={t.frontmatter.slug} style={{ marginBottom: "3mm" }}>
                  <strong>{t.frontmatter.title}</strong>{" "}
                  <span style={{ color: "#5C5A52" }}>— {t.frontmatter.audience}</span>
                  <br />
                  <span style={{ fontSize: "9pt", color: "#5C5A52" }}>{t.frontmatter.abstract}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section style={{ marginTop: "8mm", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8mm" }}>
          <div>
            <p style={{ fontFamily: "monospace", fontSize: "9pt", letterSpacing: "0.18em", textTransform: "uppercase", color: "#3E8B87" }}>Formats</p>
            <ul style={{ marginTop: "3mm", paddingLeft: "5mm", fontSize: "10pt", lineHeight: 1.6 }}>
              <li>Keynote (45–60 min)</li>
              <li>Workshop (90–180 min)</li>
              <li>Board / leadership briefing (30–45 min)</li>
              <li>Parent evening (60–90 min)</li>
            </ul>
          </div>
          <div>
            <p style={{ fontFamily: "monospace", fontSize: "9pt", letterSpacing: "0.18em", textTransform: "uppercase", color: "#3E8B87" }}>AV requirements</p>
            <ul style={{ marginTop: "3mm", paddingLeft: "5mm", fontSize: "10pt", lineHeight: 1.6 }}>
              <li>Lavalier mic, single screen, HDMI in</li>
              <li>Stage Wi-Fi (≥10 Mbit, 1 device) for live demo</li>
              <li>Recorded fallback if Wi-Fi uncertain</li>
              <li>10-min soundcheck the day prior</li>
            </ul>
          </div>
        </section>

        <section style={{ marginTop: "10mm", borderTop: "1px solid #C9C1B0", paddingTop: "5mm" }}>
          <p style={{ fontFamily: "monospace", fontSize: "9pt", letterSpacing: "0.18em", textTransform: "uppercase", color: "#3E8B87" }}>Booking</p>
          <p style={{ marginTop: "2mm", fontSize: "10pt", lineHeight: 1.55 }}>
            Email <strong>hello@niallhighland.com</strong> with audience size, event date, format, and the outcome you want delegates walking away with. Niall replies within two working days.
          </p>
        </section>
      </article>
    </>
  );
}
