import { liveWeeklyData } from "@/lib/advise/store-data";
import { CONNECT_COOKIE, parseCookieHeader, readConnections } from "@/lib/connect/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * The connected store's real KPIs for the last completed week — so the dashboard
 * shows live revenue/orders/traffic the instant a founder connects, before they
 * even ask. Merges Shopify commerce + GA4 traffic via liveWeeklyData.
 *
 *   GET /api/connect/metrics  →  { ok, data: WeeklyData } | { ok:false }
 */
export async function GET(req: Request): Promise<Response> {
  const conns = readConnections(parseCookieHeader(req.headers.get("cookie"))[CONNECT_COOKIE]);
  const shopify = conns.shopify;
  const ga4 = conns.ga4;
  if (!shopify && !ga4) {
    return Response.json({ ok: false, error: "no source connected" }, { status: 400 });
  }

  try {
    const data = await liveWeeklyData({
      shopify: shopify ? { shop: shopify.shop, accessToken: shopify.accessToken } : undefined,
      ga4: ga4 ? { accessToken: ga4.accessToken, refreshToken: ga4.refreshToken, propertyId: ga4.propertyId } : undefined,
    });
    if (!data) return Response.json({ ok: true, data: null, empty: true });
    return Response.json({ ok: true, data });
  } catch (err) {
    console.error("[metrics] failed:", err);
    return Response.json({ ok: false, error: "metrics pull failed" }, { status: 500 });
  }
}
