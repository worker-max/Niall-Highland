import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/render";

export const runtime = "edge";
export const alt = "How to actually study, by Niall Highland";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogResponse({
    eyebrow: "Study Lab",
    title: "How to actually study",
    subtitle: "Learning styles are a myth. Run the experiment yourself, then build a routine that works for every brain.",
    meta: "Retrieve · Space · Explain · Mix",
  });
}
