-- =============================================================================
-- Seed: 001_tools_seed.sql
-- Date: 2026-03-13
-- Description: Comprehensive seed for all AI tool data — 142 tools across 9
--   groups. Idempotent via ON CONFLICT DO NOTHING throughout.
--   Depends on: 0007_seed_taxonomy.sql (pricing_models, base capabilities,
--   base categories, business_types already seeded).
-- =============================================================================

-- ============================================================
-- 1. Additional categories (new, beyond the 7 already seeded)
-- ============================================================

INSERT INTO categories (slug, name, description, category_type) VALUES
  ('general-llm',           'General LLM',              'General-purpose large language models and AI assistants',           'primary'),
  ('coding-assistant',      'Coding assistant',          'AI coding tools, IDEs, and code generation',                       'primary'),
  ('website-builder',       'Website & app builder',     'No-code and AI website, landing page, and app builders',           'primary'),
  ('image-generation',      'Image generation',          'AI image, logo, and graphic generation tools',                     'primary'),
  ('video-generation',      'Video & audio creation',    'AI video generation, editing, and audio synthesis',                'primary'),
  ('audio-generation',      'Audio & voice generation',  'Text-to-speech, voice cloning, and audio tools',                   'secondary'),
  ('writing-content',       'Writing & content',         'AI writing, copywriting, and content creation tools',              'primary'),
  ('productivity-automation','Productivity & automation', 'AI productivity, workflow automation, and agent builders',         'primary'),
  ('marketing-social',      'Marketing & social',        'AI marketing, social media scheduling, and ad creation',           'primary'),
  ('meetings-transcription','Meetings & transcription',  'AI meeting notes, transcription, and conversation intelligence',   'primary'),
  ('design-tools',          'Design tools',              'UI/UX design, brand identity, and creative AI tools',              'secondary')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. Additional capabilities (new, beyond the 22 already seeded)
-- ============================================================

INSERT INTO capabilities (slug, name, description, capability_group) VALUES
  ('code_generation',       'Code generation',        'Generate code from natural language prompts',                   'ai'),
  ('code_completion',       'Code completion',         'Inline autocomplete and code suggestion',                       'ai'),
  ('ui_generation',         'UI generation',           'Generate UI components or full interfaces from prompts',        'ai'),
  ('image_generation',      'Image generation',        'Generate images from text prompts or references',               'ai'),
  ('video_generation',      'Video generation',        'Generate or edit video from text or image inputs',              'ai'),
  ('voice_synthesis',       'Voice synthesis',         'Convert text to speech or clone voices',                       'ai'),
  ('transcription',         'Transcription',           'Convert audio or video speech to text',                        'data'),
  ('content_writing',       'Content writing',         'Generate marketing copy, articles, or long-form content',      'ai'),
  ('seo_optimization',      'SEO optimization',        'Optimize content for search engine ranking',                   'analytics'),
  ('social_scheduling',     'Social scheduling',       'Schedule and publish social media content',                    'automation'),
  ('meeting_notes',         'Meeting notes',           'Automatically capture and summarize meeting content',          'ai'),
  ('no_code_builder',       'No-code builder',         'Build apps or workflows without writing code',                 'automation'),
  ('brand_design',          'Brand design',            'Generate logos, brand assets, and visual identities',          'ai'),
  ('real_time_search',      'Real-time search',        'Search the live web for up-to-date information',              'data'),
  ('reasoning',             'Reasoning',               'Multi-step logical reasoning and chain-of-thought',            'ai'),
  ('multimodal',            'Multimodal',              'Process and generate across text, image, audio, and video',    'ai')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 3. Tools (142 tools)
-- ============================================================

-- Group 1: General LLMs & Research
INSERT INTO tools (name, slug, canonical_name, company_name, website_url, logo_url, short_description, long_description, open_source, self_hostable, api_available, tool_type, lifecycle_status, founded_year, status_active) VALUES
  ('ChatGPT',        'chatgpt',        'ChatGPT',        'OpenAI',       'https://chatgpt.com',              'https://logo.clearbit.com/chatgpt.com',        'Multimodal LLM with vision, voice, and enterprise data connectors.',                                                               false, false, true,  'saas',        'active', 2022, true),
  ('Claude',         'claude',         'Claude',         'Anthropic',    'https://claude.ai',                'https://logo.clearbit.com/claude.ai',          'Long-context reasoning model prized for careful analysis over hallucination.',                                                    false, false, true,  'saas',        'active', 2023, true),
  ('Perplexity AI',  'perplexity-ai',  'Perplexity AI',  'Perplexity',   'https://perplexity.ai',            'https://logo.clearbit.com/perplexity.ai',      'Real-time search engine with citations and follow-up questions.',                                                                 false, false, true,  'saas',        'active', 2022, true),
  ('Google Gemini',  'google-gemini',  'Google Gemini',  'Google',       'https://gemini.google.com',        'https://logo.clearbit.com/google.com',         'Multimodal model tied to Google apps for live data analysis.',                                                                    false, false, true,  'saas',        'active', 2023, true),
  ('Grok',           'grok',           'Grok',           'xAI',          'https://grok.x.ai',                'https://logo.clearbit.com/x.ai',               'Reasoning model with native real-time X data for startup intelligence.',                                                         false, false, true,  'saas',        'active', 2023, true),
  ('Microsoft Copilot','microsoft-copilot','Microsoft Copilot','Microsoft','https://copilot.microsoft.com', 'https://logo.clearbit.com/microsoft.com',       'Enterprise LLM embedded in Excel, PowerPoint, and Teams.',                                                                        false, false, true,  'saas',        'active', 2023, true),
  ('Poe',            'poe',            'Poe',            'Quora',        'https://poe.com',                  'https://logo.clearbit.com/poe.com',             'Multi-model aggregator switching between Claude, GPT, and Gemini instantly.',                                                    false, false, false, 'saas',        'active', 2022, true),
  ('HuggingChat',    'huggingchat',    'HuggingChat',    'Hugging Face', 'https://huggingface.co/chat',      'https://logo.clearbit.com/huggingface.co',     'Open-source model runner for privacy-sensitive or custom fine-tuned workloads.',                                                 true,  true,  false, 'open_source', 'active', 2023, true),
  ('DeepSeek R1',    'deepseek-r1',    'DeepSeek R1',    'DeepSeek',     'https://deepseek.com',             'https://logo.clearbit.com/deepseek.com',       'Fast, cheap reasoning model for bulk research and first-draft code.',                                                             false, false, true,  'saas',        'active', 2024, true),
  ('Bing Chat',      'bing-chat',      'Bing Chat',      'Microsoft',    'https://bing.com/chat',            'https://logo.clearbit.com/bing.com',           'Free web-integrated chat for quick daily lookups and image generation.',                                                          false, false, false, 'saas',        'active', 2023, true),
  ('Otio',           'otio',           'Otio',           'Otio',         'https://otio.com',                 'https://logo.clearbit.com/otio.com',           'AI research summarizer that turns papers and podcasts into structured notes.',                                                    false, false, false, 'saas',        'active', 2022, true),
  ('Silatus',        'silatus',        'Silatus',        'Silatus',      'https://silatus.com',              'https://logo.clearbit.com/silatus.com',        'Enterprise-grade research agent for internal docs and web intelligence reports.',                                                 false, false, false, 'saas',        'active', 2023, true),
  ('Flowith',        'flowith',        'Flowith',        'Flowith',      'https://flowith.io',               'https://logo.clearbit.com/flowith.io',         'Research agent that builds living knowledge bases from customer calls and docs.',                                                 false, false, false, 'saas',        'active', 2023, true),
  ('NotebookLM',     'notebooklm',     'NotebookLM',     'Google',       'https://notebooklm.google.com',    'https://logo.clearbit.com/google.com',         'Audio and summary engine for uploaded docs, turning them into podcast-style briefings.',                                         false, false, false, 'saas',        'active', 2023, true),
  ('Perplexity Computer','perplexity-computer','Perplexity Computer','Perplexity','https://perplexity.ai/computer','https://logo.clearbit.com/perplexity.ai','End-to-end workflow agent for automating research-to-report pipelines.',                                                         false, false, false, 'saas',        'active', 2025, true)
ON CONFLICT (slug) DO NOTHING;

-- Group 2: Coding & Development
INSERT INTO tools (name, slug, canonical_name, company_name, website_url, logo_url, short_description, long_description, github_url, open_source, self_hostable, api_available, tool_type, lifecycle_status, founded_year, status_active) VALUES
  ('Cursor IDE',       'cursor-ide',       'Cursor IDE',       'Anysphere',     'https://cursor.com',                  'https://logo.clearbit.com/cursor.com',        'VS Code fork with deep codebase understanding and multi-file Composer mode.',                              NULL,                                           false, false, false, 'saas',        'active', 2023, true),
  ('Claude Code',      'claude-code',      'Claude Code',      'Anthropic',     'https://claude.ai/code',              'https://logo.clearbit.com/claude.ai',         'Agentic coder that reads your repo, plans, edits files, and runs terminal commands.',                     NULL,                                           false, false, true,  'saas',        'active', 2024, true),
  ('GitHub Copilot Pro','github-copilot-pro','GitHub Copilot Pro','GitHub',      'https://github.com/features/copilot', 'https://logo.clearbit.com/github.com',        'Inline code completion and chat in IDE for boilerplate generation.',                                    NULL,                                           false, false, false, 'saas',        'active', 2021, true),
  ('Replit',           'replit',           'Replit',           'Replit',        'https://replit.com',                  'https://logo.clearbit.com/replit.com',        'Browser-based autonomous app builder with 30+ integrations for non-coders.',                            NULL,                                           false, false, true,  'saas',        'active', 2016, true),
  ('Windsurf',         'windsurf',         'Windsurf',         'Codeium',       'https://codeium.com/windsurf',        'https://logo.clearbit.com/codeium.com',       'Cursor competitor focused on vibe coding speed for rapid feature iteration.',                            NULL,                                           false, false, false, 'saas',        'active', 2024, true),
  ('v0',               'v0',               'v0',               'Hosting Provider',        'https://v0.dev',                      'https://logo.clearbit.com/v0.dev',            'AI UI component generator outputting production-ready shadcn/Tailwind + Next.js.',                       NULL,                                           false, false, true,  'saas',        'active', 2023, true),
  ('Lovable',          'lovable',          'Lovable',          'Lovable',       'https://lovable.dev',                 'https://logo.clearbit.com/lovable.dev',       'Prompt-to-full-stack React app builder with DB, auth, and hosting included.',                           NULL,                                           false, false, false, 'saas',        'active', 2024, true),
  ('Bolt.new',         'bolt-new',         'Bolt.new',         'StackBlitz',    'https://bolt.new',                    'https://logo.clearbit.com/bolt.new',          'Browser-based full-stack app generator that deploys instantly across frameworks.',                       NULL,                                           false, false, false, 'saas',        'active', 2024, true),
  ('Factory',          'factory',          'Factory',          'Factory AI',    'https://factory.ai',                  'https://logo.clearbit.com/factory.ai',        'Autonomous coding agent for repetitive tasks and legacy codebase maintenance.',                          NULL,                                           false, false, false, 'saas',        'active', 2023, true),
  ('Codex',            'codex',            'Codex',            'OpenAI',        'https://platform.openai.com/codex',   'https://logo.clearbit.com/openai.com',        'Next-gen coding agent for one-shot complex module generation.',                                         NULL,                                           false, false, true,  'api',         'active', 2021, true),
  ('Spawn.co',         'spawn-co',         'Spawn.co',         'Spawn',         'https://spawn.co',                    'https://logo.clearbit.com/spawn.co',          'Game and app builder for interactive prototypes and quick validation MVPs.',                             NULL,                                           false, false, false, 'saas',        'active', 2024, true),
  ('Codeium',          'codeium',          'Codeium',          'Codeium',       'https://codeium.com',                 'https://logo.clearbit.com/codeium.com',       'Fast, free inline code completion alternative for everyday development.',                                NULL,                                           false, false, false, 'saas',        'active', 2022, true),
  ('Continue.dev',     'continue-dev',     'Continue.dev',     'Continue',      'https://continue.dev',                'https://logo.clearbit.com/continue.dev',      'Open-source Cursor alternative for self-hosted and privacy-first setups.',                              'https://github.com/continuedev/continue',      true,  true,  false, 'open_source', 'active', 2023, true),
  ('Qodo',             'qodo',             'Qodo',             'Qodo',          'https://qodo.ai',                     'https://logo.clearbit.com/qodo.ai',           'Test-focused coding agent for auto-generating unit tests at scale.',                                    NULL,                                           false, false, false, 'saas',        'active', 2023, true),
  ('Base44',           'base44',           'Base44',           'Base44',        'https://base44.com',                  'https://logo.clearbit.com/base44.com',        'Rapid prototype agent for full apps targeting non-dev founders.',                                       NULL,                                           false, false, false, 'saas',        'active', 2024, true),
  ('Emergent',         'emergent',         'Emergent',         'Emergent',      'https://emergent.sh',                 'https://logo.clearbit.com/emergent.sh',       'AI agent that builds and iterates apps end-to-end from a prompt.',                                      NULL,                                           false, false, false, 'saas',        'active', 2024, true),
  ('Manus',            'manus',            'Manus',            'Manus AI',      'https://manus.ai',                    'https://logo.clearbit.com/manus.ai',          'Autonomous dev agent for complex multi-step workflows.',                                                 NULL,                                           false, false, false, 'saas',        'active', 2024, true),
  ('n8n',              'n8n',              'n8n',              'n8n',           'https://n8n.io',                      'https://logo.clearbit.com/n8n.io',            'Self-hosted visual automation with custom code nodes for internal tools and agents.',                   'https://github.com/n8n-io/n8n',                true,  true,  true,  'open_source', 'active', 2019, true),
  ('Nebula',           'nebula',           'Nebula',           'Nebula',        'https://nebula.io',                   'https://logo.clearbit.com/nebula.io',         'Cloud-based coding collaborator for solo teams.',                                                        NULL,                                           false, false, false, 'saas',        'active', 2023, true),
  ('Testim',           'testim',           'Testim',           'Tricentis',     'https://testim.io',                   'https://logo.clearbit.com/testim.io',         'AI test automation platform for end-to-end testing.',                                                   NULL,                                           false, false, false, 'saas',        'active', 2015, true)
ON CONFLICT (slug) DO NOTHING;

-- Group 3: App & Website Builders
INSERT INTO tools (name, slug, canonical_name, company_name, website_url, logo_url, short_description, open_source, self_hostable, api_available, tool_type, lifecycle_status, founded_year, status_active) VALUES
  ('Dora',        'dora',        'Dora',        'Dora',        'https://dora.run',        'https://logo.clearbit.com/dora.run',        '3D and AI website builder with animations for immersive landing pages.',       false, false, false, 'saas', 'active', 2022, true),
  ('10Web',       '10web',       '10Web',       '10Web',       'https://10web.io',        'https://logo.clearbit.com/10web.io',        'AI WordPress site generator and optimizer for fast launches.',                  false, false, false, 'saas', 'active', 2017, true),
  ('Framer',      'framer',      'Framer',      'Framer',      'https://framer.com',      'https://logo.clearbit.com/framer.com',      'AI-powered site and interaction builder for high-converting landing pages.',    false, false, false, 'saas', 'active', 2014, true),
  ('Durable',     'durable',     'Durable',     'Durable',     'https://durable.co',      'https://logo.clearbit.com/durable.co',      'Instant AI website from one prompt for same-day client site launches.',         false, false, false, 'saas', 'active', 2021, true),
  ('Wegic',       'wegic',       'Wegic',       'Wegic',       'https://wegic.ai',        'https://logo.clearbit.com/wegic.ai',        'Conversational AI web builder for prompt-driven site creation.',                false, false, false, 'saas', 'active', 2024, true),
  ('Glide',       'glide',       'Glide',       'Glide',       'https://glideapps.com',   'https://logo.clearbit.com/glideapps.com',   'No-code apps from spreadsheets, turning Google Sheets into customer portals.',  false, false, false, 'saas', 'active', 2018, true),
  ('Adalo',       'adalo',       'Adalo',       'Adalo',       'https://adalo.com',       'https://logo.clearbit.com/adalo.com',       'Mobile app builder with AI-assisted logic and design.',                         false, false, false, 'saas', 'active', 2018, true),
  ('Bubble',      'bubble',      'Bubble',      'Bubble',      'https://bubble.io',       'https://logo.clearbit.com/bubble.io',       'Visual logic and AI generation for complex SaaS products without code.',        false, false, true,  'saas', 'active', 2012, true),
  ('Softr',       'softr',       'Softr',       'Softr',       'https://softr.io',        'https://logo.clearbit.com/softr.io',        'AI dashboards from Airtable and Supabase data for client portals.',             false, false, false, 'saas', 'active', 2020, true),
  ('Webflow',     'webflow',     'Webflow',     'Webflow',     'https://webflow.com',     'https://logo.clearbit.com/webflow.com',     'Professional sites with AI copy and layout for designers and marketers.',       false, false, true,  'saas', 'active', 2013, true),
  ('Design.com',  'design-com',  'Design.com',  'Design.com',  'https://design.com',      'https://logo.clearbit.com/design.com',      'AI brand and site generator for instant brand identity creation.',              false, false, false, 'saas', 'active', 2022, true),
  ('Super AI',    'super-ai',    'Super AI',    'Super',       'https://super.ai',        'https://logo.clearbit.com/super.ai',        'All-in-one site and app AI agent for prompt-driven creation.',                  false, false, false, 'saas', 'active', 2024, true)
ON CONFLICT (slug) DO NOTHING;

-- Group 4: Design & Image Generation
INSERT INTO tools (name, slug, canonical_name, company_name, website_url, logo_url, short_description, github_url, open_source, self_hostable, api_available, tool_type, lifecycle_status, founded_year, status_active) VALUES
  ('Midjourney',     'midjourney',     'Midjourney',     'Midjourney',      'https://midjourney.com',          'https://logo.clearbit.com/midjourney.com',         'Best-in-class image gen via Discord for product mockups, ads, and branding.',    NULL,                                              false, false, false, 'saas',        'active', 2022, true),
  ('Leonardo AI',    'leonardo-ai',    'Leonardo AI',    'Leonardo AI',     'https://leonardo.ai',             'https://logo.clearbit.com/leonardo.ai',            'Fine-tuned image model for consistent styles and UI concept generation.',         NULL,                                              false, false, true,  'saas',        'active', 2022, true),
  ('Flux',           'flux',           'Flux',           'Black Forest Labs','https://blackforestlabs.ai',     'https://logo.clearbit.com/blackforestlabs.ai',     'Open high-quality image model for free and local runs on IP-sensitive work.',    'https://github.com/black-forest-labs/flux',       true,  true,  true,  'open_source', 'active', 2024, true),
  ('Recraft',        'recraft',        'Recraft',        'Recraft',         'https://recraft.ai',              'https://logo.clearbit.com/recraft.ai',             'Vector and illustration specialist AI for brand-consistent visuals.',             NULL,                                              false, false, true,  'saas',        'active', 2023, true),
  ('Adobe Firefly',  'adobe-firefly',  'Adobe Firefly',  'Adobe',           'https://firefly.adobe.com',       'https://logo.clearbit.com/adobe.com',              'Enterprise-safe image generation inside Photoshop and Creative Cloud.',           NULL,                                              false, false, true,  'saas',        'active', 2023, true),
  ('Canva Magic Studio','canva-magic-studio','Canva Magic Studio','Canva',   'https://canva.com',               'https://logo.clearbit.com/canva.com',              'Everyday design with AI fill and magic edit for complete social content kits.',  NULL,                                              false, false, false, 'saas',        'active', 2012, true),
  ('Freepik AI',     'freepik-ai',     'Freepik AI',     'Freepik',         'https://freepik.com',             'https://logo.clearbit.com/freepik.com',            'Stock and custom AI-generated images for marketing and design.',                  NULL,                                              false, false, false, 'saas',        'active', 2010, true),
  ('Stylar',         'stylar',         'Stylar',         'Stylar',          'https://stylar.ai',               'https://logo.clearbit.com/stylar.ai',              'Style transfer specialist for consistent brand visual identity.',                 NULL,                                              false, false, false, 'saas',        'active', 2023, true),
  ('Clipdrop',       'clipdrop',       'Clipdrop',       'Stability AI',    'https://clipdrop.co',             'https://logo.clearbit.com/clipdrop.co',            'Background removal and object generation for clean product visuals.',             NULL,                                              false, false, true,  'saas',        'active', 2020, true),
  ('Looka',          'looka',          'Looka',          'Looka',           'https://looka.com',               'https://logo.clearbit.com/looka.com',              'AI logos and brand asset generator for solopreneurs and startups.',              NULL,                                              false, false, false, 'saas',        'active', 2016, true),
  ('Namelix',        'namelix',        'Namelix',        'Namelix',         'https://namelix.com',             'https://logo.clearbit.com/namelix.com',            'AI-powered business name and domain combo generator.',                            NULL,                                              false, false, false, 'saas',        'active', 2017, true),
  ('Brandmark',      'brandmark',      'Brandmark',      'Brandmark',       'https://brandmark.io',            'https://logo.clearbit.com/brandmark.io',           'Professional logo generator with complete brand system output.',                  NULL,                                              false, false, false, 'saas',        'active', 2016, true),
  ('Stockimg AI',    'stockimg-ai',    'Stockimg AI',    'Stockimg',        'https://stockimg.ai',             'https://logo.clearbit.com/stockimg.ai',            'Custom AI-generated stock images at scale for content teams.',                    NULL,                                              false, false, false, 'saas',        'active', 2022, true),
  ('Galileo AI',     'galileo-ai',     'Galileo AI',     'Galileo',         'https://usegalileo.ai',           'https://logo.clearbit.com/usegalileo.ai',          'UI/UX concept generator from text prompts for rapid design exploration.',        NULL,                                              false, false, false, 'saas',        'active', 2022, true),
  ('Bing Create',    'bing-create',    'Bing Create',    'Microsoft',       'https://bing.com/create',         'https://logo.clearbit.com/bing.com',               'Free quick AI image generation integrated into Bing.',                            NULL,                                              false, false, false, 'saas',        'active', 2023, true),
  ('Autodraw',       'autodraw',       'Autodraw',       'Google',          'https://autodraw.com',            'https://logo.clearbit.com/autodraw.com',           'Sketch-to-vector AI drawing tool for quick concept visualization.',               NULL,                                              false, false, false, 'saas',        'active', 2017, true),
  ('Designs AI',     'designs-ai',     'Designs AI',     'Designs.ai',      'https://designs.ai',              'https://logo.clearbit.com/designs.ai',             'Full branding kits with AI including logo, video, and mockups.',                  NULL,                                              false, false, false, 'saas',        'active', 2019, true),
  ('Vance AI',       'vance-ai',       'Vance AI',       'Vance AI',        'https://vanceai.com',             'https://logo.clearbit.com/vanceai.com',            'AI image upscaling and enhancement for sharper visuals.',                        NULL,                                              false, false, true,  'saas',        'active', 2019, true)
ON CONFLICT (slug) DO NOTHING;

-- Group 5: Video & Audio Creation
INSERT INTO tools (name, slug, canonical_name, company_name, website_url, logo_url, short_description, open_source, self_hostable, api_available, tool_type, lifecycle_status, founded_year, status_active) VALUES
  ('HeyGen',         'heygen',         'HeyGen',         'HeyGen',         'https://heygen.com',         'https://logo.clearbit.com/heygen.com',        'AI avatars and talking-head videos for personalized demos without cameras.',            false, false, true,  'saas', 'active', 2020, true),
  ('ElevenLabs',     'elevenlabs',     'ElevenLabs',     'ElevenLabs',     'https://elevenlabs.io',      'https://logo.clearbit.com/elevenlabs.io',     'Voice cloning and TTS for explainer videos, podcasts, and multilingual content.',       false, false, true,  'saas', 'active', 2022, true),
  ('Runway ML',      'runway-ml',      'Runway ML',      'Runway',         'https://runwayml.com',       'https://logo.clearbit.com/runwayml.com',      'Text-to-video and editing suite for product demos and social clips.',                    false, false, true,  'saas', 'active', 2018, true),
  ('Kling AI',       'kling-ai',       'Kling AI',       'Kuaishou',       'https://klingai.com',        'https://logo.clearbit.com/klingai.com',       'High-quality motion video generation from text and image prompts.',                      false, false, false, 'saas', 'active', 2024, true),
  ('Luma Dream Machine','luma-dream-machine','Luma Dream Machine','Luma AI','https://lumalabs.ai',        'https://logo.clearbit.com/lumalabs.ai',       'Dream-like video generation from text and images.',                                      false, false, true,  'saas', 'active', 2021, true),
  ('Sora',           'sora',           'Sora',           'OpenAI',         'https://openai.com/sora',    'https://logo.clearbit.com/openai.com',        'OpenAI flagship text-to-video model for cinematic AI video generation.',                 false, false, true,  'saas', 'active', 2024, true),
  ('Veo 2',          'veo-2',          'Veo 2',          'Google DeepMind','https://deepmind.google/veo','https://logo.clearbit.com/deepmind.google',   'Advanced video generation integrated with Gemini for professional use.',                  false, false, false, 'saas', 'active', 2024, true),
  ('Pika',           'pika',           'Pika',           'Pika Labs',      'https://pika.art',           'https://logo.clearbit.com/pika.art',          'Quick social video clip generator from text or image inputs.',                           false, false, false, 'saas', 'active', 2023, true),
  ('Pictory',        'pictory',        'Pictory',        'Pictory',        'https://pictory.ai',         'https://logo.clearbit.com/pictory.ai',        'Text-to-video from scripts and blog posts for content repurposing.',                    false, false, false, 'saas', 'active', 2021, true),
  ('Synthesia',      'synthesia',      'Synthesia',      'Synthesia',      'https://synthesia.io',       'https://logo.clearbit.com/synthesia.io',      'Avatar video at scale for L&D and marketing without camera crews.',                     false, false, true,  'saas', 'active', 2017, true),
  ('InVideo',        'invideo',        'InVideo',        'InVideo',        'https://invideo.io',         'https://logo.clearbit.com/invideo.io',        'Template and AI video editing platform for social and marketing content.',               false, false, false, 'saas', 'active', 2019, true),
  ('Opus Clip',      'opus-clip',      'Opus Clip',      'Opus Clip',      'https://opus.pro',           'https://logo.clearbit.com/opus.pro',          'Long video to viral shorts auto-editor for social media growth.',                        false, false, false, 'saas', 'active', 2023, true),
  ('Descript',       'descript',       'Descript',       'Descript',       'https://descript.com',       'https://logo.clearbit.com/descript.com',      'Audio and video editing with voice cloning and overdub capabilities.',                   false, false, false, 'saas', 'active', 2017, true),
  ('Lovo AI',        'lovo-ai',        'Lovo AI',        'Lovo AI',        'https://lovo.ai',            'https://logo.clearbit.com/lovo.ai',           'Multi-voice text-to-speech generation for content creators.',                           false, false, true,  'saas', 'active', 2019, true),
  ('Adobe Podcast',  'adobe-podcast',  'Adobe Podcast',  'Adobe',          'https://podcast.adobe.com',  'https://logo.clearbit.com/adobe.com',         'AI audio enhancement and noise removal for professional-quality podcasts.',              false, false, false, 'saas', 'active', 2022, true),
  ('CapCut AI',      'capcut-ai',      'CapCut AI',      'ByteDance',      'https://capcut.com',         'https://logo.clearbit.com/capcut.com',        'Mobile-first video editor with AI effects for social content.',                          false, false, false, 'saas', 'active', 2019, true)
ON CONFLICT (slug) DO NOTHING;

