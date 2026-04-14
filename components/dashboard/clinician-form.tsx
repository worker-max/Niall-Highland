"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const DISCIPLINES = ["RN", "LPN", "PT", "PTA", "OT", "COTA", "HHA", "SLP", "MSW", "OTHER"] as const;

export function ClinicianForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    discipline: "RN",
    number: "",
    tenureRank: "",
    homeZip: "",
    employmentType: "FULL_TIME",
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/clinicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discipline: form.discipline,
          number: Number(form.number),
          tenureRank: Number(form.tenureRank),
          homeZip: form.homeZip || null,
          employmentType: form.employmentType,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Could not add clinician");
        return;
      }
      setForm({ discipline: form.discipline, number: "", tenureRank: "", homeZip: "", employmentType: form.employmentType });
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-[110px_110px_110px_140px_auto]">
      <div>
        <label className="label">Discipline</label>
        <select
          className="input"
          value={form.discipline}
          onChange={(e) => setForm({ ...form, discipline: e.target.value })}
        >
          {DISCIPLINES.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Number</label>
        <input
          className="input"
          type="number"
          min={1}
          required
          value={form.number}
          onChange={(e) => setForm({ ...form, number: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Tenure rank</label>
        <input
          className="input"
          type="number"
          min={1}
          required
          value={form.tenureRank}
          onChange={(e) => setForm({ ...form, tenureRank: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Home ZIP (opt)</label>
        <input
          className="input"
          maxLength={5}
          placeholder="28202"
          value={form.homeZip}
          onChange={(e) => setForm({ ...form, homeZip: e.target.value })}
        />
      </div>
      <div className="flex items-end">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <div className="sm:col-span-5 text-sm text-red-700">{error}</div>}
    </form>
  );
}
