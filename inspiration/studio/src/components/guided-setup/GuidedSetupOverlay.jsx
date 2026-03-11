import React, { useEffect, useRef, useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import * as go from "gojs";
import SetupCard from "./SetupCard";
import GuidedProgressRail from "./GuidedProgressRail";
import CompletionCard from "./CompletionCard";
import { useGuidedSetup } from "./hooks/useGuidedSetup";
import { GUIDED_STATES, DIM_OPACITY, ACTIVE_OPACITY, AUTO_PAN_DURATION_MS } from "./constants";
import { getNodeIcon, getFriendlyName } from "./utils/essentialFields";

const GUIDED_DATA_KEY = "_guidedSetupActive";
const GUIDED_CURRENT_KEY = "_guidedSetupCurrent";

function setNodeOpacity(diagram, activeKey) {
  if (!diagram) return;
  diagram.startTransaction("guidedDim");
  diagram.nodes.each((node) => {
    const isActive = node.data?.key === activeKey;
    diagram.model.setDataProperty(
      node.data,
      "_guidedOpacity",
      isActive ? ACTIVE_OPACITY : DIM_OPACITY
    );
    diagram.model.setDataProperty(
      node.data,
      GUIDED_CURRENT_KEY,
      isActive
    );
  });
  diagram.links.each((link) => {
    const fromKey = link.data?.from;
    const toKey = link.data?.to;
    const isConnected = fromKey === activeKey || toKey === activeKey;
    link.opacity = isConnected ? 1 : DIM_OPACITY;
  });
  diagram.commitTransaction("guidedDim");
}

function clearAllOpacity(diagram) {
  if (!diagram) return;
  diagram.startTransaction("guidedClear");
  diagram.nodes.each((node) => {
    diagram.model.setDataProperty(node.data, "_guidedOpacity", 1);
    diagram.model.setDataProperty(node.data, GUIDED_CURRENT_KEY, false);
  });
  diagram.links.each((link) => {
    link.opacity = 1;
  });
  diagram.model.setDataProperty(
    diagram.model.modelData,
    GUIDED_DATA_KEY,
    false
  );
  diagram.commitTransaction("guidedClear");
}

function panToNode(diagram, nodeKey) {
  if (!diagram) return;
  const node = diagram.findNodeForKey(nodeKey);
  if (!node) return;

  const nodeBounds = node.actualBounds;
  const vpW = diagram.viewportBounds.width;
  const vpH = diagram.viewportBounds.height;

  const targetX = nodeBounds.centerX - vpW / 3;
  const targetY = nodeBounds.centerY - vpH / 2;

  const animation = new go.Animation();
  animation.add(
    diagram,
    "position",
    diagram.position,
    new go.Point(targetX, targetY)
  );
  animation.duration = AUTO_PAN_DURATION_MS;
  animation.start();
}

function getNodeScreenPosition(diagram, nodeKey) {
  if (!diagram) return null;
  const node = diagram.findNodeForKey(nodeKey);
  if (!node) return null;

  const nodeBounds = node.actualBounds;
  const docPoint = new go.Point(nodeBounds.centerX, nodeBounds.bottom);
  const viewPoint = diagram.transformDocToView(docPoint);

  const canvasDiv = diagram.div;
  if (!canvasDiv) return null;

  const rect = canvasDiv.getBoundingClientRect();
  return {
    x: rect.left + viewPoint.x,
    y: rect.top + viewPoint.y,
  };
}

function refreshNodeInQueue(nodeQueue, diagram, index) {
  if (!diagram || index < 0 || index >= nodeQueue.length) return nodeQueue;
  const entry = nodeQueue[index];
  const node = diagram.findNodeForKey(entry.key);
  if (!node?.data) return nodeQueue;

  let clonedGoData;
  try {
    clonedGoData = structuredClone(node.data.go_data || {});
  } catch {
    clonedGoData = JSON.parse(JSON.stringify(node.data.go_data || {}));
  }
  const freshData = { ...node.data, go_data: clonedGoData };
  const updated = [...nodeQueue];
  updated[index] = {
    ...entry,
    icon: getNodeIcon(node.data),
    config: node.data.config || node.data.go_data?.flow?.config || {},
    nodeData: freshData,
  };
  return updated;
}

const GuidedSetupOverlay = ({
  canvasRef,
  onOpenNodeDrawer,
  onCloseNodeDrawer,
  onGuidedContextChange,
  onTestWorkflow,
  onPublish,
  isNodeDrawerOpen = false,
}) => {
  const guidedSetup = useGuidedSetup(canvasRef);
  const {
    state,
    nodeQueue,
    currentIndex,
    currentNode,
    stepStatuses,
    completedCount,
    skippedCount,
    totalSteps,
    isActive,
    isComplete,
    completeStep,
    skipStep,
    goToPrevious,
    exitGuide,
    resetToIdle,
    setNodeQueue,
  } = guidedSetup;

  const [cardPosition, setCardPosition] = useState(null);
  const positionTimerRef = useRef(null);
  const prevDrawerOpenRef = useRef(isNodeDrawerOpen);

  const getDiagram = useCallback(() => {
    return canvasRef?.current?.getDiagram?.() || canvasRef?.current;
  }, [canvasRef]);

  const updateCardPosition = useCallback(() => {
    if (!currentNode) return;
    const diagram = getDiagram();
    if (!diagram) return;

    const pos = getNodeScreenPosition(diagram, currentNode.key);
    if (pos) {
      setCardPosition(pos);
    }
  }, [currentNode, getDiagram]);

  useEffect(() => {
    if (!isActive || !currentNode) return;

    const diagram = getDiagram();
    if (!diagram) return;

    diagram.model.setDataProperty(
      diagram.model.modelData,
      GUIDED_DATA_KEY,
      true
    );

    setNodeOpacity(diagram, currentNode.key);

    panToNode(diagram, currentNode.key);

    const timer = setTimeout(() => {
      updateCardPosition();
    }, AUTO_PAN_DURATION_MS + 50);

    return () => clearTimeout(timer);
  }, [isActive, currentNode, getDiagram, updateCardPosition]);

  useEffect(() => {
    if (!isActive) return;

    const diagram = getDiagram();
    if (!diagram) return;

    const handleViewportChanged = () => {
      if (positionTimerRef.current) {
        cancelAnimationFrame(positionTimerRef.current);
      }
      positionTimerRef.current = requestAnimationFrame(updateCardPosition);
    };

    diagram.addDiagramListener("ViewportBoundsChanged", handleViewportChanged);
    return () => {
      diagram.removeDiagramListener("ViewportBoundsChanged", handleViewportChanged);
      if (positionTimerRef.current) {
        cancelAnimationFrame(positionTimerRef.current);
      }
    };
  }, [isActive, getDiagram, updateCardPosition]);

  useEffect(() => {
    if (state === GUIDED_STATES.IDLE || state === GUIDED_STATES.COMPLETE) {
      const diagram = getDiagram();
      if (diagram) {
        clearAllOpacity(diagram);
      }
    }
  }, [state, getDiagram]);

  useEffect(() => {
    const wasOpen = prevDrawerOpenRef.current;
    prevDrawerOpenRef.current = isNodeDrawerOpen;

    if (!isActive) return;

    if (wasOpen && !isNodeDrawerOpen) {
      onGuidedContextChange?.(null);

      const diagram = getDiagram();
      if (diagram) {
        const updated = refreshNodeInQueue(nodeQueue, diagram, currentIndex);
        if (updated !== nodeQueue) {
          setNodeQueue(updated);
        }
      }

      setTimeout(() => {
        updateCardPosition();
      }, 100);
    }
  }, [isNodeDrawerOpen, isActive, getDiagram, nodeQueue, currentIndex, setNodeQueue, updateCardPosition, onGuidedContextChange]);

  const handleSaveAndNextFromDrawer = useCallback(() => {
    const diagram = getDiagram();
    if (diagram) {
      const updated = refreshNodeInQueue(nodeQueue, diagram, currentIndex);
      if (updated !== nodeQueue) {
        setNodeQueue(updated);
      }
    }
    completeStep();
  }, [getDiagram, nodeQueue, currentIndex, setNodeQueue, completeStep]);

  const handleConfigure = useCallback(() => {
    if (!currentNode) return;
    const guidedContext = {
      stepNumber: currentIndex + 1,
      totalSteps,
      nodeKey: currentNode.key,
      activeTab: null,
      onAdvance: handleSaveAndNextFromDrawer,
    };
    onOpenNodeDrawer?.(currentNode.key, guidedContext);
  }, [currentNode, currentIndex, totalSteps, onOpenNodeDrawer, handleSaveAndNextFromDrawer]);

  const handleBackToOverview = useCallback(() => {
    onCloseNodeDrawer?.();
  }, [onCloseNodeDrawer]);

  const handleDone = useCallback(() => {
    completeStep();
  }, [completeStep]);

  const handleSkip = useCallback(() => {
    skipStep();
  }, [skipStep]);

  const handleExitGuide = useCallback(() => {
    onGuidedContextChange?.(null);
    exitGuide();
  }, [exitGuide, onGuidedContextChange]);

  const handleDismissCompletion = useCallback(() => {
    onGuidedContextChange?.(null);
    const diagram = getDiagram();
    if (diagram) {
      clearAllOpacity(diagram);
    }
    resetToIdle();
  }, [getDiagram, resetToIdle, onGuidedContextChange]);

  const handleTestWorkflow = useCallback(() => {
    handleDismissCompletion();
    onTestWorkflow?.();
  }, [handleDismissCompletion, onTestWorkflow]);

  const handlePublish = useCallback(() => {
    handleDismissCompletion();
    onPublish?.();
  }, [handleDismissCompletion, onPublish]);

  if (state === GUIDED_STATES.IDLE) return null;

  return (
    <>
      {isActive && !isNodeDrawerOpen && (
        <div
          className="fixed inset-0 z-[9990] pointer-events-none"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.06)" }}
        />
      )}

      <AnimatePresence mode="wait">
        {isActive && currentNode && !isNodeDrawerOpen && (
          <SetupCard
            key={`setup-${currentNode.key}`}
            node={currentNode}
            stepNumber={currentIndex + 1}
            totalSteps={totalSteps}
            onConfigure={handleConfigure}
            onSkip={handleSkip}
            onDone={handleDone}
            onExit={handleExitGuide}
            position={cardPosition}
          />
        )}

        {isComplete && (
          <CompletionCard
            key="completion"
            completedCount={completedCount}
            skippedCount={skippedCount}
            totalSteps={totalSteps}
            onTestWorkflow={handleTestWorkflow}
            onPublish={handlePublish}
            onDismiss={handleDismissCompletion}
            onFixSkipped={handleExitGuide}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isActive || (isComplete && !isNodeDrawerOpen)) && (
          <GuidedProgressRail
            nodeQueue={nodeQueue}
            stepStatuses={stepStatuses}
            currentIndex={currentIndex}
            completedCount={completedCount}
            skippedCount={skippedCount}
            totalSteps={totalSteps}
            onExit={handleExitGuide}
            isNodeDrawerOpen={isNodeDrawerOpen}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export { GUIDED_DATA_KEY, GUIDED_CURRENT_KEY };
export default GuidedSetupOverlay;