-- Group 6: Writing & Content Creation
INSERT INTO tools (name, slug, canonical_name, company_name, website_url, logo_url, short_description, open_source, self_hostable, api_available, tool_type, lifecycle_status, founded_year, status_active) VALUES
  ('Jasper AI',      'jasper-ai',      'Jasper AI',      'Jasper',         'https://jasper.ai',          'https://logo.clearbit.com/jasper.ai',          'Long-form marketing content generation at enterprise scale.',                            false, false, true,  'saas', 'active', 2021, true),
  ('Writesonic',     'writesonic',     'Writesonic',     'Writesonic',     'https://writesonic.com',     'https://logo.clearbit.com/writesonic.com',     'SEO-optimized copy and chat for marketing teams.',                                       false, false, true,  'saas', 'active', 2021, true),
  ('Copy AI',        'copy-ai',        'Copy AI',        'Copy.ai',        'https://copy.ai',            'https://logo.clearbit.com/copy.ai',            'Short-form sales copy and GTM workflow automation.',                                     false, false, true,  'saas', 'active', 2020, true),
  ('Rytr',           'rytr',           'Rytr',           'Rytr',           'https://rytr.me',            'https://logo.clearbit.com/rytr.me',            'Budget-friendly AI writer for common marketing and content use cases.',                  false, false, true,  'saas', 'active', 2021, true),
  ('Textblaze',      'textblaze',      'Textblaze',      'Textblaze',      'https://textblaze.me',       'https://logo.clearbit.com/textblaze.me',       'Snippet expansion and text automation for repetitive writing tasks.',                   false, false, false, 'saas', 'active', 2019, true),
  ('HIX AI',         'hix-ai',         'HIX AI',         'HIX AI',         'https://hix.ai',             'https://logo.clearbit.com/hix.ai',             'All-in-one AI writer for articles, emails, and varied content types.',                  false, false, true,  'saas', 'active', 2022, true),
  ('Jenny AI',       'jenny-ai',       'Jenny AI',       'Jenny AI',       'https://jenny.ai',           'https://logo.clearbit.com/jenny.ai',           'Personalized AI content and academic writing assistant.',                               false, false, false, 'saas', 'active', 2021, true),
  ('QuillBot',       'quillbot',       'QuillBot',       'QuillBot',       'https://quillbot.com',       'https://logo.clearbit.com/quillbot.com',       'Paraphrasing, summarizing, and grammar checking for polished writing.',                  false, false, false, 'saas', 'active', 2017, true),
  ('Grammarly',      'grammarly',      'Grammarly',      'Grammarly',      'https://grammarly.com',      'https://logo.clearbit.com/grammarly.com',      'Real-time editing, tone analysis, and business writing improvement.',                   false, false, true,  'saas', 'active', 2009, true),
  ('Surfer SEO',     'surfer-seo',     'Surfer SEO',     'Surfer',         'https://surferseo.com',      'https://logo.clearbit.com/surferseo.com',      'Content optimizer with AI writing and NLP keyword analysis.',                           false, false, false, 'saas', 'active', 2017, true),
  ('Anyword',        'anyword',        'Anyword',        'Anyword',        'https://anyword.com',        'https://logo.clearbit.com/anyword.com',        'Predictive performance scoring for marketing copy variants.',                           false, false, true,  'saas', 'active', 2013, true),
  ('Hoppy Copy',     'hoppy-copy',     'Hoppy Copy',     'Hoppy Copy',     'https://hoppycopy.co',       'https://logo.clearbit.com/hoppycopy.co',       'Email and ad copy specialist for high-converting campaigns.',                           false, false, false, 'saas', 'active', 2021, true),
  ('SurgeGraph',     'surgegraph',     'SurgeGraph',     'SurgeGraph',     'https://surgegraph.io',      'https://logo.clearbit.com/surgegraph.io',      'Long-form SEO article generator for content marketing teams.',                          false, false, false, 'saas', 'active', 2022, true),
  ('Sudowrite',      'sudowrite',      'Sudowrite',      'Sudowrite',      'https://sudowrite.com',      'https://logo.clearbit.com/sudowrite.com',      'Creative and long-form fiction writing AI for authors.',                                 false, false, false, 'saas', 'active', 2020, true),
  ('AdCreative AI',  'adcreative-ai',  'AdCreative AI',  'AdCreative.ai',  'https://adcreative.ai',      'https://logo.clearbit.com/adcreative.ai',      'Ad variant generator with AI-powered performance predictions.',                         false, false, true,  'saas', 'active', 2021, true),
  ('Predis AI',      'predis-ai',      'Predis AI',      'Predis',         'https://predis.ai',          'https://logo.clearbit.com/predis.ai',          'Social and ad content generator with built-in scheduling.',                             false, false, true,  'saas', 'active', 2021, true),
  ('JotBot',         'jotbot',         'JotBot',         'JotBot',         'https://myjotbot.com',       'https://logo.clearbit.com/myjotbot.com',       'Note-to-content AI writing assistant for structured drafts.',                           false, false, false, 'saas', 'active', 2022, true)
ON CONFLICT (slug) DO NOTHING;

-- Group 7: Productivity & Automation
INSERT INTO tools (name, slug, canonical_name, company_name, website_url, logo_url, short_description, github_url, open_source, self_hostable, api_available, tool_type, lifecycle_status, founded_year, status_active) VALUES
  ('Notion AI',        'notion-ai',        'Notion AI',        'Notion',      'https://notion.so',          'https://logo.clearbit.com/notion.so',          'Second brain with databases and AI writing — founders keep entire company ops here.',   NULL,                                      false, false, true,  'saas',        'active', 2016, true),
  ('Zapier',           'zapier',           'Zapier',           'Zapier',      'https://zapier.com',         'https://logo.clearbit.com/zapier.com',         'No-code automation connecting every tool in solo founder stacks.',                       NULL,                                      false, false, true,  'saas',        'active', 2011, true),
  ('Make',             'make',             'Make',             'Make',        'https://make.com',           'https://logo.clearbit.com/make.com',           'Complex visual automation workflows for advanced multi-step integrations.',               NULL,                                      false, false, true,  'saas',        'active', 2012, true),
  ('Bardeen AI',       'bardeen-ai',       'Bardeen AI',       'Bardeen',     'https://bardeen.ai',         'https://logo.clearbit.com/bardeen.ai',         'Browser automation agents for eliminating repetitive research and data tasks.',          NULL,                                      false, false, false, 'saas',        'active', 2020, true),
  ('ClickUp Brain',    'clickup-brain',    'ClickUp Brain',    'ClickUp',     'https://clickup.com',        'https://logo.clearbit.com/clickup.com',        'AI-powered task and project management with natural language commands.',                  NULL,                                      false, false, true,  'saas',        'active', 2017, true),
  ('Motion',           'motion',           'Motion',           'Motion',      'https://usemotion.com',      'https://logo.clearbit.com/usemotion.com',      'AI calendar and tasks that auto-schedule your day for maximum focus.',                    NULL,                                      false, false, false, 'saas',        'active', 2019, true),
  ('Clockwise',        'clockwise',        'Clockwise',        'Clockwise',   'https://getclockwise.com',   'https://logo.clearbit.com/getclockwise.com',   'Team scheduling AI that optimizes focus time and reduces meeting fragmentation.',         NULL,                                      false, false, false, 'saas',        'active', 2017, true),
  ('Granola',          'granola',          'Granola',          'Granola',     'https://granola.so',         'https://logo.clearbit.com/granola.so',         'AI meeting note taker for Mac with automatic action item extraction.',                   NULL,                                      false, false, false, 'saas',        'active', 2023, true),
  ('Relay.app',        'relay-app',        'Relay.app',        'Relay',       'https://relay.app',          'https://logo.clearbit.com/relay.app',          'Agent-powered workflow automation with human-in-the-loop steps.',                        NULL,                                      false, false, false, 'saas',        'active', 2022, true),
  ('Gumloop',          'gumloop',          'Gumloop',          'Gumloop',     'https://gumloop.com',        'https://logo.clearbit.com/gumloop.com',        'No-code AI agent builder for scraping, processing, and automating data flows.',          NULL,                                      false, false, false, 'saas',        'active', 2024, true),
  ('Stack AI',         'stack-ai',         'Stack AI',         'Stack AI',    'https://stack-ai.com',       'https://logo.clearbit.com/stack-ai.com',       'Enterprise AI workflow builder with LLM chains and API deployment.',                     NULL,                                      false, false, true,  'saas',        'active', 2023, true),
  ('Voiceflow',        'voiceflow',        'Voiceflow',        'Voiceflow',   'https://voiceflow.com',      'https://logo.clearbit.com/voiceflow.com',      'Conversational AI agent builder for product teams and developers.',                       NULL,                                      false, false, true,  'saas',        'active', 2019, true),
  ('Botpress',         'botpress',         'Botpress',         'Botpress',    'https://botpress.com',       'https://logo.clearbit.com/botpress.com',       'Open-source chatbot and agent builder with self-hosting support.',                        'https://github.com/botpress/botpress',    true,  true,  true,  'open_source', 'active', 2016, true),
  ('Xembly',           'xembly',           'Xembly',           'Xembly',      'https://xembly.com',         'https://logo.clearbit.com/xembly.com',         'AI chief of staff for meetings, scheduling, and action item tracking.',                  NULL,                                      false, false, false, 'saas',        'active', 2020, true),
  ('Jotform AI Agents','jotform-ai-agents','Jotform AI Agents','Jotform',     'https://jotform.com',        'https://logo.clearbit.com/jotform.com',        'Form-to-workflow automation with AI agents for data collection and routing.',             NULL,                                      false, false, true,  'saas',        'active', 2006, true),
  ('PrometAI',         'prometai',         'PrometAI',         'PrometAI',    'https://prometai.app',       'https://logo.clearbit.com/prometai.app',       'Business forecasting and strategic planning AI for founders.',                            NULL,                                      false, false, false, 'saas',        'active', 2023, true),
  ('HockeyStack',      'hockeystack',      'HockeyStack',      'HockeyStack', 'https://hockeystack.com',    'https://logo.clearbit.com/hockeystack.com',    'Product analytics and revenue attribution automation for B2B SaaS.',                     NULL,                                      false, false, true,  'saas',        'active', 2020, true),
  ('Siift AI',         'siift-ai',         'Siift AI',         'Siift',       'https://siift.ai',           'https://logo.clearbit.com/siift.ai',           'Startup strategy and market intelligence agent for early-stage founders.',               NULL,                                      false, false, false, 'saas',        'active', 2024, true),
  ('Cofounder AI',     'cofounder-ai',     'Cofounder AI',     'Cofounder',   'https://cofounder.ai',       'https://logo.clearbit.com/cofounder.ai',       'Personal AI business advisor for startup founders at every stage.',                       NULL,                                      false, false, false, 'saas',        'active', 2023, true),
  ('Zovoro AI',        'zovoro-ai',        'Zovoro AI',        'Zovoro',      'https://zovoro.com',         'https://logo.clearbit.com/zovoro.com',         'All-in-one growth dashboard with AI insights for scaling startups.',                      NULL,                                      false, false, false, 'saas',        'active', 2024, true)
ON CONFLICT (slug) DO NOTHING;

-- Group 8: Marketing & Sales
INSERT INTO tools (name, slug, canonical_name, company_name, website_url, logo_url, short_description, open_source, self_hostable, api_available, tool_type, lifecycle_status, founded_year, status_active) VALUES
  ('HubSpot AI',     'hubspot-ai',     'HubSpot AI',     'HubSpot',       'https://hubspot.com',        'https://logo.clearbit.com/hubspot.com',        'Full CRM with content and AI sales sequences for scaling startups.',                      false, false, true,  'saas', 'active', 2006, true),
  ('Qualified',      'qualified',      'Qualified',      'Qualified',     'https://qualified.com',      'https://logo.clearbit.com/qualified.com',      'AI-powered lead qualification and pipeline intelligence for revenue teams.',               false, false, true,  'saas', 'active', 2018, true),
  ('Drift',          'drift',          'Drift',          'Salesloft',     'https://drift.com',          'https://logo.clearbit.com/drift.com',          'Conversational marketing and sales automation for inbound pipeline.',                      false, false, true,  'saas', 'active', 2015, true),
  ('Outreach',       'outreach',       'Outreach',       'Outreach',      'https://outreach.io',        'https://logo.clearbit.com/outreach.io',        'AI sales sequences and revenue intelligence for enterprise sales teams.',                  false, false, true,  'saas', 'active', 2014, true),
  ('Typefully',      'typefully',      'Typefully',      'Typefully',     'https://typefully.com',      'https://logo.clearbit.com/typefully.com',      'X thread writer and scheduler for founder growth and audience building.',                  false, false, false, 'saas', 'active', 2020, true),
  ('Postwise',       'postwise',       'Postwise',       'Postwise',      'https://postwise.ai',        'https://logo.clearbit.com/postwise.ai',        'AI X post writer and growth tool for consistent social presence.',                         false, false, false, 'saas', 'active', 2022, true),
  ('Taplio',         'taplio',         'Taplio',         'Taplio',        'https://taplio.com',         'https://logo.clearbit.com/taplio.com',         'LinkedIn and X growth AI for personal branding and lead generation.',                     false, false, false, 'saas', 'active', 2021, true),
  ('Hypefury',       'hypefury',       'Hypefury',       'Hypefury',      'https://hypefury.com',       'https://logo.clearbit.com/hypefury.com',       'Content repurposing and X scheduling for social media growth.',                            false, false, false, 'saas', 'active', 2019, true),
  ('TweetHunter',    'tweethunter',    'TweetHunter',    'TweetHunter',   'https://tweethunter.io',     'https://logo.clearbit.com/tweethunter.io',     'AI thread ideas and X growth tool for viral content creation.',                           false, false, false, 'saas', 'active', 2021, true),
  ('Buffer AI',      'buffer-ai',      'Buffer AI',      'Buffer',        'https://buffer.com',         'https://logo.clearbit.com/buffer.com',         'Multi-platform social media scheduler with AI content suggestions.',                       false, false, true,  'saas', 'active', 2010, true),
  ('Hootsuite AI',   'hootsuite-ai',   'Hootsuite AI',   'Hootsuite',     'https://hootsuite.com',      'https://logo.clearbit.com/hootsuite.com',      'Enterprise social media management with AI publishing and analytics.',                    false, false, true,  'saas', 'active', 2008, true),
  ('Metricool',      'metricool',      'Metricool',      'Metricool',     'https://metricool.com',      'https://logo.clearbit.com/metricool.com',      'Analytics and AI content suggestions for social media optimization.',                     false, false, true,  'saas', 'active', 2016, true),
  ('Simplified',     'simplified',     'Simplified',     'Simplified',    'https://simplified.com',     'https://logo.clearbit.com/simplified.com',     'All-in-one design and marketing content platform with AI writing.',                       false, false, false, 'saas', 'active', 2021, true),
  ('Tribescaler',    'tribescaler',    'Tribescaler',    'Tribescaler',   'https://tribescaler.com',    'https://logo.clearbit.com/tribescaler.com',    'Community growth and viral hook AI for X and social media.',                              false, false, false, 'saas', 'active', 2022, true),
  ('Howler AI',      'howler-ai',      'Howler AI',      'Howler',        'https://howlerai.com',       'https://logo.clearbit.com/howlerai.com',       'Voice and ad specialist for growth marketers and performance campaigns.',                  false, false, false, 'saas', 'active', 2023, true),
  ('Emplifi',        'emplifi',        'Emplifi',        'Emplifi',       'https://emplifi.io',         'https://logo.clearbit.com/emplifi.io',         'Enterprise email and social AI platform for unified customer engagement.',                 false, false, true,  'saas', 'active', 2010, true),
  ('Pencil',         'pencil',         'Pencil',         'Pencil',        'https://trypencil.com',      'https://logo.clearbit.com/trypencil.com',      'AI ad creative generator and optimizer for performance marketing.',                       false, false, true,  'saas', 'active', 2018, true)
ON CONFLICT (slug) DO NOTHING;

