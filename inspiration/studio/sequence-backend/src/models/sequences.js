import { query } from "./database.js";

export async function createSequence(data) {
  const { name, description, nodes, links, settings, workspaceId, createdBy } = data;
  
  const result = await query(
    `INSERT INTO sequences (name, description, nodes, links, settings, workspace_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name, description, JSON.stringify(nodes || []), JSON.stringify(links || []), JSON.stringify(settings || {}), workspaceId, createdBy]
  );
  
  return result.rows[0];
}

export async function getSequenceById(id) {
  const result = await query(
    `SELECT * FROM sequences WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function getSequencesByWorkspace(workspaceId) {
  const result = await query(
    `SELECT * FROM sequences WHERE workspace_id = $1 ORDER BY updated_at DESC`,
    [workspaceId]
  );
  return result.rows;
}

export async function updateSequence(id, data) {
  const { name, description, nodes, links, settings, status } = data;
  
  const result = await query(
    `UPDATE sequences 
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         nodes = COALESCE($4, nodes),
         links = COALESCE($5, links),
         settings = COALESCE($6, settings),
         status = COALESCE($7, status),
         version = version + 1,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, name, description, nodes ? JSON.stringify(nodes) : null, links ? JSON.stringify(links) : null, settings ? JSON.stringify(settings) : null, status]
  );
  
  return result.rows[0];
}

export async function deleteSequence(id) {
  const result = await query(
    `DELETE FROM sequences WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rowCount > 0;
}

export async function publishSequence(id) {
  const result = await query(
    `UPDATE sequences SET status = 'published', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}
