import { inngest } from "../client"
import { fetchDirectoryPage } from "@roadmapper/ingest"
import { createServerClient } from "@roadmapper/db"

// Futurepedia category pages — update these URLs as needed
const DIRECTORY_SOURCES = [
  { url: "https://www.futurepedia.io/ai-tools", source: "futurepedia" as const },
  { url: "https://www.futurepedia.io/ai-tools/productivity", source: "futurepedia" as const },
  { url: "https://www.futurepedia.io/ai-tools/sales", source: "futurepedia" as const },
]

const RATE_LIMIT_MS = 1000 // 1 request per second per domain

export const ingestDirectoriesFn = inngest.createFunction(
  { id: "ingest-directories", name: "Daily Directory Ingest" },
  { cron: "0 3 * * *" }, // 3am UTC daily
  async ({ step, logger }) => {
    const db = createServerClient()
    let totalInserted = 0

    for (const { url, source } of DIRECTORY_SOURCES) {
      const tools = await step.run(`fetch-${source}-${url.split("/").pop()}`, async () => {
        await new Promise((r) => setTimeout(r, RATE_LIMIT_MS))
        return fetchDirectoryPage(url, source)
      })

      logger.info(`Fetched ${tools.length} tools from ${url}`)

      if (tools.length === 0) continue

      await step.run(`insert-${source}-${totalInserted}`, async () => {
        const { error } = await db.from("staging_tools").insert(
          tools.map((t) => ({
            raw_data: t.raw_data,
            source: t.source,
            source_id: t.source_id,
            status: "pending",
          }))
        )
        if (error) throw new Error(`DB insert failed: ${error.message}`)
      })

      totalInserted += tools.length
    }

    if (totalInserted > 0) {
      await step.sendEvent("trigger-enrichment", {
        name: "ingest/complete",
        data: { source: "directory", count: totalInserted },
      })
    }

    return { inserted: totalInserted }
  }
)
