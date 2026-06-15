/**
 * Code-drawn architecture diagram (CSS/flex, no image asset).
 * Mirrors the three independent pipelines documented in the project's
 * docs/architecture.md: ingestion, query, evaluation.
 * Drawn rather than screenshotted per the design brief: crisp at any size,
 * recolourable from tokens, and it demonstrates the frontend work itself.
 */

type Node = { title: string; sub?: string; tone?: "ink" | "accent" | "store" };

const pipelines: { label: string; cadence: string; nodes: Node[] }[] = [
  {
    label: "ingestion",
    cadence: "runs once",
    nodes: [
      { title: "HR docs", sub: "3 markdown files" },
      { title: "chunker", sub: "~400 tok · 50 overlap" },
      { title: "embeddings", sub: "text-embedding-3-small", tone: "accent" },
      { title: "pgvector", sub: "Supabase · 1536-dim", tone: "store" },
    ],
  },
  {
    label: "query",
    cadence: "per message",
    nodes: [
      { title: "question", sub: "n8n webhook" },
      { title: "embed", sub: "same model" },
      { title: "cosine search", sub: "top-3 chunks", tone: "store" },
      { title: "prompt", sub: "system + chunks + q" },
      { title: "GPT-4o-mini", sub: "temp 0.2", tone: "accent" },
      { title: "grounded answer", sub: "+ sources" },
    ],
  },
  {
    label: "eval",
    cadence: "after every change",
    nodes: [
      { title: "golden set", sub: "30 Q&A pairs" },
      { title: "call RAG", sub: "per question" },
      { title: "judge LLM", sub: "gpt-4o-mini · temp 0", tone: "accent" },
      { title: "scores", sub: "accuracy + groundedness" },
      { title: "results json", sub: "per run" },
    ],
  },
];

const toneClass: Record<NonNullable<Node["tone"]>, string> = {
  ink: "border-ink bg-card",
  accent: "border-accent bg-accent/5",
  store: "border-live/60 bg-live/5",
};

function FlowNode({ node }: { node: Node }) {
  return (
    <div
      className={`min-w-[7.5rem] flex-1 rounded-md border px-2.5 py-1.5 text-center ${toneClass[node.tone ?? "ink"]}`}
    >
      <p className="font-mono text-[0.62rem] font-semibold leading-tight text-ink">
        {node.title}
      </p>
      {node.sub && (
        <p className="mt-0.5 font-mono text-[0.52rem] leading-tight text-muted">
          {node.sub}
        </p>
      )}
    </div>
  );
}

export function RagArchitecture() {
  return (
    <div className="space-y-4">
      {pipelines.map((p) => (
        <div key={p.label} className="rounded-lg border border-line bg-card/60 p-3">
          <div className="mb-2 flex items-baseline gap-2">
            <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-widest text-accent">
              {p.label}
            </span>
            <span className="font-mono text-[0.55rem] uppercase tracking-wider text-muted">
              {p.cadence}
            </span>
          </div>
          {/* vertical flow on mobile, horizontal on md+ */}
          <div className="flex flex-col items-stretch gap-1.5 md:flex-row md:items-center">
            {p.nodes.map((node, i) => (
              <div
                key={node.title}
                className="flex flex-col items-stretch md:flex-1 md:flex-row md:items-center"
              >
                <FlowNode node={node} />
                {i < p.nodes.length - 1 && (
                  <span
                    aria-hidden
                    className="self-center py-0.5 font-mono text-xs text-ink/40 md:px-1 md:py-0"
                  >
                    <span className="md:hidden">↓</span>
                    <span className="hidden md:inline">→</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
