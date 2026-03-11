-- Add config_key_summary to integration_knowledge_v2 for agent config hints
-- Migration: 004_integration_knowledge_v2_config_key_summary

ALTER TABLE integration_knowledge_v2
ADD COLUMN IF NOT EXISTS config_key_summary TEXT[];

COMMENT ON COLUMN integration_knowledge_v2.config_key_summary IS 'Top-level config field names derived from input_schema for LLM config suggestions';
