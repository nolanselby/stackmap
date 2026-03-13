-- Migration 0005: Schema hardening
-- Adds missing constraints, indexes, and the ai_internal_search workflow module seed

-- ============================================================
-- 1. UNIQUE constraints on one-to-one child tables
--    Without these, enrichment re-runs create duplicate rows.
-- ============================================================

ALTER TABLE tool_metadata
  ADD CONSTRAINT tool_metadata_tool_id_unique UNIQUE (tool_id);

ALTER TABLE tool_pricing
  ADD CONSTRAINT tool_pricing_tool_id_unique UNIQUE (tool_id);

ALTER TABLE tool_signals
  ADD CONSTRAINT tool_signals_tool_id_unique UNIQUE (tool_id);

-- ============================================================
-- 2. UNIQUE constraint on staging_tools(source, source_id)
--    Prevents re-ingesting the same tool on every daily cron run.
--    Only applies when source_id is non-null (GitHub/PH have IDs;
--    directory scrapes may not — those remain unrestricted).
-- ============================================================

CREATE UNIQUE INDEX staging_tools_source_source_id_unique
  ON staging_tools (source, source_id)
  WHERE source_id IS NOT NULL;

-- ============================================================
-- 3. UNIQUE constraint on tool_alternatives
--    Prevents duplicate alternative relationships.
-- ============================================================

ALTER TABLE tool_alternatives
  ADD CONSTRAINT tool_alternatives_pair_unique UNIQUE (tool_id, alternative_tool_id);

-- ============================================================
-- 4. FK indexes on child tables
--    Postgres does NOT auto-create indexes on FK columns.
--    Every ON DELETE CASCADE and every JOIN was a seq scan.
-- ============================================================

CREATE INDEX tool_metadata_tool_id_idx ON tool_metadata (tool_id);
CREATE INDEX tool_pricing_tool_id_idx ON tool_pricing (tool_id);
CREATE INDEX tool_signals_tool_id_idx ON tool_signals (tool_id);
CREATE INDEX tool_alternatives_tool_id_idx ON tool_alternatives (tool_id);
CREATE INDEX tool_alternatives_alt_tool_id_idx ON tool_alternatives (alternative_tool_id);

-- ============================================================
-- 5. Additional indexes for hot query paths
-- ============================================================

-- Polling query: GET /api/roadmap/[short_id] hits status on every 2s poll
CREATE INDEX roadmaps_status_idx ON roadmaps (status);

-- Dedup check in enrichment: match by website_url domain
CREATE INDEX tools_website_url_idx ON tools (website_url);

-- Dedup check in enrichment: look up staging records by source + source_id
CREATE INDEX staging_tools_source_composite_idx ON staging_tools (source, source_id);

-- Trust score queries: filter active tools efficiently
-- (tools_status_active_idx already exists from 0001 — skipping duplicate)

-- workflow_modules lookup: planner joins on (business_type, typical_order)
CREATE INDEX workflow_modules_type_order_idx ON workflow_modules (business_type, typical_order);

-- ============================================================
-- 6. Seed missing ai_internal_search workflow modules
--    This was the only business type missing from 0002.
-- ============================================================

INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_internal_search', 'ingestion', 'knowledge_ingestion', ARRAY['document_parsing', 'pdf_extraction', 'web_crawling'], ARRAY['slack_sync', 'gdrive_sync', 'notion_sync'], 1, ARRAY[]::text[], 'Ingest internal docs, wikis, Slack, and knowledge sources'),
('ai_internal_search', 'indexing', 'vector_indexing', ARRAY['vector_search', 'embedding_generation'], ARRAY['hybrid_search', 'incremental_reindex'], 2, ARRAY['knowledge_ingestion'], 'Build searchable vector index over ingested content'),
('ai_internal_search', 'search', 'semantic_search', ARRAY['natural_language_search', 'relevance_ranking'], ARRAY['query_expansion', 'spell_correction', 'typo_tolerance'], 3, ARRAY['vector_indexing'], 'AI-powered natural language search across knowledge'),
('ai_internal_search', 'synthesis', 'answer_generation', ARRAY['llm_qa', 'citation_linking'], ARRAY['confidence_scoring', 'hallucination_detection'], 4, ARRAY['semantic_search'], 'Generate cited answers from retrieved context'),
('ai_internal_search', 'access', 'permissions', ARRAY['access_control', 'sso_integration'], ARRAY['document_level_acl', 'audit_logging'], 5, ARRAY['knowledge_ingestion'], 'Enforce document-level access control and SSO'),
('ai_internal_search', 'analytics', 'search_analytics', ARRAY['query_analytics', 'coverage_analysis'], ARRAY['failed_query_detection', 'gap_identification'], 6, ARRAY['answer_generation'], 'Track search quality and knowledge gaps');

-- ============================================================
-- 7. RLS for roadmaps table
--    Roadmaps are public-by-URL (no auth). Service role key
--    bypasses RLS for all server-side writes. Anon key (used
--    for future client-side reads) needs SELECT permission.
-- ============================================================

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roadmaps_public_read"
  ON roadmaps FOR SELECT
  USING (true);

-- Service role bypasses RLS automatically — no insert/update policy needed.
