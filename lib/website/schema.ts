import { z } from "zod";

/**
 * Structured business profile extracted from the founder's public website.
 * Feeds the brief generator so the AI understands WHO it's advising — not just
 * the numbers. All fields required (Claude structured-output json_schema).
 */
export const BusinessProfileSchema = z.object({
  whatTheySell: z.string().describe("Plain summary of the products/services sold."),
  valueProp: z.string().describe("Their core value proposition / positioning."),
  targetCustomer: z.string().describe("Who they sell to."),
  productCategories: z
    .array(z.string())
    .describe("Main product/service categories."),
  keyPages: z
    .array(z.object({ title: z.string(), url: z.string() }))
    .describe("Important pages found (home, about, key collections, pricing)."),
  pricingSignals: z
    .string()
    .describe("Anything observed about pricing/positioning (premium, budget, ranges)."),
  tone: z.string().describe("Brand voice/tone, e.g. playful, clinical, luxury."),
  notableClaims: z
    .array(z.string())
    .describe("Notable claims, social proof, or differentiators on the site."),
});

export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;
