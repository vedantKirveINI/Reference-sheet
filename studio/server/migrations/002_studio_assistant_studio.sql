-- Studio Canvas Assistant Schema
-- Migration: 002_studio_assistant_studio
-- Tables: conversations_studio, messages_studio, decision_memory_studio
-- All Studio-related tables use the _studio suffix.

-- =============================================================================
-- TABLE: conversations_studio
-- Purpose: One row per chat conversation (per asset, optional thread/user)
-- =============================================================================

CREATE TABLE IF NOT EXISTS conversations_studio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id VARCHAR(255) NOT NULL,
    thread_id VARCHAR(255),
    user_id VARCHAR(255),
    inferred_macro_journey TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_studio_asset_id ON conversations_studio(asset_id);
CREATE INDEX IF NOT EXISTS idx_conversations_studio_asset_thread ON conversations_studio(asset_id, thread_id);

COMMENT ON TABLE conversations_studio IS 'Canvas Assistant chat conversations per asset/thread/user';

-- =============================================================================
-- TABLE: messages_studio
-- Purpose: Chat messages belonging to a conversation
-- =============================================================================

CREATE TABLE IF NOT EXISTS messages_studio (
    id BIGSERIAL PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations_studio(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_studio_conversation_id ON messages_studio(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_studio_conversation_created ON messages_studio(conversation_id, created_at);

COMMENT ON TABLE messages_studio IS 'Canvas Assistant chat messages';

-- =============================================================================
-- TABLE: decision_memory_studio
-- Purpose: Accepted/declined/dismissed suggestions per asset (optional)
-- =============================================================================

CREATE TABLE IF NOT EXISTS decision_memory_studio (
    id BIGSERIAL PRIMARY KEY,
    asset_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    suggestion_summary TEXT,
    suggested_nodes JSONB,
    outcome VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decision_memory_studio_asset_id ON decision_memory_studio(asset_id);

COMMENT ON TABLE decision_memory_studio IS 'Canvas Assistant suggestion accept/decline/dismiss history';

-- =============================================================================
-- TRIGGER: conversations_studio updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_conversations_studio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_conversations_studio_updated_at ON conversations_studio;
CREATE TRIGGER trigger_conversations_studio_updated_at
    BEFORE UPDATE ON conversations_studio
    FOR EACH ROW EXECUTE PROCEDURE update_conversations_studio_updated_at();
