"use client";

import { useCallback, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { DemoShell } from "@/components/primitives/DemoShell";
import { StreamingOutput } from "@/components/primitives/StreamingOutput";
import { track } from "@/lib/analytics";
import type { Citation } from "@/lib/ai/rag";

const SAMPLE_QUERIES = [
  "What's the fastest way to start an AI fluency program at my school?",
  "When should we write our AI policy?",
  "How do you handle parents accusing the school of unfair AI detection?",
  "What does the assessment redesign actually look like?",
];

interface TalkExplorerProps {
  /** When false (DB not configured), demo renders a coming-soon state. */
  enabled: boolean;
}

export function TalkExplorer({ enabled }: TalkExplorerProps) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runQuery = useCallback(async (q: string) => {
    if (q.trim().length < 2) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStreaming(true);
    setResponse("");
    setCitations([]);
    setError(null);
    track("demo_started", { demo: "talk-explorer", query_length: q.length });

    try {
      const res = await fetch("/api/demos/talk-explorer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(
          typeof detail?.error === "string" ? detail.error : `Request failed (${res.status})`,
        );
      }
      const cite = res.headers.get("X-Talk-Citations");
      if (cite) {
        try {
          const decoded = JSON.parse(atob(cite)) as Citation[];
          setCitations(decoded);
        } catch {
          // ignore — response still useful without citations
        }
      }
      const body = res.body;
      if (!body) throw new Error("No stream from server.");
      const reader = body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) setResponse((prev) => prev + decoder.decode(value, { stream: true }));
      }
      track("demo_completed", { demo: "talk-explorer" });
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setStreaming(false);
    }
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    runQuery(query);
  };

  if (!enabled) {
    return (
      <DemoShell
        id="demo-talk-explorer"
        label="P5 · Conference Talk Explorer"
        title="Coming soon"
        variant="ai-native"
        description={
          <p className="max-w-[var(--width-reading)] text-[length:var(--text-body)]">
            The retrieval-augmented archive is on its way. Once Niall&rsquo;s
            transcripts are indexed, this surface will let you ask the entire
            archive any question and get an answer in his voice, cited to the
            specific talk it came from.
          </p>
        }
      >
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          The talks themselves are already readable below. The interactive
          query mode comes online once the corpus is indexed.
        </p>
      </DemoShell>
    );
  }

  return (
    <DemoShell
      id="demo-talk-explorer"
      label="P5 · Conference Talk Explorer"
      title={streaming ? "Drafting…" : "Ask the archive anything"}
      variant="ai-native"
      active={streaming}
      description={
        <p className="max-w-[var(--width-reading)] text-[length:var(--text-body)]">
          Retrieval-augmented Q&amp;A over Niall&rsquo;s actual conference
          talks. Answers cite the specific talk and venue they came from.
        </p>
      }
      footer={
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Same retrieval mechanism, deployed against your school&rsquo;s
          internal documents, becomes the staff handbook nobody has to write.
        </p>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-[var(--space-4)]">
        <label className="flex flex-col gap-[var(--space-2)]">
          <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            Ask the archive
          </span>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={streaming}
            rows={2}
            placeholder="What would you ask if every talk Niall has given since 2023 was open in front of you?"
            maxLength={800}
            className={cn(
              "rounded-[2px] border border-[color:var(--border)]",
              "bg-[color:var(--ink-900)] px-[var(--space-3)] py-[var(--space-2)]",
              "font-mono text-[length:var(--text-small)] text-[color:var(--text)]",
              "focus:border-[color:var(--accent)] focus:outline-none disabled:opacity-50",
              "resize-y",
            )}
          />
        </label>

        <div className="flex flex-wrap items-center gap-[var(--space-3)]">
          <button
            type="submit"
            disabled={streaming || query.trim().length < 2}
            className={cn(
              "inline-flex items-center gap-[var(--space-2)] rounded-full",
              "border border-[color:var(--signal)] bg-[color:var(--signal)]",
              "px-[var(--space-5)] py-[var(--space-2)]",
              "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]",
              "text-[color:var(--ink-900)] transition-opacity",
              "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {streaming ? "Drafting…" : "Search the archive"}
          </button>
          <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            or try one of these
          </span>
        </div>

        <div className="flex flex-wrap gap-[var(--space-2)]">
          {SAMPLE_QUERIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQuery(s);
                runQuery(s);
              }}
              disabled={streaming}
              className="rounded-full border border-[color:var(--border)] px-[var(--space-3)] py-[var(--space-1)] font-mono text-[var(--text-caption)] text-[color:var(--text-muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--text)] disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      {(streaming || response.length > 0) ? (
        <div className="mt-[var(--space-6)] flex flex-col gap-[var(--space-4)]">
          <StreamingOutput content={response} streaming={streaming} placeholder="Retrieving relevant passages…" />
          {citations.length > 0 ? (
            <ul className="flex flex-wrap gap-[var(--space-2)]">
              {citations.map((c) => (
                <li key={c.index}>
                  <Link
                    href={`/talks/${c.talkSlug}`}
                    className="inline-flex items-center gap-[var(--space-2)] rounded-full border border-[color:var(--accent)] bg-[color:var(--accent-900)]/40 px-[var(--space-3)] py-[var(--space-1)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--signal)] hover:bg-[color:var(--accent-900)]"
                  >
                    <span>[{c.index}]</span>
                    <span>{c.talkTitle}</span>
                    <span className="text-[color:var(--text-faint)]">
                      &middot; {c.talkVenue}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-[var(--space-6)] rounded-[2px] border border-[color:var(--danger-500)] bg-[color:var(--ink-900)] p-[var(--space-4)] text-[length:var(--text-small)] text-[color:var(--text-muted)]"
        >
          {error}
        </div>
      ) : null}
    </DemoShell>
  );
}
