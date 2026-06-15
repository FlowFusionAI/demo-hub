import Image from "next/image";

export function Operator() {
  return (
    <section className="border-t border-line bg-card/50">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[auto_1fr] md:gap-14 md:py-20">
        <div className="relative mx-auto w-56 md:w-64">
          <Image
            src="/operator-portrait.png"
            alt="Ink-line illustration of Saurav KC"
            width={512}
            height={512}
            className="rounded-xl border border-line"
            priority={false}
          />
          <p className="annotation absolute -right-6 -top-4 rotate-6">
            the operator ↓
          </p>
        </div>
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
            the operator
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Built alone. Ready for a team.
          </h2>
          <div className="mt-4 max-w-xl space-y-3 text-[0.95rem] leading-relaxed text-ink/85">
            <p>
              CS degree (University of Portsmouth, 2023). In late 2024 I
              founded Flow Fusion AI and ran an 11-month solo client
              engagement end to end: scoped, designed, built, shipped, and
              handed over a full ATS and onboarding platform for a London
              dental clinic.
            </p>
            <p>
              I&apos;ve proven I can deliver alone. Now I want to build at
              scale with a team and senior engineers to learn from.
            </p>
          </div>
          <blockquote className="mt-6 max-w-xl border-l-2 border-accent pl-4 text-[0.92rem] italic leading-relaxed text-muted">
            “Saurav built us a cost effective and time-saving Application
            Tracking System tailored to our needs and budget… The platform has
            saved us countless hours. I couldn&apos;t have asked for more.”
            <footer className="mt-2 font-mono text-[0.65rem] not-italic uppercase tracking-widest">
              Benji, Operations Manager, Smile Cliniq
            </footer>
          </blockquote>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="mailto:sauravkc456@gmail.com"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-105"
            >
              Email me →
            </a>
            <a
              href="https://www.linkedin.com/in/saurav-kc-045083200/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-ink px-5 py-2.5 text-sm font-medium transition-transform hover:scale-105"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/FlowFusionAI"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-ink px-5 py-2.5 text-sm font-medium transition-transform hover:scale-105"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
