/**
 * One-time migration for canvas model: normalize UI-only types to canonical types
 * so backend and UI use a single type per node kind (LOG, HITL, AGENT_COMPOSER).
 *
 * - LOG_V2 -> LOG
 * - HITL_V2 -> HITL
 * - AGENT_COMPOSER_V2, AGENT_COMPOSER_V3 -> AGENT_COMPOSER
 *
 * Mutates the model object in place. Call before loadModelJSON / fromJson.
 */
const LOG_V2 = "LOG_V2";
const HITL_V2 = "HITL_V2";
const LOG = "LOG";
const HITL = "HITL";
const AGENT_COMPOSER_V2 = "AGENT_COMPOSER_V2";
const AGENT_COMPOSER_V3 = "AGENT_COMPOSER_V3";
const AGENT_COMPOSER = "AGENT_COMPOSER";

export function migrateCanvasModelTypes(model) {
  if (!model || !Array.isArray(model.nodeDataArray)) return model;
  for (const node of model.nodeDataArray) {
    if (!node || typeof node.type !== "string") continue;
    if (node.type === LOG_V2) node.type = LOG;
    else if (node.type === HITL_V2) node.type = HITL;
    else if (node.type === AGENT_COMPOSER_V2 || node.type === AGENT_COMPOSER_V3) node.type = AGENT_COMPOSER;
  }
  return model;
}

/**
 * Accepts model JSON as string or object. Returns migrated object (or string if input was string).
 */
export function migrateCanvasModelTypesFromJSON(json) {
  if (json == null) return json;
  const isString = typeof json === "string";
  const model = isString ? JSON.parse(json) : json;
  migrateCanvasModelTypes(model);
  return isString ? JSON.stringify(model) : model;
}
