import { askAdvice } from "@/lib/advise/generate";
import { EXAMPLE_DATA_BLOCK, EXAMPLE_MEMORIES, SAMPLE_ADVICE } from "@/lib/advise/example";
import { recallForStore } from "@/lib/advise/recall";
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

  // The connected store from the signed session cookie (set by the OAuth callback).
  const shopifyConn = readConnections(parseCookieHeader(req.headers.get("cookie"))[CONNECT_COOKIE]).shopify;

  // Real data + real memory when connected/configured (and not demo); example fallback per-slot.
  const [liveData, liveMemories] = demo
    ? [null, null]
    : await Promise.all([
        liveStoreDataBlock(shopifyConn ? { shop: shopifyConn.shop, accessToken: shopifyConn.accessToken } : undefined).catch(() => null),
        recallForStore(question, shopifyConn?.founderId).catch(() => null),
      ]);
  const dataBlock = liveData ?? EXAMPLE_DATA_BLOCK;
  const recalledMemories = liveMemories && liveMemories.length ? liveMemories : EXAMPLE_MEMORIES;
  const realStore = Boolean(liveData);

  try {
    const { advice } = await askAdvice({ question, recalledMemories, dataBlock });
    return Response.json({ ok: true, live: true, realStore, recalledFromMubit: Boolean(liveMemories), advice });
  } catch (err) {
    console.error("[advice] failed:", err);
    return Response.json({ ok: true, live: false, advice: SAMPLE_ADVICE });
  }
}
