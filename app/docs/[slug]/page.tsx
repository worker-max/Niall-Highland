import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { getDocBySlug, listDocs, notionEnabled } from "@/lib/notion";
import { renderNotionPage, markdownToHtml } from "@/lib/notion-render";

// Revalidate every 5 minutes; the Notion webhook can force an instant refresh.
export const revalidate = 300;

export async function generateStaticParams() {
  if (!notionEnabled()) return [];
  const docs = await listDocs();
  return docs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const doc = await getDocBySlug(params.slug);
  return {
    title: doc?.title ?? "Docs",
    description: doc?.summary ?? "",
  };
}

export default async function DocPage({ params }: { params: { slug: string } }) {
  if (!notionEnabled()) {
    return <NotionNotConfigured />;
  }

  const doc = await getDocBySlug(params.slug);
  if (!doc) notFound();

  const md = await renderNotionPage(doc.id);
  const html = markdownToHtml(md);

  return (
    <div className="min-h-screen bg-cream-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/docs" className="text-sm text-teal-700 hover:underline">
          &larr; All docs
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-teal-950">{doc.title}</h1>
        {doc.summary && (
          <p className="mt-2 text-ink-600">{doc.summary}</p>
        )}
        <article
          className="prose prose-teal mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
      <SiteFooter />
    </div>
  );
}

function NotionNotConfigured() {
  return (
    <div className="min-h-screen bg-cream-50">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="section-title">Docs</h1>
        <div className="card mt-6 text-sm text-ink-600">
          Notion is not configured in this environment. Set{" "}
          <code>NOTION_API_KEY</code> and <code>NOTION_DOCS_DB</code> to
          enable the help center.
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
