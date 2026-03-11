import dotenv from "dotenv";
dotenv.config();

import pg from "pg";

const { Pool } = pg;

function getConnectionConfig() {
  if (process.env.PGHOST) {
    return {
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || "5432", 10),
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "",
      database: process.env.PGDATABASE || "tinyai",
    };
  }
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }
  return {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "",
    database: "tinyai",
  };
}

let pool = null;

export function getPool() {
  if (!pool) {
    pool = new Pool(getConnectionConfig());
  }
  return pool;
}

export async function getOrCreateConversation(assetId, threadId = null, userId = null) {
  const p = getPool();
  const existing = await p.query(
    `SELECT id, inferred_macro_journey, created_at, updated_at
     FROM conversations_studio
     WHERE asset_id = $1 AND (($2::text IS NULL AND thread_id IS NULL) OR thread_id = $2)
     ORDER BY updated_at DESC LIMIT 1`,
    [assetId, threadId ?? null]
  );
  if (existing.rows.length > 0) {
    const r = existing.rows[0];
    return { id: r.id, inferredMacroJourney: r.inferred_macro_journey, created: false };
  }
  const insert = await p.query(
    `INSERT INTO conversations_studio (asset_id, thread_id, user_id)
     VALUES ($1, $2, $3)
     RETURNING id, inferred_macro_journey, created_at`,
    [assetId, threadId ?? null, userId ?? null]
  );
  const r = insert.rows[0];
  return { id: r.id, inferredMacroJourney: r.inferred_macro_journey, created: true };
}

export async function insertMessage(conversationId, role, content, metadata = null) {
  const p = getPool();
  const result = await p.query(
    `INSERT INTO messages_studio (conversation_id, role, content, metadata)
     VALUES ($1, $2, $3, $4)
     RETURNING id, role, content, metadata, created_at`,
    [conversationId, role, content, metadata ? JSON.stringify(metadata) : null]
  );
  const r = result.rows[0];
  return {
    id: String(r.id),
    role: r.role,
    content: r.content,
    metadata: r.metadata,
    created_at: r.created_at,
  };
}

export async function getMessages(conversationId, limit = 50) {
  const p = getPool();
  const result = await p.query(
    `SELECT id, role, content, metadata, created_at
     FROM messages_studio
     WHERE conversation_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [conversationId, limit]
  );
  return result.rows.map((r) => ({
    id: String(r.id),
    role: r.role,
    content: r.content,
    metadata: r.metadata,
    created_at: r.created_at,
  }));
}

export async function updateConversationMacroJourney(conversationId, text) {
  const p = getPool();
  await p.query(
    `UPDATE conversations_studio SET inferred_macro_journey = $1, updated_at = NOW() WHERE id = $2`,
    [text, conversationId]
  );
}

export async function recordDecisionMemory(assetId, suggestionSummary, suggestedNodes, outcome, userId = null) {
  const p = getPool();
  await p.query(
    `INSERT INTO decision_memory_studio (asset_id, user_id, suggestion_summary, suggested_nodes, outcome)
     VALUES ($1, $2, $3, $4, $5)`,
    [assetId, userId ?? null, suggestionSummary ?? null, suggestedNodes ? JSON.stringify(suggestedNodes) : null, outcome]
  );
}

export async function getDecisionMemory(assetId, limit = 20) {
  const p = getPool();
  const result = await p.query(
    `SELECT suggestion_summary, suggested_nodes, outcome, created_at
     FROM decision_memory_studio
     WHERE asset_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [assetId, limit]
  );
  return result.rows;
}

export async function runMigration() {
  const fs = await import("fs");
  const path = await import("path");
  const { fileURLToPath } = await import("url");
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const migrationsDir = path.join(__dirname, "migrations");
  const p = getPool();
  const files = ["002_studio_assistant_studio.sql", "003_integration_knowledge_v2.sql", "004_integration_knowledge_v2_config_key_summary.sql"];
  for (const file of files) {
    const sqlPath = path.join(migrationsDir, file);
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, "utf8");
      await p.query(sql);
    }
  }
}

// =============================================================================
// Extension Knowledge Search Functions
// =============================================================================

/**
 * Generate embedding vector for a text query using OpenAI
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector (1536 dimensions)
 */
export async function generateEmbedding(text) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set. Cannot generate embeddings.");
  }
  
  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  
  return response.data[0].embedding;
}

// =============================================================================
// Integration Knowledge v2 (LLM-enriched integration events)
// =============================================================================

/**
 * Get integration knowledge v2 by workflow node identifier
 * @param {string} identifier - Workflow node identifier (e.g. external/slack/action/send-message)
 * @returns {Promise<object|null>} - Row with workflow_node_identifier, title, input_schema, output_schema, etc. or null
 */
export async function getIntegrationKnowledgeV2ByNodeIdentifier(identifier) {
  const p = getPool();
  try {
    const result = await p.query(
      `SELECT
        id, integration_id, integration_slug, event_id, event_slug, kind,
        workflow_node_identifier, input_schema, output_schema, title, description,
        enriched_description, raw_integration_json, config_key_summary
       FROM integration_knowledge_v2
       WHERE workflow_node_identifier = $1
       LIMIT 1`,
      [identifier]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      integrationId: row.integration_id,
      integrationSlug: row.integration_slug,
      eventId: row.event_id,
      eventSlug: row.event_slug,
      kind: row.kind,
      workflowNodeIdentifier: row.workflow_node_identifier,
      inputSchema: row.input_schema,
      outputSchema: row.output_schema,
      title: row.title,
      description: row.description,
      enrichedDescription: row.enriched_description,
      rawIntegrationJson: row.raw_integration_json,
      configKeySummary: row.config_key_summary ?? null,
    };
  } catch (error) {
    console.error("Error getting integration knowledge v2 by identifier:", error);
    throw error;
  }
}