-- Group 9: Meetings, Notes & Transcription
INSERT INTO tools (name, slug, canonical_name, company_name, website_url, logo_url, short_description, open_source, self_hostable, api_available, tool_type, lifecycle_status, founded_year, status_active) VALUES
  ('Fireflies AI',  'fireflies-ai',  'Fireflies AI',  'Fireflies',  'https://fireflies.ai',   'https://logo.clearbit.com/fireflies.ai',   'AI meeting transcription with action items and semantic search.',              false, false, true,  'saas', 'active', 2016, true),
  ('Otter AI',      'otter-ai',      'Otter AI',      'Otter',      'https://otter.ai',       'https://logo.clearbit.com/otter.ai',       'Real-time meeting notes with search and team collaboration.',                  false, false, true,  'saas', 'active', 2016, true),
  ('tl;dv',         'tldv',          'tl;dv',         'tl;dv',      'https://tldv.io',        'https://logo.clearbit.com/tldv.io',        'Clip, summarize, and share meeting highlights for async review.',              false, false, true,  'saas', 'active', 2021, true),
  ('Avoma',         'avoma',         'Avoma',         'Avoma',      'https://avoma.com',      'https://logo.clearbit.com/avoma.com',      'AI meeting assistant with coaching, scorecards, and full transcription.',      false, false, true,  'saas', 'active', 2017, true),
  ('Krisp',         'krisp',         'Krisp',         'Krisp',      'https://krisp.ai',       'https://logo.clearbit.com/krisp.ai',       'Noise cancellation plus AI meeting notes and conversation insights.',          false, false, false, 'saas', 'active', 2018, true),
  ('Noty AI',       'noty-ai',       'Noty AI',       'Noty',       'https://noty.ai',        'https://logo.clearbit.com/noty.ai',        'Smart AI note taker for meetings with automatic summaries.',                   false, false, false, 'saas', 'active', 2022, true),
  ('MeetGeek',      'meetgeek',      'MeetGeek',      'MeetGeek',   'https://meetgeek.ai',    'https://logo.clearbit.com/meetgeek.ai',    'Meeting intelligence with highlights, scoring, and team sharing.',             false, false, true,  'saas', 'active', 2020, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 4. Tool pricing
-- ============================================================

INSERT INTO tool_pricing (tool_id, plan_name, pricing_model_id, free_tier, starting_price_monthly, pricing_model, est_cost_5_users, est_cost_20_users, enterprise_only, notes, source_url)
VALUES
  -- General LLMs
  ((SELECT id FROM tools WHERE slug='chatgpt'),         'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  20.00,  'freemium',   20.00,  100.00, false, 'Free tier; Plus $20/mo; Team $30/seat; Enterprise custom', 'https://openai.com/chatgpt/pricing'),
  ((SELECT id FROM tools WHERE slug='claude'),          'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  20.00,  'freemium',   20.00,  100.00, false, 'Free tier; Pro $20/mo; Team $30/seat; API usage-based',    'https://anthropic.com/pricing'),
  ((SELECT id FROM tools WHERE slug='perplexity-ai'),   'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  20.00,  'freemium',   20.00,  100.00, false, 'Free tier; Pro $20/mo for unlimited searches',             'https://perplexity.ai/pro'),
  ((SELECT id FROM tools WHERE slug='google-gemini'),   'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.99, 'freemium',   19.99,  99.95,  false, 'Free tier; Gemini Advanced $19.99/mo in Google One AI',    'https://one.google.com/about/plans'),
  ((SELECT id FROM tools WHERE slug='grok'),            'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  8.00,  'freemium',   8.00,   40.00,  false, 'Free on X; Premium+ $8-16/mo for full Grok access',       'https://x.com/i/premium_sign_up'),
  ((SELECT id FROM tools WHERE slug='microsoft-copilot'),'default',(SELECT id FROM pricing_models WHERE slug='freemium'),   true,  30.00, 'seat_based', 150.00, 600.00, false, 'Free consumer; Microsoft 365 Copilot $30/seat/mo',        'https://www.microsoft.com/en-us/microsoft-365/copilot'),
  ((SELECT id FROM tools WHERE slug='poe'),             'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.99, 'freemium',   19.99,  99.95,  false, 'Free limited messages; Pro $19.99/mo unlimited',          'https://poe.com/pricing'),
  ((SELECT id FROM tools WHERE slug='huggingchat'),     'default', (SELECT id FROM pricing_models WHERE slug='free'),       true,  0.00,  'free',       0.00,   0.00,   false, 'Fully free and open-source; self-host for full control',  'https://huggingface.co/chat'),
  ((SELECT id FROM tools WHERE slug='deepseek-r1'),     'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  0.00,  'usage_based',0.00,   0.00,   false, 'Free web chat; API usage-based ~$0.14/M input tokens',    'https://platform.deepseek.com/pricing'),
  ((SELECT id FROM tools WHERE slug='bing-chat'),       'default', (SELECT id FROM pricing_models WHERE slug='free'),       true,  0.00,  'free',       0.00,   0.00,   false, 'Free with Microsoft account; Copilot Pro $20/mo optional','https://bing.com/chat'),
  ((SELECT id FROM tools WHERE slug='otio'),            'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  17.00, 'freemium',   17.00,  85.00,  false, 'Free tier; Pro $17/mo for advanced research features',    'https://otio.com/pricing'),
  ((SELECT id FROM tools WHERE slug='silatus'),         'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 49.00, 'seat_based', 245.00, 980.00, false, 'Starts ~$49/seat/mo; enterprise pricing available',       'https://silatus.com/pricing'),
  ((SELECT id FROM tools WHERE slug='flowith'),         'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  15.00, 'freemium',   15.00,  75.00,  false, 'Free tier; Pro $15/mo for unlimited knowledge bases',     'https://flowith.io/pricing'),
  ((SELECT id FROM tools WHERE slug='notebooklm'),      'default', (SELECT id FROM pricing_models WHERE slug='free'),       true,  0.00,  'free',       0.00,   0.00,   false, 'Free Google product; NotebookLM Plus in Google One AI',   'https://notebooklm.google.com'),
  ((SELECT id FROM tools WHERE slug='perplexity-computer'),'default',(SELECT id FROM pricing_models WHERE slug='freemium'), true,  20.00, 'freemium',   20.00,  100.00, false, 'Bundled with Perplexity Pro $20/mo',                      'https://perplexity.ai/pro'),

  -- Coding tools
  ((SELECT id FROM tools WHERE slug='cursor-ide'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  20.00, 'freemium',   20.00,  100.00, false, 'Hobby free; Pro $20/mo; Business $40/seat/mo',            'https://cursor.com/pricing'),
  ((SELECT id FROM tools WHERE slug='claude-code'),     'default', (SELECT id FROM pricing_models WHERE slug='usage_based'),false, 0.00,  'usage_based',0.00,   0.00,   false, 'Usage-based via Anthropic API; ~$3-15/M tokens',          'https://anthropic.com/pricing'),
  ((SELECT id FROM tools WHERE slug='github-copilot-pro'),'default',(SELECT id FROM pricing_models WHERE slug='seat_based'),false, 19.00, 'seat_based', 95.00,  380.00, false, 'Individual $10/mo; Business $19/seat/mo',                 'https://github.com/features/copilot#pricing'),
  ((SELECT id FROM tools WHERE slug='replit'),          'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  25.00, 'freemium',   25.00,  125.00, false, 'Free starter; Core $15/mo; Teams $25/seat/mo',            'https://replit.com/pricing'),
  ((SELECT id FROM tools WHERE slug='windsurf'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  15.00, 'freemium',   15.00,  75.00,  false, 'Free tier; Pro $15/mo; Teams $35/seat/mo',                'https://codeium.com/windsurf/pricing'),
  ((SELECT id FROM tools WHERE slug='v0'),              'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  20.00, 'freemium',   20.00,  100.00, false, 'Free credits/mo; Pro $20/mo for more generations',        'https://v0.dev/pricing'),
  ((SELECT id FROM tools WHERE slug='lovable'),         'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  25.00, 'freemium',   25.00,  125.00, false, 'Free starter; Pro $25/mo; Teams $50/seat/mo',             'https://lovable.dev/pricing'),
  ((SELECT id FROM tools WHERE slug='bolt-new'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  20.00, 'freemium',   20.00,  100.00, false, 'Free tokens/day; Pro $20/mo for more compute',            'https://bolt.new/pricing'),
  ((SELECT id FROM tools WHERE slug='factory'),         'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 59.00, 'seat_based', 295.00, 1180.00,false, 'Starts ~$59/seat/mo; enterprise contracts available',     'https://factory.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='codex'),           'default', (SELECT id FROM pricing_models WHERE slug='usage_based'),false, 0.00,  'usage_based',0.00,   0.00,   false, 'Usage-based via OpenAI API; part of ChatGPT Plus',        'https://platform.openai.com/pricing'),
  ((SELECT id FROM tools WHERE slug='spawn-co'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.00, 'freemium',   19.00,  95.00,  false, 'Free plan available; paid plans from $19/mo',             'https://spawn.co/pricing'),
  ((SELECT id FROM tools WHERE slug='codeium'),         'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  15.00, 'freemium',   15.00,  60.00,  false, 'Free individual; Teams $15/seat/mo',                      'https://codeium.com/pricing'),
  ((SELECT id FROM tools WHERE slug='continue-dev'),    'default', (SELECT id FROM pricing_models WHERE slug='free'),       true,  0.00,  'free',       0.00,   0.00,   false, 'Free and open-source; BYOK or self-host models',          'https://continue.dev'),
  ((SELECT id FROM tools WHERE slug='qodo'),            'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.00, 'freemium',   19.00,  95.00,  false, 'Free dev plan; Teams $19/seat/mo',                        'https://qodo.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='base44'),          'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  20.00, 'freemium',   20.00,  100.00, false, 'Free tier; Pro $20/mo for more projects',                 'https://base44.com/pricing'),
  ((SELECT id FROM tools WHERE slug='emergent'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  29.00, 'freemium',   29.00,  145.00, false, 'Free tier; Pro plans from $29/mo',                        'https://emergent.sh/pricing'),
  ((SELECT id FROM tools WHERE slug='manus'),           'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  39.00, 'freemium',   39.00,  195.00, false, 'Invite-only; Pro plans from ~$39/mo',                     'https://manus.ai'),
  ((SELECT id FROM tools WHERE slug='n8n'),             'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  24.00, 'freemium',   24.00,  60.00,  false, 'Self-host free; Cloud Starter $24/mo; Pro $60/mo',        'https://n8n.io/pricing'),
  ((SELECT id FROM tools WHERE slug='nebula'),          'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.00, 'freemium',   19.00,  95.00,  false, 'Free tier available; Pro from $19/mo',                    'https://nebula.io/pricing'),
  ((SELECT id FROM tools WHERE slug='testim'),          'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  450.00,'seat_based', 450.00, 1800.00,false, 'Free trial; paid plans from ~$450/mo for teams',          'https://testim.io/pricing'),

  -- Website builders
  ((SELECT id FROM tools WHERE slug='dora'),            'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  16.00, 'freemium',   16.00,  80.00,  false, 'Free plan; Pro $16/mo; Team $49/mo',                      'https://dora.run/pricing'),
  ((SELECT id FROM tools WHERE slug='10web'),           'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  10.00, 'freemium',   10.00,  50.00,  false, 'Free trial; Personal $10/mo; Agency from $24/mo',         'https://10web.io/pricing'),
  ((SELECT id FROM tools WHERE slug='framer'),          'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  15.00, 'freemium',   15.00,  75.00,  false, 'Free plan; Mini $5/mo; Basic $15/mo; Pro $25/mo',         'https://framer.com/pricing'),
  ((SELECT id FROM tools WHERE slug='durable'),         'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  12.00, 'freemium',   12.00,  60.00,  false, 'Free trial; Starter $12/mo; Business $20/mo',             'https://durable.co/pricing'),
  ((SELECT id FROM tools WHERE slug='wegic'),           'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  9.90,  'freemium',   9.90,   49.50,  false, 'Free tier; paid plans from ~$9.90/mo',                    'https://wegic.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='glide'),           'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  25.00, 'freemium',   25.00,  125.00, false, 'Free plan; Starter $25/mo; Pro $99/mo',                   'https://glideapps.com/pricing'),
  ((SELECT id FROM tools WHERE slug='adalo'),           'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  36.00, 'freemium',   36.00,  180.00, false, 'Free plan; Starter $36/mo; Pro $52/mo',                   'https://adalo.com/pricing'),
  ((SELECT id FROM tools WHERE slug='bubble'),          'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  29.00, 'freemium',   29.00,  145.00, false, 'Free plan; Starter $29/mo; Growth $119/mo',               'https://bubble.io/pricing'),
  ((SELECT id FROM tools WHERE slug='softr'),           'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  49.00, 'freemium',   49.00,  245.00, false, 'Free plan; Basic $49/mo; Professional $99/mo',            'https://softr.io/pricing'),
  ((SELECT id FROM tools WHERE slug='webflow'),         'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  18.00, 'freemium',   18.00,  90.00,  false, 'Free plan; Basic $18/mo; CMS $29/mo; Business $49/mo',    'https://webflow.com/pricing'),
  ((SELECT id FROM tools WHERE slug='design-com'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  10.00, 'freemium',   10.00,  50.00,  false, 'Free plan; paid plans from $10/mo',                       'https://design.com/pricing'),
  ((SELECT id FROM tools WHERE slug='super-ai'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  29.00, 'freemium',   29.00,  145.00, false, 'Free tier; Pro plans from $29/mo',                        'https://super.ai/pricing'),

  -- Image generation
  ((SELECT id FROM tools WHERE slug='midjourney'),      'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 10.00, 'seat_based', 50.00,  200.00, false, 'Basic $10/mo; Standard $30/mo; Pro $60/mo; Mega $120/mo', 'https://midjourney.com/account'),
  ((SELECT id FROM tools WHERE slug='leonardo-ai'),     'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  12.00, 'freemium',   12.00,  60.00,  false, 'Free 150 tokens/day; Apprentice $12/mo; Artisan $30/mo',  'https://leonardo.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='flux'),            'default', (SELECT id FROM pricing_models WHERE slug='free'),       true,  0.00,  'free',       0.00,   0.00,   false, 'Free open-source; API pricing via providers like Replicate','https://blackforestlabs.ai'),
  ((SELECT id FROM tools WHERE slug='recraft'),         'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  12.00, 'freemium',   12.00,  60.00,  false, 'Free credits; Pro $12/mo for 1000 credits',               'https://recraft.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='adobe-firefly'),   'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  4.99,  'freemium',   4.99,   24.95,  false, 'Free 25 credits/mo; Premium $4.99/mo; CC plans include it','https://firefly.adobe.com/pricing'),
  ((SELECT id FROM tools WHERE slug='canva-magic-studio'),'default',(SELECT id FROM pricing_models WHERE slug='freemium'),  true,  15.00, 'freemium',   15.00,  75.00,  false, 'Free plan; Pro $15/mo; Teams $10/seat/mo (min 5)',         'https://canva.com/pricing'),
  ((SELECT id FROM tools WHERE slug='freepik-ai'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  9.99,  'freemium',   9.99,   49.95,  false, 'Free limited; Essential $9.99/mo; Premium $19.99/mo',     'https://freepik.com/plans'),
  ((SELECT id FROM tools WHERE slug='stylar'),          'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  9.00,  'freemium',   9.00,   45.00,  false, 'Free credits; Pro $9/mo for more generations',            'https://stylar.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='clipdrop'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  9.00,  'freemium',   9.00,   45.00,  false, 'Free plan; Pro $9/mo for unlimited removals and edits',   'https://clipdrop.co/pricing'),
  ((SELECT id FROM tools WHERE slug='looka'),           'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  20.00, 'freemium',   20.00,  100.00, false, 'Free to design; Brand Kit $96/yr; files sold separately', 'https://looka.com/pricing'),
  ((SELECT id FROM tools WHERE slug='namelix'),         'default', (SELECT id FROM pricing_models WHERE slug='free'),       true,  0.00,  'free',       0.00,   0.00,   false, 'Free name generation tool; no paid tier',                 'https://namelix.com'),
  ((SELECT id FROM tools WHERE slug='brandmark'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   false, 25.00, 'freemium',   25.00,  125.00, false, 'Basic $25 one-time; Designer $65; Enterprise $175',       'https://brandmark.io/pricing'),
  ((SELECT id FROM tools WHERE slug='stockimg-ai'),     'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.00, 'freemium',   19.00,  95.00,  false, 'Free images/mo; Starter $19/mo; Premium $29/mo',          'https://stockimg.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='galileo-ai'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.00, 'freemium',   19.00,  95.00,  false, 'Free credits; Pro $19/mo for more UI generations',        'https://usegalileo.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='bing-create'),     'default', (SELECT id FROM pricing_models WHERE slug='free'),       true,  0.00,  'free',       0.00,   0.00,   false, 'Free; boosted generations use Bing reward points',        'https://bing.com/create'),
  ((SELECT id FROM tools WHERE slug='autodraw'),        'default', (SELECT id FROM pricing_models WHERE slug='free'),       true,  0.00,  'free',       0.00,   0.00,   false, 'Fully free Google product',                               'https://autodraw.com'),
  ((SELECT id FROM tools WHERE slug='designs-ai'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  29.00, 'freemium',   29.00,  145.00, false, 'Free trial; Basic $29/mo; Pro $69/mo',                    'https://designs.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='vance-ai'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  4.95,  'freemium',   4.95,   24.75,  false, 'Free 3 images/mo; Personal $4.95/mo; Pro $19.95/mo',      'https://vanceai.com/pricing'),

  -- Video & Audio
  ((SELECT id FROM tools WHERE slug='heygen'),          'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  29.00, 'freemium',   29.00,  145.00, false, 'Free 1 credit; Creator $29/mo; Team $89/mo',              'https://heygen.com/pricing'),
  ((SELECT id FROM tools WHERE slug='elevenlabs'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  5.00,  'freemium',   5.00,   25.00,  false, 'Free 10K chars/mo; Starter $5/mo; Creator $22/mo',        'https://elevenlabs.io/pricing'),
  ((SELECT id FROM tools WHERE slug='runway-ml'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  15.00, 'freemium',   15.00,  75.00,  false, 'Free 125 credits; Standard $15/mo; Pro $35/mo',           'https://runwayml.com/pricing'),
  ((SELECT id FROM tools WHERE slug='kling-ai'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  10.00, 'freemium',   10.00,  50.00,  false, 'Free daily credits; paid plans from ~$10/mo',             'https://klingai.com/pricing'),
  ((SELECT id FROM tools WHERE slug='luma-dream-machine'),'default',(SELECT id FROM pricing_models WHERE slug='freemium'),  true,  29.99, 'freemium',   29.99,  149.95, false, 'Free 30 generations/mo; Plus $29.99/mo; Pro $99.99/mo',   'https://lumalabs.ai/dream-machine/pricing'),
  ((SELECT id FROM tools WHERE slug='sora'),            'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  20.00, 'freemium',   20.00,  100.00, false, 'Included with ChatGPT Plus $20/mo; Pro $200/mo',          'https://openai.com/sora'),
  ((SELECT id FROM tools WHERE slug='veo-2'),           'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.99, 'freemium',   19.99,  99.95,  false, 'Available via Google One AI Premium $19.99/mo',           'https://one.google.com/about/plans'),
  ((SELECT id FROM tools WHERE slug='pika'),            'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  8.00,  'freemium',   8.00,   40.00,  false, 'Free plan; Basic $8/mo; Standard $28/mo; Unlimited $58/mo','https://pika.art/pricing'),
  ((SELECT id FROM tools WHERE slug='pictory'),         'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 19.00, 'seat_based', 19.00,  95.00,  false, 'Starter $19/mo; Professional $39/mo; Teams $99/mo',       'https://pictory.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='synthesia'),       'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 29.00, 'seat_based', 145.00, 580.00, false, 'Personal $29/mo; Enterprise custom; 100+ avatars',        'https://synthesia.io/pricing'),
  ((SELECT id FROM tools WHERE slug='invideo'),         'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  25.00, 'freemium',   25.00,  125.00, false, 'Free plan; Plus $25/mo; Max $60/mo',                      'https://invideo.io/pricing'),
  ((SELECT id FROM tools WHERE slug='opus-clip'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  15.00, 'freemium',   15.00,  75.00,  false, 'Free 60 mins/mo; Starter $15/mo; Pro $29/mo',             'https://opus.pro/pricing'),
  ((SELECT id FROM tools WHERE slug='descript'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  24.00, 'freemium',   24.00,  120.00, false, 'Free 1hr transcription; Creator $24/mo; Pro $40/mo',      'https://descript.com/pricing'),
  ((SELECT id FROM tools WHERE slug='lovo-ai'),         'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.00, 'freemium',   19.00,  95.00,  false, 'Free plan; Basic $19/mo; Pro $49/mo',                     'https://lovo.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='adobe-podcast'),   'default', (SELECT id FROM pricing_models WHERE slug='free'),       true,  0.00,  'free',       0.00,   0.00,   false, 'Free beta; Enhance Speech free; full features in CC',     'https://podcast.adobe.com'),
  ((SELECT id FROM tools WHERE slug='capcut-ai'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  7.99,  'freemium',   7.99,   39.95,  false, 'Free plan; Pro $7.99/mo; Business $13.99/mo',             'https://capcut.com/pricing'),

  -- Writing & Content
  ((SELECT id FROM tools WHERE slug='jasper-ai'),       'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 49.00, 'seat_based', 245.00, 980.00, false, 'Creator $49/mo; Teams $125/mo (3 seats); Business custom', 'https://jasper.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='writesonic'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  16.00, 'freemium',   16.00,  80.00,  false, 'Free 10K words/mo; Individual $16/mo; Teams $30/mo',      'https://writesonic.com/pricing'),
  ((SELECT id FROM tools WHERE slug='copy-ai'),         'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  49.00, 'freemium',   49.00,  245.00, false, 'Free 2K words/mo; Pro $49/mo; Teams $249/mo',             'https://copy.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='rytr'),            'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  9.00,  'freemium',   9.00,   45.00,  false, 'Free 10K chars/mo; Saver $9/mo; Unlimited $29/mo',        'https://rytr.me/pricing'),
  ((SELECT id FROM tools WHERE slug='textblaze'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  3.99,  'freemium',   3.99,   19.95,  false, 'Free plan; Pro $3.99/mo; Business $6.99/seat/mo',         'https://textblaze.me/pricing'),
  ((SELECT id FROM tools WHERE slug='hix-ai'),          'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.99, 'freemium',   19.99,  99.95,  false, 'Free plan; Pro $19.99/mo; Team plans available',          'https://hix.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='jenny-ai'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  12.00, 'freemium',   12.00,  60.00,  false, 'Free plan; Basic $12/mo; Premium $25/mo',                 'https://jenny.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='quillbot'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  9.95,  'freemium',   9.95,   49.75,  false, 'Free plan; Premium $9.95/mo; Teams from $6.67/seat/mo',   'https://quillbot.com/pricing'),
  ((SELECT id FROM tools WHERE slug='grammarly'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  12.00, 'freemium',   12.00,  60.00,  false, 'Free plan; Premium $12/mo; Business $15/seat/mo',         'https://grammarly.com/plans'),
  ((SELECT id FROM tools WHERE slug='surfer-seo'),      'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 89.00, 'seat_based', 89.00,  445.00, false, 'Essential $89/mo; Scale $129/mo; Scale AI $219/mo',       'https://surferseo.com/pricing'),
  ((SELECT id FROM tools WHERE slug='anyword'),         'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  39.00, 'freemium',   39.00,  195.00, false, 'Starter $39/mo; Data-Driven $79/mo; Business $349/mo',    'https://anyword.com/pricing'),
  ((SELECT id FROM tools WHERE slug='hoppy-copy'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  29.00, 'freemium',   29.00,  145.00, false, 'Starter $29/mo; Pro $49/mo; Premium $99/mo',              'https://hoppycopy.co/pricing'),
  ((SELECT id FROM tools WHERE slug='surgegraph'),      'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 49.00, 'seat_based', 49.00,  245.00, false, 'Solo $49/mo; Pro $79/mo; Agency $199/mo',                 'https://surgegraph.io/pricing'),
  ((SELECT id FROM tools WHERE slug='sudowrite'),       'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 19.00, 'seat_based', 19.00,  95.00,  false, 'Hobby $19/mo; Professional $29/mo; Max $59/mo',           'https://sudowrite.com/pricing'),
  ((SELECT id FROM tools WHERE slug='adcreative-ai'),   'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  29.00, 'freemium',   29.00,  145.00, false, 'Starter $29/mo; Professional $59/mo; Ultimate $99/mo',    'https://adcreative.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='predis-ai'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  32.00, 'freemium',   32.00,  160.00, false, 'Lite $32/mo; Standard $59/mo; Premium $149/mo',           'https://predis.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='jotbot'),          'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  16.00, 'freemium',   16.00,  80.00,  false, 'Free plan; Basic $16/mo; Pro $28/mo',                     'https://myjotbot.com/pricing'),

  -- Productivity & Automation
  ((SELECT id FROM tools WHERE slug='notion-ai'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  16.00, 'freemium',   80.00,  320.00, false, 'Free plan; Plus $16/mo; Business $15/seat/mo (AI add-on +$8/seat)','https://notion.so/pricing'),
  ((SELECT id FROM tools WHERE slug='zapier'),          'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  29.99, 'freemium',   149.95, 599.80, false, 'Free 100 tasks/mo; Starter $29.99/mo; Professional $73.50/mo','https://zapier.com/pricing'),
  ((SELECT id FROM tools WHERE slug='make'),            'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  10.59, 'freemium',   10.59,  52.95,  false, 'Free 1K ops/mo; Core $10.59/mo; Pro $18.82/mo; Teams $34.12/mo','https://make.com/en/pricing'),
  ((SELECT id FROM tools WHERE slug='bardeen-ai'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  20.00, 'freemium',   20.00,  100.00, false, 'Free 500 credits/mo; Professional $20/mo; Business $60/mo','https://bardeen.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='clickup-brain'),   'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 7.00,  'seat_based', 35.00,  140.00, false, 'AI add-on $7/seat/mo on top of ClickUp plan',             'https://clickup.com/pricing'),
  ((SELECT id FROM tools WHERE slug='motion'),          'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 34.00, 'seat_based', 170.00, 680.00, false, 'Individual $34/mo; Team $20/seat/mo',                     'https://usemotion.com/pricing'),
  ((SELECT id FROM tools WHERE slug='clockwise'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  6.75,  'freemium',   33.75,  135.00, false, 'Free plan; Teams $6.75/seat/mo; Business $11.50/seat/mo', 'https://getclockwise.com/pricing'),
  ((SELECT id FROM tools WHERE slug='granola'),         'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  18.00, 'freemium',   18.00,  90.00,  false, 'Free 25 meetings; Pro $18/mo; Team $14/seat/mo',           'https://granola.so/pricing'),
  ((SELECT id FROM tools WHERE slug='relay-app'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  9.00,  'freemium',   45.00,  180.00, false, 'Free plan; Pro $9/seat/mo; Business $18/seat/mo',         'https://relay.app/pricing'),
  ((SELECT id FROM tools WHERE slug='gumloop'),         'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  97.00, 'freemium',   97.00,  485.00, false, 'Free 1K credits; Starter $97/mo; Pro $297/mo',            'https://gumloop.com/pricing'),
  ((SELECT id FROM tools WHERE slug='stack-ai'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  199.00,'freemium',   199.00, 995.00, false, 'Free tier; Starter $199/mo; Enterprise custom',           'https://stack-ai.com/pricing'),
  ((SELECT id FROM tools WHERE slug='voiceflow'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  50.00, 'freemium',   50.00,  250.00, false, 'Sandbox free; Pro $50/mo; Team $125/mo (3 seats)',        'https://voiceflow.com/pricing'),
  ((SELECT id FROM tools WHERE slug='botpress'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  0.00,  'free',       0.00,   0.00,   false, 'Open-source free; Cloud Plus $89/mo; Business $495/mo',   'https://botpress.com/pricing'),
  ((SELECT id FROM tools WHERE slug='xembly'),          'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 25.00, 'seat_based', 125.00, 500.00, false, 'Per seat pricing ~$25/mo; enterprise contracts available','https://xembly.com/pricing'),
  ((SELECT id FROM tools WHERE slug='jotform-ai-agents'),'default',(SELECT id FROM pricing_models WHERE slug='freemium'),   true,  39.00, 'freemium',   39.00,  195.00, false, 'Free 5 forms; Bronze $39/mo; Silver $49/mo; Gold $129/mo','https://jotform.com/pricing'),
  ((SELECT id FROM tools WHERE slug='prometai'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  29.00, 'freemium',   29.00,  145.00, false, 'Free tier; Pro $29/mo; Business plans available',         'https://prometai.app/pricing'),
  ((SELECT id FROM tools WHERE slug='hockeystack'),     'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 749.00,'seat_based', 749.00, 749.00, false, 'Self-serve from $749/mo; enterprise custom pricing',      'https://hockeystack.com/pricing'),
  ((SELECT id FROM tools WHERE slug='siift-ai'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.00, 'freemium',   19.00,  95.00,  false, 'Free tier; Pro $19/mo; Team plans available',             'https://siift.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='cofounder-ai'),    'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  29.00, 'freemium',   29.00,  145.00, false, 'Free plan; Pro $29/mo',                                   'https://cofounder.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='zovoro-ai'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.00, 'freemium',   19.00,  95.00,  false, 'Free plan; Pro $19/mo',                                   'https://zovoro.com/pricing'),

  -- Marketing & Sales
  ((SELECT id FROM tools WHERE slug='hubspot-ai'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  45.00, 'freemium',   225.00, 900.00, false, 'Free CRM; Starter $45/mo; Pro $800/mo; Enterprise $3,600/mo','https://hubspot.com/pricing'),
  ((SELECT id FROM tools WHERE slug='qualified'),       'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 3500.00,'enterprise',3500.00,3500.00,false,  'Starts ~$3,500/mo; enterprise contract pricing',          'https://qualified.com/pricing'),
  ((SELECT id FROM tools WHERE slug='drift'),           'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 2500.00,'enterprise',2500.00,2500.00,false,  'Premium from ~$2,500/mo; enterprise custom',              'https://drift.com/pricing'),
  ((SELECT id FROM tools WHERE slug='outreach'),        'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 100.00,'seat_based', 500.00, 2000.00,false,  'Per seat pricing ~$100+/mo; enterprise custom contracts', 'https://outreach.io/pricing'),
  ((SELECT id FROM tools WHERE slug='typefully'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  12.50, 'freemium',   12.50,  62.50,  false, 'Free plan; Creator $12.50/mo; Team $29/mo per workspace', 'https://typefully.com/pricing'),
  ((SELECT id FROM tools WHERE slug='postwise'),        'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 37.00, 'seat_based', 37.00,  185.00, false, 'Growth $37/mo; Unlimited $97/mo',                         'https://postwise.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='taplio'),          'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 49.00, 'seat_based', 49.00,  245.00, false, 'Starter $49/mo; Standard $66/mo; Pro $99/mo',             'https://taplio.com/pricing'),
  ((SELECT id FROM tools WHERE slug='hypefury'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.00, 'freemium',   19.00,  95.00,  false, 'Free trial; Personal $19/mo; Business $49/mo',            'https://hypefury.com/pricing'),
  ((SELECT id FROM tools WHERE slug='tweethunter'),     'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 49.00, 'seat_based', 49.00,  245.00, false, 'Grow $49/mo; Accelerate $99/mo',                          'https://tweethunter.io/pricing'),
  ((SELECT id FROM tools WHERE slug='buffer-ai'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  6.00,  'freemium',   30.00,  120.00, false, 'Free 3 channels; Essentials $6/mo; Team $12/mo/channel',  'https://buffer.com/pricing'),
  ((SELECT id FROM tools WHERE slug='hootsuite-ai'),    'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 99.00, 'seat_based', 99.00,  495.00, false, 'Professional $99/mo; Team $249/mo; Business $739/mo',     'https://hootsuite.com/plans'),
  ((SELECT id FROM tools WHERE slug='metricool'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  22.00, 'freemium',   22.00,  110.00, false, 'Free 1 brand; Starter $22/mo; Advanced $59/mo; Custom plans','https://metricool.com/prices'),
  ((SELECT id FROM tools WHERE slug='simplified'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  18.00, 'freemium',   18.00,  90.00,  false, 'Free plan; Small Team $18/mo; Business $30/mo',           'https://simplified.com/pricing'),
  ((SELECT id FROM tools WHERE slug='tribescaler'),     'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 19.00, 'seat_based', 19.00,  95.00,  false, 'Solo $19/mo; Professional $49/mo',                        'https://tribescaler.com/pricing'),
  ((SELECT id FROM tools WHERE slug='howler-ai'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  29.00, 'freemium',   29.00,  145.00, false, 'Free tier; Pro $29/mo; Agency plans available',           'https://howlerai.com/pricing'),
  ((SELECT id FROM tools WHERE slug='emplifi'),         'default', (SELECT id FROM pricing_models WHERE slug='enterprise'), false, 2000.00,'enterprise',2000.00,2000.00,false,  'Enterprise pricing; typical starting ~$2,000+/mo',        'https://emplifi.io/pricing'),
  ((SELECT id FROM tools WHERE slug='pencil'),          'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  119.00,'freemium',  119.00,  595.00, false, 'Free trial; Starter $119/mo; Pro $299/mo; Scale $599/mo', 'https://trypencil.com/pricing'),

  -- Meetings & Transcription
  ((SELECT id FROM tools WHERE slug='fireflies-ai'),    'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  18.00, 'freemium',   90.00,  360.00, false, 'Free plan; Pro $18/seat/mo; Business $29/seat/mo',        'https://fireflies.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='otter-ai'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  16.99, 'freemium',   84.95,  339.80, false, 'Free 300 min/mo; Pro $16.99/mo; Business $30/seat/mo',    'https://otter.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='tldv'),            'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  29.00, 'freemium',   29.00,  145.00, false, 'Free unlimited recordings; Pro $29/mo; Business $69/mo',  'https://tldv.io/pricing'),
  ((SELECT id FROM tools WHERE slug='avoma'),           'default', (SELECT id FROM pricing_models WHERE slug='seat_based'), false, 24.00, 'seat_based', 120.00, 480.00, false, 'Starter $24/seat/mo; Plus $59/seat/mo; Business $79/seat/mo','https://avoma.com/pricing'),
  ((SELECT id FROM tools WHERE slug='krisp'),           'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  12.00, 'freemium',   12.00,  60.00,  false, 'Free 60 min/day noise cancel; Pro $12/mo',                'https://krisp.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='noty-ai'),         'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  16.00, 'freemium',   16.00,  80.00,  false, 'Free plan; Pro $16/mo; Team plans available',             'https://noty.ai/pricing'),
  ((SELECT id FROM tools WHERE slug='meetgeek'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.00, 'freemium',   95.00,  380.00, false, 'Free plan; Pro $19/seat/mo; Business $29/seat/mo',        'https://meetgeek.ai/pricing')
ON CONFLICT (tool_id, plan_name) DO NOTHING;

-- ============================================================
-- 5. Tool metadata
-- ============================================================

INSERT INTO tool_metadata (tool_id, categories, use_cases, target_personas, business_stages, api_available, self_hostable, enterprise_ready, input_types, output_types, integrations)
VALUES
  -- General LLMs
  ((SELECT id FROM tools WHERE slug='chatgpt'),
   ARRAY['general-llm','writing-content'], ARRAY['brainstorming','competitor-analysis','content-drafting','customer-research'],
   ARRAY['solopreneur','technical-founder','non-technical-founder','marketer'], ARRAY['validation','mvp','growth','scale'],
   true, false, true, ARRAY['text','image','audio','file'], ARRAY['text','image','code'], ARRAY['zapier','make','slack','notion']),

  ((SELECT id FROM tools WHERE slug='claude'),
   ARRAY['general-llm','coding-assistant'], ARRAY['architecture-decisions','strategy-docs','long-form-analysis','code-review'],
   ARRAY['technical-founder','developer','solopreneur'], ARRAY['validation','mvp','growth','scale'],
   true, false, true, ARRAY['text','file','image'], ARRAY['text','code','document'], ARRAY['slack','notion','cursor']),

  ((SELECT id FROM tools WHERE slug='perplexity-ai'),
   ARRAY['general-llm','research'], ARRAY['market-research','competitor-analysis','trend-research','fact-checking'],
   ARRAY['solopreneur','non-technical-founder','marketer'], ARRAY['validation','mvp','growth'],
   true, false, false, ARRAY['text'], ARRAY['text','citations'], ARRAY['zapier']),

  ((SELECT id FROM tools WHERE slug='google-gemini'),
   ARRAY['general-llm','productivity-automation'], ARRAY['data-analysis','document-processing','meeting-summaries','video-analysis'],
   ARRAY['enterprise','non-technical-founder','marketer'], ARRAY['growth','scale'],
   true, false, true, ARRAY['text','image','audio','video','file'], ARRAY['text','code','image'], ARRAY['google-docs','google-sheets','gmail','google-drive']),

  ((SELECT id FROM tools WHERE slug='grok'),
   ARRAY['general-llm','research'], ARRAY['real-time-market-research','competitor-sentiment','x-analytics','trend-spotting'],
   ARRAY['solopreneur','technical-founder','marketer'], ARRAY['validation','mvp','growth'],
   true, false, false, ARRAY['text'], ARRAY['text'], ARRAY['x-twitter']),

  ((SELECT id FROM tools WHERE slug='microsoft-copilot'),
   ARRAY['general-llm','productivity-automation'], ARRAY['report-generation','meeting-summaries','excel-analysis','presentation-creation'],
   ARRAY['enterprise'], ARRAY['scale'],
   true, false, true, ARRAY['text','file','image'], ARRAY['text','document'], ARRAY['microsoft-365','teams','outlook','sharepoint']),

  ((SELECT id FROM tools WHERE slug='poe'),
   ARRAY['general-llm'], ARRAY['model-comparison','rapid-prototyping','chatbot-testing'],
   ARRAY['developer','technical-founder','solopreneur'], ARRAY['validation','mvp'],
   false, false, false, ARRAY['text','image'], ARRAY['text','image','code'], ARRAY[]),

  ((SELECT id FROM tools WHERE slug='huggingchat'),
   ARRAY['general-llm','coding-assistant'], ARRAY['private-ai-inference','custom-fine-tuning','self-hosted-llm'],
   ARRAY['developer','technical-founder'], ARRAY['mvp','growth'],
   false, true, false, ARRAY['text'], ARRAY['text','code'], ARRAY[]),

  ((SELECT id FROM tools WHERE slug='deepseek-r1'),
   ARRAY['general-llm','coding-assistant'], ARRAY['bulk-research','code-generation','data-extraction','cost-efficient-inference'],
   ARRAY['developer','technical-founder','solopreneur'], ARRAY['mvp','growth'],
   true, false, false, ARRAY['text'], ARRAY['text','code'], ARRAY[]),

  ((SELECT id FROM tools WHERE slug='bing-chat'),
   ARRAY['general-llm'], ARRAY['quick-lookups','image-generation','free-web-search'],
   ARRAY['non-technical-founder','solopreneur'], ARRAY['validation','mvp'],
   false, false, false, ARRAY['text','image'], ARRAY['text','image'], ARRAY['microsoft-365']),

  ((SELECT id FROM tools WHERE slug='otio'),
   ARRAY['research'], ARRAY['research-summarization','paper-analysis','podcast-notes','competitor-research'],
   ARRAY['solopreneur','technical-founder'], ARRAY['validation','mvp','growth'],
   false, false, false, ARRAY['pdf','url','audio'], ARRAY['text','notes'], ARRAY[]),

  ((SELECT id FROM tools WHERE slug='notebooklm'),
   ARRAY['research','productivity-automation'], ARRAY['document-synthesis','audio-briefings','competitor-analysis','earnings-call-analysis'],
   ARRAY['non-technical-founder','solopreneur','marketer'], ARRAY['validation','mvp','growth'],
   false, false, false, ARRAY['pdf','text','url'], ARRAY['text','audio'], ARRAY['google-drive','google-docs']),

  -- Coding tools
  ((SELECT id FROM tools WHERE slug='cursor-ide'),
   ARRAY['coding-assistant','ai-coding'], ARRAY['full-feature-development','multi-file-editing','codebase-navigation','refactoring'],
   ARRAY['developer','technical-founder'], ARRAY['mvp','growth','scale'],
   false, false, false, ARRAY['code','text'], ARRAY['code'], ARRAY['github','gitlab','hosting-provider']),

  ((SELECT id FROM tools WHERE slug='claude-code'),
   ARRAY['coding-assistant','ai-coding'], ARRAY['agentic-coding','repo-management','terminal-automation','production-app-building'],
   ARRAY['developer','technical-founder'], ARRAY['mvp','growth'],
   true, false, false, ARRAY['code','text','repository'], ARRAY['code','files','terminal-output'], ARRAY['github','hosting-provider']),

  ((SELECT id FROM tools WHERE slug='github-copilot-pro'),
   ARRAY['coding-assistant','ai-coding'], ARRAY['code-completion','boilerplate-generation','test-writing'],
   ARRAY['developer','technical-founder'], ARRAY['mvp','growth','scale'],
   false, false, true, ARRAY['code'], ARRAY['code'], ARRAY['github','vscode','jetbrains']),

  ((SELECT id FROM tools WHERE slug='replit'),
   ARRAY['coding-assistant','website-builder'], ARRAY['mvp-building','app-deployment','non-coder-prototyping'],
   ARRAY['non-technical-founder','developer'], ARRAY['validation','mvp'],
   true, false, false, ARRAY['text','code'], ARRAY['app','code'], ARRAY['stripe','supabase','openai']),

  ((SELECT id FROM tools WHERE slug='lovable'),
   ARRAY['coding-assistant','website-builder'], ARRAY['full-stack-app-building','non-technical-mvp','react-app-generation'],
   ARRAY['non-technical-founder','solopreneur'], ARRAY['validation','mvp'],
   false, false, false, ARRAY['text'], ARRAY['app','code'], ARRAY['supabase','stripe','github']),

  ((SELECT id FROM tools WHERE slug='bolt-new'),
   ARRAY['coding-assistant','website-builder'], ARRAY['rapid-prototyping','multi-framework-apps','instant-deployment'],
   ARRAY['developer','non-technical-founder','solopreneur'], ARRAY['validation','mvp'],
   false, false, false, ARRAY['text','code'], ARRAY['app','code'], ARRAY['netlify','hosting-provider','github']),

  ((SELECT id FROM tools WHERE slug='v0'),
   ARRAY['coding-assistant','design-tools'], ARRAY['ui-component-generation','frontend-scaffolding','shadcn-ui-creation'],
   ARRAY['developer','technical-founder','designer'], ARRAY['mvp','growth'],
   true, false, false, ARRAY['text','image'], ARRAY['code','component'], ARRAY['hosting-provider','nextjs','github']),

  ((SELECT id FROM tools WHERE slug='n8n'),
   ARRAY['productivity-automation','coding-assistant'], ARRAY['internal-tool-building','workflow-automation','api-integration','agent-orchestration'],
   ARRAY['developer','technical-founder'], ARRAY['mvp','growth','scale'],
   true, true, true, ARRAY['webhook','api','database','file'], ARRAY['json','webhook','email','notification'], ARRAY['slack','hubspot','supabase','postgres','openai']),

  ((SELECT id FROM tools WHERE slug='continue-dev'),
   ARRAY['coding-assistant','ai-coding'], ARRAY['self-hosted-coding-assistant','private-code-completion','llm-agnostic-dev'],
   ARRAY['developer','technical-founder'], ARRAY['mvp','growth'],
   false, true, false, ARRAY['code'], ARRAY['code'], ARRAY['vscode','jetbrains','ollama']),

  -- Website builders
  ((SELECT id FROM tools WHERE slug='framer'),
   ARRAY['website-builder','design-tools'], ARRAY['landing-page-creation','marketing-site','interaction-design'],
   ARRAY['designer','non-technical-founder','marketer'], ARRAY['validation','mvp','growth'],
   false, false, false, ARRAY['text','design'], ARRAY['website'], ARRAY['mailchimp','google-analytics','zapier']),

  ((SELECT id FROM tools WHERE slug='webflow'),
   ARRAY['website-builder','design-tools'], ARRAY['professional-website','cms-site','ecommerce'],
   ARRAY['designer','non-technical-founder'], ARRAY['mvp','growth','scale'],
   true, false, true, ARRAY['design','text'], ARRAY['website'], ARRAY['zapier','mailchimp','google-analytics','stripe']),

  ((SELECT id FROM tools WHERE slug='bubble'),
   ARRAY['website-builder'], ARRAY['saas-without-code','marketplace-building','complex-web-app'],
   ARRAY['non-technical-founder','solopreneur'], ARRAY['mvp','growth'],
   true, false, false, ARRAY['design','logic'], ARRAY['app','website'], ARRAY['stripe','sendgrid','zapier','airtable']),

  -- Image generation
  ((SELECT id FROM tools WHERE slug='midjourney'),
   ARRAY['image-generation','design-tools'], ARRAY['product-mockups','ad-creative','brand-assets','concept-art'],
   ARRAY['designer','marketer','solopreneur'], ARRAY['mvp','growth','scale'],
   false, false, false, ARRAY['text','image'], ARRAY['image'], ARRAY['discord']),

  ((SELECT id FROM tools WHERE slug='leonardo-ai'),
   ARRAY['image-generation','design-tools'], ARRAY['consistent-style-images','ui-concepts','marketing-visuals'],
   ARRAY['designer','marketer'], ARRAY['mvp','growth'],
   true, false, false, ARRAY['text','image'], ARRAY['image'], ARRAY['zapier']),

  ((SELECT id FROM tools WHERE slug='canva-magic-studio'),
   ARRAY['design-tools','image-generation'], ARRAY['social-media-graphics','presentation','brand-kit','marketing-materials'],
   ARRAY['non-technical-founder','marketer','solopreneur'], ARRAY['validation','mvp','growth','scale'],
   false, false, true, ARRAY['text','image','template'], ARRAY['image','pdf','video'], ARRAY['slack','hubspot','mailchimp','google-drive']),

  -- Video & Audio
  ((SELECT id FROM tools WHERE slug='heygen'),
   ARRAY['video-generation','marketing-social'], ARRAY['personalized-video-demos','onboarding-videos','ad-creation'],
   ARRAY['marketer','solopreneur','non-technical-founder'], ARRAY['mvp','growth','scale'],
   true, false, false, ARRAY['text','image','voice'], ARRAY['video'], ARRAY['zapier','hubspot']),

  ((SELECT id FROM tools WHERE slug='elevenlabs'),
   ARRAY['audio-generation','video-generation'], ARRAY['voice-cloning','explainer-video-narration','multilingual-content','podcast'],
   ARRAY['marketer','solopreneur','developer'], ARRAY['mvp','growth','scale'],
   true, false, true, ARRAY['text','audio'], ARRAY['audio','voice'], ARRAY['zapier','make','unity']),

  ((SELECT id FROM tools WHERE slug='runway-ml'),
   ARRAY['video-generation'], ARRAY['product-demo-video','social-clips','text-to-video'],
   ARRAY['marketer','designer'], ARRAY['mvp','growth'],
   true, false, false, ARRAY['text','image','video'], ARRAY['video'], ARRAY[]),

  ((SELECT id FROM tools WHERE slug='opus-clip'),
   ARRAY['video-generation','marketing-social'], ARRAY['long-video-to-shorts','social-media-clips','content-repurposing'],
   ARRAY['marketer','solopreneur'], ARRAY['growth','scale'],
   false, false, false, ARRAY['video','url'], ARRAY['video'], ARRAY['youtube','tiktok','instagram']),

  ((SELECT id FROM tools WHERE slug='descript'),
   ARRAY['video-generation','audio-generation'], ARRAY['podcast-editing','video-editing','voice-cloning','transcription'],
   ARRAY['marketer','solopreneur','designer'], ARRAY['mvp','growth'],
   false, false, false, ARRAY['audio','video'], ARRAY['audio','video','text'], ARRAY['youtube','google-drive','dropbox']),

  -- Writing & Content
  ((SELECT id FROM tools WHERE slug='jasper-ai'),
   ARRAY['writing-content','marketing-social'], ARRAY['blog-writing','ad-copy','email-campaigns','brand-voice'],
   ARRAY['marketer','enterprise'], ARRAY['growth','scale'],
   true, false, true, ARRAY['text','brief'], ARRAY['text','document'], ARRAY['hubspot','shopify','google-docs','surfer-seo']),

  ((SELECT id FROM tools WHERE slug='grammarly'),
   ARRAY['writing-content'], ARRAY['business-writing','tone-adjustment','grammar-checking','email-polishing'],
   ARRAY['non-technical-founder','marketer','enterprise','solopreneur'], ARRAY['validation','mvp','growth','scale'],
   true, false, true, ARRAY['text'], ARRAY['text'], ARRAY['google-docs','microsoft-word','gmail','slack']),

  ((SELECT id FROM tools WHERE slug='copy-ai'),
   ARRAY['writing-content','marketing-social'], ARRAY['sales-copy','gtm-workflows','product-descriptions','cold-emails'],
   ARRAY['marketer','solopreneur'], ARRAY['validation','mvp','growth'],
   true, false, false, ARRAY['text','brief'], ARRAY['text'], ARRAY['hubspot','zapier','salesforce']),

  ((SELECT id FROM tools WHERE slug='surfer-seo'),
   ARRAY['writing-content','marketing-social'], ARRAY['seo-content-optimization','keyword-research','article-writing'],
   ARRAY['marketer'], ARRAY['growth','scale'],
   false, false, false, ARRAY['text','url'], ARRAY['text','report'], ARRAY['google-docs','semrush','wordpress']),

  ((SELECT id FROM tools WHERE slug='adcreative-ai'),
   ARRAY['marketing-social','image-generation'], ARRAY['ad-creative-generation','performance-prediction','a-b-testing'],
   ARRAY['marketer'], ARRAY['growth','scale'],
   true, false, false, ARRAY['text','image','brand-kit'], ARRAY['image','video'], ARRAY['facebook-ads','google-ads','zapier']),

  -- Productivity & Automation
  ((SELECT id FROM tools WHERE slug='notion-ai'),
   ARRAY['productivity-automation'], ARRAY['knowledge-base','project-management','ai-writing','company-wiki'],
   ARRAY['solopreneur','non-technical-founder','technical-founder'], ARRAY['validation','mvp','growth','scale'],
   true, false, true, ARRAY['text','file'], ARRAY['text','document','database'], ARRAY['slack','github','jira','zapier','google-drive']),

  ((SELECT id FROM tools WHERE slug='zapier'),
   ARRAY['productivity-automation'], ARRAY['app-integration','workflow-automation','trigger-actions'],
   ARRAY['non-technical-founder','solopreneur','marketer'], ARRAY['mvp','growth','scale'],
   true, false, true, ARRAY['webhook','form','trigger'], ARRAY['action','notification','record'], ARRAY['hubspot','slack','gmail','airtable','notion','stripe']),

  ((SELECT id FROM tools WHERE slug='make'),
   ARRAY['productivity-automation'], ARRAY['complex-workflows','multi-step-automation','api-orchestration'],
   ARRAY['developer','technical-founder'], ARRAY['mvp','growth','scale'],
   true, false, true, ARRAY['webhook','api','file'], ARRAY['json','notification','file'], ARRAY['slack','hubspot','airtable','notion','openai','supabase']),

  ((SELECT id FROM tools WHERE slug='voiceflow'),
   ARRAY['productivity-automation','customer-support'], ARRAY['chatbot-building','voice-agent','product-assistant'],
   ARRAY['developer','technical-founder','enterprise'], ARRAY['mvp','growth','scale'],
   true, false, true, ARRAY['text','voice','flow-design'], ARRAY['chatbot','voice-agent','api'], ARRAY['zendesk','salesforce','twilio','zapier']),

  ((SELECT id FROM tools WHERE slug='botpress'),
   ARRAY['productivity-automation','customer-support'], ARRAY['open-source-chatbot','self-hosted-agent','customer-support-bot'],
   ARRAY['developer','technical-founder'], ARRAY['mvp','growth'],
   true, true, false, ARRAY['text','flow-design'], ARRAY['chatbot','api'], ARRAY['slack','facebook-messenger','whatsapp','twilio']),

  -- Marketing & Sales
  ((SELECT id FROM tools WHERE slug='hubspot-ai'),
   ARRAY['marketing-social','sales-enrichment'], ARRAY['crm','email-marketing','sales-sequences','content-management'],
   ARRAY['non-technical-founder','marketer','enterprise'], ARRAY['mvp','growth','scale'],
   true, false, true, ARRAY['contact','email','form'], ARRAY['crm-record','email','report'], ARRAY['salesforce','slack','zapier','shopify','wordpress']),

  ((SELECT id FROM tools WHERE slug='typefully'),
   ARRAY['marketing-social'], ARRAY['x-thread-writing','social-scheduling','audience-growth'],
   ARRAY['solopreneur','technical-founder','marketer'], ARRAY['validation','mvp','growth'],
   false, false, false, ARRAY['text'], ARRAY['post','thread'], ARRAY['x-twitter','linkedin']),

  ((SELECT id FROM tools WHERE slug='buffer-ai'),
   ARRAY['marketing-social'], ARRAY['social-scheduling','content-calendar','multi-platform-posting'],
   ARRAY['solopreneur','marketer','non-technical-founder'], ARRAY['validation','mvp','growth'],
   true, false, false, ARRAY['text','image','video'], ARRAY['post','report'], ARRAY['instagram','tiktok','linkedin','x-twitter','facebook','youtube']),

  ((SELECT id FROM tools WHERE slug='hootsuite-ai'),
   ARRAY['marketing-social'], ARRAY['enterprise-social-management','team-publishing','social-analytics'],
   ARRAY['enterprise','marketer'], ARRAY['scale'],
   true, false, true, ARRAY['text','image','video'], ARRAY['post','report'], ARRAY['instagram','tiktok','linkedin','x-twitter','facebook','youtube']),

  ((SELECT id FROM tools WHERE slug='outreach'),
   ARRAY['marketing-social','sales-enrichment'], ARRAY['sales-sequences','revenue-intelligence','pipeline-management'],
   ARRAY['enterprise'], ARRAY['scale'],
   true, false, true, ARRAY['contact','email','crm-data'], ARRAY['sequence','report'], ARRAY['salesforce','hubspot','linkedin','gmail']),

  -- Meetings & Transcription
  ((SELECT id FROM tools WHERE slug='fireflies-ai'),
   ARRAY['meetings-transcription'], ARRAY['meeting-transcription','action-item-extraction','meeting-search'],
   ARRAY['solopreneur','non-technical-founder','enterprise'], ARRAY['mvp','growth','scale'],
   true, false, true, ARRAY['audio','video','calendar'], ARRAY['transcript','notes','search'], ARRAY['zoom','google-meet','teams','hubspot','slack','notion']),

  ((SELECT id FROM tools WHERE slug='otter-ai'),
   ARRAY['meetings-transcription'], ARRAY['real-time-transcription','meeting-notes','team-collaboration'],
   ARRAY['solopreneur','non-technical-founder','enterprise'], ARRAY['mvp','growth','scale'],
   true, false, true, ARRAY['audio','calendar'], ARRAY['transcript','notes'], ARRAY['zoom','google-meet','teams','slack']),

  ((SELECT id FROM tools WHERE slug='tldv'),
   ARRAY['meetings-transcription'], ARRAY['meeting-highlights','async-sharing','customer-call-clips'],
   ARRAY['solopreneur','non-technical-founder'], ARRAY['validation','mvp','growth'],
   true, false, false, ARRAY['video','calendar'], ARRAY['video-clip','transcript','summary'], ARRAY['zoom','google-meet','notion','slack','hubspot']),

  ((SELECT id FROM tools WHERE slug='krisp'),
   ARRAY['meetings-transcription'], ARRAY['noise-cancellation','meeting-notes','call-quality'],
   ARRAY['solopreneur','enterprise'], ARRAY['mvp','growth','scale'],
   false, false, true, ARRAY['audio'], ARRAY['audio','notes'], ARRAY['zoom','teams','slack','any-voip']),

  ((SELECT id FROM tools WHERE slug='meetgeek'),
   ARRAY['meetings-transcription'], ARRAY['meeting-intelligence','highlight-sharing','team-insights'],
   ARRAY['non-technical-founder','enterprise'], ARRAY['mvp','growth','scale'],
   true, false, false, ARRAY['audio','calendar'], ARRAY['transcript','highlights','report'], ARRAY['zoom','google-meet','teams','hubspot','slack'])

ON CONFLICT (tool_id) DO NOTHING;

-- ============================================================
-- 6. Tool links (website + docs + pricing per tool)
-- ============================================================

INSERT INTO tool_links (tool_id, link_type, url, is_primary)
VALUES
  -- ChatGPT
  ((SELECT id FROM tools WHERE slug='chatgpt'), 'website', 'https://chatgpt.com', true),
  ((SELECT id FROM tools WHERE slug='chatgpt'), 'pricing', 'https://openai.com/chatgpt/pricing', false),
  ((SELECT id FROM tools WHERE slug='chatgpt'), 'docs',    'https://platform.openai.com/docs', false),
  -- Claude
  ((SELECT id FROM tools WHERE slug='claude'), 'website', 'https://claude.ai', true),
  ((SELECT id FROM tools WHERE slug='claude'), 'pricing', 'https://anthropic.com/pricing', false),
  ((SELECT id FROM tools WHERE slug='claude'), 'docs',    'https://docs.anthropic.com', false),
  -- Perplexity AI
  ((SELECT id FROM tools WHERE slug='perplexity-ai'), 'website', 'https://perplexity.ai', true),
  ((SELECT id FROM tools WHERE slug='perplexity-ai'), 'docs',    'https://docs.perplexity.ai', false),
  -- Google Gemini
  ((SELECT id FROM tools WHERE slug='google-gemini'), 'website', 'https://gemini.google.com', true),
  ((SELECT id FROM tools WHERE slug='google-gemini'), 'docs',    'https://ai.google.dev/docs', false),
  -- Grok
  ((SELECT id FROM tools WHERE slug='grok'), 'website', 'https://grok.x.ai', true),
  -- Microsoft Copilot
  ((SELECT id FROM tools WHERE slug='microsoft-copilot'), 'website', 'https://copilot.microsoft.com', true),
  ((SELECT id FROM tools WHERE slug='microsoft-copilot'), 'docs',    'https://learn.microsoft.com/en-us/copilot', false),
  -- Poe
  ((SELECT id FROM tools WHERE slug='poe'), 'website', 'https://poe.com', true),
  -- HuggingChat
  ((SELECT id FROM tools WHERE slug='huggingchat'), 'website', 'https://huggingface.co/chat', true),
  ((SELECT id FROM tools WHERE slug='huggingchat'), 'github',  'https://github.com/huggingface/chat-ui', false),
  -- DeepSeek R1
  ((SELECT id FROM tools WHERE slug='deepseek-r1'), 'website', 'https://deepseek.com', true),
  ((SELECT id FROM tools WHERE slug='deepseek-r1'), 'docs',    'https://api-docs.deepseek.com', false),
  -- Bing Chat
  ((SELECT id FROM tools WHERE slug='bing-chat'), 'website', 'https://bing.com/chat', true),
  -- Otio
  ((SELECT id FROM tools WHERE slug='otio'), 'website', 'https://otio.com', true),
  -- Silatus
  ((SELECT id FROM tools WHERE slug='silatus'), 'website', 'https://silatus.com', true),
  -- Flowith
  ((SELECT id FROM tools WHERE slug='flowith'), 'website', 'https://flowith.io', true),
  -- NotebookLM
  ((SELECT id FROM tools WHERE slug='notebooklm'), 'website', 'https://notebooklm.google.com', true),
  -- Perplexity Computer
  ((SELECT id FROM tools WHERE slug='perplexity-computer'), 'website', 'https://perplexity.ai/computer', true),
  -- Cursor IDE
  ((SELECT id FROM tools WHERE slug='cursor-ide'), 'website', 'https://cursor.com', true),
  ((SELECT id FROM tools WHERE slug='cursor-ide'), 'docs',    'https://docs.cursor.com', false),
  ((SELECT id FROM tools WHERE slug='cursor-ide'), 'pricing', 'https://cursor.com/pricing', false),
  -- Claude Code
  ((SELECT id FROM tools WHERE slug='claude-code'), 'website', 'https://claude.ai/code', true),
  ((SELECT id FROM tools WHERE slug='claude-code'), 'docs',    'https://docs.anthropic.com/claude-code', false),
  -- GitHub Copilot Pro
  ((SELECT id FROM tools WHERE slug='github-copilot-pro'), 'website', 'https://github.com/features/copilot', true),
  ((SELECT id FROM tools WHERE slug='github-copilot-pro'), 'docs',    'https://docs.github.com/en/copilot', false),
  -- Replit
  ((SELECT id FROM tools WHERE slug='replit'), 'website', 'https://replit.com', true),
  ((SELECT id FROM tools WHERE slug='replit'), 'docs',    'https://docs.replit.com', false),
  -- Windsurf
  ((SELECT id FROM tools WHERE slug='windsurf'), 'website', 'https://codeium.com/windsurf', true),
  ((SELECT id FROM tools WHERE slug='windsurf'), 'docs',    'https://docs.codeium.com/windsurf', false),
  -- v0
  ((SELECT id FROM tools WHERE slug='v0'), 'website', 'https://v0.dev', true),
  ((SELECT id FROM tools WHERE slug='v0'), 'docs',    'https://v0.dev/docs', false),
  -- Lovable
  ((SELECT id FROM tools WHERE slug='lovable'), 'website', 'https://lovable.dev', true),
  ((SELECT id FROM tools WHERE slug='lovable'), 'docs',    'https://docs.lovable.dev', false),
  -- Bolt.new
  ((SELECT id FROM tools WHERE slug='bolt-new'), 'website', 'https://bolt.new', true),
  -- n8n
  ((SELECT id FROM tools WHERE slug='n8n'), 'website', 'https://n8n.io', true),
  ((SELECT id FROM tools WHERE slug='n8n'), 'docs',    'https://docs.n8n.io', false),
  ((SELECT id FROM tools WHERE slug='n8n'), 'github',  'https://github.com/n8n-io/n8n', false),
  ((SELECT id FROM tools WHERE slug='n8n'), 'pricing', 'https://n8n.io/pricing', false),
  -- Continue.dev
  ((SELECT id FROM tools WHERE slug='continue-dev'), 'website', 'https://continue.dev', true),
  ((SELECT id FROM tools WHERE slug='continue-dev'), 'docs',    'https://docs.continue.dev', false),
  ((SELECT id FROM tools WHERE slug='continue-dev'), 'github',  'https://github.com/continuedev/continue', false),
  -- Factory
  ((SELECT id FROM tools WHERE slug='factory'), 'website', 'https://factory.ai', true),
  -- Codex
  ((SELECT id FROM tools WHERE slug='codex'), 'website', 'https://platform.openai.com/codex', true),
  ((SELECT id FROM tools WHERE slug='codex'), 'docs',    'https://platform.openai.com/docs', false),
  -- Qodo
  ((SELECT id FROM tools WHERE slug='qodo'), 'website', 'https://qodo.ai', true),
  ((SELECT id FROM tools WHERE slug='qodo'), 'docs',    'https://docs.qodo.ai', false),
  -- Botpress
  ((SELECT id FROM tools WHERE slug='botpress'), 'website', 'https://botpress.com', true),
  ((SELECT id FROM tools WHERE slug='botpress'), 'docs',    'https://botpress.com/docs', false),
  ((SELECT id FROM tools WHERE slug='botpress'), 'github',  'https://github.com/botpress/botpress', false),
  -- Flux
  ((SELECT id FROM tools WHERE slug='flux'), 'website', 'https://blackforestlabs.ai', true),
  ((SELECT id FROM tools WHERE slug='flux'), 'github',  'https://github.com/black-forest-labs/flux', false),
  -- Midjourney
  ((SELECT id FROM tools WHERE slug='midjourney'), 'website', 'https://midjourney.com', true),
  ((SELECT id FROM tools WHERE slug='midjourney'), 'docs',    'https://docs.midjourney.com', false),
  -- ElevenLabs
  ((SELECT id FROM tools WHERE slug='elevenlabs'), 'website', 'https://elevenlabs.io', true),
  ((SELECT id FROM tools WHERE slug='elevenlabs'), 'docs',    'https://elevenlabs.io/docs', false),
  ((SELECT id FROM tools WHERE slug='elevenlabs'), 'pricing', 'https://elevenlabs.io/pricing', false),
  -- HeyGen
  ((SELECT id FROM tools WHERE slug='heygen'), 'website', 'https://heygen.com', true),
  ((SELECT id FROM tools WHERE slug='heygen'), 'docs',    'https://docs.heygen.com', false),
  -- Runway ML
  ((SELECT id FROM tools WHERE slug='runway-ml'), 'website', 'https://runwayml.com', true),
  ((SELECT id FROM tools WHERE slug='runway-ml'), 'docs',    'https://docs.runwayml.com', false),
  -- Zapier
  ((SELECT id FROM tools WHERE slug='zapier'), 'website', 'https://zapier.com', true),
  ((SELECT id FROM tools WHERE slug='zapier'), 'docs',    'https://platform.zapier.com/docs', false),
  ((SELECT id FROM tools WHERE slug='zapier'), 'pricing', 'https://zapier.com/pricing', false),
  -- Make
  ((SELECT id FROM tools WHERE slug='make'), 'website', 'https://make.com', true),
  ((SELECT id FROM tools WHERE slug='make'), 'docs',    'https://www.make.com/en/help', false),
  ((SELECT id FROM tools WHERE slug='make'), 'pricing', 'https://make.com/en/pricing', false),
  -- Notion AI
  ((SELECT id FROM tools WHERE slug='notion-ai'), 'website', 'https://notion.so', true),
  ((SELECT id FROM tools WHERE slug='notion-ai'), 'docs',    'https://www.notion.so/help', false),
  ((SELECT id FROM tools WHERE slug='notion-ai'), 'pricing', 'https://notion.so/pricing', false),
  -- HubSpot AI
  ((SELECT id FROM tools WHERE slug='hubspot-ai'), 'website', 'https://hubspot.com', true),
  ((SELECT id FROM tools WHERE slug='hubspot-ai'), 'docs',    'https://developers.hubspot.com/docs', false),
  ((SELECT id FROM tools WHERE slug='hubspot-ai'), 'pricing', 'https://hubspot.com/pricing', false),
  -- Fireflies AI
  ((SELECT id FROM tools WHERE slug='fireflies-ai'), 'website', 'https://fireflies.ai', true),
  ((SELECT id FROM tools WHERE slug='fireflies-ai'), 'docs',    'https://docs.fireflies.ai', false),
  ((SELECT id FROM tools WHERE slug='fireflies-ai'), 'pricing', 'https://fireflies.ai/pricing', false),
  -- Otter AI
  ((SELECT id FROM tools WHERE slug='otter-ai'), 'website', 'https://otter.ai', true),
  ((SELECT id FROM tools WHERE slug='otter-ai'), 'pricing', 'https://otter.ai/pricing', false),
  -- Jasper AI
  ((SELECT id FROM tools WHERE slug='jasper-ai'), 'website', 'https://jasper.ai', true),
  ((SELECT id FROM tools WHERE slug='jasper-ai'), 'docs',    'https://support.jasper.ai', false),
  ((SELECT id FROM tools WHERE slug='jasper-ai'), 'pricing', 'https://jasper.ai/pricing', false),
  -- Grammarly
  ((SELECT id FROM tools WHERE slug='grammarly'), 'website', 'https://grammarly.com', true),
  ((SELECT id FROM tools WHERE slug='grammarly'), 'pricing', 'https://grammarly.com/plans', false),
  -- Voiceflow
  ((SELECT id FROM tools WHERE slug='voiceflow'), 'website', 'https://voiceflow.com', true),
  ((SELECT id FROM tools WHERE slug='voiceflow'), 'docs',    'https://docs.voiceflow.com', false),
  ((SELECT id FROM tools WHERE slug='voiceflow'), 'pricing', 'https://voiceflow.com/pricing', false),
  -- Framer
  ((SELECT id FROM tools WHERE slug='framer'), 'website', 'https://framer.com', true),
  ((SELECT id FROM tools WHERE slug='framer'), 'docs',    'https://framer.com/learn', false),
  ((SELECT id FROM tools WHERE slug='framer'), 'pricing', 'https://framer.com/pricing', false),
  -- Webflow
  ((SELECT id FROM tools WHERE slug='webflow'), 'website', 'https://webflow.com', true),
  ((SELECT id FROM tools WHERE slug='webflow'), 'docs',    'https://university.webflow.com', false),
  ((SELECT id FROM tools WHERE slug='webflow'), 'pricing', 'https://webflow.com/pricing', false),
  -- Canva Magic Studio
  ((SELECT id FROM tools WHERE slug='canva-magic-studio'), 'website', 'https://canva.com', true),
  ((SELECT id FROM tools WHERE slug='canva-magic-studio'), 'pricing', 'https://canva.com/pricing', false),
  -- Buffer AI
  ((SELECT id FROM tools WHERE slug='buffer-ai'), 'website', 'https://buffer.com', true),
  ((SELECT id FROM tools WHERE slug='buffer-ai'), 'pricing', 'https://buffer.com/pricing', false),
  -- Hootsuite AI
  ((SELECT id FROM tools WHERE slug='hootsuite-ai'), 'website', 'https://hootsuite.com', true),
  ((SELECT id FROM tools WHERE slug='hootsuite-ai'), 'pricing', 'https://hootsuite.com/plans', false),
  -- tl;dv
  ((SELECT id FROM tools WHERE slug='tldv'), 'website', 'https://tldv.io', true),
  ((SELECT id FROM tools WHERE slug='tldv'), 'pricing', 'https://tldv.io/pricing', false),
  -- Surfer SEO
  ((SELECT id FROM tools WHERE slug='surfer-seo'), 'website', 'https://surferseo.com', true),
  ((SELECT id FROM tools WHERE slug='surfer-seo'), 'pricing', 'https://surferseo.com/pricing', false),
  -- Descript
  ((SELECT id FROM tools WHERE slug='descript'), 'website', 'https://descript.com', true),
  ((SELECT id FROM tools WHERE slug='descript'), 'pricing', 'https://descript.com/pricing', false),
  -- Synthesia
  ((SELECT id FROM tools WHERE slug='synthesia'), 'website', 'https://synthesia.io', true),
  ((SELECT id FROM tools WHERE slug='synthesia'), 'docs',    'https://docs.synthesia.io', false),
  ((SELECT id FROM tools WHERE slug='synthesia'), 'pricing', 'https://synthesia.io/pricing', false),
  -- Stack AI
  ((SELECT id FROM tools WHERE slug='stack-ai'), 'website', 'https://stack-ai.com', true),
  ((SELECT id FROM tools WHERE slug='stack-ai'), 'docs',    'https://docs.stack-ai.com', false),
  -- Avoma
  ((SELECT id FROM tools WHERE slug='avoma'), 'website', 'https://avoma.com', true),
  ((SELECT id FROM tools WHERE slug='avoma'), 'pricing', 'https://avoma.com/pricing', false),
  -- MeetGeek
  ((SELECT id FROM tools WHERE slug='meetgeek'), 'website', 'https://meetgeek.ai', true),
  ((SELECT id FROM tools WHERE slug='meetgeek'), 'pricing', 'https://meetgeek.ai/pricing', false),
  -- Taplio
  ((SELECT id FROM tools WHERE slug='taplio'), 'website', 'https://taplio.com', true),
  ((SELECT id FROM tools WHERE slug='taplio'), 'pricing', 'https://taplio.com/pricing', false),
  -- Bubble
  ((SELECT id FROM tools WHERE slug='bubble'), 'website', 'https://bubble.io', true),
  ((SELECT id FROM tools WHERE slug='bubble'), 'docs',    'https://manual.bubble.io', false),
  ((SELECT id FROM tools WHERE slug='bubble'), 'pricing', 'https://bubble.io/pricing', false),
  -- Outreach
  ((SELECT id FROM tools WHERE slug='outreach'), 'website', 'https://outreach.io', true),
  ((SELECT id FROM tools WHERE slug='outreach'), 'docs',    'https://support.outreach.io', false),
  -- Copy AI
  ((SELECT id FROM tools WHERE slug='copy-ai'), 'website', 'https://copy.ai', true),
  ((SELECT id FROM tools WHERE slug='copy-ai'), 'pricing', 'https://copy.ai/pricing', false),
  -- AdCreative AI
  ((SELECT id FROM tools WHERE slug='adcreative-ai'), 'website', 'https://adcreative.ai', true),
  ((SELECT id FROM tools WHERE slug='adcreative-ai'), 'pricing', 'https://adcreative.ai/pricing', false),
  -- Pencil
  ((SELECT id FROM tools WHERE slug='pencil'), 'website', 'https://trypencil.com', true),
  ((SELECT id FROM tools WHERE slug='pencil'), 'pricing', 'https://trypencil.com/pricing', false)
ON CONFLICT (tool_id, url) DO NOTHING;

-- ============================================================
-- 7. Tool categories (1–2 categories per tool)
-- ============================================================

INSERT INTO tool_categories (tool_id, category_id, confidence, source, is_primary)
VALUES
  -- General LLMs
  ((SELECT id FROM tools WHERE slug='chatgpt'),          (SELECT id FROM categories WHERE slug='general-llm'),            1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='chatgpt'),          (SELECT id FROM categories WHERE slug='writing-content'),         0.7000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='claude'),           (SELECT id FROM categories WHERE slug='general-llm'),            1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='claude'),           (SELECT id FROM categories WHERE slug='coding-assistant'),        0.7500, 'manual', false),
  ((SELECT id FROM tools WHERE slug='perplexity-ai'),    (SELECT id FROM categories WHERE slug='general-llm'),            1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='perplexity-ai'),    (SELECT id FROM categories WHERE slug='research'),               0.9000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='google-gemini'),    (SELECT id FROM categories WHERE slug='general-llm'),            1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='google-gemini'),    (SELECT id FROM categories WHERE slug='productivity-automation'), 0.6000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='grok'),             (SELECT id FROM categories WHERE slug='general-llm'),            1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='grok'),             (SELECT id FROM categories WHERE slug='research'),               0.6500, 'manual', false),
  ((SELECT id FROM tools WHERE slug='microsoft-copilot'),(SELECT id FROM categories WHERE slug='general-llm'),            1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='microsoft-copilot'),(SELECT id FROM categories WHERE slug='productivity-automation'), 0.8000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='poe'),              (SELECT id FROM categories WHERE slug='general-llm'),            1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='huggingchat'),      (SELECT id FROM categories WHERE slug='general-llm'),            1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='deepseek-r1'),      (SELECT id FROM categories WHERE slug='general-llm'),            1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='deepseek-r1'),      (SELECT id FROM categories WHERE slug='coding-assistant'),        0.6500, 'manual', false),
  ((SELECT id FROM tools WHERE slug='bing-chat'),        (SELECT id FROM categories WHERE slug='general-llm'),            1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='otio'),             (SELECT id FROM categories WHERE slug='research'),               1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='silatus'),          (SELECT id FROM categories WHERE slug='research'),               1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='flowith'),          (SELECT id FROM categories WHERE slug='research'),               1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='notebooklm'),       (SELECT id FROM categories WHERE slug='research'),               1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='notebooklm'),       (SELECT id FROM categories WHERE slug='productivity-automation'), 0.6000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='perplexity-computer'),(SELECT id FROM categories WHERE slug='research'),             1.0000, 'manual', true),
  -- Coding & Dev
  ((SELECT id FROM tools WHERE slug='cursor-ide'),       (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='claude-code'),      (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='github-copilot-pro'),(SELECT id FROM categories WHERE slug='coding-assistant'),      1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='replit'),           (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='replit'),           (SELECT id FROM categories WHERE slug='website-builder'),        0.6000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='windsurf'),         (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='v0'),               (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='v0'),               (SELECT id FROM categories WHERE slug='design-tools'),           0.7000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='lovable'),          (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='lovable'),          (SELECT id FROM categories WHERE slug='website-builder'),        0.8000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='bolt-new'),         (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='bolt-new'),         (SELECT id FROM categories WHERE slug='website-builder'),        0.7500, 'manual', false),
  ((SELECT id FROM tools WHERE slug='factory'),          (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='codex'),            (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='spawn-co'),         (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='codeium'),          (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='continue-dev'),     (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='qodo'),             (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='base44'),           (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='emergent'),         (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='manus'),            (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='n8n'),              (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='n8n'),              (SELECT id FROM categories WHERE slug='coding-assistant'),       0.6000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='nebula'),           (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='testim'),           (SELECT id FROM categories WHERE slug='coding-assistant'),       1.0000, 'manual', true),
  -- Website builders
  ((SELECT id FROM tools WHERE slug='dora'),             (SELECT id FROM categories WHERE slug='website-builder'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='10web'),            (SELECT id FROM categories WHERE slug='website-builder'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='framer'),           (SELECT id FROM categories WHERE slug='website-builder'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='framer'),           (SELECT id FROM categories WHERE slug='design-tools'),           0.7000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='durable'),          (SELECT id FROM categories WHERE slug='website-builder'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='wegic'),            (SELECT id FROM categories WHERE slug='website-builder'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='glide'),            (SELECT id FROM categories WHERE slug='website-builder'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='adalo'),            (SELECT id FROM categories WHERE slug='website-builder'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='bubble'),           (SELECT id FROM categories WHERE slug='website-builder'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='softr'),            (SELECT id FROM categories WHERE slug='website-builder'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='webflow'),          (SELECT id FROM categories WHERE slug='website-builder'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='webflow'),          (SELECT id FROM categories WHERE slug='design-tools'),           0.6500, 'manual', false),
  ((SELECT id FROM tools WHERE slug='design-com'),       (SELECT id FROM categories WHERE slug='website-builder'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='design-com'),       (SELECT id FROM categories WHERE slug='design-tools'),           0.7000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='super-ai'),         (SELECT id FROM categories WHERE slug='website-builder'),        1.0000, 'manual', true),
  -- Image generation
  ((SELECT id FROM tools WHERE slug='midjourney'),       (SELECT id FROM categories WHERE slug='image-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='leonardo-ai'),      (SELECT id FROM categories WHERE slug='image-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='flux'),             (SELECT id FROM categories WHERE slug='image-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='recraft'),          (SELECT id FROM categories WHERE slug='image-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='recraft'),          (SELECT id FROM categories WHERE slug='design-tools'),           0.7000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='adobe-firefly'),    (SELECT id FROM categories WHERE slug='image-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='adobe-firefly'),    (SELECT id FROM categories WHERE slug='design-tools'),           0.7500, 'manual', false),
  ((SELECT id FROM tools WHERE slug='canva-magic-studio'),(SELECT id FROM categories WHERE slug='design-tools'),          1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='canva-magic-studio'),(SELECT id FROM categories WHERE slug='image-generation'),      0.7000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='freepik-ai'),       (SELECT id FROM categories WHERE slug='image-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='stylar'),           (SELECT id FROM categories WHERE slug='image-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='clipdrop'),         (SELECT id FROM categories WHERE slug='image-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='looka'),            (SELECT id FROM categories WHERE slug='design-tools'),           1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='namelix'),          (SELECT id FROM categories WHERE slug='design-tools'),           1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='brandmark'),        (SELECT id FROM categories WHERE slug='design-tools'),           1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='stockimg-ai'),      (SELECT id FROM categories WHERE slug='image-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='galileo-ai'),       (SELECT id FROM categories WHERE slug='design-tools'),           1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='galileo-ai'),       (SELECT id FROM categories WHERE slug='image-generation'),       0.6000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='bing-create'),      (SELECT id FROM categories WHERE slug='image-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='autodraw'),         (SELECT id FROM categories WHERE slug='design-tools'),           1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='designs-ai'),       (SELECT id FROM categories WHERE slug='design-tools'),           1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='vance-ai'),         (SELECT id FROM categories WHERE slug='image-generation'),       1.0000, 'manual', true),
  -- Video & Audio
  ((SELECT id FROM tools WHERE slug='heygen'),           (SELECT id FROM categories WHERE slug='video-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='heygen'),           (SELECT id FROM categories WHERE slug='marketing-social'),       0.6500, 'manual', false),
  ((SELECT id FROM tools WHERE slug='elevenlabs'),       (SELECT id FROM categories WHERE slug='audio-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='elevenlabs'),       (SELECT id FROM categories WHERE slug='video-generation'),       0.5000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='runway-ml'),        (SELECT id FROM categories WHERE slug='video-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='kling-ai'),         (SELECT id FROM categories WHERE slug='video-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='luma-dream-machine'),(SELECT id FROM categories WHERE slug='video-generation'),      1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='sora'),             (SELECT id FROM categories WHERE slug='video-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='veo-2'),            (SELECT id FROM categories WHERE slug='video-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='pika'),             (SELECT id FROM categories WHERE slug='video-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='pictory'),          (SELECT id FROM categories WHERE slug='video-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='synthesia'),        (SELECT id FROM categories WHERE slug='video-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='invideo'),          (SELECT id FROM categories WHERE slug='video-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='opus-clip'),        (SELECT id FROM categories WHERE slug='video-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='opus-clip'),        (SELECT id FROM categories WHERE slug='marketing-social'),       0.7000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='descript'),         (SELECT id FROM categories WHERE slug='video-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='descript'),         (SELECT id FROM categories WHERE slug='audio-generation'),       0.8000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='lovo-ai'),          (SELECT id FROM categories WHERE slug='audio-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='adobe-podcast'),    (SELECT id FROM categories WHERE slug='audio-generation'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='capcut-ai'),        (SELECT id FROM categories WHERE slug='video-generation'),       1.0000, 'manual', true),
  -- Writing & Content
  ((SELECT id FROM tools WHERE slug='jasper-ai'),        (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='jasper-ai'),        (SELECT id FROM categories WHERE slug='marketing-social'),       0.7000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='writesonic'),       (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='copy-ai'),          (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='copy-ai'),          (SELECT id FROM categories WHERE slug='marketing-social'),       0.6500, 'manual', false),
  ((SELECT id FROM tools WHERE slug='rytr'),             (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='textblaze'),        (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='hix-ai'),           (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='jenny-ai'),         (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='quillbot'),         (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='grammarly'),        (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='surfer-seo'),       (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='surfer-seo'),       (SELECT id FROM categories WHERE slug='marketing-social'),       0.6000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='anyword'),          (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='hoppy-copy'),       (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='surgegraph'),       (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='sudowrite'),        (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='adcreative-ai'),    (SELECT id FROM categories WHERE slug='marketing-social'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='adcreative-ai'),    (SELECT id FROM categories WHERE slug='image-generation'),       0.6500, 'manual', false),
  ((SELECT id FROM tools WHERE slug='predis-ai'),        (SELECT id FROM categories WHERE slug='marketing-social'),       1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='predis-ai'),        (SELECT id FROM categories WHERE slug='writing-content'),        0.6000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='jotbot'),           (SELECT id FROM categories WHERE slug='writing-content'),        1.0000, 'manual', true),
  -- Productivity & Automation
  ((SELECT id FROM tools WHERE slug='notion-ai'),        (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='zapier'),           (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='make'),             (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='bardeen-ai'),       (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='clickup-brain'),    (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='motion'),           (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='clockwise'),        (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='granola'),          (SELECT id FROM categories WHERE slug='meetings-transcription'),  0.8000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='granola'),          (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='relay-app'),        (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='gumloop'),          (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='stack-ai'),         (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='voiceflow'),        (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='botpress'),         (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='xembly'),           (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='jotform-ai-agents'),(SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='prometai'),         (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='hockeystack'),      (SELECT id FROM categories WHERE slug='analytics'),               1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='hockeystack'),      (SELECT id FROM categories WHERE slug='productivity-automation'), 0.6000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='siift-ai'),         (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='cofounder-ai'),     (SELECT id FROM categories WHERE slug='productivity-automation'), 1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='zovoro-ai'),        (SELECT id FROM categories WHERE slug='analytics'),               1.0000, 'manual', true),
  -- Marketing & Sales
  ((SELECT id FROM tools WHERE slug='hubspot-ai'),       (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='hubspot-ai'),       (SELECT id FROM categories WHERE slug='sales-enrichment'),        0.8000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='qualified'),        (SELECT id FROM categories WHERE slug='sales-enrichment'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='drift'),            (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='drift'),            (SELECT id FROM categories WHERE slug='customer-support'),        0.6000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='outreach'),         (SELECT id FROM categories WHERE slug='sales-enrichment'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='typefully'),        (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='postwise'),         (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='taplio'),           (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='hypefury'),         (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='tweethunter'),      (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='buffer-ai'),        (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='hootsuite-ai'),     (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='metricool'),        (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='metricool'),        (SELECT id FROM categories WHERE slug='analytics'),               0.6500, 'manual', false),
  ((SELECT id FROM tools WHERE slug='simplified'),       (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='simplified'),       (SELECT id FROM categories WHERE slug='writing-content'),         0.6500, 'manual', false),
  ((SELECT id FROM tools WHERE slug='tribescaler'),      (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='howler-ai'),        (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='emplifi'),          (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='pencil'),           (SELECT id FROM categories WHERE slug='marketing-social'),        1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='pencil'),           (SELECT id FROM categories WHERE slug='image-generation'),        0.6000, 'manual', false),
  -- Meetings & Transcription
  ((SELECT id FROM tools WHERE slug='fireflies-ai'),     (SELECT id FROM categories WHERE slug='meetings-transcription'),  1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='otter-ai'),         (SELECT id FROM categories WHERE slug='meetings-transcription'),  1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='tldv'),             (SELECT id FROM categories WHERE slug='meetings-transcription'),  1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='avoma'),            (SELECT id FROM categories WHERE slug='meetings-transcription'),  1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='krisp'),            (SELECT id FROM categories WHERE slug='meetings-transcription'),  1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='noty-ai'),          (SELECT id FROM categories WHERE slug='meetings-transcription'),  1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='meetgeek'),         (SELECT id FROM categories WHERE slug='meetings-transcription'),  1.0000, 'manual', true)
ON CONFLICT (tool_id, category_id) DO NOTHING;

-- ============================================================
-- 8. Tool capabilities
-- ============================================================

INSERT INTO tool_capabilities (tool_id, capability_id, confidence, source, strength)
VALUES
  -- ChatGPT
  ((SELECT id FROM tools WHERE slug='chatgpt'), (SELECT id FROM capabilities WHERE slug='llm_chat'),            1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='chatgpt'), (SELECT id FROM capabilities WHERE slug='reasoning'),            0.9000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='chatgpt'), (SELECT id FROM capabilities WHERE slug='multimodal'),           0.9500, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='chatgpt'), (SELECT id FROM capabilities WHERE slug='content_writing'),      0.8500, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='chatgpt'), (SELECT id FROM capabilities WHERE slug='code_generation'),      0.8500, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='chatgpt'), (SELECT id FROM capabilities WHERE slug='llm_summarization'),    0.9000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='chatgpt'), (SELECT id FROM capabilities WHERE slug='api_input'),            0.9000, 'manual', 'core'),
  -- Claude
  ((SELECT id FROM tools WHERE slug='claude'),  (SELECT id FROM capabilities WHERE slug='llm_chat'),            1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='claude'),  (SELECT id FROM capabilities WHERE slug='reasoning'),            1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='claude'),  (SELECT id FROM capabilities WHERE slug='llm_summarization'),    0.9500, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='claude'),  (SELECT id FROM capabilities WHERE slug='code_generation'),      0.9000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='claude'),  (SELECT id FROM capabilities WHERE slug='document_parsing'),     0.9000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='claude'),  (SELECT id FROM capabilities WHERE slug='llm_extraction'),       0.9000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='claude'),  (SELECT id FROM capabilities WHERE slug='api_input'),            0.9500, 'manual', 'core'),
  -- Perplexity AI
  ((SELECT id FROM tools WHERE slug='perplexity-ai'), (SELECT id FROM capabilities WHERE slug='real_time_search'),  1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='perplexity-ai'), (SELECT id FROM capabilities WHERE slug='llm_chat'),          0.9000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='perplexity-ai'), (SELECT id FROM capabilities WHERE slug='web_crawling'),      0.9500, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='perplexity-ai'), (SELECT id FROM capabilities WHERE slug='llm_summarization'), 0.8500, 'manual', 'strong'),
  -- Google Gemini
  ((SELECT id FROM tools WHERE slug='google-gemini'), (SELECT id FROM capabilities WHERE slug='llm_chat'),          1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='google-gemini'), (SELECT id FROM capabilities WHERE slug='multimodal'),         1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='google-gemini'), (SELECT id FROM capabilities WHERE slug='reasoning'),          0.9000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='google-gemini'), (SELECT id FROM capabilities WHERE slug='document_parsing'),   0.8500, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='google-gemini'), (SELECT id FROM capabilities WHERE slug='api_input'),          0.9000, 'manual', 'core'),
  -- Grok
  ((SELECT id FROM tools WHERE slug='grok'),     (SELECT id FROM capabilities WHERE slug='llm_chat'),            1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='grok'),     (SELECT id FROM capabilities WHERE slug='real_time_search'),    1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='grok'),     (SELECT id FROM capabilities WHERE slug='reasoning'),           0.9000, 'manual', 'strong'),
  -- HuggingChat
  ((SELECT id FROM tools WHERE slug='huggingchat'), (SELECT id FROM capabilities WHERE slug='llm_chat'),         1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='huggingchat'), (SELECT id FROM capabilities WHERE slug='code_generation'),   0.7000, 'manual', 'partial'),
  -- DeepSeek R1
  ((SELECT id FROM tools WHERE slug='deepseek-r1'), (SELECT id FROM capabilities WHERE slug='llm_chat'),         1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='deepseek-r1'), (SELECT id FROM capabilities WHERE slug='reasoning'),        1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='deepseek-r1'), (SELECT id FROM capabilities WHERE slug='code_generation'),  0.9000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='deepseek-r1'), (SELECT id FROM capabilities WHERE slug='api_input'),        0.9000, 'manual', 'core'),
  -- NotebookLM
  ((SELECT id FROM tools WHERE slug='notebooklm'), (SELECT id FROM capabilities WHERE slug='llm_summarization'), 1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='notebooklm'), (SELECT id FROM capabilities WHERE slug='document_parsing'),  1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='notebooklm'), (SELECT id FROM capabilities WHERE slug='pdf_extraction'),    0.9500, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='notebooklm'), (SELECT id FROM capabilities WHERE slug='llm_qa'),            0.9000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='notebooklm'), (SELECT id FROM capabilities WHERE slug='voice_synthesis'),   0.8000, 'manual', 'strong'),
  -- Cursor IDE
  ((SELECT id FROM tools WHERE slug='cursor-ide'), (SELECT id FROM capabilities WHERE slug='code_generation'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='cursor-ide'), (SELECT id FROM capabilities WHERE slug='code_completion'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='cursor-ide'), (SELECT id FROM capabilities WHERE slug='llm_chat'),          0.9000, 'manual', 'strong'),
  -- Claude Code
  ((SELECT id FROM tools WHERE slug='claude-code'), (SELECT id FROM capabilities WHERE slug='code_generation'),  1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='claude-code'), (SELECT id FROM capabilities WHERE slug='reasoning'),        0.9500, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='claude-code'), (SELECT id FROM capabilities WHERE slug='workflow_automation'),0.8000,'manual', 'strong'),
  -- GitHub Copilot Pro
  ((SELECT id FROM tools WHERE slug='github-copilot-pro'), (SELECT id FROM capabilities WHERE slug='code_completion'), 1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='github-copilot-pro'), (SELECT id FROM capabilities WHERE slug='code_generation'), 0.9000, 'manual', 'strong'),
  -- Replit
  ((SELECT id FROM tools WHERE slug='replit'),    (SELECT id FROM capabilities WHERE slug='code_generation'),    1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='replit'),    (SELECT id FROM capabilities WHERE slug='no_code_builder'),    0.8500, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='replit'),    (SELECT id FROM capabilities WHERE slug='api_input'),          0.8000, 'manual', 'partial'),
  -- v0
  ((SELECT id FROM tools WHERE slug='v0'),        (SELECT id FROM capabilities WHERE slug='ui_generation'),      1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='v0'),        (SELECT id FROM capabilities WHERE slug='code_generation'),    0.9000, 'manual', 'strong'),
  -- Lovable
  ((SELECT id FROM tools WHERE slug='lovable'),   (SELECT id FROM capabilities WHERE slug='no_code_builder'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='lovable'),   (SELECT id FROM capabilities WHERE slug='code_generation'),   0.9000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='lovable'),   (SELECT id FROM capabilities WHERE slug='ui_generation'),     0.8500, 'manual', 'strong'),
  -- Bolt.new
  ((SELECT id FROM tools WHERE slug='bolt-new'),  (SELECT id FROM capabilities WHERE slug='no_code_builder'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='bolt-new'),  (SELECT id FROM capabilities WHERE slug='code_generation'),   0.9000, 'manual', 'strong'),
  -- n8n
  ((SELECT id FROM tools WHERE slug='n8n'),       (SELECT id FROM capabilities WHERE slug='workflow_automation'),1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='n8n'),       (SELECT id FROM capabilities WHERE slug='webhook'),           0.9500, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='n8n'),       (SELECT id FROM capabilities WHERE slug='api_input'),         0.9500, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='n8n'),       (SELECT id FROM capabilities WHERE slug='email_automation'),  0.8000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='n8n'),       (SELECT id FROM capabilities WHERE slug='crm_integration'),   0.7500, 'manual', 'partial'),
  -- Continue.dev
  ((SELECT id FROM tools WHERE slug='continue-dev'),(SELECT id FROM capabilities WHERE slug='code_completion'), 1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='continue-dev'),(SELECT id FROM capabilities WHERE slug='code_generation'), 0.9000, 'manual', 'strong'),
  -- Botpress
  ((SELECT id FROM tools WHERE slug='botpress'), (SELECT id FROM capabilities WHERE slug='llm_chat'),           1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='botpress'), (SELECT id FROM capabilities WHERE slug='workflow_automation'), 0.8500, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='botpress'), (SELECT id FROM capabilities WHERE slug='webhook'),            0.8000, 'manual', 'strong'),
  -- Voiceflow
  ((SELECT id FROM tools WHERE slug='voiceflow'),(SELECT id FROM capabilities WHERE slug='llm_chat'),           1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='voiceflow'),(SELECT id FROM capabilities WHERE slug='workflow_automation'), 0.9000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='voiceflow'),(SELECT id FROM capabilities WHERE slug='api_input'),          0.8500, 'manual', 'strong'),
  -- Midjourney
  ((SELECT id FROM tools WHERE slug='midjourney'),(SELECT id FROM capabilities WHERE slug='image_generation'),  1.0000, 'manual', 'core'),
  -- Leonardo AI
  ((SELECT id FROM tools WHERE slug='leonardo-ai'),(SELECT id FROM capabilities WHERE slug='image_generation'), 1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='leonardo-ai'),(SELECT id FROM capabilities WHERE slug='api_input'),        0.8500, 'manual', 'strong'),
  -- Flux
  ((SELECT id FROM tools WHERE slug='flux'),     (SELECT id FROM capabilities WHERE slug='image_generation'),   1.0000, 'manual', 'core'),
  -- Adobe Firefly
  ((SELECT id FROM tools WHERE slug='adobe-firefly'),(SELECT id FROM capabilities WHERE slug='image_generation'),1.0000,'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='adobe-firefly'),(SELECT id FROM capabilities WHERE slug='api_input'),      0.8000, 'manual', 'strong'),
  -- Canva Magic Studio
  ((SELECT id FROM tools WHERE slug='canva-magic-studio'),(SELECT id FROM capabilities WHERE slug='image_generation'),0.8000,'manual','strong'),
  ((SELECT id FROM tools WHERE slug='canva-magic-studio'),(SELECT id FROM capabilities WHERE slug='content_writing'),0.7000,'manual','partial'),
  ((SELECT id FROM tools WHERE slug='canva-magic-studio'),(SELECT id FROM capabilities WHERE slug='brand_design'),1.0000,'manual','core'),
  -- HeyGen
  ((SELECT id FROM tools WHERE slug='heygen'),   (SELECT id FROM capabilities WHERE slug='video_generation'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='heygen'),   (SELECT id FROM capabilities WHERE slug='voice_synthesis'),    0.8500, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='heygen'),   (SELECT id FROM capabilities WHERE slug='api_input'),          0.9000, 'manual', 'core'),
  -- ElevenLabs
  ((SELECT id FROM tools WHERE slug='elevenlabs'),(SELECT id FROM capabilities WHERE slug='voice_synthesis'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='elevenlabs'),(SELECT id FROM capabilities WHERE slug='api_input'),         1.0000, 'manual', 'core'),
  -- Runway ML
  ((SELECT id FROM tools WHERE slug='runway-ml'),(SELECT id FROM capabilities WHERE slug='video_generation'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='runway-ml'),(SELECT id FROM capabilities WHERE slug='multimodal'),         0.8500, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='runway-ml'),(SELECT id FROM capabilities WHERE slug='api_input'),          0.9000, 'manual', 'core'),
  -- Sora
  ((SELECT id FROM tools WHERE slug='sora'),     (SELECT id FROM capabilities WHERE slug='video_generation'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='sora'),     (SELECT id FROM capabilities WHERE slug='multimodal'),         0.9000, 'manual', 'strong'),
  -- Descript
  ((SELECT id FROM tools WHERE slug='descript'), (SELECT id FROM capabilities WHERE slug='transcription'),      0.9500, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='descript'), (SELECT id FROM capabilities WHERE slug='voice_synthesis'),    0.9000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='descript'), (SELECT id FROM capabilities WHERE slug='video_generation'),   0.7500, 'manual', 'partial'),
  -- Opus Clip
  ((SELECT id FROM tools WHERE slug='opus-clip'),(SELECT id FROM capabilities WHERE slug='video_generation'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='opus-clip'),(SELECT id FROM capabilities WHERE slug='llm_summarization'),  0.7500, 'manual', 'partial'),
  -- Synthesia
  ((SELECT id FROM tools WHERE slug='synthesia'),(SELECT id FROM capabilities WHERE slug='video_generation'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='synthesia'),(SELECT id FROM capabilities WHERE slug='api_input'),          0.9000, 'manual', 'core'),
  -- Jasper AI
  ((SELECT id FROM tools WHERE slug='jasper-ai'),(SELECT id FROM capabilities WHERE slug='content_writing'),    1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='jasper-ai'),(SELECT id FROM capabilities WHERE slug='seo_optimization'),  0.7500, 'manual', 'partial'),
  ((SELECT id FROM tools WHERE slug='jasper-ai'),(SELECT id FROM capabilities WHERE slug='api_input'),         0.9000, 'manual', 'core'),
  -- Grammarly
  ((SELECT id FROM tools WHERE slug='grammarly'),(SELECT id FROM capabilities WHERE slug='content_writing'),    0.8000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='grammarly'),(SELECT id FROM capabilities WHERE slug='llm_summarization'),  0.7000, 'manual', 'partial'),
  -- Copy AI
  ((SELECT id FROM tools WHERE slug='copy-ai'), (SELECT id FROM capabilities WHERE slug='content_writing'),    1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='copy-ai'), (SELECT id FROM capabilities WHERE slug='email_automation'),   0.7500, 'manual', 'partial'),
  -- Surfer SEO
  ((SELECT id FROM tools WHERE slug='surfer-seo'),(SELECT id FROM capabilities WHERE slug='seo_optimization'), 1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='surfer-seo'),(SELECT id FROM capabilities WHERE slug='content_writing'),  0.8500, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='surfer-seo'),(SELECT id FROM capabilities WHERE slug='natural_language_search'),0.7000,'manual','partial'),
  -- AdCreative AI
  ((SELECT id FROM tools WHERE slug='adcreative-ai'),(SELECT id FROM capabilities WHERE slug='image_generation'),0.8500,'manual','strong'),
  ((SELECT id FROM tools WHERE slug='adcreative-ai'),(SELECT id FROM capabilities WHERE slug='content_writing'),0.8000,'manual','strong'),
  ((SELECT id FROM tools WHERE slug='adcreative-ai'),(SELECT id FROM capabilities WHERE slug='api_input'),     0.8500, 'manual', 'core'),
  -- Notion AI
  ((SELECT id FROM tools WHERE slug='notion-ai'),(SELECT id FROM capabilities WHERE slug='content_writing'),   0.9000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='notion-ai'),(SELECT id FROM capabilities WHERE slug='llm_summarization'), 0.8500, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='notion-ai'),(SELECT id FROM capabilities WHERE slug='document_parsing'),  0.8000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='notion-ai'),(SELECT id FROM capabilities WHERE slug='api_input'),         0.9000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='notion-ai'),(SELECT id FROM capabilities WHERE slug='llm_qa'),            0.8500, 'manual', 'strong'),
  -- Zapier
  ((SELECT id FROM tools WHERE slug='zapier'),   (SELECT id FROM capabilities WHERE slug='workflow_automation'),1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='zapier'),   (SELECT id FROM capabilities WHERE slug='webhook'),           0.9500, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='zapier'),   (SELECT id FROM capabilities WHERE slug='email_automation'),  0.9000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='zapier'),   (SELECT id FROM capabilities WHERE slug='crm_integration'),   0.8500, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='zapier'),   (SELECT id FROM capabilities WHERE slug='api_input'),         0.9000, 'manual', 'core'),
  -- Make
  ((SELECT id FROM tools WHERE slug='make'),     (SELECT id FROM capabilities WHERE slug='workflow_automation'),1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='make'),     (SELECT id FROM capabilities WHERE slug='webhook'),           0.9500, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='make'),     (SELECT id FROM capabilities WHERE slug='api_input'),         0.9500, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='make'),     (SELECT id FROM capabilities WHERE slug='crm_integration'),   0.8000, 'manual', 'strong'),
  -- HubSpot AI
  ((SELECT id FROM tools WHERE slug='hubspot-ai'),(SELECT id FROM capabilities WHERE slug='crm_integration'),  1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='hubspot-ai'),(SELECT id FROM capabilities WHERE slug='email_automation'), 1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='hubspot-ai'),(SELECT id FROM capabilities WHERE slug='contact_enrichment'),0.8500,'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='hubspot-ai'),(SELECT id FROM capabilities WHERE slug='content_writing'),  0.8000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='hubspot-ai'),(SELECT id FROM capabilities WHERE slug='api_input'),        0.9000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='hubspot-ai'),(SELECT id FROM capabilities WHERE slug='social_scheduling'),0.8000, 'manual', 'strong'),
  -- Buffer AI
  ((SELECT id FROM tools WHERE slug='buffer-ai'),(SELECT id FROM capabilities WHERE slug='social_scheduling'), 1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='buffer-ai'),(SELECT id FROM capabilities WHERE slug='content_writing'),   0.7000, 'manual', 'partial'),
  ((SELECT id FROM tools WHERE slug='buffer-ai'),(SELECT id FROM capabilities WHERE slug='api_input'),         0.8500, 'manual', 'strong'),
  -- Hootsuite AI
  ((SELECT id FROM tools WHERE slug='hootsuite-ai'),(SELECT id FROM capabilities WHERE slug='social_scheduling'),1.0000,'manual','core'),
  ((SELECT id FROM tools WHERE slug='hootsuite-ai'),(SELECT id FROM capabilities WHERE slug='content_writing'), 0.7500,'manual','partial'),
  ((SELECT id FROM tools WHERE slug='hootsuite-ai'),(SELECT id FROM capabilities WHERE slug='api_input'),       0.8500,'manual','strong'),
  -- Typefully
  ((SELECT id FROM tools WHERE slug='typefully'),(SELECT id FROM capabilities WHERE slug='social_scheduling'),  1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='typefully'),(SELECT id FROM capabilities WHERE slug='content_writing'),    0.8500, 'manual', 'strong'),
  -- Looka
  ((SELECT id FROM tools WHERE slug='looka'),    (SELECT id FROM capabilities WHERE slug='brand_design'),       1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='looka'),    (SELECT id FROM capabilities WHERE slug='image_generation'),   0.8500, 'manual', 'strong'),
  -- Brandmark
  ((SELECT id FROM tools WHERE slug='brandmark'),(SELECT id FROM capabilities WHERE slug='brand_design'),       1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='brandmark'),(SELECT id FROM capabilities WHERE slug='image_generation'),   0.8500, 'manual', 'strong'),
  -- Fireflies AI
  ((SELECT id FROM tools WHERE slug='fireflies-ai'),(SELECT id FROM capabilities WHERE slug='transcription'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='fireflies-ai'),(SELECT id FROM capabilities WHERE slug='meeting_notes'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='fireflies-ai'),(SELECT id FROM capabilities WHERE slug='llm_summarization'),0.9000,'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='fireflies-ai'),(SELECT id FROM capabilities WHERE slug='natural_language_search'),0.8500,'manual','strong'),
  ((SELECT id FROM tools WHERE slug='fireflies-ai'),(SELECT id FROM capabilities WHERE slug='crm_integration'), 0.8000, 'manual', 'strong'),
  -- Otter AI
  ((SELECT id FROM tools WHERE slug='otter-ai'), (SELECT id FROM capabilities WHERE slug='transcription'),      1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='otter-ai'), (SELECT id FROM capabilities WHERE slug='meeting_notes'),      1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='otter-ai'), (SELECT id FROM capabilities WHERE slug='llm_summarization'),  0.8500, 'manual', 'strong'),
  -- tl;dv
  ((SELECT id FROM tools WHERE slug='tldv'),     (SELECT id FROM capabilities WHERE slug='transcription'),      1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='tldv'),     (SELECT id FROM capabilities WHERE slug='meeting_notes'),      1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='tldv'),     (SELECT id FROM capabilities WHERE slug='llm_summarization'),  0.9000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='tldv'),     (SELECT id FROM capabilities WHERE slug='crm_integration'),    0.7500, 'manual', 'partial'),
  -- Avoma
  ((SELECT id FROM tools WHERE slug='avoma'),    (SELECT id FROM capabilities WHERE slug='transcription'),      1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='avoma'),    (SELECT id FROM capabilities WHERE slug='meeting_notes'),      1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='avoma'),    (SELECT id FROM capabilities WHERE slug='crm_integration'),    0.8500, 'manual', 'strong'),
  -- Krisp
  ((SELECT id FROM tools WHERE slug='krisp'),    (SELECT id FROM capabilities WHERE slug='meeting_notes'),      0.9000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='krisp'),    (SELECT id FROM capabilities WHERE slug='transcription'),      0.8000, 'manual', 'partial'),
  -- MeetGeek
  ((SELECT id FROM tools WHERE slug='meetgeek'), (SELECT id FROM capabilities WHERE slug='transcription'),      1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='meetgeek'), (SELECT id FROM capabilities WHERE slug='meeting_notes'),      1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='meetgeek'), (SELECT id FROM capabilities WHERE slug='llm_summarization'),  0.8500, 'manual', 'strong'),
  -- Loova AI
  ((SELECT id FROM tools WHERE slug='lovo-ai'),  (SELECT id FROM capabilities WHERE slug='voice_synthesis'),    1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='lovo-ai'),  (SELECT id FROM capabilities WHERE slug='api_input'),          0.8500, 'manual', 'strong'),
  -- Framer
  ((SELECT id FROM tools WHERE slug='framer'),   (SELECT id FROM capabilities WHERE slug='no_code_builder'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='framer'),   (SELECT id FROM capabilities WHERE slug='ui_generation'),     0.8500, 'manual', 'strong'),
  -- Webflow
  ((SELECT id FROM tools WHERE slug='webflow'),  (SELECT id FROM capabilities WHERE slug='no_code_builder'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='webflow'),  (SELECT id FROM capabilities WHERE slug='ui_generation'),     0.8000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='webflow'),  (SELECT id FROM capabilities WHERE slug='api_input'),         0.8500, 'manual', 'core'),
  -- Bubble
  ((SELECT id FROM tools WHERE slug='bubble'),   (SELECT id FROM capabilities WHERE slug='no_code_builder'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='bubble'),   (SELECT id FROM capabilities WHERE slug='workflow_automation'),0.8500,'manual','strong'),
  ((SELECT id FROM tools WHERE slug='bubble'),   (SELECT id FROM capabilities WHERE slug='auth'),              0.8000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='bubble'),   (SELECT id FROM capabilities WHERE slug='api_input'),         0.9000, 'manual', 'core'),
  -- Stack AI
  ((SELECT id FROM tools WHERE slug='stack-ai'), (SELECT id FROM capabilities WHERE slug='workflow_automation'),1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='stack-ai'), (SELECT id FROM capabilities WHERE slug='llm_chat'),          0.9000, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='stack-ai'), (SELECT id FROM capabilities WHERE slug='api_input'),         0.9500, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='stack-ai'), (SELECT id FROM capabilities WHERE slug='document_parsing'),  0.8500, 'manual', 'strong'),
  -- Outreach
  ((SELECT id FROM tools WHERE slug='outreach'), (SELECT id FROM capabilities WHERE slug='email_automation'),  1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='outreach'), (SELECT id FROM capabilities WHERE slug='crm_integration'),   1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='outreach'), (SELECT id FROM capabilities WHERE slug='contact_enrichment'),0.8000, 'manual', 'strong'),
  -- Galileo AI
  ((SELECT id FROM tools WHERE slug='galileo-ai'),(SELECT id FROM capabilities WHERE slug='ui_generation'),    1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='galileo-ai'),(SELECT id FROM capabilities WHERE slug='image_generation'), 0.7500, 'manual', 'partial'),
  -- Recraft
  ((SELECT id FROM tools WHERE slug='recraft'),  (SELECT id FROM capabilities WHERE slug='image_generation'),  1.0000, 'manual', 'core'),
  ((SELECT id FROM tools WHERE slug='recraft'),  (SELECT id FROM capabilities WHERE slug='brand_design'),      0.8500, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='recraft'),  (SELECT id FROM capabilities WHERE slug='api_input'),         0.8500, 'manual', 'core')
