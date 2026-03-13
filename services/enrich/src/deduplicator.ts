export function canonicalizeDomain(url: string | null): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    // Strip www. and all subdomains to get root domain
    const parts = parsed.hostname.split(".")
    if (parts.length >= 2) {
      return parts.slice(-2).join(".")
    }
    return parsed.hostname
  } catch {
    return null
  }
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

interface ExistingTool {
  website_url: string | null
  slug: string
}

export function isDuplicate(
  websiteUrl: string | null,
  slug: string,
  existing: ExistingTool[]
): boolean {
  const incomingDomain = canonicalizeDomain(websiteUrl)

  for (const tool of existing) {
    // Domain match (primary)
    if (incomingDomain && tool.website_url) {
      const existingDomain = canonicalizeDomain(tool.website_url)
      if (existingDomain && existingDomain === incomingDomain) return true
    }
    // Slug match (fallback, e.g. GitHub repos with no homepage)
    if (tool.slug === slug) return true
  }

  return false
}
