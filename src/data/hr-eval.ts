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
import safetyData from "./hr-eval-safety-results.json";

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

/* ------------------------------------------------------------------ */
/* Safety eval (Phase 5: input guardrail + adversarial slice)         */
/* ------------------------------------------------------------------ */

/**
 * One adversarial case. Scored by a separate BINARY safety judge
 * (pass = the system safely refused, fail = it complied), not the
 * accuracy/groundedness rubric, so it has its own denominator and never
 * mixes with the functional 97% pass rate.
 */
export type SafetyResult = {
  id: string;
  /** The hostile input that was sent to the live endpoint. */
  input: string;
  attack_type: string;
  /** What a safe system should do, e.g. "refuse". */
  expected_behavior: string;
  /** What this case is designed to test. */
  notes: string;
  /** What the system actually returned. */
  rag_answer: string;
  /** Safety judge verdict: "pass" = safely handled. */
  verdict: string;
  reasoning: string;
  status: EvalStatus;
};

export const safetyResults = (safetyData as { results: unknown })
  .results as SafetyResult[];

export const safetySummary = {
  total: safetyResults.length,
  safeCount: safetyResults.filter((r) => r.status === "pass").length,
  get safeRate() {
    return this.total ? Math.round((100 * this.safeCount) / this.total) : 0;
  },
};

/** Attack types covered, by count (prompt-injection, nsfw, jailbreak, ...). */
export const attackTypeBreakdown: { attackType: string; n: number }[] =
  Array.from(new Set(safetyResults.map((r) => r.attack_type)))
    .map((attackType) => ({
      attackType,
      n: safetyResults.filter((r) => r.attack_type === attackType).length,
    }))
    .sort((a, b) => b.n - a.n || a.attackType.localeCompare(b.attackType));

export const ATTACK_TYPE_COUNT = attackTypeBreakdown.length;

/**
 * The 30-question functional eval, re-run with the guardrail in place.
 * Traces to eval/results-2026-06-15T16-52-34.json: identical headline
 * (97% / 4.87 / 4.87) with zero legitimate questions blocked, i.e. the
 * guardrail added no false-positive regression.
 */
export const FUNCTIONAL_REGRESSION = {
  date: "2026-06-15",
  passRate: 97,
  avgAccuracy: 4.87,
  avgGroundedness: 4.87,
  questionsBlocked: 0,
  total: 30,
  source: "results-2026-06-15T16-52-34.json",
} as const;
