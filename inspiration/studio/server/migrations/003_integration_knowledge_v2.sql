-- Integration Knowledge Base v2
-- Migration: 003_integration_knowledge_v2
-- Table: integration_knowledge_v2 (LLM-enriched integration events for search)

CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- TABLE: integration_knowledge_v2
-- Purpose: LLM-enriched integration event metadata for hybrid (keyword + vector) search
-- =============================================================================

CREATE TABLE IF NOT EXISTS integration_knowledge_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id VARCHAR(255) NOT NULL,
    integration_slug VARCHAR(255) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    event_slug VARCHAR(255) NOT NULL,
    kind VARCHAR(32) NOT NULL CHECK (kind IN ('trigger', 'action')),
    workflow_node_identifier VARCHAR(512) NOT NULL,
    raw_integration_json JSONB,
    input_schema JSONB,
    output_schema JSONB,
    title TEXT,
    description TEXT,
    annotation TEXT,
    enriched_description TEXT,
    use_cases TEXT[],
    keywords TEXT[],
    aliases TEXT[],
    category_tags TEXT[],
    intent_patterns TEXT[],
    common_queries TEXT[],
    primary_embedding vector(1536),
    keyword_embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    enrichment_model VARCHAR(128),
    enrichment_version VARCHAR(64),
    UNIQUE (integration_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_integration_knowledge_v2_integration_slug ON integration_knowledge_v2(integration_slug);
CREATE INDEX IF NOT EXISTS idx_integration_knowledge_v2_kind ON integration_knowledge_v2(kind);
CREATE INDEX IF NOT EXISTS idx_integration_knowledge_v2_workflow_node_identifier ON integration_knowledge_v2(workflow_node_identifier);
CREATE INDEX IF NOT EXISTS idx_integration_knowledge_v2_keywords_gin ON integration_knowledge_v2 USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_integration_knowledge_v2_category_tags_gin ON integration_knowledge_v2 USING GIN (category_tags);

-- ivfflat for approximate nearest neighbor on primary_embedding (cosine distance)
-- lists = sqrt(rows) is a common heuristic; use 100 for initial empty/small table
CREATE INDEX IF NOT EXISTS idx_integration_knowledge_v2_primary_embedding_ivfflat
ON integration_knowledge_v2
USING ivfflat (primary_embedding vector_cosine_ops)
WITH (lists = 100);

COMMENT ON TABLE integration_knowledge_v2 IS 'LLM-enriched integration events for canvas-assistant hybrid search';

-- =============================================================================
-- TRIGGER: integration_knowledge_v2 updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_integration_knowledge_v2_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_integration_knowledge_v2_updated_at ON integration_knowledge_v2;
CREATE TRIGGER trigger_integration_knowledge_v2_updated_at
    BEFORE UPDATE ON integration_knowledge_v2
    FOR EACH ROW EXECUTE PROCEDURE update_integration_knowledge_v2_updated_at();
