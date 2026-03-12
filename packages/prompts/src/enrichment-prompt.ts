export function buildEnrichmentPrompt(toolData: {
  name: string
  description: string
  homepageHtml: string
  pricingHtml: string | null
  githubReadme: string | null
}): string {
  return `You are classifying an AI tool for a directory. Extract structured information from the provided content.

Tool name: ${toolData.name}
Description: ${toolData.description}

Homepage content (truncated):
${toolData.homepageHtml.slice(0, 3000)}

${toolData.pricingHtml ? `Pricing page content:\n${toolData.pricingHtml.slice(0, 2000)}` : "No pricing page available."}

${toolData.githubReadme ? `GitHub README (truncated):\n${toolData.githubReadme.slice(0, 2000)}` : ""}

Extract the following information and respond with valid JSON matching the schema exactly. Be conservative — only state things you can verify from the content.`
}
