-- =============================================================================
-- Migration: 0008_recommendation_weights.sql
-- Date: 2026-03-18
-- Description: Adds recommendation_weight to tools table for prioritizing
--   household-name tools in retrieval and ranking. Updates the vector search
--   RPC to factor in weight alongside similarity.
-- =============================================================================

-- Add recommendation_weight column (0.0 to 1.0, default 0.5)
ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS recommendation_weight numeric(3,2) NOT NULL DEFAULT 0.50;

-- Index for fast ordering by weight
CREATE INDEX IF NOT EXISTS tools_recommendation_weight_idx
  ON tools (recommendation_weight DESC);

-- Update vector search RPC to blend similarity with recommendation_weight
CREATE OR REPLACE FUNCTION match_tools_by_embedding(
  query_embedding vector(1536),
  match_count int DEFAULT 100,
  min_score float DEFAULT 0.5
)
RETURNS TABLE (id uuid, similarity float)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tools.id,
    (0.7 * (1 - (tools.embedding <=> query_embedding)) +
     0.3 * tools.recommendation_weight::float) AS similarity
  FROM tools
  WHERE
    tools.status_active = true
    AND tools.embedding IS NOT NULL
    AND 1 - (tools.embedding <=> query_embedding) > min_score
  ORDER BY
    (0.7 * (1 - (tools.embedding <=> query_embedding)) +
     0.3 * tools.recommendation_weight::float) DESC
  LIMIT match_count;
END;
$$;
