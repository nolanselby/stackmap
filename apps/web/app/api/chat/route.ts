import { streamText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { CHAT_SYSTEM_PROMPT } from "@roadmapper/prompts"
import { z } from "zod"

const MAX_MESSAGES = 6

const RequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { messages } = parsed.data
  const cappedMessages = messages.slice(-MAX_MESSAGES)

  try {
    const result = streamText({
      model: anthropic("claude-3-5-sonnet-20240620"),
      system: CHAT_SYSTEM_PROMPT,
      messages: cappedMessages,
      tools: {
        submit_inputs: {
          description: "Call this when you have collected all required inputs from the user",
          parameters: z.object({
            idea: z.string().describe("The startup idea description"),
            customer: z.string().describe("The target customer"),
            budget_monthly: z.number().describe("Monthly budget in USD"),
            tech_level: z
              .enum(["non-technical", "some-coding", "full-stack"])
              .describe("Technical level of the founder/team"),
            preference: z
              .enum(["best-overall", "cheapest", "open-source"])
              .describe("Tool preference"),
          }),
        },
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to generate response. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
