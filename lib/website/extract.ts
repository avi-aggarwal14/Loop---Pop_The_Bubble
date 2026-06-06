import OpenAI from "openai";
import { BusinessProfileSchema, type BusinessProfile } from "./schema";
import type { FetchedSite } from "./fetch";

/**
 * Extract a structured BusinessProfile from scraped website text using OpenAI
 * structured output. Same strict-json_schema approach as lib/brief/generate.ts.
 * Extraction isn't reasoning-heavy, so reasoning_effort is left off by default.
 */

const EXTRACT_MODEL = process.env.OPENAI_EXTRACT_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-5";

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
  client?: OpenAI,
): Promise<BusinessProfile> {
  const openai = client ?? new OpenAI();

  const pageList = site.pages.map((p) => `- ${p.title || "(untitled)"} → ${p.url}`).join("\n");
  const userContent = [
    `Website origin: ${site.origin}`,
    `Pages crawled:\n${pageList}`,
    "",
    "Website text:",
    site.combinedText,
  ].join("\n");

  const completion = await openai.chat.completions.create({
    model: EXTRACT_MODEL,
    max_completion_tokens: 4000,
    messages: [
      { role: "system", content: EXTRACT_SYSTEM },
      { role: "user", content: userContent },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "business_profile", strict: true, schema: PROFILE_JSON_SCHEMA },
    },
  });

  const content = completion.choices[0]?.message.content;
  if (!content) throw new Error("Empty business-profile extraction");
  return BusinessProfileSchema.parse(JSON.parse(content));
}
