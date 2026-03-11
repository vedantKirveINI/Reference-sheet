/**
 * Enrichment script for integration_knowledge_v2.
 * Fetches integrations via Asset getEvents and Canvas getPublishedByAsset,
 * enriches each event with OpenAI, generates embeddings, and upserts into integration_knowledge_v2.
 *
 * Usage: node server/scripts/enrich-integrations.js [--workspace-id=ID]
 * Env: OUTE_SERVER (or REACT_APP_OUTE_SERVER), STUDIO_SERVER (or REACT_APP_STUDIO_SERVER),
 *      INTEGRATION_KNOWLEDGE_TOKEN (or ACCESS_TOKEN), WORKSPACE_ID, OPENAI_API_KEY,
 *      DATABASE_URL (or PGHOST/PGUSER/...), ENRICHMENT_MODEL (optional, default gpt-4o-mini).
 */

import dotenv from "dotenv";
dotenv.config();

import Asset from "oute-services-asset-sdk";
import Canvas from "oute-services-canvas-sdk";
import OpenAI from "openai";
import { getPool, generateEmbedding } from "../db-studio.js";
import enrichIntegrationEventPrompt, {
  getEnrichIntegrationEventSystemPrompt,
  ENRICHMENT_OUTPUT_KEYS,
} from "../canvas-assistant/prompts/templates/enrich-integration-event.js";

const OUTE_SERVER = process.env.OUTE_SERVER || process.env.REACT_APP_OUTE_SERVER || "http://localhost:3101";
const STUDIO_SERVER = process.env.STUDIO_SERVER || process.env.REACT_APP_STUDIO_SERVER || "http://localhost:3003";
const TOKEN = process.env.INTEGRATION_KNOWLEDGE_TOKEN || process.env.ACCESS_TOKEN;
const ENRICHMENT_MODEL = process.env.ENRICHMENT_MODEL || "gpt-4o-mini";
const ENRICHMENT_VERSION = "1";
const CONCURRENCY = Math.max(1, parseInt(process.env.ENRICH_CONCURRENCY || "10", 10));

async function runWithConcurrency(items, concurrency, fn) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      const item = items[i];
      if (!item) continue;
      try {
        const result = await fn(item, i);
        results.push(result);
      } catch (e) {
        results.push({ status: "failed", error: e.message });
      }
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function parseWorkspaceId() {
  const arg = process.argv.find((a) => a.startsWith("--workspace-id="));
  if (arg) return arg.slice("--workspace-id=".length);
  return process.env.WORKSPACE_ID || "default";
}

