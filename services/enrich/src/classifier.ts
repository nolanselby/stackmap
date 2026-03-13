import Anthropic from "@anthropic-ai/sdk"
import { EnrichmentOutputSchema, type EnrichmentOutput } from "@roadmapper/schemas"
import { buildEnrichmentPrompt } from "@roadmapper/prompts"
import type { EnrichmentInput } from "./scraper"

export function parseEnrichmentResponse(raw: string): EnrichmentOutput {
  const parsed = JSON.parse(raw)
  return EnrichmentOutputSchema.parse(parsed)
}

export async function classifyTool(
  input: EnrichmentInput,
  apiKey: string
): Promise<EnrichmentOutput> {
  const client = new Anthropic({ apiKey })

  const prompt = buildEnrichmentPrompt(input)

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt + "\n\nPlease respond in strict JSON format." }],
  })

  const content = response.content[0].type === 'text' ? response.content[0].text : ''
  if (!content) throw new Error("Empty response from Anthropic")

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? jsonMatch[0] : content

  return parseEnrichmentResponse(jsonStr)
}
