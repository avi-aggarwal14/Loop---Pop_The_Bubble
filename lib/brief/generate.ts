import OpenAI from "openai";
import { GrowthBriefSchema, type GrowthBrief } from "./schema.js";
import { SYSTEM_PROMPT } from "./prompt.js";
import { formatWeeklyDataForPrompt, type WeeklyData } from "../metrics/types.js";

/**
 * Generates a Growth Brief from this week's metrics plus what mubit recalled
 * about the founder.
 *
 * Provider: OpenAI (the team has OpenAI credits). This is the ONLY provider-
 * specific file — schema, mubit, metrics, and the harness are all neutral.
 *
 * - Structured output: strict json_schema → the model must return our exact shape,
 *   and we still validate with the zod schema as a backstop.
 * - Caching: OpenAI caches long prompt prefixes automatically (no cache_control
 *   needed). We keep the stable SYSTEM_PROMPT first and the volatile metrics +
 *   recalled memory in the user turn, so the cached prefix stays byte-stable.
 */

// Model is env-driven so you can point it at whatever your credits cover.
export const BRIEF_MODEL = process.env.OPENAI_MODEL ?? "gpt-5";
// Reasoning models (gpt-5, o-series) accept reasoning_effort; set to "none" to omit
// (e.g. if you switch OPENAI_MODEL to a non-reasoning model like gpt-4.1).
const REASONING_EFFORT = process.env.OPENAI_REASONING_EFFORT ?? "medium";

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
 * Wire contract for the model's JSON output. Mirrors GrowthBriefSchema; strict
 * mode requires additionalProperties:false and every property listed in required.
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
  client?: OpenAI,
): Promise<GenerateBriefResult> {
  const openai = client ?? new OpenAI();

  const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
    model: BRIEF_MODEL,
    max_completion_tokens: 16000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT }, // stable → auto-cached prefix
      { role: "user", content: buildUserMessage(input) }, // volatile → after prefix
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "growth_brief",
        strict: true,
        schema: BRIEF_JSON_SCHEMA,
      },
    },
  };
  if (REASONING_EFFORT !== "none") {
    // Cast: not every model in the type union accepts this, but reasoning models do.
    (params as { reasoning_effort?: string }).reasoning_effort = REASONING_EFFORT;
  }

  const completion = await openai.chat.completions.create(params);
  const choice = completion.choices[0];

  if (choice?.message.refusal) {
    throw new Error(`Model refused to generate the brief: ${choice.message.refusal}`);
  }
  const content = choice?.message.content;
  if (!content) {
    throw new Error(
      `Empty brief (finish_reason=${choice?.finish_reason}). Likely hit max_completion_tokens.`,
    );
  }

  // Strict schema guarantees the shape, but validate anyway — single source of truth.
  const brief: GrowthBrief = GrowthBriefSchema.parse(JSON.parse(content));

  const u = completion.usage;
  return {
    brief,
    usage: {
      inputTokens: u?.prompt_tokens ?? 0,
      outputTokens: u?.completion_tokens ?? 0,
      cacheReadInputTokens: u?.prompt_tokens_details?.cached_tokens ?? 0,
      cacheCreationInputTokens: 0, // OpenAI caching is automatic; no separate write count.
    },
  };
}
