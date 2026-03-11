import * as go from "gojs";

const GUIDED_FOCUS_SHADOW = {
  color: "rgba(28, 54, 147, 0.80)",
  blur: 120,
  offset: new go.Point(0, 0),
};

const DEFAULT_SHADOW = {
  color: "rgba(0, 0, 0, 0.08)",
  blur: 24,
  offset: new go.Point(0, 8),
};

const ERROR_SHADOW = {
  color: "rgba(239, 68, 68, 0.95)",
  blur: 140,
  offset: new go.Point(0, 0),
};

const WARNING_SHADOW = {
  color: "rgba(245, 158, 11, 0.90)",
  blur: 130,
  offset: new go.Point(0, 0),
};

const RUNNING_SHADOW = {
  color: "rgba(59, 130, 246, 0.95)",
  blur: 140,
  offset: new go.Point(0, 0),
};

const SUCCESS_SHADOW = {
  color: "rgba(34, 197, 94, 0.85)",
  blur: 100,
  offset: new go.Point(0, 0),
};

const PULSE_MIN_BLUR = 20;
const PULSE_MAX_BLUR = 160;
const PULSE_PERIOD = 1800;

const pulsingNodes = new Set();
let rafId = null;
let loopStartTime = null;

function hasExecutionErrors(data) {
  return data?._executions?.some((e) => !!e.error) === true;
}

function isExecutionSuccess(data) {
  if (data?._state !== "completed") return false;
  if (data?._executionResult?.success === true) return true;
  if (data?._executions?.length > 0 && !hasExecutionErrors(data)) return true;
  return false;
}

function shouldPulse(data) {
  if (data?._guidedSetupCurrent) return true;
  if (data?._state === "running") return true;
  if (data?.errors?.length > 0 || data?._executionResult?.success === false) return true;
  if (hasExecutionErrors(data)) return true;
  if (data?.warnings?.length > 0) return true;
  return false;
}

function easeInOutSine(t) {
  return 0.5 - 0.5 * Math.cos(Math.PI * t);
}

function pulseLoop(timestamp) {
  if (pulsingNodes.size === 0) {
    rafId = null;
    loopStartTime = null;
    return;
  }

  if (loopStartTime === null) loopStartTime = timestamp;
  const elapsed = timestamp - loopStartTime;

  const cyclePos = (elapsed % PULSE_PERIOD) / PULSE_PERIOD;
  const wave = cyclePos < 0.5
    ? easeInOutSine(cyclePos * 2)
    : easeInOutSine(1 - (cyclePos - 0.5) * 2);
  const blurValue = PULSE_MIN_BLUR + wave * (PULSE_MAX_BLUR - PULSE_MIN_BLUR);

  const diagram = (() => {
    for (const n of pulsingNodes) {
      if (n.diagram) return n.diagram;
    }
    return null;
  })();

  if (diagram) diagram.startTransaction("haloPulse");

  const toRemove = [];
  pulsingNodes.forEach((node) => {
    if (!node.diagram || !shouldPulse(node.data)) {
      toRemove.push(node);
      return;
    }
    node.shadowBlur = blurValue;
  });

  toRemove.forEach((node) => {
    pulsingNodes.delete(node);
    const shadow = getHaloShadow(node.data);
    node.shadowBlur = shadow.blur;
  });

  if (diagram) diagram.commitTransaction("haloPulse");

  if (pulsingNodes.size > 0) {
    rafId = requestAnimationFrame(pulseLoop);
  } else {
    rafId = null;
    loopStartTime = null;
  }
}

function startPulseLoop() {
  if (rafId !== null) return;
  loopStartTime = null;
  rafId = requestAnimationFrame(pulseLoop);
}

function registerPulse(node) {
  if (pulsingNodes.has(node)) return;
  pulsingNodes.add(node);
  startPulseLoop();
}

function unregisterPulse(node) {
  pulsingNodes.delete(node);
  if (pulsingNodes.size === 0 && rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
    loopStartTime = null;
  }
}

function cleanupAllPulses() {
  pulsingNodes.clear();
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
    loopStartTime = null;
  }
}

function hasAnyExecutionState(diagram) {
  let found = false;
  diagram.nodes.each((node) => {
    if (node.data?._state || node.data?._executions || node.data?._executionResult) {
      found = true;
    }
  });
  return found;
}

function ensureDiagramCleanupListener(diagram) {
  if (!diagram || diagram._haloPulseListenerAttached) return;
  diagram._haloPulseListenerAttached = true;

  diagram.addDiagramListener("SelectionDeleted", (e) => {
    e.subject.each((part) => {
      if (part instanceof go.Node) unregisterPulse(part);
    });
  });

  const resetOnInteraction = () => {
    if (hasAnyExecutionState(diagram)) {
      clearExecutionState(diagram);
    }
  };

  diagram.addDiagramListener("SelectionMoved", resetOnInteraction);
  diagram.addDiagramListener("LinkDrawn", resetOnInteraction);
  diagram.addDiagramListener("LinkRelinked", resetOnInteraction);

  diagram.addModelChangedListener((e) => {
    if (e.modelChange === "nodeDataArray" && e.change === go.ChangeType.Insert) {
      if (hasAnyExecutionState(diagram)) {
        clearExecutionState(diagram);
      }
    }
    if (e.modelChange === "nodeDataArray" && e.change === go.ChangeType.Remove) {
      const removedData = e.oldValue;
      if (removedData) {
        pulsingNodes.forEach((node) => {
          if (node.data === removedData) unregisterPulse(node);
        });
      }
      if (hasAnyExecutionState(diagram)) {
        clearExecutionState(diagram);
      }
    }
    if (e.change === go.ChangeType.Transaction && e.propertyName === "StartingFirstTransaction") {
      cleanupAllPulses();
    }
  });
}

function getHaloShadow(data) {
  if (data?._guidedSetupCurrent) return GUIDED_FOCUS_SHADOW;
  if (data?._state === "running") return RUNNING_SHADOW;
  if (data?.errors?.length > 0 || data?._executionResult?.success === false) return ERROR_SHADOW;
  if (hasExecutionErrors(data)) return ERROR_SHADOW;
  if (data?.warnings?.length > 0) return WARNING_SHADOW;
  if (isExecutionSuccess(data)) return SUCCESS_SHADOW;
  return DEFAULT_SHADOW;
}

export { cleanupAllPulses };

export function clearExecutionState(diagram) {
  if (!diagram) return;
  cleanupAllPulses();
  diagram.startTransaction("clearExecutionState");
  diagram.nodes.each((node) => {
    const d = node.data;
    if (d._state || d._executions || d._executionResult) {
      diagram.model.setDataProperty(d, "_state", undefined);
      diagram.model.setDataProperty(d, "_executions", undefined);
      diagram.model.setDataProperty(d, "_executionResult", undefined);
    }
  });
  diagram.commitTransaction("clearExecutionState");
}

export function getHaloBindings() {
  return [
    new go.Binding("shadowColor", "", (data) => getHaloShadow(data).color),
    new go.Binding("shadowBlur", "", (data, node) => {
      if (node && node.diagram) {
        ensureDiagramCleanupListener(node.diagram);
        if (shouldPulse(node.data)) {
          registerPulse(node);
        } else {
          unregisterPulse(node);
        }
      }
      return getHaloShadow(data).blur;
    }),
    new go.Binding("shadowOffset", "", (data) => getHaloShadow(data).offset),
    new go.Binding("opacity", "_guidedOpacity", (v) =>
      typeof v === "number" ? v : 1
    ),
  ];
}
