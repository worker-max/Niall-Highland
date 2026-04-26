import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { z } from "zod";
import { isAuthorized } from "@/lib/desk/auth";
import { upsertLandingPage, landingPageSchema } from "@/lib/press-kit/landing-pages";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Multipart POST: settings + optional new background image. The image
 * goes to Vercel Blob; settings (incl. the resulting URL) persist to
 * Postgres via lib/press-kit/landing-pages. Auth: desk session cookie.
 */
export async function POST(req: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Malformed submission." }, { status: 400 });
  }

  const settingsRaw = form.get("settings");
  if (typeof settingsRaw !== "string") {
    return NextResponse.json({ error: "Missing settings." }, { status: 400 });
  }
  let settings: z.infer<typeof landingPageSchema>;
  try {
    settings = landingPageSchema.parse(JSON.parse(settingsRaw));
  } catch {
    return NextResponse.json({ error: "Invalid settings shape." }, { status: 400 });
  }

  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image larger than 8 MB." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Image type not allowed (use JPEG/PNG/WEBP/AVIF)." }, { status: 400 });
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "Image storage not configured (BLOB_READ_WRITE_TOKEN missing)." }, { status: 503 });
    }
    const blob = await put(`landing-pages/${settings.slug}-${Date.now()}-${file.name}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
    });
    settings.imageUrl = blob.url;
    if (!settings.imageAlt) {
      settings.imageAlt = `Background for ${settings.slug} landing page`;
    }
  }

  try {
    await upsertLandingPage(settings);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save settings." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, imageUrl: settings.imageUrl ?? null });
}
