# STATE — pick up here

> **For any Claude instance:** read `docs/README.md` (hub spec + decisions) and
> `docs/DESIGN-BRIEF.md` (visual system + extensibility contract) BEFORE
> touching code. This file tracks what's done and what's next. Update it at
> the end of every working session.

**Last updated:** 2026-06-10 (session 1 — built, pushed, DEPLOYED)

---

## Current status: v1 LIVE at https://portfolio.flowfusionai.com

Deployed by Saurav via Vercel (GitHub import, branch `master`, custom subdomain).
Running in demo-mock mode until `N8N_TRIAGE_WEBHOOK_URL` is set in Vercel env.
`npm run build` passes. `npm run dev` to work locally.

### Done (session 1, 2026-06-10)

- [x] Design tokens in `src/app/globals.css` (Tailwind v4 `@theme` — palette, dot grid, stamp, annotation, receipt edge). Light mode only by design.
- [x] Fonts in `layout.tsx`: Fraunces (display) / Inter (body) / IBM Plex Mono (system labels) / Caveat (hand annotations)
- [x] `src/data/projects.ts` — THE config contract. 5 projects: ats (client-work), triage (live), rag-assistant + screening + mcp-server (in-build ghosts)
- [x] `/api/triage` route: per-IP sliding-window rate limit (10/min, verified returns 429), proxies to `N8N_TRIAGE_WEBHOOK_URL` env, **mock classifier fallback** so demo never dies
- [x] Home page: Nav, Hero (auto-demo types a sample ticket after 4.5s idle; form → packet → receipt sequence), StatusBar (counts derive from config), Floor (desktop SVG canvas with SMIL packet animation + hover spec cards; mobile vertical spine), Operator (portrait + testimonial + CTAs), Footer
- [x] `/triage` page: sample-ticket chips, submit form, full admin view (confidence-gate callout, draft response, internal notes), spec-sheet sidebar, screenshot placeholder slots
- [x] Reduced-motion support (motion's `useReducedMotion` + `motion-reduce:hidden` on SMIL packets)
- [x] **Ghost→live flip verified:** changed rag-assistant to `status:"live"` + `route` → build passed → reverted. The contract works.
- [x] `next.config.ts`: `turbopack.root` pinned (repo nested under folders with other lockfiles)

### NOT done — next session picks up here (in priority order)

1. **Real screenshots:** Saurav must export 2 screenshots from the live n8n system → `public/triage-slack.png` (Slack Block Kit message) + `public/triage-airtable.png` (Airtable record). Then replace the `ScreenshotSlot` placeholders in `src/app/triage/page.tsx` with `next/image`.
2. **Connect the real webhook:** set `N8N_TRIAGE_WEBHOOK_URL` in Vercel env (+ `.env.local` for dev). The n8n workflow must return the classification JSON in its webhook response (it already does — see career-ops `projects/AI Intake Triage/README.md`). Verify shape matches `TriageResult`, then redeploy and confirm the "live pipeline" stamp replaces "demo mode" on /triage.
3. **OG image:** `src/app/opengraph-image.tsx` with `ImageResponse` — name + tagline over the Floor motif / operator-desk.png. NO generated-image text. Check the share card with an OG preview tool after deploy.
4. **Lighthouse on the live URL:** ≥90 performance / ≥95 accessibility desktop (brief's hard gate). The SMIL animations and font count are the likely suspects if perf misses.
5. **Distribution (Ship Checklist items, career-ops `projects/README.md`):** hub URL onto CV + LinkedIn featured section (career-ops `config/profile.yml` already updated to portfolio.flowfusionai.com); Loom walkthrough; LinkedIn launch post.
6. **Triage repo public:** publish the n8n workflow repo and point the /triage sidebar "repository →" link at it (currently points to the GitHub profile).

### Done since (deployment)

- [x] Pushed to github.com/FlowFusionAI/demo-hub (`master`)
- [x] Vercel deploy + custom subdomain: **https://portfolio.flowfusionai.com** (Saurav, 2026-06-10)
- [x] Visual review by Saurav (z-order + annotation fixes applied, em dashes removed)

### Known judgement calls (don't re-litigate without reason)

- ATS node links OUT to https://portfolio-peach-xi-48.vercel.app for now — an internal case-study page can replace it later.
- Screening Copilot API routes will live in this app when built (decided; see brief).
- Repo link in /triage sidebar points to the GitHub profile until the triage repo is public — update it then.
- Mock classifier is keyword-based on purpose (free, instant, deterministic-ish). Don't replace it with a real LLM call; the real call is the n8n webhook.

### Conventions

- New demo = new entry in `src/data/projects.ts` + route folder + spec sidebar following `/triage`'s two-column pattern.
- Palette/typography come from `globals.css` tokens only — never hardcode hex values in components.
- Real metrics only. The status bar numbers trace to the Smile Cliniq engagement.
- Update THIS file before ending any session.

---

## Session log

| Date | Who | What |
|---|---|---|
| 2026-06-10 | Claude Code (career-ops session) | Initial v1 build: all components, API route, config contract, flip verification. Build green, smoke-tested API (classification + 429s) and both pages (200). Not yet visually reviewed or deployed. |
| 2026-06-10 | Claude Code (same session) | Saurav visually reviewed: approved. Fixes: hover spec cards now z-index above the testimonial annotation (active node z-30); testimonial annotation moved from mid-left to top strip (was colliding with the "same domain" edge label and the ATS hover card) and made pointer-events-none. Removed ALL em dashes from site copy per Saurav's writing rules (use colon/parens/comma/middot instead; en dashes in numeric ranges like 15-20 also normalised to hyphen in copy). Pushed to origin. |
| 2026-06-10 | Saurav + Claude Code | DEPLOYED: Vercel import + custom subdomain https://portfolio.flowfusionai.com (mock mode until webhook env var set). Repo folder moved from `career-ops/demo-hub/` to `C:\Users\saura\Desktop\Personal\Projects\2026\demo-hub\` (source-code convention; Vercel deploys from GitHub so the live site is unaffected). career-ops profile.yml portfolio_url now points at the hub. |
| 2026-06-10 | Claude Code (same session) | Roadmap change: former "Business-Ops MCP Server" project merged with a new autonomous-agent build into **"Floor Manager (Ops Agent + MCP)"** — hand-rolled TS agent loop over a custom MCP server, HITL gates, bounded budgets, decision traces, 20-scenario eval. Floor node renamed (`mcp-server` → `floor-manager`), Triage edge relabelled "operated by", future route is `/agent` (flight-recorder trace replay, not live runs). Spec: career-ops `projects/floor-manager/project-context.md`. docs/README.md updated to match. |

### Writing rule (permanent)
**No em dashes (—) anywhere in site copy.** Saurav's rule. Use a colon, parentheses, comma/semicolon, or a middot (·) for label separators. Applies to all future copy on this site.
