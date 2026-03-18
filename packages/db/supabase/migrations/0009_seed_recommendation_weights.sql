-- =============================================================================
-- Migration: 0009_seed_recommendation_weights.sql
-- Date: 2026-03-18
-- Description: Seeds recommendation_weight values for all tools.
--   Weight tiers:
--     1.00 = Category-defining household names (ChatGPT, ElevenLabs, Cursor, etc.)
--     0.90 = Major well-known brands, strong category leaders
--     0.80 = Established brands with significant market presence
--     0.70 = Growing brands with strong niche recognition
--     0.60 = Known within their category, moderate brand awareness
--     0.50 = Default — functional tools without broad name recognition
--
--   Weights reflect brand recognition + category leadership, not quality alone.
--   A tool can be excellent but unknown — it gets a lower weight.
-- =============================================================================

-- ═══════════════════════════════════════════════════════════════
-- Group 1: General LLMs & Research
-- ═══════════════════════════════════════════════════════════════

UPDATE tools SET recommendation_weight = 1.00 WHERE slug = 'chatgpt';
UPDATE tools SET recommendation_weight = 1.00 WHERE slug = 'claude';
UPDATE tools SET recommendation_weight = 1.00 WHERE slug = 'perplexity-ai';
UPDATE tools SET recommendation_weight = 0.95 WHERE slug = 'google-gemini';
UPDATE tools SET recommendation_weight = 0.80 WHERE slug = 'grok';
UPDATE tools SET recommendation_weight = 0.90 WHERE slug = 'microsoft-copilot';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'poe';
UPDATE tools SET recommendation_weight = 0.70 WHERE slug = 'huggingchat';
UPDATE tools SET recommendation_weight = 0.80 WHERE slug = 'deepseek-r1';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'bing-chat';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'otio';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'silatus';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'flowith';
UPDATE tools SET recommendation_weight = 0.80 WHERE slug = 'notebooklm';
UPDATE tools SET recommendation_weight = 0.70 WHERE slug = 'perplexity-computer';

-- ═══════════════════════════════════════════════════════════════
-- Group 2: Coding & Development
-- ═══════════════════════════════════════════════════════════════

UPDATE tools SET recommendation_weight = 1.00 WHERE slug = 'cursor-ide';
UPDATE tools SET recommendation_weight = 1.00 WHERE slug = 'claude-code';
UPDATE tools SET recommendation_weight = 0.95 WHERE slug = 'github-copilot-pro';
UPDATE tools SET recommendation_weight = 0.85 WHERE slug = 'replit';
UPDATE tools SET recommendation_weight = 0.80 WHERE slug = 'windsurf';
UPDATE tools SET recommendation_weight = 0.85 WHERE slug = 'v0';
UPDATE tools SET recommendation_weight = 0.80 WHERE slug = 'lovable';
UPDATE tools SET recommendation_weight = 0.80 WHERE slug = 'bolt-new';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'factory';
UPDATE tools SET recommendation_weight = 0.75 WHERE slug = 'codex';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'spawn-co';
UPDATE tools SET recommendation_weight = 0.70 WHERE slug = 'codeium';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'continue-dev';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'qodo';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'base44';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'emergent';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'manus';
UPDATE tools SET recommendation_weight = 0.85 WHERE slug = 'n8n';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'nebula';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'testim';

-- ═══════════════════════════════════════════════════════════════
-- Group 3: App & Website Builders
-- ═══════════════════════════════════════════════════════════════

UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'dora';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = '10web';
UPDATE tools SET recommendation_weight = 0.85 WHERE slug = 'framer';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'durable';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'wegic';
UPDATE tools SET recommendation_weight = 0.65 WHERE slug = 'glide';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'adalo';
UPDATE tools SET recommendation_weight = 0.80 WHERE slug = 'bubble';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'softr';
UPDATE tools SET recommendation_weight = 0.90 WHERE slug = 'webflow';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'design-com';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'super-ai';

-- ═══════════════════════════════════════════════════════════════
-- Group 4: Design & Image Generation
-- ═══════════════════════════════════════════════════════════════

UPDATE tools SET recommendation_weight = 1.00 WHERE slug = 'midjourney';
UPDATE tools SET recommendation_weight = 0.75 WHERE slug = 'leonardo-ai';
UPDATE tools SET recommendation_weight = 0.75 WHERE slug = 'flux';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'recraft';
UPDATE tools SET recommendation_weight = 0.90 WHERE slug = 'adobe-firefly';
UPDATE tools SET recommendation_weight = 0.95 WHERE slug = 'canva-magic-studio';
UPDATE tools SET recommendation_weight = 0.70 WHERE slug = 'freepik-ai';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'stylar';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'clipdrop';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'looka';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'namelix';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'brandmark';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'stockimg-ai';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'galileo-ai';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'bing-create';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'autodraw';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'designs-ai';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'vance-ai';

-- ═══════════════════════════════════════════════════════════════
-- Group 5: Video & Audio Creation
-- ═══════════════════════════════════════════════════════════════

