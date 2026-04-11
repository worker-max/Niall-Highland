"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function CountyForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    stateAbbr: "",
    countyName: "",
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/counties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Could not add county");
        return;
      }
      setForm({ stateAbbr: "", countyName: "" });
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr_auto]">
      <div>
        <label htmlFor="stateAbbr" className="label">State</label>
        <input
          id="stateAbbr"
          name="stateAbbr"
          required
          maxLength={2}
          placeholder="NC"
          className="input uppercase"
          value={form.stateAbbr}
          onChange={(e) => setForm({ ...form, stateAbbr: e.target.value.toUpperCase() })}
        />
      </div>
      <div>
        <label htmlFor="countyName" className="label">County</label>
        <input
          id="countyName"
          name="countyName"
          required
          placeholder="Mecklenburg"
          className="input"
          value={form.countyName}
          onChange={(e) => setForm({ ...form, countyName: e.target.value })}
        />
      </div>
      <div className="flex items-end">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Adding…" : "Add county"}
        </button>
      </div>
      {error && <div className="sm:col-span-3 text-sm text-red-700">{error}</div>}
    </form>
  );
}
