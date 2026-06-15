# STATE — pick up here

> **For any Claude instance:** read `docs/README.md` (hub spec + decisions) and
> `docs/DESIGN-BRIEF.md` (visual system + extensibility contract) BEFORE
> touching code. This file tracks what's done and what's next. Update it at
> the end of every working session.

**Last updated:** 2026-06-15 (session 3 — safety eval added to /assistant)

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

### Done (session 2, 2026-06-15) — `/assistant` shipped

The HR Onboarding RAG Assistant page: a STATIC case study (not a live chatbot, by design), all driven by real eval data.

- [x] **Vendored eval data:** `src/data/hr-eval-results.json` (the live run, `results-2026-06-14T20-42-31.json` from `github.com/FlowFusionAI/hr-onboarding-rag`). Fetched and repaired by `scripts/vendor-eval.py` (re-runnable): the source had cp1252 double-encoding mojibake (`Â£`→£, `Ã—`→×) in `sources`/`expected_answer`/`rag_answer`. Repair touches encoding only: numbers, scores, wording unchanged (asserted in the script). Zero markers remain.
- [x] **`src/data/hr-eval.ts`** — typed loader + all aggregates computed FROM the JSON (97% pass 29/30, 4.87/4.87, difficulty 18/9/3, category breakdown). `BASELINE` constant traces to the real Jun-12 mock run `results-2026-06-12T15-37-38.json` (17%, 1.73, 2.07, 5/30).
- [x] **`EvalDashboard.tsx`** — headline count-ups (reduced-motion safe via `CountUp.tsx`), baseline→live progression bars (+80pp), by-difficulty tiles.
- [x] **`EvalReplay.tsx`** — REUSABLE transcript replay (props-driven, no JSON import, zero network). Filterable list (difficulty + category chips), 3 suggested questions, detail panel: question, grounded answer, retrieved chunks (collapsible), judge accuracy+groundedness with reasoning + score pips, expected/source. Built generic so Floor Manager's eval can reuse it.
- [x] **`RagArchitecture.tsx`** — code-drawn (CSS/flex) 3-pipeline diagram (ingestion/query/eval), per the brief's "draw it, don't screenshot it" rule. No architecture PNG existed in the repo (only mermaid).
- [x] **Workflow screenshot:** `public/rag-workflow.png` (the n8n canvas, fetched from the repo) shown via `ZoomImage`.
- [x] **Spec sidebar** reuses the `/triage` "what am i looking at?" clipboard pattern (problem, pipeline, eval methodology, result, stack, repo link).
- [x] **Config contract:** flipped `rag-assistant` to `status:"live"` + `route:"/assistant"` (removed `shipTarget`) in `src/data/projects.ts`. Floor renders it as a live clickable node, the ATS→rag edge goes solid+animated, StatusBar auto-updated to "3 live", home links to `/assistant`. Verified in the prerendered HTML. Updated the hardcoded OG count in `layout.tsx` (2 live/3 build → 3 live/2 build).
- [x] `npm run build` green (Next 16, Turbopack); `/assistant` prerenders static; `next start` smoke test: `/`, `/assistant`, `/triage` all 200.

### Done (session 3, 2026-06-15) — safety eval added to `/assistant`

Surfaced the repo's Phase 5 (input guardrail + adversarial safety eval) on the page. All driven by the vendored adversarial JSON.

