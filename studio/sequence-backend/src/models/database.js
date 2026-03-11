import pg from "pg";
import env from "../config/env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sequences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        nodes JSONB NOT NULL DEFAULT '[]',
        links JSONB NOT NULL DEFAULT '[]',
        settings JSONB NOT NULL DEFAULT '{}',
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        version INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by VARCHAR(255),
        workspace_id VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS sequence_executions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
        sequence_version INTEGER NOT NULL,
        current_node_id VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        context JSONB NOT NULL DEFAULT '{}',
        trigger_data JSONB DEFAULT '{}',
        scheduled_resume_at TIMESTAMP WITH TIME ZONE,
        waiting_for_event VARCHAR(255),
        error_message TEXT,
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        triggered_by VARCHAR(255),
        workspace_id VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS sequence_execution_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        execution_id UUID NOT NULL REFERENCES sequence_executions(id) ON DELETE CASCADE,
        node_id VARCHAR(255) NOT NULL,
        node_type VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        input_context JSONB,
        output_context JSONB,
        error_message TEXT,
        duration_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS hitl_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        execution_id UUID NOT NULL REFERENCES sequence_executions(id) ON DELETE CASCADE,
        node_id VARCHAR(255) NOT NULL,
        task_type VARCHAR(100) NOT NULL DEFAULT 'approval',
        title VARCHAR(500),
        description TEXT,
        assigned_to VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        response_data JSONB,
        due_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_executions_status ON sequence_executions(status);
      CREATE INDEX IF NOT EXISTS idx_executions_scheduled_resume ON sequence_executions(scheduled_resume_at) WHERE status = 'waiting';
      CREATE INDEX IF NOT EXISTS idx_executions_sequence_id ON sequence_executions(sequence_id);
      CREATE INDEX IF NOT EXISTS idx_execution_logs_execution_id ON sequence_execution_logs(execution_id);
      CREATE INDEX IF NOT EXISTS idx_hitl_tasks_execution_id ON hitl_tasks(execution_id);
      CREATE INDEX IF NOT EXISTS idx_hitl_tasks_status ON hitl_tasks(status);
    `);
    
    console.log("Database tables created/verified successfully");
  } finally {
    client.release();
  }
}

export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > env.LOG_SLOW_QUERY_THRESHOLD_MS) {
    console.log("Slow query:", { text: text.substring(0, 100), duration, rows: result.rowCount });
  }
  return result;
}

export default { pool, query, initializeDatabase };