function slugify(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function deriveKind(annotation) {
  if (!annotation) return "action";
  const a = String(annotation).toUpperCase();
  if (a.includes("ACTION") || a.includes("ACTION_TYPE")) return "action";
  return "trigger";
}

function schemaSummary(obj) {
  if (!obj || typeof obj !== "object") return "";
  if (Array.isArray(obj)) return `[${obj.map((i) => (typeof i === "object" ? JSON.stringify(i).slice(0, 80) : String(i))).join(", ")}]`;
  const keys = Object.keys(obj).slice(0, 15);
  return keys.map((k) => `${k}: ${typeof obj[k]}`).join(", ");
}

function inputsOutputsToMinimalSchema(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return items.map((item) => {
    const name = item.key ?? item.name ?? item.id ?? item.field ?? "field";
    const type = item.type ?? (item.schema?.type) ?? "string";
    return { name, type };
  });
}

function extractSchemaFromPublished(published) {
  let input_schema = null;
  let output_schema = null;
  try {
    const flow = published?.flow || published?.allNodes;
    const task_graph = published?.task_graph;

    let nodes = [];
    if (flow && Array.isArray(flow)) {
      nodes = flow;
    } else if (flow && typeof flow === "object" && !Array.isArray(flow)) {
      nodes = Object.values(flow);
    }
    if (nodes.length === 0 && task_graph?.nodes) {
      nodes = Array.isArray(task_graph.nodes) ? task_graph.nodes : Object.values(task_graph.nodes || {});
    }

    let primary = null;
    if (nodes.length > 0) {
      const startNode = nodes.find((n) => n?.node_marker === "START" || n?.tf_data?.node_marker === "START");
      primary = startNode ?? nodes.find((n) => n?.config || n?.tf_data) ?? nodes[0];
      const data = primary?.tf_data ?? primary;
      if (data?.config?.input_schema) input_schema = data.config.input_schema;
      if (data?.config?.output_schema) output_schema = data.config.output_schema;
      if (!input_schema && (data?.inputs || data?.input_schema)) {
        input_schema = Array.isArray(data.inputs) ? inputsOutputsToMinimalSchema(data.inputs) : data.input_schema;
      }
      if (!output_schema && (data?.outputs || data?.output_schema)) {
        output_schema = Array.isArray(data.outputs) ? inputsOutputsToMinimalSchema(data.outputs) : data.output_schema;
      }
    }

    if (!input_schema && task_graph?.nodes?.[0]) {
      const n0 = task_graph.nodes[0]?.tf_data ?? task_graph.nodes[0];
      if (n0?.config?.input_schema) input_schema = n0.config.input_schema;
      else if (Array.isArray(n0?.inputs)) input_schema = inputsOutputsToMinimalSchema(n0.inputs);
    }
    if (!output_schema && task_graph?.nodes?.[0]) {
      const n0 = task_graph.nodes[0]?.tf_data ?? task_graph.nodes[0];
      if (n0?.config?.output_schema) output_schema = n0.config.output_schema;
      else if (Array.isArray(n0?.outputs)) output_schema = inputsOutputsToMinimalSchema(n0.outputs);
    }
  } catch (_) {}
  return { input_schema, output_schema };
}

function deriveConfigKeySummary(input_schema) {
  if (!input_schema) return null;
  try {
    if (Array.isArray(input_schema)) {
      const keys = input_schema.map((item) => item?.name ?? item?.key ?? item?.field).filter(Boolean);
      return keys.length ? keys : null;
    }
    if (input_schema.properties && typeof input_schema.properties === "object") {
      return Object.keys(input_schema.properties);
    }
    if (typeof input_schema === "object") {
      return Object.keys(input_schema).slice(0, 30);
    }
  } catch (_) {}
  return null;
}

async function enrichWithOpenAI(openai, payload) {
  const userContent = enrichIntegrationEventPrompt({
    title: payload.title,
    description: payload.description,
    annotation: payload.annotation,
    integration_slug: payload.integration_slug,
    event_slug: payload.event_slug,
    kind: payload.kind,
    input_schema_summary: schemaSummary(payload.input_schema),
    output_schema_summary: schemaSummary(payload.output_schema),
    raw_snippet: payload.raw_snippet ? JSON.stringify(payload.raw_snippet).slice(0, 500) : "",
  });
  const completion = await openai.chat.completions.create({
    model: ENRICHMENT_MODEL,
    messages: [
      { role: "system", content: getEnrichIntegrationEventSystemPrompt() },
      { role: "user", content: userContent },
    ],
    max_tokens: 1024,
  });
  const text = completion.choices[0]?.message?.content?.trim() || "{}";
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}") + 1;
    if (start >= 0 && end > start) parsed = JSON.parse(text.slice(start, end));
    else parsed = {};
  }
  const result = {};
  for (const key of ENRICHMENT_OUTPUT_KEYS) {
    const val = parsed[key];
    if (key === "enriched_description") result[key] = typeof val === "string" ? val : null;
    else if (Array.isArray(val)) result[key] = val.map((v) => (v != null ? String(v) : "")).filter(Boolean);
    else result[key] = key === "enriched_description" ? null : [];
  }
  return result;
}

