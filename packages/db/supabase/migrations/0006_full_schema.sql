-- Migration 0006: Full layered schema (ingest → canonical → enrichment → planner → app → ops)
-- This migration is designed to EXTEND the existing v0 schema without data loss.
-- It creates missing tables and evolves existing ones (tools, tool_pricing, workflow_modules).

-- ============================================================
-- 0. Helpers / extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. Ingestion layer (raw)
-- ============================================================

CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,                 -- github, producthunt, futurepedia
  name text NOT NULL,
  source_type text NOT NULL,                -- api, scraper, manual
  base_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES sources(id),
  run_type text NOT NULL,                   -- full_sync, incremental_sync, refresh
  status text NOT NULL,                     -- queued, running, success, failed
  started_at timestamptz,
  finished_at timestamptz,
  records_fetched int DEFAULT 0,
  records_inserted int DEFAULT 0,
  records_updated int DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS source_runs_source_id_idx ON source_runs(source_id);

CREATE TABLE IF NOT EXISTS raw_tool_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES sources(id),
  source_run_id uuid REFERENCES source_runs(id),
  external_id text NOT NULL,
  external_url text,
  title text,
  raw_description text,
  raw_payload jsonb NOT NULL,
  raw_hash text NOT NULL,
  discovered_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  canonical_tool_id uuid,
  ingestion_status text NOT NULL DEFAULT 'pending', -- pending, normalized, ignored, merged
  UNIQUE (source_id, external_id)
);

CREATE INDEX IF NOT EXISTS raw_tool_records_source_id_idx ON raw_tool_records(source_id);
CREATE INDEX IF NOT EXISTS raw_tool_records_source_run_id_idx ON raw_tool_records(source_run_id);
CREATE INDEX IF NOT EXISTS raw_tool_records_canonical_tool_id_idx ON raw_tool_records(canonical_tool_id);

-- ============================================================
-- 2. Canonical tool system (evolve existing tools table)
-- ============================================================

-- The v0 `tools` table already exists. Add columns needed for canonical truth.
ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS canonical_name text,
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS tool_type text,                           -- saas, open_source, api, marketplace, repo
  ADD COLUMN IF NOT EXISTS lifecycle_status text NOT NULL DEFAULT 'active', -- active, stale, dead, draft
  ADD COLUMN IF NOT EXISTS self_hostable boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS api_available boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS docs_url text,
  ADD COLUMN IF NOT EXISTS founded_year int,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Keep canonical_name populated by default for existing rows.
UPDATE tools
SET canonical_name = COALESCE(canonical_name, name)
WHERE canonical_name IS NULL;

-- tool_aliases
CREATE TABLE IF NOT EXISTS tool_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  alias text NOT NULL,
  alias_type text NOT NULL,                 -- source_title, repo_name, marketing_name
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tool_aliases_tool_id_idx ON tool_aliases(tool_id);
CREATE UNIQUE INDEX IF NOT EXISTS tool_aliases_tool_id_alias_unique ON tool_aliases(tool_id, alias);

-- tool_domains
CREATE TABLE IF NOT EXISTS tool_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  domain text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tool_id, domain)
);

CREATE INDEX IF NOT EXISTS tool_domains_domain_idx ON tool_domains(domain);
CREATE INDEX IF NOT EXISTS tool_domains_tool_id_idx ON tool_domains(tool_id);

-- tool_links
CREATE TABLE IF NOT EXISTS tool_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  link_type text NOT NULL,                  -- website, pricing, docs, github, demo, changelog
  url text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tool_links_tool_id_idx ON tool_links(tool_id);
CREATE INDEX IF NOT EXISTS tool_links_type_idx ON tool_links(link_type);
CREATE UNIQUE INDEX IF NOT EXISTS tool_links_tool_id_url_unique ON tool_links(tool_id, url);

-- ============================================================
-- 3. Classification / enrichment (taxonomy + capabilities)
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES categories(id),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category_type text NOT NULL,              -- primary, secondary, industry, persona
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON categories(parent_id);

CREATE TABLE IF NOT EXISTS tool_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  confidence numeric(5,4),
  source text NOT NULL,                     -- rule, llm, manual
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tool_id, category_id)
);

CREATE INDEX IF NOT EXISTS tool_categories_tool_id_idx ON tool_categories(tool_id);
CREATE INDEX IF NOT EXISTS tool_categories_category_id_idx ON tool_categories(category_id);

