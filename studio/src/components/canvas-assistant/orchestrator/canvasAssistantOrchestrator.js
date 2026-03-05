/**
 * Canvas Assistant Orchestrator: intent-to-execution flow logic.
 * Returns structured results for the hook to apply to UI state.
 * No React dependencies.
 */

import { planAction } from "../assistantService.js";
import { generateFlowStream } from "../assistantService.js";
import { setupNode } from "../assistantService.js";
import { executeActionPlanSteps } from "../fullAi/executeActionPlanSteps.js";
import { executeCanvasAction } from "../builder/executeCanvasAction.js";
import { resolveActionTarget } from "../intent/resolveActionTarget.js";
import { getCanvasAdapter, defaultCanvasAdapter } from "../adapters/canvasAdapterRegistry.js";
import { parseDisambiguationReply } from "../utils/nodeUtils.js";

/**
 * Run plan-action path: call planAction, handle clarification, execute steps.
 * @returns {{ type: "success" | "clarification" | "missing" | "ambiguous" | "error", message?: string, data?: object }}
 */
export async function runPlanActionPath({
  userMessage,
  diagram,
  canvasType,
  getWorkflowContext,
  saveNodeDataHandler,
  applyGeneratedNodesNow,
  userContext,
  allowPlacementFallback = false,
  inferredMacroJourney,
}) {
  const adapter = getCanvasAdapter(canvasType) || defaultCanvasAdapter;
  const nodeIndex = diagram?.model ? adapter.buildNodeIndex(diagram) : [];
  const workflowContext = getWorkflowContext?.() || {};

  const plan = await planAction({
    canvasType,
    userMessage,
    nodeIndex,
    workflowContext,
    userContext,
  });

  if (plan.needsClarification && plan.clarificationQuestions?.length) {
    return {
      type: "clarification",
      message: plan.summary?.trim() || null,
      data: {
        source: "plan_action",
        questions: plan.clarificationQuestions,
        originalRequest: userMessage,
        nodeIndex,
        canvasType,
        summary: plan.summary?.trim() || null,
      },
    };
  }

  const explainMessages = [];
  for (const step of plan.steps || []) {
    if (step?.kind === "explain" && step.message) {
      explainMessages.push(step.message);
    }
  }

  const execResult = await executeActionPlanSteps({
    plan,
    diagram,
    canvasType,
    getWorkflowContext,
    saveNodeDataHandler,
    applyGeneratedNodesNow,
    userMessage,
    allowPlacementFallback,
  });

  if (execResult.ok) {
    return { type: "success", message: plan.summary?.trim() || null, explainMessages };
  }

  if (execResult.kind === "missing") {
    const hint = plan?.steps?.find((s) => s?.kind === "remove" || s?.kind === "update")?.target?.value || "that";
    const suggestions = execResult.resolution?.suggestions?.length ? execResult.resolution.suggestions.join(", ") : null;
    const message = suggestions
      ? `I couldn't find an exact match for "${hint}". Did you mean one of: ${suggestions}? Reply with the exact name or select the node and say "delete this".`
      : `I couldn't find a node matching "${hint}". Please specify which node/question by name, or select it and say "delete this".`;
    return { type: "missing", message };
  }

  if (execResult.kind === "ambiguous" && execResult.resolution?.candidates?.length) {
    const candidates = execResult.resolution.candidates.map((c) => ({
      key: c.key,
      name: c.name,
      text: c.text,
      description: c.description,
      type: c.type,
    }));
    const numberedList = execResult.resolution.candidates
      .map((c, i) => {
        const label = c.name || c.text || c.description || c.type || "Unnamed node";
        const desc = c.description && c.description !== (c.name || c.text) ? ` — ${c.description}` : "";
        return `(${i + 1}) ${label}${desc}`;
      })
      .join("; ");
    const content = `I found multiple matches: ${numberedList}. Reply with: **both** or **all** to delete all; **1** and **2** for specific numbers; or the exact name(s).`;
    return {
      type: "ambiguous",
      data: {
        pendingDisambiguation: {
          kind: "remove",
          candidates,
          originalHint: userMessage,
          createdAt: Date.now(),
        },
        content,
      },
    };
  }

  if (execResult.kind === "unsupported") {
    return { type: "unsupported" };
  }

  return {
    type: "error",
    message: execResult.error || "I couldn't apply that action. Please try again.",
  };
}

