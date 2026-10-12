import type { Metadata } from "next";
import Link from "next/link";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import { Callout, Compare, ComparisonTable, Section, Sidebar } from "@/components/essay";
import { BlockedVsMixed } from "@/components/study/BlockedVsMixed";
import { CramVsSpace } from "@/components/study/CramVsSpace";
import { RereadVsRecall } from "@/components/study/RereadVsRecall";
import { SUBJECT_ROUTINES } from "@/lib/study/content";

export const metadata: Metadata = {
  title: "How to actually study",
  description:
    "Learning styles are a myth. Run the experiments yourself, then build a study routine that works for every brain: retrieve, space, explain, mix.",
};

const body = "mt-[var(--space-4)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text)]";

export default function StudyPage() {
  return (
    <div data-accent="clay">
      <EditorialSection container="standard" padding="tight" className="pt-[var(--space-24)] md:pt-[var(--space-32)]">
        <p className="mb-[var(--space-6)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
          Study Lab · For students, parents & teachers
        </p>
        <h1 className="max-w-[16ch] font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[var(--tracking-hero)] text-[color:var(--text)] [text-wrap:balance]">
          How to actually study
        </h1>
        <div aria-hidden="true" className="mt-[var(--space-8)] h-[3px] w-[var(--space-16)] bg-[color:var(--accent)]" />
        <p className="mt-[var(--space-8)] max-w-[var(--width-reading)] font-display text-[length:var(--text-lead)] leading-[1.5] text-[color:var(--text-muted)]">
          Forget what kind of learner you were told you are. There is no such thing. There are a handful of study moves that
          work for every brain, and you can prove it to yourself in about six minutes.{" "}
          <Link href="/writing/nobody-is-a-visual-learner" className="text-[color:var(--accent)] underline underline-offset-4">
            Read why learning styles keep failing fair tests.
          </Link>
        </p>
      </EditorialSection>

      <EditorialSection container="reading" padding="tight" className="pt-0">
        <Section label="The engine" index="01">
          <p className={body}>
            Every effective study method in the research comes down to four moves. None of them depends on your
            personality, your preferences or a quiz result. All four feel harder than rereading, and that is exactly why
            they work.
          </p>
          <ComparisonTable label="The four moves" columnA="What you do" columnB="Why it works">
            <Compare aspect="Retrieve" a="Close the book. Write down everything you remember. Then check." b="Pulling a memory out strengthens it far more than looking at it again." />
            <Compare aspect="Space" a="Split the same study time across several days. Revisit each topic a week later." b="Letting yourself partly forget, then recalling, makes memories last." />
            <Compare aspect="Explain" a="Ask why each fact is true and answer in your own words." b="Explaining connects new ideas to what you already know." />
            <Compare aspect="Mix" a="Once you can do a skill, practice it alongside older ones." b="Mixing forces you to choose the method, which is what tests ask for." />
          </ComparisonTable>
        </Section>

        <Section label="The lab" index="02">
          <p className={body}>
            Do not take my word for any of this. Run the experiments. There are three, each takes a few minutes, they work on
            a phone, and nothing you type leaves this page.
          </p>
          <div className="mt-[var(--space-8)]">
            <RereadVsRecall />
          </div>
          <p className={body}>
            Next, timing. Cramming feels efficient because it works for tomorrow. See what it does to next week.
          </p>
          <div className="mt-[var(--space-8)]">
            <CramVsSpace />
          </div>
          <p className={body}>
            Last, mixing. Doing twenty problems of the same kind feels smooth. Real tests never hand you twenty of the same
            kind.
          </p>
          <div className="mt-[var(--space-8)]">
            <BlockedVsMixed />
          </div>
        </Section>

        <Section label="Five things worth knowing about yourself" index="03">
          <p className={body}>
            Students really are different. The differences that matter just are not styles. Five of them predict how a
            student does, and every one can be measured and improved. They change how much help you need, never which
            method works.
          </p>
          <ComparisonTable label="What each difference changes" columnA="What you notice" columnB="What helps">
            <Compare aspect="Prior knowledge" a="Lost from the first lesson; new ideas have nothing to attach to" b="More worked examples and foundational review before working alone" />
            <Compare aspect="Reading skill" a="Slow, effortful reading in every subject" b="Reading practice, plus audio support so the content keeps pace" />
            <Compare aspect="Executive function" a="Missed deadlines, trouble starting, loses track" b="Pre-built schedules, checklists, smaller chunks, phone out of the room" />
            <Compare aspect="Self-regulation" a="Rereads for hours, cannot tell what they actually know" b="A plan, a self-quiz to check, and an adjustment each week" />
            <Compare aspect="Test anxiety" a="Knows it at home, freezes in the exam" b="Frequent low-stakes timed practice; treating nerves as readiness" />
          </ComparisonTable>
          <Callout tone="caution" label="When to ask for more">
            If reading stays slow, math facts never stick, or disorganization shows up everywhere despite real effort, ask
            for a proper evaluation. No quiz on a website can diagnose dyslexia or ADHD.
          </Callout>
        </Section>

        <Section label="Routines by subject" index="04">
          <p className={body}>
            The engine stays the same in every subject. What you retrieve and how you practice it changes, because the
            content changes. You do not cook fish the way you cook brisket.
          </p>
          <ComparisonTable label="Weekly routines by subject" columnA="The routine" columnB="Why the content demands it">
            {SUBJECT_ROUTINES.map((r) => (
              <Compare key={r.subject} aspect={r.subject} a={r.routine} b={r.why} />
            ))}
          </ComparisonTable>
        </Section>

        <Section label="For parents and teachers" index="05">
          <p className={body}>
            The single most useful thing an adult can do is stop policing homework and start coaching the routine. Ask what
            the plan is this week. Ask how they will check what they know. Praise the strategy and the effort, not being
            smart.
          </p>
          <Sidebar label="Coaching checklist" title="Five questions to ask this week">
            <ul className="flex list-disc flex-col gap-[var(--space-2)] pl-[var(--space-4)]">
              <li>What will you study, and on which days?</li>
              <li>How will you test yourself without looking?</li>
              <li>What did you get wrong last time, and when will you redo it?</li>
              <li>Where will your phone be while you study?</li>
              <li>What time are you going to bed?</li>
            </ul>
          </Sidebar>
          <p className={body}>
            Teachers: five retrieval questions at the start of every lesson, on last week&rsquo;s material, ungraded. It is
            the cheapest high-impact change available to you.
          </p>
        </Section>
      </EditorialSection>
    </div>
  );
}
