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
  uniqueIndex,
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
    canonical_name: text("canonical_name"),
    company_name: text("company_name"),
    website_url: text("website_url"),
    logo_url: text("logo_url"),
    short_description: text("short_description"),
    long_description: text("long_description"),
    github_url: text("github_url"),
    open_source: boolean("open_source").default(false),
    self_hostable: boolean("self_hostable").default(false),
    api_available: boolean("api_available").default(false),
    docs_url: text("docs_url"),
    tool_type: text("tool_type"),
    lifecycle_status: text("lifecycle_status").notNull().default("active"),
    founded_year: integer("founded_year"),
    launch_date: date("launch_date"),
    last_verified_at: timestamp("last_verified_at", { withTimezone: true }),
    status_active: boolean("status_active").default(false),
    embedding: vector("embedding"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    slugIdx: index("tools_slug_idx").on(t.slug),
    statusActiveIdx: index("tools_status_active_idx").on(t.status_active),
    websiteUrlIdx: index("tools_website_url_idx").on(t.website_url),
  })
)

export const sources = pgTable(
  "sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").unique().notNull(),
    name: text("name").notNull(),
    source_type: text("source_type").notNull(),
    base_url: text("base_url"),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    keyIdx: index("sources_key_idx").on(t.key),
  })
)

export const sourceRuns = pgTable(
  "source_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source_id: uuid("source_id").notNull().references(() => sources.id),
    run_type: text("run_type").notNull(),
    status: text("status").notNull(),
    started_at: timestamp("started_at", { withTimezone: true }),
    finished_at: timestamp("finished_at", { withTimezone: true }),
    records_fetched: integer("records_fetched").default(0),
    records_inserted: integer("records_inserted").default(0),
    records_updated: integer("records_updated").default(0),
    error_message: text("error_message"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    sourceIdIdx: index("source_runs_source_id_idx").on(t.source_id),
  })
)

export const rawToolRecords = pgTable(
  "raw_tool_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source_id: uuid("source_id").notNull().references(() => sources.id),
    source_run_id: uuid("source_run_id").references(() => sourceRuns.id),
    external_id: text("external_id").notNull(),
    external_url: text("external_url"),
    title: text("title"),
    raw_description: text("raw_description"),
    raw_payload: jsonb("raw_payload").notNull(),
    raw_hash: text("raw_hash").notNull(),
    discovered_at: timestamp("discovered_at", { withTimezone: true }).defaultNow().notNull(),
    last_seen_at: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
    canonical_tool_id: uuid("canonical_tool_id"),
    ingestion_status: text("ingestion_status").notNull().default("pending"),
  },
  (t) => ({
    sourceExternalUnique: uniqueIndex("raw_tool_records_source_external_unique").on(
      t.source_id,
      t.external_id
    ),
    sourceIdIdx: index("raw_tool_records_source_id_idx").on(t.source_id),
    sourceRunIdIdx: index("raw_tool_records_source_run_id_idx").on(t.source_run_id),
    canonicalToolIdIdx: index("raw_tool_records_canonical_tool_id_idx").on(t.canonical_tool_id),
  })
)

export const toolAliases = pgTable(
  "tool_aliases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tool_id: uuid("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    alias: text("alias").notNull(),
    alias_type: text("alias_type").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    toolIdIdx: index("tool_aliases_tool_id_idx").on(t.tool_id),
    toolAliasUnique: uniqueIndex("tool_aliases_tool_id_alias_unique").on(t.tool_id, t.alias),
  })
)

export const toolDomains = pgTable(
  "tool_domains",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tool_id: uuid("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    is_primary: boolean("is_primary").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    toolDomainUnique: uniqueIndex("tool_domains_tool_id_domain_unique").on(t.tool_id, t.domain),
    domainIdx: index("tool_domains_domain_idx").on(t.domain),
    toolIdIdx: index("tool_domains_tool_id_idx").on(t.tool_id),
  })
)

