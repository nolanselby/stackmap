-- RPC to update tool embedding (pgvector type not directly supported by Supabase JS client)
CREATE OR REPLACE FUNCTION update_tool_embedding(tool_id uuid, embedding vector(1536))
RETURNS void AS $$
  UPDATE tools SET embedding = $2 WHERE id = $1;
$$ LANGUAGE sql;