ON CONFLICT (tool_id, capability_id) DO NOTHING;

-- ============================================================
-- 9. Tool signals (realistic popularity/trust scores)
--    github_stars only for open-source tools
-- ============================================================

INSERT INTO tool_signals (tool_id, github_stars, producthunt_votes, popularity_score, trust_score, last_computed_at)
VALUES
  -- General LLMs (high popularity, no github stars for closed tools)
  ((SELECT id FROM tools WHERE slug='chatgpt'),          NULL,  85000, 0.9900, 0.9500, now()),
  ((SELECT id FROM tools WHERE slug='claude'),           NULL,  42000, 0.9200, 0.9600, now()),
  ((SELECT id FROM tools WHERE slug='perplexity-ai'),    NULL,  38000, 0.8800, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='google-gemini'),    NULL,  22000, 0.8500, 0.8700, now()),
  ((SELECT id FROM tools WHERE slug='grok'),             NULL,  15000, 0.7200, 0.7500, now()),
  ((SELECT id FROM tools WHERE slug='microsoft-copilot'),NULL,  12000, 0.7800, 0.8200, now()),
  ((SELECT id FROM tools WHERE slug='poe'),              NULL,  18000, 0.7000, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='huggingchat'),      12000, 9500,  0.6200, 0.7500, now()),
  ((SELECT id FROM tools WHERE slug='deepseek-r1'),      NULL,  25000, 0.7800, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='bing-chat'),        NULL,  8000,  0.6500, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='otio'),             NULL,  4500,  0.4200, 0.6800, now()),
  ((SELECT id FROM tools WHERE slug='silatus'),          NULL,  2800,  0.3500, 0.6500, now()),
  ((SELECT id FROM tools WHERE slug='flowith'),          NULL,  3200,  0.3800, 0.6500, now()),
  ((SELECT id FROM tools WHERE slug='notebooklm'),       NULL,  19000, 0.7800, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='perplexity-computer'),NULL,  5500, 0.4800, 0.7200, now()),
  -- Coding tools
  ((SELECT id FROM tools WHERE slug='cursor-ide'),       NULL,  62000, 0.9500, 0.9400, now()),
  ((SELECT id FROM tools WHERE slug='claude-code'),      NULL,  28000, 0.8800, 0.9300, now()),
  ((SELECT id FROM tools WHERE slug='github-copilot-pro'),NULL, 45000, 0.9000, 0.9200, now()),
  ((SELECT id FROM tools WHERE slug='replit'),           NULL,  35000, 0.8500, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='windsurf'),         NULL,  18000, 0.7500, 0.8200, now()),
  ((SELECT id FROM tools WHERE slug='v0'),               NULL,  32000, 0.8800, 0.9000, now()),
  ((SELECT id FROM tools WHERE slug='lovable'),          NULL,  29000, 0.8800, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='bolt-new'),         NULL,  26000, 0.8500, 0.8700, now()),
  ((SELECT id FROM tools WHERE slug='factory'),          NULL,  6500,  0.5200, 0.7500, now()),
  ((SELECT id FROM tools WHERE slug='codex'),            NULL,  15000, 0.6800, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='spawn-co'),         NULL,  3800,  0.3500, 0.6200, now()),
  ((SELECT id FROM tools WHERE slug='codeium'),          NULL,  22000, 0.7800, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='continue-dev'),     22000, 14000, 0.7200, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='qodo'),             NULL,  7500,  0.5500, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='base44'),           NULL,  5500,  0.4800, 0.7000, now()),
  ((SELECT id FROM tools WHERE slug='emergent'),         NULL,  4200,  0.4000, 0.6500, now()),
  ((SELECT id FROM tools WHERE slug='manus'),            NULL,  8800,  0.5500, 0.7200, now()),
  ((SELECT id FROM tools WHERE slug='n8n'),              52000, 16000, 0.8800, 0.9200, now()),
  ((SELECT id FROM tools WHERE slug='nebula'),           NULL,  2500,  0.3000, 0.6000, now()),
  ((SELECT id FROM tools WHERE slug='testim'),           NULL,  4500,  0.4500, 0.7500, now()),
  -- Website builders
  ((SELECT id FROM tools WHERE slug='dora'),             NULL,  9500,  0.6200, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='10web'),            NULL,  6500,  0.5500, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='framer'),           NULL,  28000, 0.8500, 0.9000, now()),
  ((SELECT id FROM tools WHERE slug='durable'),          NULL,  7500,  0.5800, 0.7500, now()),
  ((SELECT id FROM tools WHERE slug='wegic'),            NULL,  5200,  0.4500, 0.7000, now()),
  ((SELECT id FROM tools WHERE slug='glide'),            NULL,  8800,  0.6200, 0.8200, now()),
  ((SELECT id FROM tools WHERE slug='adalo'),            NULL,  6800,  0.5500, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='bubble'),           NULL,  22000, 0.8200, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='softr'),            NULL,  7500,  0.5800, 0.8000, now()),
  ((SELECT id FROM tools WHERE slug='webflow'),          NULL,  35000, 0.8800, 0.9200, now()),
  ((SELECT id FROM tools WHERE slug='design-com'),       NULL,  4200,  0.4200, 0.7000, now()),
  ((SELECT id FROM tools WHERE slug='super-ai'),         NULL,  3500,  0.3500, 0.6500, now()),
  -- Image generation
  ((SELECT id FROM tools WHERE slug='midjourney'),       NULL,  55000, 0.9500, 0.9200, now()),
  ((SELECT id FROM tools WHERE slug='leonardo-ai'),      NULL,  28000, 0.8200, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='flux'),             18000, 12000, 0.7500, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='recraft'),          NULL,  9500,  0.6500, 0.8200, now()),
  ((SELECT id FROM tools WHERE slug='adobe-firefly'),    NULL,  18000, 0.7800, 0.9000, now()),
  ((SELECT id FROM tools WHERE slug='canva-magic-studio'),NULL, 65000, 0.9200, 0.9300, now()),
  ((SELECT id FROM tools WHERE slug='freepik-ai'),       NULL,  12000, 0.6800, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='stylar'),           NULL,  4500,  0.4200, 0.7200, now()),
  ((SELECT id FROM tools WHERE slug='clipdrop'),         NULL,  8500,  0.6200, 0.8000, now()),
  ((SELECT id FROM tools WHERE slug='looka'),            NULL,  9500,  0.6800, 0.8200, now()),
  ((SELECT id FROM tools WHERE slug='namelix'),          NULL,  5500,  0.5000, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='brandmark'),        NULL,  4800,  0.4500, 0.7500, now()),
  ((SELECT id FROM tools WHERE slug='stockimg-ai'),      NULL,  5500,  0.4800, 0.7200, now()),
  ((SELECT id FROM tools WHERE slug='galileo-ai'),       NULL,  8800,  0.6200, 0.8000, now()),
  ((SELECT id FROM tools WHERE slug='bing-create'),      NULL,  6500,  0.5500, 0.8000, now()),
  ((SELECT id FROM tools WHERE slug='autodraw'),         NULL,  3500,  0.3200, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='designs-ai'),       NULL,  4200,  0.4000, 0.7000, now()),
  ((SELECT id FROM tools WHERE slug='vance-ai'),         NULL,  3800,  0.3800, 0.6800, now()),
  -- Video & Audio
  ((SELECT id FROM tools WHERE slug='heygen'),           NULL,  25000, 0.8800, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='elevenlabs'),       NULL,  42000, 0.9200, 0.9200, now()),
  ((SELECT id FROM tools WHERE slug='runway-ml'),        NULL,  32000, 0.8800, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='kling-ai'),         NULL,  12000, 0.6800, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='luma-dream-machine'),NULL, 18000, 0.7500, 0.8200, now()),
  ((SELECT id FROM tools WHERE slug='sora'),             NULL,  38000, 0.8800, 0.9000, now()),
  ((SELECT id FROM tools WHERE slug='veo-2'),            NULL,  15000, 0.7000, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='pika'),             NULL,  16000, 0.7200, 0.8000, now()),
  ((SELECT id FROM tools WHERE slug='pictory'),          NULL,  8500,  0.6200, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='synthesia'),        NULL,  18000, 0.7800, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='invideo'),          NULL,  9500,  0.6200, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='opus-clip'),        NULL,  16000, 0.7500, 0.8200, now()),
  ((SELECT id FROM tools WHERE slug='descript'),         NULL,  22000, 0.8000, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='lovo-ai'),          NULL,  6500,  0.5200, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='adobe-podcast'),    NULL,  8800,  0.6200, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='capcut-ai'),        NULL,  28000, 0.8500, 0.8500, now()),
  -- Writing & Content
  ((SELECT id FROM tools WHERE slug='jasper-ai'),        NULL,  22000, 0.8000, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='writesonic'),       NULL,  12000, 0.6800, 0.8000, now()),
  ((SELECT id FROM tools WHERE slug='copy-ai'),          NULL,  15000, 0.7200, 0.8200, now()),
  ((SELECT id FROM tools WHERE slug='rytr'),             NULL,  9500,  0.6200, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='textblaze'),        NULL,  5500,  0.5000, 0.8000, now()),
  ((SELECT id FROM tools WHERE slug='hix-ai'),           NULL,  5800,  0.5200, 0.7500, now()),
  ((SELECT id FROM tools WHERE slug='jenny-ai'),         NULL,  4500,  0.4200, 0.7200, now()),
  ((SELECT id FROM tools WHERE slug='quillbot'),         NULL,  18000, 0.8000, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='grammarly'),        NULL,  55000, 0.9500, 0.9500, now()),
  ((SELECT id FROM tools WHERE slug='surfer-seo'),       NULL,  12000, 0.7200, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='anyword'),          NULL,  6500,  0.5500, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='hoppy-copy'),       NULL,  4200,  0.4200, 0.7500, now()),
  ((SELECT id FROM tools WHERE slug='surgegraph'),       NULL,  3200,  0.3500, 0.6800, now()),
  ((SELECT id FROM tools WHERE slug='sudowrite'),        NULL,  5800,  0.5200, 0.8000, now()),
  ((SELECT id FROM tools WHERE slug='adcreative-ai'),    NULL,  9500,  0.6500, 0.8000, now()),
  ((SELECT id FROM tools WHERE slug='predis-ai'),        NULL,  5500,  0.5000, 0.7500, now()),
  ((SELECT id FROM tools WHERE slug='jotbot'),           NULL,  3800,  0.3800, 0.6800, now()),
  -- Productivity & Automation
  ((SELECT id FROM tools WHERE slug='notion-ai'),        NULL,  88000, 0.9800, 0.9500, now()),
  ((SELECT id FROM tools WHERE slug='zapier'),           NULL,  72000, 0.9500, 0.9500, now()),
  ((SELECT id FROM tools WHERE slug='make'),             NULL,  38000, 0.8800, 0.9200, now()),
  ((SELECT id FROM tools WHERE slug='bardeen-ai'),       NULL,  12000, 0.6800, 0.8200, now()),
  ((SELECT id FROM tools WHERE slug='clickup-brain'),    NULL,  28000, 0.8200, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='motion'),           NULL,  15000, 0.7200, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='clockwise'),        NULL,  8500,  0.6200, 0.8200, now()),
  ((SELECT id FROM tools WHERE slug='granola'),          NULL,  9500,  0.6500, 0.8200, now()),
  ((SELECT id FROM tools WHERE slug='relay-app'),        NULL,  6500,  0.5500, 0.8000, now()),
  ((SELECT id FROM tools WHERE slug='gumloop'),          NULL,  7500,  0.5800, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='stack-ai'),         NULL,  6500,  0.5500, 0.8000, now()),
  ((SELECT id FROM tools WHERE slug='voiceflow'),        NULL,  18000, 0.7800, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='botpress'),         14000, 12000, 0.7200, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='xembly'),           NULL,  4200,  0.4200, 0.7500, now()),
  ((SELECT id FROM tools WHERE slug='jotform-ai-agents'),NULL,  8500,  0.6500, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='prometai'),         NULL,  2800,  0.3200, 0.6500, now()),
  ((SELECT id FROM tools WHERE slug='hockeystack'),      NULL,  4500,  0.4800, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='siift-ai'),         NULL,  1500,  0.2500, 0.6000, now()),
  ((SELECT id FROM tools WHERE slug='cofounder-ai'),     NULL,  2800,  0.3200, 0.6500, now()),
  ((SELECT id FROM tools WHERE slug='zovoro-ai'),        NULL,  1200,  0.2200, 0.5800, now()),
  -- Marketing & Sales
  ((SELECT id FROM tools WHERE slug='hubspot-ai'),       NULL,  65000, 0.9500, 0.9500, now()),
  ((SELECT id FROM tools WHERE slug='qualified'),        NULL,  8500,  0.6500, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='drift'),            NULL,  12000, 0.7000, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='outreach'),         NULL,  9500,  0.7000, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='typefully'),        NULL,  18000, 0.8000, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='postwise'),         NULL,  6500,  0.5500, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='taplio'),           NULL,  8500,  0.6200, 0.8000, now()),
  ((SELECT id FROM tools WHERE slug='hypefury'),         NULL,  7500,  0.5800, 0.8000, now()),
  ((SELECT id FROM tools WHERE slug='tweethunter'),      NULL,  9500,  0.6500, 0.8200, now()),
  ((SELECT id FROM tools WHERE slug='buffer-ai'),        NULL,  28000, 0.8500, 0.9000, now()),
  ((SELECT id FROM tools WHERE slug='hootsuite-ai'),     NULL,  22000, 0.8000, 0.9000, now()),
  ((SELECT id FROM tools WHERE slug='metricool'),        NULL,  6500,  0.5800, 0.8000, now()),
  ((SELECT id FROM tools WHERE slug='simplified'),       NULL,  8500,  0.6200, 0.7800, now()),
  ((SELECT id FROM tools WHERE slug='tribescaler'),      NULL,  3500,  0.3800, 0.7000, now()),
  ((SELECT id FROM tools WHERE slug='howler-ai'),        NULL,  1800,  0.2500, 0.6200, now()),
  ((SELECT id FROM tools WHERE slug='emplifi'),          NULL,  5500,  0.5500, 0.8200, now()),
  ((SELECT id FROM tools WHERE slug='pencil'),           NULL,  5500,  0.5200, 0.7800, now()),
  -- Meetings & Transcription
  ((SELECT id FROM tools WHERE slug='fireflies-ai'),     NULL,  28000, 0.8500, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='otter-ai'),         NULL,  22000, 0.8200, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='tldv'),             NULL,  18000, 0.7800, 0.8500, now()),
  ((SELECT id FROM tools WHERE slug='avoma'),            NULL,  8500,  0.6200, 0.8200, now()),
  ((SELECT id FROM tools WHERE slug='krisp'),            NULL,  15000, 0.7500, 0.8800, now()),
  ((SELECT id FROM tools WHERE slug='noty-ai'),          NULL,  4500,  0.4200, 0.7200, now()),
  ((SELECT id FROM tools WHERE slug='meetgeek'),         NULL,  8500,  0.6200, 0.8200, now())
