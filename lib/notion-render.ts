import { NotionToMarkdown } from "notion-to-md";
import { notion } from "./notion";

const n2m = notion ? new NotionToMarkdown({ notionClient: notion as any }) : null;

/**
 * Render a Notion page's block content as markdown.  Returns an empty
 * string when Notion isn't configured or the page has no body.
 */
export async function renderNotionPage(pageId: string): Promise<string> {
  if (!n2m) return "";
  try {
    const blocks = await n2m.pageToMarkdown(pageId);
    const md = n2m.toMarkdownString(blocks);
    return md.parent || "";
  } catch {
    return "";
  }
}

/**
 * Extremely minimal markdown → HTML converter for scaffold purposes.
 * Swap in `marked`, `remark`, or `react-markdown` when you want tables,
 * syntax highlighting, and custom components.
 */
export function markdownToHtml(md: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push("");
      continue;
    }
    const h = /^(#{1,6})\s+(.*)/.exec(line);
    if (h) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      const level = h[1].length;
      out.push(`<h${level}>${escape(h[2])}</h${level}>`);
      continue;
    }
    const li = /^[-*]\s+(.*)/.exec(line);
    if (li) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${escape(li[1])}</li>`);
      continue;
    }
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
    out.push(`<p>${escape(line)}</p>`);
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}
