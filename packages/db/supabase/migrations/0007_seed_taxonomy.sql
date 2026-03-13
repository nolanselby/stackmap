-- Migration 0007: Seed core taxonomy + pricing models + business types
-- These are safe, idempotent seeds using ON CONFLICT DO NOTHING.

-- ============================================================
-- 1. Pricing models
-- ============================================================

INSERT INTO pricing_models (slug, name, description) VALUES
  ('free', 'Free', 'Fully free tier with no paid upgrades'),
  ('freemium', 'Freemium', 'Free tier with paid upgrades for more usage or features'),
  ('seat_based', 'Seat-based', 'Pricing based on number of users or seats'),
  ('usage_based', 'Usage-based', 'Pricing based on metered usage (requests, credits, minutes, etc.)'),
  ('hybrid', 'Hybrid', 'Combination of seats and usage-based pricing'),
  ('enterprise', 'Enterprise', 'Custom enterprise-only pricing')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. Capabilities
--    (non-exhaustive, just the core set used across workflows)
-- ============================================================

INSERT INTO capabilities (slug, name, description, capability_group) VALUES
  -- Data / ingestion
  ('csv_import', 'CSV import', 'Import data from CSV files', 'data'),
  ('api_input', 'API input', 'Ingest data via API endpoints', 'data'),
  ('web_crawling', 'Web crawling', 'Crawl websites and fetch content', 'data'),
  ('document_parsing', 'Document parsing', 'Parse text documents and extract content', 'data'),
  ('pdf_extraction', 'PDF extraction', 'Extract text and structure from PDFs', 'data'),
  ('ocr', 'OCR', 'Optical character recognition for scanned documents', 'data'),

  -- AI / LLM
  ('llm_chat', 'LLM chat', 'Conversational AI chat interface', 'ai'),
  ('llm_summarization', 'LLM summarization', 'Summarize long-form content', 'ai'),
  ('llm_extraction', 'LLM extraction', 'Extract structured data using LLMs', 'ai'),
  ('llm_qa', 'LLM Q&A', 'Question answering over documents or data', 'ai'),

  -- Search / retrieval
  ('vector_search', 'Vector search', 'Semantic vector similarity search', 'analytics'),
  ('hybrid_search', 'Hybrid search', 'Combine keyword and vector search', 'analytics'),
  ('natural_language_search', 'Natural language search', 'Search via natural language queries', 'analytics'),

  -- Automation / workflows
  ('workflow_automation', 'Workflow automation', 'Automated workflows and triggers', 'automation'),
  ('email_automation', 'Email automation', 'Automated email sequences and campaigns', 'automation'),
  ('webhook', 'Webhooks', 'Webhook-based event delivery', 'automation'),

  -- CRM / sales
  ('crm_integration', 'CRM integration', 'Sync data with CRM systems', 'crm'),
  ('contact_enrichment', 'Contact enrichment', 'Enrich contacts with additional data', 'crm'),
  ('company_data', 'Company data', 'Firmographic and company-level enrichment', 'crm'),

  -- Auth / security
  ('auth', 'Auth', 'User authentication support', 'auth'),
  ('sso_integration', 'SSO integration', 'Single sign-on integrations', 'auth'),
  ('access_control', 'Access control', 'Role-based or document-level access control', 'auth')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 3. Categories
-- ============================================================

INSERT INTO categories (slug, name, description, category_type) VALUES
  ('ai-coding', 'AI coding', 'AI-assisted coding tools and developer copilots', 'primary'),
  ('research', 'Research assistants', 'Tools for literature review, search, and synthesis', 'primary'),
  ('voice-agents', 'Voice agents', 'AI-powered voice and telephony agents', 'primary'),
  ('sales-enrichment', 'Sales & enrichment', 'Lead gen, enrichment, and outbound tooling', 'primary'),
  ('customer-support', 'Customer support automation', 'AI support widgets, chatbots, and ticketing automation', 'primary'),
  ('document-processing', 'Document processing', 'Intake, parsing, and extraction from documents', 'primary'),
  ('analytics', 'Analytics & BI', 'Dashboards, metrics, and AI insights', 'primary')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 4. Business types (aligned with existing workflow_modules seeds)
-- ============================================================

INSERT INTO business_types (slug, name, description) VALUES
  ('ai_sdr', 'AI SDR', 'AI-first outbound sales / SDR workflow'),
  ('ai_customer_support', 'AI customer support', 'AI-powered customer support automation'),
  ('ai_content_ops', 'AI content ops', 'AI-assisted content operations and publishing'),
  ('ai_coding_assistant', 'AI coding assistant', 'Developer-focused AI coding assistant stack'),
  ('ai_research_tool', 'AI research assistant', 'Research and knowledge synthesis tools'),
  ('ai_recruiting', 'AI recruiting', 'AI-powered sourcing, screening, and recruiting'),
  ('ai_data_enrichment', 'AI data enrichment', 'Contact and company data enrichment flows'),
  ('ai_document_processing', 'AI document processing', 'Document intake, classification, and extraction'),
  ('ai_voice_agent', 'AI voice agent', 'Voice-based AI agents for calls'),
  ('ai_ecommerce', 'AI e-commerce', 'AI stack for e-commerce growth and operations'),
  ('ai_analytics', 'AI analytics', 'Analytics, dashboards, and AI insights'),
  ('ai_internal_search', 'AI internal search', 'Internal semantic search and knowledge assistants')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 5. Workflow templates (one default per business type)
--    Modules remain linked by business_type text for now; these
--    templates give the planner a canonical template handle.
-- ============================================================

INSERT INTO workflow_templates (business_type_id, name, description, version, is_active)
SELECT
  bt.id,
  CONCAT('Default ', bt.name, ' template') AS name,
  CONCAT('Default workflow template for ', bt.name, ' use cases') AS description,
  1 AS version,
  true AS is_active
FROM business_types bt
LEFT JOIN workflow_templates wt
  ON wt.business_type_id = bt.id
WHERE wt.id IS NULL;

