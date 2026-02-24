-- ============================================================================
-- Migration: Convert AI tables from integer IDs to text (cuid) and clean up
-- ============================================================================
-- This migration handles:
-- 1. Dropping unused columns from the field table
-- 2. Converting AI-related tables from integer IDs to text (cuid) IDs
-- 3. Dropping old sequences that are no longer needed

-- ============================================================================
-- Section 1: Drop unused columns from field table
-- ============================================================================
ALTER TABLE field DROP COLUMN IF EXISTS "order";
ALTER TABLE field DROP COLUMN IF EXISTS enrichment;
ALTER TABLE field DROP COLUMN IF EXISTS has_error;

-- ============================================================================
-- Section 2: Convert AI tables from integer IDs to text (cuid) IDs
-- ============================================================================

-- --- Subsection 2a: Convert ai_conversations table ---
-- Drop dependent foreign keys first (must be done before changing parent table)
ALTER TABLE ai_messages DROP CONSTRAINT IF EXISTS ai_messages_conversation_id_fkey;
ALTER TABLE ai_approved_contexts DROP CONSTRAINT IF EXISTS ai_approved_contexts_conversation_id_fkey;

-- Convert ai_conversations.id from integer to text
ALTER TABLE ai_conversations DROP CONSTRAINT IF EXISTS ai_conversations_pkey;
ALTER TABLE ai_conversations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE ai_conversations ALTER COLUMN id SET DATA TYPE TEXT USING id::TEXT;
ALTER TABLE ai_conversations ADD PRIMARY KEY (id);

-- --- Subsection 2b: Convert ai_messages table ---
-- Convert ai_messages.id and conversation_id
ALTER TABLE ai_messages DROP CONSTRAINT IF EXISTS ai_messages_pkey;
ALTER TABLE ai_messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE ai_messages ALTER COLUMN id SET DATA TYPE TEXT USING id::TEXT;
ALTER TABLE ai_messages ADD PRIMARY KEY (id);
ALTER TABLE ai_messages ALTER COLUMN conversation_id SET DATA TYPE TEXT USING conversation_id::TEXT;

-- --- Subsection 2c: Convert ai_approved_contexts table ---
-- Convert ai_approved_contexts.id and conversation_id
ALTER TABLE ai_approved_contexts DROP CONSTRAINT IF EXISTS ai_approved_contexts_pkey;
ALTER TABLE ai_approved_contexts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE ai_approved_contexts ALTER COLUMN id SET DATA TYPE TEXT USING id::TEXT;
ALTER TABLE ai_approved_contexts ADD PRIMARY KEY (id);
ALTER TABLE ai_approved_contexts ALTER COLUMN conversation_id SET DATA TYPE TEXT USING conversation_id::TEXT;

-- --- Subsection 2d: Re-establish foreign keys and constraints for AI tables ---
-- Re-add foreign keys
ALTER TABLE ai_messages ADD CONSTRAINT ai_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE ai_approved_contexts ADD CONSTRAINT ai_approved_contexts_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE ON UPDATE NO ACTION;

-- Drop the orphaned index/constraint if it exists, then re-add
DROP INDEX IF EXISTS ai_approved_contexts_conversation_id_base_id_table_id_key;
ALTER TABLE ai_approved_contexts ADD CONSTRAINT ai_approved_contexts_conversation_id_base_id_table_id_key UNIQUE (conversation_id, base_id, table_id);

-- --- Subsection 2e: Convert __comments table ---
-- Drop FK on parent_id first (it depends on the PK)
ALTER TABLE __comments DROP CONSTRAINT IF EXISTS __comments_parent_id_fkey;
-- Now drop PK
ALTER TABLE __comments DROP CONSTRAINT IF EXISTS __comments_pkey CASCADE;
ALTER TABLE __comments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE __comments ALTER COLUMN id SET DATA TYPE TEXT USING id::TEXT;
ALTER TABLE __comments ALTER COLUMN parent_id SET DATA TYPE TEXT USING parent_id::TEXT;
ALTER TABLE __comments ADD PRIMARY KEY (id);
-- Re-add FK on parent_id
ALTER TABLE __comments ADD CONSTRAINT __comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES __comments(id) ON DELETE CASCADE ON UPDATE NO ACTION;

-- ============================================================================
-- Section 3: Drop old sequences that are no longer needed
-- ============================================================================
DROP SEQUENCE IF EXISTS ai_conversations_id_seq CASCADE;
DROP SEQUENCE IF EXISTS ai_messages_id_seq CASCADE;
DROP SEQUENCE IF EXISTS ai_approved_contexts_id_seq CASCADE;
DROP SEQUENCE IF EXISTS __comments_id_seq CASCADE;
