import { serve } from "inngest/next"
import { inngest } from "@/inngest/client"
import { ingestProductHuntFn } from "@/inngest/functions/ingest-product-hunt"
import { ingestGitHubFn } from "@/inngest/functions/ingest-github"
import { ingestDirectoriesFn } from "@/inngest/functions/ingest-directories"
import { enrichProcessToolFn } from "@/inngest/functions/enrich-process-tool"
import { enrichFanoutFn } from "@/inngest/functions/enrich-fanout"
import { plannerGenerateRoadmapFn } from "@/inngest/functions/planner-generate-roadmap"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    ingestProductHuntFn,
    ingestGitHubFn,
    ingestDirectoriesFn,
    enrichProcessToolFn,
    enrichFanoutFn,
    plannerGenerateRoadmapFn,
  ],
})
