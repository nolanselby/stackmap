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
    console.log("Detecting business type for idea:", input.idea)
    const { business_type } = await detectBusinessType(
      input.idea,
      input.customer ?? "",
      anthropicKey
    ).catch(e => {
       console.error("Stage 1 (Detection) failed:", e)
       throw new Error(`AI type detection failed: ${e.message}`)
    })

    // Stage 2: Retrieve tool candidates
    console.log("Retrieving candidates for business type:", business_type)
    const candidatesByStage = await retrieveCandidates(
      input.idea,
      business_type,
      input.budget_monthly,
      input.preference,
      openaiKey
    ).catch(e => {
       console.error("Stage 2 (Retrieval) failed:", e)
       throw new Error(`Candidate retrieval failed: ${e.message}`)
    })

    // Stage 3: Generate the roadmap
    console.log("Generating full roadmap with Anthropic...")
    const roadmapResult = await generateRoadmap({
      idea: input.idea,
      customer: input.customer ?? "",
      budgetMonthly: input.budget_monthly,
      techLevel: input.tech_level,
      preference: input.preference,
      businessType: business_type,
      candidatesByStage,
      apiKey: anthropicKey,
    }).catch(e => {
       console.error("Stage 3 (Generation) failed:", e)
       throw new Error(`Detailed roadmap generation failed: ${e.message}`)
    })

    // Save result
    console.log("Saving roadmap result to DB...")
    const { error: updateError } = await db
      .from("roadmaps")
      .update({ result_json: roadmapResult, status: "complete" })
      .eq("short_id", shortId)

    if (updateError) {
       console.error("DB Update failed:", updateError)
       throw new Error(`Failed to save roadmap: ${updateError.message}`)
    }

    console.log("Roadmap generation complete! ID:", shortId)
    return NextResponse.json({ short_id: shortId }, { status: 200 })
  } catch (err: any) {
    console.error("Roadmap generation error:", err)
    await db.from("roadmaps").update({ status: "failed" }).eq("short_id", shortId)
    return NextResponse.json(
      { error: err.message || "Generation failed. Please try again." },
      { status: 500 }
    )
  }
}
