import { randomUUID } from "node:crypto";
import {
  CONNECT_COOKIE,
  clearCookieStr,
  cookieStr,
  parseCookieHeader,
  readConnections,
  signConnections,
} from "@/lib/connect/session";
import { DEMO_STORE } from "@/lib/demo/synthetic-weekly";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Connect the synthetic "Luma & Lane" demo store for this session — no OAuth, no token.
 * It marks the signed session cookie as connected to the demo store, after which the
 * REAL engine (live Claude + real mubit memory) reasons over the synthetic data exactly
 * as it would a real Shopify connection. The point is to demo the true product end-to-end
 * without a real merchant store.
 *
 * A fresh per-browser `founderId` isolates this session's mubit memory and lets it
 * compound across the demo (backfill → recall → Ask → outcome).
 *
 *   POST  /api/connect/demo   → connect (sets cookie)
 *   DELETE /api/connect/demo  → disconnect (clears cookie)
 */
export async function POST(req: Request): Promise<Response> {
  const cookies = parseCookieHeader(req.headers.get("cookie"));
  const conns = readConnections(cookies[CONNECT_COOKIE]);

  // Keep a stable founderId if the demo store is already connected (so memory persists).
  const founderId = conns.demo?.founderId ?? `demo-${randomUUID().slice(0, 8)}`;
  conns.demo = { store: DEMO_STORE.id, founderId };

  const secure = new URL(req.url).protocol === "https:";
  const headers = new Headers({ "content-type": "application/json" });
  headers.append("Set-Cookie", cookieStr(CONNECT_COOKIE, signConnections(conns), { maxAge: 60 * 60 * 24 * 30, secure }));
  return new Response(
    JSON.stringify({ ok: true, store: DEMO_STORE.name, founderId }),
    { status: 200, headers },
  );
}

export async function DELETE(req: Request): Promise<Response> {
  const cookies = parseCookieHeader(req.headers.get("cookie"));
  const conns = readConnections(cookies[CONNECT_COOKIE]);
  delete conns.demo;

  const secure = new URL(req.url).protocol === "https:";
  const headers = new Headers({ "content-type": "application/json" });
  // If nothing else is connected, clear the cookie entirely; otherwise re-sign without demo.
  if (!conns.shopify && !conns.ga4) {
    headers.append("Set-Cookie", clearCookieStr(CONNECT_COOKIE));
  } else {
    headers.append("Set-Cookie", cookieStr(CONNECT_COOKIE, signConnections(conns), { maxAge: 60 * 60 * 24 * 30, secure }));
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
