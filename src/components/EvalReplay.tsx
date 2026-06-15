"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  DIFFICULTY_ORDER,
  PASS_THRESHOLD,
  SCORE_MAX,
  type Difficulty,
  type EvalResult,
} from "@/data/hr-eval";
import { Stamp } from "./Stamp";

/**
 * Reusable eval-transcript replay: a filterable list of scored questions on
 * the left, the full machinery for one question on the right (answer +
 * retrieved chunks + judge scores with reasoning). Renders purely from the
 * `results` prop with zero network calls, so any project with eval data of
 * this shape (e.g. the Floor Manager agent eval) can drive it.
 */

type Props = {
  results: EvalResult[];
  /** Ids surfaced as one-click "suggested starting questions". */
  suggestedIds?: string[];
};

const difficultyTone: Record<Difficulty, string> = {
  easy: "text-live",
  medium: "text-accent",
  hard: "text-ink",
};

function ScorePips({ score, pass }: { score: number; pass: boolean }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {Array.from({ length: SCORE_MAX }).map((_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-[2px] ${
            i < score
              ? pass
                ? "bg-live"
                : "bg-accent"
              : "bg-ink/12"
          }`}
        />
      ))}
    </span>
  );
}

function ScoreBlock({
  label,
  score,
  reasoning,
}: {
  label: string;
  score: number;
  reasoning: string;
}) {
  const pass = score >= PASS_THRESHOLD;
  return (
    <div className="rounded-md border border-line bg-paper p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">
          {label}
        </span>
        <span className="flex items-center gap-2">
          <ScorePips score={score} pass={pass} />
          <span
            className={`font-mono text-[0.7rem] font-semibold ${pass ? "text-live" : "text-accent"}`}
          >
            {score}/{SCORE_MAX}
          </span>
        </span>
      </div>
      <p className="mt-2 font-sans text-[0.78rem] leading-relaxed text-ink/75">
        {reasoning}
      </p>
    </div>
  );
}

export function EvalReplay({ results, suggestedIds = [] }: Props) {
  const reduce = useReducedMotion();
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [category, setCategory] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string>(
    suggestedIds[0] ?? results[0]?.id
  );

  const difficultyChips = useMemo(
    () =>
      DIFFICULTY_ORDER.map((d) => ({
        key: d,
        n: results.filter((r) => r.difficulty === d).length,
      })).filter((c) => c.n > 0),
    [results]
  );

  const categoryChips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of results) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([key, n]) => ({ key, n }))
      .sort((a, b) => b.n - a.n || a.key.localeCompare(b.key));
  }, [results]);

  const filtered = useMemo(
    () =>
      results.filter(
        (r) =>
          (difficulty === "all" || r.difficulty === difficulty) &&
          (category === "all" || r.category === category)
      ),
    [results, difficulty, category]
  );

  const selected = results.find((r) => r.id === selectedId) ?? results[0];

  const suggested = suggestedIds
    .map((id) => results.find((r) => r.id === id))
    .filter(Boolean) as EvalResult[];

  return (
    <section aria-labelledby="replay-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
            transcript replay
          </p>
          <h2
            id="replay-heading"
            className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl"
          >
            Step through the machinery.
          </h2>
        </div>
        <p className="max-w-xs text-right font-sans text-[0.8rem] leading-relaxed text-muted">
          Pick any of the 30 questions. See the grounded answer, the chunks the
          retriever actually returned, and the judge&apos;s scores with
          reasoning.
        </p>
      </div>

      {/* Suggested starting questions */}
      {suggested.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-widest text-muted">
            start here:
          </span>
          {suggested.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedId(r.id)}
              className={`rounded-full border px-3 py-1 text-left font-sans text-[0.72rem] transition-colors ${
                selectedId === r.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line bg-card text-ink/80 hover:border-accent hover:text-accent"
              }`}
            >
              {r.question}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 space-y-2 rounded-lg border border-line bg-card/60 p-3">
        <FilterRow label="difficulty">
          <Chip active={difficulty === "all"} onClick={() => setDifficulty("all")}>
            all ({results.length})
          </Chip>
          {difficultyChips.map((c) => (
            <Chip
              key={c.key}
              active={difficulty === c.key}
              onClick={() => setDifficulty(c.key)}
            >
              {c.key} ({c.n})
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="category">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            all
          </Chip>
          {categoryChips.map((c) => (
            <Chip
              key={c.key}
              active={category === c.key}
              onClick={() => setCategory(c.key)}
            >
              {c.key} ({c.n})
            </Chip>
          ))}
        </FilterRow>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Question list */}
        <div>
          <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-widest text-muted">
            {filtered.length} question{filtered.length === 1 ? "" : "s"}
          </p>
          <ul className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
            {filtered.map((r) => {
              const pass = r.status === "pass";
              const active = r.id === selectedId;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    aria-pressed={active}
                    className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                      active
                        ? "border-ink bg-card shadow-[0_2px_10px_rgba(28,28,46,0.08)]"
                        : "border-line bg-card/50 hover:border-ink/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-widest text-muted">
                        {r.id}
                        <span className={difficultyTone[r.difficulty]}>
                          {r.difficulty}
                        </span>
                      </span>
                      <span
                        className={`flex items-center gap-1 font-mono text-[0.55rem] font-semibold uppercase tracking-wider ${
                          pass ? "text-live" : "text-accent"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${pass ? "bg-live" : "bg-accent"}`}
                        />
                        {pass ? "pass" : "miss"}
                      </span>
                    </div>
                    <p className="mt-1 font-sans text-[0.82rem] leading-snug text-ink/85">
                      {r.question}
                    </p>
                    <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-wider text-muted">
                      a{r.accuracy} · g{r.groundedness} · {r.category}
                    </p>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="rounded-md border border-dashed border-line p-4 text-center font-mono text-[0.65rem] uppercase tracking-widest text-muted">
                no questions match
              </li>
            )}
          </ul>
        </div>

        {/* Detail panel */}
        <div className="rounded-lg border-2 border-ink bg-card p-5">
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-line pb-3">
                  <span className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-widest text-muted">
                    {selected.id}
                    <span className={difficultyTone[selected.difficulty]}>
                      {selected.difficulty}
                    </span>
                    · {selected.category}
                  </span>
                  <Stamp
                    tone={selected.status === "pass" ? "live" : "accent"}
                    tilt={-3}
                  >
                    {selected.status === "pass" ? "pass" : "miss"}
                  </Stamp>
                </div>

                <h3 className="mt-3 font-display text-lg font-semibold leading-snug">
                  {selected.question}
                </h3>

                {/* Grounded answer */}
                <div className="mt-4">
                  <p className="font-mono text-[0.6rem] uppercase tracking-widest text-muted">
                    grounded answer
                  </p>
                  <p className="mt-1.5 rounded-md border border-line bg-paper p-3 font-sans text-[0.85rem] leading-relaxed text-ink/90">
                    {selected.rag_answer}
                  </p>
                </div>

                {/* Retrieved chunks */}
                <div className="mt-4">
                  <p className="font-mono text-[0.6rem] uppercase tracking-widest text-muted">
                    retrieved context · top {selected.sources.length} chunks
                    (cosine similarity)
                  </p>
                  <div className="mt-1.5 space-y-2">
                    {selected.sources.map((chunk, i) => (
                      <details
                        key={i}
                        open={i === 0}
                        className="group rounded-md border border-line bg-paper"
                      >
                        <summary className="flex cursor-pointer items-center justify-between px-3 py-2 font-mono text-[0.58rem] uppercase tracking-widest text-muted marker:content-['']">
                          <span>chunk {i + 1}</span>
                          <span className="text-ink/40 group-open:hidden">
                            show ▾
                          </span>
                          <span className="hidden text-ink/40 group-open:inline">
                            hide ▴
                          </span>
                        </summary>
                        <pre className="max-h-44 overflow-y-auto whitespace-pre-wrap border-t border-line px-3 py-2 font-mono text-[0.68rem] leading-relaxed text-ink/70">
                          {chunk.trim()}
                        </pre>
                      </details>
                    ))}
                  </div>
                </div>

                {/* Judge scores */}
                <div className="mt-4">
                  <p className="font-mono text-[0.6rem] uppercase tracking-widest text-muted">
                    llm judge (gpt-4o-mini, temperature 0)
                  </p>
                  <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                    <ScoreBlock
                      label="accuracy"
                      score={selected.accuracy}
                      reasoning={selected.accuracy_reasoning}
                    />
                    <ScoreBlock
                      label="groundedness"
                      score={selected.groundedness}
                      reasoning={selected.groundedness_reasoning}
                    />
                  </div>
                </div>

                {/* Expected answer / source */}
                <div className="mt-4 border-t border-dashed border-line pt-3">
                  <p className="font-mono text-[0.6rem] uppercase tracking-widest text-muted">
                    expected answer · golden set
                  </p>
                  <p className="mt-1 font-sans text-[0.8rem] leading-relaxed text-ink/70">
                    {selected.expected_answer}
                  </p>
                  <p className="mt-1.5 font-mono text-[0.58rem] uppercase tracking-wider text-muted">
                    source: {selected.source_doc} · {selected.source_section}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 font-mono text-[0.58rem] uppercase tracking-widest text-muted">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-2.5 py-0.5 font-mono text-[0.6rem] lowercase tracking-wider transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-line bg-paper text-muted hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}
