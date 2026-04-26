import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/render";

export const runtime = "edge";
export const alt = "Niall Highland — AI strategy for international schools";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogResponse({
    eyebrow: "AI strategy for international schools",
    title: "Teachers aren’t being replaced by AI. They’re being replaced by teachers who use it.",
    subtitle:
      "Niall Highland helps international schools build AI fluency across faculty, curriculum, and leadership.",
    meta: "Live demos · Decision framework · Engagement tiers",
  });
}
