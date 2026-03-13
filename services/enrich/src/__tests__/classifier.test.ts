import { describe, it, expect, vi } from "vitest"
import { parseEnrichmentResponse } from "../classifier"

describe("parseEnrichmentResponse", () => {
  it("parses valid enrichment JSON", () => {
    const raw = JSON.stringify({
      primary_category: "AI Sales",
      secondary_categories: ["CRM"],
      use_cases: ["lead gen"],
      target_personas: ["founders"],
      pricing_model: "seat",
      starting_price_monthly: 49,
      free_tier: false,
      has_api: true,
      self_hostable: false,
      integrations: ["Salesforce"],
      best_for: ["B2B"],
      not_ideal_for: ["enterprise"],
    })

    const result = parseEnrichmentResponse(raw)
    expect(result.primary_category).toBe("AI Sales")
    expect(result.pricing_model).toBe("seat")
    expect(result.has_api).toBe(true)
  })

  it("throws on invalid JSON", () => {
    expect(() => parseEnrichmentResponse("not json")).toThrow()
  })

  it("throws on schema mismatch", () => {
    const badJson = JSON.stringify({ primary_category: "Sales" }) // missing required fields
    expect(() => parseEnrichmentResponse(badJson)).toThrow()
  })
})
