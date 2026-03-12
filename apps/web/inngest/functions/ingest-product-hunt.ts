import { inngest } from "../client"
import { fetchProductHuntPosts } from "@roadmapper/ingest"
import { createServerClient } from "@roadmapper/db"

export const ingestProductHuntFn = inngest.createFunction(
  { id: "ingest-product-hunt", name: "Daily Product Hunt Ingest" },
  { cron: "0 2 * * *" }, // 2am UTC daily
  async ({ step, logger }) => {
    const token = process.env.PRODUCT_HUNT_API_TOKEN!

    const posts = await step.run("fetch-posts", () =>
      fetchProductHuntPosts(token, 24)
    )

    const postRows = posts as Array<{ raw_data: Record<string, unknown>; source: string; source_id: string | null }>

    logger.info(`Fetched ${postRows.length} Product Hunt posts`)

    if (postRows.length === 0) return { inserted: 0 }

    const db = createServerClient()

    await step.run("insert-staging", async () => {
      const result = await db.from("staging_tools").insert(
        postRows.map((p) => ({
          raw_data: p.raw_data,
          source: p.source,
          source_id: p.source_id,
          status: "pending",
        }))
      )
      if (result.error) throw new Error(`DB insert failed: ${result.error.message}`)
    })

    // Trigger enrichment for each new record
    await step.sendEvent("trigger-enrichment", {
      name: "ingest/complete",
      data: { source: "product_hunt", count: postRows.length },
    })

    return { inserted: postRows.length }
  }
)
