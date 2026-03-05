import { useState, useCallback, useRef, useEffect } from "react";
import {
  GUIDED_STATES,
  NODE_STEP_STATUS,
  GUIDED_SETUP_EVENT,
} from "../constants";
import { buildNodeQueue, estimateSetupTime } from "../utils/essentialFields";

export function useGuidedSetup(canvasRef) {
  const [state, setState] = useState(GUIDED_STATES.IDLE);
  const [nodeQueue, setNodeQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stepStatuses, setStepStatuses] = useState({});
  const [estimatedTime, setEstimatedTime] = useState("");
  const exitCallbackRef = useRef(null);

  const currentNode = nodeQueue[currentIndex] || null;

  const completedCount = Object.values(stepStatuses).filter(
    (s) => s === NODE_STEP_STATUS.COMPLETED
  ).length;
  const skippedCount = Object.values(stepStatuses).filter(
    (s) => s === NODE_STEP_STATUS.SKIPPED
  ).length;

  const startGuide = useCallback(
    (nodeKeys, diagram) => {
      if (!diagram || !nodeKeys?.length) return;

      const queue = buildNodeQueue(nodeKeys, diagram);
      if (queue.length === 0) return;

      const initialStatuses = {};
      queue.forEach((node, idx) => {
        initialStatuses[node.key] =
          idx === 0 ? NODE_STEP_STATUS.ACTIVE : NODE_STEP_STATUS.PENDING;
      });

      setNodeQueue(queue);
      setCurrentIndex(0);
      setStepStatuses(initialStatuses);
      setEstimatedTime(estimateSetupTime(queue));
      setState(GUIDED_STATES.GUIDING);
    },
    []
  );

  const completeStep = useCallback(() => {
    if (!currentNode) return;

    setStepStatuses((prev) => ({
      ...prev,
      [currentNode.key]: NODE_STEP_STATUS.COMPLETED,
    }));

    const nextIndex = currentIndex + 1;
    if (nextIndex >= nodeQueue.length) {
      setState(GUIDED_STATES.COMPLETE);
    } else {
      setCurrentIndex(nextIndex);
      setStepStatuses((prev) => ({
        ...prev,
        [nodeQueue[nextIndex].key]: NODE_STEP_STATUS.ACTIVE,
      }));
    }
  }, [currentNode, currentIndex, nodeQueue]);

  const skipStep = useCallback(() => {
    if (!currentNode) return;

    setStepStatuses((prev) => ({
      ...prev,
      [currentNode.key]: NODE_STEP_STATUS.SKIPPED,
    }));

    const nextIndex = currentIndex + 1;
    if (nextIndex >= nodeQueue.length) {
      setState(GUIDED_STATES.COMPLETE);
    } else {
      setCurrentIndex(nextIndex);
      setStepStatuses((prev) => ({
        ...prev,
        [nodeQueue[nextIndex].key]: NODE_STEP_STATUS.ACTIVE,
      }));
    }
  }, [currentNode, currentIndex, nodeQueue]);

  const goToPrevious = useCallback(() => {
    if (currentIndex <= 0) return;
    const prevIndex = currentIndex - 1;

    setStepStatuses((prev) => ({
      ...prev,
      [currentNode.key]: NODE_STEP_STATUS.PENDING,
      [nodeQueue[prevIndex].key]: NODE_STEP_STATUS.ACTIVE,
    }));
    setCurrentIndex(prevIndex);
  }, [currentIndex, currentNode, nodeQueue]);

  const exitGuide = useCallback(() => {
    setState(GUIDED_STATES.IDLE);
    setNodeQueue([]);
    setCurrentIndex(0);
    setStepStatuses({});
    exitCallbackRef.current?.();
  }, []);

  const resetToIdle = useCallback(() => {
    setState(GUIDED_STATES.IDLE);
    setNodeQueue([]);
    setCurrentIndex(0);
    setStepStatuses({});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { nodeKeys, diagram } = e.detail || {};
      if (nodeKeys && diagram) {
        startGuide(nodeKeys, diagram);
      }
    };

    window.addEventListener(GUIDED_SETUP_EVENT, handler);
    return () => window.removeEventListener(GUIDED_SETUP_EVENT, handler);
  }, [startGuide]);

  return {
    state,
    nodeQueue,
    currentIndex,
    currentNode,
    stepStatuses,
    completedCount,
    skippedCount,
    estimatedTime,
    totalSteps: nodeQueue.length,
    isActive: state === GUIDED_STATES.GUIDING,
    isComplete: state === GUIDED_STATES.COMPLETE,
    startGuide,
    completeStep,
    skipStep,
    goToPrevious,
    exitGuide,
    resetToIdle,
    setNodeQueue,
    setOnExit: (cb) => { exitCallbackRef.current = cb; },
  };
}
