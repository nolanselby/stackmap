import { inngest } from "../client"
import { createServerClient } from "@roadmapper/db"
import { detectBusinessType } from "@roadmapper/planner"
import { retrieveCandidates } from "@roadmapper/planner"
import { generateRoadmap } from "@roadmapper/planner"
import type { RoadmapInput } from "@roadmapper/schemas"

export const plannerGenerateRoadmapFn = inngest.createFunction(
  {
    id: "planner-generate-roadmap",
    name: "Planner: Generate Roadmap",
    retries: 2,
    timeouts: { finish: "4m" }, // Set to 'failed' on timeout
  },
  { event: "roadmap/generate" },
  async ({ event, step, logger }) => {
    const { shortId, input } = event.data as {
      shortId: string
      input: RoadmapInput
    }

    const db = createServerClient()
    const anthropicKey = process.env.ANTHROPIC_API_KEY!
    const openaiKey = process.env.OPENAI_API_KEY!

    logger.info(`Generating roadmap ${shortId} for idea: "${input.idea.slice(0, 80)}..."`)

    try {
      // Stage 1: Detect business type (using Anthropic)
      const { business_type, confidence } = await step.run("detect-business-type", () =>
        detectBusinessType(input.idea, input.customer ?? "", anthropicKey)
      )

      logger.info(`Detected business type: ${business_type} (confidence: ${confidence.toFixed(2)})`)

      // Stage 2: Retrieve candidates (using OpenAI for embeddings)
      const candidatesByStage = await step.run("retrieve-candidates", () =>
        retrieveCandidates(
          input.idea,
          business_type,
          input.budget_monthly,
          input.preference,
          openaiKey
        )
      )

      const totalCandidates = Object.values(candidatesByStage).reduce(
        (sum, tools) => sum + tools.length, 0
      )
      logger.info(`Retrieved ${totalCandidates} candidates across ${Object.keys(candidatesByStage).length} stages`)

      // Stage 3: Generate roadmap (using Anthropic)
      const roadmapResult = await step.run("generate-roadmap", () =>
        generateRoadmap({
          idea: input.idea,
          customer: input.customer ?? "",
          budgetMonthly: input.budget_monthly,
          techLevel: input.tech_level,
          preference: input.preference,
          businessType: business_type,
          candidatesByStage,
          apiKey: anthropicKey,
        })
      )

      // Write result — throw inside step so Inngest retries on DB failure
      await step.run("write-result", async () => {
        const { error } = await db
          .from("roadmaps")
          .update({ result_json: roadmapResult, status: "complete" })
          .eq("short_id", shortId)
        if (error) throw new Error(`Failed to write roadmap result: ${error.message}`)
      })

      logger.info(`Roadmap ${shortId} complete`)
      return { shortId, status: "complete" }
    } catch (err) {
      // Mark as failed so polling stops
      await db
        .from("roadmaps")
        .update({ status: "failed" })
        .eq("short_id", shortId)

      throw err // Rethrow so Inngest logs the error
    }
  }
)
