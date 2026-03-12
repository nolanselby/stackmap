-- Seed workflow modules for all 12 business types
-- ai_sdr
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_sdr', 'discovery', 'lead_sourcing', ARRAY['prospect_discovery', 'company_search'], ARRAY['technographic_filtering', 'intent_signals'], 1, ARRAY[]::text[], 'Find and identify target prospects'),
('ai_sdr', 'enrichment', 'lead_enrichment', ARRAY['contact_enrichment', 'email_lookup'], ARRAY['linkedin_data', 'firmographic_data'], 2, ARRAY['lead_sourcing'], 'Enrich lead records with contact data'),
('ai_sdr', 'qualification', 'lead_scoring', ARRAY['ai_scoring'], ARRAY['crm_integration', 'intent_signals'], 3, ARRAY['lead_enrichment'], 'Score and prioritize leads by fit'),
('ai_sdr', 'outreach', 'email_sequencing', ARRAY['email_automation', 'ai_personalization'], ARRAY['multi_channel', 'a_b_testing'], 4, ARRAY['lead_scoring'], 'Automated personalized outreach'),
('ai_sdr', 'conversation', 'call_analysis', ARRAY['call_recording', 'ai_transcription'], ARRAY['sentiment_analysis', 'coaching'], 5, ARRAY[]::text[], 'Record and analyze sales calls'),
('ai_sdr', 'operations', 'crm_sync', ARRAY['crm_integration', 'webhook'], ARRAY['bi_directional_sync', 'auto_logging'], 6, ARRAY['lead_scoring'], 'Sync all activity to CRM'),
('ai_sdr', 'reporting', 'analytics', ARRAY['analytics_dashboard'], ARRAY['revenue_attribution', 'forecasting'], 7, ARRAY['crm_sync'], 'Pipeline visibility and reporting');

-- ai_customer_support
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_customer_support', 'intake', 'ticket_intake', ARRAY['multi_channel_support', 'ticket_creation'], ARRAY['email_parsing', 'web_widget'], 1, ARRAY[]::text[], 'Receive support requests from all channels'),
('ai_customer_support', 'resolution', 'ai_response', ARRAY['llm_chat', 'knowledge_base'], ARRAY['auto_resolution', 'escalation_rules'], 2, ARRAY['ticket_intake'], 'AI-powered first response and resolution'),
('ai_customer_support', 'knowledge', 'knowledge_management', ARRAY['knowledge_base', 'doc_search'], ARRAY['auto_article_generation', 'gap_detection'], 3, ARRAY[]::text[], 'Maintain self-serve knowledge base'),
('ai_customer_support', 'routing', 'smart_routing', ARRAY['intent_classification', 'agent_routing'], ARRAY['skill_based_routing', 'priority_scoring'], 4, ARRAY['ticket_intake'], 'Route complex tickets to right agents'),
('ai_customer_support', 'analytics', 'support_analytics', ARRAY['analytics_dashboard', 'csat_tracking'], ARRAY['sentiment_trend', 'deflection_rate'], 5, ARRAY['ai_response'], 'Track resolution rates and customer satisfaction');

-- ai_content_ops
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_content_ops', 'strategy', 'topic_research', ARRAY['keyword_research', 'topic_ideation'], ARRAY['competitor_analysis', 'trend_detection'], 1, ARRAY[]::text[], 'Identify what content to create'),
('ai_content_ops', 'creation', 'ai_writing', ARRAY['ai_text_generation', 'long_form_content'], ARRAY['brand_voice_tuning', 'multi_format'], 2, ARRAY['topic_research'], 'Generate first drafts at scale'),
('ai_content_ops', 'assets', 'image_generation', ARRAY['ai_image_generation'], ARRAY['brand_kit', 'batch_generation'], 3, ARRAY['ai_writing'], 'Generate images and visual assets'),
('ai_content_ops', 'optimization', 'seo_optimization', ARRAY['seo_analysis', 'on_page_optimization'], ARRAY['internal_linking', 'schema_markup'], 4, ARRAY['ai_writing'], 'Optimize content for search'),
('ai_content_ops', 'distribution', 'publishing', ARRAY['cms_integration', 'scheduling'], ARRAY['social_distribution', 'newsletter'], 5, ARRAY['seo_optimization'], 'Publish and distribute content'),
('ai_content_ops', 'measurement', 'content_analytics', ARRAY['analytics_dashboard', 'rank_tracking'], ARRAY['attribution', 'content_roi'], 6, ARRAY['publishing'], 'Track content performance');

