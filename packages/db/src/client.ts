import { createClient } from "@supabase/supabase-js"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Server-side Supabase client (uses service role key — bypasses RLS)
export function createServerClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  return createClient(url, key)
}

// Drizzle client for type-safe queries
export function createDrizzleClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error("Missing DATABASE_URL")
  const client = postgres(connectionString)
  return drizzle(client, { schema })
}

export * from "./schema"
