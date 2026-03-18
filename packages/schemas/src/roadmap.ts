import { z } from "zod"
import { ToolRefSchema } from "./tool"

export const WorkflowStageSchema = z.object({
  stage_name: z.string(),
  stage_order: z.number().int().positive(),
  category: z.string(),
  best_overall_tool: ToolRefSchema,
  cheapest_tool: ToolRefSchema.nullable(),
  opensource_tool: ToolRefSchema.nullable(),
  why_chosen: z.string(),
  action_steps: z.array(z.string()).max(4).optional().default([]),
  monthly_cost_estimate: z.number().nonnegative(),
  setup_difficulty: z.enum(["low", "medium", "high"]),
  lock_in_risk: z.enum(["low", "medium", "high"]),
  budget_constrained: z.boolean().default(false),
})

export const BuildSequenceItemSchema = z.object({
  week: z.number().int().positive(),
  focus: z.string(),
  tools: z.array(z.string()), // tool names (not IDs)
})

export const RoadmapResultSchema = z.object({
  business_type: z.string(),
  detected_business_type_confidence: z.number().min(0).max(1),
  workflow_stages: z.array(WorkflowStageSchema),
  total_monthly_cost_best_overall: z.number().nonnegative(),
  total_monthly_cost_cheapest: z.number().nonnegative(),
  build_sequence: z.array(BuildSequenceItemSchema),
})

export const RoadmapInputSchema = z.object({
  idea: z.string().min(2).max(500),
  customer: z.string().max(200).optional(),
  budget_monthly: z.number().nonnegative(),
  tech_level: z.enum(["non-technical", "some-coding", "full-stack"]),
  preference: z.enum(["best-overall", "cheapest", "open-source"]),
})

export const RoadmapRecordSchema = z.object({
  id: z.string().uuid(),
  short_id: z.string().length(8),
  input_idea: z.string(),
  input_customer: z.string().nullable(),
  input_budget_monthly: z.number().nullable(),
  input_tech_level: z.string().nullable(),
  input_preference: z.string().nullable(),
  result_json: RoadmapResultSchema.nullable(),
  status: z.enum(["generating", "complete", "failed"]),
  created_at: z.string().datetime(),
})

export type WorkflowStage = z.infer<typeof WorkflowStageSchema>
export type RoadmapResult = z.infer<typeof RoadmapResultSchema>
export type RoadmapInput = z.infer<typeof RoadmapInputSchema>
export type RoadmapRecord = z.infer<typeof RoadmapRecordSchema>
