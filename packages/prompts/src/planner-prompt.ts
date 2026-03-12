export function buildPlannerPrompt(params: {
  idea: string
  customer: string
  budgetMonthly: number
  techLevel: string
  preference: string
  businessType: string
  candidatesByStage: Record<string, Array<{ tool_id: string; name: string; short_description: string; monthly_cost: number | null; free_tier: boolean; open_source: boolean }>>
}): string {
  const stagesJson = JSON.stringify(params.candidatesByStage, null, 2)

  return `You are building a roadmap for an AI startup. Select the best tools from the provided candidates for each workflow stage.

## Startup Context
Idea: ${params.idea}
Target customer: ${params.customer}
Monthly budget: $${params.budgetMonthly}
Technical level: ${params.techLevel}
Preference: ${params.preference}
Business type: ${params.businessType}

## Candidate Tools by Stage
${stagesJson}

## Instructions
- For each stage, select tools from the candidates list ONLY — do not invent tool names
- Choose best_overall_tool based on quality/fit
- Choose cheapest_tool as the lowest-cost option (null if best_overall is already free)
- Choose opensource_tool as a self-hostable option (null if none in candidates)
- Set budget_constrained to true if the cheapest available tool exceeds the user's budget cap for that stage
- build_sequence: group stages into weeks (max 2 stages per week), tools array should contain best_overall_tool names
- Respond with valid JSON matching the RoadmapResult schema exactly`
}