CREATE TABLE IF NOT EXISTS capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  capability_group text NOT NULL,           -- data, ai, auth, crm, automation, analytics
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tool_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  capability_id uuid NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  confidence numeric(5,4),
  source text NOT NULL,                     -- rule, llm, manual
  strength text,                            -- core, strong, partial
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tool_id, capability_id)
);

CREATE INDEX IF NOT EXISTS tool_capabilities_tool_id_idx ON tool_capabilities(tool_id);
CREATE INDEX IF NOT EXISTS tool_capabilities_capability_id_idx ON tool_capabilities(capability_id);

CREATE TABLE IF NOT EXISTS tool_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  attribute_key text NOT NULL,              -- has_api, has_webhooks, enterprise_ready
  attribute_value_json jsonb NOT NULL,
  source text NOT NULL,
  confidence numeric(5,4),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tool_attributes_tool_id_idx ON tool_attributes(tool_id);
CREATE INDEX IF NOT EXISTS tool_attributes_key_idx ON tool_attributes(attribute_key);

CREATE TABLE IF NOT EXISTS tool_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  integration_name text NOT NULL,           -- slack, hubspot, salesforce, zapier
  integration_type text,                    -- native, api, webhook, sdk
  is_official boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tool_integrations_tool_id_idx ON tool_integrations(tool_id);
CREATE INDEX IF NOT EXISTS tool_integrations_name_idx ON tool_integrations(integration_name);
CREATE UNIQUE INDEX IF NOT EXISTS tool_integrations_tool_id_name_unique ON tool_integrations(tool_id, integration_name);

-- ============================================================
-- 4. Pricing / health / signals
-- ============================================================

CREATE TABLE IF NOT EXISTS pricing_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,                -- free, freemium, seat_based, usage_based, enterprise
  name text NOT NULL,
  description text
);

-- Evolve existing v0 tool_pricing into multi-plan table.
ALTER TABLE tool_pricing
  ADD COLUMN IF NOT EXISTS plan_name text NOT NULL DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS pricing_model_id uuid REFERENCES pricing_models(id),
  ADD COLUMN IF NOT EXISTS billing_interval text,                    -- monthly, yearly, one_time
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS price_numeric numeric(12,2),
  ADD COLUMN IF NOT EXISTS usage_unit text,                          -- seat, credits, requests, minutes
  ADD COLUMN IF NOT EXISTS usage_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS enterprise_only boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS extracted_at timestamptz NOT NULL DEFAULT now();

-- Drop legacy one-to-one uniqueness if it exists, replacing with (tool_id, plan_name).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tool_pricing_tool_id_unique'
  ) THEN
    ALTER TABLE tool_pricing DROP CONSTRAINT tool_pricing_tool_id_unique;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS tool_pricing_tool_id_plan_unique
  ON tool_pricing(tool_id, plan_name);

CREATE TABLE IF NOT EXISTS tool_usage_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  scenario_key text NOT NULL,               -- solo_founder, team_5, team_20
  monthly_estimated_cost numeric(12,2),
  assumptions_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tool_id, scenario_key)
);

CREATE INDEX IF NOT EXISTS tool_usage_costs_tool_id_idx ON tool_usage_costs(tool_id);

-- tool_signals already exists (v0). Add missing columns and align naming.
ALTER TABLE tool_signals
  ADD COLUMN IF NOT EXISTS github_forks int,
  ADD COLUMN IF NOT EXISTS github_last_commit_at timestamptz,
  ADD COLUMN IF NOT EXISTS producthunt_featured_at timestamptz,
  ADD COLUMN IF NOT EXISTS traffic_estimate int,
  ADD COLUMN IF NOT EXISTS review_count int,
  ADD COLUMN IF NOT EXISTS source_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS calculated_at timestamptz NOT NULL DEFAULT now();

-- Backfill github_last_commit_at from legacy github_last_commit (date) if present.
UPDATE tool_signals
SET github_last_commit_at = COALESCE(github_last_commit_at, github_last_commit::timestamptz)
WHERE github_last_commit_at IS NULL AND github_last_commit IS NOT NULL;

CREATE TABLE IF NOT EXISTS tool_health_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  github_stars int,
  github_last_commit_at timestamptz,
  homepage_status_code int,
  docs_status_code int,
  pricing_page_status_code int,
  is_reachable boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tool_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS tool_health_snapshots_tool_id_idx ON tool_health_snapshots(tool_id);
CREATE INDEX IF NOT EXISTS tool_health_snapshots_snapshot_date_idx ON tool_health_snapshots(snapshot_date);

-- ============================================================
-- 5. Recommendation engine / planner
-- ============================================================

