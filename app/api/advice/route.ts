import { askAdvice } from "@/lib/advise/generate";
import { EXAMPLE_DATA_BLOCK, EXAMPLE_MEMORIES, SAMPLE_ADVICE } from "@/lib/advise/example";

// "Ask Synapse" — POST { question } → a memory-backed verdict.
// For now it answers over the example store (the Coconut & Berry demo scenario),
// using EXAMPLE_MEMORIES as the mubit-recall stand-in. In production this route
// swaps to: mubit.recall(founderAgentId, question) + the founder's WeeklyData —
// the engine (askAdvice) doesn't change.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let body: { question?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return Response.json({ ok: false, error: "missing question" }, { status: 400 });
  }

  // No API key → sample fallback so the Ask always answers (demo never breaks).
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ ok: true, live: false, advice: SAMPLE_ADVICE });
  }

  try {
    const { advice } = await askAdvice({
      question,
      // ↓ In production: `await mubit.recall(founderAgentId(founderId), question, scope)`
      recalledMemories: EXAMPLE_MEMORIES,
      // ↓ In production: `formatWeeklyDataForPrompt(founderWeeklyData)`
      dataBlock: EXAMPLE_DATA_BLOCK,
    });
    return Response.json({ ok: true, live: true, advice });
  } catch (err) {
    console.error("[advice] failed:", err);
    return Response.json({ ok: true, live: false, advice: SAMPLE_ADVICE });
  }
}
