/**
 * DB node types that have go_data.record and need output_schema for the formula bar variable list.
 * When a node is configured but not yet saved/run, it may have go_data without output_schema,
 * so getVariableList does not include it. We derive a minimal schema from record so the node
 * appears in the formula bar without requiring the user to close/reopen the node.
 */
const DB_NODE_TYPES_WITH_RECORD = [
  "CREATE_RECORD_V2",
  "UPDATE_RECORD_V2",
  "DELETE_RECORD_V2",
  "DB_FIND_ALL_V2",
  "DB_FIND_ONE_V2",
  "CREATE_SHEET_RECORD_V2",
  "UPDATE_SHEET_RECORD_V2",
  "DELETE_SHEET_RECORD_V2",
  "FIND_ALL_SHEET_RECORD_V2",
  "FIND_ONE_SHEET_RECORD_V2",
];

function hasOutputSchema(node) {
  const g = node?.go_data || {};
  const t = node?.tf_data || {};
  const schema = g.output_schema ?? t.output_schema ?? g.schema ?? t.schema;
  return Array.isArray(schema) && schema.length > 0;
}

function buildSchemaFromRecord(record) {
  if (!Array.isArray(record) || record.length === 0) return null;
  return record.map((item) => ({
    key: item.key ?? item.name,
    label: item.key ?? item.name ?? item.label,
    type: item.type ?? "string",
  }));
}

/**
 * Enriches the canvas model so DB nodes that have go_data.record but no output_schema
 * get a synthetic schema. This allows getVariableList to include them in the formula bar
 * variable list without the user having to close and reopen the node.
 *
 * @param {string|object} canvasData - getModelJSON() result (string or parsed object)
 * @returns {string|object} - Same type as input, with nodeDataArray nodes enriched
 */
export function enrichCanvasModelForVariableList(canvasData) {
  if (canvasData == null) return canvasData;
  const isString = typeof canvasData === "string";
  let model = isString ? null : canvasData;
  try {
    if (isString) {
      model = JSON.parse(canvasData);
    }
  } catch {
    return canvasData;
  }
  const nodeDataArray = model?.nodeDataArray;
  if (!Array.isArray(nodeDataArray)) return isString ? canvasData : canvasData;

  let changed = false;
  const enrichedArray = nodeDataArray.map((node) => {
    const type = node?.type || "";
    if (!DB_NODE_TYPES_WITH_RECORD.includes(type)) return node;
    if (hasOutputSchema(node)) return node;

    const goData = node.go_data || {};
    const record = goData.record;
    const schema = buildSchemaFromRecord(record);
    if (!schema || schema.length === 0) return node;

    changed = true;
    return {
      ...node,
      go_data: {
        ...goData,
        output_schema: schema,
        schema,
      },
    };
  });

  if (!changed) return isString ? canvasData : canvasData;

  const out = { ...model, nodeDataArray: enrichedArray };
  return isString ? JSON.stringify(out) : out;
}
