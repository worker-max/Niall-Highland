import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { listDocs, notionEnabled } from "@/lib/notion";

export const revalidate = 300;
export const metadata = { title: "Docs" };

export default async function DocsIndex() {
  const docs = notionEnabled() ? await listDocs() : [];

  return (
    <div className="min-h-screen bg-cream-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="section-title">Docs</h1>
        <p className="mt-2 text-ink-600">
          Guides, EMR import walkthroughs, and operational playbooks.
        </p>

        {docs.length === 0 ? (
          <div className="card mt-8 text-sm text-ink-500">
            {notionEnabled()
              ? "No docs published yet. Add pages to the Notion docs database."
              : "Notion is not configured yet."}
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {docs.map((d) => (
              <li key={d.id}>
                <Link href={`/docs/${d.slug}`} className="card block hover:border-teal-400">
                  <h2 className="font-semibold text-teal-900">{d.title}</h2>
                  {d.summary && <p className="mt-1 text-sm text-ink-600">{d.summary}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
