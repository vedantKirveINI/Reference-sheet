import { findLastNodeInChain, validateFlowStructure } from "./connectionRules.js";
import { getTypeLinkPolicy } from "./typeLinkPolicy.js";

const IFELSE_TYPES = ["IFELSE_V2", "IF_ELSE"];
function isIfElseNode(type) {
  return type && IFELSE_TYPES.includes(String(type).toUpperCase());
}

const DEFAULT_START_X = 200;
const DEFAULT_START_Y = 150;
const DEFAULT_SPACING_X = 220;
const DEFAULT_SPACING_Y = 120;

function parseLocation(loc) {
  const parts = String(loc || "").trim().split(/\s+/);
  return {
    x: parseFloat(parts[0]) || DEFAULT_START_X,
    y: parseFloat(parts[1]) || DEFAULT_START_Y,
  };
}

/**
 * Common canvas plan applier.
 * Adds plan nodes to the diagram and links them; enforces single-journey rule.
 * Supports append (terminal), insert_after(anchor), insert_before(anchor).
 * When addNode/hydrateNode callbacks are provided, nodes go through the canvas lifecycle (createNode + saveNodeDataHandler).
 *
 * @param {object} options
 * @param {object} options.diagram - GoJS diagram (model with nodeDataArray, linkDataArray, addNodeData, addLinkData, removeLinkData)
 * @param {Array} options.planNodes - Backend-style nodes [{ type, name, config?, ... }]
 * @param {string} options.canvasType - "WORKFLOW_CANVAS" | "WC_CANVAS" | etc.
 * @param {function} options.createNodeData - (planNode, key, index, position?) => nodeData | null; position = { x, y } when layout is applied
 * @param {string} [options.layout] - "horizontal" | "vertical" (default: "vertical")
 * @param {string} [options.insertMode] - "append" | "insert_after" | "insert_before" (default: "append")
 * @param {string} [options.anchorNodeKey] - Node key for insert_after/insert_before
 * @param {number} [options.spacingX] - horizontal spacing (default 220)
 * @param {number} [options.spacingY] - vertical spacing (default 120)
 * @param {function} [options.addNode] - (nodeData) => Promise<{ key: string } | { key?: string } | void>; when provided, used instead of diagram.model.addNodeData
 * @param {function} [options.hydrateNode] - (nodeData) => Promise<void>; called after addNode for each created node (e.g. saveNodeDataHandler)
 * @param {function} [options.getNodeByKey] - (key) => object | null; resolve node data by key (for rollback/hydration when using addNode)
 * @param {boolean} [options.allowOrphans] - if true, allow created nodes with no incident links; default false (do not place unconnected nodes)
 * @returns {Promise<{ success: boolean, createdKeys?: string[], errors?: string[] }>}
 */
