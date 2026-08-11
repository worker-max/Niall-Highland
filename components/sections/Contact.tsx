import { EditorialSection } from "@/components/primitives/EditorialSection";
import { ContactIcon } from "@/components/icons";

/**
 * §4.6 — Contact. The submission form is on hold until the Resend API is
 * wired (see /api/contact); until then this presents Niall's contact card
 * directly — email, LinkedIn, and an optional booking link. A static server
 * component: no client JS, and the contact details render in the SSR HTML.
 */

interface ContactProps {
  email: string;
  calendlyUrl?: string;
  linkedInUrl?: string;
}

export function Contact({ email, calendlyUrl, linkedInUrl }: ContactProps) {
  return (
    <EditorialSection
      id="contact"
      container="wide"
      padding="spacious"
      eyebrow="Contact"
    >
      <div className="grid gap-[var(--space-16)] lg:grid-cols-[3fr_2fr] lg:items-start">
        <div>
          <div className="mb-[var(--space-6)] text-[color:var(--accent)]">
            <ContactIcon size={72} active />
          </div>
          <h2 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
            If you read this far,{" "}
            <span className="text-[color:var(--accent)]">
              we should probably talk.
            </span>
          </h2>
          <p className="mt-[var(--space-8)] max-w-[var(--width-reading)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
            The fastest way to reach me is a direct email — tell me about your
            school, where you are with AI, and what you&rsquo;re trying to
            figure out. I reply to every message personally, usually within two
            working days.
          </p>
        </div>

        <aside className="flex flex-col gap-[var(--space-6)] border-l border-[color:var(--border)] pl-[var(--space-8)]">
          <div>
            <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              Direct email
            </p>
            <a
              href={`mailto:${email}`}
              className="mt-[var(--space-2)] inline-block break-all font-display text-[length:var(--text-h3)] tracking-[-0.01em] text-[color:var(--text)] hover:text-[color:var(--accent)]"
            >
              {email}
            </a>
          </div>

          {calendlyUrl ? (
            <div>
              <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
                Book a conversation
              </p>
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-[var(--space-2)] inline-block text-[length:var(--text-body)] text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
              >
                Open Calendly &rarr;
              </a>
            </div>
          ) : null}

          {linkedInUrl ? (
            <div>
              <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
                LinkedIn
              </p>
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-[var(--space-2)] inline-block text-[length:var(--text-body)] text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
              >
                LinkedIn profile &rarr;
              </a>
            </div>
          ) : null}

          <div className="mt-[var(--space-8)] border-t border-[color:var(--border)] pt-[var(--space-6)]">
            <p className="text-[length:var(--text-small)] leading-[var(--leading-body)] text-[color:var(--text-faint)]">
              No auto-responders, no lead-qualification forms, no gated
              downloads. If it&rsquo;s relevant and I can help, I will.
            </p>
          </div>
        </aside>
      </div>
    </EditorialSection>
  );
}