ON CONFLICT (tool_id) DO NOTHING;

-- ============================================================
-- 10. Tool alternatives (key competitive relationships)
--     alternative_type: cheaper | enterprise | easier | open_source
-- ============================================================

INSERT INTO tool_alternatives (tool_id, alternative_tool_id, alternative_type, cheaper, better_for_nontechnical, better_for_enterprise, reason)
VALUES
  -- LLM alternatives
  ((SELECT id FROM tools WHERE slug='chatgpt'),       (SELECT id FROM tools WHERE slug='claude'),         'easier',        false, true,  false, 'Better for long-context analysis and careful reasoning; less hallucination'),
  ((SELECT id FROM tools WHERE slug='chatgpt'),       (SELECT id FROM tools WHERE slug='deepseek-r1'),    'cheaper',       true,  false, false, 'Significantly cheaper API; competitive quality for bulk tasks'),
  ((SELECT id FROM tools WHERE slug='chatgpt'),       (SELECT id FROM tools WHERE slug='google-gemini'),  'easier',        false, true,  true,  'Deep Google Workspace integration; better for G Suite power users'),
  ((SELECT id FROM tools WHERE slug='chatgpt'),       (SELECT id FROM tools WHERE slug='perplexity-ai'),  'easier',        false, true,  false, 'Better for real-time research with citations; more reliable sources'),
  ((SELECT id FROM tools WHERE slug='claude'),        (SELECT id FROM tools WHERE slug='chatgpt'),        'easier',        false, true,  false, 'Better multimodal and plugin ecosystem; wider general awareness'),
  ((SELECT id FROM tools WHERE slug='claude'),        (SELECT id FROM tools WHERE slug='deepseek-r1'),    'cheaper',       true,  false, false, 'Much cheaper API pricing; good for high-volume inference'),
  ((SELECT id FROM tools WHERE slug='claude'),        (SELECT id FROM tools WHERE slug='huggingchat'),    'cheaper',       true,  false, false, 'Open-source and self-hostable; free for private deployments'),
  ((SELECT id FROM tools WHERE slug='perplexity-ai'), (SELECT id FROM tools WHERE slug='google-gemini'),  'easier',        false, true,  true,  'Better Google ecosystem integration; native grounding in Google Search'),
  ((SELECT id FROM tools WHERE slug='perplexity-ai'), (SELECT id FROM tools WHERE slug='bing-chat'),      'cheaper',       true,  true,  false, 'Fully free; integrated into Bing for quick lookups'),
  -- Coding tool alternatives
  ((SELECT id FROM tools WHERE slug='cursor-ide'),    (SELECT id FROM tools WHERE slug='windsurf'),       'cheaper',       true,  false, false, 'Competitive pricing; similar vibe-coding speed for rapid iteration'),
  ((SELECT id FROM tools WHERE slug='cursor-ide'),    (SELECT id FROM tools WHERE slug='github-copilot-pro'),'cheaper',    true,  false, false, 'Lower monthly cost; strong inline completion in existing IDE'),
  ((SELECT id FROM tools WHERE slug='cursor-ide'),    (SELECT id FROM tools WHERE slug='continue-dev'),   'cheaper',       true,  false, false, 'Open-source, BYOK, self-hostable; free for privacy-conscious devs'),
  ((SELECT id FROM tools WHERE slug='cursor-ide'),    (SELECT id FROM tools WHERE slug='claude-code'),    'easier',        false, false, false, 'Agentic terminal+file automation without an IDE; better for solo founders'),
  ((SELECT id FROM tools WHERE slug='lovable'),       (SELECT id FROM tools WHERE slug='bolt-new'),       'cheaper',       true,  true,  false, 'Faster time-to-prototype; strong for multi-framework non-technical users'),
  ((SELECT id FROM tools WHERE slug='lovable'),       (SELECT id FROM tools WHERE slug='replit'),         'cheaper',       true,  true,  false, 'Lower cost entry; established platform with 30+ integrations'),
  ((SELECT id FROM tools WHERE slug='lovable'),       (SELECT id FROM tools WHERE slug='bubble'),         'easier',        false, true,  false, 'Better for complex SaaS logic; more mature no-code ecosystem'),
  ((SELECT id FROM tools WHERE slug='bolt-new'),      (SELECT id FROM tools WHERE slug='lovable'),        'easier',        false, true,  false, 'Full DB, auth and hosting included; better for production launches'),
  ((SELECT id FROM tools WHERE slug='bolt-new'),      (SELECT id FROM tools WHERE slug='replit'),         'easier',        false, true,  false, 'More mature deployment and database integrations'),
  ((SELECT id FROM tools WHERE slug='n8n'),           (SELECT id FROM tools WHERE slug='zapier'),         'cheaper',       true,  false, false, 'Self-hostable and open-source; no per-task fees for high-volume flows'),
  ((SELECT id FROM tools WHERE slug='n8n'),           (SELECT id FROM tools WHERE slug='make'),           'cheaper',       true,  false, false, 'Open-source option; can self-host for enterprise data compliance'),
  ((SELECT id FROM tools WHERE slug='zapier'),        (SELECT id FROM tools WHERE slug='make'),           'cheaper',       true,  false, false, 'Lower cost for complex multi-step workflows; visual scenario builder'),
  ((SELECT id FROM tools WHERE slug='zapier'),        (SELECT id FROM tools WHERE slug='n8n'),            'cheaper',       true,  false, false, 'Open-source and self-hostable; eliminates per-task billing'),
  -- Website builder alternatives
  ((SELECT id FROM tools WHERE slug='webflow'),       (SELECT id FROM tools WHERE slug='framer'),         'cheaper',       true,  true,  false, 'Better for interaction-heavy landing pages; easier learning curve'),
  ((SELECT id FROM tools WHERE slug='webflow'),       (SELECT id FROM tools WHERE slug='bubble'),         'easier',        false, true,  false, 'Better for full SaaS apps with user auth and complex logic'),
  ((SELECT id FROM tools WHERE slug='webflow'),       (SELECT id FROM tools WHERE slug='durable'),        'cheaper',       true,  true,  false, 'One-prompt site generation; fastest for simple service businesses'),
  ((SELECT id FROM tools WHERE slug='framer'),        (SELECT id FROM tools WHERE slug='webflow'),        'easier',        false, false, true,  'More powerful CMS and enterprise features; larger community'),
  ((SELECT id FROM tools WHERE slug='bubble'),        (SELECT id FROM tools WHERE slug='webflow'),        'easier',        false, true,  false, 'Easier for non-technical design-first sites without app logic'),
  ((SELECT id FROM tools WHERE slug='bubble'),        (SELECT id FROM tools WHERE slug='softr'),          'cheaper',       true,  true,  false, 'Faster setup from Airtable/Supabase; less technical overhead'),
  -- Image generation alternatives
  ((SELECT id FROM tools WHERE slug='midjourney'),    (SELECT id FROM tools WHERE slug='leonardo-ai'),    'cheaper',       true,  false, false, 'API access; fine-tuned style consistency at lower cost'),
  ((SELECT id FROM tools WHERE slug='midjourney'),    (SELECT id FROM tools WHERE slug='flux'),           'cheaper',       true,  false, false, 'Open-source; fully free for local runs on privacy-sensitive work'),
  ((SELECT id FROM tools WHERE slug='midjourney'),    (SELECT id FROM tools WHERE slug='adobe-firefly'),  'enterprise',    false, false, true,  'Enterprise-safe indemnification; inside Adobe Creative Cloud ecosystem'),
  ((SELECT id FROM tools WHERE slug='midjourney'),    (SELECT id FROM tools WHERE slug='canva-magic-studio'),'easier',     false, true,  false, 'Easier for non-designers; complete design suite beyond just image gen'),
  ((SELECT id FROM tools WHERE slug='leonardo-ai'),  (SELECT id FROM tools WHERE slug='flux'),           'cheaper',       true,  false, false, 'Open-source and local; no subscription required'),
  ((SELECT id FROM tools WHERE slug='adobe-firefly'),(SELECT id FROM tools WHERE slug='midjourney'),     'cheaper',       true,  false, false, 'Best image quality and vibrant community; faster iteration via Discord'),
  -- Video generation alternatives
  ((SELECT id FROM tools WHERE slug='heygen'),        (SELECT id FROM tools WHERE slug='synthesia'),      'cheaper',       true,  false, false, 'Better pricing; highly realistic avatars; API access'),
  ((SELECT id FROM tools WHERE slug='heygen'),        (SELECT id FROM tools WHERE slug='runway-ml'),      'easier',        false, true,  false, 'Better for generative video without avatars; strong editing tools'),
  ((SELECT id FROM tools WHERE slug='runway-ml'),     (SELECT id FROM tools WHERE slug='kling-ai'),       'cheaper',       true,  false, false, 'Higher motion quality at lower price; strong for social clips'),
  ((SELECT id FROM tools WHERE slug='runway-ml'),     (SELECT id FROM tools WHERE slug='pika'),           'cheaper',       true,  true,  false, 'Simpler for quick social video clips; lower barrier to entry'),
  ((SELECT id FROM tools WHERE slug='sora'),          (SELECT id FROM tools WHERE slug='runway-ml'),      'cheaper',       true,  false, false, 'Lower cost with API; mature editing suite for post-production'),
  ((SELECT id FROM tools WHERE slug='descript'),      (SELECT id FROM tools WHERE slug='opus-clip'),      'cheaper',       true,  true,  false, 'Automated long-to-short video; lower cost for social clip creation'),
  -- Audio & TTS alternatives
  ((SELECT id FROM tools WHERE slug='elevenlabs'),    (SELECT id FROM tools WHERE slug='lovo-ai'),        'cheaper',       true,  true,  false, 'Broader voice library; simpler UI for non-technical creators'),
  ((SELECT id FROM tools WHERE slug='elevenlabs'),    (SELECT id FROM tools WHERE slug='adobe-podcast'),  'cheaper',       true,  true,  false, 'Free audio enhancement; native to Creative Cloud'),
  -- Writing alternatives
  ((SELECT id FROM tools WHERE slug='jasper-ai'),     (SELECT id FROM tools WHERE slug='copy-ai'),        'cheaper',       true,  true,  false, 'Lower cost; good for GTM workflows and short-form sales copy'),
  ((SELECT id FROM tools WHERE slug='jasper-ai'),     (SELECT id FROM tools WHERE slug='writesonic'),     'cheaper',       true,  false, false, 'Cheaper SEO-optimized content; competitive features'),
  ((SELECT id FROM tools WHERE slug='jasper-ai'),     (SELECT id FROM tools WHERE slug='rytr'),           'cheaper',       true,  true,  false, 'Most affordable AI writer for common marketing templates'),
  ((SELECT id FROM tools WHERE slug='jasper-ai'),     (SELECT id FROM tools WHERE slug='chatgpt'),        'cheaper',       true,  false, false, 'General-purpose LLM; free tier available; no brand-voice guardrails'),
  ((SELECT id FROM tools WHERE slug='grammarly'),     (SELECT id FROM tools WHERE slug='quillbot'),       'cheaper',       true,  true,  false, 'Strong paraphrasing and summarization at lower cost'),
  ((SELECT id FROM tools WHERE slug='surfer-seo'),    (SELECT id FROM tools WHERE slug='writesonic'),     'cheaper',       true,  true,  false, 'Combines AI writing with SEO optimization in one tool'),
  ((SELECT id FROM tools WHERE slug='adcreative-ai'), (SELECT id FROM tools WHERE slug='canva-magic-studio'),'cheaper',    true,  true,  false, 'Broader design suite; easier for non-designers to create ads'),
  ((SELECT id FROM tools WHERE slug='adcreative-ai'), (SELECT id FROM tools WHERE slug='pencil'),         'easier',        false, false, false, 'Better ad variation testing; dedicated performance marketing focus'),
  -- Productivity alternatives
  ((SELECT id FROM tools WHERE slug='notion-ai'),     (SELECT id FROM tools WHERE slug='clickup-brain'),  'cheaper',       true,  false, false, 'Cheaper AI add-on; integrated task and project management'),
  ((SELECT id FROM tools WHERE slug='zapier'),        (SELECT id FROM tools WHERE slug='relay-app'),      'cheaper',       true,  false, false, 'Agent-powered with human-in-the-loop steps; modern UX'),
  ((SELECT id FROM tools WHERE slug='voiceflow'),     (SELECT id FROM tools WHERE slug='botpress'),       'cheaper',       true,  false, false, 'Open-source and self-hostable; no vendor lock-in'),
  ((SELECT id FROM tools WHERE slug='botpress'),      (SELECT id FROM tools WHERE slug='voiceflow'),      'easier',        false, true,  true,  'Better UI for non-technical teams; strong enterprise features'),
  ((SELECT id FROM tools WHERE slug='stack-ai'),      (SELECT id FROM tools WHERE slug='gumloop'),        'cheaper',       true,  true,  false, 'Simpler no-code interface; faster for non-technical agent builders'),
  -- Marketing alternatives
  ((SELECT id FROM tools WHERE slug='hubspot-ai'),    (SELECT id FROM tools WHERE slug='outreach'),       'easier',        false, false, true,  'Better pure sales sequence intelligence for enterprise SDR teams'),
  ((SELECT id FROM tools WHERE slug='hubspot-ai'),    (SELECT id FROM tools WHERE slug='drift'),          'easier',        false, false, true,  'Stronger conversational marketing and inbound pipeline automation'),
  ((SELECT id FROM tools WHERE slug='buffer-ai'),     (SELECT id FROM tools WHERE slug='hootsuite-ai'),   'cheaper',       true,  true,  false, 'Enterprise social management with advanced analytics and team features'),
  ((SELECT id FROM tools WHERE slug='buffer-ai'),     (SELECT id FROM tools WHERE slug='typefully'),      'cheaper',       true,  true,  false, 'Better X/Twitter-specific writing and scheduling; founder-focused'),
  ((SELECT id FROM tools WHERE slug='hootsuite-ai'),  (SELECT id FROM tools WHERE slug='buffer-ai'),      'cheaper',       true,  true,  false, 'More affordable for solo creators; clean simple scheduling UI'),
  ((SELECT id FROM tools WHERE slug='hootsuite-ai'),  (SELECT id FROM tools WHERE slug='metricool'),      'cheaper',       true,  true,  false, 'Analytics-first social tool at much lower price point'),
  ((SELECT id FROM tools WHERE slug='typefully'),     (SELECT id FROM tools WHERE slug='tweethunter'),    'cheaper',       true,  false, false, 'More viral thread ideas and X growth analytics features'),
  ((SELECT id FROM tools WHERE slug='typefully'),     (SELECT id FROM tools WHERE slug='taplio'),         'cheaper',       true,  false, false, 'LinkedIn + X combined growth AI with personal branding tools'),
  -- Meetings alternatives
  ((SELECT id FROM tools WHERE slug='fireflies-ai'),  (SELECT id FROM tools WHERE slug='otter-ai'),       'cheaper',       false, true,  false, 'Comparable pricing; real-time notes with strong team collaboration'),
  ((SELECT id FROM tools WHERE slug='fireflies-ai'),  (SELECT id FROM tools WHERE slug='tldv'),           'cheaper',       false, true,  false, 'Free unlimited recordings; strong for async highlight sharing'),
  ((SELECT id FROM tools WHERE slug='fireflies-ai'),  (SELECT id FROM tools WHERE slug='granola'),        'easier',        false, true,  false, 'Mac-native; lighter and faster for individual users'),
  ((SELECT id FROM tools WHERE slug='otter-ai'),      (SELECT id FROM tools WHERE slug='fireflies-ai'),   'easier',        false, true,  true,  'Better semantic search and AI meeting summaries at scale'),
  ((SELECT id FROM tools WHERE slug='otter-ai'),      (SELECT id FROM tools WHERE slug='krisp'),          'easier',        false, true,  false, 'Adds noise cancellation on top of transcription; simpler stack'),
  ((SELECT id FROM tools WHERE slug='avoma'),         (SELECT id FROM tools WHERE slug='fireflies-ai'),   'cheaper',       true,  false, false, 'Lower per-seat cost; good transcription and action items'),
  ((SELECT id FROM tools WHERE slug='avoma'),         (SELECT id FROM tools WHERE slug='meetgeek'),       'cheaper',       true,  false, false, 'Similar intelligence and sharing at lower cost')
