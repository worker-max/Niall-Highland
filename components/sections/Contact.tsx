"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { EditorialSection } from "@/components/primitives/EditorialSection";

/**
 * \u00a74.6 \u2014 Contact form. Client-validated via Zod + react-hook-form,
 * submits to /api/contact which in turn dispatches through Resend. If the
 * server returns 503 (no Resend key configured) the user sees a fallback
 * asking them to email directly.
 */

const ROLES = [
  "Head of School",
  "Principal",
  "Deputy",
  "Curriculum Director",
  "Conference Organizer",
  "Teacher",
  "Other",
] as const;

const formSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  role: z.enum(ROLES),
  organization: z.string().min(1, "Organization is required").max(200),
  location: z.string().min(1, "Location is required").max(120),
  message: z
    .string()
    .min(20, "A couple of sentences helps me prepare.")
    .max(4000),
});

type FormData = z.infer<typeof formSchema>;

type Status = "idle" | "submitting" | "sent" | "error";

interface ContactProps {
  email: string;
  calendlyUrl?: string;
  linkedInUrl?: string;
}

export function Contact({ email, calendlyUrl, linkedInUrl }: ContactProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: { role: "Head of School" },
  });

  const onSubmit = async (data: FormData) => {
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(
          typeof detail?.error === "string"
            ? detail.error
            : `Request failed (${res.status})`,
        );
      }
      setStatus("sent");
      reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  };

  return (
    <EditorialSection
      id="contact"
      container="wide"
      padding="spacious"
      eyebrow="Contact"
    >
      <div className="grid gap-[var(--space-16)] lg:grid-cols-[3fr_2fr]">
        <div>
          <h2 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
            If you read this far,{" "}
            <span className="text-[color:var(--accent)]">
              we should probably talk.
            </span>
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-[var(--space-12)] flex flex-col gap-[var(--space-6)]"
          >
            <Field
              label="Name"
              error={errors.name?.message}
              input={
                <input
                  type="text"
                  autoComplete="name"
                  {...register("name")}
                  className={inputClass}
                />
              }
            />

            <Field
              label="Role"
              error={errors.role?.message}
              input={
                <select {...register("role")} className={inputClass}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              }
            />

            <Field
              label="School or organization"
              error={errors.organization?.message}
              input={
                <input
                  type="text"
                  autoComplete="organization"
                  {...register("organization")}
                  className={inputClass}
                />
              }
            />

            <Field
              label="Location"
              error={errors.location?.message}
              input={
                <input
                  type="text"
                  placeholder="City, country"
                  {...register("location")}
                  className={inputClass}
                />
              }
            />

            <Field
              label={"What\u2019s on your mind"}
              error={errors.message?.message}
              input={
                <textarea
                  rows={5}
                  {...register("message")}
                  className={cn(inputClass, "resize-y")}
                />
              }
            />

            <div className="flex items-center gap-[var(--space-6)]">
              <button
                type="submit"
                disabled={!isValid || status === "submitting"}
                className={cn(
                  "inline-flex items-center gap-[var(--space-2)] rounded-full",
                  "border border-[color:var(--accent)] bg-[color:var(--accent)]",
                  "px-[var(--space-6)] py-[var(--space-3)]",
                  "font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)]",
                  "text-[color:var(--paper-50)] transition-colors",
                  "hover:bg-[color:var(--accent-hover)] hover:border-[color:var(--accent-hover)]",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                {status === "submitting" ? "Sending\u2026" : "Send"}
              </button>
              {status === "sent" ? (
                <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--signal)]">
                  Sent &mdash; I&rsquo;ll reply within two working days.
                </span>
              ) : null}
              {status === "error" ? (
                <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--danger-500)]">
                  {errorMessage ?? "Something went wrong."}
                </span>
              ) : null}
            </div>
          </form>
        </div>

        <aside className="flex flex-col gap-[var(--space-6)] border-l border-[color:var(--border)] pl-[var(--space-8)]">
          <div>
            <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              Direct email
            </p>
            <a
              href={`mailto:${email}`}
              className="mt-[var(--space-2)] inline-block font-display text-[length:var(--text-h3)] tracking-[-0.01em] text-[color:var(--text)] hover:text-[color:var(--accent)]"
            >
              {email}
            </a>
          </div>
          {calendlyUrl ? (
            <div>
              <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
                Book a conversation
              </p>
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-[var(--space-2)] inline-block text-[length:var(--text-body)] text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
              >
                Open Calendly &rarr;
              </a>
            </div>
          ) : null}
          {linkedInUrl ? (
            <div>
              <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
                LinkedIn
              </p>
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-[var(--space-2)] inline-block text-[length:var(--text-body)] text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
              >
                LinkedIn profile &rarr;
              </a>
            </div>
          ) : null}
          <div className="mt-[var(--space-8)] border-t border-[color:var(--border)] pt-[var(--space-6)]">
            <p className="text-[length:var(--text-small)] leading-[var(--leading-body)] text-[color:var(--text-faint)]">
              I reply to every message personally. No auto-responders, no
              lead-qualification forms, no gated downloads. If it&rsquo;s
              relevant and I can help, I will.
            </p>
          </div>
        </aside>
      </div>
    </EditorialSection>
  );
}

const inputClass = cn(
  "w-full rounded-[2px] border border-[color:var(--border)]",
  "bg-[color:var(--surface-raised)] px-[var(--space-4)] py-[var(--space-3)]",
  "text-[length:var(--text-body)] text-[color:var(--text)]",
  "focus:border-[color:var(--accent)] focus:outline-none",
  "transition-colors duration-[var(--duration-default)] ease-[var(--ease-editorial)]",
);

function Field({
  label,
  error,
  input,
}: {
  label: string;
  error?: string;
  input: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-[var(--space-2)]">
      <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
        {label}
      </span>
      {input}
      {error ? (
        <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--danger-500)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
