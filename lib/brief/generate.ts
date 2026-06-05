import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { GrowthBriefSchema, type GrowthBrief } from "./schema.js";
import { SYSTEM_PROMPT } from "./prompt.js";
import { formatMetricsForPrompt, type DerivedMetrics } from "../metrics/types.js";

/**
 * Generates a Growth Brief from this week's metrics plus what mubit recalled
 * about the founder. The system prompt (stable) is cached; the metrics + recalled
 * memory (volatile) go in the user turn after the cached prefix — so caching hits
 * across founders and weeks. Output is schema-constrained, so it always parses.
 */

export const BRIEF_MODEL = "claude-opus-4-8";

export interface GenerateBriefInput {
  metrics: DerivedMetrics;
  /** Memories recalled from mubit for this founder. May be empty (first brief). */
  recalledMemories: string[];
}

export interface GenerateBriefResult {
  brief: GrowthBrief;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheReadInputTokens: number;
    cacheCreationInputTokens: number;
  };
}

function buildUserMessage(input: GenerateBriefInput): string {
  const metricsBlock = formatMetricsForPrompt(input.metrics);
  const memoryBlock =
    input.recalledMemories.length > 0
      ? input.recalledMemories.map((m, i) => `  ${i + 1}. ${m}`).join("\n")
      : "  (No prior history yet — this is this founder's first brief.)";

  return [
    "== THIS WEEK'S METRICS ==",
    metricsBlock,
    "",
    "== WHAT YOU REMEMBER ABOUT THIS FOUNDER ==",
    memoryBlock,
    "",
    "Write this week's Growth Brief.",
  ].join("\n");
}

export async function generateBrief(
  input: GenerateBriefInput,
  client?: Anthropic,
): Promise<GenerateBriefResult> {
  const anthropic = client ?? new Anthropic();

  const response = await anthropic.messages.parse({
    model: BRIEF_MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: {
      format: zodOutputFormat(GrowthBriefSchema),
      effort: "high",
    },
    // Stable prefix → cached. Never interpolate per-request data here.
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    // Volatile content → after the cached prefix.
    messages: [{ role: "user", content: buildUserMessage(input) }],
  });

  const brief = response.parsed_output;
  if (!brief) {
    throw new Error(
      `Brief did not parse (stop_reason=${response.stop_reason}). ` +
        "Likely a refusal or hit max_tokens.",
    );
  }

  const u = response.usage;
  return {
    brief,
    usage: {
      inputTokens: u.input_tokens,
      outputTokens: u.output_tokens,
      cacheReadInputTokens: u.cache_read_input_tokens ?? 0,
      cacheCreationInputTokens: u.cache_creation_input_tokens ?? 0,
    },
  };
}
