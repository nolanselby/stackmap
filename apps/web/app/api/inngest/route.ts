import { serve } from "inngest/next"
import { inngest } from "@/inngest/client"
import { enrichProcessToolFn } from "@/inngest/functions/enrich-process-tool"
import { enrichFanoutFn } from "@/inngest/functions/enrich-fanout"
import { plannerGenerateRoadmapFn } from "@/inngest/functions/planner-generate-roadmap"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    enrichProcessToolFn,
    enrichFanoutFn,
    plannerGenerateRoadmapFn,
  ],
})
