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

// Maps workflow_module capability slugs → our DB tool category slugs
const CAPABILITY_TO_CATEGORIES: Record<string, string[]> = {
  // LLM / reasoning
  llm_chat: ["general-llm"],
  llm_summarization: ["general-llm"],
  llm_extraction: ["general-llm"],
  llm_qa: ["general-llm"],
  ai_scoring: ["general-llm", "productivity-automation"],
  ai_personalization: ["general-llm", "marketing-social"],
  structured_output: ["general-llm"],
  knowledge_base: ["general-llm", "productivity-automation"],
  doc_search: ["general-llm"],
  document_parsing: ["general-llm"],
  pdf_extraction: ["general-llm"],
  web_crawling: ["general-llm"],
  key_point_extraction: ["general-llm"],
  auto_resolution: ["general-llm", "productivity-automation"],
  intent_classification: ["general-llm", "productivity-automation"],
  // Coding
  ai_code_completion: ["coding-assistant"],
  ide_integration: ["coding-assistant"],
  automated_code_review: ["coding-assistant"],
  pr_integration: ["coding-assistant"],
  ai_test_generation: ["coding-assistant"],
  coverage_analysis: ["coding-assistant"],
  code_documentation: ["coding-assistant"],
  readme_generation: ["coding-assistant"],
  ci_cd_pipeline: ["backend-infra", "coding-assistant"],
  deployment_automation: ["backend-infra"],
  // Backend / infra
  vector_search: ["backend-infra"],
  hybrid_search: ["backend-infra"],
  natural_language_search: ["backend-infra", "general-llm"],
  csv_import: ["backend-infra", "productivity-automation"],
  api_input: ["backend-infra"],
  auth: ["backend-infra"],
  // Content / writing
  ai_text_generation: ["writing-content", "general-llm"],
  long_form_content: ["writing-content"],
  seo_analysis: ["writing-content"],
  on_page_optimization: ["writing-content"],
  keyword_research: ["writing-content", "marketing-social"],
  topic_ideation: ["writing-content", "general-llm"],
  rank_tracking: ["writing-content", "marketing-social"],
  // Image / design
  ai_image_generation: ["image-generation", "design-tools"],
  brand_kit: ["design-tools"],
  // Video / audio
  video_generation: ["video-generation"],
  text_to_speech: ["audio-generation"],
  voice_cloning: ["audio-generation"],
  call_handling: ["audio-generation", "meetings-transcription"],
  sip_integration: ["audio-generation"],
  // Automation / productivity
  workflow_automation: ["productivity-automation"],
  email_automation: ["marketing-social", "productivity-automation"],
  scheduling: ["productivity-automation", "marketing-social"],
  webhook: ["productivity-automation"],
  cms_integration: ["website-builder", "productivity-automation"],
  analytics_dashboard: ["productivity-automation", "marketing-social"],
  // CRM / marketing / sales
  crm_integration: ["marketing-social", "productivity-automation"],
  crm_sync: ["marketing-social", "productivity-automation"],
  contact_enrichment: ["marketing-social"],
  company_data: ["marketing-social", "general-llm"],
  email_lookup: ["marketing-social"],
  social_distribution: ["marketing-social"],
  multi_channel: ["marketing-social", "productivity-automation"],
  multi_channel_support: ["productivity-automation", "meetings-transcription"],
  ticket_creation: ["productivity-automation"],
  agent_routing: ["productivity-automation"],
  // Meetings / transcription
  ai_transcription: ["meetings-transcription"],
  call_recording: ["meetings-transcription"],
  real_time_transcription: ["meetings-transcription"],
  csat_tracking: ["meetings-transcription", "productivity-automation"],
  // Website
  website_builder: ["website-builder"],
}

