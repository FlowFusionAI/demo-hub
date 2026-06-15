"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  liveSummary,
  difficultyBreakdown,
  BASELINE,
  LIVE,
  passRateDeltaPp,
  SCORE_MAX,
  type Difficulty,
} from "@/data/hr-eval";
import { CountUp } from "./CountUp";
import { Stamp } from "./Stamp";

const difficultyTone: Record<Difficulty, string> = {
  easy: "text-live",
  medium: "text-accent",
  hard: "text-ink",
};

/** A pair of bars (mock baseline vs live run) for one metric, 0-100% scale. */
function ProgressionRow({
  label,
  baselinePct,
  livePct,
  baselineText,
  liveText,
}: {
  label: string;
  baselinePct: number;
  livePct: number;
  baselineText: string;
  liveText: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div>
      <p className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">
        {label}
      </p>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-20 shrink-0 font-mono text-[0.58rem] uppercase tracking-wider text-muted">
            jun 12
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/8">
            <motion.div
              className="h-full rounded-full bg-muted/50"
              initial={reduce ? false : { width: 0 }}
              whileInView={{ width: `${baselinePct}%` }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
          <span className="w-16 shrink-0 text-right font-mono text-[0.62rem] text-muted">
            {baselineText}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 shrink-0 font-mono text-[0.58rem] uppercase tracking-wider text-live">
            jun 14
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/8">
            <motion.div
              className="h-full rounded-full bg-live"
              initial={reduce ? false : { width: 0 }}
              whileInView={{ width: `${livePct}%` }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
            />
          </div>
          <span className="w-16 shrink-0 text-right font-mono text-[0.62rem] font-semibold text-ink">
            {liveText}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  value,
  decimals,
  suffix,
  label,
  sub,
}: {
  value: number;
  decimals: number;
  suffix: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border-2 border-ink bg-card p-5 shadow-[0_2px_12px_rgba(28,28,46,0.06)]">
      <p className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
        <CountUp to={value} decimals={decimals} suffix={suffix} />
      </p>
      <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-widest text-muted">
        {label}
      </p>
      <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-wider text-live">
        {sub}
      </p>
    </div>
  );
}

export function EvalDashboard() {
  return (
    <section aria-labelledby="eval-dashboard-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
            eval dashboard
          </p>
          <h2
            id="eval-dashboard-heading"
            className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl"
          >
            Measured, not vibes.
          </h2>
        </div>
        <p className="annotation rotate-1 text-right">
          every number traces to one eval run ↘
        </p>
      </div>

      {/* Headline metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          value={liveSummary.passRate}
          decimals={0}
          suffix="%"
          label="pass rate"
          sub={`${liveSummary.passes} / ${liveSummary.n} questions`}
        />
        <StatTile
          value={liveSummary.avgAccuracy}
          decimals={2}
          suffix={`/${SCORE_MAX}`}
          label="avg accuracy"
          sub="judge: factually correct"
        />
        <StatTile
          value={liveSummary.avgGroundedness}
          decimals={2}
          suffix={`/${SCORE_MAX}`}
          label="avg groundedness"
          sub="judge: traceable to a chunk"
        />
      </div>

      {/* Progression: baseline -> live */}
      <div className="mt-4 rounded-lg border border-line bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-muted">
            the progression
          </p>
          <Stamp tone="accent" tilt={-2}>
            +{passRateDeltaPp}pp pass rate
          </Stamp>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <ProgressionRow
            label="pass rate"
            baselinePct={BASELINE.passRate}
            livePct={liveSummary.passRate}
            baselineText={`${BASELINE.passRate}%`}
            liveText={`${liveSummary.passRate}%`}
          />
          <ProgressionRow
            label="avg accuracy"
            baselinePct={(BASELINE.avgAccuracy / SCORE_MAX) * 100}
            livePct={(liveSummary.avgAccuracy / SCORE_MAX) * 100}
            baselineText={`${BASELINE.avgAccuracy.toFixed(2)}`}
            liveText={`${liveSummary.avgAccuracy.toFixed(2)}`}
          />
          <ProgressionRow
            label="avg groundedness"
            baselinePct={(BASELINE.avgGroundedness / SCORE_MAX) * 100}
            livePct={(liveSummary.avgGroundedness / SCORE_MAX) * 100}
            baselineText={`${BASELINE.avgGroundedness.toFixed(2)}`}
            liveText={`${liveSummary.avgGroundedness.toFixed(2)}`}
          />
        </div>
        <p className="mt-4 border-t border-dashed border-line pt-3 font-sans text-[0.78rem] leading-relaxed text-muted">
          Jun 12: a mock baseline run before the retrieval system existed
          ({BASELINE.passes}/{BASELINE.total} pass, mostly non-answers scored
          1/1). Jun 14: the live RAG pipeline against the same 30 questions. The
          gap is the measurable contribution of retrieval, not a claim.
        </p>
      </div>

      {/* By difficulty */}
      <div className="mt-4">
        <p className="mb-2 font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-muted">
          by difficulty
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {difficultyBreakdown.map((d) => (
            <div
              key={d.difficulty}
              className="rounded-lg border border-line bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[0.62rem] font-semibold uppercase tracking-widest ${difficultyTone[d.difficulty]}`}
                >
                  {d.difficulty}
                </span>
                <span className="font-mono text-[0.58rem] uppercase tracking-wider text-muted">
                  {d.n} q
                </span>
              </div>
              <p className="mt-2 font-display text-2xl font-semibold tracking-tight">
                {d.passRate}%
              </p>
              <p className="font-mono text-[0.58rem] uppercase tracking-wider text-muted">
                {d.passes}/{d.n} pass · avg {d.avgAccuracy.toFixed(2)}/
                {d.avgGroundedness.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 font-sans text-[0.78rem] leading-relaxed text-muted">
          All three hard (multi-hop) questions passed. The one miss is an easy
          question where retrieval pulled the wrong chunks, so the model
          abstained ("I don&apos;t have that information") instead of
          hallucinating: a failure that fails safe. Open it in the replay below.
        </p>
      </div>
    </section>
  );
}
