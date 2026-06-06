import { createServiceClient } from "../../../../lib/supabase/server.js";
import { handleVercelDrain } from "../../../../lib/http/handlers.js";
import { toResponse } from "../../../../lib/http/respond.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel Web Analytics drain target. The founder configures a drain in Vercel
 * pointing here:
 *   POST /api/ingest/vercel?cid=<connectionId>&secret=<drainSecret>
 * Body is newline-delimited JSON events. We auth the per-connection secret and
 * store the events (service client → bypasses RLS).
 */
export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const ndjson = await req.text();
  const result = await handleVercelDrain(createServiceClient(), {
    connectionId: url.searchParams.get("cid"),
    secret: url.searchParams.get("secret"),
    ndjson,
  });
  return toResponse(result);
}