/**
 * Run remove path: resolve target, execute remove_node.
 * @returns {{ type: "success" | "missing" | "ambiguous" | "error", message?: string, data?: object }}
 */
export async function runRemovePath({
  userMessage,
  diagram,
  canvasType,
  intent,
  getWorkflowContext,
}) {
  const workflowContext = getWorkflowContext?.() || {};
  const existingNodes = diagram.model.nodeDataArray ?? [];
  const resolution = resolveActionTarget({
    diagram,
    workflowContext: { ...workflowContext, nodes: existingNodes },
    targetHint: intent.targetHint,
    targetStrategy: intent.targetStrategy,
  });

  if (resolution.status === "missing") {
    const hint = intent.targetHint || "that";
    const suggestions = resolution.suggestions?.length ? resolution.suggestions.join(", ") : null;
    const message = suggestions
      ? `I couldn't find an exact match for "${hint}". Did you mean one of: ${suggestions}? Please reply with the exact name or select the node and say "delete this".`
      : `I couldn't find a node matching "${hint}". Please specify which question or node to remove by name, or select it and say "delete this".`;
    return { type: "missing", message };
  }

  if (resolution.status === "ambiguous" && resolution.candidates?.length) {
    const candidates = resolution.candidates.map((c) => ({
      key: c.key,
      name: c.name,
      text: c.text,
      description: c.description,
      type: c.type,
    }));
    const numberedList = resolution.candidates
      .map((c, i) => {
        const label = c.name || c.text || c.description || c.type || c.key || "?";
        const desc = c.description && c.description !== (c.name || c.text) ? ` — ${c.description}` : "";
        return `(${i + 1}) ${label}${desc}`;
      })
      .join("; ");
    const content = `I found multiple matches: ${numberedList}. Reply with: **both** or **all** to delete all; **1** and **2** for specific numbers; or the exact name(s).`;
    return {
      type: "ambiguous",
      data: {
        pendingDisambiguation: {
          kind: "remove",
          candidates,
          originalHint: intent.targetHint || userMessage,
          createdAt: Date.now(),
        },
        content,
      },
    };
  }

  if (resolution.status !== "resolved" || !resolution.nodeKey) {
    return { type: "error", message: "Target not resolved." };
  }

  const nodeData = diagram.model.findNodeDataForKey?.(resolution.nodeKey);
  const removedLabel =
    (nodeData?.name || nodeData?.text || nodeData?.type || nodeData?.subType || resolution.nodeKey)?.trim() ||
    resolution.nodeKey;

  const removeResult = await executeCanvasAction({
    diagram,
    canvasType,
    actionKind: "remove_node",
    operation: "remove",
    targetNodeKey: resolution.nodeKey,
  });

  if (removeResult.success && removeResult.removedKeys?.length) {
    return { type: "success", message: `Done! I removed "${removedLabel}".` };
  }

  const errorContent =
    removeResult.errors?.length > 0 ? removeResult.errors.join(" ") : "I couldn't remove that node. Please try again.";
  return { type: "error", message: errorContent };
}

/**
 * Run update path: resolve target, call setup-node, apply update_node.
 * @returns {{ type: "success" | "missing" | "ambiguous" | "error" | "clarification", message?: string, data?: object }}
 */
