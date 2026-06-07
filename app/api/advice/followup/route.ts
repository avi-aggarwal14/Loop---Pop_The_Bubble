import { followUpAdvice, type ChatTurn } from "@/lib/advise/generate";
import { EXAMPLE_DATA_BLOCK, EXAMPLE_MEMORIES } from "@/lib/advise/example";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// A live Claude follow-up takes ~8–15s; match /api/advice so the default serverless
// timeout can't abort the conversational defence mid-demo.
export const maxDuration = 60;

/**
 * Follow-up turn for "Ask Synapse" — the founder interrogates the verdict and
 * Synapse defends it conversationally, grounded in the SAME data + memory.
 *
 *   POST { messages: ChatTurn[], context?: { dataBlock, memories }, demo? }
 * The client carries `context` (returned by /api/advice) so the defence cites the
 * exact evidence behind the verdict. Falls back to the example when absent.
 */
export async function POST(req: Request): Promise<Response> {
  let body: { messages?: unknown; context?: unknown; demo?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  // Validate the conversation: clean turns, must start + end with a user turn.
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: ChatTurn[] = raw
    .filter(
      (m): m is ChatTurn =>
        !!m &&
        typeof m === "object" &&
        ((m as ChatTurn).role === "user" || (m as ChatTurn).role === "assistant") &&
        typeof (m as ChatTurn).content === "string" &&
        (m as ChatTurn).content.trim().length > 0,
    )
    .map((m) => ({ role: m.role, content: m.content.trim() }));

  if (messages.length < 1 || messages[0].role !== "user" || messages[messages.length - 1].role !== "user") {
    return Response.json({ ok: false, error: "messages must start and end with a user turn" }, { status: 400 });
  }

  const ctx = (body.context && typeof body.context === "object" ? body.context : {}) as {
    dataBlock?: unknown;
    memories?: unknown;
  };
  const dataBlock = typeof ctx.dataBlock === "string" && ctx.dataBlock.trim() ? ctx.dataBlock : EXAMPLE_DATA_BLOCK;
  const memories = Array.isArray(ctx.memories)
    ? ctx.memories.filter((x): x is string => typeof x === "string")
    : [];
  const recalledMemories = memories.length ? memories : EXAMPLE_MEMORIES;

  // No API key → graceful canned reply so follow-ups never hard-fail in the demo.
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({
      ok: true,
      reply:
        "Short version: the call stands on the numbers and the past patterns above. Wire up the API key and I'll defend it live, point by point.",
    });
  }

  try {
    const reply = await followUpAdvice({ dataBlock, recalledMemories, messages });
    return Response.json({ ok: true, reply });
  } catch (err) {
    console.error("[advice/followup] failed:", err);
    return Response.json({ ok: false, error: "couldn't answer that follow-up — try again" }, { status: 500 });
  }
}
