/**
 * Unified node type config resolver
 * Resolves node type configs from shared/form/workflow/sequence maps
 * Filters by applicableCanvases based on canvas type
 */

import { getSharedNodeTypeConfig } from "./setup-shared-node-types.js";
import { isNodeApplicableToCanvas } from "./canvas-utils.js";
import { DEFAULT_SHARED_TYPE_CONFIG } from "./setup-shared-node-types.js";

// Direct imports - modules should be available at runtime
import { getFormQuestionTypeConfig } from "../form/setup-form-question-types.js";
import { SETUP_INTERNAL_TYPES, DEFAULT_INTERNAL_TYPE_CONFIG as DEFAULT_INTERNAL_TYPE_CONFIG_IMPORT } from "../prompts/setup-internal-types.js";

// Use imported default config
const DEFAULT_INTERNAL_TYPE_CONFIG = DEFAULT_INTERNAL_TYPE_CONFIG_IMPORT || {
  configSchema: "Return only the config keys that this node type accepts.",
  instructions: "Infer the node's configuration from the data available at this node and the workflow goal.",
};

/**
 * Get node type config for a given node type and canvas type
 * Checks shared nodes first, then form question types, then workflow-only internal types
 * Filters by applicableCanvases if canvasType is provided
 * 
 * @param {string} nodeType - Node type string
 * @param {string|null} canvasType - Canvas type (optional, for filtering)
 * @returns {object} - Node type config with configSchema, instructions, applicableCanvases
 */
export function getNodeTypeConfig(nodeType, canvasType = null) {
  if (!nodeType) {
    return DEFAULT_SHARED_TYPE_CONFIG;
  }
  
  // Check shared nodes first (available on all canvases)
  const sharedConfig = getSharedNodeTypeConfig(nodeType);
  if (sharedConfig) {
    if (!canvasType || isNodeApplicableToCanvas(sharedConfig, canvasType)) {
      return sharedConfig;
    }
  }
  
  // Check form question types
  const formConfig = getFormQuestionTypeConfig(nodeType);
  if (formConfig) {
    if (!canvasType || isNodeApplicableToCanvas(formConfig, canvasType)) {
      return formConfig;
    }
  }
  
  // Check workflow-only internal types
  const internalConfig = SETUP_INTERNAL_TYPES[nodeType];
  if (internalConfig) {
    if (!canvasType || isNodeApplicableToCanvas(internalConfig, canvasType)) {
      return internalConfig;
    }
  }
  
  // Fallback to default
  return DEFAULT_INTERNAL_TYPE_CONFIG || DEFAULT_SHARED_TYPE_CONFIG;
}
