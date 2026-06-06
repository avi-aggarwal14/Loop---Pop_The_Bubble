import { handleShopifyStart } from "../../../../lib/http/handlers";
import { toResponse } from "../../../../lib/http/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Start Shopify OAuth.
 *   GET /api/auth/shopify?shop=<name>.myshopify.com&founder_id=<uuid>
 * Sets a nonce cookie and redirects the founder to Shopify to approve scopes.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const result = handleShopifyStart({
    shop: url.searchParams.get("shop"),
    founderId: url.searchParams.get("founder_id"),
  });
  return toResponse(result);
}
