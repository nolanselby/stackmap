-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- tools
CREATE TABLE tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  website_url text,
  logo_url text,
  short_description text,
  long_description text,
  github_url text,
  open_source boolean DEFAULT false,
  launch_date date,
  last_verified_at timestamptz,
  status_active boolean DEFAULT false,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX tools_slug_idx ON tools(slug);
CREATE INDEX tools_status_active_idx ON tools(status_active);
CREATE INDEX tools_embedding_idx ON tools USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- tool_metadata
CREATE TABLE tool_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  categories text[],
  use_cases text[],
  target_personas text[],
  business_stages text[],
  api_available boolean,
  self_hostable boolean,
  enterprise_ready boolean,
  input_types text[],
  output_types text[],
  integrations text[]
);

-- tool_pricing
CREATE TABLE tool_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  free_tier boolean,
  starting_price_monthly numeric,
  pricing_model text,
  est_cost_5_users numeric,
  est_cost_20_users numeric,
  hidden_cost_notes text
);

-- tool_signals
CREATE TABLE tool_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  github_stars integer,
  github_last_commit date,
  producthunt_votes integer,
  source_count integer DEFAULT 0,
  freshness_score numeric,
  popularity_score numeric,
  maintenance_score numeric,
  trust_score numeric,
  last_computed_at timestamptz
);

-- tool_alternatives
CREATE TABLE tool_alternatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  alternative_tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  reason text,
  cheaper boolean,
  better_for_nontechnical boolean,
  better_for_enterprise boolean
);

-- staging_tools
CREATE TABLE staging_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_data jsonb NOT NULL,
  source text NOT NULL,
  source_id text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX staging_tools_status_idx ON staging_tools(status);
CREATE INDEX staging_tools_source_idx ON staging_tools(source);

-- workflow_modules
CREATE TABLE workflow_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type text NOT NULL,
  stage text NOT NULL,
  module_name text NOT NULL,
  required_capabilities text[],
  optional_capabilities text[],
  typical_order integer,
  dependencies text[],
  implementation_notes text
);

CREATE INDEX workflow_modules_business_type_idx ON workflow_modules(business_type);

-- roadmaps
CREATE TABLE roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id text UNIQUE NOT NULL,
  input_idea text NOT NULL,
  input_customer text,
  input_budget_monthly numeric,
  input_tech_level text,
  input_preference text,
  result_json jsonb,
  status text DEFAULT 'generating',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX roadmaps_short_id_idx ON roadmaps(short_id);
