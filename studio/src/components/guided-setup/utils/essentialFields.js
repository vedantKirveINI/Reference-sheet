import {
  NODE_FRIENDLY_NAMES,
  NODE_GUIDANCE,
  DEFAULT_GUIDANCE,
  SKIP_NODE_TYPES,
} from "../constants";

export function getFriendlyName(nodeType) {
  if (!nodeType) return "Step";
  return NODE_FRIENDLY_NAMES[nodeType] || prettifyType(nodeType);
}

function prettifyType(type) {
  return type
    .replace(/_/g, " ")
    .replace(/V\d+$/i, "")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function getGuidanceText(nodeType) {
  if (!nodeType) return DEFAULT_GUIDANCE;
  return NODE_GUIDANCE[nodeType] || DEFAULT_GUIDANCE;
}

export function shouldSkipNode(nodeData) {
  if (!nodeData) return true;
  const type = nodeData.subType || nodeData.type || "";
  if (SKIP_NODE_TYPES.has(type)) return true;
  if (nodeData.viewSpot) return true;
  return false;
}

export function getNodeIcon(nodeData) {
  return nodeData?._src || nodeData?.icon || nodeData?.iconUrl || null;
}

export function buildNodeQueue(nodeKeys, diagram) {
  if (!diagram || !nodeKeys?.length) return [];

  const queue = [];
  for (const key of nodeKeys) {
    const node = diagram.findNodeForKey(key);
    if (!node?.data) continue;
    if (shouldSkipNode(node.data)) continue;

    const nodeType = node.data.subType || node.data.type;
    const config = node.data.config || node.data.go_data?.flow?.config || {};
    const description = node.data.description || "";

    queue.push({
      key: node.data.key,
      type: nodeType,
      name: node.data.name || node.data.text || description || getFriendlyName(nodeType),
      friendlyName: getFriendlyName(nodeType),
      guidance: description || getGuidanceText(nodeType),
      icon: getNodeIcon(node.data),
      config,
      description,
      nodeData: node.data,
    });
  }

  return queue;
}

const CONFIG_FRIENDLY_LABELS = {
  scheduleType: "Schedule",
  time: "Time",
  timezone: "Timezone",
  url: "URL",
  method: "Method",
  subject: "Subject",
  body: "Body",
  channel: "Channel",
  message: "Message",
  prompt: "Prompt",
  expression: "Expression",
  sheetEvent: "Sheet Event",
  interval: "Interval",
  persona: "Persona",
  query: "Query",
  outputFormat: "Output Format",
  to: "To",
  from: "From",
  template: "Template",
  webhookUrl: "Webhook URL",
};

export function getConfigDisplayItems(config) {
  if (!config || typeof config !== "object") return [];

  const items = [];
  for (const [key, value] of Object.entries(config)) {
    if (value === null || value === undefined || value === "") continue;
    const label = CONFIG_FRIENDLY_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    let displayValue;
    if (typeof value === "object") {
      if (value.value && value.unit) {
        displayValue = `${value.value} ${value.unit}`;
      } else {
        displayValue = JSON.stringify(value);
      }
    } else {
      displayValue = String(value);
    }
    items.push({ key, label, value: displayValue });
  }
  return items;
}

export function getEssentialFieldCount(nodeType) {
  const FIELD_COUNTS = {
    TRIGGER_SETUP: 1,
    TRIGGER_SETUP_V3: 1,
    HTTP: 2,
    Integration: 2,
    TRANSFORMER_V3: 1,
    FORMULA_FX: 1,
    IFELSE_V2: 1,
    CREATE_RECORD_V2: 2,
    UPDATE_RECORD_V2: 2,
    DELETE_RECORD_V2: 1,
    DB_FIND_ALL_V2: 1,
    DB_FIND_ONE_V2: 1,
    EXECUTE_QUERY_V2: 1,
    GPT: 2,
    GPT_RESEARCHER: 1,
    GPT_WRITER: 1,
    GPT_ANALYZER: 1,
    SELF_EMAIL: 2,
    DELAY_V2: 1,
    Delay: 1,
  };
  return FIELD_COUNTS[nodeType] || 1;
}

export function estimateSetupTime(nodeQueue) {
  if (!nodeQueue?.length) return "< 1 min";
  const totalFields = nodeQueue.reduce(
    (sum, node) => sum + getEssentialFieldCount(node.type),
    0
  );
  const minutes = Math.max(1, Math.ceil(totalFields * 0.4));
  if (minutes === 1) return "about 1 minute";
  return `about ${minutes} minutes`;
}