-- ai_coding_assistant
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_coding_assistant', 'development', 'code_completion', ARRAY['ai_code_completion', 'ide_integration'], ARRAY['multi_language', 'context_awareness'], 1, ARRAY[]::text[], 'AI-powered code completion in IDE'),
('ai_coding_assistant', 'review', 'code_review', ARRAY['automated_code_review', 'pr_integration'], ARRAY['security_scanning', 'style_enforcement'], 2, ARRAY['code_completion'], 'Automated PR review and feedback'),
('ai_coding_assistant', 'testing', 'test_generation', ARRAY['ai_test_generation', 'coverage_analysis'], ARRAY['e2e_generation', 'test_maintenance'], 3, ARRAY['code_completion'], 'Generate and maintain test suites'),
('ai_coding_assistant', 'documentation', 'doc_generation', ARRAY['code_documentation', 'readme_generation'], ARRAY['api_docs', 'changelog_generation'], 4, ARRAY['code_completion'], 'Auto-generate code documentation'),
('ai_coding_assistant', 'deployment', 'ci_cd', ARRAY['ci_cd_pipeline', 'deployment_automation'], ARRAY['preview_deploys', 'rollback'], 5, ARRAY['test_generation'], 'Automated build and deployment');

-- ai_research_tool
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_research_tool', 'ingestion', 'document_ingestion', ARRAY['document_parsing', 'pdf_extraction'], ARRAY['web_crawling', 'batch_upload'], 1, ARRAY[]::text[], 'Ingest documents and sources'),
('ai_research_tool', 'search', 'semantic_search', ARRAY['vector_search', 'hybrid_search'], ARRAY['citation_linking', 'relevance_tuning'], 2, ARRAY['document_ingestion'], 'Search across ingested knowledge'),
('ai_research_tool', 'synthesis', 'ai_summarization', ARRAY['llm_summarization', 'key_point_extraction'], ARRAY['multi_doc_synthesis', 'structured_output'], 3, ARRAY['semantic_search'], 'Summarize and synthesize findings'),
('ai_research_tool', 'output', 'report_generation', ARRAY['structured_output', 'export'], ARRAY['citation_formatting', 'template_support'], 4, ARRAY['ai_summarization'], 'Generate structured research reports');

-- ai_recruiting
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_recruiting', 'sourcing', 'candidate_sourcing', ARRAY['talent_search', 'linkedin_sourcing'], ARRAY['passive_candidate_id', 'boolean_search'], 1, ARRAY[]::text[], 'Find qualified candidates'),
('ai_recruiting', 'screening', 'resume_screening', ARRAY['resume_parsing', 'ai_scoring'], ARRAY['skills_matching', 'culture_fit'], 2, ARRAY['candidate_sourcing'], 'Screen and score applicants'),
('ai_recruiting', 'outreach', 'candidate_outreach', ARRAY['email_automation', 'personalization'], ARRAY['multi_channel', 'response_tracking'], 3, ARRAY['resume_screening'], 'Automated personalized outreach'),
('ai_recruiting', 'assessment', 'skills_assessment', ARRAY['technical_assessment', 'structured_interview'], ARRAY['coding_challenge', 'async_video'], 4, ARRAY['candidate_outreach'], 'Evaluate candidate skills'),
('ai_recruiting', 'operations', 'ats_sync', ARRAY['ats_integration', 'pipeline_management'], ARRAY['offer_management', 'onboarding'], 5, ARRAY['skills_assessment'], 'Track candidates through pipeline');

-- ai_data_enrichment
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_data_enrichment', 'ingestion', 'data_ingestion', ARRAY['csv_import', 'crm_sync', 'api_input'], ARRAY['batch_processing', 'streaming'], 1, ARRAY[]::text[], 'Ingest raw contact or company lists'),
('ai_data_enrichment', 'enrichment', 'contact_enrichment', ARRAY['email_lookup', 'phone_lookup', 'company_data'], ARRAY['social_profiles', 'technographics'], 2, ARRAY['data_ingestion'], 'Enrich records with contact data'),
('ai_data_enrichment', 'validation', 'data_validation', ARRAY['email_verification', 'deduplication'], ARRAY['phone_validation', 'data_health_score'], 3, ARRAY['contact_enrichment'], 'Validate and deduplicate records'),
('ai_data_enrichment', 'output', 'crm_export', ARRAY['crm_integration', 'csv_export'], ARRAY['bi_directional_sync', 'webhook'], 4, ARRAY['data_validation'], 'Export enriched data to destination');

