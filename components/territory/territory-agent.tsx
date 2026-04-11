"use client";

import { useState } from "react";
import type { Clinician } from "@prisma/client";

type Message = { role: "user" | "assistant"; content: string };

export function TerritoryAgent({ clinicians }: { clinicians: Clinician[] }) {
  const [mode, setMode] = useState<"TENURE_PRIORITY" | "EQUITY_DISTRIBUTION">(
    "TENURE_PRIORITY"
  );
  const [discipline, setDiscipline] = useState<string>(
    clinicians[0]?.discipline ?? "RN"
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  const disciplineOptions = Array.from(new Set(clinicians.map((c) => c.discipline)));

  async function sendMessage() {
    if (!input.trim()) return;
    const next: Message[] = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    setPending(true);

    const res = await fetch("/api/agent/territory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        discipline,
        messages: next,
      }),
    });

    if (!res.ok) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Sorry, the agent is unavailable right now. Please retry.",
        },
      ]);
      setPending(false);
      return;
    }

    const data = (await res.json()) as { reply: string };
    setMessages([...next, { role: "assistant", content: data.reply }]);
    setPending(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="card space-y-5">
        <div>
          <label className="label">Discipline</label>
          <select
            className="input"
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
          >
            {disciplineOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Assignment mode</label>
          <div className="space-y-2">
            {(["TENURE_PRIORITY", "EQUITY_DISTRIBUTION"] as const).map((m) => (
              <label key={m} className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="mode"
                  value={m}
                  checked={mode === m}
                  onChange={() => setMode(m)}
                  className="mt-1"
                />
                <span>
                  <strong className="text-teal-900">
                    {m === "TENURE_PRIORITY" ? "Tenure Priority" : "Equity Distribution"}
                  </strong>
                  <br />
                  <span className="text-xs text-ink-500">
                    {m === "TENURE_PRIORITY"
                      ? "Most senior clinician is built first from anchors."
                      : "Every territory balances productive, complex, and geographic tracts."}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Clinicians</label>
          <ul className="max-h-64 overflow-auto text-sm">
            {clinicians
              .filter((c) => c.discipline === discipline)
              .map((c) => (
                <li key={c.id} className="flex items-center justify-between py-1">
                  <span>
                    {c.discipline}-{c.number}
                  </span>
                  <span className="text-xs text-ink-400">Tenure {c.tenureRank}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="card flex h-[600px] flex-col">
        <div className="flex-1 space-y-3 overflow-auto pr-1">
          {messages.length === 0 && (
            <div className="rounded-lg bg-cream-50 p-4 text-sm text-ink-600">
              Start by asking the agent to propose territories for the selected
              discipline, or describe a constraint (e.g. "PT-1 anchors in tract
              37119001100").
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                "rounded-lg p-3 text-sm " +
                (m.role === "user"
                  ? "ml-8 bg-teal-50 text-teal-900"
                  : "mr-8 bg-white border border-ink-200 text-ink-800")
              }
            >
              {m.content}
            </div>
          ))}
          {pending && <div className="mr-8 text-sm text-ink-400">Agent is thinking…</div>}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the agent…"
            className="input"
          />
          <button type="submit" className="btn-primary" disabled={pending}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
