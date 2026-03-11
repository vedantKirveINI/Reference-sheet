import { NODE_TEMPLATES } from "../components/canvas/templates";
import { QuestionType } from "../module/constants";

export const SINGLE_INSTANCE_NODES = {
  WELCOME: QuestionType.WELCOME,
  INPUT_SETUP: "Input Setup",
  CUSTOM_WEBHOOK: "CUSTOM_WEBHOOK",
  WEBHOOK_V2: "WEBHOOK_V2",
  TIME_BASED_TRIGGER: "TIME_BASED_TRIGGER",
  TIME_BASED_TRIGGER_V2: "TIME_BASED_TRIGGER_V2",
  SHEET_TRIGGER: "SHEET_TRIGGER",
  SHEET_TRIGGER_V2: "SHEET_TRIGGER_V2",
  SHEET_DATE_FIELD_TRIGGER: "SHEET_DATE_FIELD_TRIGGER",
  FORM_TRIGGER: "FORM_TRIGGER",
  // ENDING: QuestionType.ENDING,
};

export const TRIGGER_NODE_RULES = {
  INPUT_SETUP: "Input Setup",
  CUSTOM_WEBHOOK: "CUSTOM_WEBHOOK",
  WEBHOOK_V2: "WEBHOOK_V2",
  TIME_BASED_TRIGGER: "TIME_BASED_TRIGGER",
  TIME_BASED_TRIGGER_V2: "TIME_BASED_TRIGGER_V2",
  SHEET_TRIGGER: "SHEET_TRIGGER",
  SHEET_TRIGGER_V2: "SHEET_TRIGGER_V2",
  SHEET_DATE_FIELD_TRIGGER: "SHEET_DATE_FIELD_TRIGGER",
  FORM_TRIGGER: "FORM_TRIGGER",
};

export const TRIGGER_SETUP_TYPE = "TRIGGER_SETUP";
export const TRIGGER_SETUP_NODE = "TRIGGER_SETUP_NODE";

export const isTriggerNodeType = (node) => {
  if (!node) return false;

  const nodeData = node?.data || node;
  const nodeType = nodeData?.type || "";
  const nodeSubType = nodeData?.subType || "";
  const metaTriggerType =
    nodeData?.metadata?.triggerType || nodeData?.meta?.triggerType || "";
  const template = nodeData?.template || "";

  const triggerValues = Object.values(TRIGGER_NODE_RULES);

  if (triggerValues.includes(nodeType)) return true;
  if (triggerValues.includes(nodeSubType)) return true;
  if (triggerValues.includes(metaTriggerType)) return true;

  if (nodeType === TRIGGER_SETUP_TYPE || nodeSubType === TRIGGER_SETUP_TYPE)
    return true;
  if (nodeType === TRIGGER_SETUP_NODE || nodeSubType === TRIGGER_SETUP_NODE)
    return true;

  if (
    template === NODE_TEMPLATES.TRIGGER_SETUP ||
    template === "TRIGGER_SETUP" ||
    template === "TRIGGER"
  )
    return true;

  if (nodeType === "SEQUENCE_TRIGGER" || template === "sequenceTrigger") return true;

  return false;
};

export const getTriggerType = (node) => {
  if (!node) return null;

  const nodeData = node?.data || node;
  const nodeType = nodeData?.type || "";
  const nodeSubType = nodeData?.subType || "";
  const metaTriggerType =
    nodeData?.metadata?.triggerType || nodeData?.meta?.triggerType || "";
  const template = nodeData?.template || "";

  const triggerValues = Object.values(TRIGGER_NODE_RULES);

  if (triggerValues.includes(nodeType)) return nodeType;
  if (triggerValues.includes(nodeSubType)) return nodeSubType;
  if (triggerValues.includes(metaTriggerType)) return metaTriggerType;
  if (nodeType === TRIGGER_SETUP_TYPE || nodeSubType === TRIGGER_SETUP_TYPE)
    return TRIGGER_SETUP_TYPE;
  if (nodeType === TRIGGER_SETUP_NODE || nodeSubType === TRIGGER_SETUP_NODE)
    return TRIGGER_SETUP_TYPE;
  if (
    template === NODE_TEMPLATES.TRIGGER_SETUP ||
    template === "TRIGGER_SETUP" ||
    template === "TRIGGER"
  )
    return TRIGGER_SETUP_TYPE;

  if (nodeType === "SEQUENCE_TRIGGER" || template === "sequenceTrigger")
    return "SEQUENCE_TRIGGER";

  return null;
};

