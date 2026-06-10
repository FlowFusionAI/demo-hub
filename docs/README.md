# Demo Hub — Recruiter-Facing Showcase Site

**Status:** Approved concept (decided 2026-06-10), not started
**Repo:** will live on [github.com/FlowFusionAI](https://github.com/FlowFusionAI/demo-hub.git)
**Demo:** not deployed yet — target: custom domain (~£10/yr, e.g. `sauravkc.dev` or `demos.flowfusionai.com`)
**Decided with:** Saurav, session 2026-06-10

---

## What it is

A single Next.js site that is **both the portfolio AND the live demo platform** for all AI/automation projects. Recruiters and hiring managers land on one URL (linked from CV + LinkedIn), see the narrative, and can actually *use* every project — no setup, no signup, under 30 seconds to first wow.

**This merges two previously separate plans:**
1. The static portfolio site (approved design: `docs/plans/2026-05-19-portfolio-site-design.md` — reuse its visual identity, palette, and typography; its static-only case study layout is superseded by live demos)
2. The per-project demo frontends

One build instead of two. The hub IS the portfolio. Saurav plans to build it with Claude Code + Nano Banana (visuals).

Until the hub is live, CVs link to https://portfolio-peach-xi-48.vercel.app (Smile Cliniq case-study site).

---

## Core decisions (and why — do not re-litigate without new information)

### 1. NO signup, NO accounts, NO email gates — ever
A recruiter gives an unknown candidate's link 30–60 seconds. Any "join" step loses ~90% of visitors before they see anything. Abuse/cost concerns are solved with engineering (below), not gates. *(Saurav originally proposed recruiters "join"; we explicitly decided against it 2026-06-10.)*

### 2. Guardrails instead of gates
- Per-IP sliding-window rate limiting (reuse the exact pattern already built in the Triage Agent's n8n Code node — and mention it on the site; "the demo hub rate-limits itself" is a talking point)
- GPT-4o-mini everywhere; hard daily spend cap on the OpenAI key
- File-size + page-count limits on CV uploads
- **One-click "use sample data" on every demo** — preloaded ticket, preloaded questions, synthetic CVs + sample JD. The recruiter who types nothing still sees the full experience. Highest-conversion feature on the site.

### 3. Hub repo + satellite repos
- **Hub repo (public, polished):** the Next.js site — all demo UIs, case-study pages, embedded MCP video. Thin clients hitting backends.
- **Per-project repos stay separate:** n8n workflow exports, MCP server, screening pipeline core. GitHub allows 6 pinned repos and hiring managers click through — four substantial pinned repos each with their own README and commit history beat one mega-repo where everything is buried.
- **Docs are never duplicated:** each project repo's README is canonical; the hub's case-study page summarises and links out.
- Judgement call already made: the Screening Copilot's API routes may live inside the hub app (it's Next.js-native anyway) — don't over-engineer that split.

### 4. Launch incrementally — ship the hub with ONE demo
The hub goes live as soon as the Triage demo page works (target: week 2 of the roadmap). URL goes on the CV immediately. Each subsequent demo is added as it ships and announced with a LinkedIn post. **Do not wait until all four projects are done** — that's the same trap that delayed the original portfolio for a month.

### 5. Custom domain
`*.vercel.app` on a CV reads as unfinished. Buy a real domain before the URL goes on any CV.

---

## Architecture

```
                        ┌──────────────────────────────────────┐
                        │  DEMO HUB  (Next.js + TS, Vercel)    │
                        │  one repo, one deploy, one domain    │
                        │                                      │
   Recruiter ──────────►│  /            home: hero, narrative, │
   (no signup)          │               Smile Cliniq case      │
                        │               study, project grid    │
                        │  /triage      ticket form + live     │
                        │               classification view ───┼──► n8n webhook (Triage Agent)
                        │  /assistant   embedded RAG chat ─────┼──► n8n webhook (RAG flow)
                        │               + eval results page    │     └─ Supabase pgvector
                        │  /screening   JD + CV upload →       │
                        │               ranked shortlist       │  (API routes in-hub,
                        │               (in-hub API routes)    │   OpenAI + pdf parsing)
                        │  /agent       flight-recorder trace  │
                        │               replay + run video ────┼──► github: Floor Manager repo
                        │                                      │
                        │  shared: rate limiter, spend guard,  │
                        │  sample-data loader, "what am I      │
                        │  looking at?" sidebar component      │
                        └──────────────────────────────────────┘
```

**Every demo page has a consistent "What am I looking at?" sidebar:** one-paragraph problem statement, architecture diagram, GitHub repo link, Loom link. Recruiters don't explore — guide them.

---

## Per-demo surface specs

| Route | Demo surface | Key details |
|---|---|---|
| `/triage` | Ticket submission form → renders the full LLM classification JSON (category, urgency, confidence, sentiment, summary, draft response, internal notes) as a styled "admin view" | The n8n webhook already returns this JSON. Next to the live result, show static screenshots of the real Slack Block Kit message + Airtable record: "here's what just happened in the systems you can't see" |
| `/assistant` | Embedded RAG chatbot over a synthetic employee handbook | Suggested-question chips so recruiters know what to ask; a visible **"View eval results"** link showing the golden-set accuracy table (the differentiator — surface it in the demo, not just the README) |
| `/screening` | Upload a JD + CVs (PDF) → rubric scores, ranked shortlist, evidence quotes | DEFAULT path = preloaded synthetic CVs + sample JD (zero-effort demo). PII notice on upload; uploaded files deleted after session (recruiters may test with real CVs — handling that correctly is itself a signal). Show the redacted "what the model saw" view |
| `/agent` | **Flight recorder**: interactive replay of real logged agent traces (step through thought → tool call → result), plus a 2-min live-run video | Agents are too slow/costly to run live per visitor; trace replay costs zero tokens, never dead-ends, and demonstrates observability thinking. Page carries architecture diagram + repo link. (Was `/mcp` before the Floor Manager merge, 2026-06-10) |

---

## How the projects link (the narrative spine)

Everything lives in ONE lane: **AI for business operations** (recruitment, onboarding, support ops). The hub's home page tells this as a single escalating story:

1. **Smile Cliniq ATS** (client work, 11 months, testimonial, 350+ applicants, 15–20 hrs/wk saved) — *"I shipped a real system for a real business"*
2. **AI Intake Triage Agent** — *"I add LLM decision-making to business workflows, with confidence gates and HITL"*
3. **HR Onboarding RAG Assistant** — *"I build AI on business knowledge, and I measure it (published evals)"* — same onboarding domain as the client work
4. **Applicant Screening Copilot** — *"I added the AI layer to the ATS category I already built for a client"* — closes the loop with project #1
5. **Floor Manager (Ops Agent + MCP Server)** — *"I built an autonomous agent AND the tool layer it runs on"* — a hand-rolled agent loop resolving tickets via a custom MCP server over project #2's Airtable base. The capstone: the agent that runs the floor.

Shared engineering themes deliberately repeated across all of them (interview ammunition for "how do you make LLM output reliable?"): **HITL approval gates · structured outputs validated at two layers · confidence thresholds · published evals · rate limiting/guardrails.**

---

## Definition of done (per increment)

**v1 (ships the hub):** home page (hero + Smile Cliniq case study + project grid with "coming soon" slots) + `/triage` fully working + custom domain + rate limiting + analytics (e.g. Vercel Analytics, to see if recruiters actually visit). URL onto CV + LinkedIn featured section same day.

**Each later increment:** one new demo route + home-grid card flips from "coming soon" to live + LinkedIn post.
