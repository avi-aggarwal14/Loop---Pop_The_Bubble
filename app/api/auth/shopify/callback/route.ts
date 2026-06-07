import {
  exchangeCodeForToken,
  isValidShopDomain,
  missingRequiredScopes,
  shopifyConfigFromEnv,
  verifyCallbackHmac,
} from "@/lib/shopify/oauth";
import {
  CONNECT_COOKIE,
  SHOPIFY_NONCE_COOKIE,
  clearCookieStr,
  cookieStr,
  parseCookieHeader,
  readConnections,
  signConnections,
} from "@/lib/connect/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Shopify OAuth callback — session-based (no Supabase). Verify HMAC + nonce,
 * exchange the code for a token, store it in the signed connection cookie, and
 * redirect to the dashboard. From here the Ask answers about this real store.
 */
export async function GET(req: Request): Promise<Response> {
  const config = shopifyConfigFromEnv();
  if (!config) return Response.json({ error: "Shopify not configured" }, { status: 503 });

  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const cookies = parseCookieHeader(req.headers.get("cookie"));

  const { shop, code, state, hmac } = query;
  if (!shop || !isValidShopDomain(shop)) return Response.json({ error: "invalid shop" }, { status: 400 });
  if (!code || !state || !hmac) return Response.json({ error: "missing oauth params" }, { status: 400 });
  if (!verifyCallbackHmac(query, config.apiSecret)) {
    return Response.json({ error: "HMAC validation failed" }, { status: 401 });
  }

  const [founderId, nonce] = state.split(":");
  if (!founderId || !nonce) return Response.json({ error: "malformed state" }, { status: 400 });
  if (cookies[SHOPIFY_NONCE_COOKIE] !== nonce) {
    return Response.json({ error: "state/nonce mismatch" }, { status: 401 });
  }

  const token = await exchangeCodeForToken({ shop, code, config });
  const missing = missingRequiredScopes(config.scopes, token.scope);
  if (missing.length > 0) {
    return Response.json({ error: "Shopify granted fewer scopes than required", missingScopes: missing }, { status: 400 });
  }

  // Merge into the signed session cookie (keeps any existing GA4 connection).
  const conns = readConnections(cookies[CONNECT_COOKIE]);
  conns.shopify = { shop, accessToken: token.accessToken, founderId };

  const secure = config.appUrl.startsWith("https");
  const dashboard = `${config.appUrl.replace(/\/+$/, "")}/dashboard?connected=shopify`;
  const headers = new Headers({ Location: dashboard });
  headers.append("Set-Cookie", clearCookieStr(SHOPIFY_NONCE_COOKIE));
  headers.append("Set-Cookie", cookieStr(CONNECT_COOKIE, signConnections(conns), { maxAge: 60 * 60 * 24 * 30, secure }));
  return new Response(null, { status: 302, headers });
}
