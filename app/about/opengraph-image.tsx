import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/render";

export const runtime = "edge";
export const alt = "About Niall Highland";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogResponse({
    eyebrow: "About",
    title: "On teaching, leadership, and the job we’re actually doing now.",
    subtitle:
      "Twenty years across three continents. Three years showing international educators how to teach with AI in the room.",
    meta: "M.Ed. UNH · IB-certified · Principals Training Center",
  });
}
