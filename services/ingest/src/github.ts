const GITHUB_API_URL = "https://api.github.com"
const AI_TOPICS = ["artificial-intelligence", "llm", "ai-tools", "generative-ai"]
const MIN_STARS = 50

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null | ""
  stargazers_count: number
  pushed_at: string
  created_at: string
  topics: string[]
}

export interface NormalizedGitHubRecord {
  source: "github"
  source_id: string
  status: "pending"
  raw_data: {
    name: string
    website_url: string | null
    github_url: string
    short_description: string | null
    github_stars: number
    github_last_commit: string
    open_source: boolean
    launch_date: string
  }
}

export function normalizeGitHubRepo(repo: GitHubRepo): NormalizedGitHubRecord {
  return {
    source: "github",
    source_id: String(repo.id),
    status: "pending",
    raw_data: {
      name: repo.name,
      website_url: repo.homepage && repo.homepage.trim() !== "" ? repo.homepage : null,
      github_url: repo.html_url,
      short_description: repo.description,
      github_stars: repo.stargazers_count,
      github_last_commit: repo.pushed_at.slice(0, 10),
      open_source: true,
      launch_date: repo.created_at.slice(0, 10),
    },
  }
}

export async function fetchGitHubRepos(
  token: string
): Promise<NormalizedGitHubRecord[]> {
  const results: NormalizedGitHubRecord[] = []
  const seen = new Set<number>()

  for (const topic of AI_TOPICS) {
    const url = `${GITHUB_API_URL}/search/repositories?q=topic:${topic}+stars:>=${MIN_STARS}&sort=updated&order=desc&per_page=100`

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    })

    if (!res.ok) {
      console.error(`GitHub API error for topic ${topic}: ${res.status}`)
      continue
    }

    const json: { items: GitHubRepo[] } = await res.json()

    for (const repo of json.items) {
      if (!seen.has(repo.id)) {
        seen.add(repo.id)
        results.push(normalizeGitHubRepo(repo))
      }
    }

    // Respect GitHub rate limits — 1s between topic queries
    await new Promise((r) => setTimeout(r, 1000))
  }

  return results
}
