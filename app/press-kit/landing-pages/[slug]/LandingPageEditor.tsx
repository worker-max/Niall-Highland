"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { CTA_COLORS, getCtaColor } from "@/lib/press-kit/colors";
import type { LandingPage, LandingPageDescriptor } from "@/lib/press-kit/landing-pages";
import { CopyButton } from "@/components/press-kit/CopyButton";

interface Props {
  descriptor: LandingPageDescriptor;
  initial: LandingPage;
}

const PROMPT_TEMPLATE = (slug: string, audience: string, ctaCorner: string) => `Generate a 16:9 (1920×1080) photographic background image for the
"${slug}" landing page on niallhighland.com.

Audience: ${audience}

Mood: editorial, considered, slightly cinematic. Warm light. Real
classroom or campus environments preferred over abstract renders. Avoid
stock-photo cliché (smiling students, chalkboards, sunlit hands typing).
Avoid any visible AI artefacts, logos, watermarks, or text in the image.

CRITICAL — composition rule:
The bottom-${ctaCorner} corner of the canvas (approx 38% wide × 32% tall,
inset 5%) MUST be visually quiet — soft tone, low detail, low contrast,
no faces, no text, no high-frequency texture. A solid CTA button will be
overlaid there permanently. Treat that corner as negative space the
viewer's eye should rest on after taking in the rest of the frame.

The remaining 62% of the canvas should carry the editorial weight.

No text in the image. Niall Highland's headline and CTA will be added
on top.`;

export function LandingPageEditor({ descriptor, initial }: Props) {
  const [headline, setHeadline] = useState(initial.headline);
  const [subhead, setSubhead] = useState(initial.subhead);
  const [ctaText, setCtaText] = useState(initial.ctaText);
  const [ctaUrl, setCtaUrl] = useState(initial.ctaUrl);
  const [ctaColor, setCtaColor] = useState(initial.ctaColor);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? null);
  const [imageAlt, setImageAlt] = useState(initial.imageAlt ?? "");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [ctaCorner, setCtaCorner] = useState<"right" | "left">("right");

  const colorObj = getCtaColor(ctaColor);
  const previewImage = pendingFile ? URL.createObjectURL(pendingFile) : imageUrl;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const settings = {
        slug: descriptor.slug,
        headline,
        subhead,
        ctaText,
        ctaUrl,
        ctaColor,
        imageUrl,
        imageAlt,
      };
      const form = new FormData();
      form.append("settings", JSON.stringify(settings));
      if (pendingFile) form.append("image", pendingFile);
      const res = await fetch("/api/press-kit/landing-page", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(typeof detail?.error === "string" ? detail.error : `Failed (${res.status})`);
      }
      const data = (await res.json()) as { imageUrl?: string | null };
      if (data.imageUrl) setImageUrl(data.imageUrl);
      setPendingFile(null);
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 2400);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Save failed.");
    }
  };

  return (
    <div className="flex flex-col gap-[var(--space-12)]">
      <header>
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Editing /lp/{descriptor.slug}
        </p>
        <h1 className="mt-[var(--space-3)] font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em]">
          {descriptor.label}
        </h1>
        <p className="mt-[var(--space-4)] max-w-[var(--width-reading)] text-[length:var(--text-body)] text-[color:var(--text-muted)]">
          {descriptor.audience}
        </p>
      </header>

      {/* Live preview */}
      <section>
        <p className="mb-[var(--space-3)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
          Live preview
        </p>
        <LandingPreview
          imageUrl={previewImage}
          headline={headline}
          subhead={subhead}
          ctaText={ctaText}
          ctaColor={colorObj.bg}
          ctaText2={colorObj.text}
          ctaCorner={ctaCorner}
        />
      </section>

      <form onSubmit={onSubmit} className="flex flex-col gap-[var(--space-8)]">
        {/* Image upload + LLM prompt */}
        <section className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-6)]">
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
            Background image
          </p>
          <p className="mt-[var(--space-2)] text-[length:var(--text-small)] text-[color:var(--text-muted)]">
            Upload a 1920×1080 image (JPEG, PNG, WEBP, AVIF · max 8 MB). Generate it
            in your AI of choice using the prompt below — the prompt tells the model
            to leave the bottom-{ctaCorner} corner empty so the CTA never overlaps
            anything important.
          </p>

          <label className="mt-[var(--space-4)] flex flex-col gap-[var(--space-2)]">
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              CTA corner
            </span>
            <div className="flex gap-[var(--space-2)]">
              {(["right", "left"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCtaCorner(c)}
                  className={cn(
                    "rounded-full border px-[var(--space-4)] py-[var(--space-1)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] transition-colors",
                    ctaCorner === c
                      ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--paper-50)]"
                      : "border-[color:var(--border)] text-[color:var(--text-muted)] hover:border-[color:var(--accent)]",
                  )}
                >
                  Bottom-{c}
                </button>
              ))}
            </div>
          </label>

          <label className="mt-[var(--space-6)] flex flex-col gap-[var(--space-2)]">
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              Choose file
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
              className="text-[length:var(--text-small)] text-[color:var(--text)]"
            />
            {pendingFile ? (
              <span className="font-mono text-[var(--text-caption)] text-[color:var(--text-faint)]">
                {pendingFile.name} · {Math.round(pendingFile.size / 1024)} KB · saves on submit
              </span>
            ) : null}
          </label>

          <details className="mt-[var(--space-6)] rounded-[2px] border border-[color:var(--border)] bg-[color:var(--surface)] p-[var(--space-4)]">
            <summary className="cursor-pointer font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
              Prompt for image generator (Midjourney / DALL·E / Imagen / Sora)
            </summary>
            <div className="mt-[var(--space-4)] flex justify-end">
              <CopyButton text={PROMPT_TEMPLATE(descriptor.slug, descriptor.audience, ctaCorner)} label="Copy prompt" />
            </div>
            <pre className="mt-[var(--space-3)] whitespace-pre-wrap font-mono text-[length:var(--text-caption)] leading-[1.6] text-[color:var(--text)]">
{PROMPT_TEMPLATE(descriptor.slug, descriptor.audience, ctaCorner)}
            </pre>
          </details>

          <label className="mt-[var(--space-6)] flex flex-col gap-[var(--space-2)]">
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              Alt text (a11y)
            </span>
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              maxLength={200}
              placeholder="Describe what's in the image for screen readers."
              className="rounded-[2px] border border-[color:var(--border)] bg-[color:var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--text-small)] text-[color:var(--text)] focus:border-[color:var(--accent)] focus:outline-none"
            />
          </label>
        </section>

        {/* Text fields */}
        <section className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-6)] flex flex-col gap-[var(--space-4)]">
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
            Copy
          </p>
          <Field label="Headline">
            <textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={2} maxLength={280} className={input} />
          </Field>
          <Field label="Sub-headline">
            <textarea value={subhead} onChange={(e) => setSubhead(e.target.value)} rows={3} maxLength={600} className={input} />
          </Field>
          <Field label="CTA button text">
            <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} maxLength={80} className={input} />
          </Field>
          <Field label="CTA URL">
            <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} maxLength={500} className={input} />
          </Field>
        </section>

        {/* Color dial */}
        <section className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-6)]">
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
            CTA colour dial
          </p>
          <p className="mt-[var(--space-2)] text-[length:var(--text-small)] text-[color:var(--text-muted)]">
            Seven hand-picked colours that read well on any image mood.
          </p>
          <div className="mt-[var(--space-6)] flex flex-wrap gap-[var(--space-3)]">
            {CTA_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCtaColor(c.id)}
                className={cn(
                  "flex items-center gap-[var(--space-2)] rounded-full border px-[var(--space-3)] py-[var(--space-2)] transition-all",
                  ctaColor === c.id
                    ? "border-[color:var(--text)] ring-2 ring-[color:var(--accent)]"
                    : "border-[color:var(--border)] hover:border-[color:var(--accent)]",
                )}
              >
                <span
                  aria-hidden="true"
                  className="size-4 rounded-full"
                  style={{ background: c.bg, border: c.id === "paper" ? "1px solid #C9C1B0" : undefined }}
                />
                <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-muted)]">
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-[var(--space-4)]">
          <button
            type="submit"
            disabled={status === "submitting"}
            className={cn(
              "inline-flex items-center gap-[var(--space-2)] rounded-full",
              "border border-[color:var(--accent)] bg-[color:var(--accent)]",
              "px-[var(--space-6)] py-[var(--space-3)]",
              "font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)]",
              "text-[color:var(--paper-50)] transition-opacity",
              "hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {status === "submitting" ? "Saving…" : "Save & publish"}
          </button>
          <Link
            href={`/lp/${descriptor.slug}`}
            target="_blank"
            className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
          >
            Open live page &rarr;
          </Link>
          {status === "saved" ? (
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--signal)]">
              Saved
            </span>
          ) : null}
          {status === "error" && error ? (
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--danger-500)]">
              {error}
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}

