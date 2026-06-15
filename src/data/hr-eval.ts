/**
 * Typed loader + aggregates for the HR Onboarding RAG eval.
 *
 * Data source (the page's single source of truth):
 *   src/data/hr-eval-results.json
 *   vendored verbatim from github.com/FlowFusionAI/hr-onboarding-rag
 *   (eval/results-2026-06-14T20-42-31.json), with cp1252 mojibake repaired
 *   (see scripts/vendor-eval.py). Numbers, scores, and wording are unchanged.
 *
 * Every metric on /assistant is computed here from that JSON. Nothing is
 * hand-entered except BASELINE, which traces to an earlier real run (below).
 */

import evalData from "./hr-eval-results.json";

export type Difficulty = "easy" | "medium" | "hard";
export type EvalStatus = "pass" | "fail";

export type EvalResult = {
  id: string;
  question: string;
  expected_answer: string;
  source_doc: string;
  source_section: string;
  difficulty: Difficulty;
  category: string;
  rag_answer: string;
  /** Top-k chunks the retriever returned, verbatim chunk text. */
  sources: string[];
  /** LLM judge: 1-5, factual correctness vs the expected answer. */
  accuracy: number;
  /** LLM judge: 1-5, is every claim traceable to a retrieved chunk. */
  groundedness: number;
  accuracy_reasoning: string;
  groundedness_reasoning: string;
  status: EvalStatus;
};

// JSON import infers `status: string`; the union is enforced by the vendoring
// script's shape, so the cast through unknown is safe.
export const evalResults = (evalData as { results: unknown }).results as EvalResult[];

export const SCORE_MAX = 5;
/** A question passes when accuracy >= 4 AND groundedness >= 4 (eval-methodology.md). */
export const PASS_THRESHOLD = 4;

const round2 = (n: number) => Math.round(n * 100) / 100;

export type Aggregate = {
  n: number;
  passes: number;
  passRate: number; // whole-number percent
  avgAccuracy: number; // 2dp
  avgGroundedness: number; // 2dp
};

function aggregate(rows: EvalResult[]): Aggregate {
  const n = rows.length;
  const passes = rows.filter((r) => r.status === "pass").length;
  const sum = (k: "accuracy" | "groundedness") =>
    rows.reduce((a, r) => a + r[k], 0);
  return {
    n,
    passes,
    passRate: n ? Math.round((100 * passes) / n) : 0,
    avgAccuracy: n ? round2(sum("accuracy") / n) : 0,
    avgGroundedness: n ? round2(sum("groundedness") / n) : 0,
  };
}

/** Headline numbers: 97% pass (29/30), 4.87 accuracy, 4.87 groundedness. */
export const liveSummary = aggregate(evalResults);

export const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard"];

/** Per-difficulty breakdown in easy -> hard order (18 / 9 / 3). */
export const difficultyBreakdown: (Aggregate & { difficulty: Difficulty })[] =
  DIFFICULTY_ORDER.map((difficulty) => ({
    difficulty,
    ...aggregate(evalResults.filter((r) => r.difficulty === difficulty)),
  }));

/** Per-category breakdown, sorted by count desc then name. */
export const categoryBreakdown: (Aggregate & { category: string })[] =
  Array.from(new Set(evalResults.map((r) => r.category)))
    .map((category) => ({
      category,
      ...aggregate(evalResults.filter((r) => r.category === category)),
    }))
    .sort((a, b) => b.n - a.n || a.category.localeCompare(b.category));

/**
 * Phase-1 mock baseline, run before the retrieval system existed.
 * Traces to eval/results-2026-06-12T15-37-38.json in the same repo
 * (summary: passRate 17, avgAcc 1.73, avgGrnd 2.07, 5/30 pass).
 * It is the "before" in the progression story; the live run is the "after".
 */
export const BASELINE = {
  date: "2026-06-12",
  label: "mock baseline",
  total: 30,
  passes: 5,
  passRate: 17,
  avgAccuracy: 1.73,
  avgGroundedness: 2.07,
  source: "results-2026-06-12T15-37-38.json",
} as const;

export const LIVE = {
  date: "2026-06-14",
  source: "results-2026-06-14T20-42-31.json",
} as const;

/** Percentage-point jump in pass rate from baseline to live (80pp). */
export const passRateDeltaPp = liveSummary.passRate - BASELINE.passRate;

export const REPO_URL = "https://github.com/FlowFusionAI/hr-onboarding-rag";
