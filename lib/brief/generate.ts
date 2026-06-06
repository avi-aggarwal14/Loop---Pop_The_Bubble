import Anthropic from "@anthropic-ai/sdk";
import { GrowthBriefSchema, type GrowthBrief } from "./schema";
import { SYSTEM_PROMPT } from "./prompt";
import { formatWeeklyDataForPrompt, type WeeklyData } from "../metrics/types";

/**
 * Generates a Growth Brief from this week's metrics plus what mubit recalled
 * about the founder.
 *
 * Provider: Anthropic Claude (the team's credits are on the Anthropic API). This
 * is the ONLY provider-specific file for the brief engine — schema, mubit,
 * metrics, and the harness are all neutral.
 *
 * - Structured output: `output_config.format` (json_schema) → the model must
 *   return our exact shape, and we still validate with the zod schema as a backstop.
 * - Caching: a `cache_control` breakpoint pins the stable SYSTEM_PROMPT as the
 *   cacheable prefix; the volatile metrics + recalled memory go in the user turn.
 *   (The prompt is short, so a cache write only actually happens once the prefix
 *   crosses Opus's ~4K-token minimum — the breakpoint is harmless either way.)
 * - Thinking: adaptive (Claude decides depth); `ANTHROPIC_EFFORT` tunes spend.
 */

// Model is env-driven; defaults to the most capable Claude model.
export const BRIEF_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";
// Effort controls thinking depth + overall token spend: low | medium | high | xhigh | max.
// Set ANTHROPIC_EFFORT="none" to omit it entirely (falls back to the model default).
const EFFORT = process.env.ANTHROPIC_EFFORT ?? "high";

export interface GenerateBriefInput {
  /** The full merged picture for the week (commerce + traffic + business profile). */
  data: WeeklyData;
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

/**
 * Wire contract for the model's JSON output. Mirrors GrowthBriefSchema; structured
 * outputs require additionalProperties:false and every property listed in required.
 * The zod parse below catches any drift between the two immediately.
 */
const BRIEF_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    week_of: { type: "string", description: 'Window label, e.g. "Week of 2 June".' },
    headline_numbers: {
      type: "array",
      description: "The 3-4 top-line metrics that matter most this week.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string", description: 'e.g. "Revenue", "Sessions".' },
          value: { type: "string", description: 'e.g. "↑12% WoW", "2.4%".' },
          direction: { type: "string", enum: ["up", "down", "flat"] },
        },
        required: ["label", "value", "direction"],
      },
    },
    whats_working: { type: "string" },
    what_to_cut: { type: "string" },
    one_move: {
      type: "object",
      additionalProperties: false,
      properties: {
        action: { type: "string" },
        rationale: { type: "string" },
      },
      required: ["action", "rationale"],
    },
  },
  required: ["week_of", "headline_numbers", "whats_working", "what_to_cut", "one_move"],
} as const;

function buildUserMessage(input: GenerateBriefInput): string {
  const dataBlock = formatWeeklyDataForPrompt(input.data);
  const memoryBlock =
    input.recalledMemories.length > 0
      ? input.recalledMemories.map((m, i) => `  ${i + 1}. ${m}`).join("\n")
      : "  (No prior history yet — this is this founder's first brief.)";

  return [
    "== THIS WEEK'S DATA ==",
    dataBlock,
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

  const outputConfig: Anthropic.OutputConfig = {
    format: { type: "json_schema", schema: BRIEF_JSON_SCHEMA as Record<string, unknown> },
  };
  if (EFFORT !== "none") {
    outputConfig.effort = EFFORT as Anthropic.OutputConfig["effort"];
  }

  const message = await anthropic.messages.create({
    model: BRIEF_MODEL,
    max_tokens: 16000,
    // Stable prefix → cacheable. Never interpolate per-request data here.
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    // Adaptive thinking lets Claude decide how much to reason per brief.
    thinking: { type: "adaptive" },
    output_config: outputConfig,
    // Volatile content (metrics + recalled memory) sits after the cached prefix.
    messages: [{ role: "user", content: buildUserMessage(input) }],
  });

  if (message.stop_reason === "refusal") {
    throw new Error("Model refused to generate the brief.");
  }

  // With structured output, the JSON arrives in the text block(s). (Thinking
  // blocks may precede it; we skip those.)
  const content = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");
  if (!content) {
    throw new Error(
      `Empty brief (stop_reason=${message.stop_reason}). Likely hit max_tokens.`,
    );
  }

  // Structured output guarantees the shape, but validate anyway — single source of truth.
  const brief: GrowthBrief = GrowthBriefSchema.parse(JSON.parse(content));

  const u = message.usage;
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
