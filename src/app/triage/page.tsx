import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { TriageDemo } from "@/components/TriageDemo";
import { ZoomImage } from "@/components/ZoomImage";
import { getProject } from "@/data/projects";

export const metadata: Metadata = {
  title: "AI Intake Triage Agent · Live Demo | Saurav KC",
  description:
    "Submit a ticket and watch an LLM classify, gate, and route it, live. n8n + GPT-4o-mini + Airtable + Slack, with a confidence threshold protecting against silent mis-routing.",
};

export default function TriagePage() {
  const project = getProject("triage")!;

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

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Demo surface */}
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {project.title}
            </h1>
            <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted">
              {project.oneLiner} Submit anything below (billing problem,
              angry complaint, feature request) and watch the admin view fill
              in.
            </p>
            <div className="mt-7">
              <TriageDemo />
            </div>

            {/* What you can't see from the browser */}
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold">
                Meanwhile, in the systems you can&apos;t see…
              </h2>
              <p className="mt-1 text-sm text-muted">
                Every classified ticket is persisted to Airtable and routed to
                the matching Slack channel with a Block Kit message. An hourly
                monitor alerts on SLA breaches.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <ZoomImage
                  src="/triage-slack.png"
                  alt="Slack Block Kit message showing a classified support ticket routed to the billing channel"
                  width={800}
                  height={500}
                />
                <ScreenshotSlot label="airtable record · enum-validated" />
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
                  Support inboxes are triaged by humans reading every message.
                  This agent classifies each ticket in one structured LLM
                  call, but never silently: low-confidence classifications are
                  diverted to human review instead of auto-routed.
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">
                  the flow
                </dt>
                <dd className="mt-1 font-mono text-[0.72rem] leading-loose text-ink/80">
                  webhook → rate limiter
                  <br />→ gpt-4o-mini (json mode)
                  <br />→ airtable record
                  <br />→ confidence ≥ 0.65?
                  <br />&nbsp;&nbsp;├─ yes → #category channel
                  <br />&nbsp;&nbsp;└─ no → #needs-human-review
                  <br />+ hourly SLA breach monitor
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">
                  production thinking
                </dt>
                <dd className="mt-1 leading-relaxed text-ink/85">
                  Two independent validation layers: JSON enforced at the API
                  level, enums enforced by Airtable at write time. The intake
                  flow and SLA monitor are decoupled; neither can corrupt the
                  other.
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
                  href="https://github.com/FlowFusionAI"
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

function ScreenshotSlot({ label }: { label: string }) {
  return (
    <div className="flex aspect-[16/10] items-center justify-center rounded-lg border border-dashed border-ink/30 bg-paper">
      <span className="px-4 text-center font-mono text-[0.62rem] uppercase tracking-widest text-muted">
        {label}
        <br />
        <span className="text-ink/40">screenshot landing here soon</span>
      </span>
    </div>
  );
}