CREATE TABLE IF NOT EXISTS business_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type_id uuid NOT NULL REFERENCES business_types(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  version int NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workflow_templates_business_type_id_idx ON workflow_templates(business_type_id);

-- Evolve existing v0 workflow_modules to support template-based planner.
ALTER TABLE workflow_modules
  ADD COLUMN IF NOT EXISTS workflow_template_id uuid REFERENCES workflow_templates(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS module_type text NOT NULL DEFAULT 'core',  -- core, optional, upgrade, compliance
  ADD COLUMN IF NOT EXISTS stage_order int,
  ADD COLUMN IF NOT EXISTS is_required boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Backfill new columns from v0 columns when missing.
UPDATE workflow_modules
SET
  name = COALESCE(name, module_name),
  slug = COALESCE(slug, module_name),
  stage_order = COALESCE(stage_order, typical_order),
  description = COALESCE(description, implementation_notes)
WHERE name IS NULL OR slug IS NULL OR stage_order IS NULL OR description IS NULL;

CREATE INDEX IF NOT EXISTS workflow_modules_workflow_template_id_idx ON workflow_modules(workflow_template_id);

-- Unique only when workflow_template_id is set (avoid conflicting legacy rows)
CREATE UNIQUE INDEX IF NOT EXISTS workflow_modules_template_slug_unique
  ON workflow_modules(workflow_template_id, slug)
  WHERE workflow_template_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS module_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES workflow_modules(id) ON DELETE CASCADE,
  depends_on_module_id uuid NOT NULL REFERENCES workflow_modules(id) ON DELETE CASCADE,
  dependency_type text NOT NULL DEFAULT 'requires',
  UNIQUE (module_id, depends_on_module_id)
);

CREATE INDEX IF NOT EXISTS module_dependencies_module_id_idx ON module_dependencies(module_id);
CREATE INDEX IF NOT EXISTS module_dependencies_depends_on_module_id_idx ON module_dependencies(depends_on_module_id);

CREATE TABLE IF NOT EXISTS module_capability_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES workflow_modules(id) ON DELETE CASCADE,
  capability_id uuid NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  requirement_type text NOT NULL,           -- required, preferred, optional
  weight numeric(5,4) DEFAULT 1.0,
  UNIQUE (module_id, capability_id)
);

CREATE INDEX IF NOT EXISTS module_capability_requirements_module_id_idx ON module_capability_requirements(module_id);
CREATE INDEX IF NOT EXISTS module_capability_requirements_capability_id_idx ON module_capability_requirements(capability_id);

CREATE TABLE IF NOT EXISTS tool_module_fit_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES workflow_modules(id) ON DELETE CASCADE,
  fit_score numeric(6,4) NOT NULL,
  price_score numeric(6,4),
  maturity_score numeric(6,4),
  integration_score numeric(6,4),
  explanation_json jsonb,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tool_id, module_id)
);

CREATE INDEX IF NOT EXISTS tool_module_fit_scores_tool_id_idx ON tool_module_fit_scores(tool_id);
CREATE INDEX IF NOT EXISTS tool_module_fit_scores_module_id_idx ON tool_module_fit_scores(module_id);

-- Evolve existing tool_alternatives into typed alternatives.
ALTER TABLE tool_alternatives
  ADD COLUMN IF NOT EXISTS alternative_type text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

UPDATE tool_alternatives
SET alternative_type = COALESCE(
  alternative_type,
  CASE
    WHEN cheaper IS TRUE THEN 'cheaper'
    WHEN better_for_enterprise IS TRUE THEN 'enterprise'
    ELSE 'easier'
  END
)
WHERE alternative_type IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tool_alternatives_unique_typed'
  ) THEN
    CREATE UNIQUE INDEX tool_alternatives_unique_typed
      ON tool_alternatives(tool_id, alternative_tool_id, alternative_type);
  END IF;
END $$;

-- ============================================================
-- 6. User/app layer (projects + generated roadmaps)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  business_type_id uuid REFERENCES business_types(id),
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_business_type_id_idx ON projects(business_type_id);

CREATE TABLE IF NOT EXISTS project_inputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  startup_idea text NOT NULL,
  target_customer text,
  budget_monthly numeric(12,2),
  technical_level text,                     -- nontechnical, semi-technical, technical
  hosting_preference text,                  -- hosted, open_source, mixed
  compliance_needs text[],
  team_size int,
  extra_preferences_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_inputs_project_id_idx ON project_inputs(project_id);

