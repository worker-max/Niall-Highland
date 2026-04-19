import { EditorialSection } from "@/components/primitives/EditorialSection";
import { ThesisBlock } from "@/components/primitives/ThesisBlock";
import { PullQuote } from "@/components/primitives/PullQuote";
import { OtherTeacher } from "@/components/demos/OtherTeacher";
import { LessonPlanAlchemist } from "@/components/demos/LessonPlanAlchemist";
import { CurriculumAudit } from "@/components/demos/CurriculumAudit";
import { WhatNiallDoes } from "@/components/sections/WhatNiallDoes";
import { TrackRecord } from "@/components/sections/TrackRecord";
import { Engage } from "@/components/sections/Engage";
import { ContactLazy } from "@/components/sections/ContactLazy";
import {
  GapIcon,
  LessonPlanIcon,
  CurriculumAuditIcon,
} from "@/components/icons";

/**
 * Home page. Phase 3 flow (seed \u00a73.1 / \u00a77):
 *   Hero \u2192 P1 demo \u2192 What Niall Does \u2192 P2 demo \u2192 P3 demo \u2192
 *   Track Record \u2192 Pull Quote \u2192 Engage \u2192 Contact
 * P4 Principal\u2019s Inbox slots in after Track Record in Phase 4.
 */
export default function HomePage() {
  return (
    <>
      <EditorialSection
        container="wide"
        padding="spacious"
        eyebrow="AI strategy for international schools"
        className="flex min-h-[90vh] flex-col justify-center pt-[var(--space-24)]"
      >
        <div className="mb-[var(--space-8)] text-[color:var(--accent)]">
          <GapIcon size={112} active />
        </div>
        <ThesisBlock
          lines={[
            "Teachers aren\u2019t being replaced",
            <>
              by AI. They&rsquo;re being replaced{" "}
              <span className="text-[color:var(--accent)]">
                by teachers who use it.
              </span>
            </>,
          ]}
        />

        <p
          className={
            "mt-[var(--space-12)] max-w-[var(--width-reading)] " +
            "text-[length:var(--text-lead)] leading-[var(--leading-body)] " +
            "text-[color:var(--text-muted)]"
          }
        >
          Niall Highland has spent twenty years teaching science, leading
          departments, and running schools across three continents. For the
          last three years, he has been showing international educators how to
          make AI the most powerful colleague they&rsquo;ve ever had. Not
          eventually. Now.
        </p>

        <div className="mt-[var(--space-12)] flex flex-wrap items-center gap-[var(--space-6)]">
          <a
            href="#demo-the-other-teacher"
            className={
              "inline-flex items-center gap-[var(--space-2)] " +
              "rounded-full border border-[color:var(--accent)] " +
              "bg-[color:var(--accent)] px-[var(--space-6)] py-[var(--space-3)] " +
              "font-mono text-[var(--text-small)] uppercase " +
              "tracking-[var(--tracking-label)] text-[color:var(--paper-50)] " +
              "transition-colors duration-[var(--duration-default)] " +
              "ease-[var(--ease-editorial)] " +
              "hover:bg-[color:var(--accent-hover)] " +
              "hover:border-[color:var(--accent-hover)]"
            }
          >
            Try the Other Teacher demo
            <span aria-hidden="true">&rarr;</span>
          </a>
          <a
            href="#contact"
            className={
              "inline-flex items-center gap-[var(--space-2)] " +
              "font-mono text-[var(--text-small)] uppercase " +
              "tracking-[var(--tracking-label)] text-[color:var(--text-muted)] " +
              "transition-colors duration-[var(--duration-default)] " +
              "ease-[var(--ease-editorial)] " +
              "hover:text-[color:var(--text)]"
            }
          >
            Book a conversation
          </a>
        </div>
      </EditorialSection>

      <EditorialSection container="wide" padding="default">
        <OtherTeacher />
      </EditorialSection>

      <WhatNiallDoes />

      <EditorialSection container="wide" padding="default" eyebrow="Demo \u00b7 02">
        <div className="mb-[var(--space-6)] grid gap-[var(--space-6)] md:grid-cols-[auto_1fr] md:items-start">
          <LessonPlanIcon
            size={80}
            active
            className="text-[color:var(--accent)]"
          />
          <h2
            id="demo-lesson-plan-alchemist"
            className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]"
          >
            What are you teaching next?
          </h2>
        </div>
        <LessonPlanAlchemist />
      </EditorialSection>

      <EditorialSection container="wide" padding="default" eyebrow="Demo \u00b7 03">
        <div className="mb-[var(--space-4)] grid gap-[var(--space-6)] md:grid-cols-[auto_1fr] md:items-start">
          <CurriculumAuditIcon
            size={80}
            active
            className="text-[color:var(--accent)]"
          />
          <h2
            id="demo-curriculum-audit"
            className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]"
          >
            Audit a unit against an AI-capable class.
          </h2>
        </div>
        <p className="mb-[var(--space-8)] max-w-[var(--width-reading)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          A 30-second version of what I do inside paid engagements. Paste what
          you&rsquo;re currently teaching. See which outcomes are safe, which
          need redesign, and which could go further than you thought.
        </p>
        <CurriculumAudit />
      </EditorialSection>

      <TrackRecord />

      <EditorialSection container="reading" padding="default">
        <PullQuote
          source="Seed document \u00b7 Part 1.2"
          attribution="Positioning thesis"
        >
          The right question is no longer &ldquo;Should we allow AI?&rdquo;
          The right question is &ldquo;Are our teachers fluent enough to
          teach alongside it?&rdquo;
        </PullQuote>
      </EditorialSection>

      <Engage />

      <ContactLazy
        email="hello@niallhighland.com"
        calendlyUrl={process.env.NEXT_PUBLIC_CALENDLY_URL}
        linkedInUrl="https://www.linkedin.com/in/niall-highland"
      />
    </>
  );
}
