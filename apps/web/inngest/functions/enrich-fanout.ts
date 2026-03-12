import { inngest } from "../client"
import { createServerClient } from "@roadmapper/db"

// Triggered after each ingest job completes — fans out enrichment per pending staged tool
export const enrichFanoutFn = inngest.createFunction(
  { id: "enrich-fanout", name: "Enrich: Fan-out Pending Tools" },
  { event: "ingest/complete" },
  async ({ step, logger }) => {
    const db = createServerClient()

    const pending = await step.run("fetch-pending", async () => {
      const result = await db
        .from("staging_tools")
        .select("id")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(500)
      return result.data ?? []
    })

    const rows = pending as Array<{ id: string }>

    if (!rows || rows.length === 0) {
      logger.info("No pending staging tools to enrich")
      return { fanned_out: 0 }
    }

    await step.sendEvent(
      "fan-out-enrichment",
      rows.map((row) => ({
        name: "tool/enrich",
        data: { stagingId: row.id },
      }))
    )

    logger.info(`Fanned out enrichment for ${rows.length} tools`)
    return { fanned_out: rows.length }
  }
)
