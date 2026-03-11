/**
 * Form Node Setup Handler
 * Handles node setup for Form canvas (WORKFLOW_CANVAS mode)
 * Extends BaseNodeSetupHandler with form-specific validation
 */

import { BaseNodeSetupHandler } from "../common/base-handlers.js";
import { FORM_CANVAS_MODE } from "../common/canvas-constants.js";
import { isNodeAllowedOnFormCanvas, isTriggerNode } from "./form-rules.js";
import { composeInternalSetupNodePrompt } from "../prompts/composers.js";

export class FormNodeSetupHandler extends BaseNodeSetupHandler {
  /**
   * Validate node type is allowed for Form canvas
   * @param {string} nodeType - Node type
   * @param {string} canvasType - Canvas type (should be WORKFLOW_CANVAS for form)
   * @returns {object} - { valid: boolean, error?: string }
   */
  validateNodeType(nodeType, canvasType) {
    if (canvasType !== FORM_CANVAS_MODE) {
      return {
        valid: false,
        error: `FormNodeSetupHandler only handles Form canvas (${FORM_CANVAS_MODE}), got ${canvasType}`,
      };
    }

    // Reject trigger nodes
    if (isTriggerNode(nodeType)) {
      return {
        valid: false,
        error: `Trigger nodes are not allowed on Form canvas. Node type: ${nodeType}`,
      };
    }

    // Check if node is allowed on form canvas
    if (!isNodeAllowedOnFormCanvas(nodeType)) {
      return {
        valid: false,
        error: `Node type "${nodeType}" is not allowed on Form canvas. Only form question nodes and shared nodes (HTTP, TRANSFORMER_V3, IFELSE_V2, LOG, JUMP_TO) are allowed.`,
      };
    }

    return { valid: true };
  }

  /**
   * Build system prompt for form node setup
   * Uses the base implementation but can be customized for form-specific needs
   * @param {string} nodeType - Node type
   * @param {string|null} canvasType - Canvas type
   * @returns {string} - System prompt
   */
  buildSystemPrompt(nodeType, canvasType = null) {
    // Use base implementation
    return super.buildSystemPrompt(nodeType, canvasType);
  }

  /**
   * Handle node setup request (overrides base to add form-specific validation)
   * @param {object} req - Express request
   * @param {object} res - Express response
   */
  async handle(req, res) {
    const canvasType = req.body?.canvasType;
    
    // Ensure canvas type is Form canvas
    if (canvasType && canvasType !== FORM_CANVAS_MODE) {
      return res.status(400).json({
        config: {},
        connectionHints: [],
        message: `FormNodeSetupHandler only handles Form canvas (${FORM_CANVAS_MODE}), got ${canvasType}`,
      });
    }

    // Call parent handler with form-specific validation
    return super.handle(req, res);
  }
}
