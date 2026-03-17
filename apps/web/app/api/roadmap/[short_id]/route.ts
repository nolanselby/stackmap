import { NextResponse } from "next/server"
import { createServerClient } from "@roadmapper/db"

export async function GET(
  _request: Request,
  { params }: { params: { short_id: string } }
) {
  const db = createServerClient()

  const { data, error } = await db
    .from("roadmaps")
    .select("status, result_json")
    .eq("short_id", params.short_id)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: "Roadmap not found" }, { status: 404 })
  }

  let toolsMeta: Record<string, { logo_url: string | null; website_url: string | null; short_description: string | null }> = {}

  if (data.status === "complete" && data.result_json) {
    const result = data.result_json as { workflow_stages?: Array<{ best_overall_tool?: { tool_id: string }; cheapest_tool?: { tool_id: string } | null; opensource_tool?: { tool_id: string } | null }> }
    const toolIds = new Set<string>()
    for (const stage of result.workflow_stages ?? []) {
      if (stage.best_overall_tool?.tool_id) toolIds.add(stage.best_overall_tool.tool_id)
      if (stage.cheapest_tool?.tool_id) toolIds.add(stage.cheapest_tool.tool_id)
      if (stage.opensource_tool?.tool_id) toolIds.add(stage.opensource_tool.tool_id)
    }

    if (toolIds.size > 0) {
      const { data: tools } = await db
        .from("tools")
        .select("id, logo_url, website_url, short_description")
        .in("id", Array.from(toolIds))

      if (tools) {
        for (const t of tools) {
          toolsMeta[t.id] = {
            logo_url: t.logo_url,
            website_url: t.website_url,
            short_description: t.short_description,
          }
        }
      }
    }
  }

  return NextResponse.json({
    status: data.status,
    roadmap: data.result_json ?? null,
    tools_meta: toolsMeta,
  })
}