UPDATE tools SET recommendation_weight = 0.85 WHERE slug = 'heygen';
UPDATE tools SET recommendation_weight = 1.00 WHERE slug = 'elevenlabs';
UPDATE tools SET recommendation_weight = 0.85 WHERE slug = 'runway-ml';
UPDATE tools SET recommendation_weight = 0.65 WHERE slug = 'kling-ai';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'luma-dream-machine';
UPDATE tools SET recommendation_weight = 0.90 WHERE slug = 'sora';
UPDATE tools SET recommendation_weight = 0.75 WHERE slug = 'veo-2';
UPDATE tools SET recommendation_weight = 0.70 WHERE slug = 'pika';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'pictory';
UPDATE tools SET recommendation_weight = 0.80 WHERE slug = 'synthesia';
UPDATE tools SET recommendation_weight = 0.65 WHERE slug = 'invideo';
UPDATE tools SET recommendation_weight = 0.75 WHERE slug = 'opus-clip';
UPDATE tools SET recommendation_weight = 0.80 WHERE slug = 'descript';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'lovo-ai';
UPDATE tools SET recommendation_weight = 0.75 WHERE slug = 'adobe-podcast';
UPDATE tools SET recommendation_weight = 0.80 WHERE slug = 'capcut-ai';

-- ═══════════════════════════════════════════════════════════════
-- Group 6: Writing & Content Creation
-- ═══════════════════════════════════════════════════════════════

UPDATE tools SET recommendation_weight = 0.85 WHERE slug = 'jasper-ai';
UPDATE tools SET recommendation_weight = 0.65 WHERE slug = 'writesonic';
UPDATE tools SET recommendation_weight = 0.70 WHERE slug = 'copy-ai';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'rytr';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'textblaze';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'hix-ai';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'jenny-ai';
UPDATE tools SET recommendation_weight = 0.75 WHERE slug = 'quillbot';
UPDATE tools SET recommendation_weight = 0.95 WHERE slug = 'grammarly';
UPDATE tools SET recommendation_weight = 0.80 WHERE slug = 'surfer-seo';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'anyword';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'hoppy-copy';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'surgegraph';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'sudowrite';
UPDATE tools SET recommendation_weight = 0.70 WHERE slug = 'adcreative-ai';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'predis-ai';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'jotbot';

-- ═══════════════════════════════════════════════════════════════
-- Group 7: Productivity & Automation
-- ═══════════════════════════════════════════════════════════════

UPDATE tools SET recommendation_weight = 0.95 WHERE slug = 'notion-ai';
UPDATE tools SET recommendation_weight = 1.00 WHERE slug = 'zapier';
UPDATE tools SET recommendation_weight = 0.85 WHERE slug = 'make';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'bardeen-ai';
UPDATE tools SET recommendation_weight = 0.75 WHERE slug = 'clickup-brain';
UPDATE tools SET recommendation_weight = 0.65 WHERE slug = 'motion';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'clockwise';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'granola';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'relay-app';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'gumloop';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'stack-ai';
UPDATE tools SET recommendation_weight = 0.65 WHERE slug = 'voiceflow';
UPDATE tools SET recommendation_weight = 0.70 WHERE slug = 'botpress';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'xembly';
UPDATE tools SET recommendation_weight = 0.65 WHERE slug = 'jotform-ai-agents';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'prometai';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'hockeystack';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'siift-ai';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'cofounder-ai';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'zovoro-ai';

-- ═══════════════════════════════════════════════════════════════
-- Group 8: Marketing & Sales
-- ═══════════════════════════════════════════════════════════════

UPDATE tools SET recommendation_weight = 0.95 WHERE slug = 'hubspot-ai';
UPDATE tools SET recommendation_weight = 0.60 WHERE slug = 'qualified';
UPDATE tools SET recommendation_weight = 0.65 WHERE slug = 'drift';
UPDATE tools SET recommendation_weight = 0.75 WHERE slug = 'outreach';
UPDATE tools SET recommendation_weight = 0.65 WHERE slug = 'typefully';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'postwise';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'taplio';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'hypefury';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'tweethunter';
UPDATE tools SET recommendation_weight = 0.80 WHERE slug = 'buffer-ai';
UPDATE tools SET recommendation_weight = 0.80 WHERE slug = 'hootsuite-ai';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'metricool';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'simplified';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'tribescaler';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'howler-ai';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'emplifi';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'pencil';

-- ═══════════════════════════════════════════════════════════════
-- Group 9: Meetings, Notes & Transcription
-- ═══════════════════════════════════════════════════════════════

UPDATE tools SET recommendation_weight = 0.80 WHERE slug = 'fireflies-ai';
UPDATE tools SET recommendation_weight = 0.85 WHERE slug = 'otter-ai';
UPDATE tools SET recommendation_weight = 0.70 WHERE slug = 'tldv';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'avoma';
UPDATE tools SET recommendation_weight = 0.65 WHERE slug = 'krisp';
UPDATE tools SET recommendation_weight = 0.50 WHERE slug = 'noty-ai';
UPDATE tools SET recommendation_weight = 0.55 WHERE slug = 'meetgeek';
