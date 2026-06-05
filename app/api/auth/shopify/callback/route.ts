import { handleShopifyCallback } from "../../../../../lib/http/handlers.js";
import { parseCookies, toResponse } from "../../../../../lib/http/respond.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Shopify OAuth callback: verify HMAC + nonce, exchange the code for a token, and
 * persist the connection. Then redirect to the dashboard.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const cookies = parseCookies(req.headers.get("cookie"));
  const result = await handleShopifyCallback({ query, cookies });
  return toResponse(result);
}
