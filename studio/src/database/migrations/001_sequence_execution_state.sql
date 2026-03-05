-- TinySequence Execution State Schema
-- Migration: 001_sequence_execution_state
-- Created: 2026-01-29
-- Updated: 2026-01-29 (fixes from architect review)
-- 
-- This schema stores execution state for TinySequence (stateful, long-running sequences).
-- Sequence definitions remain in MongoDB; this stores runtime execution data only.
--
-- Design parameters:
-- - Execution context: 1MB max
-- - Retention: 30 days active, then archived
-- - Concurrency: One ACTIVE instance per sequence at a time (historical allowed)
-- - Nested loops: Supported

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE execution_status AS ENUM (
    'pending',      -- Created but not started
    'running',      -- Currently executing nodes
    'paused',       -- Waiting (Wait node, HITL, etc.)
    'completed',    -- Successfully finished
    'failed',       -- Terminated with error
    'exited'        -- Early exit via Exit node
);

CREATE TYPE node_execution_status AS ENUM (
    'running',      -- Currently executing
    'success',      -- Completed successfully
    'failed',       -- Failed with error
    'skipped'       -- Skipped (conditional branch not taken)
);

CREATE TYPE scheduled_job_type AS ENUM (
    'wait_resume',  -- Resume after Wait node duration
    'hitl_resume'   -- Resume after human completes task
);

CREATE TYPE scheduled_job_status AS ENUM (
    'pending',      -- Waiting to be picked up
    'picked_up',    -- Worker has claimed this job
    'completed',    -- Successfully processed
    'cancelled'     -- Cancelled (execution exited/failed)
);

CREATE TYPE loop_status AS ENUM (
    'active',       -- Currently iterating
    'completed'     -- All iterations done
);

-- =============================================================================
-- TABLE: sequence_executions
-- Purpose: Main execution record for a sequence run
-- =============================================================================

CREATE TABLE sequence_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference to sequence definition (stored in MongoDB)
    sequence_id VARCHAR(64) NOT NULL,
    workspace_id VARCHAR(64) NOT NULL,
    
    -- Execution state
    status execution_status NOT NULL DEFAULT 'pending',
    current_node_id VARCHAR(64),
    
    -- Accumulated context/variables (max 1MB enforced by app layer)
    context JSONB NOT NULL DEFAULT '{}',
    
    -- How the sequence was triggered
    trigger_type VARCHAR(32) NOT NULL,
    trigger_payload JSONB DEFAULT '{}',
    
    -- Timestamps
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE sequence_executions IS 'Main execution record for TinySequence runs';
COMMENT ON COLUMN sequence_executions.sequence_id IS 'Reference to sequence definition in MongoDB';
COMMENT ON COLUMN sequence_executions.context IS 'Accumulated variables/data during execution (max 1MB)';

-- =============================================================================
-- TABLE: node_execution_logs
-- Purpose: Audit trail of every node execution step
-- =============================================================================

