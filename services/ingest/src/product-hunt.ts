const PH_GRAPHQL_URL = "https://api.producthunt.com/v2/api/graphql"

interface PHPost {
  id: string
  name: string
  tagline: string
  url: string
  website: string | null
  votesCount: number
  createdAt: string
  thumbnail: { url: string } | null
}

interface PHResponse {
  data: {
    posts: {
      edges: Array<{ node: PHPost }>
    }
  }
}

export interface NormalizedStagingRecord {
  source: "product_hunt"
  source_id: string
  status: "pending"
  raw_data: {
    name: string
    website_url: string | null
    logo_url: string | null
    short_description: string
    producthunt_votes: number
    launch_date: string
  }
}

export function normalizeProductHuntPost(post: PHPost): NormalizedStagingRecord {
  return {
    source: "product_hunt",
    source_id: post.id,
    status: "pending",
    raw_data: {
      name: post.name,
      website_url: post.website ?? null,
      logo_url: post.thumbnail?.url ?? null,
      short_description: post.tagline,
      producthunt_votes: post.votesCount,
      launch_date: post.createdAt.slice(0, 10), // ISO date
    },
  }
}

export async function fetchProductHuntPosts(
  apiToken: string,
  hoursBack = 24
): Promise<NormalizedStagingRecord[]> {
  const postedAfter = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()

  const query = `
    query {
      posts(order: NEWEST, postedAfter: "${postedAfter}", topic: "artificial-intelligence") {
        edges {
          node {
            id
            name
            tagline
            url
            website
            votesCount
            createdAt
            thumbnail { url }
          }
        }
      }
    }
  `

  const res = await fetch(PH_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) throw new Error(`Product Hunt API error: ${res.status} ${res.statusText}`)

  const json: PHResponse = await res.json()
  return json.data.posts.edges.map(({ node }) => normalizeProductHuntPost(node))
}
