import { randomBytes } from "node:crypto";
import { buildGoogleAuthUrl, googleConfigFromEnv, newGoogleState } from "@/lib/ga4/oauth";
import { CONNECT_COOKIE, GOOGLE_NONCE_COOKIE, cookieStr, parseCookieHeader, readConnections } from "@/lib/connect/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Start GA4 OAuth — session-based (no Supabase/login).
 *   GET /api/auth/google
 * Reuses the founder id of an already-connected store (so GA4 attaches to the same
 * session), else mints a session id. Sets a nonce cookie and redirects to Google.
 */
export async function GET(req: Request): Promise<Response> {
  const config = googleConfigFromEnv();
  if (!config) {
    return Response.json(
      { error: "Google Analytics connect isn't set up yet — set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET." },
      { status: 503 },
    );
  }

  const cookies = parseCookieHeader(req.headers.get("cookie"));
  const conns = readConnections(cookies[CONNECT_COOKIE]);
  const founderId = conns.ga4?.founderId ?? conns.shopify?.founderId ?? `ga-${randomBytes(6).toString("hex")}`;
  const nonce = newGoogleState();
  const state = `${founderId}:${nonce}`;
  const authUrl = buildGoogleAuthUrl({ config, state });
  const secure = config.appUrl.startsWith("https");

  const headers = new Headers({ Location: authUrl });
  headers.append("Set-Cookie", cookieStr(GOOGLE_NONCE_COOKIE, nonce, { maxAge: 600, secure }));
  return new Response(null, { status: 302, headers });
}
