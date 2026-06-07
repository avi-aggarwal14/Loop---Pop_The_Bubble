import { generateBrief } from "@/lib/brief/generate";
import { SYNTHETIC_SHOPIFY_PULL } from "@/lib/demo/shopify-synthetic";
import { syntheticWeeklyData } from "@/lib/demo/sample-store";
import type { GrowthBrief } from "@/lib/brief/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const fallback = SYNTHETIC_SHOPIFY_PULL.synthetic_growth_brief as GrowthBrief;

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ brief: fallback, live: false, reason: "no_api_key", data: SYNTHETIC_SHOPIFY_PULL });
  }

  try {
    const { brief, usage } = await generateBrief({
      data: syntheticWeeklyData(),
      recalledMemories: [
        "Last week Synapse recommended keeping Instagram product demos live and tracking stock velocity.",
        "The founder wants a practical growth plan for the next 7 days, not a report full of charts.",
      ],
    });
    return Response.json({ brief, live: true, usage, data: SYNTHETIC_SHOPIFY_PULL });
  } catch (err) {
    console.error("[demo/shopify-growth-plan] generation failed:", err);
    return Response.json({ brief: fallback, live: false, reason: "error", data: SYNTHETIC_SHOPIFY_PULL });
  }
}
