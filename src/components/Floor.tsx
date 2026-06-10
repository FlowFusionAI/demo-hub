"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { projects, type Project } from "@/data/projects";
import { Stamp } from "./Stamp";

const W = 1000;
const H = 560;

function edgePath(from: Project, to: Project): string {
  const { x: x1, y: y1 } = from.node;
  const { x: x2, y: y2 } = to.node;
  // gentle quadratic curve between node centres
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + (y1 === y2 ? 26 : 0);
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

function NodeCard({
  project,
  open,
  onToggle,
}: {
  project: Project;
  open: boolean;
  onToggle: (id: string | null) => void;
}) {
  const isGhost = project.status === "in-build";

  const box = (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`w-[180px] rounded-lg border-2 px-3 py-2.5 text-left ${
        isGhost
          ? "border-dashed border-ink/35 bg-paper/70"
          : "border-ink bg-card shadow-[0_2px_12px_rgba(28,28,46,0.08)]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[0.58rem] font-semibold uppercase tracking-widest text-muted">
          {project.id}
        </span>
        {project.status === "live" && (
          <span className="flex items-center gap-1 font-mono text-[0.55rem] font-semibold uppercase tracking-widest text-live">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-live" />
            live
          </span>
        )}
        {project.status === "client-work" && (
          <Stamp tone="ink" tilt={-3} className="!text-[0.5rem]">
            client work
          </Stamp>
        )}
        {isGhost && (
          <Stamp tone="accent" tilt={3} className="!text-[0.5rem]">
            in build
          </Stamp>
        )}
      </div>
      <p
        className={`mt-1.5 font-display text-[0.85rem] font-semibold leading-snug ${
          isGhost ? "text-ink/60" : "text-ink"
        }`}
      >
        {project.title}
      </p>
      {isGhost && project.shipTarget && (
        <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-widest text-muted">
          shipping {project.shipTarget}
        </p>
      )}
    </motion.div>
  );

  const interactionProps = {
    onMouseEnter: () => onToggle(project.id),
    onMouseLeave: () => onToggle(null),
  };

  if (project.route) {
    return (
      <Link href={project.route} {...interactionProps} className="block">
        {box}
      </Link>
    );
  }
  if (project.external) {
    return (
      <a
        href={project.external}
        target="_blank"
        rel="noopener noreferrer"
        {...interactionProps}
        className="block"
      >
        {box}
      </a>
    );
  }
  return (
    <button
      type="button"
      {...interactionProps}
      onClick={() => onToggle(open ? null : project.id)}
      className="block cursor-help"
    >
      {box}
    </button>
  );
}

function SpecCard({ project }: { project: Project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.16 }}
      className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg border border-line bg-card p-3 text-left shadow-[0_6px_24px_rgba(28,28,46,0.14)]"
    >
      <p className="text-[0.8rem] leading-relaxed text-ink/85">
        {project.oneLiner}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[0.58rem] text-muted"
          >
            {s}
          </span>
        ))}
      </div>
      <p className="mt-2 font-mono text-[0.6rem] font-semibold uppercase tracking-widest">
        {project.route && <span className="text-accent">open demo →</span>}
        {project.external && <span className="text-ink/70">case study ↗</span>}
        {!project.route && !project.external && (
          <span className="text-muted">in build · spec locked</span>
        )}
      </p>
    </motion.div>
  );
}

export function Floor() {
  const [openId, setOpenId] = useState<string | null>(null);

  const edges = projects.flatMap((from) =>
    from.edges.map((e) => {
      const to = projects.find((p) => p.id === e.to);
      if (!to) return null;
      const animated =
        from.status === "live" || from.status === "client-work";
      return { from, to, label: e.label, animated, key: `${from.id}-${e.to}` };
    })
  ).filter(Boolean) as {
    from: Project;
    to: Project;
    label: string;
    animated: boolean;
    key: string;
  }[];

  return (
    <section id="floor" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
              the floor
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Five systems. One story.
            </h2>
          </div>
          <p className="annotation rotate-1">
            each box is a real system, dashed ones are on the bench ↘
          </p>
        </div>

        {/* Desktop canvas */}
        <div
          className="dot-grid relative hidden w-full rounded-xl border border-line bg-paper md:block"
          style={{ aspectRatio: `${W}/${H}` }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            {edges.map(({ from, to, label, animated, key }) => {
              const d = edgePath(from, to);
              const toGhost = to.status === "in-build";
              return (
                <g key={key}>
                  <path
                    d={d}
                    fill="none"
                    stroke="var(--ink)"
                    strokeOpacity={toGhost ? 0.3 : 0.5}
                    strokeWidth={1.5}
                    strokeDasharray={toGhost ? "6 5" : undefined}
                  />
                  <text
                    x={(from.node.x + to.node.x) / 2}
                    y={(from.node.y + to.node.y) / 2 + (from.node.y === to.node.y ? 24 : -10)}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize={11}
                    fill="var(--muted)"
                    stroke="var(--paper)"
                    strokeWidth={4}
                    paintOrder="stroke"
                    letterSpacing={1}
                  >
                    {label}
                  </text>
                  {animated && (
                    <g className="motion-reduce:hidden">
                      {[0, 1.4].map((delay) => (
                        <circle key={delay} r={4} fill="var(--accent)">
                          <animateMotion
                            dur="3.2s"
                            begin={`${delay}s`}
                            repeatCount="indefinite"
                            path={d}
                          />
                        </circle>
                      ))}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {projects.map((p) => (
            <div
              key={p.id}
              className="absolute"
              style={{
                left: `${(p.node.x / W) * 100}%`,
                top: `${(p.node.y / H) * 100}%`,
                transform: "translate(-50%, -50%)",
                zIndex: openId === p.id ? 30 : 10,
              }}
            >
              <div className="relative">
                <NodeCard
                  project={p}
                  open={openId === p.id}
                  onToggle={setOpenId}
                />
                <AnimatePresence>
                  {openId === p.id && <SpecCard project={p} />}
                </AnimatePresence>
              </div>
            </div>
          ))}

          {/* testimonial margin note: top strip, clear of nodes, edge labels,
              and hover cards (which sit at zIndex 30) */}
          <p
            className="annotation pointer-events-none absolute z-0 -rotate-2"
            style={{ left: "31%", top: "4%", maxWidth: 240 }}
          >
            “saved us countless hours… couldn&apos;t have asked for more”
            <br />(ops manager, Smile Cliniq)
          </p>
        </div>

        {/* Mobile: vertical spine */}
        <div className="relative md:hidden">
          <div className="absolute bottom-4 left-[13px] top-4 w-px bg-ink/25" />
          <div className="flex flex-col gap-4">
            {projects.map((p) => (
              <div key={p.id} className="relative pl-9">
                <span
                  className={`absolute left-[8px] top-6 h-[11px] w-[11px] rounded-full border-2 ${
                    p.status === "in-build"
                      ? "border-dashed border-ink/40 bg-paper"
                      : "border-ink bg-accent"
                  }`}
                />
                <div className="relative">
                  <NodeCardMobile project={p} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NodeCardMobile({ project }: { project: Project }) {
  const isGhost = project.status === "in-build";
  const inner = (
    <div
      className={`rounded-lg border-2 p-4 ${
        isGhost
          ? "border-dashed border-ink/35 bg-paper/70"
          : "border-ink bg-card"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-base font-semibold">{project.title}</p>
        {project.status === "live" && (
          <span className="flex shrink-0 items-center gap-1 font-mono text-[0.6rem] font-semibold uppercase tracking-widest text-live">
            <span className="h-1.5 w-1.5 rounded-full bg-live" /> live
          </span>
        )}
        {project.status === "client-work" && (
          <Stamp tone="ink" tilt={-2} className="shrink-0">
            client
          </Stamp>
        )}
        {isGhost && (
          <Stamp tone="accent" tilt={2} className="shrink-0">
            in build
          </Stamp>
        )}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        {project.oneLiner}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[0.6rem] text-muted"
          >
            {s}
          </span>
        ))}
      </div>
      {(project.route || project.external) && (
        <p className="mt-2 font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-accent">
          {project.route ? "open demo →" : "case study ↗"}
        </p>
      )}
      {isGhost && project.shipTarget && (
        <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-widest text-muted">
          shipping {project.shipTarget}
        </p>
      )}
    </div>
  );
  if (project.route) return <Link href={project.route}>{inner}</Link>;
  if (project.external)
    return (
      <a href={project.external} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  return inner;
}
