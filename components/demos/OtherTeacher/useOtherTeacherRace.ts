"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const RACE_DURATION_SECONDS = 5 * 60;

export type RaceState = "idle" | "running" | "finished";

interface StartInput {
  grade: string;
  subject: string;
  objective: string;
}

interface RaceHandle {
  state: RaceState;
  elapsed: number;
  remaining: number;
  streaming: boolean;
  content: string;
  error: string | null;
  finishedEarly: boolean;
  start(input: StartInput): Promise<void>;
  reset(): void;
}

/**
 * Orchestrates the P1 dual-pane race. Drives:
 *  - a 5-minute elapsed-time clock (the left-pane honesty clock)
 *  - the /api/demos/other-teacher stream consumption (right pane)
 *  - race termination: whichever of timeout or stream completion hits first
 *
 * Stream is consumed via raw fetch + ReadableStream rather than a higher-level
 * hook so we can tie its lifecycle tightly to the clock and to reset cleanly.
 */
export function useOtherTeacherRace(): RaceHandle {
  const [state, setState] = useState<RaceState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [content, setContent] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finishedEarly, setFinishedEarly] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const stopTicker = useCallback(() => {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (reason: "stream" | "timeout") => {
      stopTicker();
      abortRef.current?.abort();
      abortRef.current = null;
      setStreaming(false);
      setFinishedEarly(reason === "stream");
      setState("finished");
    },
    [stopTicker],
  );

  const reset = useCallback(() => {
    stopTicker();
    abortRef.current?.abort();
    abortRef.current = null;
    startedAtRef.current = null;
    setState("idle");
    setElapsed(0);
    setContent("");
    setStreaming(false);
    setError(null);
    setFinishedEarly(false);
  }, [stopTicker]);

  useEffect(() => {
    return () => {
      stopTicker();
      abortRef.current?.abort();
    };
  }, [stopTicker]);

  const start = useCallback(
    async (input: StartInput) => {
      if (state === "running") return;

      setState("running");
      setContent("");
      setStreaming(true);
      setError(null);
      setFinishedEarly(false);
      setElapsed(0);

      startedAtRef.current = Date.now();
      tickerRef.current = setInterval(() => {
        const started = startedAtRef.current;
        if (started == null) return;
        const seconds = Math.floor((Date.now() - started) / 1000);
        setElapsed(seconds);
        if (seconds >= RACE_DURATION_SECONDS) {
          finish("timeout");
        }
      }, 250);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/demos/other-teacher", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: controller.signal,
        });

        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          throw new Error(
            typeof detail?.error === "string"
              ? detail.error
              : `Request failed (${res.status})`,
          );
        }

        const body = res.body;
        if (!body) throw new Error("No stream from server.");

        const reader = body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            setContent((prev) => prev + chunk);
          }
        }
        finish("stream");
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
        stopTicker();
        setStreaming(false);
        setState("finished");
      }
    },
    [finish, state, stopTicker],
  );

  return {
    state,
    elapsed,
    remaining: Math.max(0, RACE_DURATION_SECONDS - elapsed),
    streaming,
    content,
    error,
    finishedEarly,
    start,
    reset,
  };
}

export { RACE_DURATION_SECONDS };
