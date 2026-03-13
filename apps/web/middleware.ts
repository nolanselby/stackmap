import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple in-memory rate limiter (IP-based, resets on cold start)
// For production: replace with Upstash Redis
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT = 20 // requests per window
const WINDOW_MS = 60 * 1000 // 1 minute

function getRateLimitKey(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  )
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = ipRequestCounts.get(ip)

  if (!record || now > record.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  if (record.count >= RATE_LIMIT) return true

  record.count++
  return false
}

export function middleware(request: NextRequest) {
  // Only rate-limit the chat API route
  if (request.nextUrl.pathname === "/api/chat") {
    const ip = getRateLimitKey(request)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      )
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: "/api/chat",
}
