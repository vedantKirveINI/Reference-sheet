import { useState, useEffect, useCallback, useRef } from "react";
import { workflowAIHandler } from "../services/workflowAIHandler";

const DEFAULT_STATE = {
  isLoading: false,
  status: "",
  step: "idle",
  retryCount: 0,
  hasWarnings: false,
  warnings: [],
  lastError: null,
};

/**
 * Transform workflow data from tinyBus format to processWorkflowData format
 * @param {Array} nodes - Array of nodes from tinyBus (includes trigger)
 * @param {Array} edges - Array of edges from tinyBus
 * @returns {Object} Transformed data in format { trigger, actions, links }
 */
const transformWorkflowData = (nodes, edges) => {
  if (!nodes || nodes.length === 0) {
    throw new Error('[WorkflowAI] No nodes provided for transformation');
  }

  // Find trigger node (first node or node with TRIGGER in type/category)
  const triggerNode = nodes.find(n => 
    n.type?.includes('TRIGGER') || 
    n.category === 'TRIGGER' ||
    (n.type && typeof n.type === 'string' && n.type.toUpperCase().includes('TRIGGER'))
  ) || nodes[0];
  
  // Separate action nodes (all nodes except trigger)
  const actionNodes = nodes.filter(n => n.id !== triggerNode.id);
  
  // Transform edges to links format (map source/target to from/to)
  const links = (edges || []).map(edge => ({
    from: edge.source || edge.from,
    to: edge.target || edge.to,
    ...(edge.branch && { condition: edge.branch })
  }));
  
  return {
    trigger: {
      id: triggerNode.id,
      config: {
        id: triggerNode.id,
        type: triggerNode.type,
        name: triggerNode.name,
        description: triggerNode.description
      }
    },
    actions: actionNodes.map(node => ({
      id: node.id,
      config: {
        id: node.id,
        type: node.type,
        name: node.name,
        description: node.description
      }
    })),
    links
  };
};

export function useWorkflowAI({ canvasRef, onConfirmClear, processWorkflowData, saveNodeDataHandler, nodeIdMap }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const warningNodesRef = useRef(new Set());

  const defaultConfirmClear = useCallback(async () => {
    if (!canvasRef.current) return true;

    const existingNodes = canvasRef.current.getAllNodes();
    const hasExistingWorkflow = existingNodes.some(
      (node) => node.type && node.template !== "placeholder"
    );

    if (hasExistingWorkflow) {
      return window.confirm(
        "This will replace the existing workflow. Do you want to continue?"
      );
    }
    return true;
  }, [canvasRef]);

  const renderWorkflow = useCallback(
    async (nodes, edges) => {
      if (!canvasRef.current) {
        return;
      }

      const diagram = canvasRef.current.getDiagram();
      if (!diagram) {
        return;
      }

      // Handle edge cases
      if (!nodes || nodes.length === 0) {
        return;
      }

      // Clear existing nodes first
      diagram.startTransaction("clearForAI");
      diagram.model.nodeDataArray = [];
      diagram.model.linkDataArray = [];
      diagram.commitTransaction("clearForAI");

      // processWorkflowData and saveNodeDataHandler are required
      if (!processWorkflowData || !saveNodeDataHandler) {
        const error = new Error('[WorkflowAI Render] processWorkflowData and saveNodeDataHandler are required');
        throw error;
      }

      try {
        // Transform tinyBus data format to processWorkflowData format
        const transformedData = transformWorkflowData(nodes, edges);

        // Use nodeIdMap if provided, otherwise use empty object
        const nodeIdMapToUse = nodeIdMap || {};

        await processWorkflowData(transformedData, saveNodeDataHandler, nodeIdMapToUse);

        // Auto-align after nodes are created
        if (canvasRef.current?.autoAlign) {
          canvasRef.current.autoAlign();
        }

        // Center viewport on first node if available
        if (diagram.nodes.count > 0) {
          const firstNode = diagram.nodes.first();
          if (firstNode && firstNode.actualBounds) {
            diagram.centerRect(firstNode.actualBounds);
          } else {
            diagram.centerRect(diagram.documentBounds);
          }
        }
      } catch (error) {
        throw error;
      }
    },
    [canvasRef, processWorkflowData, saveNodeDataHandler, nodeIdMap]
  );


  const handleRetry = useCallback((prompt, sessionId) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "WORKFLOW_AI_RETRY",
          payload: { prompt, sessionId },
        },
        "*"
      );
    } else {
      const retryEvent = new CustomEvent("WORKFLOW_AI_RETRY", {
        detail: { prompt, sessionId },
      });
      window.dispatchEvent(retryEvent);
    }
  }, []);

  useEffect(() => {
    workflowAIHandler.init({
      onStateChange: (newState) => {
        setState(newState);

        if (newState.warnings && newState.warnings.length > 0) {
          warningNodesRef.current = new Set(
            newState.warnings
              .filter((w) => w.includes("Node"))
              .map((w) => {
                const match = w.match(/Node "([^"]+)"/);
                return match ? match[1] : "";
              })
              .filter(Boolean)
          );
        }
      },
      onConfirmClear: onConfirmClear || defaultConfirmClear,
      onRender: renderWorkflow,
      onRetry: handleRetry,
    });

    return () => {
      workflowAIHandler.destroy();
    };
  }, [onConfirmClear, defaultConfirmClear, renderWorkflow, handleRetry]);

  const retry = useCallback(() => {
    workflowAIHandler.retry();
  }, []);

  const hasError = !!state.lastError;
  const isVisible = state.isLoading || hasError;
  const errorMessage = state.lastError?.message || "";

  return {
    state,
    retry,
    hasError,
    isVisible,
    errorMessage,
  };
}
