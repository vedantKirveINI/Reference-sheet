-- This is an empty migration.

ALTER TABLE field 
ALTER COLUMN node_id TYPE JSONB 
USING to_jsonb(ARRAY[node_id]);