ON CONFLICT (tool_id, alternative_tool_id, alternative_type) DO NOTHING;

-- ============================================================
-- Group 10: Backend & Infrastructure
-- ============================================================

-- New category
INSERT INTO categories (slug, name, description, category_type) VALUES
  ('backend-infra', 'Backend & Infrastructure', 'Managed backends, databases, deployment platforms, and hosting for complex apps', 'primary')
ON CONFLICT (slug) DO NOTHING;

-- New capabilities
INSERT INTO capabilities (slug, name, description, capability_group) VALUES
  ('realtime_subscriptions', 'Real-time subscriptions',  'Live data sync and push updates without polling',                      'data'),
  ('auth_management',        'Auth & user management',   'OAuth, magic links, row-level security, and session handling',         'security'),
  ('edge_functions',         'Edge functions',           'Serverless compute at the edge for low-latency business logic',        'infra'),
  ('vector_search',          'Vector search',            'Store and query vector embeddings for AI/RAG applications',            'ai'),
  ('graphql_api',            'GraphQL API',              'Auto-generate or expose a GraphQL API over a database',                'data'),
  ('managed_postgres',       'Managed Postgres',         'Hosted, scalable PostgreSQL database with automated backups',          'data'),
  ('deployment_platform',    'Deployment platform',      'Host and deploy full-stack apps, services, and scheduled jobs',        'infra')