export const toolLinks = pgTable(
  "tool_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tool_id: uuid("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    link_type: text("link_type").notNull(),
    url: text("url").notNull(),
    is_primary: boolean("is_primary").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    toolIdIdx: index("tool_links_tool_id_idx").on(t.tool_id),
    typeIdx: index("tool_links_type_idx").on(t.link_type),
    toolUrlUnique: uniqueIndex("tool_links_tool_id_url_unique").on(t.tool_id, t.url),
  })
)

export const toolMetadata = pgTable(
  "tool_metadata",
  {
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
  },
  (t) => ({
    toolIdIdx: index("tool_metadata_tool_id_idx").on(t.tool_id),
    toolIdUnique: uniqueIndex("tool_metadata_tool_id_unique").on(t.tool_id),
  })
)

export const toolPricing = pgTable(
  "tool_pricing",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tool_id: uuid("tool_id").references(() => tools.id, { onDelete: "cascade" }),
    plan_name: text("plan_name").notNull().default("default"),
    pricing_model_id: uuid("pricing_model_id"),
    billing_interval: text("billing_interval"),
    currency: text("currency").default("USD"),
    price_numeric: numeric("price_numeric", { precision: 12, scale: 2 }),
    usage_unit: text("usage_unit"),
    usage_amount: numeric("usage_amount", { precision: 12, scale: 2 }),
    free_tier: boolean("free_tier"),
    starting_price_monthly: numeric("starting_price_monthly"),
    pricing_model: text("pricing_model"),
    est_cost_5_users: numeric("est_cost_5_users"),
    est_cost_20_users: numeric("est_cost_20_users"),
    hidden_cost_notes: text("hidden_cost_notes"),
    enterprise_only: boolean("enterprise_only").notNull().default(false),
    notes: text("notes"),
    source_url: text("source_url"),
    extracted_at: timestamp("extracted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    toolIdIdx: index("tool_pricing_tool_id_idx").on(t.tool_id),
    toolPlanUnique: uniqueIndex("tool_pricing_tool_id_plan_unique").on(t.tool_id, t.plan_name),
  })
)

export const toolSignals = pgTable(
  "tool_signals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tool_id: uuid("tool_id").references(() => tools.id, { onDelete: "cascade" }),
    github_stars: integer("github_stars"),
    github_forks: integer("github_forks"),
    github_last_commit: date("github_last_commit"),
    github_last_commit_at: timestamp("github_last_commit_at", { withTimezone: true }),
    producthunt_votes: integer("producthunt_votes"),
    producthunt_featured_at: timestamp("producthunt_featured_at", { withTimezone: true }),
    traffic_estimate: integer("traffic_estimate"),
    review_count: integer("review_count"),
    source_count: integer("source_count").default(0),
    freshness_score: numeric("freshness_score"),
    popularity_score: numeric("popularity_score"),
    maintenance_score: numeric("maintenance_score"),
    trust_score: numeric("trust_score"),
    last_computed_at: timestamp("last_computed_at", { withTimezone: true }),
    calculated_at: timestamp("calculated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    toolIdIdx: index("tool_signals_tool_id_idx").on(t.tool_id),
    toolIdUnique: uniqueIndex("tool_signals_tool_id_unique").on(t.tool_id),
  })
)

export const toolAlternatives = pgTable(
  "tool_alternatives",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tool_id: uuid("tool_id").references(() => tools.id, { onDelete: "cascade" }),
    alternative_tool_id: uuid("alternative_tool_id").references(() => tools.id, {
      onDelete: "cascade",
    }),
    alternative_type: text("alternative_type"),
    reason: text("reason"),
    cheaper: boolean("cheaper"),
    better_for_nontechnical: boolean("better_for_nontechnical"),
    better_for_enterprise: boolean("better_for_enterprise"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    toolIdIdx: index("tool_alternatives_tool_id_idx").on(t.tool_id),
    altToolIdIdx: index("tool_alternatives_alt_tool_id_idx").on(t.alternative_tool_id),
    pairUnique: uniqueIndex("tool_alternatives_pair_unique").on(t.tool_id, t.alternative_tool_id),
    typedUnique: uniqueIndex("tool_alternatives_unique_typed").on(
      t.tool_id,
      t.alternative_tool_id,
      t.alternative_type
    ),
  })
)

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parent_id: uuid("parent_id"),
    slug: text("slug").unique().notNull(),
    name: text("name").notNull(),
    description: text("description"),
    category_type: text("category_type").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    parentIdIdx: index("categories_parent_id_idx").on(t.parent_id),
  })
)

