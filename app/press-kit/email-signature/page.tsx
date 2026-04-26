import type { Metadata } from "next";
import { CopyButton } from "@/components/press-kit/CopyButton";

export const metadata: Metadata = {
  title: "Email signature · Press kit",
  robots: { index: false, follow: false },
};

const HTML = `<table cellpadding="0" cellspacing="0" style="font-family:Inter,Arial,sans-serif;color:#0B0D0E;line-height:1.4;">
  <tr>
    <td style="padding-right:18px;border-right:1px solid #C9C1B0;">
      <svg width="56" height="28" viewBox="0 0 48 24" fill="none" stroke="#3E8B87" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="3" y1="4" x2="3" y2="20"/>
        <line x1="3" y1="4" x2="15" y2="20"/>
        <line x1="15" y1="4" x2="15" y2="20"/>
        <line x1="24" y1="4" x2="24" y2="20"/>
        <line x1="36" y1="4" x2="36" y2="20"/>
        <line x1="24" y1="12" x2="40" y2="12"/>
        <path d="M40 12 L43 10 L43 14 Z" fill="#3E8B87"/>
        <circle cx="19.5" cy="12" r="1.5" fill="#3E8B87"/>
      </svg>
    </td>
    <td style="padding-left:18px;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;letter-spacing:-0.01em;color:#0B0D0E;">Niall Highland</div>
      <div style="font-size:12px;color:#5C5A52;margin-top:2px;">Associate Principal · International School of Krakow</div>
      <div style="font-size:12px;color:#5C5A52;margin-top:2px;">AI strategy for international schools</div>
      <div style="font-size:12px;margin-top:8px;">
        <a href="https://niallhighland.com" style="color:#3E8B87;text-decoration:none;">niallhighland.com</a>
        &nbsp;·&nbsp;
        <a href="mailto:hello@niallhighland.com" style="color:#3E8B87;text-decoration:none;">hello@niallhighland.com</a>
      </div>
    </td>
  </tr>
</table>`;

const PLAIN = `Niall Highland
Associate Principal · International School of Krakow
AI strategy for international schools
niallhighland.com · hello@niallhighland.com`;

export default function EmailSignaturePage() {
  return (
    <div className="flex flex-col gap-[var(--space-12)]">
      <header>
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Email signature
        </p>
        <h1 className="mt-[var(--space-3)] font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em]">
          One signature.{" "}
          <span className="text-[color:var(--accent)]">Every client.</span>
        </h1>
        <p className="mt-[var(--space-4)] max-w-[var(--width-reading)] text-[length:var(--text-body)] text-[color:var(--text-muted)]">
          HTML version works in Gmail (Settings &rarr; Signature &rarr; paste),
          Apple Mail, and Outlook for web. The plain-text fallback covers
          short replies and mobile clients.
        </p>
      </header>

      <section className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-6)]">
        <header className="mb-[var(--space-4)] flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
          <div>
            <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
              HTML signature
            </p>
            <p className="mt-[var(--space-1)] text-[length:var(--text-caption)] text-[color:var(--text-faint)]">
              Inline-styled, table-based — survives every major email client.
            </p>
          </div>
          <CopyButton text={HTML} label="Copy HTML" />
        </header>
        <div
          className="rounded-[2px] border border-[color:var(--border)] bg-white p-[var(--space-6)]"
          style={{ background: "white" }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: HTML }}
        />
      </section>

      <section className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-6)]">
        <header className="mb-[var(--space-4)] flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
          <div>
            <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
              Plain text
            </p>
            <p className="mt-[var(--space-1)] text-[length:var(--text-caption)] text-[color:var(--text-faint)]">
              For mobile signatures and short replies where the HTML is overkill.
            </p>
          </div>
          <CopyButton text={PLAIN} label="Copy plain" />
        </header>
        <pre className="whitespace-pre-wrap font-mono text-[length:var(--text-small)] text-[color:var(--text)]">
{PLAIN}
        </pre>
      </section>

      <section className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-6)] text-[length:var(--text-small)] text-[color:var(--text-muted)]">
        <p className="mb-[var(--space-3)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
          Install instructions
        </p>
        <ul className="flex flex-col gap-[var(--space-2)]">
          <li><strong>Gmail:</strong> Settings (gear) &rarr; See all settings &rarr; General &rarr; Signature &rarr; Create new &rarr; paste HTML &rarr; Save changes at the bottom of the page.</li>
          <li><strong>Apple Mail (macOS):</strong> Mail &rarr; Settings &rarr; Signatures &rarr; pick account &rarr; create new &rarr; paste &rarr; uncheck &ldquo;Always match my default message font&rdquo;.</li>
          <li><strong>Outlook for web:</strong> Settings (gear) &rarr; View all Outlook settings &rarr; Mail &rarr; Compose and reply &rarr; paste HTML.</li>
          <li><strong>Outlook desktop:</strong> Use Insert &rarr; Signature &rarr; Edit; paste HTML and the icon will render.</li>
        </ul>
      </section>
    </div>
  );
}
