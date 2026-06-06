import { handleGoogleStart } from "../../../../lib/http/handlers";
import { toResponse } from "../../../../lib/http/respond";
import { resolveFounderIdForOAuth } from "../../../../lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Start GA4 OAuth.
 *   GET /api/auth/google
 * Sets a nonce cookie and redirects to Google's consent screen.
 * In production, founder_id comes from the Supabase session. The founder_id
 * query fallback is only for local/dev smoke tests.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const founderId = await resolveFounderIdForOAuth(url);
  return toResponse(handleGoogleStart({ founderId }));
}
