import OpenAI from "openai"
import { createServerClient } from "@roadmapper/db"
import type { BusinessType } from "@roadmapper/schemas"

export interface ToolCandidate {
  tool_id: string
  name: string
  short_description: string | null
  starting_price_monthly: number | null
  free_tier: boolean | null
  open_source: boolean
  categories: string[]
  use_cases: string[]
}

interface WorkflowModuleRef {
  module_name: string
  required_capabilities: string[]
  typical_order: number
  stage: string
}

export function applyBudgetFilter(
  tools: ToolCandidate[],
  budgetMonthly: number
): ToolCandidate[] {
  if (budgetMonthly >= 1000) return tools // unlimited
  return tools.filter((t) => {
    if (t.free_tier || t.open_source || !t.starting_price_monthly) return true
    return t.starting_price_monthly <= budgetMonthly
  })
}

export function applyPreferenceFilter(
  tools: ToolCandidate[],
  preference: "best-overall" | "cheapest" | "open-source"
): ToolCandidate[] {
  const copy = [...tools]
  if (preference === "open-source") {
    copy.sort((a, b) => Number(b.open_source) - Number(a.open_source))
  } else if (preference === "cheapest") {
    copy.sort((a, b) => {
      const aPrice = a.free_tier ? 0 : (a.starting_price_monthly ?? 9999)
      const bPrice = b.free_tier ? 0 : (b.starting_price_monthly ?? 9999)
      return aPrice - bPrice
    })
  }
  return copy
}

export function groupByWorkflowStage(
  tools: ToolCandidate[],
  modules: WorkflowModuleRef[]
): Record<string, ToolCandidate[]> {
  const result: Record<string, ToolCandidate[]> = {}

  for (const module of modules) {
    result[module.module_name] = tools.filter((tool) => {
      const toolText = [
        ...(tool.categories ?? []),
        ...(tool.use_cases ?? []),
        tool.short_description ?? "",
      ]
        .join(" ")
        .toLowerCase()

      return module.required_capabilities.some((cap) =>
        toolText.includes(cap.toLowerCase().replace(/_/g, " "))
      )
    })
  }

  return result
}

export async function retrieveCandidates(
  idea: string,
  businessType: BusinessType,
  budgetMonthly: number,
  preference: "best-overall" | "cheapest" | "open-source",
  openaiApiKey: string
): Promise<Record<string, ToolCandidate[]>> {
  const db = createServerClient()
  const openai = new OpenAI({ apiKey: openaiApiKey })

  // Generate embedding for the idea
  const embeddingRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: idea,
  })
  const embedding = embeddingRes.data[0].embedding

  // pgvector similarity search — top 100 candidates
  const { data: similarTools, error } = await db.rpc("match_tools_by_embedding", {
    query_embedding: embedding,
    match_count: 100,
    min_score: 0.5,
  })

  if (error) throw new Error(`Vector search failed: ${error.message}`)

  // Fetch metadata and pricing for matched tools
  const toolIds = (similarTools ?? []).map((t: { id: string }) => t.id)

  const { data: toolsWithMeta } = await db
    .from("tools")
    .select(`
      id,
      name,
      short_description,
      open_source,
      tool_metadata (categories, use_cases),
      tool_pricing (starting_price_monthly, free_tier)
    `)
    .in("id", toolIds)
    .eq("status_active", true)

  const candidates: ToolCandidate[] = (toolsWithMeta ?? []).map((t) => ({
    tool_id: t.id,
    name: t.name,
    short_description: t.short_description,
    starting_price_monthly: (t.tool_pricing as { starting_price_monthly: number | null }[] | null)?.[0]?.starting_price_monthly ?? null,
    free_tier: (t.tool_pricing as { free_tier: boolean | null }[] | null)?.[0]?.free_tier ?? null,
    open_source: t.open_source ?? false,
    categories: (t.tool_metadata as { categories: string[] | null }[] | null)?.[0]?.categories ?? [],
    use_cases: (t.tool_metadata as { use_cases: string[] | null }[] | null)?.[0]?.use_cases ?? [],
  }))

  // Apply filters
  const budgetFiltered = applyBudgetFilter(candidates, budgetMonthly)
  const preferenceOrdered = applyPreferenceFilter(budgetFiltered, preference)

  // Fetch workflow modules for business type
  const { data: modules } = await db
    .from("workflow_modules")
    .select("module_name, required_capabilities, typical_order, stage")
    .eq("business_type", businessType)
    .order("typical_order")

  return groupByWorkflowStage(preferenceOrdered.slice(0, 50), modules ?? [])
}