export const toolCategories = pgTable(
  "tool_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tool_id: uuid("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    category_id: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    confidence: numeric("confidence", { precision: 5, scale: 4 }),
    source: text("source").notNull(),
    is_primary: boolean("is_primary").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    toolCategoryUnique: uniqueIndex("tool_categories_tool_category_unique").on(
      t.tool_id,
      t.category_id
    ),
    toolIdIdx: index("tool_categories_tool_id_idx").on(t.tool_id),
    categoryIdIdx: index("tool_categories_category_id_idx").on(t.category_id),
  })
)

export const capabilities = pgTable(
  "capabilities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").unique().notNull(),
    name: text("name").notNull(),
    description: text("description"),
    capability_group: text("capability_group").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: index("capabilities_slug_idx").on(t.slug),
  })
)

export const toolCapabilities = pgTable(
  "tool_capabilities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tool_id: uuid("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    capability_id: uuid("capability_id")
      .notNull()
      .references(() => capabilities.id, { onDelete: "cascade" }),
    confidence: numeric("confidence", { precision: 5, scale: 4 }),
    source: text("source").notNull(),
    strength: text("strength"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    toolCapabilityUnique: uniqueIndex("tool_capabilities_tool_capability_unique").on(
      t.tool_id,
      t.capability_id
    ),
    toolIdIdx: index("tool_capabilities_tool_id_idx").on(t.tool_id),
    capabilityIdIdx: index("tool_capabilities_capability_id_idx").on(t.capability_id),
  })
)

export const toolAttributes = pgTable(
  "tool_attributes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tool_id: uuid("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    attribute_key: text("attribute_key").notNull(),
    attribute_value_json: jsonb("attribute_value_json").notNull(),
    source: text("source").notNull(),
    confidence: numeric("confidence", { precision: 5, scale: 4 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    toolIdIdx: index("tool_attributes_tool_id_idx").on(t.tool_id),
    keyIdx: index("tool_attributes_key_idx").on(t.attribute_key),
  })
)

export const toolIntegrations = pgTable(
  "tool_integrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tool_id: uuid("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    integration_name: text("integration_name").notNull(),
    integration_type: text("integration_type"),
    is_official: boolean("is_official"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    toolIdIdx: index("tool_integrations_tool_id_idx").on(t.tool_id),
    nameIdx: index("tool_integrations_name_idx").on(t.integration_name),
    toolNameUnique: uniqueIndex("tool_integrations_tool_id_name_unique").on(
      t.tool_id,
      t.integration_name
    ),
  })
)

export const pricingModels = pgTable("pricing_models", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
})

export const toolUsageCosts = pgTable(
  "tool_usage_costs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tool_id: uuid("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    scenario_key: text("scenario_key").notNull(),
    monthly_estimated_cost: numeric("monthly_estimated_cost", { precision: 12, scale: 2 }),
    assumptions_json: jsonb("assumptions_json"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    toolScenarioUnique: uniqueIndex("tool_usage_costs_tool_scenario_unique").on(
      t.tool_id,
      t.scenario_key
    ),
    toolIdIdx: index("tool_usage_costs_tool_id_idx").on(t.tool_id),
  })
)

