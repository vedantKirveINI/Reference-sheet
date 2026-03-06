import {
  SKIP_NODE_TYPES,
} from "../constants";
import { validateNodeConfig } from "@src/pages/ic-canvas/utils/validateNodeConfig";

export const SETUP_STATUS = {
  READY: "ready",
  NEEDS_ATTENTION: "needs_attention",
  NOT_STARTED: "not_started",
};

function hasConnection(nodeData) {
  const goData = nodeData?.go_data || {};
  if (goData.connection_id || goData.connectionId) return true;
  if (goData.connection?._id || goData.connection?.id) return true;
  if (goData.flow?.connection_id || goData.flow?.connectionId) return true;
  if (nodeData?.connection_id || nodeData?.connectionId) return true;
  return false;
}

export function getNodeSetupStatus(nodeData) {
  if (!nodeData) {
    return { status: SETUP_STATUS.NOT_STARTED, items: [], needsConnection: false };
  }

  const nodeType = nodeData.subType || nodeData.type || "";

  if (SKIP_NODE_TYPES.has(nodeType)) {
    return { status: SETUP_STATUS.READY, items: [], needsConnection: false };
  }

  const goData = nodeData.go_data || {};
  const hasGoData = Object.keys(goData).length > 0;

  if (!hasGoData) {
    return {
      status: SETUP_STATUS.NOT_STARTED,
      items: ["Open settings to configure"],
      needsConnection: false,
    };
  }

  const { errors, warnings, validationIssues } = validateNodeConfig(nodeData);

  const allErrors = errors || [];

  if (allErrors.length > 0) {
    const needsConnection = allErrors.some(
      (msg) => /connect/i.test(msg) || /no .* connected/i.test(msg)
    );
    return {
      status: SETUP_STATUS.NEEDS_ATTENTION,
      items: allErrors,
      needsConnection,
    };
  }

  return { status: SETUP_STATUS.READY, items: [], needsConnection: false };
}

export function getNodeSubSteps(nodeData) {
  const nodeType = nodeData?.subType || nodeData?.type || "";
  const steps = [];

  const needsConnectionStep =
    nodeType === "Integration" ||
    (nodeType === "HTTP" && nodeData?.go_data?.auth_type && nodeData?.go_data?.auth_type !== "none");

  if (needsConnectionStep) {
    steps.push({
      id: "connect",
      label: "Connect",
      completed: hasConnection(nodeData),
    });
  }

  steps.push({
    id: "configure",
    label: "Configure",
    completed: (() => {
      const { errors } = validateNodeConfig(nodeData);
      return !errors || errors.length === 0;
    })(),
  });

  steps.push({
    id: "test",
    label: "Test",
    optional: true,
    completed: !!(nodeData?.go_data?.lastTestResult || nodeData?.go_data?.tested),
  });

  return steps;
}
