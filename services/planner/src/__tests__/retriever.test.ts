import { describe, it, expect } from "vitest"
import { applyBudgetFilter, applyPreferenceFilter, groupByWorkflowStage } from "../retriever"

const SAMPLE_CANDIDATES = [
  {
    tool_id: "1",
    name: "ExpensiveTool",
    short_description: null,
    starting_price_monthly: 500,
    free_tier: false,
    open_source: false,
    categories: ["AI Sales"],
    use_cases: ["lead gen"],
  },
  {
    tool_id: "2",
    name: "CheapTool",
    short_description: null,
    starting_price_monthly: 29,
    free_tier: false,
    open_source: false,
    categories: ["AI Sales"],
    use_cases: ["lead gen"],
  },
  {
    tool_id: "3",
    name: "FreeTool",
    short_description: null,
    starting_price_monthly: null,
    free_tier: true,
    open_source: false,
    categories: ["AI Sales"],
    use_cases: ["email automation"],
  },
  {
    tool_id: "4",
    name: "OSSTool",
    short_description: null,
    starting_price_monthly: null,
    free_tier: true,
    open_source: true,
    categories: ["AI Sales"],
    use_cases: ["lead gen"],
  },
]

describe("applyBudgetFilter", () => {
  it("excludes tools above budget when budget > 0", () => {
    const result = applyBudgetFilter(SAMPLE_CANDIDATES, 100)
    const names = result.map((t) => t.name)
    expect(names).not.toContain("ExpensiveTool")
    expect(names).toContain("CheapTool")
    expect(names).toContain("FreeTool")
  })

  it("includes free-tier tools regardless of budget", () => {
    const result = applyBudgetFilter(SAMPLE_CANDIDATES, 0)
    expect(result.every((t) => t.free_tier || t.open_source || !t.starting_price_monthly)).toBe(true)
  })

  it("returns all tools when budget is 1000+ (unlimited)", () => {
    const result = applyBudgetFilter(SAMPLE_CANDIDATES, 1000)
    expect(result.length).toBe(SAMPLE_CANDIDATES.length)
  })
})

describe("applyPreferenceFilter", () => {
  it("open-source preference ranks open source tools higher (puts them first)", () => {
    const result = applyPreferenceFilter(SAMPLE_CANDIDATES, "open-source")
    expect(result[0].name).toBe("OSSTool")
  })

  it("cheapest preference ranks lowest-cost tools first", () => {
    const result = applyPreferenceFilter(SAMPLE_CANDIDATES, "cheapest")
    // Free tools first, then cheapest paid
    const firstPaidIndex = result.findIndex((t) => (t.starting_price_monthly ?? 0) > 0)
    if (firstPaidIndex > 0) {
      expect(result[firstPaidIndex].starting_price_monthly).toBeLessThan(
        result[firstPaidIndex + 1]?.starting_price_monthly ?? Infinity
      )
    }
  })
})

describe("groupByWorkflowStage", () => {
  it("assigns tools to stages based on capability match", () => {
    const modules = [
      {
        module_name: "lead_sourcing",
        required_capabilities: ["lead gen"],
        typical_order: 1,
        stage: "discovery",
      },
    ]
    const result = groupByWorkflowStage(SAMPLE_CANDIDATES, modules)
    expect(result["lead_sourcing"]).toBeDefined()
    expect(result["lead_sourcing"].length).toBeGreaterThan(0)
  })

  it("returns empty array for stage with no matching tools", () => {
    const modules = [
      {
        module_name: "voice_calls",
        required_capabilities: ["sip_integration"],
        typical_order: 1,
        stage: "telephony",
      },
    ]
    const result = groupByWorkflowStage(SAMPLE_CANDIDATES, modules)
    expect(result["voice_calls"]).toEqual([])
  })
})