ON CONFLICT (slug) DO NOTHING;

-- Group 10 tools
INSERT INTO tools (name, slug, canonical_name, company_name, website_url, short_description, long_description, github_url, open_source, self_hostable, api_available, tool_type, lifecycle_status, founded_year, status_active) VALUES
  ('Supabase',    'supabase',    'Supabase',    'Supabase',    'https://supabase.com',            'Open-source Firebase alternative on Postgres with auth, storage, real-time, and edge functions.',        'Open-source Firebase alternative built on PostgreSQL. Provides auth (OAuth, magic links, RLS), real-time subscriptions, S3-like storage, auto-generated REST/GraphQL APIs, edge functions (Deno), and vector embeddings for AI/RAG. The default backend for solo founders in 2026 — Lovable/Bolt connect natively, and Cursor/Claude Code manage schemas and RLS policies via prompts.',          'https://github.com/supabase/supabase',           true,  true,  true,  'open_source', 'active', 2020, true),
  ('Convex',      'convex',      'Convex',      'Convex',      'https://convex.dev',              'Reactive TypeScript-first backend with real-time sync, ACID transactions, and zero-config scaling.',    'Fully serverless, TypeScript-first backend with instant real-time sync, strong typing, ACID transactions, scheduling, and file storage. Founders pair with Next.js/Cursor for full-stack reactivity — define schema in TypeScript, queries auto-optimize. Surging in 2026 as the "modern Supabase alternative" for app-like real-time experiences.',                                               NULL,                                              false, false, true,  'saas',        'active', 2021, true),
  ('Firebase',    'firebase',    'Firebase',    'Google',      'https://firebase.google.com',     'Google BaaS with Firestore, auth, Cloud Functions, storage, hosting, and offline sync.',                'Classic BaaS with Firestore (NoSQL), auth, Cloud Functions, storage, hosting, ML Kit, and Crashlytics. Still dominant for mobile-first or rapid prototypes. X users prefer it over Supabase when deep Google Analytics/Ads integration or offline sync matters; pay-as-you-go model can spike costs.',                                                                                             NULL,                                              false, false, true,  'saas',        'active', 2011, true),
  ('Appwrite',    'appwrite',    'Appwrite',    'Appwrite',    'https://appwrite.io',             'Fully open-source self-hosted BaaS with auth, databases, storage, functions, and admin console.',       'Fully open-source, self-hosted (Docker) BaaS with auth, databases (multiple types), storage, functions (multi-language), realtime, and console UI. Popular for data privacy, on-prem needs, or avoiding vendor lock-in. X threads praise it for complex permissions and as "Supabase but fully controllable."',                                                                                  'https://github.com/appwrite/appwrite',           true,  true,  true,  'open_source', 'active', 2019, true),
  ('PocketBase',  'pocketbase',  'PocketBase',  'PocketBase',  'https://pocketbase.io',           'Single-file Go backend with realtime DB, auth, file storage, admin UI, and REST/JS SDK.',               'Ultra-lightweight, single-file Go binary backend (self-hosted). Includes realtime DB (SQLite), auth, file storage, admin UI, and REST/JS SDK. Ideal for side projects or embedded apps — download, run, done. X indie devs use it for quick complex prototypes without cloud costs; scales well for <10K users.',                                                                                   'https://github.com/pocketbase/pocketbase',       true,  true,  false, 'open_source', 'active', 2022, true),
  ('Xano',        'xano',        'Xano',        'Xano',        'https://xano.com',                'No-code/low-code visual backend builder with API logic flows, Postgres, auth, and scaling.',             'No-code/low-code backend builder with visual API/logic flows, Postgres/MySQL support, auth, caching, and scaling. Founders build custom business logic (payment webhooks, AI processing) without code; integrates with Supabase and others. Great when Claude/Cursor handles the frontend but backend logic gets complex.',                                                                          NULL,                                              false, false, true,  'saas',        'active', 2020, true),
  ('Hasura',      'hasura',      'Hasura',      'Hasura',      'https://hasura.io',               'Instant GraphQL and REST APIs on Postgres with permissions, event triggers, and real-time subscriptions.','Instant GraphQL/REST APIs on existing Postgres (or other DBs), with granular permissions, actions, event triggers, and real-time subscriptions. X users layer it on Supabase for advanced querying; perfect for complex relational data in AI apps (e.g., RAG metadata, multi-tenant schemas).',  'https://github.com/hasura/graphql-engine',       true,  true,  true,  'open_source', 'active', 2018, true),
  ('Nhost',       'nhost',       'Nhost',       'Nhost',       'https://nhost.io',                'Open-source managed Supabase-like with Postgres, auth, storage, GraphQL, and Hasura out of the box.',   'Open-source Supabase-like (Postgres, auth, storage, GraphQL, functions) with a dashboard and CLI. Self-hostable or fully managed; strong for Hasura integration out-of-box. Seen in stacks that need more GraphQL focus than native Supabase.',                                                                                                                                                  'https://github.com/nhost/nhost',                 true,  true,  true,  'open_source', 'active', 2019, true),
  ('Render',      'render',      'Render',      'Render',      'https://render.com',              'Cloud platform for backends, cron jobs, Postgres, and Redis with automatic Git-push deploys.',           'Cloud platform for deploying backends (Node/Python/Go), cron jobs, Postgres, and Redis. Founders use alongside Supabase for custom serverless functions or microservices; auto-deploys from Git with predictable pricing. The most popular "Heroku replacement" in 2026 for indie and early-stage startups.',                                                                                       NULL,                                              false, false, true,  'saas',        'active', 2019, true),
  ('Hosting Provider',      'hosting-provider',      'Hosting Provider',      'Hosting Provider',      'https://hosting-provider.com',              'Frontend hosting and edge platform with serverless functions, Postgres, KV, and blob storage.',          'Beyond hosting — Hosting Provider provides serverless functions, edge middleware, Postgres (via Neon), KV store, and blob storage. Native deployment target for Next.js, SvelteKit, and v0-generated apps. Many pair Hosting Provider frontend + Supabase/Convex backend; Hosting Provider storage primitives handle simple data needs without adding extra services.',                                                          NULL,                                              false, false, true,  'saas',        'active', 2015, true),
  ('Neon',        'neon',        'Neon',        'Neon',        'https://neon.tech',               'Serverless Postgres with branching, autoscaling, and built-in vector support for AI and RAG apps.',      'Serverless Postgres with branching, autoscaling, and AI vector support. X devs love branching for safe, zero-risk migrations in Cursor workflows — spin up a branch, test the schema change, merge. The database engine powering Hosting Provider Postgres, also used standalone with Next.js and Drizzle.',                                                                                             NULL,                                              false, false, true,  'saas',        'active', 2021, true),
  ('Railway',     'railway',     'Railway',     'Railway',     'https://railway.app',             'Zero-config full-stack deployment with Git-push deploys, Postgres, Redis, and one-click service plugins.','Easy full-stack deployment with services, DBs (Postgres, Redis), and plugins. Git-push deploys; popular for quick backend spin-up in AI-built apps. Regarded as the friendliest option between Render and Fly.io for founders who want zero ops overhead.',                                                                                                                               NULL,                                              false, false, true,  'saas',        'active', 2020, true),
  ('Fly.io',      'fly-io',      'Fly.io',      'Fly.io',      'https://fly.io',                  'Global edge deployment for containers, Postgres, and low-latency AI inference endpoints.',               'Global edge deployment for containers and apps. Used for low-latency backends (e.g., AI inference, real-time features) paired with Supabase for distributed apps. Preferred by technical founders who want more infrastructure control than Render or Railway.',                                                                                                                                  NULL,                                              false, false, true,  'saas',        'active', 2017, true),
  ('Backendless', 'backendless', 'Backendless', 'Backendless', 'https://backendless.com',         'Visual no-code backend with codeless API logic, user management, real-time database, and cloud hosting.',  'Visual no-code backend with codeless logic, visual schema designer, REST APIs, user management, and cloud hosting. For non-dev founders who need custom business logic beyond what Lovable or Bolt.new offer built-in, without writing a single line of backend code.',                                                                                                                         NULL,                                              false, false, true,  'saas',        'active', 2014, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Pricing: Group 10
-- ============================================================
INSERT INTO tool_pricing (tool_id, plan_name, pricing_model_id, free_tier, starting_price_monthly, pricing_model, est_cost_5_users, est_cost_20_users, enterprise_only, notes, source_url)
VALUES
  ((SELECT id FROM tools WHERE slug='supabase'),    'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  25.00, 'freemium',    25.00,  100.00, false, 'Free: 500MB DB, 2GB storage; Pro $25/mo; Team $599/mo; Enterprise custom',           'https://supabase.com/pricing'),
  ((SELECT id FROM tools WHERE slug='convex'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  25.00, 'freemium',    25.00,  100.00, false, 'Free tier (1M function calls/mo); Pro $25/mo; custom enterprise',                    'https://convex.dev/pricing'),
  ((SELECT id FROM tools WHERE slug='firebase'),    'default', (SELECT id FROM pricing_models WHERE slug='usage_based'),true,   0.00, 'usage_based',  5.00,   25.00, false, 'Spark free tier; Blaze pay-as-you-go — low traffic is essentially free',             'https://firebase.google.com/pricing'),
  ((SELECT id FROM tools WHERE slug='appwrite'),    'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  15.00, 'freemium',    15.00,   75.00, false, 'Free self-hosted forever; Cloud Free; Cloud Pro $15/mo; Scale $599/mo',              'https://appwrite.io/pricing'),
  ((SELECT id FROM tools WHERE slug='pocketbase'),  'default', (SELECT id FROM pricing_models WHERE slug='free'),       true,   0.00, 'free',         0.00,    0.00, false, 'Fully free and open-source; self-host on any VPS (~$5/mo hosting separately)',       'https://pocketbase.io'),
  ((SELECT id FROM tools WHERE slug='xano'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  85.00, 'freemium',    85.00,  340.00, false, 'Free trial; Launch $85/mo; Scale $140/mo; Business $250/mo',                         'https://xano.com/pricing'),
  ((SELECT id FROM tools WHERE slug='hasura'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  99.00, 'freemium',    99.00,  495.00, false, 'Free tier (self-hosted always free); Cloud Professional $99/mo; Enterprise custom',  'https://hasura.io/pricing'),
  ((SELECT id FROM tools WHERE slug='nhost'),       'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  25.00, 'freemium',    25.00,  100.00, false, 'Free tier; Pro $25/mo; Team $100/mo; self-hosted forever free',                      'https://nhost.io/pricing'),
  ((SELECT id FROM tools WHERE slug='render'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,   7.00, 'freemium',     7.00,   35.00, false, 'Free tier (750 hrs/mo); Starter $7/mo per service; scales by usage',                 'https://render.com/pricing'),
  ((SELECT id FROM tools WHERE slug='hosting-provider'),      'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  20.00, 'seat_based',  20.00,   80.00, false, 'Hobby free; Pro $20/user/mo; Enterprise custom',                                     'https://hosting-provider.com/pricing'),
  ((SELECT id FROM tools WHERE slug='neon'),        'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  19.00, 'freemium',    19.00,   95.00, false, 'Free tier (0.5 GB storage, 190 compute hrs/mo); Scale $19/mo; Business $69/mo',     'https://neon.tech/pricing'),
  ((SELECT id FROM tools WHERE slug='railway'),     'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,   5.00, 'freemium',     5.00,   20.00, false, 'Free $5 credit/mo; Hobby $5/mo; Pro $20/user/mo',                                    'https://railway.app/pricing'),
  ((SELECT id FROM tools WHERE slug='fly-io'),      'default', (SELECT id FROM pricing_models WHERE slug='usage_based'),true,   0.00, 'usage_based',  3.00,   15.00, false, 'Free allowance; pay-as-you-go ~$2-3/mo for small apps; scales by resources',        'https://fly.io/pricing'),
  ((SELECT id FROM tools WHERE slug='backendless'), 'default', (SELECT id FROM pricing_models WHERE slug='freemium'),   true,  25.00, 'freemium',    25.00,  100.00, false, 'Free tier; Cloud25 $25/mo; Cloud99 $99/mo; Cloud200 $199/mo',                        'https://backendless.com/pricing')
ON CONFLICT (tool_id, plan_name) DO NOTHING;

-- ============================================================
-- Metadata: Group 10
-- ============================================================
INSERT INTO tool_metadata (tool_id, categories, use_cases, target_personas, business_stages, api_available, self_hostable, enterprise_ready, input_types, output_types, integrations)
VALUES
  ((SELECT id FROM tools WHERE slug='supabase'),
   ARRAY['backend-infra'], ARRAY['database-backend','user-auth','real-time-app','ai-rag-backend','file-storage'],
   ARRAY['technical-founder','developer','solopreneur'], ARRAY['mvp','growth','scale'],
   true, true, true, ARRAY['sql','api','webhook','file'], ARRAY['json','webhook','file','realtime'], ARRAY['lovable','bolt-new','cursor','next-js','stripe','openai','drizzle','prisma']),

  ((SELECT id FROM tools WHERE slug='convex'),
   ARRAY['backend-infra'], ARRAY['real-time-app','full-stack-backend','typescript-app','collaborative-app'],
   ARRAY['technical-founder','developer'], ARRAY['mvp','growth','scale'],
   true, false, true, ARRAY['typescript','api'], ARRAY['json','realtime'], ARRAY['next-js','react','cursor','clerk','stripe']),

  ((SELECT id FROM tools WHERE slug='firebase'),
   ARRAY['backend-infra'], ARRAY['mobile-app-backend','rapid-prototype','real-time-app','user-auth'],
   ARRAY['technical-founder','developer','non-technical-founder'], ARRAY['mvp','growth','scale'],
   true, false, true, ARRAY['api','file','webhook'], ARRAY['json','realtime','file'], ARRAY['google','flutter','react-native','stripe','zapier']),

  ((SELECT id FROM tools WHERE slug='appwrite'),
   ARRAY['backend-infra'], ARRAY['self-hosted-backend','user-auth','database-backend','file-storage','privacy-first'],
   ARRAY['technical-founder','developer'], ARRAY['mvp','growth','scale'],
   true, true, true, ARRAY['api','file','webhook'], ARRAY['json','realtime','file'], ARRAY['cursor','react','next-js','flutter','stripe']),

  ((SELECT id FROM tools WHERE slug='pocketbase'),
   ARRAY['backend-infra'], ARRAY['side-project-backend','rapid-prototype','self-hosted-lightweight','embedded-backend'],
   ARRAY['technical-founder','developer','solopreneur'], ARRAY['validation','mvp'],
   false, true, false, ARRAY['api','file'], ARRAY['json','realtime','file'], ARRAY['react','svelte','htmx']),

  ((SELECT id FROM tools WHERE slug='xano'),
   ARRAY['backend-infra'], ARRAY['no-code-backend','api-builder','custom-business-logic','workflow-automation'],
   ARRAY['non-technical-founder','solopreneur'], ARRAY['mvp','growth'],
   true, false, true, ARRAY['api','webhook'], ARRAY['json','api'], ARRAY['bubble','webflow','flutterflow','zapier','stripe']),

  ((SELECT id FROM tools WHERE slug='hasura'),
   ARRAY['backend-infra'], ARRAY['graphql-api','database-layer','complex-queries','realtime-subscriptions'],
   ARRAY['technical-founder','developer'], ARRAY['growth','scale'],
   true, true, true, ARRAY['sql','api'], ARRAY['graphql','json','realtime'], ARRAY['supabase','postgres','neon','stripe','zapier']),

  ((SELECT id FROM tools WHERE slug='nhost'),
   ARRAY['backend-infra'], ARRAY['graphql-backend','user-auth','database-backend','file-storage'],
   ARRAY['technical-founder','developer'], ARRAY['mvp','growth'],
   true, true, true, ARRAY['api','file'], ARRAY['graphql','json','realtime','file'], ARRAY['react','next-js','hasura','stripe']),

  ((SELECT id FROM tools WHERE slug='render'),
   ARRAY['backend-infra'], ARRAY['app-deployment','backend-hosting','cron-jobs','microservices'],
   ARRAY['technical-founder','developer','solopreneur'], ARRAY['mvp','growth','scale'],
   true, false, true, ARRAY['code','api'], ARRAY['deployed-app','api'], ARRAY['github','gitlab','postgres','redis','stripe']),

  ((SELECT id FROM tools WHERE slug='hosting-provider'),
   ARRAY['backend-infra','website-builder'], ARRAY['frontend-hosting','serverless-functions','edge-deployment','next-js-deployment'],
   ARRAY['technical-founder','developer','solopreneur'], ARRAY['mvp','growth','scale'],
   true, false, true, ARRAY['code','api'], ARRAY['deployed-app','api'], ARRAY['github','supabase','neon','stripe','clerk','next-js','v0']),

  ((SELECT id FROM tools WHERE slug='neon'),
   ARRAY['backend-infra'], ARRAY['serverless-postgres','database-branching','ai-vector-storage','migration-safe-dev'],
   ARRAY['technical-founder','developer'], ARRAY['mvp','growth','scale'],
   true, false, true, ARRAY['sql'], ARRAY['database','vector'], ARRAY['hosting-provider','drizzle','prisma','cursor','next-js','langchain']),

  ((SELECT id FROM tools WHERE slug='railway'),
   ARRAY['backend-infra'], ARRAY['app-deployment','backend-hosting','database-hosting','zero-config-deploy'],
   ARRAY['technical-founder','developer','solopreneur'], ARRAY['mvp','growth'],
   true, false, false, ARRAY['code','api'], ARRAY['deployed-app','api'], ARRAY['github','postgres','redis','node-js','python']),

  ((SELECT id FROM tools WHERE slug='fly-io'),
   ARRAY['backend-infra'], ARRAY['global-edge-deployment','ai-inference','low-latency-api','container-hosting'],
   ARRAY['technical-founder','developer'], ARRAY['growth','scale'],
   true, false, true, ARRAY['docker','code'], ARRAY['deployed-app','api'], ARRAY['supabase','postgres','redis','github']),

  ((SELECT id FROM tools WHERE slug='backendless'),
   ARRAY['backend-infra'], ARRAY['no-code-backend','api-builder','user-management','real-time-app'],
   ARRAY['non-technical-founder','solopreneur'], ARRAY['mvp','growth'],
   true, false, false, ARRAY['api','webhook'], ARRAY['json','api','realtime'], ARRAY['bubble','webflow','zapier','stripe'])
ON CONFLICT (tool_id) DO NOTHING;

-- ============================================================
-- Links: Group 10
-- ============================================================
INSERT INTO tool_links (tool_id, link_type, url, is_primary)
VALUES
  ((SELECT id FROM tools WHERE slug='supabase'),    'website',    'https://supabase.com',                              true),
  ((SELECT id FROM tools WHERE slug='supabase'),    'github',     'https://github.com/supabase/supabase',              false),
  ((SELECT id FROM tools WHERE slug='supabase'),    'pricing',    'https://supabase.com/pricing',                      false),
  ((SELECT id FROM tools WHERE slug='supabase'),    'docs',       'https://supabase.com/docs',                         false),
  ((SELECT id FROM tools WHERE slug='convex'),      'website',    'https://convex.dev',                                true),
  ((SELECT id FROM tools WHERE slug='convex'),      'pricing',    'https://convex.dev/pricing',                        false),
  ((SELECT id FROM tools WHERE slug='convex'),      'docs',       'https://docs.convex.dev',                           false),
  ((SELECT id FROM tools WHERE slug='firebase'),    'website',    'https://firebase.google.com',                       true),
  ((SELECT id FROM tools WHERE slug='firebase'),    'pricing',    'https://firebase.google.com/pricing',               false),
  ((SELECT id FROM tools WHERE slug='firebase'),    'docs',       'https://firebase.google.com/docs',                  false),
  ((SELECT id FROM tools WHERE slug='appwrite'),    'website',    'https://appwrite.io',                               true),
  ((SELECT id FROM tools WHERE slug='appwrite'),    'github',     'https://github.com/appwrite/appwrite',              false),
  ((SELECT id FROM tools WHERE slug='appwrite'),    'pricing',    'https://appwrite.io/pricing',                       false),
  ((SELECT id FROM tools WHERE slug='pocketbase'),  'website',    'https://pocketbase.io',                             true),
  ((SELECT id FROM tools WHERE slug='pocketbase'),  'github',     'https://github.com/pocketbase/pocketbase',          false),
  ((SELECT id FROM tools WHERE slug='xano'),        'website',    'https://xano.com',                                  true),
  ((SELECT id FROM tools WHERE slug='xano'),        'pricing',    'https://xano.com/pricing',                          false),
  ((SELECT id FROM tools WHERE slug='hasura'),      'website',    'https://hasura.io',                                 true),
  ((SELECT id FROM tools WHERE slug='hasura'),      'github',     'https://github.com/hasura/graphql-engine',          false),
  ((SELECT id FROM tools WHERE slug='hasura'),      'pricing',    'https://hasura.io/pricing',                         false),
  ((SELECT id FROM tools WHERE slug='nhost'),       'website',    'https://nhost.io',                                  true),
  ((SELECT id FROM tools WHERE slug='nhost'),       'github',     'https://github.com/nhost/nhost',                    false),
  ((SELECT id FROM tools WHERE slug='render'),      'website',    'https://render.com',                                true),
  ((SELECT id FROM tools WHERE slug='render'),      'pricing',    'https://render.com/pricing',                        false),
  ((SELECT id FROM tools WHERE slug='hosting-provider'),      'website',    'https://hosting-provider.com',                                true),
  ((SELECT id FROM tools WHERE slug='hosting-provider'),      'pricing',    'https://hosting-provider.com/pricing',                        false),
  ((SELECT id FROM tools WHERE slug='hosting-provider'),      'docs',       'https://hosting-provider.com/docs',                           false),
  ((SELECT id FROM tools WHERE slug='neon'),        'website',    'https://neon.tech',                                 true),
  ((SELECT id FROM tools WHERE slug='neon'),        'pricing',    'https://neon.tech/pricing',                         false),
  ((SELECT id FROM tools WHERE slug='neon'),        'docs',       'https://neon.tech/docs',                            false),
  ((SELECT id FROM tools WHERE slug='railway'),     'website',    'https://railway.app',                               true),
  ((SELECT id FROM tools WHERE slug='railway'),     'pricing',    'https://railway.app/pricing',                       false),
  ((SELECT id FROM tools WHERE slug='fly-io'),      'website',    'https://fly.io',                                    true),
  ((SELECT id FROM tools WHERE slug='fly-io'),      'pricing',    'https://fly.io/pricing',                            false),
  ((SELECT id FROM tools WHERE slug='fly-io'),      'docs',       'https://fly.io/docs',                               false),
  ((SELECT id FROM tools WHERE slug='backendless'), 'website',    'https://backendless.com',                           true),
  ((SELECT id FROM tools WHERE slug='backendless'), 'pricing',    'https://backendless.com/pricing',                   false)
ON CONFLICT (tool_id, url) DO NOTHING;

-- ============================================================
-- Categories: Group 10
-- ============================================================
INSERT INTO tool_categories (tool_id, category_id, confidence, source, is_primary)
VALUES
  ((SELECT id FROM tools WHERE slug='supabase'),    (SELECT id FROM categories WHERE slug='backend-infra'),   1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='convex'),      (SELECT id FROM categories WHERE slug='backend-infra'),   1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='firebase'),    (SELECT id FROM categories WHERE slug='backend-infra'),   1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='appwrite'),    (SELECT id FROM categories WHERE slug='backend-infra'),   1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='pocketbase'),  (SELECT id FROM categories WHERE slug='backend-infra'),   1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='xano'),        (SELECT id FROM categories WHERE slug='backend-infra'),   1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='xano'),        (SELECT id FROM categories WHERE slug='productivity-automation'), 0.6000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='hasura'),      (SELECT id FROM categories WHERE slug='backend-infra'),   1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='nhost'),       (SELECT id FROM categories WHERE slug='backend-infra'),   1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='render'),      (SELECT id FROM categories WHERE slug='backend-infra'),   1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='hosting-provider'),      (SELECT id FROM categories WHERE slug='backend-infra'),   1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='hosting-provider'),      (SELECT id FROM categories WHERE slug='website-builder'),  0.6000, 'manual', false),
  ((SELECT id FROM tools WHERE slug='neon'),        (SELECT id FROM categories WHERE slug='backend-infra'),   1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='railway'),     (SELECT id FROM categories WHERE slug='backend-infra'),   1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='fly-io'),      (SELECT id FROM categories WHERE slug='backend-infra'),   1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='backendless'), (SELECT id FROM categories WHERE slug='backend-infra'),   1.0000, 'manual', true),
  ((SELECT id FROM tools WHERE slug='backendless'), (SELECT id FROM categories WHERE slug='website-builder'),  0.5000, 'manual', false)