CREATE TABLE IF NOT EXISTS generated_roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  workflow_template_id uuid REFERENCES workflow_templates(id),
  version int NOT NULL DEFAULT 1,
  summary text,
  total_estimated_monthly_cost numeric(12,2),
  strategy_type text NOT NULL,              -- best_overall, cheapest, fastest, open_source
  generation_metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generated_roadmaps_project_id_idx ON generated_roadmaps(project_id);
CREATE INDEX IF NOT EXISTS generated_roadmaps_workflow_template_id_idx ON generated_roadmaps(workflow_template_id);

CREATE TABLE IF NOT EXISTS roadmap_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid NOT NULL REFERENCES generated_roadmaps(id) ON DELETE CASCADE,
  module_id uuid REFERENCES workflow_modules(id),
  node_type text NOT NULL,                  -- module, tool, note, cost
  label text NOT NULL,
  description text,
  position_x numeric(12,2),
  position_y numeric(12,2),
  metadata_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS roadmap_nodes_roadmap_id_idx ON roadmap_nodes(roadmap_id);
CREATE INDEX IF NOT EXISTS roadmap_nodes_module_id_idx ON roadmap_nodes(module_id);

CREATE TABLE IF NOT EXISTS roadmap_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid NOT NULL REFERENCES generated_roadmaps(id) ON DELETE CASCADE,
  from_node_id uuid NOT NULL REFERENCES roadmap_nodes(id) ON DELETE CASCADE,
  to_node_id uuid NOT NULL REFERENCES roadmap_nodes(id) ON DELETE CASCADE,
  edge_type text NOT NULL,                  -- depends_on, flows_to, alternative_to
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS roadmap_edges_roadmap_id_idx ON roadmap_edges(roadmap_id);
CREATE INDEX IF NOT EXISTS roadmap_edges_from_node_id_idx ON roadmap_edges(from_node_id);
CREATE INDEX IF NOT EXISTS roadmap_edges_to_node_id_idx ON roadmap_edges(to_node_id);

CREATE TABLE IF NOT EXISTS roadmap_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid NOT NULL REFERENCES generated_roadmaps(id) ON DELETE CASCADE,
  module_id uuid REFERENCES workflow_modules(id),
  selected_tool_id uuid REFERENCES tools(id),
  recommendation_type text NOT NULL,        -- primary, cheaper_alt, open_source_alt
  estimated_monthly_cost numeric(12,2),
  justification text,
  rank_order int NOT NULL DEFAULT 1,
  metadata_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS roadmap_recommendations_roadmap_id_idx ON roadmap_recommendations(roadmap_id);
CREATE INDEX IF NOT EXISTS roadmap_recommendations_module_id_idx ON roadmap_recommendations(module_id);
CREATE INDEX IF NOT EXISTS roadmap_recommendations_selected_tool_id_idx ON roadmap_recommendations(selected_tool_id);

-- ============================================================
-- 7. Ops / quality
-- ============================================================

CREATE TABLE IF NOT EXISTS enrichment_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  run_type text NOT NULL,                   -- classify, pricing_extract, integration_extract
  model_name text,
  status text NOT NULL,
  input_hash text,
  output_json jsonb,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS enrichment_runs_tool_id_idx ON enrichment_runs(tool_id);
CREATE INDEX IF NOT EXISTS enrichment_runs_status_idx ON enrichment_runs(status);

CREATE TABLE IF NOT EXISTS dedupe_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  left_tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  right_tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  similarity_score numeric(6,4) NOT NULL,
  review_status text NOT NULL DEFAULT 'pending', -- pending, merged, rejected
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (left_tool_id, right_tool_id)
);

CREATE INDEX IF NOT EXISTS dedupe_candidates_left_tool_id_idx ON dedupe_candidates(left_tool_id);
CREATE INDEX IF NOT EXISTS dedupe_candidates_right_tool_id_idx ON dedupe_candidates(right_tool_id);
CREATE INDEX IF NOT EXISTS dedupe_candidates_review_status_idx ON dedupe_candidates(review_status);

CREATE TABLE IF NOT EXISTS manual_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,                -- tool, pricing, dedupe, category
  entity_id uuid NOT NULL,
  review_type text NOT NULL,
  status text NOT NULL,                     -- pending, approved, rejected
  notes text,
  reviewer_user_id uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS manual_reviews_entity_idx ON manual_reviews(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS manual_reviews_status_idx ON manual_reviews(status);

CREATE TABLE IF NOT EXISTS change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,                     -- insert, update, merge, archive
  old_value jsonb,
  new_value jsonb,
  actor_type text NOT NULL,                 -- system, user, admin
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS change_log_entity_idx ON change_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS change_log_created_at_idx ON change_log(created_at);

