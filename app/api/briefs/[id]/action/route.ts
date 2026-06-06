import { buildUserActionDeps } from "../../../../../lib/http/deps";
import { handleRecordAction } from "../../../../../lib/http/handlers";
import { bearerToken, json, toResponse } from "../../../../../lib/http/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The founder marks the brief's one move done/skipped (with an optional outcome).
 * Auth: `Authorization: Bearer <supabase access token>` — the RLS client ensures
 * a founder can only act on their own brief.
 *
 * Body: { "status": "done" | "skipped", "outcomeNote"?: string }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const token = bearerToken(req.headers.get("authorization"));
  if (!token) return toResponse(json(401, { error: "missing bearer token" }));

  let body: { status?: unknown; outcomeNote?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return toResponse(json(400, { error: "invalid JSON body" }));
  }

  const result = await handleRecordAction(buildUserActionDeps(token), {
    briefId: id,
    status: body.status,
    outcomeNote: body.outcomeNote,
  });
  return toResponse(result);
}
