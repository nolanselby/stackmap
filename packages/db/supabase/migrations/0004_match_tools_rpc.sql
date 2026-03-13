-- RPC for pgvector similarity search
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
    1 - (tools.embedding <=> query_embedding) AS similarity
  FROM tools
  WHERE
    tools.status_active = true
    AND tools.embedding IS NOT NULL
    AND 1 - (tools.embedding <=> query_embedding) > min_score
  ORDER BY tools.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
