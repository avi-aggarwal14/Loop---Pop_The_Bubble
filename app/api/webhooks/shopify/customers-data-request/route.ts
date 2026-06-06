import { handleShopifyComplianceWebhook } from "../../../../../lib/http/handlers";
import { toResponse } from "../../../../../lib/http/respond";
import { createServiceClient } from "../../../../../lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();
  return toResponse(
    await handleShopifyComplianceWebhook({
      db: createServiceClient(),
      rawBody,
      headers: {
        "x-shopify-topic": req.headers.get("x-shopify-topic"),
        "x-shopify-shop-domain": req.headers.get("x-shopify-shop-domain"),
        "x-shopify-hmac-sha256": req.headers.get("x-shopify-hmac-sha256"),
      },
    }),
  );
}
