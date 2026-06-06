import Anthropic from "@anthropic-ai/sdk";
import { BusinessProfileSchema, type BusinessProfile } from "./schema";
import type { FetchedSite } from "./fetch";

/**
 * Extract a structured BusinessProfile from scraped website text using Claude's
 * structured outputs. Same `output_config.format` + zod-backstop approach as
 * lib/brief/generate.ts. Extraction isn't reasoning-heavy, so thinking is left off.
 */

const EXTRACT_MODEL =
  process.env.ANTHROPIC_EXTRACT_MODEL ?? process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";

const EXTRACT_SYSTEM = `You extract a structured business profile from a company's OWN website text.
Be strictly factual: use only what the text supports. If something isn't stated, write "unknown"
for string fields or leave arrays empty. Never invent products, claims, or pricing. Keep entries concise.`;

const PROFILE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    whatTheySell: { type: "string" },
    valueProp: { type: "string" },
    targetCustomer: { type: "string" },
    productCategories: { type: "array", items: { type: "string" } },
    keyPages: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: { title: { type: "string" }, url: { type: "string" } },
        required: ["title", "url"],
      },
    },
    pricingSignals: { type: "string" },
    tone: { type: "string" },
    notableClaims: { type: "array", items: { type: "string" } },
  },
  required: [
    "whatTheySell",
    "valueProp",
    "targetCustomer",
    "productCategories",
    "keyPages",
    "pricingSignals",
    "tone",
    "notableClaims",
  ],
} as const;

export async function extractBusinessProfile(
  site: FetchedSite,
  client?: Anthropic,
): Promise<BusinessProfile> {
  const anthropic = client ?? new Anthropic();

  const pageList = site.pages.map((p) => `- ${p.title || "(untitled)"} → ${p.url}`).join("\n");
  const userContent = [
    `Website origin: ${site.origin}`,
    `Pages crawled:\n${pageList}`,
    "",
    "Website text:",
    site.combinedText,
  ].join("\n");

  const message = await anthropic.messages.create({
    model: EXTRACT_MODEL,
    max_tokens: 4000,
    system: EXTRACT_SYSTEM,
    output_config: {
      format: { type: "json_schema", schema: PROFILE_JSON_SCHEMA as Record<string, unknown> },
    },
    messages: [{ role: "user", content: userContent }],
  });

  if (message.stop_reason === "refusal") {
    throw new Error("Model refused the business-profile extraction.");
  }
  const content = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");
  if (!content) throw new Error("Empty business-profile extraction");
  return BusinessProfileSchema.parse(JSON.parse(content));
}
