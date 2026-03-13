import { inngest } from "../client"
import { fetchGitHubRepos } from "@roadmapper/ingest"
import { createServerClient } from "@roadmapper/db"

export const ingestGitHubFn = inngest.createFunction(
  { id: "ingest-github", name: "Daily GitHub Ingest" },
  { cron: "30 2 * * *" }, // 2:30am UTC daily
  async ({ step, logger }) => {
    const token = process.env.GITHUB_TOKEN!

    const repos = await step.run("fetch-repos", () => fetchGitHubRepos(token))

    logger.info(`Fetched ${repos.length} GitHub repos`)

    if (repos.length === 0) return { inserted: 0 }

    const db = createServerClient()

    // Insert in batches of 100 to avoid payload limits
    const batches = []
    for (let i = 0; i < repos.length; i += 100) {
      batches.push(repos.slice(i, i + 100))
    }

    let inserted = 0
    for (const batch of batches) {
      await step.run(`insert-batch-${inserted}`, async () => {
        const { error } = await db.from("staging_tools").insert(
          batch.map((r) => ({
            raw_data: r.raw_data,
            source: r.source,
            source_id: r.source_id,
            status: "pending",
          }))
        )
        if (error) throw new Error(`DB insert failed: ${error.message}`)
      })
      inserted += batch.length
    }

    await step.sendEvent("trigger-enrichment", {
      name: "ingest/complete",
      data: { source: "github", count: inserted },
    })

    return { inserted }
  }
)