export const toolHealthSnapshots = pgTable(
  "tool_health_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tool_id: uuid("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    snapshot_date: date("snapshot_date").notNull(),
    github_stars: integer("github_stars"),
    github_last_commit_at: timestamp("github_last_commit_at", { withTimezone: true }),
    homepage_status_code: integer("homepage_status_code"),
    docs_status_code: integer("docs_status_code"),
    pricing_page_status_code: integer("pricing_page_status_code"),
    is_reachable: boolean("is_reachable"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    toolSnapshotUnique: uniqueIndex("tool_health_snapshots_tool_snapshot_unique").on(
      t.tool_id,
      t.snapshot_date
    ),
    toolIdIdx: index("tool_health_snapshots_tool_id_idx").on(t.tool_id),
    snapshotDateIdx: index("tool_health_snapshots_snapshot_date_idx").on(t.snapshot_date),
  })
)

export const stagingTools = pgTable(
  "staging_tools",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    raw_data: jsonb("raw_data").notNull(),
    source: text("source").notNull(),
    source_id: text("source_id"),
    status: text("status").notNull().default("pending"),
    error_message: text("error_message"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    statusIdx: index("staging_tools_status_idx").on(t.status),
    sourceIdx: index("staging_tools_source_idx").on(t.source),
    sourceCompositeIdx: index("staging_tools_source_composite_idx").on(t.source, t.source_id),
  })
)

export const workflowModules = pgTable(
  "workflow_modules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    business_type: text("business_type").notNull(),
    stage: text("stage").notNull(),
    module_name: text("module_name").notNull(),
    workflow_template_id: uuid("workflow_template_id"),
    slug: text("slug"),
    name: text("name"),
    description: text("description"),
    module_type: text("module_type").notNull().default("core"),
    stage_order: integer("stage_order"),
    is_required: boolean("is_required").notNull().default(true),
    required_capabilities: text("required_capabilities").array(),
    optional_capabilities: text("optional_capabilities").array(),
    typical_order: integer("typical_order"),
    dependencies: text("dependencies").array(),
    implementation_notes: text("implementation_notes"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    businessTypeIdx: index("workflow_modules_business_type_idx").on(t.business_type),
    typeOrderIdx: index("workflow_modules_type_order_idx").on(t.business_type, t.typical_order),
    templateIdIdx: index("workflow_modules_workflow_template_id_idx").on(t.workflow_template_id),
  })
)

export const businessTypes = pgTable("business_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const workflowTemplates = pgTable(
  "workflow_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    business_type_id: uuid("business_type_id")
      .notNull()
      .references(() => businessTypes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    version: integer("version").notNull().default(1),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    businessTypeIdIdx: index("workflow_templates_business_type_id_idx").on(t.business_type_id),
  })
)

export const moduleDependencies = pgTable(
  "module_dependencies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    module_id: uuid("module_id")
      .notNull()
      .references(() => workflowModules.id, { onDelete: "cascade" }),
    depends_on_module_id: uuid("depends_on_module_id")
      .notNull()
      .references(() => workflowModules.id, { onDelete: "cascade" }),
    dependency_type: text("dependency_type").notNull().default("requires"),
  },
  (t) => ({
    uniquePair: uniqueIndex("module_dependencies_unique_pair").on(
      t.module_id,
      t.depends_on_module_id
    ),
    moduleIdIdx: index("module_dependencies_module_id_idx").on(t.module_id),
    dependsOnIdx: index("module_dependencies_depends_on_module_id_idx").on(t.depends_on_module_id),
  })
)

export const moduleCapabilityRequirements = pgTable(
  "module_capability_requirements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    module_id: uuid("module_id")
      .notNull()
      .references(() => workflowModules.id, { onDelete: "cascade" }),
    capability_id: uuid("capability_id")
      .notNull()
      .references(() => capabilities.id, { onDelete: "cascade" }),
    requirement_type: text("requirement_type").notNull(),
    weight: numeric("weight", { precision: 5, scale: 4 }).default("1.0"),
  },
  (t) => ({
    uniquePair: uniqueIndex("module_capability_requirements_unique_pair").on(
      t.module_id,
      t.capability_id
    ),
    moduleIdIdx: index("module_capability_requirements_module_id_idx").on(t.module_id),
    capabilityIdIdx: index("module_capability_requirements_capability_id_idx").on(t.capability_id),
  })
)

