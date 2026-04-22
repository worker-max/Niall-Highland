"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { DeskIcon } from "@/components/icons";

export function PasscodeGate() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passcode.length === 0) return;
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/desk/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(
          typeof detail?.error === "string" ? detail.error : `Request failed (${res.status})`,
        );
      }
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[32rem] flex-col justify-center px-[var(--space-6)] py-[var(--space-16)]">
      <div className="flex flex-col items-center gap-[var(--space-6)] text-center">
        <div className="text-[color:var(--accent)]">
          <DeskIcon size={96} active />
        </div>
        <div>
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            Niall&rsquo;s Desk
          </p>
          <h1 className="mt-[var(--space-4)] font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em] text-[color:var(--text)]">
            Your space.{" "}
            <span className="text-[color:var(--accent)]">Passcode please.</span>
          </h1>
          <p className="mt-[var(--space-4)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
            Drop notes, upload drafts, fill out a quick-capture card &mdash;
            anything you send lands in the site owner&rsquo;s inbox with a
            structured header so it&rsquo;s ready to edit in.
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-[var(--space-12)] flex flex-col gap-[var(--space-4)]"
      >
        <label className="flex flex-col gap-[var(--space-2)]">
          <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            Passcode
          </span>
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className={cn(
              "rounded-[2px] border border-[color:var(--border)]",
              "bg-[color:var(--surface-raised)] px-[var(--space-4)] py-[var(--space-3)]",
              "font-mono text-[length:var(--text-body)] text-[color:var(--text)]",
              "focus:border-[color:var(--accent)] focus:outline-none",
            )}
          />
        </label>
        <button
          type="submit"
          disabled={status === "submitting" || passcode.length === 0}
          className={cn(
            "inline-flex items-center justify-center gap-[var(--space-2)] rounded-full",
            "border border-[color:var(--accent)] bg-[color:var(--accent)]",
            "px-[var(--space-6)] py-[var(--space-3)]",
            "font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)]",
            "text-[color:var(--paper-50)] transition-opacity",
            "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          {status === "submitting" ? "Checking…" : "Unlock the desk"}
        </button>
        {status === "error" && errorMessage ? (
          <p
            role="alert"
            className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--danger-500)]"
          >
            {errorMessage}
          </p>
        ) : null}
      </form>
    </div>
  );
}
