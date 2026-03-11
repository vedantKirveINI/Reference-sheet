import { BaseTool } from "../BaseTool.js";
import { FORM_CANVAS_MODE } from "../../common/canvas-constants.js";

/**
 * CheckCanvasState - Analyze canvas for existing triggers, nodes, connections
 */
export default class CheckCanvasState extends BaseTool {
  get name() {
    return "checkCanvasState";
  }

  get description() {
    return "Analyze the current canvas/workflow state to check for existing triggers, nodes, and connections. Use when you need to understand what's already on the canvas before making changes (e.g., checking if a trigger already exists before adding a new one). Note: Form canvas has no triggers.";
  }

  get parameters() {
    return {
      type: "object",
      properties: {
        checkTriggers: {
          type: "boolean",
          description: "Check for existing trigger nodes (default: true, ignored for Form canvas)",
          default: true,
        },
        checkNodes: {
          type: "boolean",
          description: "Check for all nodes (default: true)",
          default: true,
        },
        checkConnections: {
          type: "boolean",
          description: "Check for node connections/links (default: true)",
          default: true,
        },
      },
      required: [],
    };
  }

  async execute(args, context) {
    const { workflowContext } = context;
    const { checkTriggers = true, checkNodes = true, checkConnections = true } = args;
    
    // Get canvas type from workflow context
    const canvasType = workflowContext?.canvasType;
    const isFormCanvas = canvasType === FORM_CANVAS_MODE;
    
    // Skip trigger checks for Form canvas (forms have no triggers)
    const shouldCheckTriggers = checkTriggers && !isFormCanvas;

    if (!workflowContext) {
      return {
        hasWorkflow: false,
        message: "No workflow context provided",
      };
    }

    const result = {
      hasWorkflow: true,
      flowName: workflowContext.flowName || null,
      triggers: [],
      nodes: [],
      connections: [],
      hasTrigger: false,
      nodeCount: 0,
      connectionCount: 0,
    };

    // Check for triggers (skip for Form canvas)
    if (shouldCheckTriggers && workflowContext.nodes) {
      const triggerTypes = [
        "TRIGGER_SETUP_V3",
        "TRIGGER_SETUP",
        "TRIGGER_SETUP_NODE",
        "FORM_TRIGGER",
        "CUSTOM_WEBHOOK",
        "WEBHOOK_V2",
        "TIME_BASED_TRIGGER_V2",
        "TIME_BASED_TRIGGER",
        "SHEET_TRIGGER_V2",
        "SHEET_TRIGGER",
        "SHEET_DATE_FIELD_TRIGGER",
      ];

      result.triggers = workflowContext.nodes.filter((node) =>
        triggerTypes.includes(node.type)
      );
      result.hasTrigger = result.triggers.length > 0;
    }

    // Check nodes
    if (checkNodes && workflowContext.nodes) {
      result.nodes = workflowContext.nodes;
      result.nodeCount = workflowContext.nodes.length;
    }

    // Check connections
    if (checkConnections && workflowContext.links) {
      result.connections = workflowContext.links;
      result.connectionCount = workflowContext.links.length;
    }

    // Add warnings (skip trigger warnings for Form canvas)
    const warnings = [];
    if (!isFormCanvas) {
      if (result.hasTrigger && result.triggers.length > 1) {
        warnings.push("Multiple triggers detected - workflows should have only one trigger");
      }
      if (result.hasTrigger && shouldCheckTriggers) {
        warnings.push(`Existing trigger found: ${result.triggers[0].type} - cannot add another trigger`);
      }
    } else {
      // Form canvas specific: warn if triggers are found (they shouldn't exist)
      if (result.hasTrigger) {
        warnings.push("Form canvas should not have trigger nodes - triggers are not allowed on forms");
      }
    }

    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    return result;
  }
}
