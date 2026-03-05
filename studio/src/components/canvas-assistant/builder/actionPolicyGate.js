/**
 * Action policy gate: risk scoring, smart confirmation, and canvas/positional constraints.
 * Returns { allowed, riskLevel, requiresConfirmation, blockReason? }.
 */

import { findLastNodeInChain } from "./connectionRules.js";

const FORM_CANVAS = "WORKFLOW_CANVAS";

function getFormFirstNode(nodes, links) {
  if (!nodes?.length) return null;
  const withIncoming = new Set((links || []).map((l) => l.to || l.toKey));
  return nodes.find((n) => !withIncoming.has(n.key || n.id)) || null;
}

/**
 * Compute risk level and whether confirmation is required (smart policy).
 * @param {object} params
 * @param {string} params.actionKind - add_nodes | insert_after | insert_before | update_node | remove_node | replace_graph
 * @param {string} params.operation - append | insert_after | insert_before | replace_form | update | remove
 * @param {number} params.existingNodeCount
 * @param {string} [params.targetNodeKey] - for remove/update/insert
 * @param {Array} [params.nodes] - nodeDataArray for neighbor check
 * @param {Array} [params.links] - linkDataArray
 * @param {Array} [params.planNodeTypes] - types being added (e.g. ["WELCOME", "SHORT_TEXT"])
 * @param {string} [params.insertMode] - insert_after | insert_before | append
 * @param {string} [params.anchorNodeKey]
 */
function computeRiskAndConfirmation({
  actionKind,
  operation,
  existingNodeCount,
  targetNodeKey,
  nodes = [],
  links = [],
  planNodeTypes = [],
  insertMode,
  anchorNodeKey,
}) {
  let riskLevel = "low";
  let requiresConfirmation = false;

  if (actionKind === "replace_graph" || operation === "replace_form") {
    riskLevel = "high";
    requiresConfirmation = existingNodeCount > 0;
    return { riskLevel, requiresConfirmation };
  }

  if (actionKind === "remove_node" || operation === "remove") {
    if (targetNodeKey && (nodes.length > 0 || (links && links.length > 0))) {
      const hasOutgoing = links.some((l) => (l.from || l.fromKey) === targetNodeKey);
      const hasIncoming = links.some((l) => (l.to || l.toKey) === targetNodeKey);
      if (hasOutgoing || hasIncoming) {
        riskLevel = "high";
        requiresConfirmation = true;
      } else {
        riskLevel = "medium";
        requiresConfirmation = true;
      }
    } else {
      riskLevel = "medium";
      requiresConfirmation = true;
    }
    return { riskLevel, requiresConfirmation };
  }

  if (actionKind === "update_node" || operation === "update") {
    riskLevel = "low";
    requiresConfirmation = false;
    return { riskLevel, requiresConfirmation };
  }

  if (["add_nodes", "insert_after", "insert_before"].includes(actionKind) || ["append", "insert_after", "insert_before"].includes(operation)) {
    riskLevel = "low";
    requiresConfirmation = false;
    return { riskLevel, requiresConfirmation };
  }

  return { riskLevel, requiresConfirmation };
}

/**
 * Check Form canvas positional rules: WELCOME only first, ENDING only last.
 * @param {string} canvasType
 * @param {Array} nodes
 * @param {Array} links
 * @param {string} insertMode - insert_after | insert_before | append
 * @param {string} [anchorNodeKey]
 * @param {Array} planNodeTypes - e.g. ["WELCOME", "SHORT_TEXT"]
 * @returns {{ allowed: boolean, blockReason?: string }}
 */
function checkFormPositionalRules(canvasType, nodes, links, insertMode, anchorNodeKey, planNodeTypes) {
  if (canvasType !== FORM_CANVAS || !planNodeTypes?.length) {
    return { allowed: true };
  }

  const hasWelcome = planNodeTypes.some((t) => (t || "").toUpperCase() === "WELCOME");
  const hasEnding = planNodeTypes.some((t) => (t || "").toUpperCase() === "ENDING");
  const firstNode = getFormFirstNode(nodes, links);
  const lastNode = findLastNodeInChain(nodes, links);

  if (hasWelcome) {
    if (insertMode === "append") {
      if (nodes.length > 0) {
        return { allowed: false, blockReason: "A Welcome node can only be placed at the very beginning of the form. Add it before the first node, or build a new form." };
      }
      return { allowed: true };
    }
    if (insertMode === "insert_after") {
      return { allowed: false, blockReason: "A Welcome node must be the first node in the form. Add it before the first node." };
    }
    if (insertMode === "insert_before") {
      if (!firstNode) return { allowed: true };
      if (anchorNodeKey === (firstNode.key || firstNode.id)) return { allowed: true };
      return { allowed: false, blockReason: "A Welcome node can only be placed at the very beginning of the form." };
    }
  }

  if (hasEnding) {
    const isAppend = insertMode === "append";
    const isInsertAfterLast = insertMode === "insert_after" && lastNode && anchorNodeKey === (lastNode.key || lastNode.id);
    if (!isAppend && !isInsertAfterLast) {
      return { allowed: false, blockReason: "An Ending node can only be placed at the very end of the form. Add it at the end (append) or after the last node." };
    }
  }

  return { allowed: true };
}

/**
 * Canvas-agnostic positional rules: delegates to canvas-specific logic.
 * @param {string} canvasType
 * @param {Array} nodes
 * @param {Array} links
 * @param {string} insertMode
 * @param {string} [anchorNodeKey]
 * @param {Array} planNodeTypes
 * @returns {{ allowed: boolean, blockReason?: string }}
 */
export function checkCanvasPositionalRules(canvasType, nodes, links, insertMode, anchorNodeKey, planNodeTypes) {
  if (canvasType === FORM_CANVAS) {
    return checkFormPositionalRules(canvasType, nodes, links, insertMode, anchorNodeKey, planNodeTypes);
  }
  return { allowed: true };
}

/**
 * Run the full policy gate before executing an action.
 * @param {object} params
 * @param {string} params.canvasType - WORKFLOW_CANVAS | WC_CANVAS | etc.
 * @param {string} params.actionKind
 * @param {string} params.operation
 * @param {Array} params.nodes - nodeDataArray
 * @param {Array} params.links - linkDataArray
 * @param {string} [params.targetNodeKey]
 * @param {Array} [params.planNodeTypes] - for add/insert
 * @param {string} [params.insertMode]
 * @param {string} [params.anchorNodeKey]
 * @returns {{ allowed: boolean, riskLevel: string, requiresConfirmation: boolean, blockReason?: string }}
 */
export function runActionPolicyGate({
  canvasType,
  actionKind,
  operation,
  nodes = [],
  links = [],
  targetNodeKey,
  planNodeTypes = [],
  insertMode,
  anchorNodeKey,
}) {
  const { riskLevel, requiresConfirmation } = computeRiskAndConfirmation({
    actionKind,
    operation,
    existingNodeCount: nodes.length,
    targetNodeKey,
    nodes,
    links,
    planNodeTypes,
    insertMode,
    anchorNodeKey,
  });

  const positional = checkCanvasPositionalRules(
    canvasType,
    nodes,
    links,
    insertMode || (operation === "insert_after" ? "insert_after" : operation === "insert_before" ? "insert_before" : "append"),
    anchorNodeKey,
    planNodeTypes
  );

  if (!positional.allowed) {
    return {
      allowed: false,
      riskLevel,
      requiresConfirmation,
      blockReason: positional.blockReason,
    };
  }

  return {
    allowed: true,
    riskLevel,
    requiresConfirmation,
  };
}
