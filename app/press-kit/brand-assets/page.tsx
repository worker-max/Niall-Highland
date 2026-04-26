import type { Metadata } from "next";
import {
  GapIcon,
  FluencyIcon,
  TimelineIcon,
  EngageSplitIcon,
  ContactIcon,
  WritingIcon,
  OtherTeacherIcon,
  LessonPlanIcon,
  CurriculumAuditIcon,
  PrincipalsInboxIcon,
  TalkExplorerIcon,
  AnchorTierIcon,
  SprintTierIcon,
  KeynoteTierIcon,
  AIProofIcon,
  AIVulnerableIcon,
  AIAmplifiedIcon,
  FluencyGapIcon,
  NHMonogram,
  DeskIcon,
} from "@/components/icons";
import type { ReactElement } from "react";
import { CopyButton } from "@/components/press-kit/CopyButton";

export const metadata: Metadata = {
  title: "Brand assets · Press kit",
  robots: { index: false, follow: false },
};

interface AssetEntry {
  name: string;
  preview: ReactElement;
}

const ASSETS: ReadonlyArray<AssetEntry> = [
  { name: "NH-Monogram", preview: <NHMonogram size={56} /> },
  { name: "GapIcon", preview: <GapIcon size={56} /> },
  { name: "FluencyIcon", preview: <FluencyIcon size={56} /> },
  { name: "TimelineIcon", preview: <TimelineIcon size={56} /> },
  { name: "EngageSplitIcon", preview: <EngageSplitIcon size={56} /> },
  { name: "ContactIcon", preview: <ContactIcon size={56} /> },
  { name: "WritingIcon", preview: <WritingIcon size={56} /> },
  { name: "OtherTeacherIcon", preview: <OtherTeacherIcon size={56} /> },
  { name: "LessonPlanIcon", preview: <LessonPlanIcon size={56} /> },
  { name: "CurriculumAuditIcon", preview: <CurriculumAuditIcon size={56} /> },
  { name: "PrincipalsInboxIcon", preview: <PrincipalsInboxIcon size={56} /> },
  { name: "TalkExplorerIcon", preview: <TalkExplorerIcon size={56} /> },
  { name: "AnchorTierIcon", preview: <AnchorTierIcon size={56} /> },
  { name: "SprintTierIcon", preview: <SprintTierIcon size={56} /> },
  { name: "KeynoteTierIcon", preview: <KeynoteTierIcon size={56} /> },
  { name: "AIProofIcon", preview: <AIProofIcon size={56} /> },
  { name: "AIVulnerableIcon", preview: <AIVulnerableIcon size={56} /> },
  { name: "AIAmplifiedIcon", preview: <AIAmplifiedIcon size={56} /> },
  { name: "FluencyGapIcon", preview: <FluencyGapIcon size={56} /> },
  { name: "DeskIcon", preview: <DeskIcon size={56} /> },
];

const COLORS: ReadonlyArray<{ token: string; hex: string; usage: string }> = [
  { token: "Ink 900",      hex: "#0B0D0E", usage: "Primary surface (dark mode), all-dark contexts" },
  { token: "Ink 800",      hex: "#131619", usage: "Secondary dark surface, demo body" },
  { token: "Ink 700",      hex: "#1C2024", usage: "Elevated dark surface" },
  { token: "Ink 600",      hex: "#2A2F35", usage: "Borders / dividers (dark)" },
  { token: "Paper 50",     hex: "#F4EFE7", usage: "Primary surface (light mode), warm off-white" },
  { token: "Paper 200",    hex: "#D9D2C5", usage: "Secondary text on dark, body text on light raised" },
  { token: "Paper 400",    hex: "#8F887C", usage: "Tertiary text, captions" },
  { token: "Accent 500",   hex: "#3E8B87", usage: "Primary accent — considered teal (works on both modes)" },
  { token: "Accent 400",   hex: "#5BA8A4", usage: "Hover state of accent" },
  { token: "Accent 900",   hex: "#0F2322", usage: "Dark accent surfaces (anchor card, reveal panels)" },
  { token: "Signal 400",   hex: "#7FE3C7", usage: "AI-native signal — used inside demo shells" },
];

export default function BrandAssetsPage() {
  return (
    <div className="flex flex-col gap-[var(--space-16)]">
      <header>
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Brand assets
        </p>
        <h1 className="mt-[var(--space-3)] font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em]">
          The ingredients.{" "}
          <span className="text-[color:var(--accent)]">Use them honestly.</span>
        </h1>
        <p className="mt-[var(--space-4)] max-w-[var(--width-reading)] text-[length:var(--text-body)] text-[color:var(--text-muted)]">
          Twenty SVG marks plus the NH monogram. Hex values for the
          editorial palette. Each asset downloadable as a single SVG file
          for designers, slides, or print.
        </p>
      </header>

      <section>
        <h2 className="mb-[var(--space-6)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
          Icon family
        </h2>
        <ul className="grid gap-[var(--space-4)] sm:grid-cols-2 md:grid-cols-3">
          {ASSETS.map((a) => (
            <li
              key={a.name}
              className="flex items-center justify-between rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-4)]"
            >
              <div className="flex items-center gap-[var(--space-4)]">
                <div className="text-[color:var(--accent)]">{a.preview}</div>
                <span className="font-mono text-[var(--text-caption)] text-[color:var(--text-muted)]">
                  {a.name}
                </span>
              </div>
              <a
                href={`/api/press-kit/asset/${a.name}.svg`}
                download={`${a.name}.svg`}
                className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)] hover:text-[color:var(--signal)]"
              >
                SVG &darr;
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-[var(--space-6)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
          Color palette
        </h2>
        <ul className="grid gap-[var(--space-3)] md:grid-cols-2">
          {COLORS.map((c) => (
            <li
              key={c.token}
              className="flex items-center gap-[var(--space-4)] rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-4)]"
            >
              <span
                aria-hidden="true"
                className="size-12 shrink-0 rounded-[2px] border border-[color:var(--border)]"
                style={{ background: c.hex }}
              />
              <div className="flex-1">
                <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                  {c.token}
                </p>
                <p className="font-mono text-[var(--text-small)] text-[color:var(--text)]">
                  {c.hex}
                </p>
                <p className="mt-[var(--space-1)] text-[length:var(--text-caption)] text-[color:var(--text-muted)]">
                  {c.usage}
                </p>
              </div>
              <CopyButton text={c.hex} label="Hex" />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-[var(--space-6)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
          Typography
        </h2>
        <ul className="flex flex-col gap-[var(--space-3)]">
          <li className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-5)]">
            <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
              Display — Fraunces
            </p>
            <p className="mt-[var(--space-2)] font-display text-[length:var(--text-h2)]">
              Teachers aren&rsquo;t being replaced by AI.
            </p>
            <p className="mt-[var(--space-1)] text-[length:var(--text-small)] text-[color:var(--text-muted)]">
              Stylistic sets ss01, ss02. Tight tracking for hero (-0.03em).
            </p>
          </li>
          <li className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-5)]">
            <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
              Body — Inter
            </p>
            <p className="mt-[var(--space-2)] text-[length:var(--text-body)] leading-[var(--leading-body)]">
              Editorial body copy at 1.0625rem with 1.65 line-height. Slightly larger than default for reading comfort.
            </p>
          </li>
          <li className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-5)]">
            <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
              Mono — JetBrains Mono
            </p>
            <p className="mt-[var(--space-2)] font-mono text-[length:var(--text-small)]">
              All-caps labels, demo output, code. Tracking +0.1em on uppercase labels.
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}
