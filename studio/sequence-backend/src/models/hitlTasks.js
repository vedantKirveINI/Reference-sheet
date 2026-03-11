import { query } from "./database.js";

export async function createHitlTask(data) {
  const { executionId, nodeId, taskType, title, description, assignedTo, dueAt } = data;
  
  const result = await query(
    `INSERT INTO hitl_tasks 
     (execution_id, node_id, task_type, title, description, assigned_to, due_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [executionId, nodeId, taskType || 'approval', title, description, assignedTo, dueAt]
  );
  
  return result.rows[0];
}

export async function getHitlTaskById(id) {
  const result = await query(
    `SELECT * FROM hitl_tasks WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function getHitlTaskByExecution(executionId, nodeId) {
  const result = await query(
    `SELECT * FROM hitl_tasks WHERE execution_id = $1 AND node_id = $2`,
    [executionId, nodeId]
  );
  return result.rows[0] || null;
}

export async function getPendingHitlTasks(assignedTo = null) {
  let queryText = `SELECT t.*, e.sequence_id FROM hitl_tasks t 
                   JOIN sequence_executions e ON t.execution_id = e.id 
                   WHERE t.status = 'pending'`;
  const params = [];
  
  if (assignedTo) {
    params.push(assignedTo);
    queryText += ` AND t.assigned_to = $1`;
  }
  
  queryText += ` ORDER BY t.created_at ASC`;
  
  const result = await query(queryText, params);
  return result.rows;
}

export async function completeHitlTask(id, responseData) {
  const result = await query(
    `UPDATE hitl_tasks 
     SET status = 'completed', 
         response_data = $2, 
         completed_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, JSON.stringify(responseData || {})]
  );
  
  return result.rows[0];
}

export async function cancelHitlTask(id) {
  const result = await query(
    `UPDATE hitl_tasks 
     SET status = 'cancelled', 
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  
  return result.rows[0];
}
