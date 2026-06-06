import { generateBrief } from "@/lib/brief/generate";
import { WEEK_ONE, WEEK_TWO } from "@/lib/metrics/fixtures";
import type { WeeklyData } from "@/lib/metrics/types";
import { SAMPLE_BRIEF, SAMPLE_BRIEF_WEEK2 } from "@/lib/brief/sample";

/**
 * Demo endpoint for the /brief dashboard's compounding flow.
 *
 * Body: { week?: 1 | 2, recalledMemories?: string[] }
 *  - week 1 → generate from the WEEK_ONE fixture with NO memory (a founder's first brief).
 *  - week 2 → generate from WEEK_TWO, passing `recalledMemories` (what the founder did
 *    last week + the outcome) so the brief visibly COMPOUNDS. This is exactly what mubit
 *    will return once wired — passing it here proves the loop without needing mubit live.
 *
 * Defensive: if ANTHROPIC_API_KEY is missing or the call fails, returns the matching
 * static sample (week-1 or week-2) with `live:false` so the demo never breaks.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_WEEK2_MEMORY = [
  'Brief for Week of 2 June. The one move I recommended: "Post 3 product demo Reels this week." Why: Instagram was the only channel with positive ROAS.',
  "For Week of 2 June, the founder ACTED ON the recommended move: posted 3 product demo Reels. Outcome: Instagram's share of new customers rose 34% → 41%, revenue +18% WoW.",
];

export async function POST(req: Request): Promise<Response> {
  let body: { week?: unknown; recalledMemories?: unknown } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    /* no body → defaults */
  }
  const week = body.week === 1 ? 1 : 2;
  const recalledMemories =
    week === 2
      ? Array.isArray(body.recalledMemories) && body.recalledMemories.length
        ? (body.recalledMemories as unknown[]).map(String)
        : DEFAULT_WEEK2_MEMORY
      : [];

  const fallback = week === 2 ? SAMPLE_BRIEF_WEEK2 : SAMPLE_BRIEF;

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ brief: fallback, live: false, reason: "no_api_key", week });
  }
  try {
    const metrics = week === 2 ? WEEK_TWO : WEEK_ONE;
    const data: WeeklyData = {
      windowLabel: metrics.windowLabel,
      businessContext: metrics.businessContext,
      commerce: metrics,
      sources: ["shopify"],
    };
    const { brief, usage } = await generateBrief({ data, recalledMemories });
    return Response.json({ brief, live: true, usage, week });
  } catch (err) {
    console.error("[brief/demo] generation failed:", err);
    return Response.json({ brief: fallback, live: false, reason: "error", week });
  }
}
