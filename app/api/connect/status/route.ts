import { CONNECT_COOKIE, parseCookieHeader, readConnections } from "@/lib/connect/session";
import { shopifyConfigFromEnv } from "@/lib/shopify/oauth";
import { googleConfigFromEnv } from "@/lib/ga4/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * What's connected for this session. The dashboard reads it to show real connect
 * state — "connected" (signed cookie), "available" (app keys set), or "soon" (not
 * configured yet, so the button is a graceful coming-soon instead of a 500).
 */
export async function GET(req: Request): Promise<Response> {
  const cookies = parseCookieHeader(req.headers.get("cookie"));
  const conns = readConnections(cookies[CONNECT_COOKIE]);
  return Response.json({
    shopify: {
      connected: Boolean(conns.shopify),
      shop: conns.shopify?.shop ?? null,
      configurable: Boolean(shopifyConfigFromEnv()),
    },
    ga4: {
      connected: Boolean(conns.ga4),
      configurable: Boolean(googleConfigFromEnv()),
    },
    // The synthetic demo store — always available (no keys needed), so the real
    // product flow can be shown end-to-end without a real merchant connection.
    demo: {
      connected: Boolean(conns.demo),
      store: conns.demo ? conns.demo.store : null,
    },
  });
}
