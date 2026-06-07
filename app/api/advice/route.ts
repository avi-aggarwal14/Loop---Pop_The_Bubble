import { askAdvice } from "@/lib/advise/generate";
import { EXAMPLE_DATA_BLOCK, EXAMPLE_MEMORIES, SAMPLE_ADVICE } from "@/lib/advise/example";
import { recallForStore, rememberAsk } from "@/lib/advise/recall";
import { liveStoreDataBlock } from "@/lib/advise/store-data";
import { CONNECT_COOKIE, parseCookieHeader, readConnections } from "@/lib/connect/session";
import { syntheticRecall } from "@/lib/demo/synthetic-weekly";

// "Ask Synapse" — POST { question } → a memory-backed verdict.
// Uses REAL data + REAL memory when a store is configured:
//   - data:   live Shopify pull (SHOPIFY_SHOP_DOMAIN + SHOPIFY_ACCESS_TOKEN)
//   - memory: mubit.recall(founderAgentId, question)  (MUBIT_API_KEY + ASK_FOUNDER_ID)
// Falls back to the Coconut & Berry example for each slot independently, so it
// always answers. The engine (askAdvice) is identical in both cases.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Live pull + a Claude generation can take a while — give the function room.
export const maxDuration = 60;

const MAX_QUESTION_LEN = 2000;

export async function POST(req: Request): Promise<Response> {
  let body: { question?: unknown; demo?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  let question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return Response.json({ ok: false, error: "missing question" }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_LEN) question = question.slice(0, MAX_QUESTION_LEN);
  // demo=true → always the Coconut & Berry example (the recordable demo), never the
  // real store. The real product asks with demo=false → live data + mubit recall.
  const demo = body.demo === true;

  // The connected sources from the signed session cookie (set by the OAuth callbacks).
  const conns = readConnections(parseCookieHeader(req.headers.get("cookie"))[CONNECT_COOKIE]);
  const shopifyConn = conns.shopify;
  const ga4Conn = conns.ga4;
  const demoConn = conns.demo;
  const founderId = shopifyConn?.founderId ?? ga4Conn?.founderId ?? demoConn?.founderId;
  const hasConnection = Boolean(shopifyConn || ga4Conn || demoConn);

  // ── Resolve the evidence HONESTLY (no bluffing about a fake store) ──
  // demo            → the Coconut & Berry example (intended, recordable).
  // real + data     → the founder's live data + their recalled memory.
  // real + no data  → say we don't have enough yet; NEVER fall back to the example.
  // not connected   → ask them to connect first.
  let dataBlock: string;
  let recalledMemories: string[];
  let realStore: boolean;
  let sources: string[];

  if (demo) {
    dataBlock = EXAMPLE_DATA_BLOCK;
    recalledMemories = EXAMPLE_MEMORIES;
    realStore = false;
    sources = ["Example dataset"];
  } else {
    if (!hasConnection) {
      return Response.json({ ok: true, needsConnect: true, message: "Connect your store first — then I'll answer from your real data." });
    }
    const [liveData, liveMemories] = await Promise.all([
      liveStoreDataBlock({
        shopify: shopifyConn ? { shop: shopifyConn.shop, accessToken: shopifyConn.accessToken } : undefined,
        ga4: ga4Conn ? { accessToken: ga4Conn.accessToken, refreshToken: ga4Conn.refreshToken, propertyId: ga4Conn.propertyId } : undefined,
        demo: Boolean(demoConn),
      }).catch(() => null),
      recallForStore(question, founderId).catch(() => null),
    ]);
    if (!liveData) {
      return Response.json({
        ok: true,
        needsData: true,
        message: "You're connected, but I don't have enough of your data yet to answer well. Once there are orders (or live traffic) in the last week or two, ask me again.",
      });
    }
    dataBlock = liveData;
    // A real store NEVER borrows the example's memories — thin memory is honest;
    // fabricated past launches are not. The prompt handles an empty list.
    // The demo store is the exception: its synthetic history is its real history, so
    // if live mubit recall hasn't indexed the just-ingested backfill yet, fall back to
    // the demo store's own memories (keeps the "remembered" panel populated reliably).
    recalledMemories = liveMemories ?? [];
    if (demoConn && recalledMemories.length === 0) recalledMemories = syntheticRecall(question);
    realStore = true;
    sources = demoConn
      ? ["Demo store (Shopify-shaped data)"]
      : [...(shopifyConn ? ["Shopify"] : []), ...(ga4Conn ? ["Google Analytics"] : [])];
  }

  // No API key → sample fallback so the demo never hard-fails (clearly marked "sample").
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ ok: true, live: false, advice: SAMPLE_ADVICE, context: { dataBlock, memories: recalledMemories, sources } });
  }

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
    // Hand back the exact evidence used, so the dashboard can ground follow-up
    // questions (and the transparency view) on the same data + memory.
    return Response.json({
      ok: true,
      live: true,
      realStore,
      recalledFromMubit: realStore && recalledMemories.length > 0,
      advice,
      context: { dataBlock, memories: recalledMemories, sources },
    });
  } catch (err) {
    console.error("[advice] failed:", err);
    return Response.json({ ok: true, live: false, advice: SAMPLE_ADVICE, context: { dataBlock, memories: recalledMemories, sources } });
  }
}
