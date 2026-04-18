import { EditorialSection } from "@/components/primitives/EditorialSection";
import { ThesisBlock } from "@/components/primitives/ThesisBlock";
import { PullQuote } from "@/components/primitives/PullQuote";
import { ThemeToggle } from "@/components/chrome/ThemeToggle";
import { AnalyticsInit } from "@/components/chrome/AnalyticsInit";
import { OtherTeacher } from "@/components/demos/OtherTeacher";
import { LessonPlanAlchemist } from "@/components/demos/LessonPlanAlchemist";
import { CurriculumAudit } from "@/components/demos/CurriculumAudit";

/**
 * Home page. Phase 2 launch criterion (seed §7): visitor arrives, reads the
 * thesis, and scrolls through three working AI demos that prove it — thesis
 * made visceral (P1), then delight (P2), then consultative sales tool (P3).
 * Remaining sections (What Niall Does, Track Record, Engage, Contact) are
 * placeholder until Phase 3.
 */
export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <AnalyticsInit />
      {/* Minimal chrome — full Nav lands in Phase 3. */}
      <header className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex w-full max-w-[var(--width-wide)] items-center justify-between px-[var(--space-6)] py-[var(--space-6)] md:px-[var(--space-8)]">
          <span className="font-display text-[1.125rem] tracking-[-0.02em] text-[color:var(--text)]">
            Niall Highland
          </span>
          <ThemeToggle />
        </div>
      </header>

      <EditorialSection
        container="wide"
        padding="spacious"
        eyebrow="AI strategy for international schools"
        className="flex min-h-screen flex-col justify-center pt-[var(--space-24)]"
      >
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

      {/* P1 demo — seed §5.1. The thesis made visceral. */}
      <EditorialSection container="wide" padding="default">
        <OtherTeacher />
      </EditorialSection>

      <EditorialSection container="reading" padding="default">
        <PullQuote
          source="Seed document · Part 1.2"
          attribution="Positioning thesis"
        >
          The right question is no longer &ldquo;Should we allow AI?&rdquo;
          The right question is &ldquo;Are our teachers fluent enough to
          teach alongside it?&rdquo;
        </PullQuote>
      </EditorialSection>

      {/* P2 demo — seed §5.2. Lowest friction, highest delight. */}
      <EditorialSection
        container="wide"
        padding="default"
        eyebrow="Demo · 02"
      >
        <h2 className="mb-[var(--space-6)] font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
          What are you teaching next?
        </h2>
        <LessonPlanAlchemist />
      </EditorialSection>

      {/* P3 demo — seed §5.3. Consultative sales tool. */}
      <EditorialSection
        container="wide"
        padding="default"
        eyebrow="Demo · 03"
      >
        <h2 className="mb-[var(--space-4)] font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
          Audit a unit against an AI-capable class.
        </h2>
        <p className="mb-[var(--space-8)] max-w-[var(--width-reading)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          A 30-second version of what I do inside paid engagements. Paste
          what you&rsquo;re currently teaching. See which outcomes are safe,
          which need redesign, and which could go further than you thought.
        </p>
        <CurriculumAudit />
      </EditorialSection>

      <footer className="border-t border-[color:var(--border)]">
        <div className="mx-auto w-full max-w-[var(--width-wide)] px-[var(--space-6)] py-[var(--space-12)] md:px-[var(--space-8)]">
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            Phase 2 · P1&ndash;P3 live · P4 Principal&rsquo;s Inbox in Phase 4
          </p>
        </div>
      </footer>
    </main>
  );
}
