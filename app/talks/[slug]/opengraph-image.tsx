import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/render";
import { getTalk } from "@/lib/content";

export const runtime = "nodejs";
export const alt = "Niall Highland talk";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

interface ImageProps {
  params: { slug: string };
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export default async function Image({ params }: ImageProps) {
  const talk = await getTalk(params.slug);
  if (!talk) {
    return ogResponse({
      eyebrow: "Talks",
      title: "Niall Highland talks",
      subtitle: "Three years of talks to European and Asian educators on AI in international schools.",
    });
  }
  return ogResponse({
    eyebrow: "Talk",
    title: talk.frontmatter.title,
    subtitle: talk.frontmatter.abstract.slice(0, 220),
    meta: `${talk.frontmatter.venue} · ${formatDate(talk.frontmatter.date)}`,
  });
}