-- ai_document_processing
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_document_processing', 'intake', 'document_intake', ARRAY['pdf_parsing', 'ocr'], ARRAY['batch_upload', 'email_ingestion'], 1, ARRAY[]::text[], 'Receive and parse documents'),
('ai_document_processing', 'extraction', 'data_extraction', ARRAY['structured_extraction', 'llm_extraction'], ARRAY['custom_fields', 'table_extraction'], 2, ARRAY['document_intake'], 'Extract structured data from docs'),
('ai_document_processing', 'classification', 'document_classification', ARRAY['ai_classification'], ARRAY['confidence_scoring', 'human_review_queue'], 3, ARRAY['document_intake'], 'Classify document types'),
('ai_document_processing', 'output', 'output_integration', ARRAY['api_output', 'webhook', 'export'], ARRAY['crm_sync', 'erp_sync'], 4, ARRAY['data_extraction'], 'Send structured data to downstream systems');

-- ai_voice_agent
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_voice_agent', 'telephony', 'call_infrastructure', ARRAY['sip_integration', 'phone_number_provisioning'], ARRAY['call_routing', 'ivr'], 1, ARRAY[]::text[], 'Phone number and call routing setup'),
('ai_voice_agent', 'conversation', 'conversational_ai', ARRAY['llm_voice', 'asr', 'tts'], ARRAY['latency_optimization', 'multi_language'], 2, ARRAY['call_infrastructure'], 'AI conversation engine for calls'),
('ai_voice_agent', 'knowledge', 'knowledge_base', ARRAY['knowledge_retrieval', 'faq_management'], ARRAY['real_time_lookup', 'crm_lookup'], 3, ARRAY['conversational_ai'], 'Knowledge the agent can access during calls'),
('ai_voice_agent', 'escalation', 'human_handoff', ARRAY['warm_transfer', 'call_summary'], ARRAY['sentiment_triggered', 'skill_based_routing'], 4, ARRAY['conversational_ai'], 'Hand off to human agent when needed'),
('ai_voice_agent', 'analytics', 'call_analytics', ARRAY['call_recording', 'transcript_analysis'], ARRAY['intent_tracking', 'conversion_attribution'], 5, ARRAY['conversational_ai'], 'Analyze call outcomes and quality');

-- ai_ecommerce
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_ecommerce', 'discovery', 'product_recommendations', ARRAY['recommendation_engine', 'personalization'], ARRAY['visual_search', 'cross_sell'], 1, ARRAY[]::text[], 'Personalized product recommendations'),
('ai_ecommerce', 'search', 'ai_search', ARRAY['semantic_search', 'natural_language_search'], ARRAY['voice_search', 'typo_tolerance'], 2, ARRAY[]::text[], 'AI-powered product search'),
('ai_ecommerce', 'support', 'customer_support', ARRAY['ai_chat', 'order_lookup'], ARRAY['returns_automation', 'live_handoff'], 3, ARRAY[]::text[], 'AI support for order and product questions'),
('ai_ecommerce', 'marketing', 'email_personalization', ARRAY['email_automation', 'segmentation'], ARRAY['browse_abandonment', 'dynamic_content'], 4, ARRAY['product_recommendations'], 'Personalized email marketing'),
('ai_ecommerce', 'analytics', 'ecommerce_analytics', ARRAY['revenue_analytics', 'attribution'], ARRAY['clv_prediction', 'churn_prediction'], 5, ARRAY['email_personalization'], 'Revenue and customer analytics');

-- ai_analytics
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_analytics', 'collection', 'data_collection', ARRAY['event_tracking', 'api_connectors'], ARRAY['sdk_integration', 'server_side_tracking'], 1, ARRAY[]::text[], 'Collect data from all sources'),
('ai_analytics', 'storage', 'data_warehouse', ARRAY['data_storage', 'query_engine'], ARRAY['real_time_ingestion', 'data_lake'], 2, ARRAY['data_collection'], 'Store and query analytics data'),
('ai_analytics', 'transformation', 'data_modeling', ARRAY['sql_transformation', 'data_modeling'], ARRAY['dbt_support', 'lineage_tracking'], 3, ARRAY['data_warehouse'], 'Model and transform raw data'),
('ai_analytics', 'visualization', 'dashboards', ARRAY['dashboard_builder', 'chart_library'], ARRAY['embedded_analytics', 'white_label'], 4, ARRAY['data_modeling'], 'Build and share dashboards'),
('ai_analytics', 'intelligence', 'ai_insights', ARRAY['anomaly_detection', 'natural_language_query'], ARRAY['predictive_analytics', 'auto_insights'], 5, ARRAY['dashboards'], 'AI-generated insights and alerts');
