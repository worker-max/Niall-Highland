import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { listRoadmapItems, notionEnabled } from "@/lib/notion";

export const revalidate = 300;
export const metadata = { title: "Changelog & Roadmap" };

export default async function ChangelogPage() {
  const [shipped, upcoming] = notionEnabled()
    ? await Promise.all([listRoadmapItems("shipped"), listRoadmapItems("upcoming")])
    : [[], []];

  return (
    <div className="min-h-screen bg-cream-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="section-title">Changelog &amp; Roadmap</h1>
        <p className="mt-2 text-ink-600">
          Everything we&apos;ve shipped and what&apos;s coming next. Pulled
          live from Notion — edits propagate within minutes.
        </p>

        {!notionEnabled() && (
          <div className="card mt-8 text-sm text-ink-500">
            Notion is not configured yet. Set <code>NOTION_API_KEY</code> and{" "}
            <code>NOTION_SPRINT_ROADMAP_DB</code> to enable the changelog.
          </div>
        )}

        {upcoming.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-teal-900">Upcoming</h2>
            <ul className="mt-4 space-y-3">
              {upcoming.map((r) => (
                <li key={r.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium text-teal-900">{r.title}</h3>
                    {r.status && (
                      <span className="rounded-full bg-cream-200 px-2 py-0.5 text-xs font-semibold uppercase text-teal-900">
                        {r.status}
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p className="mt-2 text-sm text-ink-600">{r.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {shipped.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold text-teal-900">Shipped</h2>
            <ul className="mt-4 space-y-3">
              {shipped.map((r) => (
                <li key={r.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium text-teal-900">{r.title}</h3>
                    {r.shippedAt && (
                      <span className="text-xs text-ink-500">
                        {r.shippedAt.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p className="mt-2 text-sm text-ink-600">{r.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