- [x] **Vendored safety data:** `src/data/hr-eval-safety-results.json` from `eval/adversarial-results-2026-06-15T17-07-59.json` (10 cases, 7 attack types, 10/10 safe, 0 breaches). Run through `scripts/vendor-eval.py` (no mojibake in this file; repair is a no-op but kept for consistency).
- [x] **`hr-eval.ts` extended:** `SafetyResult` type, `safetyResults`, `safetySummary` (safeRate/safeCount/total), `attackTypeBreakdown` + `ATTACK_TYPE_COUNT`, and `FUNCTIONAL_REGRESSION` constant tracing to `results-2026-06-15T16-52-34.json` (97% / 4.87 / 4.87 unchanged, 0/30 legit questions blocked).
- [x] **`SafetyEval.tsx`** (server component, uses `CountUp`): 3 headline tiles (100% safe 10/10 · 7 attack types · 0/30 blocked), a "guardrail" + "the finding" explainer pair (the harmful-intent-vs-scope nuance: ADV01 weather-poem injection scored 0.1 and was caught by grounding, not the guardrail), and a native `<details>` accordion of all 10 cases (hostile input, what it tests, system response, safety-judge verdict + reasoning).
- [x] **`RagArchitecture.tsx`** updated: guardrail node (jailbreak + nsfw, dashed `guard` tone) inserted in the query pipeline with a fail-closed note; eval split into "functional eval" + new "safety eval" (adversarial slice → binary safety judge → safe rate) tracks.
- [x] **Page wiring:** new `#safety` section between transcript replay and "How it actually runs"; intro + metadata mention the guardrail/10-of-10; sidebar "the pipeline" now starts with the guardrail step; new "safety" methodology entry in the spec sheet; "See the safety eval" jump link added.
- [x] **Decision:** kept the functional transcript on the 06-14 run (06-15 run is byte-identical in metrics and also mojibake-free; no churn for identical numbers). Functional eval data unchanged.
- [x] `npm run build` green; safety content confirmed in prerendered HTML; `next start` smoke test: `/`, `/assistant` 200.

**Also this session — site logo.** `src/components/Logo.tsx` (SK monogram styled as a Floor node: rounded badge + amber live-dot, colours via tokens) added to `Nav.tsx`. `src/app/icon.svg` favicon (same mark, literal hex as a standalone asset); removed the stock Next `favicon.ico` so modern browsers use the SVG. Verified the `<link rel="icon" type="image/svg+xml">` tag and that no `favicon.ico` is referenced.

### Assets — resolved this session

- **Walkthrough:** Saurav converted the 21.6 MB video to a GIF in the repo (`rag-workflow-gif.gif`, 1.24 MB, 800×424). Vendored to `public/rag-workflow.gif`. Shown via `WorkflowPlayer.tsx` (CLICK-TO-PLAY, not autoplay) so it respects `prefers-reduced-motion` and stays off the initial page load. No video committed.
- **Workflow screenshot:** updated version vendored to `public/rag-workflow.png` (now 2116×510); page dims updated to match.

### Pending from Saurav

1. **Data-integrity issue to reconcile upstream (not blocking this page).** The repo's `docs/eval-results.md` "Run 3" narrative says the one non-pass is **Q29** (hard, offboarding, borderline 4/4). The actual results JSON it links to says the miss is **Q24** (easy, benefits, 1/1 — a safe abstention), and Q29 PASSED 5/5. The page uses the JSON (the task's designated source of truth), so it is correct, but the doc narrative is stale/contradictory and should be fixed in that repo.

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
| 2026-06-15 | Claude Code | Added the safety eval to `/assistant`: reviewed the repo's Phase 5 commit (input guardrail, jailbreak+NSFW, fail-closed + adversarial slice), vendored the adversarial results JSON, built `SafetyEval.tsx`, added the guardrail to the architecture diagram, and wired a `#safety` section + sidebar/methodology/intro updates. Build green, content verified in prerender. Not committed yet. |
| 2026-06-15 | Claude Code | Shipped `/assistant` (HR Onboarding RAG eval case study). Vendored + mojibake-repaired the live eval JSON, built EvalDashboard + reusable EvalReplay + code-drawn RagArchitecture + CountUp, flipped rag-assistant ghost→live (contract verified: live node, 3-live status bar, home link). Build green, routes 200. Pending from Saurav: walkthrough video embed URL. Flagged a stale Q29-vs-Q24 inconsistency in the source repo's eval-results.md (page follows the JSON). |
| 2026-06-10 | Claude Code (same session) | Roadmap change: former "Business-Ops MCP Server" project merged with a new autonomous-agent build into **"Floor Manager (Ops Agent + MCP)"** — hand-rolled TS agent loop over a custom MCP server, HITL gates, bounded budgets, decision traces, 20-scenario eval. Floor node renamed (`mcp-server` → `floor-manager`), Triage edge relabelled "operated by", future route is `/agent` (flight-recorder trace replay, not live runs). Spec: career-ops `projects/floor-manager/project-context.md`. docs/README.md updated to match. |

### Writing rule (permanent)
**No em dashes (—) anywhere in site copy.** Saurav's rule. Use a colon, parentheses, comma/semicolon, or a middot (·) for label separators. Applies to all future copy on this site.
