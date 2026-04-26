"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import { DeskIcon } from "@/components/icons";
import { Whiteboard } from "@/components/desk/Whiteboard";
import { QuickCaptureCard } from "@/components/desk/QuickCaptureCard";
import { FileDrop } from "@/components/desk/FileDrop";
import { CAPTURE_CARDS } from "@/lib/desk/types";

type Status = "idle" | "submitting" | "sent" | "error";

export function DeskClient() {
  const router = useRouter();
  const [whiteboard, setWhiteboard] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [wbStatus, setWbStatus] = useState<Status>("idle");
  const [wbError, setWbError] = useState<string | null>(null);
  const [cardState, setCardState] = useState<
    Record<string, { status: Status; error: string | null }>
  >({});

  const setCardStatus = (kind: string, status: Status, error: string | null = null) => {
    setCardState((prev) => ({ ...prev, [kind]: { status, error } }));
  };

  const submitWhiteboard = async () => {
    if (whiteboard.trim().length === 0 && files.length === 0) return;
    setWbStatus("submitting");
    setWbError(null);
    try {
      const form = new FormData();
      form.append("kind", "whiteboard");
      form.append("body", whiteboard);
      for (const f of files) form.append("files", f);

      const res = await fetch("/api/desk/submit", { method: "POST", body: form });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(
          typeof detail?.error === "string" ? detail.error : `Request failed (${res.status})`,
        );
      }
      setWbStatus("sent");
      setWhiteboard("");
      setFiles([]);
      window.localStorage.removeItem("desk:whiteboard:draft");
    } catch (err) {
      setWbStatus("error");
      setWbError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const submitCard = async (kind: string, payload: Record<string, string>) => {
    setCardStatus(kind, "submitting");
    try {
      const form = new FormData();
      form.append("kind", kind);
      form.append("payload", JSON.stringify(payload));

      const res = await fetch("/api/desk/submit", { method: "POST", body: form });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(
          typeof detail?.error === "string" ? detail.error : `Request failed (${res.status})`,
        );
      }
      setCardStatus(kind, "sent");
    } catch (err) {
      setCardStatus(
        kind,
        "error",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  };

  const signOut = async () => {
    await fetch("/api/desk/auth", { method: "DELETE" });
    router.refresh();
  };

  return (
    <>
      <EditorialSection
        container="wide"
        padding="spacious"
        eyebrow="Niall’s Desk"
        className="pt-[var(--space-32)]"
      >
        <div className="flex items-start justify-between gap-[var(--space-6)]">
          <div className="flex flex-1 items-start gap-[var(--space-6)]">
            <div className="text-[color:var(--accent)]">
              <DeskIcon size={96} active />
            </div>
            <div>
              <h1 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
                Welcome back.{" "}
                <span className="text-[color:var(--accent)]">
                  What are we updating?
                </span>
              </h1>
              <p className="mt-[var(--space-4)] max-w-[var(--width-reading)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
                Three ways to send something in. Free-form on the whiteboard.
                A structured quick-capture card if you know the shape. File
                drop if you&rsquo;ve got drafts. Everything lands in the site
                owner&rsquo;s inbox with context so they can edit it in fast.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="shrink-0 font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)] hover:text-[color:var(--text)]"
          >
            Sign out
          </button>
        </div>

        <div className="mt-[var(--space-8)] inline-flex items-center gap-[var(--space-3)] rounded-full border border-[color:var(--accent)] bg-[color:var(--accent-900)]/30 px-[var(--space-5)] py-[var(--space-2)]">
          <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
            Press kit
          </span>
          <a
            href="/press-kit"
            className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text)] hover:text-[color:var(--signal)]"
          >
            Open the kit &rarr;
          </a>
        </div>
      </EditorialSection>

      <EditorialSection container="standard" padding="default" eyebrow="Whiteboard">
        <p className="mb-[var(--space-6)] text-[length:var(--text-body)] text-[color:var(--text-muted)]">
          Free-form. Paste anything. Draft persists in your browser if you
          come back later.
        </p>
        <Whiteboard
          value={whiteboard}
          onChange={setWhiteboard}
          storageKey="desk:whiteboard:draft"
          placeholder={`Thoughts, context, a rough pitch — anything.\n\nExamples:\n— "The about page is too long. Cut the Manila section in half."\n— "Here's the full transcript of my ECIS talk. Pull quotes worth featuring: ..."\n— "I want a new tier between sprint and keynote — a 'crisis response' mode."`}
          minRows={12}
        />

        <div className="mt-[var(--space-8)]">
          <p className="mb-[var(--space-3)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            Attachments (optional)
          </p>
          <FileDrop files={files} onChange={setFiles} />
        </div>

        <div className="mt-[var(--space-8)] flex items-center gap-[var(--space-4)]">
          <button
            type="button"
            onClick={submitWhiteboard}
            disabled={
              wbStatus === "submitting" ||
              (whiteboard.trim().length === 0 && files.length === 0)
            }
            className={cn(
              "inline-flex items-center gap-[var(--space-2)] rounded-full",
              "border border-[color:var(--accent)] bg-[color:var(--accent)]",
              "px-[var(--space-6)] py-[var(--space-3)]",
              "font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)]",
              "text-[color:var(--paper-50)] transition-opacity",
              "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {wbStatus === "submitting" ? "Sending…" : "Send to site owner"}
          </button>
          {wbStatus === "sent" ? (
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--signal)]">
              Sent — whiteboard cleared.
            </span>
          ) : null}
          {wbStatus === "error" && wbError ? (
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--danger-500)]">
              {wbError}
            </span>
          ) : null}
        </div>
      </EditorialSection>

      <EditorialSection container="standard" padding="default" eyebrow="Quick-capture cards">
        <p className="mb-[var(--space-6)] text-[length:var(--text-body)] text-[color:var(--text-muted)]">
          Pick the shape that matches what you&rsquo;re sending. Fields land
          pre-structured in the notification email, which makes the edit on
          the site side much faster.
        </p>

        <ul className="flex flex-col gap-[var(--space-4)]">
          {CAPTURE_CARDS.map((card) => (
            <li key={card.kind}>
              <QuickCaptureCard
                definition={card}
                onSubmit={submitCard}
                status={cardState[card.kind]?.status ?? "idle"}
                errorMessage={cardState[card.kind]?.error ?? null}
              />
            </li>
          ))}
        </ul>
      </EditorialSection>
    </>
  );
}
