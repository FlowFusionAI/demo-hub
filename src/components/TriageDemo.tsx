"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { TriageResult } from "@/app/api/triage/route";
import { Stamp } from "./Stamp";

const SAMPLES = [
  {
    label: "billing issue",
    name: "Dana",
    message:
      "We were charged twice for the March invoice and the portal won't load the receipt. Need this fixed today please.",
  },
  {
    label: "angry complaint",
    name: "Marcus",
    message:
      "This is the third time the export has failed this week. Honestly unacceptable. We're paying for a service that doesn't work.",
  },
  {
    label: "feature request",
    name: "Priya",
    message:
      "Love the product! It would be great if you could add a weekly summary email so I don't have to log in every day.",
  },
];

const urgencyTone: Record<string, string> = {
  critical: "text-red-700",
  high: "text-accent",
  medium: "text-ink",
  low: "text-live",
};

export function TriageDemo() {
  const reduce = useReducedMotion();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(n: string, m: string) {
    if (!m.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, message: m }),
      });
      if (res.status === 429) {
        setError("Rate limit reached (10/min): the guardrails are real. Try again shortly.");
        return;
      }
      if (!res.ok) {
        setError("Something went wrong. Try again.");
        return;
      }
      setResult(await res.json());
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Submit side */}
      <div className="rounded-lg border border-line bg-card p-5">
        <p className="mb-3 font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-muted">
          1 · submit a ticket
        </p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {SAMPLES.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                setName(s.name);
                setMessage(s.message);
              }}
              className="rounded-full border border-line bg-paper px-2.5 py-1 font-mono text-[0.62rem] text-muted transition-colors hover:border-accent hover:text-accent"
            >
              try: {s.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(name, message);
          }}
          className="flex flex-col gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={100}
            className="rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the issue…"
            rows={5}
            maxLength={2000}
            className="resize-none rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-transform enabled:hover:scale-[1.02] disabled:opacity-60"
          >
            {sending ? "Classifying…" : "Send to the agent →"}
          </button>
          {error && (
            <p className="font-mono text-[0.68rem] text-accent">{error}</p>
          )}
        </form>
      </div>

      {/* Admin side */}
      <div className="rounded-lg border-2 border-ink bg-card p-5">
        <p className="mb-3 flex items-center justify-between font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-muted">
          <span>2 · what the team sees</span>
          {result && (
            <Stamp tone={result.mock ? "ink" : "live"} tilt={-3}>
              {result.mock ? "demo mode" : "live pipeline"}
            </Stamp>
          )}
        </p>
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="empty"
              exit={{ opacity: 0 }}
              className="flex h-[280px] items-center justify-center"
            >
              <p className="max-w-[220px] text-center font-mono text-[0.68rem] uppercase tracking-widest text-muted">
                {sending ? "agent thinking…" : "the admin view fills in here"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={result.ticketId}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-dashed border-line pb-2">
                <span className="font-semibold">{result.ticketId}</span>
                <span className="text-[0.62rem] uppercase tracking-widest text-muted">
                  {new Date().toUTCString().slice(0, 22)} utc
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                <dt className="text-muted">category</dt>
                <dd className="font-semibold">{result.category}</dd>
                <dt className="text-muted">urgency</dt>
                <dd className={`font-semibold ${urgencyTone[result.urgency]}`}>
                  {result.urgency}
                </dd>
                <dt className="text-muted">sentiment</dt>
                <dd className="font-semibold">{result.sentiment}</dd>
                <dt className="text-muted">confidence</dt>
                <dd className="font-semibold">
                  {Math.round(result.confidence * 100)}%
                </dd>
              </dl>
              <div
                className={`mt-3 rounded-md border px-3 py-2 text-[0.7rem] ${
                  result.confidence >= 0.65
                    ? "border-live/40 bg-live/5 text-live"
                    : "border-accent/40 bg-accent/5 text-accent"
                }`}
              >
                {result.confidence >= 0.65
                  ? `confidence ≥ 0.65 → auto-routed to #${result.category.replace("_", "-")}`
                  : "confidence < 0.65 → flagged for #needs-human-review"}
              </div>
              <div className="mt-3">
                <p className="text-[0.62rem] uppercase tracking-widest text-muted">
                  summary
                </p>
                <p className="mt-0.5 font-sans text-[0.8rem] text-ink/85">
                  {result.summary}
                </p>
              </div>
              <div className="mt-3">
                <p className="text-[0.62rem] uppercase tracking-widest text-muted">
                  drafted first response
                </p>
                <p className="mt-0.5 font-sans text-[0.8rem] italic leading-relaxed text-ink/80">
                  “{result.draft_response}”
                </p>
              </div>
              {result.internal_notes?.length > 0 && (
                <div className="mt-3">
                  <p className="text-[0.62rem] uppercase tracking-widest text-muted">
                    internal notes
                  </p>
                  <ul className="mt-0.5 list-inside list-disc font-sans text-[0.78rem] text-ink/75">
                    {result.internal_notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
