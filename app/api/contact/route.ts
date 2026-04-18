import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

export const runtime = "nodejs";

const ROLES = [
  "Head of School",
  "Principal",
  "Deputy",
  "Curriculum Director",
  "Conference Organizer",
  "Teacher",
  "Other",
] as const;

const requestSchema = z.object({
  name: z.string().min(2).max(120),
  role: z.enum(ROLES),
  organization: z.string().min(1).max(200),
  location: z.string().min(1).max(120),
  message: z.string().min(20).max(4000),
});

/**
 * Contact form (seed \u00a74.6). Validates with Zod, then dispatches through
 * Resend. Graceful degradation: if RESEND_API_KEY is missing we return 503
 * so the client surfaces "email directly" fallback copy instead of crashing.
 *
 * CONTACT_TO defaults to hello@niallhighland.com; override via env once
 * Niall confirms the forwarding inbox.
 */
export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO ?? "hello@niallhighland.com";
  const from = process.env.CONTACT_FROM ?? "Niall Highland site <hello@niallhighland.com>";

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Email isn\u2019t wired up yet. Please email hello@niallhighland.com directly.",
      },
      { status: 503 },
    );
  }

  let parsed: z.infer<typeof requestSchema>;
  try {
    const body = await req.json();
    parsed = requestSchema.parse(body);
  } catch {
    return NextResponse.json({ error: "Some fields look off. Double-check and try again." }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  const { name, role, organization, location, message } = parsed;

  const subject = `[Site inquiry] ${name} \u2014 ${role} @ ${organization}`;
  const text = [
    `From: ${name}`,
    `Role: ${role}`,
    `Organization: ${organization}`,
    `Location: ${location}`,
    "",
    message,
  ].join("\n");

  try {
    const result = await resend.emails.send({ from, to, subject, text, replyTo: undefined });
    if (result.error) {
      return NextResponse.json(
        { error: "Couldn\u2019t send the message. Please email hello@niallhighland.com directly." },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Couldn\u2019t send the message. Please email hello@niallhighland.com directly." },
      { status: 502 },
    );
  }
}
