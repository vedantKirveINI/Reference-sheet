import { useMemo } from "react";
import { useSelector } from "react-redux";
import { isTriggerNodeType } from "../constants/node-rules";

export function useCanvasContext() {
  const nodes = useSelector((state) => state.canvas?.nodes || []);
  const selectedNodeId = useSelector((state) => state.canvas?.selectedNodeId || null);

  const context = useMemo(() => {
    const selectedNode = selectedNodeId
      ? nodes.find((n) => n.id === selectedNodeId) || null
      : null;

    const hasTrigger = nodes.some((node) => {
      if (!node) return false;
      return isTriggerNodeType(node.type) || 
             isTriggerNodeType(node.subType) ||
             node.metadata?.triggerType ||
             node.template === "trigger" ||
             node.module === "trigger";
    });

    const workflowShape = nodes
      .filter((n) => n && n.type)
      .slice(0, 10)
      .map((n) => n.name || n.type);

    let selectedNodeType = null;
    if (selectedNode) {
      if (isTriggerNodeType(selectedNode.type) || isTriggerNodeType(selectedNode.subType)) {
        selectedNodeType = "trigger";
      } else if (selectedNode.category === "utility" || selectedNode.type?.includes("UTILITY")) {
        selectedNodeType = "utility";
      } else {
        selectedNodeType = "action";
      }
    }

    return {
      selectedNode: selectedNode
        ? {
            id: selectedNode.id,
            type: selectedNode.type,
            subType: selectedNode.subType,
            name: selectedNode.name || selectedNode.type,
            integrationName: selectedNode.integrationName || selectedNode.integration,
            category: selectedNode.category,
          }
        : null,
      selectedNodeType,
      hasTrigger,
      workflowShape,
    };
  }, [nodes, selectedNodeId]);

  return context;
}

export function getMockCanvasContext() {
  return {
    selectedNode: null,
    selectedNodeType: null,
    hasTrigger: false,
    workflowShape: [],
  };
}
