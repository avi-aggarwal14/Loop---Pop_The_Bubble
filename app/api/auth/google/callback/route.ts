import { handleGoogleCallback } from "../../../../../lib/http/handlers";
import { parseCookies, toResponse } from "../../../../../lib/http/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Google OAuth callback: verify nonce, exchange code for tokens, auto-pick the
 * founder's GA4 property, persist the connection, redirect to the dashboard.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const cookies = parseCookies(req.headers.get("cookie"));
  return toResponse(await handleGoogleCallback({ query, cookies }));
}