ON CONFLICT (tool_id, category_id) DO NOTHING;

-- ============================================================
-- Capabilities: Group 10
-- ============================================================
INSERT INTO tool_capabilities (tool_id, capability_id, confidence, source, strength)
VALUES
  -- Supabase
  ((SELECT id FROM tools WHERE slug='supabase'), (SELECT id FROM capabilities WHERE slug='realtime_subscriptions'), 1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='supabase'), (SELECT id FROM capabilities WHERE slug='auth_management'),         1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='supabase'), (SELECT id FROM capabilities WHERE slug='edge_functions'),          1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='supabase'), (SELECT id FROM capabilities WHERE slug='vector_search'),           1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='supabase'), (SELECT id FROM capabilities WHERE slug='managed_postgres'),        1.0, 'manual', 'strong'),
  -- Convex
  ((SELECT id FROM tools WHERE slug='convex'),   (SELECT id FROM capabilities WHERE slug='realtime_subscriptions'), 1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='convex'),   (SELECT id FROM capabilities WHERE slug='auth_management'),         0.7, 'manual', 'moderate'),
  ((SELECT id FROM tools WHERE slug='convex'),   (SELECT id FROM capabilities WHERE slug='edge_functions'),          1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='convex'),   (SELECT id FROM capabilities WHERE slug='vector_search'),           0.8, 'manual', 'moderate'),
  -- Firebase
  ((SELECT id FROM tools WHERE slug='firebase'), (SELECT id FROM capabilities WHERE slug='realtime_subscriptions'), 1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='firebase'), (SELECT id FROM capabilities WHERE slug='auth_management'),         1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='firebase'), (SELECT id FROM capabilities WHERE slug='edge_functions'),          1.0, 'manual', 'strong'),
  -- Appwrite
  ((SELECT id FROM tools WHERE slug='appwrite'), (SELECT id FROM capabilities WHERE slug='realtime_subscriptions'), 1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='appwrite'), (SELECT id FROM capabilities WHERE slug='auth_management'),         1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='appwrite'), (SELECT id FROM capabilities WHERE slug='edge_functions'),          0.8, 'manual', 'moderate'),
  ((SELECT id FROM tools WHERE slug='appwrite'), (SELECT id FROM capabilities WHERE slug='managed_postgres'),        0.7, 'manual', 'moderate'),
  -- PocketBase
  ((SELECT id FROM tools WHERE slug='pocketbase'), (SELECT id FROM capabilities WHERE slug='realtime_subscriptions'), 0.8, 'manual', 'moderate'),
  ((SELECT id FROM tools WHERE slug='pocketbase'), (SELECT id FROM capabilities WHERE slug='auth_management'),         1.0, 'manual', 'strong'),
  -- Xano
  ((SELECT id FROM tools WHERE slug='xano'),     (SELECT id FROM capabilities WHERE slug='no_code_builder'),         1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='xano'),     (SELECT id FROM capabilities WHERE slug='auth_management'),         0.8, 'manual', 'moderate'),
  ((SELECT id FROM tools WHERE slug='xano'),     (SELECT id FROM capabilities WHERE slug='managed_postgres'),        0.8, 'manual', 'moderate'),
  -- Hasura
  ((SELECT id FROM tools WHERE slug='hasura'),   (SELECT id FROM capabilities WHERE slug='graphql_api'),             1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='hasura'),   (SELECT id FROM capabilities WHERE slug='realtime_subscriptions'), 1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='hasura'),   (SELECT id FROM capabilities WHERE slug='managed_postgres'),        0.7, 'manual', 'moderate'),
  -- Nhost
  ((SELECT id FROM tools WHERE slug='nhost'),    (SELECT id FROM capabilities WHERE slug='graphql_api'),             1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='nhost'),    (SELECT id FROM capabilities WHERE slug='realtime_subscriptions'), 1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='nhost'),    (SELECT id FROM capabilities WHERE slug='auth_management'),         1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='nhost'),    (SELECT id FROM capabilities WHERE slug='managed_postgres'),        1.0, 'manual', 'strong'),
  -- Render
  ((SELECT id FROM tools WHERE slug='render'),   (SELECT id FROM capabilities WHERE slug='deployment_platform'),    1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='render'),   (SELECT id FROM capabilities WHERE slug='managed_postgres'),        1.0, 'manual', 'strong'),
  -- Hosting Provider
  ((SELECT id FROM tools WHERE slug='hosting-provider'),   (SELECT id FROM capabilities WHERE slug='deployment_platform'),    1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='hosting-provider'),   (SELECT id FROM capabilities WHERE slug='edge_functions'),          1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='hosting-provider'),   (SELECT id FROM capabilities WHERE slug='managed_postgres'),        0.8, 'manual', 'moderate'),
  ((SELECT id FROM tools WHERE slug='hosting-provider'),   (SELECT id FROM capabilities WHERE slug='vector_search'),           0.6, 'manual', 'basic'),
  -- Neon
  ((SELECT id FROM tools WHERE slug='neon'),     (SELECT id FROM capabilities WHERE slug='managed_postgres'),        1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='neon'),     (SELECT id FROM capabilities WHERE slug='vector_search'),           1.0, 'manual', 'strong'),
  -- Railway
  ((SELECT id FROM tools WHERE slug='railway'),  (SELECT id FROM capabilities WHERE slug='deployment_platform'),    1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='railway'),  (SELECT id FROM capabilities WHERE slug='managed_postgres'),        1.0, 'manual', 'strong'),
  -- Fly.io
  ((SELECT id FROM tools WHERE slug='fly-io'),   (SELECT id FROM capabilities WHERE slug='deployment_platform'),    1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='fly-io'),   (SELECT id FROM capabilities WHERE slug='edge_functions'),          1.0, 'manual', 'strong'),
  -- Backendless
  ((SELECT id FROM tools WHERE slug='backendless'), (SELECT id FROM capabilities WHERE slug='no_code_builder'),      1.0, 'manual', 'strong'),
  ((SELECT id FROM tools WHERE slug='backendless'), (SELECT id FROM capabilities WHERE slug='realtime_subscriptions'), 0.8, 'manual', 'moderate'),
  ((SELECT id FROM tools WHERE slug='backendless'), (SELECT id FROM capabilities WHERE slug='auth_management'),       1.0, 'manual', 'strong')
ON CONFLICT (tool_id, capability_id) DO NOTHING;

-- ============================================================
-- Signals: Group 10
-- ============================================================
INSERT INTO tool_signals (tool_id, github_stars, producthunt_votes, popularity_score, trust_score, last_computed_at)
VALUES
  ((SELECT id FROM tools WHERE slug='supabase'),    75000, 12000, 9700, 0.96, now()),
  ((SELECT id FROM tools WHERE slug='convex'),      10500,  3200, 6800, 0.82, now()),
  ((SELECT id FROM tools WHERE slug='firebase'),        0, 15000, 9800, 0.95, now()),
  ((SELECT id FROM tools WHERE slug='appwrite'),    47000,  6500, 7600, 0.87, now()),
  ((SELECT id FROM tools WHERE slug='pocketbase'),  42000,  5800, 7400, 0.86, now()),
  ((SELECT id FROM tools WHERE slug='xano'),            0,  4200, 5800, 0.76, now()),
  ((SELECT id FROM tools WHERE slug='hasura'),      31000,  5600, 7200, 0.87, now()),
  ((SELECT id FROM tools WHERE slug='nhost'),        7000,  2100, 4600, 0.76, now()),
  ((SELECT id FROM tools WHERE slug='render'),          0,  5200, 7200, 0.86, now()),
  ((SELECT id FROM tools WHERE slug='hosting-provider'),          0, 11000, 9600, 0.96, now()),
  ((SELECT id FROM tools WHERE slug='neon'),        15000,  4100, 6800, 0.83, now()),
  ((SELECT id FROM tools WHERE slug='railway'),         0,  4800, 7100, 0.85, now()),
  ((SELECT id FROM tools WHERE slug='fly-io'),          0,  3200, 6600, 0.82, now()),
  ((SELECT id FROM tools WHERE slug='backendless'),     0,  1800, 4100, 0.71, now())
ON CONFLICT (tool_id) DO NOTHING;

-- ============================================================
-- Alternatives: Group 10
-- ============================================================
INSERT INTO tool_alternatives (tool_id, alternative_tool_id, alternative_type, cheaper, better_for_nontechnical, better_for_enterprise, reason)
VALUES
  -- Supabase vs others
  ((SELECT id FROM tools WHERE slug='supabase'),   (SELECT id FROM tools WHERE slug='firebase'),    'oss',        true,  true,  false, 'NoSQL/offline sync; better for mobile or deep Google ecosystem'),
  ((SELECT id FROM tools WHERE slug='supabase'),   (SELECT id FROM tools WHERE slug='convex'),      'easier',     false, false, false, 'Reactive real-time with TypeScript-first schema; zero-config'),
  ((SELECT id FROM tools WHERE slug='supabase'),   (SELECT id FROM tools WHERE slug='appwrite'),    'easier',     false, false, false, 'Fully self-hosted with no vendor lock-in; Docker-native'),
  ((SELECT id FROM tools WHERE slug='supabase'),   (SELECT id FROM tools WHERE slug='neon'),        'easier',     false, false, false, 'Pure serverless Postgres with branching for safe migrations'),
  -- Firebase vs others
  ((SELECT id FROM tools WHERE slug='firebase'),   (SELECT id FROM tools WHERE slug='supabase'),    'cheaper',    true,  false, false, 'Open-source, SQL, more predictable pricing, better for web apps'),
  ((SELECT id FROM tools WHERE slug='firebase'),   (SELECT id FROM tools WHERE slug='appwrite'),    'cheaper',    true,  false, false, 'Fully self-hosted, open-source, no usage-based cost surprises'),
  -- Appwrite vs others
  ((SELECT id FROM tools WHERE slug='appwrite'),   (SELECT id FROM tools WHERE slug='supabase'),    'cheaper',    true,  false, false, 'Managed, larger community, more integrations, Postgres SQL'),
  ((SELECT id FROM tools WHERE slug='appwrite'),   (SELECT id FROM tools WHERE slug='pocketbase'),  'easier',     false, false, false, 'Even simpler single-file self-host; SQLite-based for small projects'),
  -- PocketBase vs others
  ((SELECT id FROM tools WHERE slug='pocketbase'), (SELECT id FROM tools WHERE slug='appwrite'),    'cheaper',    true,  false, false, 'Full-featured Docker BaaS; more multi-language function support'),
  ((SELECT id FROM tools WHERE slug='pocketbase'), (SELECT id FROM tools WHERE slug='supabase'),    'cheaper',    true,  false, false, 'Cloud-managed Postgres with auth, storage, and vector support'),
  -- Xano vs others
  ((SELECT id FROM tools WHERE slug='xano'),       (SELECT id FROM tools WHERE slug='supabase'),    'easier',     false, false, true,  'Open-source Postgres backend; better for SQL-native developers'),
  ((SELECT id FROM tools WHERE slug='xano'),       (SELECT id FROM tools WHERE slug='backendless'), 'cheaper',    true,  true,  false, 'Simpler visual backend; lower cost for non-dev founders'),
  -- Hasura vs others
  ((SELECT id FROM tools WHERE slug='hasura'),     (SELECT id FROM tools WHERE slug='supabase'),    'easier',     false, false, false, 'Managed Postgres with auth, storage, and vector all-in-one'),
  ((SELECT id FROM tools WHERE slug='hasura'),     (SELECT id FROM tools WHERE slug='nhost'),       'cheaper',    true,  false, false, 'Managed Hasura + auth + storage bundled; better developer experience'),
  -- Hosting Provider vs others
  ((SELECT id FROM tools WHERE slug='hosting-provider'),     (SELECT id FROM tools WHERE slug='render'),      'cheaper',    true,  false, false, 'Lower cost, full-stack hosting including non-JS backends'),
  ((SELECT id FROM tools WHERE slug='hosting-provider'),     (SELECT id FROM tools WHERE slug='railway'),     'cheaper',    true,  false, false, 'Zero-config deploys with plugin ecosystem; very friendly UI'),
  ((SELECT id FROM tools WHERE slug='hosting-provider'),     (SELECT id FROM tools WHERE slug='fly-io'),      'cheaper',    true,  false, false, 'More control and global edge with container-level customization'),
  -- Render vs Railway/Fly
  ((SELECT id FROM tools WHERE slug='render'),     (SELECT id FROM tools WHERE slug='hosting-provider'),      'easier',     false, false, false, 'Best for Next.js and frontend-heavy apps; edge functions included'),
  ((SELECT id FROM tools WHERE slug='render'),     (SELECT id FROM tools WHERE slug='railway'),     'cheaper',    true,  false, false, 'Simpler pricing; slightly friendlier for first-time deployers'),
  ((SELECT id FROM tools WHERE slug='render'),     (SELECT id FROM tools WHERE slug='fly-io'),      'cheaper',    true,  false, false, 'More infrastructure control; true global edge; better for latency'),
  -- Neon vs Supabase
  ((SELECT id FROM tools WHERE slug='neon'),       (SELECT id FROM tools WHERE slug='supabase'),    'easier',     false, false, false, 'All-in-one: auth, storage, realtime, edge functions beyond just DB'),
  ((SELECT id FROM tools WHERE slug='neon'),       (SELECT id FROM tools WHERE slug='render'),      'easier',     false, false, false, 'Full hosting platform for backends and services beyond DB alone'),
  -- Railway vs others
  ((SELECT id FROM tools WHERE slug='railway'),    (SELECT id FROM tools WHERE slug='render'),      'easier',     false, false, false, 'Slightly more mature; larger plugin marketplace; more popular'),
  ((SELECT id FROM tools WHERE slug='railway'),    (SELECT id FROM tools WHERE slug='fly-io'),      'cheaper',    true,  false, false, 'More infrastructure control; true global edge deployment')
ON CONFLICT (tool_id, alternative_tool_id, alternative_type) DO NOTHING;
