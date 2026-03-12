import { z } from "zod"

export const EnrichmentOutputSchema = z.object({
  primary_category: z.string(),
  secondary_categories: z.array(z.string()),
  use_cases: z.array(z.string()),
  target_personas: z.array(z.string()),
  pricing_model: z.enum(["seat", "usage", "flat", "open-source"]),
  starting_price_monthly: z.number().nullable(),
  free_tier: z.boolean(),
  has_api: z.boolean(),
  self_hostable: z.boolean(),
  integrations: z.array(z.string()),
  best_for: z.array(z.string()),
  not_ideal_for: z.array(z.string()),
})

export type EnrichmentOutput = z.infer<typeof EnrichmentOutputSchema>
