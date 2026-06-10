import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies ticket submissions to the n8n Triage webhook.
 * - Per-IP sliding-window rate limit (10 req/min), the same pattern as the
 *   n8n workflow's own Code-node limiter, applied at the site edge too.
 * - If N8N_TRIAGE_WEBHOOK_URL is unset or the webhook fails, returns a
 *   mock classification so the demo always works.
 */

export type TriageResult = {
  category:
    | "billing"
    | "technical"
    | "feature_request"
    | "complaint"
    | "onboarding"
    | "other";
  urgency: "critical" | "high" | "medium" | "low";
  confidence: number;
  sentiment: "frustrated" | "neutral" | "positive";
  summary: string;
  draft_response: string;
  internal_notes: string[];
  ticketId: string;
  mock: boolean;
};

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  // prune stale entries across all IPs so the map stays bounded
  for (const [key, stamps] of hits) {
    const fresh = stamps.filter((t) => now - t < WINDOW_MS);
    if (fresh.length === 0) hits.delete(key);
    else hits.set(key, fresh);
  }
  const mine = hits.get(ip) ?? [];
  if (mine.length >= MAX_PER_WINDOW) return true;
  mine.push(now);
  hits.set(ip, mine);
  return false;
}

function mockClassify(name: string, message: string): TriageResult {
  const lower = message.toLowerCase();
  const category: TriageResult["category"] = /invoice|charge|refund|bill|pay/.test(
    lower
  )
    ? "billing"
    : /error|bug|crash|broken|fail|down|load/.test(lower)
      ? "technical"
      : /add|feature|wish|could you|would be great/.test(lower)
        ? "feature_request"
        : /angry|terrible|unacceptable|worst|complain/.test(lower)
          ? "complaint"
          : /onboard|new hire|start|account setup/.test(lower)
            ? "onboarding"
            : "other";
  const urgency: TriageResult["urgency"] = /urgent|asap|immediately|critical|now|today/.test(
    lower
  )
    ? "high"
    : category === "technical"
      ? "medium"
      : "low";
  const sentiment: TriageResult["sentiment"] = /angry|terrible|frustrat|unacceptable|worst/.test(
    lower
  )
    ? "frustrated"
    : /thanks|great|love|please/.test(lower)
      ? "positive"
      : "neutral";
  const firstName = name.trim().split(/\s+/)[0] || "there";
  return {
    category,
    urgency,
    confidence: 0.91,
    sentiment,
    summary:
      message.length > 90 ? message.slice(0, 87).trimEnd() + "…" : message,
    draft_response: `Hi ${firstName}, thanks for getting in touch. We've logged your ${category.replace(
      "_",
      " "
    )} request and routed it to the right team. You'll hear back from us shortly with next steps. In the meantime, reply to this email if anything changes.`,
    internal_notes: [
      `Auto-classified as ${category} / ${urgency} urgency`,
      "Routed via demo mock (webhook not connected)",
    ],
    ticketId: `DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
    mock: true,
  };
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "rate_limited", retryAfter: 60 },
      { status: 429 }
    );
  }

  let body: { name?: string; email?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = (body.name ?? "").slice(0, 100);
  const message = (body.message ?? "").slice(0, 2000);
  if (!message.trim()) {
    return NextResponse.json({ error: "empty_message" }, { status: 400 });
  }

  const webhookUrl = process.env.N8N_TRIAGE_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: (body.email ?? "demo@visitor.local").slice(0, 200),
          subject: (body.subject ?? "Demo Hub submission").slice(0, 200),
          Body: message,
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.internal_notes === "string") {
          data.internal_notes = data.internal_notes
            .split("\n")
            .map((s: string) => s.replace(/^[-•*]\s*/, "").trim())
            .filter(Boolean);
        }
        return NextResponse.json({ ...data, mock: false });
      }
    } catch {
      // fall through to mock; the demo must never show a dead end
    }
  }

  return NextResponse.json(mockClassify(name, message));
}