export const NODE_WITH_NO_FROM = {
  WELCOME: QuestionType.WELCOME,
  INPUT_SETUP: "Input Setup",
  CUSTOM_WEBHOOK: "CUSTOM_WEBHOOK",
  WEBHOOK_V2: "WEBHOOK_V2",
  TIME_BASED_TRIGGER: "TIME_BASED_TRIGGER",
  TIME_BASED_TRIGGER_V2: "TIME_BASED_TRIGGER_V2",
  SHEET_TRIGGER: "SHEET_TRIGGER",
  SHEET_TRIGGER_V2: "SHEET_TRIGGER_V2",
  SHEET_DATE_FIELD_TRIGGER: "SHEET_DATE_FIELD_TRIGGER",
  FORM_TRIGGER: "FORM_TRIGGER",
};

export const NODE_WITH_NO_TO = {
  ENDING: QuestionType.ENDING,
  END: "Success Setup",
  SKIP: "SKIP",
  BREAK: "BREAK",
  JUMP_TO: "JUMP_TO",
};

const getSingleInstanceNodeRules = (existingNodes = []) => {
  return Object.values(SINGLE_INSTANCE_NODES)
    .filter((nodeType) => existingNodes.some((node) => node?.type === nodeType))
    .map((nodeType) => ({
      type: nodeType,
      reason: "This node can only appear once in the canvas",
    }));
};

const getTriggerNodeRules = (existingNodes = []) => {
  const existingTriggerNode = existingNodes.find((node) =>
    isTriggerNodeType(node)
  );

  if (existingTriggerNode) {
    const nodeData = existingTriggerNode?.data || existingTriggerNode;
    const rawType = nodeData?.type || "";
    const rawSubType = nodeData?.subType || "";
    const canonicalType = getTriggerType(existingTriggerNode);

    const excludeTypes = new Set(
      [rawType, rawSubType, canonicalType].filter(Boolean)
    );

    const allTriggerTypes = [
      ...Object.values(TRIGGER_NODE_RULES),
      TRIGGER_SETUP_TYPE,
      TRIGGER_SETUP_NODE,
    ];

    return allTriggerTypes
      .filter((nodeType) => !excludeTypes.has(nodeType))
      .map((nodeType) => ({
        type: nodeType,
        reason: "Only one trigger node can exist in the canvas",
      }));
  }

  return [];
};

const LOOP_START_TYPES = ["LOOP_START", "FOR_EACH", "REPEAT", "LOOP_UNTIL"];
const BREAK_TYPES = ["BREAK", "BREAK_V2"];

const getLoopContextRules = (linkedNodeRef, canvasRef) => {
  const from = linkedNodeRef?.from;

  if (!from) {
    return BREAK_TYPES.map((type) => ({
      type,
      reason: "Stop Loop can only be used inside a loop",
    }));
  }

  const visited = new Set();
  const queue = [from];
  let count = 0;

  while (queue.length > 0 && count < 100) {
    const currentKey = queue.shift();
    if (visited.has(currentKey)) continue;
    visited.add(currentKey);
    count++;

    const node = canvasRef?.current?.findNode(currentKey);
    if (!node) continue;

    const nodeType = node?.data?.type || "";
    if (LOOP_START_TYPES.includes(nodeType) && node?.data?.pairedNodeKey) {
      return [];
    }

    const incomingLinks = canvasRef?.current?.findLinksInto(currentKey);
    if (incomingLinks) {
      for (const link of incomingLinks) {
        const sourceKey = link?.data?.from;
        if (sourceKey && !visited.has(sourceKey)) {
          queue.push(sourceKey);
        }
      }
    }
  }

  return BREAK_TYPES.map((type) => ({
    type,
    reason: "Stop Loop can only be used inside a loop",
  }));
};

const getLinkedNodeRules = (linkedNodeRef, canvasRef) => {
  const from = linkedNodeRef?.from;
  const to = linkedNodeRef?.to;

  let rules = [];
  if (from) {
    let fromRules = Object.values(NODE_WITH_NO_FROM).map((nodeType) => ({
      type: nodeType,
      reason: "This node can only be at the start of the flow.",
    }));

    rules.push(...fromRules);
  }

  if (to) {
    const toNode = canvasRef?.current?.findNode(to);
    if (toNode?.data?.template === NODE_TEMPLATES.PLACEHOLDER) {
      return rules;
    }
    let toRules = Object.values(NODE_WITH_NO_TO).map((nodeType) => ({
      type: nodeType,
      reason: "This node can only be at the end of the flow.",
    }));

    rules.push(...toRules);
  }
  return rules;
};

export const getDisabledNodes = (
  existingNodes = [],
  linkedNodeRef,
  canvasRef
) => {
  const singleInstanceNodes = getSingleInstanceNodeRules(existingNodes) || [];
  const triggerNodes = getTriggerNodeRules(existingNodes) || [];
  const linkedNodeRules = getLinkedNodeRules(linkedNodeRef, canvasRef) || [];
  const loopContextRules = getLoopContextRules(linkedNodeRef, canvasRef) || [];
  return [...singleInstanceNodes, ...triggerNodes, ...linkedNodeRules, ...loopContextRules];
};
