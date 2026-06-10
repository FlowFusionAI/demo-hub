# Demo Hub — Design Brief: "The Operations Floor"

**Date:** 2026-06-10
**Status:** Approved direction
**Companion doc:** `README.md` in this folder (architecture, no-signup decision, per-demo specs, narrative spine) — the builder MUST read both files before writing code.
**Inspiration references (user-supplied, for mood only — DO NOT copy):** a red/ink editorial collage with fluid organic section shapes; an illustrated "café-shaped portfolio" where each mug is a project. What the user responded to in them: a single committed metaphor, warm illustrated charm, monospace labels, and bold editorial confidence.

---

## The concept

**The entire site is rendered as a living automation workflow — the kind of system Saurav actually builds — drawn in a warm, editorial, slightly hand-made style instead of cold dev-tool dark mode.**

Visitors don't scroll past screenshots of systems. They are standing inside one. The café portfolio said "each mug is a project." This site says **"each node is a system — two are live, three are being built. Watch the packets move."**

Why this metaphor is the right one (don't swap it for something generic):
- It IS his professional identity — an automation engineer whose portfolio is literally a workflow canvas. Nobody else's portfolio can honestly use it.
- The narrative spine documented in `README.md` (ATS → Triage → RAG → Screening → MCP) becomes the literal map on screen — the edges between nodes are the real relationships between the projects.
- **Future projects are solved natively:** unbuilt projects render as "ghost nodes" (dashed outline, IN BUILD stamp). Shipping a project = flipping one config field. The site never looks unfinished — it looks like a floor that's expanding.

---

## Visual identity

| Element | Spec |
|---|---|
| Background | Warm paper `#F7F4EF` with a subtle engineering-paper dot grid (`#E2DDD6`, low opacity) |
| Ink | Deep navy-ink `#1C1C2E` — all linework, body text. Strokes have a slightly imperfect, drawn quality (SVG `feTurbulence`/roughened paths used sparingly) |
| Accent | Amber `#E8803A` — packets, live signals, CTAs, hover states. ONLY on interactive/alive things |
| Status green | Muted `#5C8A64` — "LIVE" dots and healthy-system indicators only |
| Display type | A characterful grotesque or serif with personality (e.g. Clash Display, Fraunces, or Space Grotesk — builder picks ONE and commits) |
| System labels | Monospace (IBM Plex Mono or JetBrains Mono) — node names, statuses, the status bar, annotations. The mono/display contrast is the "quirky yet professional" axis |
| Quirk layer | Hand-written-style annotations with little arrows ("← this one saved a clinic 15 hrs/wk"), rubber-stamp badges (SHIPPED / IN BUILD / CLIENT WORK), sticker-like tilted tags. Max ~5 per viewport — charm, not clutter |
| Mode | Light only. No dark mode in v1. No gradients on backgrounds |

**Banned:** generic SaaS template look, purple-gradient AI clichés, stock 3D blobs, dark dev-tool aesthetic, emoji as design elements, anything that looks like a default shadcn page.

---

## Page-by-page

### 1. Hero — "watch one handle yours" (the 5-second wow)

A short headline and, beneath it, **a working intake ticket styled as a paper form**:

```
I build AI systems that handle
real business operations.

[ name ] [ what's the issue? ............ ]  [ SEND IT → ]
This form is a live system. Watch.
```

On submit (or via an auto-playing demo loop if the visitor doesn't type within ~4s): the form folds into a small paper ticket → becomes an amber packet → travels along an animated pipeline across the hero → enters a node stamped **TRIAGE** → the node pulses → a printed classification label slides out (category, urgency, confidence, draft response) like a receipt.

- Wired to the real n8n webhook via env var, with a **mock response fallback** so the animation works before the webhook is connected and when rate-limited.
- This doubles as the entry point to the full `/triage` demo ("see the full admin view →").

### 2. The Floor — the project map (centrepiece)

A large interactive SVG canvas drawing the five systems as nodes, connected by the REAL relationships from the narrative spine:

```
[Smile Cliniq ATS]────extends────►[Screening Copilot]
   CLIENT WORK · 2024–25                IN BUILD
        │
   (same domain)
        ▼
[RAG Onboarding Asst]      [Triage Agent]────tools────►[MCP Server]
      IN BUILD                LIVE ●                      IN BUILD
```

- **Live nodes:** solid ink outline, green LIVE dot, amber packets continuously flowing along their edges (SVG path + dash-offset animation). Hover: node lifts with a spring, a spec-card tooltip appears (one-liner, stack chips, "open demo →"). Click → demo route.
- **Ghost nodes:** dashed outline, paper slightly transparent, rubber stamp **IN BUILD — SHIPPING {month}**. Hover: teaser card with the planned one-liner from its `project-context.md`. NOT clickable to a dead page — clicking opens a small "what's coming" popover.
- **Client node (Smile Cliniq):** distinct CLIENT WORK stamp + the testimonial pull-quote nearby as a hand-annotated margin note. Links to the case-study section/page.
- Mobile: the canvas reflows to a vertical spine (top→bottom flow), packets still animate.

### 3. Status bar (persistent, bottom or under nav)

Monospace strip, real data only — never invented:
`5 systems · 2 live · 350+ applicants processed · 15–20 hrs/wk saved for a real clinic · Reading, UK · open to relocate`

### 4. Operator section (about)

Small section, not a CV dump: stylised portrait (see Asset plan), three lines of story (CS degree → Flow Fusion AI → 11-month client engagement → looking for a team), the testimonial in full, CTA row (email, LinkedIn, GitHub). Hand-written annotation near the portrait: "the operator".

### 5. Demo pages (`/triage` first; `/assistant`, `/screening`, `/mcp` later)

Same canvas language zoomed in: the page header shows the node "zoomed" with its edges trailing off-screen. Two-column: demo surface left, **"What am I looking at?" spec-sheet sidebar** right (styled as a clipboard: problem, architecture diagram, repo link, Loom link). Per-demo surface requirements are in `README.md` — follow them exactly.

---

## Motion spec

| Element | Behaviour |
|---|---|
| Hero ticket | Fold → packet → travel → stamp sequence, ~2.5s, ease-out; replayable; auto-demo loop when idle |
| Packets on edges | Continuous, 2–4 dots per live edge, varied speeds, `stroke-dashoffset`/`offset-path` |
| Node hover | Spring scale 1.04 + shadow deepen (stiffness ~300, damping ~20) |
| Stamps | "Thump" in on scroll-into-view: scale 1.4→1 with slight rotation, once |
| Section reveals | Fade-up 20px, `whileInView`, once |
| Reduced motion | `prefers-reduced-motion`: packets static, sequences replaced by crossfades — REQUIRED |

Tech: Framer Motion + hand-rolled SVG. No heavy animation libs, no Lottie unless an asset truly demands it. Lighthouse performance ≥ 90 desktop is a hard gate.

---

## Extensibility contract (the reason this brief exists — do not violate)

All projects are defined in ONE config file, `src/data/projects.ts`:

```ts
type Project = {
  id: string
  title: string
  status: 'live' | 'in-build' | 'client-work'
  oneLiner: string
  stack: string[]
  node: { x: number; y: number }        // position on the Floor canvas
  edges: { to: string; label: string }[] // real relationships only
  route?: string                         // demo page, when live
  shipTarget?: string                    // e.g. "Aug 2026" for ghost nodes
}
```

The Floor canvas, status bar counts, and home grid all render from this config. **Adding a future project = one config entry (+ a demo route when ready). Flipping ghost→live = changing `status` and adding `route`.** No layout surgery, ever. The builder must verify this works by flipping a ghost node live locally before calling v1 done.

---

## Asset plan (what to generate vs what to code)

**Code-drawn (SVG/CSS) — the default for everything:** nodes, edges, packets, stamps, ticket, annotations, diagrams. Reasons: crisp at every size, animatable, recolourable, and it visibly demonstrates frontend skill — generated images animate badly and read as pasted-in.

**Nano Banana (Gemini image gen) — exactly three jobs:**
1. **Stylised operator portrait** from Saurav's photo — ink-line + amber accent style matching the identity (prompt it with the hex palette and "single-weight ink line illustration on warm paper"). A face on the site measurably humanises it for recruiters.
2. **OG/social share image** (1200×630): the Floor map motif + name + "AI systems for business operations".
3. Optional: subtle paper-grain texture tile if CSS noise isn't enough.

Nothing else. If a visual can be drawn in SVG, it is.

---

## v1 Definition of Done

- [ ] Home: hero ticket sequence (mock fallback working), the Floor with 2 live + 3 ghost nodes from config, status bar, operator section, footer CTAs
- [ ] `/triage` demo page fully working per `README.md` spec
- [ ] Ghost→live config flip verified locally
- [ ] Mobile (375px) + desktop (1280px) clean; canvas reflows vertically on mobile
- [ ] `prefers-reduced-motion` path works
- [ ] Lighthouse ≥ 90 performance, ≥ 95 accessibility (desktop)
- [ ] Real data only in status bar and stamps — no invented metrics
- [ ] Deployed to Vercel on the custom domain
