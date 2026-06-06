import { test } from "node:test";
import assert from "node:assert/strict";
import { generateBrief } from "../lib/brief/generate";
import type { WeeklyData } from "../lib/metrics/types";
import { WEEK_ONE } from "../lib/metrics/fixtures";

/**
 * Unit tests for the brief engine with a MOCKED Anthropic client — no key, no
 * network. Covers the happy path (structured output → parsed brief + usage
 * mapping), that recalled memory reaches the user turn, and the two failure
 * branches (refusal, empty content).
 */

type Client = Parameters<typeof generateBrief>[1];

const VALID = {
  week_of: "Week of 9 June",
  headline_numbers: [
    { label: "Revenue", value: "↑18% WoW", direction: "up" },
    { label: "Conversion", value: "2.7%", direction: "flat" },
  ],
  whats_working: "Reels compounded again.",
  what_to_cut: "Keep Facebook ads off.",
  one_move: { action: "Reorder the Serum Duo.", rationale: "It's about to sell out." },
};

function fakeClient(message: unknown, capture?: (params: unknown) => void): Client {
  return {
    messages: {
      create: async (params: unknown) => {
        capture?.(params);
        return message;
      },
    },
  } as unknown as Client;
}

const DATA: WeeklyData = {
  windowLabel: WEEK_ONE.windowLabel,
  businessContext: WEEK_ONE.businessContext,
  commerce: WEEK_ONE,
  sources: ["shopify"],
};

function msg(over: Record<string, unknown>): unknown {
  return {
    stop_reason: "end_turn",
    content: [{ type: "text", text: JSON.stringify(VALID) }],
    usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
    ...over,
  };
}

test("generateBrief parses structured output and maps usage", async () => {
  const { brief, usage } = await generateBrief(
    { data: DATA, recalledMemories: [] },
    fakeClient(
      msg({ usage: { input_tokens: 12, output_tokens: 34, cache_read_input_tokens: 7, cache_creation_input_tokens: 0 } }),
    ),
  );
  assert.equal(brief.one_move.action, "Reorder the Serum Duo.");
  assert.equal(brief.headline_numbers[0]!.direction, "up");
  assert.equal(usage.inputTokens, 12);
  assert.equal(usage.outputTokens, 34);
  assert.equal(usage.cacheReadInputTokens, 7);
});

test("generateBrief passes recalled memory into the user turn (compounding)", async () => {
  let captured: { system?: unknown; messages?: { role: string; content: string }[] } = {};
  await generateBrief(
    { data: DATA, recalledMemories: ["MEMORY-MARKER-123"] },
    fakeClient(msg({}), (p) => {
      captured = p as typeof captured;
    }),
  );
  const userMsg = (captured.messages ?? []).find((m) => m.role === "user");
  assert.ok(userMsg, "expected a user message");
  assert.ok(String(userMsg!.content).includes("MEMORY-MARKER-123"), "recalled memory must reach the user turn");
  assert.ok(Array.isArray(captured.system), "system prompt should be a cacheable block array");
});

test("generateBrief throws on a refusal stop_reason", async () => {
  await assert.rejects(
    () => generateBrief({ data: DATA, recalledMemories: [] }, fakeClient(msg({ stop_reason: "refusal", content: [] }))),
    /refused/,
  );
});

test("generateBrief throws when there is no text content", async () => {
  await assert.rejects(
    () =>
      generateBrief(
        { data: DATA, recalledMemories: [] },
        fakeClient(msg({ stop_reason: "max_tokens", content: [{ type: "thinking", thinking: "", signature: "" }] })),
      ),
    /Empty brief/,
  );
});
