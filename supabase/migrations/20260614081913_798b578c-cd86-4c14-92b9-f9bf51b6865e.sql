CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE public.rule_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.rule_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.rule_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INT NOT NULL,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX rule_chunks_embedding_idx ON public.rule_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX rule_chunks_document_id_idx ON public.rule_chunks(document_id);

GRANT ALL ON public.rule_documents TO service_role;
GRANT ALL ON public.rule_chunks TO service_role;

ALTER TABLE public.rule_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_chunks ENABLE ROW LEVEL SECURITY;

-- No policies: tables are fully locked to anon/authenticated.
-- All access happens through server functions using the service role.

CREATE OR REPLACE FUNCTION public.match_rule_chunks(
  query_embedding vector(1536),
  match_count int DEFAULT 6
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.document_id,
    c.content,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.rule_chunks c
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;