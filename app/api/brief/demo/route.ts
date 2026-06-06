import { generateBrief } from "@/lib/brief/generate";
import { WEEK_TWO } from "@/lib/metrics/fixtures";
import type { WeeklyData } from "@/lib/metrics/types";
import { SAMPLE_BRIEF } from "@/lib/brief/sample";

/**
 * Demo endpoint for the /brief dashboard: generates a real Growth Brief with
 * Claude from the seeded WEEK_TWO fixture, passing a "recalled memory" describing
 * last week's move + outcome so the brief visibly COMPOUNDS — the differentiator,
 * shown without needing mubit wired live.
 *
 * Defensive: if ANTHROPIC_API_KEY is missing or the call fails, returns the static
 * SAMPLE_BRIEF with `live:false` so the demo never breaks.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_MEMORY = [
  'Brief for Week of 2 June. The one move I recommended: "Post 3 product demo Reels this week." Why: Instagram was the only channel with positive ROAS, and it was driving the revenue lift.',
  "For Week of 2 June, the founder ACTED ON the recommended move: posted 3 product demo Reels. Outcome the founder reported: Instagram's share of new customers rose 34% → 41%, and revenue grew 18% week over week.",
];

export async function POST(): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ brief: SAMPLE_BRIEF, live: false, reason: "no_api_key" });
  }
  try {
    const data: WeeklyData = {
      windowLabel: WEEK_TWO.windowLabel,
      businessContext: WEEK_TWO.businessContext,
      commerce: WEEK_TWO,
      sources: ["shopify"],
    };
    const { brief, usage } = await generateBrief({
      data,
      recalledMemories: DEMO_MEMORY,
    });
    return Response.json({ brief, live: true, usage });
  } catch (err) {
    console.error("[brief/demo] generation failed:", err);
    return Response.json({ brief: SAMPLE_BRIEF, live: false, reason: "error" });
  }
}
