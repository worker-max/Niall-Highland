import type { Metadata } from "next";
import Link from "next/link";
import type { ReactElement } from "react";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import {
  OtherTeacherIcon,
  LessonPlanIcon,
  CurriculumAuditIcon,
  PrincipalsInboxIcon,
  TalkExplorerIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Demos",
  description:
    "Five live AI demos that prove what AI-fluent teaching looks like. Plan a lesson. Audit a curriculum. Draft a leader\u2019s response.",
};

/**
 * \u00a73.1 \u2014 demos index. Lists all five P-demos; currently only P1\u2013P3
 * are live (home anchors). P4 ships in Phase 4; P5 in Phase 5. Placeholder
 * cards communicate "coming" rather than breaking the page.
 */

interface DemoEntry {
  id: string;
  code: string;
  title: string;
  description: string;
  status: "live" | "coming";
  href: string;
  icon: ReactElement;
}

const DEMOS: ReadonlyArray<DemoEntry> = [
  {
    id: "the-other-teacher",
    code: "P1",
    title: "The Other Teacher",
    description:
      "Dual-pane race. Same objective. Same five minutes. One teacher plans by hand, one teaches alongside AI. The difference, made visceral.",
    status: "live",
    href: "/#demo-the-other-teacher",
    icon: <OtherTeacherIcon size={56} />,
  },
  {
    id: "lesson-plan-alchemist",
    code: "P2",
    title: "Lesson Plan Alchemist",
    description:
      "Lowest-friction demo. Type what you\u2019re teaching next. Get a complete, printable IB-aligned lesson plan in about ten seconds.",
    status: "live",
    href: "/#demo-lesson-plan-alchemist",
    icon: <LessonPlanIcon size={56} />,
  },
  {
    id: "curriculum-audit",
    code: "P3",
    title: "Curriculum Audit",
    description:
      "Paste a unit plan. See which outcomes are AI-proof, which need redesign, and which could go further than you thought. A 30-second version of what I do in paid engagements.",
    status: "live",
    href: "/#demo-curriculum-audit",
    icon: <CurriculumAuditIcon size={56} />,
  },
  {
    id: "principals-inbox",
    code: "P4",
    title: "The Principal\u2019s Inbox",
    description:
      "Realistic AI-policy dilemmas, framed the way they actually hit a head\u2019s desk. Three response options \u2014 policing, permissive, and the third one.",
    status: "live",
    href: "/#demo-principals-inbox",
    icon: <PrincipalsInboxIcon size={56} />,
  },
  {
    id: "talk-explorer",
    code: "P5",
    title: "Conference Talk Explorer",
    description:
      "RAG over every talk Niall has given since 2023. Ask the archive anything; get answers in Niall\u2019s voice, cited to the talk they came from.",
    status: "coming",
    href: "/talks",
    icon: <TalkExplorerIcon size={56} />,
  },
];

export default function DemosPage() {
  return (
    <>
      <EditorialSection
        container="wide"
        padding="spacious"
        eyebrow="Live demos"
        className="pt-[var(--space-32)]"
      >
        <h1 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
          Five demos.{" "}
          <span className="text-[color:var(--accent)]">One thesis.</span>
        </h1>
        <p className="mt-[var(--space-6)] max-w-[var(--width-reading)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          Every demo on this page is doing real work against a live model.
          Nothing is scripted, nothing is cached. If they feel fast, that\u2019s
          because the future of teaching is fast.
        </p>
      </EditorialSection>

      <EditorialSection container="wide" padding="default">
        <ul className="grid gap-[var(--space-6)] md:grid-cols-2">
          {DEMOS.map((d) => (
            <li key={d.id}>
              <Link
                href={d.href}
                className="group flex h-full flex-col gap-[var(--space-4)] rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-8)] transition-colors hover:border-[color:var(--accent)]"
                data-active={d.status === "live" ? "true" : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                    {d.code}
                  </span>
                  <span
                    className={
                      "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] " +
                      (d.status === "live"
                        ? "text-[color:var(--signal)]"
                        : "text-[color:var(--text-faint)]")
                    }
                  >
                    {d.status === "live" ? "Live" : "Coming"}
                  </span>
                </div>
                <div className="text-[color:var(--accent)]">{d.icon}</div>
                <h2 className="font-display text-[length:var(--text-h2)] leading-[1.1] tracking-[-0.02em] text-[color:var(--text)] group-hover:text-[color:var(--accent)] transition-colors">
                  {d.title}
                </h2>
                <p className="text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
                  {d.description}
                </p>
                <span className="mt-auto font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)] group-hover:text-[color:var(--accent)] transition-colors">
                  {d.status === "live" ? "Try it" : "Notify me"}{" "}
                  <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </EditorialSection>
    </>
  );
}
