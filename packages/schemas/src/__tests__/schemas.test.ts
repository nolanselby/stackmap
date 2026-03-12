import { describe, it, expect } from "vitest"
import {
  RoadmapInputSchema,
  EnrichmentOutputSchema,
  BusinessTypeSchema,
  BUSINESS_TYPES,
} from "../index"

describe("RoadmapInputSchema", () => {
  it("accepts valid input", () => {
    const result = RoadmapInputSchema.safeParse({
      idea: "An AI SDR tool for B2B SaaS companies",
      customer: "Sales teams",
      budget_monthly: 200,
      tech_level: "some-coding",
      preference: "best-overall",
    })
    expect(result.success).toBe(true)
  })

  it("rejects idea shorter than 10 chars", () => {
    const result = RoadmapInputSchema.safeParse({
      idea: "short",
      budget_monthly: 200,
      tech_level: "non-technical",
      preference: "cheapest",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid tech_level", () => {
    const result = RoadmapInputSchema.safeParse({
      idea: "A valid idea description here",
      budget_monthly: 100,
      tech_level: "expert",
      preference: "best-overall",
    })
    expect(result.success).toBe(false)
  })
})

describe("BusinessTypeSchema", () => {
  it("accepts all 12 business types", () => {
    for (const type of BUSINESS_TYPES) {
      expect(BusinessTypeSchema.safeParse(type).success).toBe(true)
    }
  })

  it("rejects unknown business type", () => {
    expect(BusinessTypeSchema.safeParse("ai_unknown").success).toBe(false)
  })
})

describe("EnrichmentOutputSchema", () => {
  it("accepts valid enrichment output", () => {
    const result = EnrichmentOutputSchema.safeParse({
      primary_category: "AI Sales",
      secondary_categories: ["CRM", "Outreach"],
      use_cases: ["lead generation", "email personalization"],
      target_personas: ["sales reps", "founders"],
      pricing_model: "seat",
      starting_price_monthly: 49,
      free_tier: false,
      has_api: true,
      self_hostable: false,
      integrations: ["Salesforce", "HubSpot"],
      best_for: ["B2B SaaS teams"],
      not_ideal_for: ["enterprise on-prem"],
    })
    expect(result.success).toBe(true)
  })

  it("accepts null starting_price_monthly", () => {
    const result = EnrichmentOutputSchema.safeParse({
      primary_category: "AI Coding",
      secondary_categories: [],
      use_cases: ["code completion"],
      target_personas: ["developers"],
      pricing_model: "open-source",
      starting_price_monthly: null,
      free_tier: true,
      has_api: false,
      self_hostable: true,
      integrations: [],
      best_for: ["solo developers"],
      not_ideal_for: [],
    })
    expect(result.success).toBe(true)
  })
})
