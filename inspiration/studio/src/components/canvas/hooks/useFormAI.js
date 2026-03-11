import { useState, useEffect, useCallback, useRef } from "react";
import { formAIHandler } from "../services/formAIHandler";
import { getNodeSrc } from "../extensions/extension-utils";
import { QUESTIONS_NODES } from "../extensions/question-setup/constants/questionNodes";
import { QuestionType } from "../../../module/constants";
import { IF_ELSE_NODE as IF_ELSE_NODE_V2 } from "../extensions/if-else/constants";
import { IF_ELSE_TYPE_V2 } from "../extensions/constants/types";
import * as go from "gojs";

const DEFAULT_STATE = {
  isLoading: false,
  status: "",
  step: "idle",
  retryCount: 0,
  hasWarnings: false,
  warnings: [],
  lastError: null,
};

export function useFormAI({ canvasRef, onConfirmClear, processFormData, saveNodeDataHandler }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const warningNodesRef = useRef(new Set());

  const defaultConfirmClear = useCallback(async () => {
    if (!canvasRef.current) return true;

    const existingNodes = canvasRef.current.getAllNodes();
    const hasExistingForm = existingNodes.some(
      (node) => node.type && node.template !== "placeholder"
    );

    if (hasExistingForm) {
      return window.confirm(
        "This will replace the existing form. Do you want to continue?"
      );
    }
    return true;
  }, [canvasRef]);

  const renderForm = useCallback(
    async (nodes, links = []) => {
      if (!canvasRef.current) {
        return;
      }

      const diagram = canvasRef.current.getDiagram();
      if (!diagram) {
        return;
      }

      // Verify diagram initialization
      if (diagram.isReadOnly) {
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

      // processFormData and saveNodeDataHandler are required
      if (!processFormData || !saveNodeDataHandler) {
        const error = new Error('[FormAI Render] processFormData and saveNodeDataHandler are required');
        throw error;
      }

      try {
        // Prepare data in the format expected by processFormData
        const formData = {
          nodes: nodes,
          links: links || []
        };

        await processFormData(formData, saveNodeDataHandler);

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
    [canvasRef, processFormData, saveNodeDataHandler]
  );

  const animateNewNodes = (diagram) => {
    diagram.nodes.each((node) => {
      if (node.data?._aiGenerated) {
        if (node.actualBounds && node.actualBounds.width > 0 && node.actualBounds.height > 0) {
          const animation = new go.Animation();
          animation.duration = 500;
          animation.easing = go.Animation.EaseOutQuad;
          animation.add(node, "opacity", 0, 1);
          animation.add(node, "scale", 0.8, 1);
          animation.start();
        }
      }
    });
  };

  const handleRetry = useCallback((prompt, sessionId) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "FORM_AI_RETRY",
          payload: { prompt, sessionId },
        },
        "*"
      );
    } else {
      const retryEvent = new CustomEvent("FORM_AI_RETRY", {
        detail: { prompt, sessionId },
      });
      window.dispatchEvent(retryEvent);
    }
  }, []);

  useEffect(() => {
    formAIHandler.init({
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
      onRender: renderForm,
      onRetry: handleRetry,
    });

    return () => {
      formAIHandler.destroy();
    };
  }, [onConfirmClear, defaultConfirmClear, renderForm, handleRetry]);

  const retry = useCallback(() => {
    formAIHandler.retry();
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