CREATE TABLE node_execution_logs (
    id BIGSERIAL PRIMARY KEY,
    
    -- Parent execution
    execution_id UUID NOT NULL REFERENCES sequence_executions(id) ON DELETE CASCADE,
    
    -- Node identification
    node_id VARCHAR(64) NOT NULL,
    node_type VARCHAR(32) NOT NULL,
    node_name VARCHAR(256),
    
    -- Execution details
    status node_execution_status NOT NULL DEFAULT 'running',
    input JSONB,
    output JSONB,
    
    -- Error tracking
    error_message TEXT,
    error_details JSONB,
    
    -- Timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    
    -- Loop context (if executing within a loop)
    loop_state_id UUID,
    loop_iteration INTEGER,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE node_execution_logs IS 'Audit trail of every node execution in a sequence';
COMMENT ON COLUMN node_execution_logs.duration_ms IS 'Execution duration in milliseconds';
COMMENT ON COLUMN node_execution_logs.loop_state_id IS 'Reference to loop state if node is inside a loop';

-- =============================================================================
-- TABLE: scheduled_jobs
-- Purpose: Jobs scheduled for future execution (Wait resume, HITL resume)
-- =============================================================================

CREATE TABLE scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent execution
    execution_id UUID NOT NULL REFERENCES sequence_executions(id) ON DELETE CASCADE,
    
    -- Which node scheduled this
    node_id VARCHAR(64) NOT NULL,
    
    -- Job type and status
    job_type scheduled_job_type NOT NULL,
    status scheduled_job_status NOT NULL DEFAULT 'pending',
    
    -- When to execute
    scheduled_at TIMESTAMPTZ NOT NULL,
    
    -- Worker lock tracking
    picked_up_at TIMESTAMPTZ,
    worker_id VARCHAR(128),
    completed_at TIMESTAMPTZ,
    
    -- Retry handling
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    last_error TEXT,
    
    -- Additional data (e.g., HITL task details)
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE scheduled_jobs IS 'Jobs scheduled for future execution (Wait/HITL resume)';
COMMENT ON COLUMN scheduled_jobs.scheduled_at IS 'When the job should be picked up and executed';
COMMENT ON COLUMN scheduled_jobs.worker_id IS 'Identifier of worker that picked up this job';

-- =============================================================================
-- TABLE: loop_states
-- Purpose: Track loop iteration state (supports nested loops)
-- =============================================================================

CREATE TABLE loop_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent execution
    execution_id UUID NOT NULL REFERENCES sequence_executions(id) ON DELETE CASCADE,
    
    -- Which loop node this tracks
    loop_node_id VARCHAR(64) NOT NULL,
    
    -- For nested loops, reference to parent loop (SET NULL on delete to prevent cascade)
    parent_loop_state_id UUID REFERENCES loop_states(id) ON DELETE SET NULL,
    
    -- Iteration tracking
    status loop_status NOT NULL DEFAULT 'active',
    current_index INTEGER NOT NULL DEFAULT 0,
    total_items INTEGER NOT NULL,
    
    -- Data source info
    items_source VARCHAR(256),
    items_data JSONB,
    
    -- Current iteration item
    current_item JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE loop_states IS 'Track loop iteration state (supports nested loops)';
COMMENT ON COLUMN loop_states.parent_loop_state_id IS 'For nested loops, reference to parent loop state (SET NULL on delete)';
COMMENT ON COLUMN loop_states.items_data IS 'Cached items array for small datasets, null for large (fetched on demand)';

-- =============================================================================
-- FOREIGN KEY: node_execution_logs.loop_state_id -> loop_states
-- Added after loop_states table creation for referential integrity
-- =============================================================================

ALTER TABLE node_execution_logs 
    ADD CONSTRAINT fk_node_logs_loop_state 
    FOREIGN KEY (loop_state_id) 
    REFERENCES loop_states(id) 
    ON DELETE SET NULL;

-- =============================================================================
-- INDEXES
-- =============================================================================

-- sequence_executions indexes
CREATE INDEX idx_executions_sequence_workspace 
    ON sequence_executions(sequence_id, workspace_id);
CREATE INDEX idx_executions_status 
    ON sequence_executions(status) WHERE status IN ('running', 'paused', 'pending');
CREATE INDEX idx_executions_workspace_status 
    ON sequence_executions(workspace_id, status);
CREATE INDEX idx_executions_created_at 
    ON sequence_executions(created_at);

-- Single-instance enforcement: Only ONE active execution per sequence+workspace
-- (allows multiple historical/completed executions)
CREATE UNIQUE INDEX idx_unique_active_execution 
    ON sequence_executions(sequence_id, workspace_id) 
    WHERE status IN ('pending', 'running', 'paused');

-- node_execution_logs indexes
CREATE INDEX idx_node_logs_execution_id 
    ON node_execution_logs(execution_id);
CREATE INDEX idx_node_logs_execution_node 
    ON node_execution_logs(execution_id, node_id);
CREATE INDEX idx_node_logs_created_at 
    ON node_execution_logs(created_at);

-- scheduled_jobs indexes (critical for scheduler performance)
CREATE INDEX idx_scheduled_jobs_pickup 
    ON scheduled_jobs(scheduled_at, status) 
    WHERE status = 'pending';
CREATE INDEX idx_scheduled_jobs_execution 
    ON scheduled_jobs(execution_id);
CREATE INDEX idx_scheduled_jobs_status 
    ON scheduled_jobs(status) WHERE status IN ('pending', 'picked_up');

-- loop_states indexes
CREATE INDEX idx_loop_states_execution 
    ON loop_states(execution_id);
CREATE INDEX idx_loop_states_execution_node 
    ON loop_states(execution_id, loop_node_id);
CREATE INDEX idx_loop_states_parent 
    ON loop_states(parent_loop_state_id) WHERE parent_loop_state_id IS NOT NULL;

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sequence_executions_updated_at
    BEFORE UPDATE ON sequence_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_jobs_updated_at
    BEFORE UPDATE ON scheduled_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loop_states_updated_at
    BEFORE UPDATE ON loop_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to pick up next due scheduled job (with row-level locking)
-- Only picks up jobs where the execution is still paused (active)
CREATE OR REPLACE FUNCTION pick_up_scheduled_job(p_worker_id VARCHAR(128))
RETURNS TABLE (
    job_id UUID,
    execution_id UUID,
    node_id VARCHAR(64),
    job_type scheduled_job_type,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH next_job AS (
        SELECT j.id
        FROM scheduled_jobs j
        INNER JOIN sequence_executions e ON e.id = j.execution_id
        WHERE j.status = 'pending'
          AND j.scheduled_at <= NOW()
          AND j.retry_count < j.max_retries
          AND e.status = 'paused'  -- Only pick up jobs for paused executions
        ORDER BY j.scheduled_at ASC
        LIMIT 1
        FOR UPDATE OF j SKIP LOCKED
    )
    UPDATE scheduled_jobs
    SET status = 'picked_up',
        picked_up_at = NOW(),
        worker_id = p_worker_id
    FROM next_job
    WHERE scheduled_jobs.id = next_job.id
    RETURNING 
        scheduled_jobs.id,
        scheduled_jobs.execution_id,
        scheduled_jobs.node_id,
        scheduled_jobs.job_type,
        scheduled_jobs.metadata;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION pick_up_scheduled_job IS 
    'Atomically pick up the next due scheduled job with row-level locking. Only picks up jobs where the execution is still paused.';

-- Function to check if sequence has active execution
CREATE OR REPLACE FUNCTION has_active_execution(p_sequence_id VARCHAR(64), p_workspace_id VARCHAR(64))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM sequence_executions
        WHERE sequence_id = p_sequence_id
          AND workspace_id = p_workspace_id
          AND status IN ('pending', 'running', 'paused')
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION has_active_execution IS 
    'Check if a sequence already has an active execution (for single-instance enforcement)';

-- =============================================================================
-- ARCHIVAL SUPPORT
-- =============================================================================

-- View for identifying executions ready for archival (older than 30 days)
CREATE VIEW executions_ready_for_archive AS
SELECT 
    e.id,
    e.sequence_id,
    e.workspace_id,
    e.status,
    e.created_at,
    e.completed_at,
    (SELECT COUNT(*) FROM node_execution_logs WHERE execution_id = e.id) as log_count
FROM sequence_executions e
WHERE e.status IN ('completed', 'failed', 'exited')
  AND e.completed_at < NOW() - INTERVAL '30 days';

COMMENT ON VIEW executions_ready_for_archive IS 
    'Executions older than 30 days that are candidates for archival';
