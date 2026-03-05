import { resolveActionTarget } from "../intent/resolveActionTarget.js";
import { executeCanvasAction } from "../builder/executeCanvasAction.js";
import { findLastNodeInChain } from "../builder/connectionRules.js";

function toUserSafeErrorMessage(err) {
  const msg = (err || "").toString();
  if (msg.startsWith("Node not found:")) {
    return "I couldn't find that node on the canvas. Please try again.";
  }
  if (msg.includes("requires targetNodeKey")) {
    return "I need you to specify which node you mean (or select it) before I can do that.";
  }
  return msg || "I couldn't apply that action. Please try again.";
}

function isSupportedKind(kind) {
  return kind === "remove" || kind === "update" || kind === "add_or_insert" || kind === "build" || kind === "explain";
}

function userSaidAll(userMessage) {
  if (!userMessage || typeof userMessage !== "string") return false;
  return /\ball\b/i.test(userMessage.trim());
}

export async function executeActionPlanSteps({
  plan,
  diagram,
  canvasType,
  getWorkflowContext,
  saveNodeDataHandler,
  applyGeneratedNodesNow,
  userMessage,
  allowPlacementFallback = false,
}) {
  // Pre-flight: avoid partial execution.
  const allSteps = Array.isArray(plan?.steps) ? plan.steps : [];
  for (const s of allSteps) {
    const kind = s?.kind;
    if (kind && !isSupportedKind(kind)) {
      return {
        ok: false,
        kind: "error",
        error: "I can't apply that plan yet (unsupported step type). Please try a simpler request.",
      };
    }
  }

  const ctx = getWorkflowContext?.() || {};
  const nodes = diagram?.model?.nodeDataArray || [];

  // Safety backstop: multiple remove steps for same type/label without "all" → ambiguous.
  const removeSteps = allSteps.filter((s) => s?.kind === "remove");
  if (removeSteps.length >= 2 && !userSaidAll(userMessage)) {
    const keysByKey = removeSteps
      .filter((s) => s?.target?.by === "key" && typeof s?.target?.value === "string" && s.target.value.trim())
      .map((s) => s.target.value.trim());
    if (keysByKey.length >= 2) {
      const nodeDataArray = diagram?.model?.nodeDataArray ?? [];
      const getNode = (key) => nodeDataArray.find((n) => (n.key || n.id) === key);
      const types = keysByKey.map((k) => {
        const n = getNode(k);
        return (n?.type || n?.subType || "").toString().toLowerCase();
      });
      const firstType = types[0];
      const sameType = firstType && types.every((t) => t === firstType);
      if (sameType) {
        const candidates = keysByKey.map((key) => {
          const n = getNode(key);
          return { key, name: n?.name ?? n?.text, type: n?.type ?? n?.subType };
        });
        return { ok: false, kind: "ambiguous", resolution: { status: "ambiguous", candidates } };
      }
    }
  }

  for (const step of allSteps) {
    if (!step?.kind) continue;

    if (step.kind === "remove") {
      // If backend gave us a key, use it directly.
      if (step.target?.by === "key" && typeof step.target?.value === "string" && step.target.value.trim()) {
        const result = await executeCanvasAction({
          diagram,
          canvasType,
          actionKind: "remove_node",
          operation: "remove",
          targetNodeKey: step.target.value.trim(),
        });
        if (!result.success) {
          return { ok: false, kind: "error", error: toUserSafeErrorMessage(result.errors?.join(" ") || "remove failed") };
        }
        continue;
      }

      const resolution = resolveActionTarget({
        diagram,
        workflowContext: { ...ctx, nodes },
        targetHint: step.target?.value || null,
        targetStrategy: step.target?.by === "selected" ? "focused" : undefined,
      });

      if (resolution.status === "missing") {
        return { ok: false, kind: "missing", resolution };
      }

      if (resolution.status === "ambiguous" && resolution.candidates?.length) {
        return { ok: false, kind: "ambiguous", resolution };
      }

      if (resolution.status !== "resolved" || !resolution.nodeKey) {
        return { ok: false, kind: "error", error: "Target not resolved", resolution };
      }

      const result = await executeCanvasAction({
        diagram,
        canvasType,
        actionKind: "remove_node",
        operation: "remove",
        targetNodeKey: resolution.nodeKey,
      });

      if (!result.success) {
        return { ok: false, kind: "error", error: toUserSafeErrorMessage(result.errors?.join(" ") || "remove failed") };
      }

      continue;
    }

    if (step.kind === "update") {
      if (step.target?.by === "key" && typeof step.target?.value === "string" && step.target.value.trim()) {
        const patch = step.patchIntent || {};
        const payload = {
          ...(patch.name != null ? { name: patch.name, text: patch.text ?? patch.name } : null),
          ...(patch.go_data && typeof patch.go_data === "object" ? { go_data: patch.go_data } : null),
        };
        const result = await executeCanvasAction({
          diagram,
          canvasType,
          actionKind: "update_node",
          operation: "update",
          targetNodeKey: step.target.value.trim(),
          payload,
          saveNodeDataHandler,
        });
        if (!result.success) {
          return { ok: false, kind: "error", error: toUserSafeErrorMessage(result.errors?.join(" ") || "update failed") };
        }
        continue;
      }

      const resolution = resolveActionTarget({
        diagram,
        workflowContext: { ...ctx, nodes },
        targetHint: step.target?.value || null,
        targetStrategy: step.target?.by === "selected" ? "focused" : undefined,
      });

      if (resolution.status === "missing") {
        return { ok: false, kind: "missing", resolution };
      }

      if (resolution.status === "ambiguous" && resolution.candidates?.length) {
        return { ok: false, kind: "ambiguous", resolution };
      }

      if (resolution.status !== "resolved" || !resolution.nodeKey) {
        return { ok: false, kind: "error", error: "Target not resolved", resolution };
      }

      const patch = step.patchIntent || {};
      const payload = {
        ...(patch.name != null ? { name: patch.name, text: patch.text ?? patch.name } : null),
        ...(patch.go_data && typeof patch.go_data === "object" ? { go_data: patch.go_data } : null),
      };

      if (Object.keys(payload).length === 0) {
        return { ok: false, kind: "error", error: "Missing patchIntent (nothing to update)." };
      }

      const result = await executeCanvasAction({
        diagram,
        canvasType,
        actionKind: "update_node",
        operation: "update",
        targetNodeKey: resolution.nodeKey,
        payload,
        saveNodeDataHandler,
      });

      if (!result.success) {
        return { ok: false, kind: "error", error: toUserSafeErrorMessage(result.errors?.join(" ") || "update failed") };
      }

      continue;
    }

    if (step.kind === "add_or_insert" || step.kind === "build") {
      let insertMode = step.insertMode || "append";
      let needsTarget = insertMode === "insert_after" || insertMode === "insert_before";
      let anchorHint = step.anchorTarget?.value || null;

      const links = diagram?.model?.linkDataArray || [];
      const lastInChain = findLastNodeInChain(nodes, links);

      if (allowPlacementFallback && insertMode === "append" && lastInChain) {
        insertMode = "insert_before";
        needsTarget = true;
        anchorHint = lastInChain.key || lastInChain.id;
      }

      if (needsTarget && !anchorHint) {
        return { ok: false, kind: "missing", resolution: { status: "missing" } };
      }

      const applyResult = await applyGeneratedNodesNow({
        planNodes: Array.isArray(step.planNodes) ? step.planNodes : [],
        intent: {
          kind: "modify_form",
          operation: insertMode,
          actionKind: insertMode === "insert_after" ? "insert_after" : insertMode === "insert_before" ? "insert_before" : "add_nodes",
          needsTarget,
          targetHint: anchorHint,
          targetStrategy: step.anchorTarget?.by === "selected" ? "focused" : undefined,
        },
      });

      if (applyResult === null) {
        return { ok: false, kind: "error", error: "Could not add the nodes. The target may not exist or the action was blocked." };
      }
      if (typeof applyResult === "string" && applyResult.startsWith("Couldn't")) {
        return { ok: false, kind: "error", error: applyResult };
      }

      continue;
    }

    if (step.kind === "explain") {
      continue;
    }
  }

  return { ok: true };
}
