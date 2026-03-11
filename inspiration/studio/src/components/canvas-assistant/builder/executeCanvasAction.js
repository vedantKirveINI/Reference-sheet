/**
 * Canonical executor for canvas actions: add/insert/update/remove/replace.
 * Runs in a transaction, validates flow after mutation, returns structured outcome.
 */

import { validateFlowStructure } from "./connectionRules.js";
import { applyPlanToCanvas } from "./applyPlanToCanvas.js";
import { getCanvasAdapter, defaultCanvasAdapter } from "../adapters/canvasAdapterRegistry.js";

/**
 * Execute remove_node: rewire incoming→outgoing, remove node and its links, validate.
 * @param {object} diagram - GoJS diagram model
 * @param {string} nodeKey - key of node to remove
 * @returns {{ success: boolean, removedKeys: string[], errors: string[] }}
 */
function executeRemoveNode(diagram, nodeKey) {
  const nodes = diagram.model.nodeDataArray || [];
  const links = diagram.model.linkDataArray || [];
  const node = nodes.find((n) => (n.key || n.id) === nodeKey);
  if (!node) {
    return { success: false, removedKeys: [], errors: [`Node not found: ${nodeKey}`] };
  }

  const incoming = links.filter((l) => (l.to || l.toKey) === nodeKey);
  const outgoing = links.filter((l) => (l.from || l.fromKey) === nodeKey);

  diagram.startTransaction("removeNode");
  try {
    const candidateLinks = links
      .filter((l) => (l.from || l.fromKey) !== nodeKey && (l.to || l.toKey) !== nodeKey)
      .map((l) => ({ from: l.from || l.fromKey, to: l.to || l.toKey }));

    const fromKeys = [...new Set(incoming.map((l) => l.from || l.fromKey))];
    const toKeys = [...new Set(outgoing.map((l) => l.to || l.toKey))];
    fromKeys.forEach((fromKey) => {
      toKeys.forEach((toKey) => {
        if (fromKey !== toKey) candidateLinks.push({ from: fromKey, to: toKey });
      });
    });

    const remainingNodes = nodes.filter((n) => (n.key || n.id) !== nodeKey);
    const validation = validateFlowStructure(remainingNodes, candidateLinks);
    if (!validation.valid) {
      diagram.rollbackTransaction("removeNode");
      return { success: false, removedKeys: [], errors: validation.errors };
    }

    incoming.forEach((link) => diagram.model.removeLinkData(link));
    outgoing.forEach((link) => diagram.model.removeLinkData(link));
    diagram.model.removeNodeData(node);

    fromKeys.forEach((fromKey) => {
      toKeys.forEach((toKey) => {
        if (fromKey !== toKey) diagram.model.addLinkData({ from: fromKey, to: toKey });
      });
    });

    diagram.commitTransaction("removeNode");
    return { success: true, removedKeys: [nodeKey], errors: [] };
  } catch (err) {
    diagram.rollbackTransaction("removeNode");
    return { success: false, removedKeys: [], errors: [err?.message || "Remove node failed"] };
  }
}

/**
 * Execute update_node: apply patch to node (config/go_data), optionally saveNodeDataHandler, validate.
 * @param {object} diagram - GoJS diagram model
 * @param {string} nodeKey
 * @param {object} payload - { config?, go_data?, name?, text? } patch to apply
 * @param {function} [saveNodeDataHandler] - (nodeData, go_data, _, __, ___) => void
 * @returns {{ success: boolean, updatedKeys: string[], errors: string[] }}
 */
