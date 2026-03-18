import Anthropic from "@anthropic-ai/sdk"
import { RoadmapResultSchema, type RoadmapResult, type WorkflowStage } from "@roadmapper/schemas"
import { buildPlannerPrompt } from "@roadmapper/prompts"
import type { ToolCandidate } from "./retriever"

export function parseRoadmapResponse(raw: string): RoadmapResult {
  const parsed = JSON.parse(raw)
  return RoadmapResultSchema.parse(parsed)
}

export function calculateTotalCost(
  stages: WorkflowStage[],
  variant: "best-overall" | "cheapest" | "open-source"
): number {
  return stages.reduce((sum, stage) => {
    let tool
    if (variant === "cheapest") {
      tool = stage.cheapest_tool ?? stage.best_overall_tool
    } else if (variant === "open-source") {
      tool = stage.opensource_tool ?? stage.best_overall_tool
    } else {
      tool = stage.best_overall_tool
    }
    return sum + (stage.monthly_cost_estimate || 0)
  }, 0)
}

export async function generateRoadmap(params: {
  idea: string
  customer: string
  budgetMonthly: number
  techLevel: "non-technical" | "some-coding" | "full-stack"
  preference: "best-overall" | "cheapest" | "open-source"
  businessType: string
  candidatesByStage: Record<string, ToolCandidate[]>
  apiKey: string
}): Promise<RoadmapResult> {
  const client = new Anthropic({ apiKey: params.apiKey })

  const prompt = buildPlannerPrompt({
    idea: params.idea,
    customer: params.customer,
    budgetMonthly: params.budgetMonthly,
    techLevel: params.techLevel,
    preference: params.preference,
    businessType: params.businessType,
    candidatesByStage: Object.fromEntries(
      Object.entries(params.candidatesByStage).map(([stage, tools]) => [
        stage,
        tools.slice(0, 8).map((t) => ({
          tool_id: t.tool_id,
          name: t.name,
          short_description: t.short_description ?? "",
          monthly_cost: t.starting_price_monthly,
          free_tier: t.free_tier ?? false,
          open_source: t.open_source,
          recommendation_weight: t.recommendation_weight,
        })),
      ])
    ),
  })

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt + "\n\nPlease respond in strict JSON format according to the schema description." }],
  })

  const content = response.content[0].type === 'text' ? response.content[0].text : ''
  if (!content) throw new Error("Empty roadmap response from Anthropic")

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? jsonMatch[0] : content

  return parseRoadmapResponse(jsonStr)
}
