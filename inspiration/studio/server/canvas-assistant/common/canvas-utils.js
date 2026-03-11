/**
 * Common canvas type checking utilities
 * Shared across all canvas types (Form, Workflow, Sequence, etc.)
 */

import { CANVAS_TYPES, FORM_CANVAS_MODE, WORKFLOW_CANVAS_MODE, SEQUENCE_CANVAS_MODE } from "./canvas-constants.js";

/**
 * Check if canvas type is Form canvas
 * @param {string} canvasType - Canvas type string
 * @returns {boolean}
 */
export function isFormCanvas(canvasType) {
  return canvasType === FORM_CANVAS_MODE;
}

/**
 * Check if canvas type is Workflow canvas
 * @param {string} canvasType - Canvas type string
 * @returns {boolean}
 */
export function isWorkflowCanvas(canvasType) {
  return canvasType === WORKFLOW_CANVAS_MODE;
}

/**
 * Check if canvas type is Sequence canvas
 * @param {string} canvasType - Canvas type string
 * @returns {boolean}
 */
export function isSequenceCanvas(canvasType) {
  return canvasType === SEQUENCE_CANVAS_MODE;
}

/**
 * Check if node config is applicable to the given canvas type
 * @param {object} nodeConfig - Node config with applicableCanvases property
 * @param {string} canvasType - Canvas type to check
 * @returns {boolean}
 */
export function isNodeApplicableToCanvas(nodeConfig, canvasType) {
  if (!nodeConfig || !canvasType) return true; // If no config or canvas type, allow (backward compatibility)
  
  const applicableCanvases = nodeConfig.applicableCanvases;
  
  // Empty array means available on all canvases
  if (Array.isArray(applicableCanvases) && applicableCanvases.length === 0) {
    return true;
  }
  
  // If applicableCanvases is not defined, allow (backward compatibility)
  if (!applicableCanvases) {
    return true;
  }
  
  // Check if canvas type is in the applicable list
  if (Array.isArray(applicableCanvases)) {
    return applicableCanvases.includes(canvasType);
  }
  
  return false;
}

/**
 * Get allowed node types for a specific canvas type
 * This is a helper that can be used by canvas-specific rules
 * @param {string} canvasType - Canvas type
 * @param {object} options - Options with nodeTypeMaps (shared, form, workflow, etc.)
 * @returns {Array<string>} - Array of allowed node type strings
 */
export function getAllowedNodeTypesForCanvas(canvasType, options = {}) {
  const { nodeTypeMaps = {} } = options;
  const allowed = new Set();
  
  // Check shared nodes (applicableCanvases: [])
  if (nodeTypeMaps.shared) {
    Object.keys(nodeTypeMaps.shared).forEach((nodeType) => {
      const config = nodeTypeMaps.shared[nodeType];
      if (isNodeApplicableToCanvas(config, canvasType)) {
        allowed.add(nodeType);
      }
    });
  }
  
  // Check form nodes
  if (nodeTypeMaps.form && isFormCanvas(canvasType)) {
    Object.keys(nodeTypeMaps.form).forEach((nodeType) => {
      const config = nodeTypeMaps.form[nodeType];
      if (isNodeApplicableToCanvas(config, canvasType)) {
        allowed.add(nodeType);
      }
    });
  }
  
  // Check workflow nodes
  if (nodeTypeMaps.workflow && isWorkflowCanvas(canvasType)) {
    Object.keys(nodeTypeMaps.workflow).forEach((nodeType) => {
      const config = nodeTypeMaps.workflow[nodeType];
      if (isNodeApplicableToCanvas(config, canvasType)) {
        allowed.add(nodeType);
      }
    });
  }
  
  return Array.from(allowed);
}
