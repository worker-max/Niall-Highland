"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/chrome/ThemeToggle";
import { NHMonogram } from "@/components/icons";

/**
 * Primary nav per seed \u00a73.2. Wordmark ("Niall Highland" in Fraunces) is
 * the logo. Desktop: sticky, minimal. Mobile: hamburger reveals a
 * full-screen serif menu with staggered entry.
 */

const LINKS = [
  { href: "/#what-niall-does", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/talks", label: "Talks" },
  { href: "/demos", label: "Demos" },
  { href: "/engage", label: "Engage" },
] as const;

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Subtle background when scrolled past the hero \u2014 keeps the nav legible
  // over any section without always looking like a solid bar.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent background scroll while the mobile sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full",
        "transition-[background-color,backdrop-filter,border-color] duration-[var(--duration-default)] ease-[var(--ease-editorial)]",
        scrolled
          ? "border-b border-[color:var(--border)] bg-[color:var(--surface)]/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex w-full max-w-[var(--width-wide)] items-center justify-between px-[var(--space-6)] py-[var(--space-5)] md:px-[var(--space-8)]"
      >
        <Link
          href="/"
          className="group inline-flex items-center gap-[var(--space-3)] text-[color:var(--text)] hover:text-[color:var(--accent)] transition-colors"
          aria-label="Niall Highland \u2014 home"
        >
          <NHMonogram
            size={28}
            className="text-[color:var(--accent)] transition-transform duration-[var(--duration-default)] ease-[var(--ease-editorial)] group-hover:translate-x-[1px]"
          />
          <span className="font-display text-[1.125rem] tracking-[-0.02em]">
            Niall Highland
          </span>
        </Link>

        <ul className="hidden items-center gap-[var(--space-8)] md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-muted)] hover:text-[color:var(--text)] transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <ThemeToggle />
          </li>
        </ul>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "relative size-8 md:hidden",
            "flex items-center justify-center",
          )}
        >
          <span className="sr-only">Menu</span>
          <span
            aria-hidden="true"
            className={cn(
              "absolute block h-[1px] w-6 bg-[color:var(--text)]",
              "transition-transform duration-[var(--duration-default)] ease-[var(--ease-editorial)]",
              open ? "rotate-45" : "-translate-y-[5px]",
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute block h-[1px] w-6 bg-[color:var(--text)]",
              "transition-transform duration-[var(--duration-default)] ease-[var(--ease-editorial)]",
              open ? "-rotate-45" : "translate-y-[5px]",
            )}
          />
        </button>
      </nav>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 top-0 z-30 bg-[color:var(--surface)] md:hidden",
          "transition-opacity duration-[var(--duration-default)] ease-[var(--ease-editorial)]",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ul className="flex h-full flex-col justify-center gap-[var(--space-8)] px-[var(--space-8)]">
          {LINKS.map((link, i) => (
            <li
              key={link.href}
              className={cn(
                "transition-all duration-[var(--duration-default)] ease-[var(--ease-editorial)]",
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
              style={{ transitionDelay: open ? `${i * 60}ms` : "0ms" }}
            >
              <Link
                href={link.href}
                className="font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em] text-[color:var(--text)]"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="mt-[var(--space-4)]">
            <ThemeToggle />
          </li>
        </ul>
      </div>
    </header>
  );
}
