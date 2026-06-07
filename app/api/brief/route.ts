import { generateBrief } from "@/lib/brief/generate";
import { SAMPLE_BRIEF } from "@/lib/brief/sample";
import { BRIEF_RECALL_QUERY } from "@/lib/mubit/memory";
import { recallForStore, rememberBrief } from "@/lib/advise/recall";
import { liveWeeklyData } from "@/lib/advise/store-data";
import { CONNECT_COOKIE, parseCookieHeader, readConnections } from "@/lib/connect/session";

// "This week's Growth Brief" — the weekly PUSH (the Ask is the on-demand PULL).
// Generates a real GrowthBrief from the connected store's live data + recalled
// memory, then remembers it so next week compounds. Honest about empty/not-connected
// states — never fabricates a brief about the example store for a real founder.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request): Promise<Response> {
  const conns = readConnections(parseCookieHeader(req.headers.get("cookie"))[CONNECT_COOKIE]);
  const shopifyConn = conns.shopify;
  const ga4Conn = conns.ga4;
  const founderId = shopifyConn?.founderId ?? ga4Conn?.founderId;

  if (!shopifyConn && !ga4Conn) {
    return Response.json({ ok: true, needsConnect: true, message: "Connect your store first — then I'll write your weekly brief from your real data." });
  }

  const [data, liveMemories] = await Promise.all([
    liveWeeklyData({
      shopify: shopifyConn ? { shop: shopifyConn.shop, accessToken: shopifyConn.accessToken } : undefined,
      ga4: ga4Conn ? { accessToken: ga4Conn.accessToken, refreshToken: ga4Conn.refreshToken, propertyId: ga4Conn.propertyId } : undefined,
    }).catch(() => null),
    recallForStore(BRIEF_RECALL_QUERY, founderId).catch(() => null),
  ]);

  if (!data) {
    return Response.json({
      ok: true,
      needsData: true,
      message: "You're connected, but there isn't enough data yet to write a brief. Once there are orders (or live traffic) in the last week or two, generate it again.",
    });
  }

  const recalledMemories = liveMemories ?? [];

  // No API key → sample brief so it never hard-fails (clearly marked "sample").
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ ok: true, live: false, brief: SAMPLE_BRIEF });
  }

  try {
    const { brief } = await generateBrief({ data, recalledMemories });
    // Remember the brief so next week's brief + any Ask compound on it.
    if (founderId) await rememberBrief(brief, founderId).catch(() => {});
    return Response.json({ ok: true, live: true, recalledFromMubit: recalledMemories.length > 0, brief });
  } catch (err) {
    console.error("[brief] failed:", err);
    return Response.json({ ok: true, live: false, brief: SAMPLE_BRIEF });
  }
}
