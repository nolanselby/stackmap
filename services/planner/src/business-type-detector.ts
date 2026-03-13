import Anthropic from "@anthropic-ai/sdk"
import { BusinessTypeSchema, BUSINESS_TYPES, type BusinessType } from "@roadmapper/schemas"
import { buildBusinessTypePrompt } from "@roadmapper/prompts"
import { z } from "zod"

const BusinessTypeResponseSchema = z.object({
  business_type: BusinessTypeSchema,
  confidence: z.number().min(0).max(1),
})

export function parseBusinessTypeResponse(raw: string): {
  business_type: BusinessType
  confidence: number
} {
  const parsed = JSON.parse(raw)
  return BusinessTypeResponseSchema.parse(parsed)
}

export async function detectBusinessType(
  idea: string,
  customer: string,
  apiKey: string
): Promise<{ business_type: BusinessType; confidence: number }> {
  const client = new Anthropic({ apiKey })

  const prompt = buildBusinessTypePrompt(idea, customer)

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 100,
    messages: [{ role: "user", content: prompt + "\n\nPlease respond in JSON format." }],
  })

  // Anthropic doesn't support response_format: 'json_object' in the same way OpenAI does natively yet via this SDK without prompt hints
  // But we can extract it.
  const content = response.content[0].type === 'text' ? response.content[0].text : ''
  if (!content) throw new Error("Empty business type response from Anthropic")

  // Simple extraction in case it added markdown blocks
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? jsonMatch[0] : content

  return parseBusinessTypeResponse(jsonStr)
}
