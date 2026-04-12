import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/60 bg-cream-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-7 w-7 rounded-md bg-teal-700" />
          <span className="text-lg font-semibold tracking-tight text-teal-900">
            HomeHealthTools
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#pricing" className="text-sm font-medium text-ink-700 hover:text-teal-900">
            Pricing
          </Link>
          <Link href="/docs" className="text-sm font-medium text-ink-700 hover:text-teal-900">
            Docs
          </Link>
          <Link href="/changelog" className="text-sm font-medium text-ink-700 hover:text-teal-900">
            Changelog
          </Link>
          <Link href="/contact" className="text-sm font-medium text-ink-700 hover:text-teal-900">
            Contact
          </Link>
          <Link href="/login" className="text-sm font-medium text-ink-700 hover:text-teal-900">
            Sign in
          </Link>
          <Link href="/signup" className="btn-primary">
            Start free quarter
          </Link>
        </nav>
        <Link href="/signup" className="btn-primary md:hidden">
          Start free
        </Link>
      </div>
    </header>
  );
}
