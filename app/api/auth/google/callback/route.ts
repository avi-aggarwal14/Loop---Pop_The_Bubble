import { exchangeGoogleCode, googleConfigFromEnv } from "@/lib/ga4/oauth";
import { fetchFirstGa4PropertyId } from "@/lib/ga4/ingest";
import {
  CONNECT_COOKIE,
  GOOGLE_NONCE_COOKIE,
  clearCookieStr,
  cookieStr,
  parseCookieHeader,
  readConnections,
  signConnections,
} from "@/lib/connect/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Google OAuth callback — session-based (no Supabase). Verify nonce, exchange the
 * code for tokens, auto-pick the founder's first GA4 property, store it in the
 * signed connection cookie, and redirect to the dashboard.
 */
export async function GET(req: Request): Promise<Response> {
  const config = googleConfigFromEnv();
  if (!config) return Response.json({ error: "Google Analytics not configured" }, { status: 503 });

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  if (oauthError) return Response.json({ error: `Google OAuth error: ${oauthError}` }, { status: 400 });
  if (!code || !state) return Response.json({ error: "missing oauth params" }, { status: 400 });

  const [founderId, nonce] = state.split(":");
  if (!founderId || !nonce) return Response.json({ error: "malformed state" }, { status: 400 });

  const cookies = parseCookieHeader(req.headers.get("cookie"));
  if (cookies[GOOGLE_NONCE_COOKIE] !== nonce) {
    return Response.json({ error: "state/nonce mismatch" }, { status: 401 });
  }

  const tokens = await exchangeGoogleCode({ config, code });
  const propertyId = await fetchFirstGa4PropertyId(tokens.accessToken).catch(() => null);

  // Merge into the signed session cookie (keeps any existing Shopify connection).
  const conns = readConnections(cookies[CONNECT_COOKIE]);
  conns.ga4 = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? undefined,
    propertyId,
    founderId,
  };

  const secure = config.appUrl.startsWith("https");
  const dashboard = `${config.appUrl.replace(/\/+$/, "")}/dashboard?connected=ga4`;
  const headers = new Headers({ Location: dashboard });
  headers.append("Set-Cookie", clearCookieStr(GOOGLE_NONCE_COOKIE));
  headers.append("Set-Cookie", cookieStr(CONNECT_COOKIE, signConnections(conns), { maxAge: 60 * 60 * 24 * 30, secure }));
  return new Response(null, { status: 302, headers });
}
