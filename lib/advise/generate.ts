import Anthropic from "@anthropic-ai/sdk";
import { AdviceSchema, type Advice } from "./schema";
import { ADVISE_SYSTEM_PROMPT, FOLLOWUP_SYSTEM_PROMPT } from "./prompt";

/**
 * "Ask Synapse" — answer a founder's decision from CURRENT data + recalled MEMORY.
 *
 * The scaling design: `recalledMemories` is the output of `mubit.recall(question)`
 * (mubit holds every product's full history; recall returns only the slice relevant
 * to THIS question), and `dataBlock` is the current snapshot. We never dump the whole
 * store into the prompt. Same Anthropic setup as the brief engine: structured output
 * (json_schema) + a Zod backstop, cached system prefix, adaptive thinking.
 */

export const ADVISE_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";
const EFFORT = process.env.ANTHROPIC_EFFORT ?? "high";

export interface AskAdviceInput {
  /** The founder's question / proposed decision. */
  question: string;
  /** What mubit recalled for this question (the relevant past patterns). */
  recalledMemories: string[];
  /** Formatted current-week data block (formatWeeklyDataForPrompt in prod). */
  dataBlock: string;
}

export interface AskAdviceResult {
  advice: Advice;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheReadInputTokens: number;
    cacheCreationInputTokens: number;
  };
}

const ADVICE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    headline: { type: "string" },
    stance: { type: "string", enum: ["do", "dont", "caution"] },
    summary: { type: "string" },
    signals: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          detail: { type: "string" },
        },
        required: ["label", "detail"],
      },
    },
    memory_used: { type: "array", items: { type: "string" } },
    recommended_move: { type: "string" },
  },
  required: ["headline", "stance", "summary", "signals", "memory_used", "recommended_move"],
} as const;

function buildUserMessage(input: AskAdviceInput): string {
  const memoryBlock =
    input.recalledMemories.length > 0
      ? input.recalledMemories.map((m, i) => `  ${i + 1}. ${m}`).join("\n")
      : "  (Nothing relevant recalled yet — answer from the current data and say memory is thin.)";

  return [
    "== THE FOUNDER'S QUESTION ==",
    input.question.trim(),
    "",
    "== CURRENT DATA ==",
    input.dataBlock,
    "",
    "== WHAT YOU REMEMBER (recalled for this question) ==",
    memoryBlock,
    "",
    "Answer the founder now.",
  ].join("\n");
}

export async function askAdvice(
  input: AskAdviceInput,
  client?: Anthropic,
): Promise<AskAdviceResult> {
  const anthropic = client ?? new Anthropic();

  const outputConfig: Anthropic.OutputConfig = {
    format: { type: "json_schema", schema: ADVICE_JSON_SCHEMA as Record<string, unknown> },
  };
  if (EFFORT !== "none") {
    outputConfig.effort = EFFORT as Anthropic.OutputConfig["effort"];
  }

  const message = await anthropic.messages.create({
    model: ADVISE_MODEL,
    max_tokens: 16000,
    system: [{ type: "text", text: ADVISE_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    thinking: { type: "adaptive" },
    output_config: outputConfig,
    messages: [{ role: "user", content: buildUserMessage(input) }],
  });

  if (message.stop_reason === "refusal") {
    throw new Error("Model refused to answer.");
  }

  const content = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");
  if (!content) {
    throw new Error(`Empty advice (stop_reason=${message.stop_reason}). Likely hit max_tokens.`);
  }

  const advice: Advice = AdviceSchema.parse(JSON.parse(content));

  const u = message.usage;
  return {
    advice,
    usage: {
      inputTokens: u.input_tokens,
      outputTokens: u.output_tokens,
      cacheReadInputTokens: u.cache_read_input_tokens ?? 0,
      cacheCreationInputTokens: u.cache_creation_input_tokens ?? 0,
    },
  };
}

// ── Follow-up turns (defend / justify the verdict, conversationally) ──────────

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface FollowUpInput {
  /** The exact data block the verdict was based on (so defence cites the same numbers). */
  dataBlock: string;
  /** The exact recalled memories the verdict used. */
  recalledMemories: string[];
  /** The conversation so far. Must start with the founder's first question (role "user")
   *  and end with their latest follow-up (role "user"). */
  messages: ChatTurn[];
}

/**
 * Answer a follow-up conversationally, grounded in the SAME data + memory as the
 * verdict. Returns plain text (not the structured Advice) — this is the founder
 * interrogating the call, and Synapse defending it with specifics. The current
 * data + memory are injected into the first user turn so the model can only cite
 * what it was actually given.
 */
export async function followUpAdvice(input: FollowUpInput, client?: Anthropic): Promise<string> {
  const anthropic = client ?? new Anthropic();
  if (input.messages.length === 0 || input.messages[0].role !== "user") {
    throw new Error("followUpAdvice: messages must start with the founder's question.");
  }

  const memoryBlock =
    input.recalledMemories.length > 0
      ? input.recalledMemories.map((m, i) => `  ${i + 1}. ${m}`).join("\n")
      : "  (Memory is thin — say so rather than inventing.)";

  const groundedFirstTurn = [
    "== THE STORE'S CURRENT DATA (the only numbers you may cite) ==",
    input.dataBlock,
    "",
    "== WHAT YOU REMEMBER ABOUT THIS STORE ==",
    memoryBlock,
    "",
    "Ground every answer in the data and memory above. Here is our conversation — answer my latest message.",
    "",
    "== MY FIRST QUESTION ==",
    input.messages[0].content.trim(),
  ].join("\n");

  const apiMessages: Anthropic.MessageParam[] = [
    { role: "user", content: groundedFirstTurn },
    ...input.messages.slice(1).map((m) => ({ role: m.role, content: m.content })),
  ];

  const message = await anthropic.messages.create({
    model: ADVISE_MODEL,
    max_tokens: 6000,
    system: [{ type: "text", text: FOLLOWUP_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    thinking: { type: "adaptive" },
    messages: apiMessages,
  });

  if (message.stop_reason === "refusal") {
    throw new Error("Model refused to answer the follow-up.");
  }
  const text = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
  if (!text) {
    throw new Error(`Empty follow-up (stop_reason=${message.stop_reason}).`);
  }
  return text;
}