export async function applyPlanToCanvas({
  diagram,
  planNodes,
  canvasType,
  createNodeData,
  layout = "vertical",
  insertMode = "append",
  anchorNodeKey = null,
  spacingX = DEFAULT_SPACING_X,
  spacingY = DEFAULT_SPACING_Y,
  addNode = null,
  hydrateNode = null,
  getNodeByKey = null,
  allowOrphans = false,
}) {
  if (!diagram?.model || !planNodes?.length || typeof createNodeData !== "function") {
    return { success: false, errors: ["Missing diagram, planNodes, or createNodeData"] };
  }

  // If the generated chain contains a terminal node before other steps in a simple append,
  // fail deterministically so the chat layer can ask the user where to place them.
  const firstTerminalIndex = planNodes.findIndex(
    (n) => getTypeLinkPolicy(n.type || n.subType).denyToLink
  );
  if (
    firstTerminalIndex >= 0 &&
    firstTerminalIndex < planNodes.length - 1 &&
    insertMode === "append" &&
    !anchorNodeKey
  ) {
    return {
      success: false,
      errors: [
        "The generated steps include an end/terminal node before other steps. Please tell me where to place the new steps.",
      ],
    };
  }

  const existingNodes = diagram.model.nodeDataArray || [];
  const existingLinks = diagram.model.linkDataArray || [];
  const isHorizontal = layout === "horizontal";
  const startX = DEFAULT_START_X;
  const startY = DEFAULT_START_Y;

  let lastExisting = null;
  let anchorPos = { x: startX, y: startY };
  let baseX = startX;
  let baseY = startY;
  let linksToRemove = [];
  let insertAfterSuccessors = [];
  let insertBeforePredecessors = [];
  /** When append finds a terminal (denyToLink), we insert before it; this is the terminal key for lastNew → terminal link */
  let appendBeforeTerminalKey = null;

  if (insertMode === "insert_after" || insertMode === "insert_before") {
    if (!anchorNodeKey) {
      return { success: false, errors: ["insert_after/insert_before requires anchorNodeKey"] };
    }
    const anchorNode = existingNodes.find((n) => (n.key || n.id) === anchorNodeKey);
    if (!anchorNode) {
      return { success: false, errors: ["Anchor node not found: " + anchorNodeKey] };
    }
    anchorPos = parseLocation(anchorNode.location);
    if (insertMode === "insert_after") {
      baseX = isHorizontal ? anchorPos.x + spacingX : anchorPos.x;
      baseY = isHorizontal ? anchorPos.y : anchorPos.y + spacingY;
      linksToRemove = existingLinks.filter((l) => (l.from || l.fromKey) === anchorNodeKey);
      insertAfterSuccessors = linksToRemove.map((l) => l.to || l.toKey);
    } else {
      baseX = isHorizontal ? anchorPos.x - spacingX : anchorPos.x;
      baseY = isHorizontal ? anchorPos.y : anchorPos.y - spacingY;
      linksToRemove = existingLinks.filter((l) => (l.to || l.toKey) === anchorNodeKey);
      insertBeforePredecessors = linksToRemove.map((l) => l.from || l.fromKey);
    }
  } else {
    lastExisting = findLastNodeInChain(existingNodes, existingLinks);
    anchorPos = lastExisting ? parseLocation(lastExisting.location) : { x: startX, y: startY };
    const lastType = lastExisting?.type || lastExisting?.subType;
    if (lastExisting && getTypeLinkPolicy(lastType).denyToLink) {
      appendBeforeTerminalKey = lastExisting.key || lastExisting.id;
      linksToRemove = existingLinks.filter((l) => (l.to || l.toKey) === appendBeforeTerminalKey);
      insertBeforePredecessors = linksToRemove.map((l) => l.from || l.fromKey);
      baseX = isHorizontal ? anchorPos.x - spacingX : anchorPos.x;
      baseY = isHorizontal ? anchorPos.y : anchorPos.y - spacingY;
    } else {
      baseX = isHorizontal ? (lastExisting ? anchorPos.x + spacingX : startX) : startX;
      baseY = isHorizontal ? anchorPos.y : (lastExisting ? anchorPos.y + spacingY : startY);
    }
  }

  const createdEntries = [];
  const unsupportedTypes = [];
  const useLifecycle = typeof addNode === "function";

  diagram.startTransaction("applyPlan");

  const insertBefore = insertMode === "insert_before";
  const posOffset = (i) => (insertBefore ? -i : i);

  const resolveNodeByKey = (key) => {
    if (typeof getNodeByKey === "function") {
      const n = getNodeByKey(key);
      if (n) return n;
    }
    return diagram.model.findNodeDataForKey?.(key) ?? null;
  };

  try {
    // When inserting before an existing terminal, drop any terminal/end-type nodes from the
    // generated sequence so we never create outgoing links from a terminal node.
    const effectivePlanNodes =
      appendBeforeTerminalKey != null
        ? planNodes.filter((n) => !getTypeLinkPolicy(n.type || n.subType).denyToLink)
        : planNodes;

    if (!effectivePlanNodes.length) {
      diagram.commitTransaction("applyPlan");
      return {
        success: false,
        errors: ["Nothing to add (the generated plan contained only terminal/end nodes)."],
      };
    }

    for (let i = 0; i < effectivePlanNodes.length; i++) {
      const planNode = effectivePlanNodes[i];
      const key = `gen_${Date.now()}_${i}`;
      const x = isHorizontal ? baseX + posOffset(i) * spacingX : baseX;
      const y = isHorizontal ? baseY : baseY + posOffset(i) * spacingY;
      const position = { x, y };
      const nodeData = createNodeData(planNode, key, i, position);
      if (!nodeData) {
        if (planNode.type) unsupportedTypes.push(planNode.type);
        continue;
      }
      const fallbackKey = nodeData.key || key;

      if (useLifecycle) {
        let resultKey = fallbackKey;
        try {
          const addResult = await addNode({ ...nodeData, key: fallbackKey });
          if (addResult != null && addResult.key != null) resultKey = addResult.key;
          createdEntries.push({ key: resultKey, planIndex: i });
          if (typeof hydrateNode === "function") {
            const createdData = resolveNodeByKey(resultKey) || { ...nodeData, key: resultKey };
            await hydrateNode(createdData);
          }
        } catch (err) {
          diagram.rollbackTransaction("applyPlan");
          return { success: false, errors: [err?.message || "Node creation or hydration failed"] };
        }
      } else {
        createdEntries.push({ key: fallbackKey, planIndex: i });
        diagram.model.addNodeData({ ...nodeData, key: fallbackKey });
      }
    }

    const createdKeys = createdEntries.map((e) => e.key);

    if (createdKeys.length === 0) {
      diagram.commitTransaction("applyPlan");
      const errors = unsupportedTypes.length
        ? ["No nodes were created.", ...unsupportedTypes.map((t) => `Unsupported node type: ${t}`)]
        : ["No nodes were created"];
      return { success: false, errors };
    }

    const firstNew = createdKeys[0];
    const lastNew = createdKeys[createdKeys.length - 1];

    const successors =
      insertMode === "insert_after"
        ? insertAfterSuccessors
        : insertMode === "insert_before"
          ? [anchorNodeKey]
          : appendBeforeTerminalKey
            ? [appendBeforeTerminalKey]
            : [];

    const candidateLinks = existingLinks
      .filter((l) => !linksToRemove.includes(l))
      .map((l) => ({ from: l.from || l.fromKey, to: l.to || l.toKey }));

    if (insertMode === "append" && lastExisting && lastExisting.key !== firstNew) {
      if (appendBeforeTerminalKey) {
        insertBeforePredecessors.forEach((fromKey) => candidateLinks.push({ from: fromKey, to: firstNew }));
      } else {
        candidateLinks.push({ from: lastExisting.key, to: firstNew });
      }
    }
    if (insertMode === "insert_after") {
      candidateLinks.push({ from: anchorNodeKey, to: firstNew });
    }
    if (insertMode === "insert_before") {
      insertBeforePredecessors.forEach((fromKey) => candidateLinks.push({ from: fromKey, to: firstNew }));
    }

    const usedIndices = new Set();
    for (let j = 0; j < createdEntries.length - 2; j++) {
      if (usedIndices.has(j)) continue;
      const p0 = effectivePlanNodes[createdEntries[j].planIndex];
      const p1 = effectivePlanNodes[createdEntries[j + 1].planIndex];
      const p2 = effectivePlanNodes[createdEntries[j + 2].planIndex];
      const type0 = (p0?.type || p0?.subType || "").toUpperCase();
      const branch1 = (p1?.branch || "").toLowerCase();
      const branch2 = (p2?.branch || "").toLowerCase();
      if (
        isIfElseNode(type0) &&
        branch1 === "true" &&
        branch2 === "false"
      ) {
        const k0 = createdEntries[j].key;
        const k1 = createdEntries[j + 1].key;
        const k2 = createdEntries[j + 2].key;
        candidateLinks.push({ from: k0, to: k1 });
        candidateLinks.push({ from: k0, to: k2 });
        if (successors.length > 0) {
          successors.forEach((toKey) => {
            candidateLinks.push({ from: k1, to: toKey });
            candidateLinks.push({ from: k2, to: toKey });
          });
        }
        usedIndices.add(j);
        usedIndices.add(j + 1);
        usedIndices.add(j + 2);
        continue;
      }
    }
    for (let i = 0; i < createdEntries.length - 1; i++) {
      if (usedIndices.has(i) && usedIndices.has(i + 1)) continue;
      if (usedIndices.has(i) || usedIndices.has(i + 1)) continue;
      candidateLinks.push({ from: createdEntries[i].key, to: createdEntries[i + 1].key });
    }
    if (successors.length > 0 && !usedIndices.has(createdEntries.length - 1)) {
      successors.forEach((toKey) => candidateLinks.push({ from: lastNew, to: toKey }));
    }

    if (!allowOrphans && createdKeys.length > 0) {
      const linkedKeys = new Set();
      candidateLinks.forEach((l) => {
        if (l.from) linkedKeys.add(l.from);
        if (l.to) linkedKeys.add(l.to);
      });
      const orphanKeys = createdKeys.filter((k) => !linkedKeys.has(k));
      if (orphanKeys.length > 0) {
        for (const k of createdKeys) {
          const data = resolveNodeByKey(k);
          if (data && diagram.model.removeNodeData) diagram.model.removeNodeData(data);
        }
        diagram.commitTransaction("applyPlan");
        return {
          success: false,
          errors: [
            "I can't add nodes without connecting them. Tell me where to insert them (after/before which node).",
          ],
        };
      }
    }

    const allNodes = diagram.model.nodeDataArray || [];
    const validation = validateFlowStructure(allNodes, candidateLinks);

    if (!validation.valid) {
      for (const k of createdKeys) {
        const data = resolveNodeByKey(k);
        if (data && diagram.model.removeNodeData) diagram.model.removeNodeData(data);
      }
      diagram.commitTransaction("applyPlan");
      return { success: false, errors: validation.errors };
    }

    linksToRemove.forEach((link) => diagram.model.removeLinkData(link));

    if (insertMode === "append" && lastExisting && lastExisting.key !== firstNew) {
      if (appendBeforeTerminalKey) {
        insertBeforePredecessors.forEach((fromKey) => diagram.model.addLinkData({ from: fromKey, to: firstNew }));
      } else {
        diagram.model.addLinkData({ from: lastExisting.key, to: firstNew });
      }
    }
    if (insertMode === "insert_after") {
      diagram.model.addLinkData({ from: anchorNodeKey, to: firstNew });
    }
    if (insertMode === "insert_before") {
      insertBeforePredecessors.forEach((fromKey) => diagram.model.addLinkData({ from: fromKey, to: firstNew }));
    }
    for (let j = 0; j < createdEntries.length - 2; j++) {
      if (usedIndices.has(j)) continue;
      const p0 = effectivePlanNodes[createdEntries[j].planIndex];
      const p1 = effectivePlanNodes[createdEntries[j + 1].planIndex];
      const p2 = effectivePlanNodes[createdEntries[j + 2].planIndex];
      const type0 = (p0?.type || p0?.subType || "").toUpperCase();
      const branch1 = (p1?.branch || "").toLowerCase();
      const branch2 = (p2?.branch || "").toLowerCase();
      if (isIfElseNode(type0) && branch1 === "true" && branch2 === "false") {
        const k0 = createdEntries[j].key;
        const k1 = createdEntries[j + 1].key;
        const k2 = createdEntries[j + 2].key;
        diagram.model.addLinkData({ from: k0, to: k1 });
        diagram.model.addLinkData({ from: k0, to: k2 });
        if (successors.length > 0) {
          successors.forEach((toKey) => {
            diagram.model.addLinkData({ from: k1, to: toKey });
            diagram.model.addLinkData({ from: k2, to: toKey });
          });
        }
        continue;
      }
    }
    for (let i = 0; i < createdEntries.length - 1; i++) {
      if (usedIndices.has(i) || usedIndices.has(i + 1)) continue;
      diagram.model.addLinkData({ from: createdEntries[i].key, to: createdEntries[i + 1].key });
    }
    if (successors.length > 0 && !usedIndices.has(createdEntries.length - 1)) {
      successors.forEach((toKey) => diagram.model.addLinkData({ from: lastNew, to: toKey }));
    }

    diagram.commitTransaction("applyPlan");
    const errors =
      unsupportedTypes.length > 0
        ? unsupportedTypes.map((t) => `Unsupported node type: ${t}`)
        : undefined;
    return { success: true, createdKeys, errors };
  } catch (err) {
    diagram.rollbackTransaction("applyPlan");
    return { success: false, errors: [err?.message || "Failed to apply plan"] };
  }
}