const input =
  "rounded-[2px] border border-[color:var(--border)] bg-[color:var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--text-small)] text-[color:var(--text)] focus:border-[color:var(--accent)] focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-[var(--space-2)]">
      <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
        {label}
      </span>
      {children}
    </label>
  );
}

interface PreviewProps {
  imageUrl: string | null;
  headline: string;
  subhead: string;
  ctaText: string;
  ctaColor: string;
  ctaText2: string;
  ctaCorner: "right" | "left";
}

function LandingPreview({ imageUrl, headline, subhead, ctaText, ctaColor, ctaText2, ctaCorner }: PreviewProps) {
  return (
    <div
      className="relative aspect-[16/9] w-full overflow-hidden rounded-[4px] border border-[color:var(--border)]"
      style={{
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundColor: "#0B0D0E",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Top: monogram */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-[5%] text-[color:var(--paper-50)]">
        <span className="font-display text-[clamp(0.75rem,1.5vw,1.25rem)] tracking-[-0.02em]">
          Niall Highland
        </span>
      </div>

      {/* Headline area */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 max-w-[55%] text-[color:var(--paper-50)] drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]",
          ctaCorner === "right" ? "left-[5%]" : "right-[5%] text-right",
        )}
      >
        <p className="font-display text-[clamp(1rem,3vw,2.5rem)] leading-[1.05] tracking-[-0.02em] [text-wrap:balance]">
          {headline || "[ Headline ]"}
        </p>
        <p className="mt-[var(--space-3)] text-[clamp(0.75rem,1.4vw,1.125rem)] leading-[1.4] opacity-90">
          {subhead || "[ Sub-headline ]"}
        </p>
      </div>

      {/* CTA — permanently positioned in the safe corner */}
      <div
        className={cn(
          "absolute bottom-[5%]",
          ctaCorner === "right" ? "right-[5%]" : "left-[5%]",
        )}
      >
        <span
          className="inline-flex items-center gap-[var(--space-2)] rounded-full px-[clamp(0.75rem,1.5vw,1.5rem)] py-[clamp(0.375rem,0.75vw,0.75rem)] font-mono text-[clamp(0.55rem,0.9vw,0.875rem)] uppercase tracking-[0.18em]"
          style={{ background: ctaColor, color: ctaText2 }}
        >
          {ctaText || "[ CTA ]"} &rarr;
        </span>
      </div>
    </div>
  );
}
