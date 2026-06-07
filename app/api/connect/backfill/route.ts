import { backfillStoreHistory, backfillSyntheticHistory } from "@/lib/advise/backfill";
import { CONNECT_COOKIE, parseCookieHeader, readConnections } from "@/lib/connect/session";
import { mubitConfigFromEnv } from "@/lib/mubit/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// History pull spans several weeks of Shopify orders — give it room.
export const maxDuration = 60;

/**
 * Load the connected store's recent history into mubit so the Ask recalls THEIR
 * real patterns from the first question — the "no cold start" differentiator.
 * The dashboard calls this once right after a Shopify connect.
 *
 *   POST /api/connect/backfill   (optional body: { weeks?: number })
 */
export async function POST(req: Request): Promise<Response> {
  const conns = readConnections(parseCookieHeader(req.headers.get("cookie"))[CONNECT_COOKIE]);
  const shopify = conns.shopify;
  const demo = conns.demo;
  if (!shopify && !demo) {
    return Response.json({ ok: false, error: "no Shopify store connected" }, { status: 400 });
  }
  // No memory layer configured → tell the dashboard so it can stay graceful (no error UI).
  if (!mubitConfigFromEnv()) {
    return Response.json({ ok: false, configured: false, error: "memory layer not configured" });
  }

  // Demo store → ingest its synthetic history so recall returns real, question-relevant
  // memories (the "no cold start" differentiator, exercised against live mubit).
  if (demo) {
    try {
      const result = await backfillSyntheticHistory({ founderId: demo.founderId });
      return Response.json({ ok: true, weeksIngested: result.weeksIngested, business: result.businessContext });
    } catch (err) {
      console.error("[backfill:demo] failed:", err);
      return Response.json({ ok: false, error: "backfill failed" }, { status: 500 });
    }
  }

  // Past the demo branch, only a real Shopify connection remains.
  if (!shopify) {
    return Response.json({ ok: false, error: "no Shopify store connected" }, { status: 400 });
  }

  let weeks = 8;
  try {
    const body = (await req.json()) as { weeks?: unknown };
    if (typeof body.weeks === "number" && body.weeks > 0 && body.weeks <= 26) weeks = Math.floor(body.weeks);
  } catch {
    // no/invalid body — use the default
  }

  try {
    const result = await backfillStoreHistory({
      shop: shopify.shop,
      accessToken: shopify.accessToken,
      founderId: shopify.founderId,
      weeks,
    });
    return Response.json({ ok: true, weeksIngested: result.weeksIngested, business: result.businessContext });
  } catch (err) {
    console.error("[backfill] failed:", err);
    return Response.json({ ok: false, error: "backfill failed" }, { status: 500 });
  }
}