export async function runUpdatePath({
  userMessage,
  diagram,
  canvasType,
  intent,
  getWorkflowContext,
  saveNodeDataHandler,
  inferredMacroJourney,
}) {
  const workflowContext = getWorkflowContext?.() || {};
  const existingNodes = diagram.model.nodeDataArray ?? [];
  const resolution = resolveActionTarget({
    diagram,
    workflowContext: { ...workflowContext, nodes: existingNodes },
    targetHint: intent.targetHint,
    targetStrategy: intent.targetStrategy,
  });

  if (resolution.status === "missing") {
    const hint = intent.targetHint || "that";
    return {
      type: "missing",
      message: `I couldn't find a node matching "${hint}". Please specify which node to update by name, or select it and say "update this".`,
    };
  }

  if (resolution.status === "ambiguous" && resolution.candidates?.length) {
    const list = resolution.candidates.map((c) => c.name || c.text || c.description || c.type || c.key).filter(Boolean).join(", ");
    return {
      type: "ambiguous",
      data: {
        content: `More than one node matches. Which one do you mean? (${list}) Please specify by name or select the node and say "update this".`,
      },
    };
  }

  if (resolution.status !== "resolved" || !resolution.nodeKey) {
    return { type: "error", message: "Target not resolved." };
  }

  const nodeData = diagram.model.findNodeDataForKey?.(resolution.nodeKey);
  const nodeType = nodeData?.type || nodeData?.subType || "HTTP";
  const currentConfig = nodeData?.go_data || nodeData?.config || {};
  const dataAtNode =
    workflowContext?.availableVariables != null
      ? JSON.stringify(workflowContext.availableVariables)
      : workflowContext?.nodes?.length
        ? JSON.stringify(workflowContext.nodes.slice(0, 5))
        : "{}";

  try {
    const setupResult = await setupNode({
      nodeType,
      nodeKey: resolution.nodeKey,
      canvasType,
      currentConfig,
      dataAtNode,
      macroJourney: inferredMacroJourney ?? undefined,
      conversationSnippet: userMessage,
      eventId: nodeData?.id,
      template: nodeData?.go_data?.flow?.workflowNodeIdentifier,
    });

    if (setupResult.needs_clarification && setupResult.questions?.length) {
      return {
        type: "clarification",
        data: { content: setupResult.questions.join(" ") },
      };
    }

    const patch = setupResult.config || {};
    let mergedGoData = { ...(currentConfig || {}) };
    if (patch.flow != null && typeof patch.flow === "object") {
      mergedGoData = {
        ...mergedGoData,
        flow: { ...(mergedGoData.flow || {}), ...patch.flow },
      };
    } else if (Object.keys(patch).length > 0) {
      mergedGoData = { ...mergedGoData, ...patch };
    }

    const updateResult = await executeCanvasAction({
      diagram,
      canvasType,
      actionKind: "update_node",
      operation: "update",
      targetNodeKey: resolution.nodeKey,
      payload: { go_data: mergedGoData },
      saveNodeDataHandler,
    });

    const label = nodeData?.name || nodeData?.text || nodeData?.type || resolution.nodeKey;
    if (updateResult.success && updateResult.updatedKeys?.length) {
      return { type: "success", message: `Done! I updated "${label}".` };
    }

    const err = updateResult.errors?.length ? updateResult.errors.join(" ") : "I couldn't update that node.";
    return { type: "error", message: err };
  } catch (err) {
    return {
      type: "error",
      message: err?.message || "Failed to get suggested config. Please try again or configure the node manually.",
    };
  }
}

/**
 * Run replace-node path: remove target, generate replacement, return data for applyGeneratedNodesNow.
 * @returns {{ type: "success" | "missing" | "ambiguous" | "error" | "clarification" | "apply_generated", message?: string, data?: object }}
 */
