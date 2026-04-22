import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Three-column footer per seed \u00a73.3. Stacks on mobile.
 *  1. Nav mirror + legal
 *  2. Contact (email, calendly, linkedin)
 *  3. Mission copy + newsletter signup (deferred \u2014 form lands when Niall
 *     decides to start a newsletter; currently renders a soft CTA to writing).
 */

const NAV = [
  { href: "/#what-niall-does", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/talks", label: "Talks" },
  { href: "/demos", label: "Demos" },
  { href: "/engage", label: "Engage" },
  { href: "/about", label: "About" },
];

interface FooterProps {
  email?: string;
  calendlyUrl?: string;
  linkedInUrl?: string;
}

export function Footer({
  email = "hello@niallhighland.com",
  calendlyUrl,
  linkedInUrl = "https://www.linkedin.com/",
}: FooterProps) {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="mx-auto grid w-full max-w-[var(--width-wide)] gap-[var(--space-12)] px-[var(--space-6)] py-[var(--space-16)] md:grid-cols-3 md:px-[var(--space-8)]">
        <div>
          <p className="font-display text-[length:var(--text-h3)] tracking-[-0.02em] text-[color:var(--text)]">
            Niall Highland
          </p>
          <ul className="mt-[var(--space-6)] flex flex-col gap-[var(--space-3)]">
            {NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-muted)] hover:text-[color:var(--text)] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            Get in touch
          </p>
          <ul className="mt-[var(--space-4)] flex flex-col gap-[var(--space-3)]">
            <li>
              <a
                href={`mailto:${email}`}
                className="text-[length:var(--text-body)] text-[color:var(--text)] hover:text-[color:var(--accent)] transition-colors"
              >
                {email}
              </a>
            </li>
            {calendlyUrl ? (
              <li>
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[length:var(--text-body)] text-[color:var(--text-muted)] hover:text-[color:var(--text)] transition-colors"
                >
                  Book a conversation &rarr;
                </a>
              </li>
            ) : null}
            <li>
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[length:var(--text-body)] text-[color:var(--text-muted)] hover:text-[color:var(--text)] transition-colors"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            Mission
          </p>
          <p className="mt-[var(--space-4)] max-w-[40ch] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
            Building AI fluency across international schools&mdash;so teachers
            amplify their practice instead of defending it.
          </p>
          <Link
            href="/writing"
            className={cn(
              "mt-[var(--space-4)] inline-flex items-center gap-[var(--space-2)]",
              "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]",
              "text-[color:var(--accent)] hover:text-[color:var(--signal)] transition-colors",
            )}
          >
            Read the essays <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>

      <div className="border-t border-[color:var(--border)]">
        <div className="mx-auto flex w-full max-w-[var(--width-wide)] flex-col items-start justify-between gap-[var(--space-3)] px-[var(--space-6)] py-[var(--space-6)] md:flex-row md:items-center md:px-[var(--space-8)]">
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            &copy; {new Date().getFullYear()} Niall Highland
          </p>
          <div className="flex items-center gap-[var(--space-6)]">
            <Link
              href="/desk"
              className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)] hover:text-[color:var(--accent)] transition-colors"
            >
              Niall&rsquo;s desk
            </Link>
            <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              Built with Claude. AI used visibly, not secretly.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
