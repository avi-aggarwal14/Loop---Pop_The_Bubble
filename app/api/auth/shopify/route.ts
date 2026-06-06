import { handleShopifyStart } from "../../../../lib/http/handlers";
import { toResponse } from "../../../../lib/http/respond";
import { resolveFounderIdForOAuth } from "../../../../lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Start Shopify OAuth.
 *   GET /api/auth/shopify?shop=<name>.myshopify.com
 * Sets a nonce cookie and redirects the founder to Shopify to approve scopes.
 * In production, founder_id comes from the Supabase session. The founder_id
 * query fallback is only for local/dev smoke tests.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const founderId = await resolveFounderIdForOAuth(url);
  const result = handleShopifyStart({
    shop: url.searchParams.get("shop"),
    founderId,
  });
  return toResponse(result);
}
