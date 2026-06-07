import { askAdvice } from "@/lib/advise/generate";
import { EXAMPLE_DATA_BLOCK, EXAMPLE_MEMORIES, SAMPLE_ADVICE } from "@/lib/advise/example";
import { recallForStore, rememberAsk } from "@/lib/advise/recall";
import { liveStoreDataBlock } from "@/lib/advise/store-data";
import { CONNECT_COOKIE, parseCookieHeader, readConnections } from "@/lib/connect/session";

// "Ask Synapse" — POST { question } → a memory-backed verdict.
// Uses REAL data + REAL memory when a store is configured:
//   - data:   live Shopify pull (SHOPIFY_SHOP_DOMAIN + SHOPIFY_ACCESS_TOKEN)
//   - memory: mubit.recall(founderAgentId, question)  (MUBIT_API_KEY + ASK_FOUNDER_ID)
// Falls back to the Coconut & Berry example for each slot independently, so it
// always answers. The engine (askAdvice) is identical in both cases.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let body: { question?: unknown; demo?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return Response.json({ ok: false, error: "missing question" }, { status: 400 });
  }
  // demo=true → always the Coconut & Berry example (the recordable demo), never the
  // real store. The real product asks with demo=false → live data + mubit recall.
  const demo = body.demo === true;

  // No API key → sample fallback so the Ask always answers (demo never breaks).
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ ok: true, live: false, advice: SAMPLE_ADVICE });
  }

  // The connected sources from the signed session cookie (set by the OAuth callbacks).
  const conns = readConnections(parseCookieHeader(req.headers.get("cookie"))[CONNECT_COOKIE]);
  const shopifyConn = conns.shopify;
  const ga4Conn = conns.ga4;
  const founderId = shopifyConn?.founderId ?? ga4Conn?.founderId;
  const hasConnection = Boolean(shopifyConn || ga4Conn);

  // Real data + real memory when connected/configured (and not demo); example fallback per-slot.
  // Shopify gives commerce, GA4 gives traffic — liveStoreDataBlock merges whatever's connected.
  const [liveData, liveMemories] = demo
    ? [null, null]
    : await Promise.all([
        liveStoreDataBlock(
          hasConnection
            ? {
                shopify: shopifyConn ? { shop: shopifyConn.shop, accessToken: shopifyConn.accessToken } : undefined,
                ga4: ga4Conn
                  ? { accessToken: ga4Conn.accessToken, refreshToken: ga4Conn.refreshToken, propertyId: ga4Conn.propertyId }
                  : undefined,
              }
            : undefined,
        ).catch(() => null),
        recallForStore(question, founderId).catch(() => null),
      ]);
  const dataBlock = liveData ?? EXAMPLE_DATA_BLOCK;
  const recalledMemories = liveMemories && liveMemories.length ? liveMemories : EXAMPLE_MEMORIES;
  const realStore = Boolean(liveData);

  try {
    const { advice } = await askAdvice({ question, recalledMemories, dataBlock });
    // Compound: remember this Ask + verdict for a real connected store, so the
    // next question can recall it. Awaited but defensive — never breaks the answer.
    if (realStore && founderId) {
      await rememberAsk({
        question,
        stance: advice.stance,
        recommendedMove: advice.recommended_move,
        founderId,
      }).catch(() => {});
    }
    return Response.json({ ok: true, live: true, realStore, recalledFromMubit: Boolean(liveMemories), advice });
  } catch (err) {
    console.error("[advice] failed:", err);
    return Response.json({ ok: true, live: false, advice: SAMPLE_ADVICE });
  }
}
