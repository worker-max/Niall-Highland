import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthorized, configuredPasscode } from "@/lib/desk/auth";
import { DeskIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/press-kit", label: "Overview" },
  { href: "/press-kit/bio", label: "Bio" },
  { href: "/press-kit/cards", label: "Business cards" },
  { href: "/press-kit/email-signature", label: "Email signature" },
  { href: "/press-kit/letterhead", label: "Letterhead" },
  { href: "/press-kit/documents", label: "Documents" },
  { href: "/press-kit/postcards", label: "Postcards" },
  { href: "/press-kit/landing-pages", label: "Landing pages" },
  { href: "/press-kit/speaker", label: "Speaker pack" },
  { href: "/press-kit/brand-assets", label: "Brand assets" },
];

export default async function PressKitLayout({ children }: { children: ReactNode }) {
  if (!configuredPasscode()) {
    redirect("/desk");
  }
  const authed = await isAuthorized();
  if (!authed) {
    redirect("/desk");
  }

  return (
    <div className="mx-auto grid w-full max-w-[var(--width-wide)] gap-[var(--space-8)] px-[var(--space-6)] pb-[var(--space-32)] pt-[var(--space-32)] md:grid-cols-[220px_1fr] md:px-[var(--space-8)]">
      <aside className="md:sticky md:top-[var(--space-32)] md:h-fit">
        <Link
          href="/desk"
          className="mb-[var(--space-6)] inline-flex items-center gap-[var(--space-2)] text-[color:var(--accent)] hover:text-[color:var(--signal)]"
        >
          <DeskIcon size={20} />
          <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]">
            &larr; Back to desk
          </span>
        </Link>
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Press kit
        </p>
        <nav aria-label="Press kit sections" className="mt-[var(--space-3)]">
          <ul className="flex flex-col gap-[var(--space-2)]">
            {NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-[length:var(--text-small)] text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
