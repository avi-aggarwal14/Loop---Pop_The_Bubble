import { SYNTHETIC_SHOPIFY_PULL } from "@/lib/demo/shopify-synthetic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return Response.json(SYNTHETIC_SHOPIFY_PULL, {
    headers: {
      "cache-control": "no-store",
      "x-synapse-demo-data": "synthetic-shopify",
    },
  });
}