/**
 * Hybrid search (keyword + vector) on integration_knowledge_v2. Optionally resolve with LLM.
 * @param {string} query - Search query
 * @param {object} options - { limit, similarityThreshold, kind, integration_slug, resolveWithLLM }
 * @returns {Promise<Array>} - Results with workflow_node_identifier, title, input_schema, output_schema, similarity
 */
export async function searchIntegrationKnowledgeV2(query, options = {}) {
  const {
    limit = 5,
    similarityThreshold = 0.6,
    kind = null,
    integration_slug: integrationSlug = null,
    resolveWithLLM = false,
  } = options;

  const p = getPool();
  const kRrf = 60;

  // 1) Vector search
  let vectorRows = [];
  try {
    const queryEmbedding = await generateEmbedding(query);
    const embeddingStr = `[${queryEmbedding.join(",")}]`;
    const vConditions = ["primary_embedding IS NOT NULL", "1 - (primary_embedding <=> $1::vector) >= $2"];
    const vParams = [embeddingStr, similarityThreshold];
    if (kind) {
      vConditions.push(`kind = $${vParams.length + 1}`);
      vParams.push(kind);
    }
    if (integrationSlug) {
      vConditions.push(`integration_slug = $${vParams.length + 1}`);
      vParams.push(integrationSlug);
    }
    vParams.push(limit * 2);
    const vectorResult = await p.query(
      `SELECT id, integration_slug, event_slug, kind, workflow_node_identifier, title,
              input_schema, output_schema, enriched_description, created_at, config_key_summary,
              1 - (primary_embedding <=> $1::vector) AS similarity
       FROM integration_knowledge_v2
       WHERE ${vConditions.join(" AND ")}
       ORDER BY primary_embedding <=> $1::vector
       LIMIT $${vParams.length}`,
      vParams
    );
    vectorRows = vectorResult.rows;
  } catch (e) {
    console.error("Integration knowledge v2 vector search error:", e.message);
  }

  // 2) Keyword search (ILIKE on array text and enriched_description)
  const likeParam = `%${query.replace(/%/g, "\\%")}%`;
  let kConditions = [
    "keywords::text ILIKE $1",
    "aliases::text ILIKE $2",
    "intent_patterns::text ILIKE $3",
    "common_queries::text ILIKE $4",
    "(enriched_description IS NOT NULL AND enriched_description ILIKE $5)",
  ].join(" OR ");
  const kParams = [likeParam, likeParam, likeParam, likeParam, likeParam];
  if (kind) {
    kParams.push(kind);
    kConditions = `(${kConditions}) AND kind = $${kParams.length}`;
  } else {
    kConditions = `(${kConditions})`;
  }
  if (integrationSlug) {
    kParams.push(integrationSlug);
    kConditions += ` AND integration_slug = $${kParams.length}`;
  }
  kParams.push(limit * 2);
  let keywordRows = [];
  try {
    const keywordResult = await p.query(
      `SELECT id, integration_slug, event_slug, kind, workflow_node_identifier, title,
              input_schema, output_schema, enriched_description, created_at, config_key_summary
       FROM integration_knowledge_v2
       WHERE ${kConditions}
       LIMIT $${kParams.length}`,
      kParams
    );
    keywordRows = keywordResult.rows;
  } catch (e) {
    console.error("Integration knowledge v2 keyword search error:", e.message);
  }

  // 3) Reciprocal rank fusion
  const byId = new Map();
  vectorRows.forEach((row, rank) => {
    const rrf = 1 / (kRrf + rank + 1);
    const existing = byId.get(row.id);
    const score = (existing?.similarity ?? 0) + rrf;
    byId.set(row.id, { ...row, similarity: score });
  });
  keywordRows.forEach((row, rank) => {
    const rrf = 1 / (kRrf + rank + 1);
    const existing = byId.get(row.id);
    const score = (existing?.similarity ?? 0) + rrf;
    byId.set(row.id, { ...row, similarity: score });
  });

  let combined = Array.from(byId.values())
    .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
    .slice(0, resolveWithLLM && byId.size >= 3 ? Math.max(3, limit) : limit);

  // 4) Optional LLM resolution
  if (resolveWithLLM && combined.length >= 3 && process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const listText = combined
        .map((r, i) => `${i + 1}. ${r.title || r.workflow_node_identifier} (${r.workflow_node_identifier})`)
        .join("\n");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Query: "${query}"\n\nWhich single item (1-${combined.length}) best matches, or answer "none"? Reply with only the number or "none".\n\n${listText}`,
          },
        ],
        max_tokens: 10,
      });
      const text = (completion.choices[0]?.message?.content || "").trim().toLowerCase();
      if (text !== "none") {
        const num = parseInt(text, 10);
        if (num >= 1 && num <= combined.length) {
          const chosen = combined[num - 1];
          combined = [chosen];
        }
      } else {
        combined = [];
      }
    } catch (e) {
      console.error("Integration knowledge v2 LLM resolution error:", e.message);
    }
  }

  return combined.map((row) => ({
    id: row.id,
    sourceType: "integration_v2",
    extensionSlug: row.integration_slug,
    integrationSlug: row.integration_slug,
    eventSlug: row.event_slug,
    kind: row.kind,
    workflowNodeIdentifier: row.workflow_node_identifier,
    title: row.title,
    content: row.enriched_description,
    metadata: null,
    inputSchema: row.input_schema,
    outputSchema: row.output_schema,
    configKeySummary: row.config_key_summary ?? null,
    createdAt: row.created_at,
    similarity: typeof row.similarity === "number" ? row.similarity : null,
  }));
}