export const toolModuleFitScores = pgTable(
  "tool_module_fit_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tool_id: uuid("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    module_id: uuid("module_id")
      .notNull()
      .references(() => workflowModules.id, { onDelete: "cascade" }),
    fit_score: numeric("fit_score", { precision: 6, scale: 4 }).notNull(),
    price_score: numeric("price_score", { precision: 6, scale: 4 }),
    maturity_score: numeric("maturity_score", { precision: 6, scale: 4 }),
    integration_score: numeric("integration_score", { precision: 6, scale: 4 }),
    explanation_json: jsonb("explanation_json"),
    calculated_at: timestamp("calculated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniquePair: uniqueIndex("tool_module_fit_scores_unique_pair").on(t.tool_id, t.module_id),
    toolIdIdx: index("tool_module_fit_scores_tool_id_idx").on(t.tool_id),
    moduleIdIdx: index("tool_module_fit_scores_module_id_idx").on(t.module_id),
  })
)

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  name: text("name"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    business_type_id: uuid("business_type_id").references(() => businessTypes.id),
    status: text("status").notNull().default("draft"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("projects_user_id_idx").on(t.user_id),
    businessTypeIdIdx: index("projects_business_type_id_idx").on(t.business_type_id),
  })
)

export const projectInputs = pgTable(
  "project_inputs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    project_id: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    startup_idea: text("startup_idea").notNull(),
    target_customer: text("target_customer"),
    budget_monthly: numeric("budget_monthly", { precision: 12, scale: 2 }),
    technical_level: text("technical_level"),
    hosting_preference: text("hosting_preference"),
    compliance_needs: text("compliance_needs").array(),
    team_size: integer("team_size"),
    extra_preferences_json: jsonb("extra_preferences_json"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    projectIdIdx: index("project_inputs_project_id_idx").on(t.project_id),
  })
)

export const generatedRoadmaps = pgTable(
  "generated_roadmaps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    project_id: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    workflow_template_id: uuid("workflow_template_id").references(() => workflowTemplates.id),
    version: integer("version").notNull().default(1),
    summary: text("summary"),
    total_estimated_monthly_cost: numeric("total_estimated_monthly_cost", {
      precision: 12,
      scale: 2,
    }),
    strategy_type: text("strategy_type").notNull(),
    generation_metadata: jsonb("generation_metadata"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    projectIdIdx: index("generated_roadmaps_project_id_idx").on(t.project_id),
    workflowTemplateIdIdx: index("generated_roadmaps_workflow_template_id_idx").on(
      t.workflow_template_id
    ),
  })
)

export const roadmapNodes = pgTable(
  "roadmap_nodes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roadmap_id: uuid("roadmap_id")
      .notNull()
      .references(() => generatedRoadmaps.id, { onDelete: "cascade" }),
    module_id: uuid("module_id").references(() => workflowModules.id),
    node_type: text("node_type").notNull(),
    label: text("label").notNull(),
    description: text("description"),
    position_x: numeric("position_x", { precision: 12, scale: 2 }),
    position_y: numeric("position_y", { precision: 12, scale: 2 }),
    metadata_json: jsonb("metadata_json"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    roadmapIdIdx: index("roadmap_nodes_roadmap_id_idx").on(t.roadmap_id),
    moduleIdIdx: index("roadmap_nodes_module_id_idx").on(t.module_id),
  })
)

