import { z } from "zod"

export const BUSINESS_TYPES = [
  "ai_sdr",
  "ai_customer_support",
  "ai_internal_search",
  "ai_content_ops",
  "ai_coding_assistant",
  "ai_research_tool",
  "ai_recruiting",
  "ai_data_enrichment",
  "ai_document_processing",
  "ai_voice_agent",
  "ai_ecommerce",
  "ai_analytics",
] as const

export const BusinessTypeSchema = z.enum(BUSINESS_TYPES)

export const WorkflowModuleSchema = z.object({
  id: z.string().uuid(),
  business_type: BusinessTypeSchema,
  stage: z.string(),
  module_name: z.string(),
  required_capabilities: z.array(z.string()),
  optional_capabilities: z.array(z.string()),
  typical_order: z.number().int().positive(),
  dependencies: z.array(z.string()),
  implementation_notes: z.string().nullable(),
})

export type BusinessType = z.infer<typeof BusinessTypeSchema>
export type WorkflowModule = z.infer<typeof WorkflowModuleSchema>
