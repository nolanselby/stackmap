export function buildPlannerPrompt(params: {
  idea: string
  customer: string
  budgetMonthly: number
  techLevel: string
  preference: string
  businessType: string
  candidatesByStage: Record<
    string,
    Array<{
      tool_id: string
      name: string
      short_description: string
      monthly_cost: number | null
      free_tier: boolean
      open_source: boolean
    }>
  >
}): string {
  const stagesJson = JSON.stringify(params.candidatesByStage, null, 2)

  return `You are an expert AI tool stack advisor. Your job is to select the best tools from the provided candidates and build a practical roadmap for a founder.

## Founder Context
Idea: ${params.idea}
Target customer: ${params.customer || "Not specified"}
Monthly budget: $${params.budgetMonthly}
Technical level: ${params.techLevel}
Preference: ${params.preference}
Business type: ${params.businessType}

## Candidate Tools by Stage
Below are the tool candidates for each workflow stage. You MUST only use tools from this list — never invent tool names.

${stagesJson}

## Instructions
For each stage that has candidates:
- best_overall_tool: best fit for quality and reliability
- cheapest_tool: lowest cost option (set to null if best_overall is already free/cheapest)
- opensource_tool: best open-source/self-hostable option (set to null if none available in that stage)
- why_chosen: 1-2 sentences explaining why this tool fits
- monthly_cost_estimate: realistic monthly cost in USD (0 if free)
- setup_difficulty: "low" (drag-drop/no-code), "medium" (some config), or "high" (dev work needed)
- lock_in_risk: "low" (easy to switch), "medium", or "high" (very hard to migrate)
- budget_constrained: true if the cheapest tool still exceeds the user's budget

For build_sequence: group stages into weeks showing a practical build order (max 2 stages per week). The tools array should contain the best_overall_tool names.

Skip stages that have zero candidates in the list above.

## Required JSON Schema
Respond ONLY with a valid JSON object exactly matching this structure (no markdown, no explanation):

{
  "business_type": "${params.businessType}",
  "detected_business_type_confidence": 0.9,
  "workflow_stages": [
    {
      "stage_name": "string — human-readable stage name",
      "stage_order": 1,
      "best_overall_tool": { "tool_id": "uuid", "name": "Tool Name", "why": "one sentence" },
      "cheapest_tool": { "tool_id": "uuid", "name": "Tool Name", "why": "one sentence" } | null,
      "opensource_tool": { "tool_id": "uuid", "name": "Tool Name", "why": "one sentence" } | null,
      "why_chosen": "Why this tool fits this stage for the founder",
      "monthly_cost_estimate": 0,
      "setup_difficulty": "low" | "medium" | "high",
      "lock_in_risk": "low" | "medium" | "high",
      "budget_constrained": false
    }
  ],
  "total_monthly_cost_best_overall": 0,
  "total_monthly_cost_cheapest": 0,
  "build_sequence": [
    { "week": 1, "focus": "What to set up this week", "tools": ["Tool Name"] }
  ]
}

Important: total_monthly_cost_best_overall and total_monthly_cost_cheapest must be the SUM of the monthly_cost_estimate values across all stages.`
}
