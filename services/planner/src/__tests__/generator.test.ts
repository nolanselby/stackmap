import { describe, it, expect } from "vitest"
import { parseRoadmapResponse, calculateTotalCost } from "../generator"
import type { WorkflowStage } from "@roadmapper/schemas"

const SAMPLE_RESULT = {
  business_type: "ai_sdr",
  detected_business_type_confidence: 0.92,
  workflow_stages: [
    {
      stage_name: "Lead Sourcing",
      stage_order: 1,
      best_overall_tool: { tool_id: "00000000-0000-0000-0000-000000000001", name: "Apollo", why: "Best coverage" },
      cheapest_tool: { tool_id: "00000000-0000-0000-0000-000000000004", name: "Hunter.io", why: "Lower cost" },
      opensource_tool: null,
      why_chosen: "Apollo has the largest B2B database",
      monthly_cost_estimate: 49,
      setup_difficulty: "low",
      lock_in_risk: "medium",
      budget_constrained: false,
    },
    {
      stage_name: "Email Sequencing",
      stage_order: 2,
      best_overall_tool: { tool_id: "00000000-0000-0000-0000-000000000002", name: "Instantly", why: "Great deliverability" },
      cheapest_tool: null,
      opensource_tool: { tool_id: "00000000-0000-0000-0000-000000000005", name: "Mautic", why: "Self-hostable" },
      why_chosen: "Instantly handles high-volume outreach reliably",
      monthly_cost_estimate: 37,
      setup_difficulty: "medium",
      lock_in_risk: "low",
      budget_constrained: false,
    },
  ],
  total_monthly_cost_best_overall: 86,
  total_monthly_cost_cheapest: 49,
  build_sequence: [
    { week: 1, focus: "Core lead pipeline", tools: ["Apollo", "Instantly"] },
  ],
} satisfies {
  business_type: string
  detected_business_type_confidence: number
  workflow_stages: WorkflowStage[]
  total_monthly_cost_best_overall: number
  total_monthly_cost_cheapest: number
  build_sequence: { week: number; focus: string; tools: string[] }[]
}

describe("parseRoadmapResponse", () => {
  it("parses valid roadmap JSON", () => {
    const result = parseRoadmapResponse(JSON.stringify(SAMPLE_RESULT))
    expect(result.business_type).toBe("ai_sdr")
    expect(result.workflow_stages).toHaveLength(2)
    expect(result.workflow_stages[0].best_overall_tool.name).toBe("Apollo")
  })

  it("throws on invalid JSON", () => {
    expect(() => parseRoadmapResponse("not json")).toThrow()
  })

  it("throws on missing required fields", () => {
    expect(() => parseRoadmapResponse(JSON.stringify({ business_type: "ai_sdr" }))).toThrow()
  })
})

describe("calculateTotalCost", () => {
  it("sums monthly costs for best-overall variant", () => {
    const total = calculateTotalCost(SAMPLE_RESULT.workflow_stages, "best-overall")
    expect(total).toBe(86) // 49 + 37
  })

  it("sums monthly costs for cheapest variant, falling back to best_overall when cheapest is null", () => {
    const total = calculateTotalCost(SAMPLE_RESULT.workflow_stages, "cheapest")
    expect(total).toBe(49 + 37) // cheapest for stage 1 = Hunter $49, stage 2 cheapest=null falls back to Instantly $37
  })
})
