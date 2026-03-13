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

  return NextResponse.json({
    status: data.status,
    roadmap: data.result_json ?? null,
  })
}
