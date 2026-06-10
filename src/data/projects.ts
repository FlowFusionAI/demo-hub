/**
 * THE single source of truth for every project on the site.
 *
 * The Floor canvas, status bar counts, and home grid all render from this
 * array. Adding a future project = one entry here (+ a demo route when it
 * ships). Flipping a ghost node live = change `status` and add `route`.
 * NO layout surgery, ever. See docs/DESIGN-BRIEF.md "Extensibility contract".
 *
 * Node coordinates are on a 1000x560 canvas (desktop Floor viewBox).
 * Mobile ignores coordinates and stacks nodes in array order.
 */

export type ProjectStatus = "live" | "in-build" | "client-work";

export type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
  oneLiner: string;
  stack: string[];
  node: { x: number; y: number };
  edges: { to: string; label: string }[];
  /** Demo page route (only when live) */
  route?: string;
  /** External link (client work case study) */
  external?: string;
  /** e.g. "Aug 2026" (shown on ghost node stamps) */
  shipTarget?: string;
};

export const projects: Project[] = [
  {
    id: "ats",
    title: "Smile Cliniq ATS + Onboarding",
    status: "client-work",
    oneLiner:
      "Full-stack ATS and onboarding platform for a London dental clinic. 350+ applicants processed, 15–20 hrs/week saved, run by one person.",
    stack: ["Next.js", "Airtable", "Make.com", "Cal.com"],
    node: { x: 150, y: 120 },
    edges: [
      { to: "screening", label: "extends" },
      { to: "rag-assistant", label: "same domain" },
    ],
    external: "https://portfolio-peach-xi-48.vercel.app",
  },
  {
    id: "triage",
    title: "AI Intake Triage Agent",
    status: "live",
    oneLiner:
      "Tickets in, decisions out: LLM classification with a confidence gate. Uncertain tickets go to a human, the rest route themselves.",
    stack: ["n8n", "GPT-4o-mini", "Airtable", "Slack"],
    node: { x: 430, y: 390 },
    edges: [{ to: "mcp-server", label: "tools" }],
    route: "/triage",
  },
  {
    id: "rag-assistant",
    title: "HR Onboarding Assistant",
    status: "in-build",
    oneLiner:
      "RAG over an employee handbook with a published eval harness: measured answer accuracy, not vibes.",
    stack: ["n8n", "pgvector", "Supabase", "OpenAI"],
    node: { x: 150, y: 390 },
    edges: [],
    shipTarget: "Jul 2026",
  },
  {
    id: "screening",
    title: "Applicant Screening Copilot",
    status: "in-build",
    oneLiner:
      "JD in, ranked shortlist out: rubric-based scoring with evidence quotes and a bias guardrail that redacts identity signals.",
    stack: ["Next.js", "TypeScript", "OpenAI"],
    node: { x: 680, y: 120 },
    edges: [],
    shipTarget: "Aug 2026",
  },
  {
    id: "mcp-server",
    title: "Business-Ops MCP Server",
    status: "in-build",
    oneLiner:
      "The ticket system, exposed as agent tools: Claude triages, summarises, and closes tickets by natural language.",
    stack: ["TypeScript", "MCP SDK", "Airtable"],
    node: { x: 770, y: 390 },
    edges: [],
    shipTarget: "Sep 2026",
  },
];

export const liveCount = projects.filter(
  (p) => p.status === "live" || p.status === "client-work"
).length;

export const systemCount = projects.length;

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
