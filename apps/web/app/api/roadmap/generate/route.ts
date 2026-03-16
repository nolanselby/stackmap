import { NextResponse } from "next/server"
import { createServerClient } from "@roadmapper/db"
import { RoadmapInputSchema } from "@roadmapper/schemas"
import { detectBusinessType, retrieveCandidates, generateRoadmap } from "@roadmapper/planner"
import { nanoid } from "nanoid"

// Allow up to 60s for the planner to complete (Vercel Pro; ignored locally)
export const maxDuration = 60

const NANOID_LENGTH = 8

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
  const shortId = nanoid(NANOID_LENGTH)

  // Create roadmap record
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
    console.error("Failed to insert roadmap:", insertError)
    return NextResponse.json(
      { error: "Failed to create roadmap. Please try again." },
      { status: 500 }
    )
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY ?? ""

  if (!anthropicKey) {
    await db.from("roadmaps").update({ status: "failed" }).eq("short_id", shortId)
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 500 }
    )
  }

  try {
    // Stage 1: Detect business type
    const { business_type } = await detectBusinessType(
      input.idea,
      input.customer ?? "",
      anthropicKey
    )

    // Stage 2: Retrieve tool candidates
    const candidatesByStage = await retrieveCandidates(
      input.idea,
      business_type,
      input.budget_monthly,
      input.preference,
      openaiKey
    )

    // Stage 3: Generate the roadmap
    const roadmapResult = await generateRoadmap({
      idea: input.idea,
      customer: input.customer ?? "",
      budgetMonthly: input.budget_monthly,
      techLevel: input.tech_level,
      preference: input.preference,
      businessType: business_type,
      candidatesByStage,
      apiKey: anthropicKey,
    })

    // Save result
    const { error: updateError } = await db
      .from("roadmaps")
      .update({ result_json: roadmapResult, status: "complete" })
      .eq("short_id", shortId)

    if (updateError) throw new Error(`Failed to save result: ${updateError.message}`)

    return NextResponse.json({ short_id: shortId }, { status: 200 })
  } catch (err) {
    console.error("Roadmap generation error:", err)
    await db.from("roadmaps").update({ status: "failed" }).eq("short_id", shortId)
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    )
  }
}
