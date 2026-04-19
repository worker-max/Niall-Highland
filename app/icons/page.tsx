import type { Metadata } from "next";
import type { ReactElement } from "react";
import { EditorialSection } from "@/components/primitives/EditorialSection";
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
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Icon family",
  description:
    "The complete custom circuit-trace icon family used across the site. Each icon signals its section or concept geometrically.",
  robots: { index: false, follow: false },
};

interface IconEntry {
  name: string;
  group: "Structural" | "Demos" | "Tiers" | "Concepts" | "Logomark";
  signals: string;
  node: ReactElement;
}

const ICONS: ReadonlyArray<IconEntry> = [
  { name: "NHMonogram", group: "Logomark", signals: "Wordmark \u2014 N and H with crossbar continuing into a forward pin.", node: <NHMonogram size={64} /> },

  { name: "GapIcon", group: "Structural", signals: "The fluency gap. Hand-drawn bottom track converges with a clean circuit on the right.", node: <GapIcon size={96} active /> },
  { name: "FluencyIcon", group: "Structural", signals: "Recursion \u2014 output loops back as input. Fluency compounding.", node: <FluencyIcon size={96} active /> },
  { name: "TimelineIcon", group: "Structural", signals: "Career trace. Top node hollow + pulsing = current role.", node: <TimelineIcon size={96} active /> },
  { name: "EngageSplitIcon", group: "Structural", signals: "One input, three tiers, three distinct terminals (ring / pin / wave).", node: <EngageSplitIcon size={96} active /> },
  { name: "ContactIcon", group: "Structural", signals: "Envelope built from traces. Send pulse escapes upper-right.", node: <ContactIcon size={96} active /> },
  { name: "WritingIcon", group: "Structural", signals: "Pen nib + dashed ink trails rendered as signal paths.", node: <WritingIcon size={96} active /> },

  { name: "OtherTeacherIcon", group: "Demos", signals: "P1 \u2014 two race lanes sharing a finish flag. Top lane near the line.", node: <OtherTeacherIcon size={96} active /> },
  { name: "LessonPlanIcon", group: "Demos", signals: "P2 \u2014 objective branches into 9 structured outcomes.", node: <LessonPlanIcon size={96} active /> },
  { name: "CurriculumAuditIcon", group: "Demos", signals: "P3 \u2014 three buckets with distinct marker languages.", node: <CurriculumAuditIcon size={96} active /> },
  { name: "PrincipalsInboxIcon", group: "Demos", signals: "P4 \u2014 card stack with haloed middle option (Niall\u2019s response).", node: <PrincipalsInboxIcon size={96} active /> },
  { name: "TalkExplorerIcon", group: "Demos", signals: "P5 \u2014 constellation with threaded query path and dashed alternates.", node: <TalkExplorerIcon size={96} active /> },

  { name: "AnchorTierIcon", group: "Tiers", signals: "Tier 1 \u2014 anchor from circuit traces; organic flukes.", node: <AnchorTierIcon size={96} active /> },
  { name: "SprintTierIcon", group: "Tiers", signals: "Tier 2 \u2014 lightning bolt with dashed afterglow.", node: <SprintTierIcon size={96} active /> },
  { name: "KeynoteTierIcon", group: "Tiers", signals: "Tier 3 \u2014 podium with concentric soundwave arcs.", node: <KeynoteTierIcon size={96} active /> },

  { name: "AIProofIcon", group: "Concepts", signals: "Shield + internal serif H \u2014 human irreducibility.", node: <AIProofIcon size={96} active /> },
  { name: "AIVulnerableIcon", group: "Concepts", signals: "Broken circuit with gap + warning pins.", node: <AIVulnerableIcon size={96} active /> },
  { name: "AIAmplifiedIcon", group: "Concepts", signals: "Three concentric rings, SDR-style amplification.", node: <AIAmplifiedIcon size={96} active /> },
  { name: "FluencyGapIcon", group: "Concepts", signals: "Sparse vs dense circuits, diagonal score between.", node: <FluencyGapIcon size={96} active /> },
];

const GROUPS: ReadonlyArray<IconEntry["group"]> = [
  "Logomark",
  "Structural",
  "Demos",
  "Tiers",
  "Concepts",
];

export default function IconsShowcasePage() {
  return (
    <>
      <EditorialSection
        container="wide"
        padding="spacious"
        eyebrow="Design system \u00b7 Icons"
        className="pt-[var(--space-32)]"
      >
        <h1 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
          The icon family.{" "}
          <span className="text-[color:var(--accent)]">
            Eighteen circuits and one wordmark.
          </span>
        </h1>
        <p className="mt-[var(--space-6)] max-w-[var(--width-reading)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          Each icon encodes its section or concept geometrically, not
          literally. Shared language: orthogonal traces, one organic human
          element per icon, one pulsing signal node. All hand-authored SVG,
          inheriting color from context.
        </p>
      </EditorialSection>

      {GROUPS.map((group) => {
        const members = ICONS.filter((i) => i.group === group);
        return (
          <EditorialSection
            key={group}
            container="wide"
            padding="default"
            eyebrow={group}
          >
            <ul className="grid gap-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-3">
              {members.map((icon) => (
                <li
                  key={icon.name}
                  className="flex flex-col gap-[var(--space-4)] rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-8)]"
                >
                  <div className="flex items-start justify-between gap-[var(--space-6)]">
                    <div className="flex-1 text-[color:var(--accent)]">
                      {icon.node}
                    </div>
                    {/* Scale test — smaller instance */}
                    <div className="flex flex-col items-end gap-[var(--space-2)]">
                      <div className="text-[color:var(--accent)]">
                        {icon.node}
                      </div>
                      <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
                        96 &middot; 24
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                      {icon.name}
                    </p>
                    <p className="mt-[var(--space-2)] text-[length:var(--text-small)] leading-[1.5] text-[color:var(--text-muted)]">
                      {icon.signals}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </EditorialSection>
        );
      })}

      {/* Contrast / surface tests */}
      <EditorialSection container="wide" padding="default" eyebrow="Surface tests">
        <div className="grid gap-[var(--space-6)] md:grid-cols-3">
          <div className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-8)] text-center">
            <p className="mb-[var(--space-4)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              Default surface
            </p>
            <GapIcon size={96} active className="text-[color:var(--accent)]" />
          </div>
          <div
            data-surface="dark"
            className="rounded-[4px] border border-[color:var(--accent)] bg-[color:var(--accent-900)] p-[var(--space-8)] text-center"
          >
            <p className="mb-[var(--space-4)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--signal)]">
              Dark island
            </p>
            <GapIcon size={96} active className="text-[color:var(--signal)]" />
          </div>
          <div className="rounded-[4px] border border-[color:var(--accent)] bg-[color:var(--accent)] p-[var(--space-8)] text-center text-[color:var(--paper-50)]">
            <p className="mb-[var(--space-4)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] opacity-70">
              On accent
            </p>
            <GapIcon size={96} active />
          </div>
        </div>
      </EditorialSection>
    </>
  );
}
