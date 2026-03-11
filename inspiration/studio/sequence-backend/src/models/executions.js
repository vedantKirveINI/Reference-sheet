import { query } from "./database.js";

export async function createExecution(data) {
  const { sequenceId, sequenceVersion, triggerData, triggeredBy, workspaceId } = data;
  
  const result = await query(
    `INSERT INTO sequence_executions 
     (sequence_id, sequence_version, trigger_data, triggered_by, workspace_id, status, started_at)
     VALUES ($1, $2, $3, $4, $5, 'running', NOW())
     RETURNING *`,
    [sequenceId, sequenceVersion, JSON.stringify(triggerData || {}), triggeredBy, workspaceId]
  );
  
  return result.rows[0];
}

export async function getExecutionById(id) {
  const result = await query(
    `SELECT e.*, s.name as sequence_name, s.nodes, s.links
     FROM sequence_executions e
     JOIN sequences s ON e.sequence_id = s.id
     WHERE e.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function getExecutionsBySequence(sequenceId) {
  const result = await query(
    `SELECT * FROM sequence_executions 
     WHERE sequence_id = $1 
     ORDER BY created_at DESC 
     LIMIT 100`,
    [sequenceId]
  );
  return result.rows;
}

export async function updateExecution(id, data) {
  const { currentNodeId, status, context, scheduledResumeAt, waitingForEvent, errorMessage } = data;
  
  const setClauses = [];
  const values = [id];
  let paramCount = 1;
  
  if (currentNodeId !== undefined) {
    paramCount++;
    setClauses.push(`current_node_id = $${paramCount}`);
    values.push(currentNodeId);
  }
  if (status !== undefined) {
    paramCount++;
    setClauses.push(`status = $${paramCount}`);
    values.push(status);
  }
  if (context !== undefined) {
    paramCount++;
    setClauses.push(`context = $${paramCount}`);
    values.push(JSON.stringify(context));
  }
  if (scheduledResumeAt !== undefined) {
    paramCount++;
    setClauses.push(`scheduled_resume_at = $${paramCount}`);
    values.push(scheduledResumeAt);
  }
  if (waitingForEvent !== undefined) {
    paramCount++;
    setClauses.push(`waiting_for_event = $${paramCount}`);
    values.push(waitingForEvent);
  }
  if (errorMessage !== undefined) {
    paramCount++;
    setClauses.push(`error_message = $${paramCount}`);
    values.push(errorMessage);
  }
  
  setClauses.push(`updated_at = NOW()`);
  
  if (status === 'completed' || status === 'failed' || status === 'cancelled') {
    setClauses.push(`completed_at = NOW()`);
  }
  
  const result = await query(
    `UPDATE sequence_executions SET ${setClauses.join(", ")} WHERE id = $1 RETURNING *`,
    values
  );
  
  return result.rows[0];
}

export async function getWaitingExecutions() {
  const result = await query(
    `SELECT e.*, s.nodes, s.links
     FROM sequence_executions e
     JOIN sequences s ON e.sequence_id = s.id
     WHERE e.status = 'waiting' 
     AND e.scheduled_resume_at IS NOT NULL 
     AND e.scheduled_resume_at <= NOW()
     LIMIT 100`
  );
  return result.rows;
}

export async function getExecutionsByStatus(status) {
  const result = await query(
    `SELECT * FROM sequence_executions WHERE status = $1 ORDER BY created_at DESC LIMIT 100`,
    [status]
  );
  return result.rows;
}

export async function addExecutionLog(data) {
  const { executionId, nodeId, nodeType, status, inputContext, outputContext, errorMessage, durationMs } = data;
  
  const result = await query(
    `INSERT INTO sequence_execution_logs 
     (execution_id, node_id, node_type, status, input_context, output_context, error_message, duration_ms)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [executionId, nodeId, nodeType, status, JSON.stringify(inputContext), JSON.stringify(outputContext), errorMessage, durationMs]
  );
  
  return result.rows[0];
}

export async function getExecutionLogs(executionId) {
  const result = await query(
    `SELECT * FROM sequence_execution_logs WHERE execution_id = $1 ORDER BY created_at ASC`,
    [executionId]
  );
  return result.rows;
}