function executeUpdateNode(diagram, nodeKey, payload, saveNodeDataHandler) {
  const nodes = diagram.model.nodeDataArray || [];
  const links = diagram.model.linkDataArray || [];
  const node = nodes.find((n) => (n.key || n.id) === nodeKey);
  if (!node) {
    return { success: false, updatedKeys: [], errors: [`Node not found: ${nodeKey}`] };
  }

  diagram.startTransaction("updateNode");
  try {
    if (payload.name != null) {
      diagram.model.setDataProperty(node, "name", payload.name);
      diagram.model.setDataProperty(node, "text", payload.text ?? payload.name);
    }
    if (payload.text != null && payload.name == null) {
      diagram.model.setDataProperty(node, "text", payload.text);
    }
    if (payload.config != null && typeof payload.config === "object") {
      diagram.model.setDataProperty(node, "config", { ...(node.config || {}), ...payload.config });
    }
    if (payload.go_data != null && typeof payload.go_data === "object") {
      const merged = { ...(node.go_data || {}), ...payload.go_data };
      diagram.model.setDataProperty(node, "go_data", merged);
      if (typeof saveNodeDataHandler === "function") {
        saveNodeDataHandler(node, merged, {}, false, false);
      }
    }

    const validation = validateFlowStructure(nodes, links);
    if (!validation.valid) {
      diagram.rollbackTransaction("updateNode");
      return { success: false, updatedKeys: [], errors: validation.errors };
    }
    diagram.commitTransaction("updateNode");
    return { success: true, updatedKeys: [nodeKey], errors: [] };
  } catch (err) {
    diagram.rollbackTransaction("updateNode");
    return { success: false, updatedKeys: [], errors: [err?.message || "Update node failed"] };
  }
}

/**
 * Execute replace_graph: clear diagram then apply plan with append.
 * @param {object} params - same as executeCanvasAction, with planNodes and createNodeData/addNode/hydrateNode/getNodeByKey
 * @returns {Promise<{ success: boolean, createdKeys: string[], updatedKeys: string[], removedKeys: string[], warnings: string[], errors: string[] }>}
 */
async function executeReplaceGraph(params) {
  const { diagram, planNodes, canvasType, createNodeData, addNode, hydrateNode, getNodeByKey, layout } = params;
  const linkDataArray = diagram.model.linkDataArray?.slice() || [];
  const nodeDataArray = diagram.model.nodeDataArray?.slice() || [];

  diagram.startTransaction("replaceGraph");
  try {
    linkDataArray.forEach((link) => diagram.model.removeLinkData(link));
    nodeDataArray.forEach((node) => diagram.model.removeNodeData(node));
    diagram.commitTransaction("replaceGraph");
  } catch (err) {
    diagram.rollbackTransaction("replaceGraph");
    return {
      success: false,
      createdKeys: [],
      updatedKeys: [],
      removedKeys: [],
      warnings: [],
      errors: [err?.message || "Replace graph (clear) failed"],
    };
  }

  const result = await applyPlanToCanvas({
    diagram,
    planNodes,
    canvasType,
    createNodeData,
    layout: layout || "vertical",
    insertMode: "append",
    anchorNodeKey: null,
    addNode: addNode || undefined,
    hydrateNode: hydrateNode || undefined,
    getNodeByKey: getNodeByKey || undefined,
    allowOrphans: false,
  });

  return {
    success: result.success,
    createdKeys: result.createdKeys || [],
    updatedKeys: [],
    removedKeys: [],
    warnings: result.errors && result.errors.length ? result.errors : [],
    errors: result.success ? [] : (result.errors || ["Apply plan failed"]),
  };
}

/**
 * Canonical executor: route by actionKind and run transaction + validation.
 *
 * @param {object} params
 * @param {object} params.diagram - GoJS diagram (model with nodeDataArray, linkDataArray, addNodeData, removeNodeData, etc.)
 * @param {string} params.canvasType - WORKFLOW_CANVAS | WC_CANVAS | etc.
 * @param {string} params.actionKind - add_nodes | insert_after | insert_before | update_node | remove_node | replace_graph
 * @param {string} [params.operation] - append | insert_after | insert_before | replace_form | update | remove
 * @param {string} [params.targetNodeKey] - for insert_after/insert_before/update_node/remove_node
 * @param {Array} [params.planNodes] - for add/insert/replace (backend-style nodes)
 * @param {object} [params.payload] - for update_node: { config?, go_data?, name?, text? }
 * @param {function} [params.createNodeData] - (planNode, key, index, position?) => nodeData
 * @param {string} [params.insertMode] - append | insert_after | insert_before
 * @param {string} [params.anchorNodeKey] - same as targetNodeKey for insert
 * @param {function} [params.addNode] - (nodeData) => Promise<{ key }>
 * @param {function} [params.hydrateNode] - (nodeData) => Promise<void>
 * @param {function} [params.getNodeByKey] - (key) => nodeData | null
 * @param {function} [params.saveNodeDataHandler] - (nodeData, go_data, ...) => void
 * @param {string} [params.layout] - horizontal | vertical
 * @param {boolean} [params.allowOrphans] - allow created nodes with no links (default false)
 * @returns {Promise<{ success: boolean, createdKeys: string[], updatedKeys: string[], removedKeys: string[], warnings: string[], errors: string[] }>}
 */