// Maps each business type to the tool categories most useful for it (for bulk fallback fetch)
const BUSINESS_TYPE_CATEGORIES: Record<string, string[]> = {
  ai_sdr: ["marketing-social", "productivity-automation", "meetings-transcription", "general-llm"],
  ai_customer_support: ["productivity-automation", "general-llm", "meetings-transcription"],
  ai_content_ops: ["writing-content", "image-generation", "design-tools", "marketing-social", "general-llm", "productivity-automation"],
  ai_coding_assistant: ["coding-assistant", "backend-infra", "general-llm"],
  ai_research_tool: ["general-llm", "backend-infra", "productivity-automation"],
  ai_recruiting: ["marketing-social", "productivity-automation", "meetings-transcription", "general-llm"],
  ai_data_enrichment: ["productivity-automation", "marketing-social", "backend-infra"],
  ai_document_processing: ["general-llm", "productivity-automation", "backend-infra"],
  ai_voice_agent: ["audio-generation", "video-generation", "meetings-transcription", "general-llm"],
  ai_ecommerce: ["marketing-social", "website-builder", "backend-infra", "general-llm"],
  ai_analytics: ["productivity-automation", "backend-infra", "general-llm"],
  ai_internal_search: ["general-llm", "backend-infra", "productivity-automation"],
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

function extractMeta<T>(meta: unknown, key: string): T[] {
  if (!meta) return []
  const row = Array.isArray(meta) ? meta[0] : meta
  const val = (row as Record<string, unknown>)?.[key]
  return Array.isArray(val) ? (val as T[]) : []
}

export function groupByWorkflowStage(
  tools: ToolCandidate[],
  modules: WorkflowModuleRef[]
): Record<string, ToolCandidate[]> {
  const result: Record<string, ToolCandidate[]> = {}

  for (const module of modules) {
    // Resolve required capabilities → target category slugs
    const targetCategories = new Set<string>()
    for (const cap of module.required_capabilities) {
      const cats = CAPABILITY_TO_CATEGORIES[cap] ?? []
      cats.forEach((c) => targetCategories.add(c))
    }

    if (targetCategories.size > 0) {
      const matched = tools.filter((tool) =>
        tool.categories.some((cat) => targetCategories.has(cat))
      )
      result[module.module_name] =
        matched.length > 0 ? matched : tools.slice(0, 8)
    } else {
      // Fallback: word-overlap between module name tokens and tool text
      const moduleWords = module.module_name
        .split("_")
        .filter((w) => w.length > 3)
      const matched = tools.filter((tool) => {
        const text = [
          ...tool.categories,
          ...tool.use_cases,
          tool.short_description ?? "",
        ]
          .join(" ")
          .toLowerCase()
        return moduleWords.some((word) => text.includes(word))
      })
      result[module.module_name] =
        matched.length > 0 ? matched : tools.slice(0, 8)
    }
  }

  return result
}

/** Fetch all active tools for the given business type without requiring OpenAI embeddings */
async function retrieveByCategory(
  businessType: BusinessType,
  budgetMonthly: number,
  preference: "best-overall" | "cheapest" | "open-source",
  modules: WorkflowModuleRef[]
): Promise<Record<string, ToolCandidate[]>> {
  const db = createServerClient()

  // Collect all categories needed for this business type
  const relevantCategories =
    BUSINESS_TYPE_CATEGORIES[businessType as string] ??
    Object.values(BUSINESS_TYPE_CATEGORIES).flat()

  // Fetch all active tools whose metadata includes at least one relevant category.
  // PostgREST doesn't natively support array overlap in nested tables, so we
  // fetch all active tools and filter client-side (156 tools — trivial).
  const { data: allTools, error } = await db
    .from("tools")
    .select(`
      id,
      name,
      short_description,
      open_source,
      tool_metadata (categories, use_cases),
      tool_pricing (starting_price_monthly, free_tier)
    `)
    .eq("status_active", true)

  if (error) throw new Error(`DB fetch failed: ${error.message}`)

  const candidates: ToolCandidate[] = (allTools ?? []).map((t) => {
    const pricing = Array.isArray(t.tool_pricing) ? t.tool_pricing[0] : t.tool_pricing
    const categories = extractMeta<string>(t.tool_metadata, "categories")
    return {
      tool_id: t.id,
      name: t.name,
      short_description: t.short_description,
      starting_price_monthly:
        (pricing as { starting_price_monthly: number | null })?.starting_price_monthly ?? null,
      free_tier:
        (pricing as { free_tier: boolean | null })?.free_tier ?? null,
      open_source: t.open_source ?? false,
      categories,
      use_cases: extractMeta<string>(t.tool_metadata, "use_cases"),
    }
  })
    // Keep only tools from relevant categories (or tools with no category data)
    .filter((t) => {
      if (t.categories.length === 0) return true
      return t.categories.some((c) => relevantCategories.includes(c))
    })

  const budgetFiltered = applyBudgetFilter(candidates, budgetMonthly)
  const preferenceOrdered = applyPreferenceFilter(budgetFiltered, preference)

  return groupByWorkflowStage(preferenceOrdered, modules)
}

export async function retrieveCandidates(
  idea: string,
  businessType: BusinessType,
  budgetMonthly: number,
  preference: "best-overall" | "cheapest" | "open-source",
  openaiApiKey: string
): Promise<Record<string, ToolCandidate[]>> {
  const db = createServerClient()

  // Fetch workflow modules first (needed by both paths)
  const { data: modules } = await db
    .from("workflow_modules")
    .select("module_name, required_capabilities, typical_order, stage")
    .eq("business_type", businessType)
    .order("typical_order")

  let resolvedModules: WorkflowModuleRef[] = modules ?? []

  if (resolvedModules.length === 0) {
    resolvedModules = [
      { module_name: "getting_started", required_capabilities: ["llm_chat"], typical_order: 1, stage: "setup" },
      { module_name: "build_core", required_capabilities: ["ai_text_generation", "workflow_automation"], typical_order: 2, stage: "build" },
      { module_name: "launch", required_capabilities: ["analytics_dashboard"], typical_order: 3, stage: "launch" },
    ]
  }

  // ── Try vector search if key looks valid ──────────────────────────────────
  const keyLooksValid =
    openaiApiKey &&
    openaiApiKey.startsWith("sk-") &&
    !openaiApiKey.includes("placeholder")

  if (keyLooksValid) {
    try {
      const OpenAI = (await import("openai")).default
      const openai = new OpenAI({ apiKey: openaiApiKey })

      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: idea,
      })
      const embedding = embeddingRes.data[0].embedding

      const { data: similarTools, error } = await db.rpc("match_tools_by_embedding", {
        query_embedding: embedding,
        match_count: 100,
        min_score: 0.5,
      })

      if (!error && similarTools && similarTools.length > 0) {
        const toolIds = similarTools.map((t: { id: string }) => t.id)
        const { data: toolsWithMeta } = await db
          .from("tools")
          .select(`
            id, name, short_description, open_source,
            tool_metadata (categories, use_cases),
            tool_pricing (starting_price_monthly, free_tier)
          `)
          .in("id", toolIds)
          .eq("status_active", true)

        const candidates: ToolCandidate[] = (toolsWithMeta ?? []).map((t) => {
          const pricing = Array.isArray(t.tool_pricing) ? t.tool_pricing[0] : t.tool_pricing
          const categories = extractMeta<string>(t.tool_metadata, "categories")
          return {
            tool_id: t.id,
            name: t.name,
            short_description: t.short_description,
            starting_price_monthly:
              (pricing as { starting_price_monthly: number | null })?.starting_price_monthly ?? null,
            free_tier:
              (pricing as { free_tier: boolean | null })?.free_tier ?? null,
            open_source: t.open_source ?? false,
            categories,
            use_cases: extractMeta<string>(t.tool_metadata, "use_cases"),
          }
        })

        const budgetFiltered = applyBudgetFilter(candidates, budgetMonthly)
        const preferenceOrdered = applyPreferenceFilter(budgetFiltered, preference)
        return groupByWorkflowStage(preferenceOrdered.slice(0, 50), resolvedModules)
      }
    } catch {
      // Fall through to category-based retrieval
    }
  }

  // ── Category-based fallback (no OpenAI required) ──────────────────────────
  return retrieveByCategory(businessType, budgetMonthly, preference, resolvedModules)
}
