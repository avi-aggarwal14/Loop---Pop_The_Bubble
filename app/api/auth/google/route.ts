import { handleGoogleStart } from "../../../../lib/http/handlers";
import { toResponse } from "../../../../lib/http/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Start GA4 OAuth.
 *   GET /api/auth/google?founder_id=<uuid>
 * Sets a nonce cookie and redirects to Google's consent screen.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  return toResponse(handleGoogleStart({ founderId: url.searchParams.get("founder_id") }));
}