export async function executeCanvasAction(params) {
  const {
    diagram,
    canvasType,
    actionKind,
    operation,
    targetNodeKey,
    planNodes,
    payload,
    createNodeData,
    insertMode: insertModeParam,
    anchorNodeKey: anchorNodeKeyParam,
    addNode,
    hydrateNode,
    getNodeByKey,
    saveNodeDataHandler,
    layout,
    allowOrphans = false,
  } = params;

  const empty = {
    success: false,
    createdKeys: [],
    updatedKeys: [],
    removedKeys: [],
    warnings: [],
    errors: [],
  };

  if (!diagram?.model) {
    return { ...empty, errors: ["Missing diagram or model"] };
  }

  const adapter = getCanvasAdapter(canvasType) || defaultCanvasAdapter;
  const blockedActions = adapter.blockedActions || [];
  if (actionKind && blockedActions.includes(actionKind)) {
    return {
      ...empty,
      errors: [`Action "${actionKind}" is not allowed on this canvas type.`],
    };
  }

  const anchorNodeKey = anchorNodeKeyParam ?? targetNodeKey;
  const insertMode =
    insertModeParam ?? (operation === "insert_after" ? "insert_after" : operation === "insert_before" ? "insert_before" : "append");

  if (actionKind === "remove_node" || operation === "remove") {
    const key = targetNodeKey;
    if (!key) {
      return { ...empty, errors: ["remove_node requires targetNodeKey"] };
    }
    const result = executeRemoveNode(diagram, key);
    return {
      success: result.success,
      createdKeys: [],
      updatedKeys: [],
      removedKeys: result.removedKeys || [],
      warnings: [],
      errors: result.errors || [],
    };
  }

  if (actionKind === "update_node" || operation === "update") {
    const key = targetNodeKey;
    if (!key) {
      return { ...empty, errors: ["update_node requires targetNodeKey"] };
    }
    const result = executeUpdateNode(diagram, key, payload || {}, saveNodeDataHandler);
    return {
      success: result.success,
      createdKeys: [],
      updatedKeys: result.updatedKeys || [],
      removedKeys: [],
      warnings: [],
      errors: result.errors || [],
    };
  }

  if (actionKind === "replace_graph" || operation === "replace_form") {
    if (!planNodes?.length || typeof createNodeData !== "function") {
      return { ...empty, errors: ["replace_graph requires planNodes and createNodeData"] };
    }
    return executeReplaceGraph({
      diagram,
      planNodes,
      canvasType,
      createNodeData,
      addNode,
      hydrateNode,
      getNodeByKey,
      layout,
    });
  }

  if (
    (actionKind === "add_nodes" || actionKind === "insert_after" || actionKind === "insert_before") &&
    (planNodes?.length > 0 && typeof createNodeData === "function")
  ) {
    const result = await applyPlanToCanvas({
      diagram,
      planNodes,
      canvasType,
      createNodeData,
      layout: layout || "vertical",
      insertMode,
      anchorNodeKey: anchorNodeKey ?? undefined,
      addNode: addNode || undefined,
      hydrateNode: hydrateNode || undefined,
      getNodeByKey: getNodeByKey || undefined,
      allowOrphans,
    });
    return {
      success: result.success,
      createdKeys: result.createdKeys || [],
      updatedKeys: [],
      removedKeys: [],
      warnings: result.errors && result.errors.length && result.success ? result.errors : [],
      errors: result.success ? [] : (result.errors || ["Apply plan failed"]),
    };
  }

  return { ...empty, errors: ["Unsupported action or missing planNodes/createNodeData for add/insert"] };
}