export const roadmapEdges = pgTable(
  "roadmap_edges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roadmap_id: uuid("roadmap_id")
      .notNull()
      .references(() => generatedRoadmaps.id, { onDelete: "cascade" }),
    from_node_id: uuid("from_node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
    to_node_id: uuid("to_node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
    edge_type: text("edge_type").notNull(),
    label: text("label"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    roadmapIdIdx: index("roadmap_edges_roadmap_id_idx").on(t.roadmap_id),
    fromNodeIdx: index("roadmap_edges_from_node_id_idx").on(t.from_node_id),
    toNodeIdx: index("roadmap_edges_to_node_id_idx").on(t.to_node_id),
  })
)

export const roadmapRecommendations = pgTable(
  "roadmap_recommendations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roadmap_id: uuid("roadmap_id")
      .notNull()
      .references(() => generatedRoadmaps.id, { onDelete: "cascade" }),
    module_id: uuid("module_id").references(() => workflowModules.id),
    selected_tool_id: uuid("selected_tool_id").references(() => tools.id),
    recommendation_type: text("recommendation_type").notNull(),
    estimated_monthly_cost: numeric("estimated_monthly_cost", { precision: 12, scale: 2 }),
    justification: text("justification"),
    rank_order: integer("rank_order").notNull().default(1),
    metadata_json: jsonb("metadata_json"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    roadmapIdIdx: index("roadmap_recommendations_roadmap_id_idx").on(t.roadmap_id),
    moduleIdIdx: index("roadmap_recommendations_module_id_idx").on(t.module_id),
    toolIdIdx: index("roadmap_recommendations_selected_tool_id_idx").on(t.selected_tool_id),
  })
)

export const enrichmentRuns = pgTable(
  "enrichment_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tool_id: uuid("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    run_type: text("run_type").notNull(),
    model_name: text("model_name"),
    status: text("status").notNull(),
    input_hash: text("input_hash"),
    output_json: jsonb("output_json"),
    error_message: text("error_message"),
    started_at: timestamp("started_at", { withTimezone: true }),
    finished_at: timestamp("finished_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    toolIdIdx: index("enrichment_runs_tool_id_idx").on(t.tool_id),
    statusIdx: index("enrichment_runs_status_idx").on(t.status),
  })
)

export const dedupeCandidates = pgTable(
  "dedupe_candidates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    left_tool_id: uuid("left_tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    right_tool_id: uuid("right_tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    similarity_score: numeric("similarity_score", { precision: 6, scale: 4 }).notNull(),
    review_status: text("review_status").notNull().default("pending"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pairUnique: uniqueIndex("dedupe_candidates_pair_unique").on(t.left_tool_id, t.right_tool_id),
    leftIdx: index("dedupe_candidates_left_tool_id_idx").on(t.left_tool_id),
    rightIdx: index("dedupe_candidates_right_tool_id_idx").on(t.right_tool_id),
    statusIdx: index("dedupe_candidates_review_status_idx").on(t.review_status),
  })
)

export const manualReviews = pgTable(
  "manual_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entity_type: text("entity_type").notNull(),
    entity_id: uuid("entity_id").notNull(),
    review_type: text("review_type").notNull(),
    status: text("status").notNull(),
    notes: text("notes"),
    reviewer_user_id: uuid("reviewer_user_id").references(() => users.id),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    entityIdx: index("manual_reviews_entity_idx").on(t.entity_type, t.entity_id),
    statusIdx: index("manual_reviews_status_idx").on(t.status),
  })
)

export const changeLog = pgTable(
  "change_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entity_type: text("entity_type").notNull(),
    entity_id: uuid("entity_id").notNull(),
    action: text("action").notNull(),
    old_value: jsonb("old_value"),
    new_value: jsonb("new_value"),
    actor_type: text("actor_type").notNull(),
    actor_id: uuid("actor_id"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    entityIdx: index("change_log_entity_idx").on(t.entity_type, t.entity_id),
    createdAtIdx: index("change_log_created_at_idx").on(t.created_at),
  })
)

export const roadmaps = pgTable(
  "roadmaps",
  {
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
  },
  (t) => ({
    shortIdIdx: index("roadmaps_short_id_idx").on(t.short_id),
    statusIdx: index("roadmaps_status_idx").on(t.status),
    createdAtIdx: index("roadmaps_created_at_idx").on(t.created_at),
  })
)
