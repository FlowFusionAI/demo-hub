@AGENTS.md

# Demo Hub — read this first

This is Saurav KC's recruiter-facing portfolio + live demo site ("The Operations Floor").

**Before writing ANY code, read in this order:**
1. `docs/STATE.md` — what's done, what's next, where to pick up
2. `docs/README.md` — hub spec: architecture, the no-signup decision, per-demo surface specs, narrative spine
3. `docs/DESIGN-BRIEF.md` — visual system, motion spec, and the extensibility contract

**Hard rules:**
- All projects render from `src/data/projects.ts` — adding/shipping a project is a config change, never layout surgery
- No signup/email gates anywhere, ever (guardrails instead: rate limits, sample data, spend caps)
- Real metrics only — never invent numbers
- Palette/fonts come from `globals.css` tokens — no hardcoded hex in components
- Light mode only; respect `prefers-reduced-motion`
- Update `docs/STATE.md` before ending a session

The wider career context (CV, job pipeline, project roadmap) lives in a separate
repo: `c:\Users\saura\Desktop\Professional\career-ops` — see `projects/README.md`
and `projects/demo-hub/` there (original spec + design brief; copies live in this
repo's `docs/`).
