import { buildAuthorizeUrl, isValidShopDomain, newOAuthState, shopifyConfigFromEnv } from "@/lib/shopify/oauth";
import { cookieStr, SHOPIFY_NONCE_COOKIE } from "@/lib/connect/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Start Shopify OAuth — session-based (no Supabase/login).
 *   GET /api/auth/shopify?shop=<name>.myshopify.com
 * Derives a stable per-store founder id, sets a nonce cookie, and redirects the
 * merchant to Shopify to approve scopes. The callback stores the token in a signed
 * session cookie.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const shop = url.searchParams.get("shop");
  const config = shopifyConfigFromEnv();

  if (!config) {
    return Response.json(
      { error: "Shopify connect isn't set up yet — set SHOPIFY_API_KEY + SHOPIFY_API_SECRET." },
      { status: 503 },
    );
  }
  if (!shop || !isValidShopDomain(shop)) {
    return Response.json({ error: "valid ?shop=<name>.myshopify.com required" }, { status: 400 });
  }

  const founderId = `store-${shop.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  const nonce = newOAuthState();
  const state = `${founderId}:${nonce}`;
  const authUrl = buildAuthorizeUrl({ shop, config, state });
  const secure = config.appUrl.startsWith("https");

  const headers = new Headers({ Location: authUrl });
  headers.append("Set-Cookie", cookieStr(SHOPIFY_NONCE_COOKIE, nonce, { maxAge: 600, secure }));
  return new Response(null, { status: 302, headers });
}