async function main() {
  if (!TOKEN) {
    console.error(
      "Set INTEGRATION_KNOWLEDGE_TOKEN (or ACCESS_TOKEN) in the environment. You can get a token by opening the app, opening the Command Palette once, and copying the token from the browser console (see README or code comment)."
    );
    process.exit(1);
  }

  const workspace_id = parseWorkspaceId();
  const asset = new Asset({ url: OUTE_SERVER, token: TOKEN });
  const canvas = new Canvas({ url: STUDIO_SERVER, token: TOKEN });

  let eventsResponse;
  try {
    eventsResponse = await asset.getEvents({ workspace_id });
  } catch (e) {
    console.error("getEvents failed (token invalid or expired?):", e.message);
    process.exit(1);
  }

  if (eventsResponse?.status !== "success" || !eventsResponse?.result?.integrations) {
    console.error("getEvents did not return success or integrations.");
    process.exit(1);
  }

  const integrations = eventsResponse.result.integrations;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const p = getPool();

  const flatItems = [];
  for (const integration of integrations) {
    const integration_slug = slugify(integration.name) || "integration";
    for (const event of integration.events || []) {
      flatItems.push({ integration, integration_slug, event });
    }
  }

  console.log(`Enriching ${flatItems.length} events with concurrency ${CONCURRENCY}...`);

  async function processOne({ integration, integration_slug, event }) {
    const integration_id = integration._id;
    const event_id = event._id;
    const event_slug = slugify(event.name) || "event";
    const kind = deriveKind(event.annotation);
    const workflow_node_identifier = `external/${integration_slug}/${kind}/${event_slug}`;

    let published;
    try {
      const res = await canvas.getPublishedByAsset({
        asset_id: event_id,
        include_project_variable: true,
      });
      published = res?.result ?? res;
    } catch (e) {
      return { status: "skipped", workflow_node_identifier, reason: "getPublishedByAsset" };
    }

    if (!published?.flow && !published?.allNodes) {
      return { status: "skipped", workflow_node_identifier, reason: "no flow" };
    }

    const { input_schema, output_schema } = extractSchemaFromPublished(published);
    const config_key_summary = deriveConfigKeySummary(input_schema);
    const raw_integration_json = published;
    const title = event.name || "";
    const description = event.name || (event.annotation ? String(event.annotation).slice(0, 200) : "");
    const annotation = event.annotation ? String(event.annotation) : null;

    let enriched;
    try {
      enriched = await enrichWithOpenAI(openai, {
        title,
        description,
        annotation,
        integration_slug,
        event_slug,
        kind,
        input_schema,
        output_schema,
        raw_snippet: published,
      });
    } catch (e) {
      return { status: "failed", workflow_node_identifier, reason: "enrich" };
    }

    const searchableText = [
      enriched.enriched_description,
      (enriched.keywords || []).join(" "),
      (enriched.intent_patterns || []).join(" "),
      (enriched.common_queries || []).join(" "),
    ]
      .filter(Boolean)
      .join(" ");
    const keywordText = (enriched.keywords || []).join(" ");

    const [primary_embedding, keyword_embedding] = await Promise.all([
      searchableText ? generateEmbedding(searchableText) : Promise.resolve(null),
      keywordText ? generateEmbedding(keywordText) : Promise.resolve(null),
    ]);
    const primaryStr = primary_embedding ? `[${primary_embedding.join(",")}]` : null;
    const keywordStr = keyword_embedding ? `[${keyword_embedding.join(",")}]` : null;

    try {
      await p.query(
        `INSERT INTO integration_knowledge_v2 (
          integration_id, integration_slug, event_id, event_slug, kind, workflow_node_identifier,
          raw_integration_json, input_schema, output_schema, title, description, annotation,
          enriched_description, use_cases, keywords, aliases, category_tags, intent_patterns, common_queries,
          primary_embedding, keyword_embedding, enrichment_model, enrichment_version, config_key_summary
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20::vector, $21::vector, $22, $23, $24
        )
        ON CONFLICT (integration_id, event_id) DO UPDATE SET
          integration_slug = EXCLUDED.integration_slug,
          event_slug = EXCLUDED.event_slug,
          kind = EXCLUDED.kind,
          workflow_node_identifier = EXCLUDED.workflow_node_identifier,
          raw_integration_json = EXCLUDED.raw_integration_json,
          input_schema = EXCLUDED.input_schema,
          output_schema = EXCLUDED.output_schema,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          annotation = EXCLUDED.annotation,
          enriched_description = EXCLUDED.enriched_description,
          use_cases = EXCLUDED.use_cases,
          keywords = EXCLUDED.keywords,
          aliases = EXCLUDED.aliases,
          category_tags = EXCLUDED.category_tags,
          intent_patterns = EXCLUDED.intent_patterns,
          common_queries = EXCLUDED.common_queries,
          primary_embedding = EXCLUDED.primary_embedding,
          keyword_embedding = EXCLUDED.keyword_embedding,
          enrichment_model = EXCLUDED.enrichment_model,
          enrichment_version = EXCLUDED.enrichment_version,
          config_key_summary = EXCLUDED.config_key_summary,
          updated_at = NOW()`,
        [
          integration_id,
          integration_slug,
          event_id,
          event_slug,
          kind,
          workflow_node_identifier,
          JSON.stringify(raw_integration_json),
          input_schema ? JSON.stringify(input_schema) : null,
          output_schema ? JSON.stringify(output_schema) : null,
          title,
          description,
          annotation,
          enriched.enriched_description,
          enriched.use_cases || [],
          enriched.keywords || [],
          enriched.aliases || [],
          enriched.category_tags || [],
          enriched.intent_patterns || [],
          enriched.common_queries || [],
          primaryStr,
          keywordStr,
          ENRICHMENT_MODEL,
          ENRICHMENT_VERSION,
          config_key_summary ?? null,
        ]
      );
      return { status: "processed", workflow_node_identifier };
    } catch (e) {
      return { status: "failed", workflow_node_identifier, reason: "upsert" };
    }
  }

  const results = await runWithConcurrency(flatItems, CONCURRENCY, processOne);

  const processed = results.filter((r) => r.status === "processed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  console.log(`Done. Processed: ${processed}, Failed: ${failed}, Skipped: ${skipped}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
