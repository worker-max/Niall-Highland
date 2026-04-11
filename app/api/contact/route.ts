import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get("name") ?? "");
  const email = String(form.get("email") ?? "");
  const branch = String(form.get("branch") ?? "");
  const message = String(form.get("message") ?? "");

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const resend = new Resend(apiKey);
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "no-reply@homehealthtools.com",
        to: "hello@homehealthtools.com",
        subject: `Contact: ${name} (${branch || "no branch"})`,
        replyTo: email,
        text: `From: ${name} <${email}>\nBranch: ${branch}\n\n${message}`,
      });
    } catch {
      // swallow — fall through to redirect
    }
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/contact?sent=1`,
    { status: 303 }
  );
}
