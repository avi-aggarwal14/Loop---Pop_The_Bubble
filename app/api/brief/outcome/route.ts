import { rememberMoveOutcome } from "@/lib/advise/recall";
import { DEMO_FOUNDER_ID } from "@/lib/demo/sample-store";
import { CONNECT_COOKIE, parseCookieHeader, readConnections } from "@/lib/connect/session";

// The founder marks this week's one move Done/Skipped → close the learning loop in
// mubit (lesson + outcome signal), so next week's brief + any Ask compound on it.
// No Supabase: the founder is resolved from the signed session cookie.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request): Promise<Response> {
  let body: { status?: unknown; move?: unknown; weekOf?: unknown; note?: unknown; demo?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  // Real store → founder from the session cookie; demo → the shared sample-store id.
  const conns = readConnections(parseCookieHeader(req.headers.get("cookie"))[CONNECT_COOKIE]);
  const founderId = body.demo === true ? DEMO_FOUNDER_ID : conns.shopify?.founderId ?? conns.ga4?.founderId;
  if (!founderId) {
    return Response.json({ ok: false, error: "not connected" }, { status: 400 });
  }

  const status = body.status === "done" || body.status === "skipped" ? body.status : null;
  const move = typeof body.move === "string" ? body.move.slice(0, 600) : "";
  if (!status || !move) {
    return Response.json({ ok: false, error: "status and move are required" }, { status: 400 });
  }

  await rememberMoveOutcome({
    move,
    status,
    weekOf: typeof body.weekOf === "string" ? body.weekOf : "this week",
    note: typeof body.note === "string" && body.note.trim() ? body.note.slice(0, 400) : undefined,
    founderId,
  }).catch(() => {});

  return Response.json({ ok: true });
}
