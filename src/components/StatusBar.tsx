import { liveCount, systemCount } from "@/data/projects";

/**
 * Real data only: never invent metrics here.
 * Source of the client metrics: Smile Cliniq engagement (see docs/README.md).
 */
const items = [
  `${systemCount} systems`,
  `${liveCount} live`,
  "350+ applicants processed",
  "15–20 hrs/wk saved for a real clinic",
  "Reading, UK · open to relocate",
];

export function StatusBar() {
  return (
    <div className="border-y border-line bg-card/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-5 py-2 font-mono text-[0.68rem] uppercase tracking-wider text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-live" />
          operational
        </span>
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
