import {
  pgTable,
  uuid,
  text,
  boolean,
  date,
  timestamp,
  jsonb,
  integer,
  numeric,
  index,
} from "drizzle-orm/pg-core"

// pgvector type (raw SQL until drizzle-orm ships native support)
const vector = (name: string) =>
  text(name) // stored as text in schema, pgvector handles the actual type via raw SQL migrations

export const tools = pgTable(
  "tools",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    website_url: text("website_url"),
    logo_url: text("logo_url"),
    short_description: text("short_description"),
    long_description: text("long_description"),
    github_url: text("github_url"),
    open_source: boolean("open_source").default(false),
    launch_date: date("launch_date"),
    last_verified_at: timestamp("last_verified_at", { withTimezone: true }),
    status_active: boolean("status_active").default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({ slugIdx: index("tools_slug_idx").on(t.slug) })
)

export const toolMetadata = pgTable("tool_metadata", {
  id: uuid("id").primaryKey().defaultRandom(),
  tool_id: uuid("tool_id").references(() => tools.id, { onDelete: "cascade" }),
  categories: text("categories").array(),
  use_cases: text("use_cases").array(),
  target_personas: text("target_personas").array(),
  business_stages: text("business_stages").array(),
  api_available: boolean("api_available"),
  self_hostable: boolean("self_hostable"),
  enterprise_ready: boolean("enterprise_ready"),
  input_types: text("input_types").array(),
  output_types: text("output_types").array(),
  integrations: text("integrations").array(),
})

export const toolPricing = pgTable("tool_pricing", {
  id: uuid("id").primaryKey().defaultRandom(),
  tool_id: uuid("tool_id").references(() => tools.id, { onDelete: "cascade" }),
  free_tier: boolean("free_tier"),
  starting_price_monthly: numeric("starting_price_monthly"),
  pricing_model: text("pricing_model"),
  est_cost_5_users: numeric("est_cost_5_users"),
  est_cost_20_users: numeric("est_cost_20_users"),
  hidden_cost_notes: text("hidden_cost_notes"),
})

export const toolSignals = pgTable("tool_signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  tool_id: uuid("tool_id").references(() => tools.id, { onDelete: "cascade" }),
  github_stars: integer("github_stars"),
  github_last_commit: date("github_last_commit"),
  producthunt_votes: integer("producthunt_votes"),
  source_count: integer("source_count"),
  freshness_score: numeric("freshness_score"),
  popularity_score: numeric("popularity_score"),
  maintenance_score: numeric("maintenance_score"),
  trust_score: numeric("trust_score"),
  last_computed_at: timestamp("last_computed_at", { withTimezone: true }),
})

export const toolAlternatives = pgTable("tool_alternatives", {
  id: uuid("id").primaryKey().defaultRandom(),
  tool_id: uuid("tool_id").references(() => tools.id, { onDelete: "cascade" }),
  alternative_tool_id: uuid("alternative_tool_id").references(() => tools.id, {
    onDelete: "cascade",
  }),
  reason: text("reason"),
  cheaper: boolean("cheaper"),
  better_for_nontechnical: boolean("better_for_nontechnical"),
  better_for_enterprise: boolean("better_for_enterprise"),
})

export const stagingTools = pgTable("staging_tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  raw_data: jsonb("raw_data").notNull(),
  source: text("source").notNull(),
  source_id: text("source_id"),
  status: text("status").notNull().default("pending"),
  error_message: text("error_message"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const workflowModules = pgTable("workflow_modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  business_type: text("business_type").notNull(),
  stage: text("stage").notNull(),
  module_name: text("module_name").notNull(),
  required_capabilities: text("required_capabilities").array(),
  optional_capabilities: text("optional_capabilities").array(),
  typical_order: integer("typical_order"),
  dependencies: text("dependencies").array(),
  implementation_notes: text("implementation_notes"),
})

export const roadmaps = pgTable("roadmaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  short_id: text("short_id").unique().notNull(),
  input_idea: text("input_idea").notNull(),
  input_customer: text("input_customer"),
  input_budget_monthly: numeric("input_budget_monthly"),
  input_tech_level: text("input_tech_level"),
  input_preference: text("input_preference"),
  result_json: jsonb("result_json"),
  status: text("status").default("generating"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
})
