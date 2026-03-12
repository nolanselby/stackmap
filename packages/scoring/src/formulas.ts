const STATUS_ACTIVE_THRESHOLD = 0.35

export function freshnessScore(launchDate: string | null, today: Date = new Date()): number {
  if (!launchDate) return 0.0
  const launch = new Date(launchDate)
  const daysSince = (today.getTime() - launch.getTime()) / (1000 * 60 * 60 * 24)
  return Math.max(0, 1 - daysSince / 730)
}

export function popularityScore(signals: {
  githubStars: number
  phVotes: number
  sourceCount: number
}): number {
  const githubComponent = Math.min(signals.githubStars / 5000, 1.0)
  const phComponent = Math.min(signals.phVotes / 1000, 1.0)
  const sourceComponent = Math.min(signals.sourceCount / 3, 1.0)
  return githubComponent * 0.5 + phComponent * 0.3 + sourceComponent * 0.2
}

export function sourceComponent(sourceCount: number): number {
  return Math.min(sourceCount / 3, 1.0)
}

export function maintenanceScore(
  lastCommit: string | null,
  isOpenSource: boolean,
  today: Date = new Date()
): number {
  if (!isOpenSource || !lastCommit) return 0.7
  const commit = new Date(lastCommit)
  const daysSince = (today.getTime() - commit.getTime()) / (1000 * 60 * 60 * 24)
  return Math.max(0, 1 - daysSince / 365)
}

export function trustScore(scores: {
  freshnessScore: number
  popularityScore: number
  maintenanceScore: number
  sourceComponent: number
}): number {
  return (
    scores.freshnessScore * 0.2 +
    scores.popularityScore * 0.4 +
    scores.maintenanceScore * 0.3 +
    scores.sourceComponent * 0.1
  )
}

export function isStatusActive(trust: number): boolean {
  return trust >= STATUS_ACTIVE_THRESHOLD
}
