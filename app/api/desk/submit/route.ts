import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isAuthorized } from "@/lib/desk/auth";
import { deskSubmitLimit, ipFromRequest } from "@/lib/ai/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILES = 5;
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_TOTAL_BYTES = 30 * 1024 * 1024; // 30 MB (Resend request limit is 40)
const MAX_BODY_CHARS = 20_000;

/**
 * POST /api/desk/submit
 *
 * Accepts multipart/form-data with:
 *   - kind: capture-card type or "whiteboard"
 *   - payload: JSON string of the structured fields (for capture cards)
 *   - body: plain-text body (for whiteboard)
 *   - files: 0..5 file uploads
 *
 * Emails the owner through Resend with the payload in the body and any
 * files as attachments. Requires an authenticated Desk session.
 */
export async function POST(req: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.DESK_NOTIFY_EMAIL ?? process.env.CONTACT_TO ?? "hello@niallhighland.com";
  const from = process.env.CONTACT_FROM ?? "Niall’s Desk <hello@niallhighland.com>";

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Email isn’t wired up yet. The owner needs to set RESEND_API_KEY.",
      },
      { status: 503 },
    );
  }

  const ip = ipFromRequest(req);
  const { success } = await deskSubmitLimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many submissions. Give it a few minutes." },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Malformed submission." }, { status: 400 });
  }

  const kind = String(form.get("kind") ?? "whiteboard").slice(0, 50);
  const bodyRaw = String(form.get("body") ?? "").slice(0, MAX_BODY_CHARS);
  const payloadRaw = form.get("payload");
  let payload: Record<string, string> | null = null;
  if (typeof payloadRaw === "string") {
    try {
      const parsed = JSON.parse(payloadRaw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        payload = Object.fromEntries(
          Object.entries(parsed as Record<string, unknown>)
            .filter(([, v]) => typeof v === "string")
            .map(([k, v]) => [String(k).slice(0, 120), String(v).slice(0, 2000)]),
        );
      }
    } catch {
      return NextResponse.json({ error: "Payload isn’t valid JSON." }, { status: 400 });
    }
  }

  if (!bodyRaw && !payload) {
    return NextResponse.json({ error: "Nothing to send." }, { status: 400 });
  }

  // Collect files
  const files: File[] = [];
  for (const value of form.getAll("files")) {
    if (value instanceof File && value.size > 0) files.push(value);
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Too many files (max ${MAX_FILES}).` },
      { status: 400 },
    );
  }
  let total = 0;
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `"${f.name}" is larger than 8 MB.` },
        { status: 400 },
      );
    }
    total += f.size;
  }
  if (total > MAX_TOTAL_BYTES) {
    return NextResponse.json(
      { error: "Total attachment size too large (max 30 MB)." },
      { status: 400 },
    );
  }

  const attachments = await Promise.all(
    files.map(async (f) => {
      const buf = Buffer.from(await f.arrayBuffer());
      return { filename: f.name, content: buf };
    }),
  );

  // Format the email body
  const now = new Date().toISOString();
  const parts: string[] = [];
  parts.push(`Kind: ${kind}`);
  parts.push(`Received: ${now}`);
  parts.push("");
  if (payload) {
    parts.push("Fields:");
    for (const [k, v] of Object.entries(payload)) {
      parts.push(`  ${k}: ${v}`);
    }
    parts.push("");
  }
  if (bodyRaw) {
    parts.push("Body:");
    parts.push(bodyRaw);
  }
  if (files.length > 0) {
    parts.push("");
    parts.push(`Attachments (${files.length}):`);
    for (const f of files) {
      parts.push(`  - ${f.name} (${Math.round(f.size / 1024)} KB)`);
    }
  }
  const text = parts.join("\n");
  const subject = `[Niall’s Desk] ${kind} — ${payload?.title ?? now.slice(0, 10)}`;

  const resend = new Resend(apiKey);
  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      text,
      attachments,
    });
    if (result.error) {
      return NextResponse.json(
        { error: "Couldn’t deliver. Please try again shortly." },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Couldn’t deliver. Please try again shortly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
