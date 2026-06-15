import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ZoomImage } from "@/components/ZoomImage";
import { EvalDashboard } from "@/components/EvalDashboard";
import { EvalReplay } from "@/components/EvalReplay";
import { SafetyEval } from "@/components/SafetyEval";
import { RagArchitecture } from "@/components/RagArchitecture";
import { WorkflowPlayer } from "@/components/WorkflowPlayer";
import { getProject } from "@/data/projects";
import { evalResults, liveSummary, REPO_URL } from "@/data/hr-eval";

export const metadata: Metadata = {
  title: "HR Onboarding RAG Assistant · Eval Case Study | Saurav KC",
  description:
    "A RAG assistant over an employee handbook, measured against a 30-question golden set: 97% pass, 4.87/5 accuracy and groundedness, plus a fail-closed input guardrail scoring 10/10 on an adversarial safety eval. Step through every answer, the retrieved chunks, and the judge's scoring.",
};

const SUGGESTED_IDS = ["Q01", "Q29", "Q24"];

export default function AssistantPage() {
  const project = getProject("rag-assistant")!;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        {/* zoomed-node header */}
        <div className="mb-8 flex flex-wrap items-center gap-3 font-mono text-[0.68rem] uppercase tracking-widest text-muted">
          <a href="/#floor" className="hover:text-ink hover:underline">
            ← the floor
          </a>
          <span>/</span>
          <span className="flex items-center gap-1.5 text-live">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-live" />
            {project.id} · live
          </span>
        </div>

        {/* Title */}
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {project.title}
          </h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
            RAG over a synthetic employee handbook, with a published eval
            harness. This is a case study, not a live chatbot: instead of a chat
            box you can step through the actual eval run, every grounded answer,
            the chunks the retriever returned, and the judge&apos;s reasoning.
            It is also adversarially tested: a fail-closed input guardrail,
            measured at 10/10 on a safety eval. Showing the machinery is more
            honest than a demo that only ever sees happy-path questions.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
            >
              View the repo →
            </a>
            <a
              href="#transcript"
              className="rounded-md border border-line bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
            >
              Jump to the transcripts
            </a>
            <a
              href="#safety"
              className="rounded-md border border-line bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
            >
              See the safety eval
            </a>
          </div>
        </div>

        {/* Eval dashboard (hero) */}
        <div className="mt-10">
          <EvalDashboard />
        </div>

        {/* Transcript replay */}
        <div id="transcript" className="mt-14 scroll-mt-20">
          <EvalReplay results={evalResults} suggestedIds={SUGGESTED_IDS} />
        </div>

        {/* Safety eval */}
        <div id="safety" className="mt-14 scroll-mt-20">
          <SafetyEval />
        </div>

        {/* Workflow + architecture + spec sidebar */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              How it actually runs
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              The query pipeline is an n8n workflow: embed the question, search
              pgvector for the closest chunks, build a constrained prompt, and
              let GPT-4o-mini answer only from what was retrieved.
            </p>

            {/* Workflow screenshot */}
            <figure className="mt-5">
              <ZoomImage
                src="/rag-workflow.png"
                alt="The n8n RAG workflow canvas: webhook, embedding, pgvector retrieval, prompt builder, GPT-4o-mini, and response nodes"
                width={2116}
                height={510}
              />
              <figcaption className="mt-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted">
                the live n8n workflow · retrieval + generation + memory
              </figcaption>
            </figure>

            {/* Build walkthrough (animated GIF, click to play) */}
            <div className="mt-6">
              <p className="mb-2 font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-muted">
                build walkthrough
              </p>
              <WorkflowPlayer
                gif="/rag-workflow.gif"
                alt="Animated walkthrough of the RAG workflow running end to end in n8n"
                width={800}
                height={424}
              />
            </div>

            {/* Architecture (code-drawn) */}
            <div className="mt-8">
              <h3 className="font-display text-xl font-semibold">
                Three pipelines, decoupled
              </h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
                Ingestion, query, and evaluation each run independently. The
                eval pipeline calls the RAG endpoint as a black box, so quality
                is measured the same way every run.
              </p>
              <div className="mt-4">
                <RagArchitecture />
              </div>
            </div>
          </div>

          {/* Spec sheet sidebar */}
          <aside className="h-fit rounded-lg border border-line bg-card p-5 lg:sticky lg:top-20">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-accent">
              what am i looking at?
            </p>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">
                  the problem
                </dt>
                <dd className="mt-1 leading-relaxed text-ink/85">
                  New hires ask the same handbook questions for weeks. A RAG
                  assistant answers them, but most RAG demos measure nothing:
                  they look fine on the questions the builder chose. The
                  engineering here is the eval harness that proves it works.
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">
                  the pipeline
                </dt>
                <dd className="mt-1 font-mono text-[0.72rem] leading-loose text-ink/80">
                  question → guardrail
                  <br />&nbsp;&nbsp;&nbsp;(jailbreak + nsfw,
                  <br />&nbsp;&nbsp;&nbsp;fail-closed)
                  <br />→ embed question
                  <br />→ pgvector cosine search
                  <br />→ top-3 chunks
                  <br />→ prompt (system + chunks + q)
                  <br />→ gpt-4o-mini (answer only
                  <br />&nbsp;&nbsp;&nbsp;from retrieved chunks)
                  <br />→ grounded answer + sources
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">
                  the eval methodology
                </dt>
                <dd className="mt-1 leading-relaxed text-ink/85">
                  A 30-question golden set across 14 categories and 3 difficulty
                  tiers. A second LLM (the judge) scores each answer on two
                  independent dimensions: accuracy (is it factually right) and
                  groundedness (is every claim traceable to a retrieved chunk). A
                  question passes only when both are at least 4 of 5. Splitting
                  the dimensions catches the dangerous case: a correct-sounding
                  answer the model guessed rather than retrieved.
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">
                  safety
                </dt>
                <dd className="mt-1 leading-relaxed text-ink/85">
                  A separate adversarial suite (10 cases, 7 attack types) scored
                  by a binary safety judge: pass means the system refused. A
                  fail-closed guardrail blocks jailbreak and NSFW input before
                  any model call. Result: 10/10 safe, 0 breaches, and 0 of the 30
                  legitimate questions blocked.
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">
                  result
                </dt>
                <dd className="mt-1 leading-relaxed text-ink/85">
                  {liveSummary.passRate}% pass ({liveSummary.passes}/
                  {liveSummary.n}), {liveSummary.avgAccuracy.toFixed(2)}/5
                  accuracy, {liveSummary.avgGroundedness.toFixed(2)}/5
                  groundedness. The one miss is a safe abstention, not a
                  hallucination.
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">
                  stack
                </dt>
                <dd className="mt-1.5 flex flex-wrap gap-1">
                  {project.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[0.62rem] text-muted"
                    >
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
              <div className="border-t border-dashed border-line pt-3">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[0.68rem] font-semibold uppercase tracking-widest text-accent hover:underline"
                >
                  repository →
                </a>
              </div>
            </dl>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
