import { z } from "zod"

export const ToolSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  website_url: z.string().url().nullable(),
  logo_url: z.string().url().nullable(),
  short_description: z.string().nullable(),
  long_description: z.string().nullable(),
  github_url: z.string().url().nullable(),
  open_source: z.boolean().default(false),
  launch_date: z.string().nullable(), // ISO date string
  last_verified_at: z.string().datetime().nullable(),
  status_active: z.boolean().default(false),
  created_at: z.string().datetime(),
})

export const ToolRefSchema = z.object({
  tool_id: z.string().uuid(),
  name: z.string(),
  why: z.string(),
})

export const StagingToolSchema = z.object({
  id: z.string().uuid(),
  raw_data: z.record(z.unknown()),
  source: z.enum(["manual", "import"]),
  source_id: z.string().nullable(),
  status: z.enum(["pending", "enriching", "enriched", "failed", "duplicate"]),
  error_message: z.string().nullable(),
  created_at: z.string().datetime(),
})

export type Tool = z.infer<typeof ToolSchema>
export type ToolRef = z.infer<typeof ToolRefSchema>
export type StagingTool = z.infer<typeof StagingToolSchema>
