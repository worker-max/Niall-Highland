import { EditorialSection } from "@/components/primitives/EditorialSection";
import { CredentialChip } from "@/components/primitives/CredentialChip";
import { TimelineIcon } from "@/components/icons";

/**
 * \u00a74.3 \u2014 Track record. Vertical timeline of career nodes plus three
 * editorial cards. Copy is seed [VOICE-REVIEW] structure preserved; Niall
 * rewrites to voice before launch.
 */

interface TimelineEntry {
  period: string;
  role: string;
  institution: string;
  location?: string;
}

const TIMELINE: ReadonlyArray<TimelineEntry> = [
  {
    period: "2025 \u2014 present",
    role: "Associate Principal",
    institution: "International School of Krakow",
    location: "Poland",
  },
  {
    period: "2025",
    role: "Science Teacher (transition)",
    institution: "International School Basel",
    location: "Switzerland",
  },
  {
    period: "2020\u20132023",
    role: "Certificate in International School Leadership",
    institution: "Principals Training Center",
  },
  {
    period: "2017\u20132021",
    role: "Head of Science Department",
    institution: "International School Manila",
    location: "Philippines",
  },
  {
    period: "2008\u20132017",
    role: "Science Teacher \u2014 MS \u2192 HS IB Biology SL/HL",
    institution: "International School Manila",
    location: "Philippines",
  },
  {
    period: "2002\u20132004",
    role: "M.Ed., Secondary Education & Teaching",
    institution: "University of New Hampshire",
  },
  {
    period: "earlier",
    role: "Science teacher, grades 6\u201310",
    institution: "England",
  },
];

const HIGHLIGHTS = [
  {
    eyebrow: "Departmental leadership",
    body:
      "Led twelve science teachers and three lab technicians through the implementation of Next Generation Science Standards for grades 7\u201310. Built a culture where planning was collaborative, teaching was experimental, and professional development was weekly rather than annual.",
  },
  {
    eyebrow: "Curriculum innovation",
    body:
      "Introduced IB Biology SL and HL refinements that measurably improved student engagement and assessment outcomes. Organized the IB Group 4 interdisciplinary project across three successive cohorts, framing science as a connected enterprise rather than a set of isolated subjects.",
  },
  {
    eyebrow: "AI integration",
    body:
      "Since 2023, led faculty and parent workshops on the practical integration of AI into teaching and learning. Developed frameworks for AI-inclusive lesson design, assessment-integrity policy, and department-level tool adoption \u2014 now being adapted at schools across Europe and Asia.",
  },
];

export function TrackRecord() {
  return (
    <EditorialSection
      id="track-record"
      container="wide"
      padding="spacious"
      eyebrow="Track record"
    >
      <div className="grid gap-[var(--space-8)] md:grid-cols-[auto_1fr] md:items-start">
        <TimelineIcon
          size={96}
          active
          className="text-[color:var(--accent)]"
        />
        <h2 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
          Twenty years. Three continents.{" "}
          <span className="text-[color:var(--accent)]">
            One conviction that keeps proving itself.
          </span>
        </h2>
      </div>

      <div className="mt-[var(--space-16)] grid gap-[var(--space-16)] lg:grid-cols-[2fr_3fr]">
        <ol className="flex flex-col gap-[var(--space-6)]">
          {TIMELINE.map((entry, i) => (
            <li
              key={`${entry.period}-${entry.role}`}
              className="relative border-l border-[color:var(--border)] pl-[var(--space-6)] pb-[var(--space-2)]"
            >
              <span
                aria-hidden="true"
                className={
                  "absolute -left-[5px] top-[0.6em] block size-[9px] rounded-full " +
                  (i === 0
                    ? "bg-[color:var(--signal)]"
                    : "bg-[color:var(--accent)]")
                }
              />
              <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
                {entry.period}
              </p>
              <p className="mt-[var(--space-2)] font-display text-[length:var(--text-h3)] tracking-[-0.01em] text-[color:var(--text)]">
                {entry.role}
              </p>
              <p className="mt-[var(--space-1)] text-[length:var(--text-small)] text-[color:var(--text-muted)]">
                {entry.institution}
                {entry.location ? (
                  <>
                    <span aria-hidden="true"> &middot; </span>
                    {entry.location}
                  </>
                ) : null}
              </p>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-[var(--space-8)]">
          {HIGHLIGHTS.map((h) => (
            <article
              key={h.eyebrow}
              className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-8)]"
            >
              <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                {h.eyebrow}
              </p>
              <p className="mt-[var(--space-4)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
                {h.body}
              </p>
            </article>
          ))}

          <div className="flex flex-wrap gap-[var(--space-3)]">
            <CredentialChip tone="accent">IB-certified</CredentialChip>
            <CredentialChip>M.Ed., University of New Hampshire</CredentialChip>
            <CredentialChip>Principals Training Center</CredentialChip>
            <CredentialChip tone="muted">Four countries</CredentialChip>
          </div>
        </div>
      </div>
    </EditorialSection>
  );
}
