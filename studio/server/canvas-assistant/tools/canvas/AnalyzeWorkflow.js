import { BaseTool } from "../BaseTool.js";
import { FORM_CANVAS_MODE } from "../../common/canvas-constants.js";

/**
 * AnalyzeWorkflow - Deep workflow analysis (health, completeness)
 */
export default class AnalyzeWorkflow extends BaseTool {
  get name() {
    return "analyzeWorkflow";
  }

  get description() {
    return "Perform a deep analysis of the workflow to assess health, completeness, and identify issues. Use when users ask for workflow health checks, debugging, or when you need to understand workflow structure before making suggestions. Note: Form canvas has no triggers.";
  }

  get parameters() {
    return {
      type: "object",
      properties: {
        includeHealthScore: {
          type: "boolean",
          description: "Calculate health score (default: true)",
          default: true,
        },
        checkCompleteness: {
          type: "boolean",
          description: "Check node configuration completeness (default: true)",
          default: true,
        },
        checkErrorHandling: {
          type: "boolean",
          description: "Check error handling setup (default: true)",
          default: true,
        },
      },
      required: [],
    };
  }

  async execute(args, context) {
    const { workflowContext } = context;
    const {
      includeHealthScore = true,
      checkCompleteness = true,
      checkErrorHandling = true,
    } = args;

    if (!workflowContext) {
      return {
        hasWorkflow: false,
        message: "No workflow context provided",
      };
    }

    const analysis = {
      hasWorkflow: true,
      flowName: workflowContext.flowName || "Unnamed Workflow",
      issues: [],
      warnings: [],
      recommendations: [],
      healthScore: null,
    };

    const nodes = workflowContext.nodes || [];
    const links = workflowContext.links || [];
    
    // Get canvas type from workflow context
    const canvasType = workflowContext?.canvasType;
    const isFormCanvas = canvasType === FORM_CANVAS_MODE;

    // Check for trigger (skip for Form canvas)
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

    const triggers = nodes.filter((node) => triggerTypes.includes(node.type));

    if (!isFormCanvas) {
      // Workflow canvas: must have exactly one trigger
      if (triggers.length === 0) {
        analysis.issues.push("No trigger found - workflows must have exactly one trigger");
      } else if (triggers.length > 1) {
        analysis.issues.push(`Multiple triggers found (${triggers.length}) - workflows should have only one trigger`);
      }
    } else {
      // Form canvas: triggers are not allowed
      if (triggers.length > 0) {
        analysis.issues.push(`Form canvas should not have trigger nodes - found ${triggers.length} trigger(s). Forms are started by user interaction, not triggers.`);
      }
    }

    // Check node completeness
    if (checkCompleteness) {
      nodes.forEach((node) => {
        if (node.errors && node.errors.length > 0) {
          analysis.issues.push(`Node "${node.name || node.type}" has errors: ${node.errors.join(", ")}`);
        }
        if (node.warnings && node.warnings.length > 0) {
          analysis.warnings.push(`Node "${node.name || node.type}" has warnings: ${node.warnings.join(", ")}`);
        }
        // Check if node has minimal config
        if (!node.config || Object.keys(node.config).length === 0) {
          if (!triggerTypes.includes(node.type)) {
            analysis.warnings.push(`Node "${node.name || node.type}" appears unconfigured`);
          }
        }
      });
    }

    // Check error handling
    if (checkErrorHandling) {
      const riskyNodes = nodes.filter((node) => {
        const riskyTypes = ["HTTP", "GPT", "CREATE_RECORD_V2", "UPDATE_RECORD_V2"];
        return riskyTypes.includes(node.type);
      });

      riskyNodes.forEach((node) => {
        const hasErrorLink = links.some(
          (link) => link.from === node.key && link.isErrorLink === true
        );
        if (!hasErrorLink) {
          analysis.recommendations.push(
            `Add error handling for "${node.name || node.type}" node`
          );
        }
      });
    }

    // Check for orphaned nodes (nodes with no connections)
    const nodeKeys = new Set(nodes.map((n) => n.key));
    const connectedNodes = new Set();
    links.forEach((link) => {
      connectedNodes.add(link.from);
      connectedNodes.add(link.to);
    });

    nodes.forEach((node) => {
      if (!triggerTypes.includes(node.type) && !connectedNodes.has(node.key)) {
        analysis.warnings.push(`Node "${node.name || node.type}" is not connected to the workflow`);
      }
    });

    // Calculate health score
    if (includeHealthScore) {
      let score = 10;
      score -= analysis.issues.length * 2; // -2 per issue
      score -= analysis.warnings.length * 0.5; // -0.5 per warning
      score = Math.max(0, Math.min(10, score));
      analysis.healthScore = Math.round(score * 10) / 10;
    }

    // Add summary
    analysis.summary = {
      nodeCount: nodes.length,
      connectionCount: links.length,
      triggerCount: triggers.length,
      issueCount: analysis.issues.length,
      warningCount: analysis.warnings.length,
      recommendationCount: analysis.recommendations.length,
    };

    return analysis;
  }
}
