"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { TriageResult } from "@/app/api/triage/route";
import { Stamp } from "./Stamp";

type Phase = "idle" | "sending" | "classified";

const SAMPLE = {
  name: "Dana",
  message:
    "Hi, we were charged twice for our March invoice and the portal won't load the receipt. Can someone look into this today?",
};

const urgencyTone: Record<string, string> = {
  critical: "text-red-700",
  high: "text-accent",
  medium: "text-ink",
  low: "text-live",
};

export function Hero() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<TriageResult | null>(null);
  const [autoTyping, setAutoTyping] = useState(false);
  const interacted = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const submit = useCallback(
    async (n: string, m: string) => {
      if (!m.trim() || phase === "sending") return;
      setPhase("sending");
      setResult(null);
      const started = Date.now();
      let data: TriageResult | null = null;
      try {
        const res = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: n, message: m }),
        });
        if (res.ok) data = await res.json();
      } catch {
        /* mock fallback below */
      }
      // let the packet finish its journey before stamping (min 1.8s)
      const minTravel = reduce ? 0 : 1800;
      const wait = Math.max(0, minTravel - (Date.now() - started));
      timers.current.push(
        setTimeout(() => {
          setResult(
            data ?? {
              category: "other",
              urgency: "low",
              confidence: 0.5,
              sentiment: "neutral",
              summary: m.slice(0, 80),
              draft_response:
                "Thanks for reaching out. We've logged your request.",
              internal_notes: ["Offline fallback"],
              ticketId: "DEMO-0000",
              mock: true,
            }
          );
          setPhase("classified");
        }, wait)
      );
    },
    [phase, reduce]
  );

  // Auto-demo: if the visitor doesn't touch the form within 4.5s, type and
  // send a sample ticket so the system demonstrates itself.
  useEffect(() => {
    const t = setTimeout(() => {
      if (interacted.current || phase !== "idle") return;
      setAutoTyping(true);
      setName(SAMPLE.name);
      if (reduce) {
        setMessage(SAMPLE.message);
        submit(SAMPLE.name, SAMPLE.message);
        return;
      }
      let i = 0;
      const interval = setInterval(() => {
        i += 3;
        setMessage(SAMPLE.message.slice(0, i));
        if (i >= SAMPLE.message.length) {
          clearInterval(interval);
          timers.current.push(
            setTimeout(() => submit(SAMPLE.name, SAMPLE.message), 350)
          );
        }
      }, 24);
      timers.current.push(interval as unknown as ReturnType<typeof setTimeout>);
    }, 4500);
    timers.current.push(t);
    const saved = timers.current;
    return () => saved.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markInteracted = () => {
    interacted.current = true;
    setAutoTyping(false);
  };

  const reset = () => {
    setPhase("idle");
    setResult(null);
    setMessage("");
    interacted.current = true;
  };

  return (
    <section className="dot-grid">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.1fr_1fr] md:gap-10 md:py-24">
        {/* Left: headline */}
        <div className="flex flex-col justify-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent"
          >
            Automation Engineer · England, UK
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl"
          >
            I build AI systems that handle real business operations.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-5 max-w-md text-base leading-relaxed text-muted"
          >
            Not slideware: running systems. The form on this page is one of
            them. My flagship saved a dental clinic 15–20 hours a week, every
            week, for 11 months.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
            className="mt-7 flex items-center gap-4"
          >
            <a
              href="#floor"
              className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-transform hover:scale-105"
            >
              Walk the floor ↓
            </a>
            <span className="annotation -rotate-2">
              ← five systems, two live
            </span>
          </motion.div>
        </div>

        {/* Right: the live ticket system */}
        <div className="flex flex-col justify-center">
          <div className="rounded-lg border border-line bg-card p-5 shadow-[0_2px_16px_rgba(28,28,46,0.07)]">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-muted">
                intake · live system
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-live">
                <motion.span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-live"
                  animate={reduce ? {} : { opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                listening
              </span>
            </div>

            <AnimatePresence mode="wait">
              {phase !== "classified" ? (
                <motion.form
                  key="form"
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : { scale: 0.85, opacity: 0, rotateX: 35 }
                  }
                  onSubmit={(e) => {
                    e.preventDefault();
                    markInteracted();
                    submit(name, message);
                  }}
                  className="flex flex-col gap-3"
                >
                  <input
                    value={name}
                    onChange={(e) => {
                      markInteracted();
                      setName(e.target.value);
                    }}
                    placeholder="Your name"
                    className="rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
                    maxLength={100}
                    disabled={phase === "sending"}
                  />
                  <textarea
                    value={message}
                    onChange={(e) => {
                      markInteracted();
                      setMessage(e.target.value);
                    }}
                    placeholder="Describe any issue: billing, technical, a complaint…"
                    rows={3}
                    maxLength={2000}
                    className="resize-none rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
                    disabled={phase === "sending"}
                  />
                  <button
                    type="submit"
                    disabled={phase === "sending" || !message.trim()}
                    className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-transform enabled:hover:scale-[1.02] disabled:opacity-60"
                  >
                    {phase === "sending" ? "Routing…" : "Send it →"}
                  </button>
                  <p className="text-center font-mono text-[0.62rem] uppercase tracking-widest text-muted">
                    {autoTyping
                      ? "auto-demo running · type to take over"
                      : "this form is a live system. watch."}
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="receipt"
                  initial={reduce ? { opacity: 0 } : { y: -14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="receipt-edge bg-paper px-4 pb-6 pt-3 font-mono text-xs"
                >
                  <div className="mb-2 flex items-center justify-between border-b border-dashed border-line pb-2">
                    <span className="text-[0.65rem] uppercase tracking-widest text-muted">
                      ticket {result?.ticketId}
                    </span>
                    <motion.span
                      initial={reduce ? {} : { scale: 1.6, opacity: 0, rotate: -14 }}
                      animate={{ scale: 1, opacity: 1, rotate: -4 }}
                      transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    >
                      <Stamp tone="accent" tilt={0}>
                        classified
                      </Stamp>
                    </motion.span>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    <dt className="text-muted">category</dt>
                    <dd className="font-semibold">{result?.category}</dd>
                    <dt className="text-muted">urgency</dt>
                    <dd
                      className={`font-semibold ${urgencyTone[result?.urgency ?? "low"]}`}
                    >
                      {result?.urgency}
                    </dd>
                    <dt className="text-muted">confidence</dt>
                    <dd className="font-semibold">
                      {result ? Math.round(result.confidence * 100) : 0}%
                      {result && result.confidence < 0.65 && (
                        <span className="ml-1 text-accent">→ human review</span>
                      )}
                    </dd>
                    <dt className="text-muted">sentiment</dt>
                    <dd className="font-semibold">{result?.sentiment}</dd>
                  </dl>
                  <div className="mt-3 border-t border-dashed border-line pt-2">
                    <p className="text-[0.65rem] uppercase tracking-widest text-muted">
                      drafted reply
                    </p>
                    <p className="mt-1 font-sans text-[0.78rem] italic leading-relaxed text-ink/80">
                      “{result?.draft_response}”
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={reset}
                      className="text-[0.68rem] uppercase tracking-widest text-muted underline-offset-2 hover:text-ink hover:underline"
                    >
                      ↻ send another
                    </button>
                    <Link
                      href="/triage"
                      className="text-[0.68rem] font-semibold uppercase tracking-widest text-accent underline-offset-2 hover:underline"
                    >
                      full admin view →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pipeline: packet travels while sending */}
            <div className="mt-4 flex items-center gap-2" aria-hidden>
              <span className="font-mono text-[0.6rem] uppercase tracking-widest text-muted">
                form
              </span>
              <div className="relative h-px flex-1 bg-line">
                {phase === "sending" && !reduce && (
                  <motion.span
                    className="absolute -top-[3px] h-[7px] w-[7px] rounded-full bg-accent"
                    initial={{ left: "0%" }}
                    animate={{ left: "100%" }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>
              <motion.span
                animate={
                  phase === "sending" && !reduce ? { scale: [1, 1.12, 1] } : {}
                }
                transition={{ repeat: Infinity, duration: 0.9 }}
                className={`rounded border px-2 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-widest ${
                  phase === "classified"
                    ? "border-live text-live"
                    : "border-ink/40 text-ink/70"
                }`}
              >
                triage
              </motion.span>
            </div>
          </div>
          {result?.mock && phase === "classified" && (
            <p className="mt-2 text-center font-mono text-[0.6rem] uppercase tracking-widest text-muted">
              demo response · production runs on the live n8n pipeline
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
