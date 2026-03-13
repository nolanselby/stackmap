import { NextResponse } from "next/server"
import { createServerClient } from "@roadmapper/db"
import { RoadmapInputSchema } from "@roadmapper/schemas"
import { inngest } from "@/inngest/client"
import { nanoid } from "nanoid"

const NANOID_LENGTH = 8

function generateShortId() {
  return nanoid(NANOID_LENGTH)
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = RoadmapInputSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    return NextResponse.json(
      { error: `Missing required field: ${firstError.path.join(".")}` },
      { status: 400 }
    )
  }

  const input = parsed.data
  const db = createServerClient()

  // Generate short_id with collision retry
  let shortId: string | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const candidate = generateShortId()
    const { data: existing } = await db
      .from("roadmaps")
      .select("id")
      .eq("short_id", candidate)
      .maybeSingle()

    if (!existing) {
      shortId = candidate
      break
    }
  }

  if (!shortId) {
    return NextResponse.json(
      { error: "Failed to create roadmap. Please try again." },
      { status: 500 }
    )
  }

  // Insert roadmap record
  const { error: insertError } = await db.from("roadmaps").insert({
    short_id: shortId,
    input_idea: input.idea,
    input_customer: input.customer ?? null,
    input_budget_monthly: input.budget_monthly,
    input_tech_level: input.tech_level,
    input_preference: input.preference,
    status: "generating",
  })

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to create roadmap. Please try again." },
      { status: 500 }
    )
  }

  // Trigger Inngest planner function
  await inngest.send({
    name: "roadmap/generate",
    data: { shortId, input },
  })

  return NextResponse.json({ short_id: shortId }, { status: 200 })
}
