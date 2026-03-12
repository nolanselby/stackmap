import { BUSINESS_TYPES } from "@roadmapper/schemas"

export function buildBusinessTypePrompt(idea: string, customer: string): string {
  return `Classify this startup idea into exactly one of the following business types.

Startup idea: "${idea}"
Target customer: "${customer}"

Business types:
${BUSINESS_TYPES.map((t) => `- ${t}`).join("\n")}

Respond with JSON: { "business_type": "<one of the above>", "confidence": <0.0-1.0> }`
}
