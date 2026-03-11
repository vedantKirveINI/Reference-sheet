import { canvasToPreviewFlow, getFriendlyNodeName, getNodeIcon, getSetupGuidance } from "./canvas/canvasToPreviewFlow";

export { getFriendlyNodeName, getNodeIcon, getSetupGuidance };

const formPreviewLog = (...args) => console.log("[FormPreview]", ...args);

export async function previewSafeTransform(payload) {
  if (!payload) {
    formPreviewLog("previewSafeTransform: no payload");
    return {
      status: "failed",
      nodes: null,
      errorMessage: "No form data available",
    };
  }
  const hasR = !!payload._r;
  const nodeCount = payload._r?.nodeDataArray?.length ?? "?";
  formPreviewLog("previewSafeTransform: start", "has _r:", hasR, "nodeDataArray length:", nodeCount);

  const result = canvasToPreviewFlow(payload);

  formPreviewLog("previewSafeTransform: canvasToPreviewFlow result", "status:", result.status, "error:", result.error, "errorType:", result.errorType);
  if (result.status === "error" && result.errorNodes?.length) {
    formPreviewLog("previewSafeTransform: errorNodes", result.errorNodes);
  }
  if (result.allUnconfiguredNodes?.length) {
    formPreviewLog("previewSafeTransform: allUnconfiguredNodes", result.allUnconfiguredNodes.length, result.allUnconfiguredNodes.map((n) => ({ key: n.nodeKey, type: n.nodeType, name: n.nodeName, error: n.error })));
  }
  if (result.firstUnconfiguredBoundary) {
    formPreviewLog("previewSafeTransform: firstUnconfiguredBoundary", result.firstUnconfiguredBoundary);
  }

  if (result.status === "error" && result.errorType === "MULTIPLE_ENTRY_POINTS") {
    return {
      status: "error",
      nodes: null,
      errorType: "MULTIPLE_ENTRY_POINTS",
      errorMessage: result.errorMessage,
      errorNodes: result.errorNodes || [],
    };
  }

  if (result.status === "success") {
    return {
      status: "success",
      nodes: result.result?.flow || {},
      allUnconfiguredNodes: result.allUnconfiguredNodes || [],
      firstUnconfiguredBoundary: result.firstUnconfiguredBoundary || null,
      hasUnconfiguredNodes: result.hasUnconfiguredNodes || false,
    };
  }

  if (result.status === "partial") {
    return {
      status: "partial",
      nodes: null,
      allUnconfiguredNodes: result.allUnconfiguredNodes || [],
      firstUnconfiguredBoundary: result.firstUnconfiguredBoundary || null,
    };
  }

  return {
    status: "failed",
    nodes: null,
    errorMessage: result.error || "Failed to load preview",
  };
}
