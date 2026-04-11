"use client";

import { useState, useTransition } from "react";

export function PtoRequestForm({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/survey/pto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, start, end }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Submission failed");
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <div>
        <h3 className="font-semibold text-teal-900">Request submitted</h3>
        <p className="mt-2 text-sm text-ink-600">
          Your branch director will review and respond. You may close this page.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="start">Start date</label>
        <input
          id="start"
          type="date"
          required
          className="input"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="end">End date</label>
        <input
          id="end"
          type="date"
          required
          className="input"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>
      {error && <div className="text-sm text-red-700">{error}</div>}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
