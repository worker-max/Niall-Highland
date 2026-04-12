import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-200 bg-cream-50 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-6 w-6 rounded bg-teal-700" />
              <span className="font-semibold text-teal-900">HomeHealthTools</span>
            </div>
            <p className="mt-3 text-sm text-ink-600">
              Independent SaaS for home health branch directors. No EMR affiliation. No PHI.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-teal-900">Product</h4>
            <ul className="space-y-2 text-sm text-ink-600">
              <li><Link href="/#pricing" className="hover:text-teal-800">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-teal-800">Docs</Link></li>
              <li><Link href="/changelog" className="hover:text-teal-800">Changelog</Link></li>
              <li><Link href="/signup" className="hover:text-teal-800">Start free quarter</Link></li>
              <li><Link href="/contact" className="hover:text-teal-800">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-teal-900">Account</h4>
            <ul className="space-y-2 text-sm text-ink-600">
              <li><Link href="/login" className="hover:text-teal-800">Sign in</Link></li>
              <li><Link href="/signup" className="hover:text-teal-800">Sign up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-teal-900">Legal</h4>
            <ul className="space-y-2 text-sm text-ink-600">
              <li><Link href="/privacy" className="hover:text-teal-800">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-teal-800">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-ink-200 pt-6 text-xs text-ink-500">
          &copy; {new Date().getFullYear()} HomeHealthTools. Not affiliated with any EMR vendor or home health agency.
        </div>
      </div>
    </footer>
  );
}
