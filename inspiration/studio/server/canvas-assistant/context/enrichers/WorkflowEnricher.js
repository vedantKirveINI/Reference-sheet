import { transformWorkflowContext, detectExistingTriggers } from "../transformers.js";

/**
 * WorkflowEnricher - Enriches context with workflow information
 */
export class WorkflowEnricher {
  /**
   * Enrich context with workflow data
   * @param {object} context - Current context object
   * @param {object} rawWorkflowContext - Raw workflow context from frontend
   * @returns {Promise<object>} - Enriched context
   */
  async enrich(context, rawWorkflowContext) {
    if (!rawWorkflowContext) {
      return context;
    }

    // Transform workflow context to AI-friendly format
    const transformed = transformWorkflowContext(rawWorkflowContext);

    // Add to context
    context.workflow = transformed;

    // Detect existing triggers
    context.existingTriggers = detectExistingTriggers(transformed);

    // Add trigger warning if multiple triggers exist
    if (context.existingTriggers.length > 1) {
      context.warnings = context.warnings || [];
      context.warnings.push("Multiple triggers detected - workflows should have only one trigger");
    }

    return context;
  }
}
