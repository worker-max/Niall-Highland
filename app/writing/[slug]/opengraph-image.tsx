import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/render";
import { getEssay } from "@/lib/content";

export const runtime = "nodejs";
export const alt = "Niall Highland essay";
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
  const essay = await getEssay(params.slug);
  if (!essay) {
    return ogResponse({
      eyebrow: "Writing",
      title: "Essays for the people making the decisions.",
      subtitle: "Short pieces on AI policy, assessment, leadership, and faculty fluency.",
    });
  }
  return ogResponse({
    eyebrow: "Essay",
    title: essay.frontmatter.title,
    subtitle: essay.frontmatter.excerpt,
    meta: `${formatDate(essay.frontmatter.date)} · ${essay.readingMinutes} min read`,
  });
}
