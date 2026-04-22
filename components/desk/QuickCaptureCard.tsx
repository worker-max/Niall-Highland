"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { CaptureCardDefinition } from "@/lib/desk/types";

interface QuickCaptureCardProps {
  definition: CaptureCardDefinition;
  onSubmit: (kind: string, payload: Record<string, string>) => Promise<void>;
  status: "idle" | "submitting" | "sent" | "error";
  errorMessage: string | null;
}

/**
 * Structured update card. Renders a pre-defined set of fields (title,
 * venue, abstract, etc.) for the chosen capture kind. Owner receives the
 * values pre-structured in the notification email.
 */
export function QuickCaptureCard({
  definition,
  onSubmit,
  status,
  errorMessage,
}: QuickCaptureCardProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  const requiredFilled = definition.fields
    .filter((f) => f.required)
    .every((f) => (values[f.name] ?? "").trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredFilled) return;
    await onSubmit(definition.kind, values);
    setValues({});
    setOpen(false);
  };

  return (
    <article className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-[var(--space-4)] p-[var(--space-6)] text-left"
        aria-expanded={open}
      >
        <div>
          <p className="font-display text-[length:var(--text-h3)] tracking-[-0.01em] text-[color:var(--text)]">
            {definition.label}
          </p>
          <p className="mt-[var(--space-2)] text-[length:var(--text-small)] text-[color:var(--text-muted)]">
            {definition.blurb}
          </p>
        </div>
        <span
          aria-hidden="true"
          className={cn(
            "mt-[var(--space-1)] shrink-0 font-mono text-[var(--text-caption)] text-[color:var(--accent)]",
            "transition-transform duration-[var(--duration-default)] ease-[var(--ease-editorial)]",
            open && "rotate-45",
          )}
        >
          +
        </span>
      </button>

      {open ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-[var(--space-4)] border-t border-[color:var(--border)] p-[var(--space-6)]"
        >
          {definition.fields.map((field) => (
            <label key={field.name} className="flex flex-col gap-[var(--space-2)]">
              <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
                {field.label}
                {field.required ? (
                  <span className="ml-[var(--space-1)] text-[color:var(--accent)]">
                    *
                  </span>
                ) : null}
              </span>
              {field.rows && field.rows > 1 ? (
                <textarea
                  value={values[field.name] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.name]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  rows={field.rows}
                  className={inputClass}
                />
              ) : (
                <input
                  type="text"
                  value={values[field.name] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.name]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  className={inputClass}
                />
              )}
            </label>
          ))}

          <div className="flex items-center gap-[var(--space-4)]">
            <button
              type="submit"
              disabled={!requiredFilled || status === "submitting"}
              className={cn(
                "inline-flex items-center gap-[var(--space-2)] rounded-full",
                "border border-[color:var(--accent)] bg-[color:var(--accent)]",
                "px-[var(--space-5)] py-[var(--space-2)]",
                "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]",
                "text-[color:var(--paper-50)] transition-opacity",
                "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              {status === "submitting" ? "Sending…" : "Send to site owner"}
            </button>
            {status === "sent" ? (
              <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--signal)]">
                Sent
              </span>
            ) : null}
            {status === "error" && errorMessage ? (
              <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--danger-500)]">
                {errorMessage}
              </span>
            ) : null}
          </div>
        </form>
      ) : null}
    </article>
  );
}

const inputClass = cn(
  "rounded-[2px] border border-[color:var(--border)]",
  "bg-[color:var(--surface)] px-[var(--space-3)] py-[var(--space-2)]",
  "text-[length:var(--text-small)] text-[color:var(--text)]",
  "focus:border-[color:var(--accent)] focus:outline-none",
);
