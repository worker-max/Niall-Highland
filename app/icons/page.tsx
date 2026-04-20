import type { Metadata } from "next";
import type { ReactElement } from "react";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import { BusinessCard } from "@/components/primitives/BusinessCard";
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

      {/* One icon across six surfaces — stress test the visual language. */}
      <EditorialSection container="wide" padding="default" eyebrow="Across surfaces">
        <p className="mb-[var(--space-8)] max-w-[var(--width-reading)] text-[length:var(--text-body)] text-[color:var(--text-muted)]">
          The same icon (<code className="font-mono text-[var(--text-small)]">FluencyIcon</code>)
          rendered on six different background treatments. Because stroke
          inherits <code className="font-mono text-[var(--text-small)]">currentColor</code>,
          each surface defines the icon&rsquo;s palette without touching the icon code.
        </p>
        <div className="grid gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
          <SurfaceTile label="Paper (default)" bg="bg-[color:var(--paper-50)]" fg="text-[color:var(--accent-500)]" border="border-[#C9C1B0]">
            <FluencyIcon size={96} active />
          </SurfaceTile>
          <SurfaceTile label="Paper raised" bg="bg-[#EDE7DA]" fg="text-[color:var(--ink-900)]" border="border-[#C9C1B0]">
            <FluencyIcon size={96} active />
          </SurfaceTile>
          <SurfaceTile label="Ink 900" bg="bg-[color:var(--ink-900)]" fg="text-[color:var(--paper-50)]" border="border-[color:var(--ink-600)]" dark>
            <FluencyIcon size={96} active />
          </SurfaceTile>
          <SurfaceTile label="Ink raised" bg="bg-[color:var(--ink-800)]" fg="text-[color:var(--signal-400)]" border="border-[color:var(--ink-600)]" dark>
            <FluencyIcon size={96} active />
          </SurfaceTile>
          <SurfaceTile label="Accent fill" bg="bg-[color:var(--accent-500)]" fg="text-[color:var(--paper-50)]" border="border-[color:var(--accent-500)]" dark>
            <FluencyIcon size={96} active />
          </SurfaceTile>
          <SurfaceTile label="Accent deep" bg="bg-[color:var(--accent-900)]" fg="text-[color:var(--signal-400)]" border="border-[color:var(--accent-500)]" dark>
            <FluencyIcon size={96} active />
          </SurfaceTile>
        </div>
      </EditorialSection>

      {/* Business cards — production-adjacent preview of the icon family at work. */}
      <EditorialSection container="wide" padding="spacious" eyebrow="Business cards">
        <div className="mb-[var(--space-12)] grid gap-[var(--space-4)] md:grid-cols-[auto_1fr] md:items-start">
          <h2 className="font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em] [text-wrap:balance]">
            Six cards, six roles, one family.
          </h2>
          <p className="max-w-[var(--width-reading)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
            A practical stress-test of the icon language. Each card pairs a
            different icon with a different surface and tells you, in one
            glance, which version of Niall you&rsquo;re talking to \u2014 the
            principal, the consultant, the keynote speaker, the demo-builder.
          </p>
        </div>

        <div className="grid gap-[var(--space-6)] md:grid-cols-2 xl:grid-cols-3">
          <BusinessCard
            surface="ink"
            icon={<GapIcon size={160} active />}
            eyebrow="AI strategy \u00b7 International schools"
            title="Niall Highland"
            role="Associate Principal \u00b7 International School of Krakow"
            contacts={[
              "niallhighland.com",
              "hello@niallhighland.com",
              "in/niall-highland",
            ]}
          />
          <BusinessCard
            surface="paper"
            icon={<FluencyIcon size={160} active />}
            eyebrow="Faculty fluency programs"
            title="Niall Highland"
            role="Consultant \u2014 AI in international schools"
            contacts={[
              "niallhighland.com",
              "hello@niallhighland.com",
            ]}
          />
          <BusinessCard
            surface="accent"
            icon={<KeynoteTierIcon size={160} />}
            eyebrow="Keynotes \u00b7 INSET \u00b7 Board sessions"
            title="On AI, teaching, and the job we\u2019re actually doing now"
            role="Niall Highland"
            contacts={[
              "niallhighland.com/engage/keynote",
              "hello@niallhighland.com",
            ]}
            layout="demo"
          />
          <BusinessCard
            surface="accentDark"
            icon={<OtherTeacherIcon size={160} active />}
            eyebrow="Live demo"
            title="Plan a lesson alongside AI"
            role="The Other Teacher \u00b7 five minutes, side by side"
            contacts={["niallhighland.com/#demo-the-other-teacher"]}
            layout="demo"
          />
          <BusinessCard
            surface="raised"
            icon={<AnchorTierIcon size={160} />}
            eyebrow="School-wide partnership"
            title="Six to eighteen months. One integrated program."
            role="Niall Highland \u00b7 niallhighland.com/engage/partnership"
            layout="split"
          />
          <BusinessCard
            surface="ink"
            icon={<AIAmplifiedIcon size={160} />}
            eyebrow="Curriculum audit"
            title="Teachers aren\u2019t being replaced by AI."
            role="They\u2019re being replaced by teachers who use it."
            contacts={["niallhighland.com/#demo-curriculum-audit"]}
            layout="split"
          />
        </div>
      </EditorialSection>
    </>
  );
}

function SurfaceTile({
  label,
  bg,
  fg,
  border,
  dark,
  children,
}: {
  label: string;
  bg: string;
  fg: string;
  border: string;
  dark?: boolean;
  children: ReactElement;
}) {
  return (
    <div
      data-surface={dark ? "dark" : undefined}
      className={`flex flex-col gap-[var(--space-4)] rounded-[4px] border ${bg} ${border} p-[var(--space-8)]`}
    >
      <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
        {label}
      </span>
      <div className={`flex justify-center ${fg}`}>{children}</div>
    </div>
  );
}