export async function runReplaceNodePath({
  userMessage,
  diagram,
  canvasType,
  intent,
  getWorkflowContext,
  userContext,
  signal,
}) {
  const workflowContext = getWorkflowContext?.() || {};
  const existingNodes = diagram.model.nodeDataArray ?? [];
  const existingLinks = diagram.model.linkDataArray ?? [];
  const resolution = resolveActionTarget({
    diagram,
    workflowContext: { ...workflowContext, nodes: existingNodes },
    targetHint: intent.targetHint,
    targetStrategy: intent.targetStrategy,
  });

  if (resolution.status === "missing") {
    return {
      type: "missing",
      message: `I couldn't find a node matching "${intent.targetHint || "that"}". Please specify which node to replace by name, or select it and say "replace this with ...".`,
    };
  }

  if (resolution.status === "ambiguous" && resolution.candidates?.length) {
    const list = resolution.candidates.map((c) => c.name || c.text || c.type || c.key).filter(Boolean).join(", ");
    return {
      type: "ambiguous",
      data: {
        content: `More than one node matches. Which one do you mean? (${list}) Please specify by name or select the node.`,
      },
    };
  }

  if (resolution.status !== "resolved" || !resolution.nodeKey) {
    return { type: "error", message: "Target not resolved." };
  }

  const targetNodeKey = resolution.nodeKey;
  const links = existingLinks;
  const incoming = links.filter((l) => (l.to || l.toKey) === targetNodeKey);
  const outgoing = links.filter((l) => (l.from || l.fromKey) === targetNodeKey);
  const predecessorKey = incoming.length ? incoming[0].from || incoming[0].fromKey : null;
  const successorKey = outgoing.length ? outgoing[0].to || outgoing[0].toKey : null;
  const predecessorNode = predecessorKey ? existingNodes.find((n) => (n.key || n.id) === predecessorKey) : null;
  const successorNode = successorKey ? existingNodes.find((n) => (n.key || n.id) === successorKey) : null;

  const removeResult = await executeCanvasAction({
    diagram,
    canvasType,
    actionKind: "remove_node",
    operation: "remove",
    targetNodeKey,
  });

  if (!removeResult.success || !removeResult.removedKeys?.length) {
    return {
      type: "error",
      message: removeResult.errors?.length ? removeResult.errors.join(" ") : "I couldn't remove that node. Please try again.",
    };
  }

  const withMatch = (userMessage || "").match(/\breplace\s+.+?\s+with\s+(.+)/i);
  const rewrittenDesc = withMatch ? `add ${withMatch[1].trim()}` : `add ${userMessage.replace(/^\s*replace\s+/i, "").trim()}`;
  const insertOperation = predecessorKey ? "insert_after" : successorKey ? "insert_before" : "append";
  const anchorHint = predecessorKey
    ? (predecessorNode?.name || predecessorNode?.text || predecessorNode?.type || predecessorKey)
    : successorKey
      ? (successorNode?.name || successorNode?.text || successorNode?.type || successorKey)
      : null;
  const replaceIntent = {
    kind: "modify_form",
    operation: insertOperation,
    insert_after: insertOperation === "insert_after",
    insert_before: insertOperation === "insert_before",
    targetHint: anchorHint,
    needsTarget: insertOperation !== "append",
    actionKind: insertOperation === "insert_after" ? "insert_after" : insertOperation === "insert_before" ? "insert_before" : "add_nodes",
  };

  const workflowContextForGen = {
    ...workflowContext,
    canvasType,
    nodes: diagram.model.nodeDataArray ?? [],
    links: diagram.model.linkDataArray ?? [],
  };

  let genResult;
  try {
    genResult = await generateFlowStream(
      rewrittenDesc,
      workflowContextForGen,
      userContext,
      () => {},
      signal,
      { kind: "modify_form", operation: insertOperation, targetHint: anchorHint, actionKind: replaceIntent.actionKind, insertOnly: true }
    );
  } catch (err) {
    return {
      type: "error",
      message: err?.message || "I couldn't generate the replacement. Please try again.",
    };
  }

  if (genResult.needsClarification && genResult.clarificationQuestions?.length) {
    return {
      type: "clarification",
      data: { content: genResult.clarificationQuestions.join(" ") },
    };
  }

  if (!genResult.nodes?.length) {
    return {
      type: "error",
      message: "I couldn't generate a replacement node. Please try again with a clearer description.",
    };
  }

  return {
    type: "apply_generated",
    data: {
      planNodes: genResult.nodes,
      intent: replaceIntent,
      userMessage,
    },
  };
}

/**
 * Run disambiguation path: parse user reply, return single remove / bulk delete / error.
 * @returns {{ type: "success" | "error" | "bulk_delete" | "unclear", message?: string, data?: object }}
 */
export async function runDisambiguationPath({
  userMessage,
  pendingDisambiguation,
  diagram,
  canvasType,
}) {
  const selection = parseDisambiguationReply(pendingDisambiguation.candidates, userMessage);

  if (!selection || selection.keys.length === 0) {
    const numberedList = pendingDisambiguation.candidates
      .map((c, i) => {
        const label = c.name || c.text || c.description || c.type || c.key || "?";
        const desc = c.description && c.description !== (c.name || c.text) ? ` — ${c.description}` : "";
        return `(${i + 1}) ${label}${desc}`;
      })
      .join("; ");
    return {
      type: "unclear",
      message: `I didn't understand. I found: ${numberedList}. Reply with **both** or **all**, numbers like **1 and 2**, or the exact name(s).`,
    };
  }

  if (selection.keys.length === 1) {
    const removeResult = await executeCanvasAction({
      diagram,
      canvasType,
      actionKind: "remove_node",
      operation: "remove",
      targetNodeKey: selection.keys[0],
    });
    const label = selection.labels[0];
    if (removeResult.success && removeResult.removedKeys?.length) {
      return { type: "success", message: `Done! I removed "${label}".` };
    }
    const err = removeResult.errors?.length ? removeResult.errors.join(" ") : "I couldn't remove that node.";
    return { type: "error", message: err };
  }

  return {
    type: "bulk_delete",
    data: { keys: selection.keys, labels: selection.labels },
  };
}
