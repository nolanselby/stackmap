import { Inngest } from "inngest"

export const inngest = new Inngest({
  id: "ai-tool-roadmapper",
  eventKey: process.env.INNGEST_EVENT_KEY,
})
