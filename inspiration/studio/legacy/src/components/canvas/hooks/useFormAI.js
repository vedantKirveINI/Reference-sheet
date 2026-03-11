import { useState, useEffect, useCallback, useRef } from "react";
import { formAIHandler } from "../services/formAIHandler";
import { getNodeSrc } from "../extensions/extension-utils";
import { QUESTIONS_NODES } from "../extensions/question-setup/constants/questionNodes";
import { QuestionType } from "../../../module/constants";
import IF_ELSE_NODE_V2 from "../extensions/if-else-v2/constant";
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
        console.warn('[FormAI Render] canvasRef.current is null');
        return;
      }

      const diagram = canvasRef.current.getDiagram();
      if (!diagram) {
        console.warn('[FormAI Render] diagram is null');
        return;
      }

      // Phase 4: Verify diagram initialization
      if (diagram.isReadOnly) {
        console.warn('[FormAI Render] Diagram is read-only');
        return;
      }

      // Phase 4: Log diagram state
      if (process.env.NODE_ENV === 'development') {
        console.log('[FormAI Render] Diagram state:', {
          isReadOnly: diagram.isReadOnly,
          isEnabled: diagram.isEnabled,
          viewportBounds: diagram.viewportBounds ? {
            x: diagram.viewportBounds.x,
            y: diagram.viewportBounds.y,
            width: diagram.viewportBounds.width,
            height: diagram.viewportBounds.height
          } : null,
          documentBounds: diagram.documentBounds ? {
            x: diagram.documentBounds.x,
            y: diagram.documentBounds.y,
            width: diagram.documentBounds.width,
            height: diagram.documentBounds.height
          } : null
        });
      }

      // Phase 7: Handle edge cases
      if (!nodes || nodes.length === 0) {
        console.warn('[FormAI Render] No nodes to render');
        return;
      }

      // Phase 4: Verify transaction state before starting
      if (process.env.NODE_ENV === 'development') {
        console.log('[FormAI Render] Transaction state before clear:', {
          isTransactionInProgress: diagram.isTransactionInProgress
        });
      }

      // Clear existing nodes first
      diagram.startTransaction("clearForAI");
      diagram.model.nodeDataArray = [];
      diagram.model.linkDataArray = [];
      diagram.commitTransaction("clearForAI");

      // processFormData and saveNodeDataHandler are required
      if (!processFormData || !saveNodeDataHandler) {
        const error = new Error('[FormAI Render] processFormData and saveNodeDataHandler are required');
        console.error(error.message);
        throw error;
      }

      try {
        // Prepare data in the format expected by processFormData
        const formData = {
          nodes: nodes,
          links: links || []
        };

        if (process.env.NODE_ENV === 'development') {
          console.log('[FormAI Render] Calling processFormData with:', {
            nodeCount: nodes.length,
            linkCount: links?.length || 0,
            hasIfElse: nodes.some(n => n.type === 'IFELSE_V2' || n.type === 'IF_ELSE_TYPE_V2')
          });
        }

        await processFormData(formData, saveNodeDataHandler);

        if (process.env.NODE_ENV === 'development') {
          console.log('[FormAI Render] processFormData completed successfully');
          
          // Log final state
          const finalNodeCount = diagram.model.nodeDataArray.length;
          const finalLinkCount = diagram.model.linkDataArray.length;
          console.log('[FormAI Render] Final state:', {
            nodesInModel: finalNodeCount,
            linksInModel: finalLinkCount,
            nodesInDiagram: diagram.nodes.count
          });
        }

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
        console.error('[FormAI Render] Error in processFormData:', error);
        throw error;
      }
    },
    [canvasRef, processFormData, saveNodeDataHandler]
  );

  const animateNewNodes = (diagram) => {
    let animatedCount = 0;
    diagram.nodes.each((node) => {
      if (node.data?._aiGenerated) {
        // Phase 6: Check if node has valid bounds before animating
        if (node.actualBounds && node.actualBounds.width > 0 && node.actualBounds.height > 0) {
          const animation = new go.Animation();
          animation.duration = 500;
          animation.easing = go.Animation.EaseOutQuad;
          animation.add(node, "opacity", 0, 1);
          animation.add(node, "scale", 0.8, 1);
          animation.start();
          animatedCount++;
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[FormAI Render] Skipping animation for node ${node.data?.key} - invalid bounds:`, {
              bounds: node.actualBounds,
              width: node.actualBounds?.width,
              height: node.actualBounds?.height
            });
          }
        }
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[FormAI Render] Animated ${animatedCount} nodes`);
    }
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
