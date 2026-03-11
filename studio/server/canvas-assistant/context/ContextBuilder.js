import { WorkflowEnricher } from "./enrichers/WorkflowEnricher.js";
import { UserEnricher } from "./enrichers/UserEnricher.js";
import { IntegrationEnricher } from "./enrichers/IntegrationEnricher.js";
import { MemoryEnricher } from "./enrichers/MemoryEnricher.js";
import { buildContextBlock } from "./transformers.js";

/**
 * ContextBuilder - Main context enrichment pipeline
 * 
 * Staged enrichment: only fetch what's needed
 * Pipeline: workflow → user → integrations → memory
 */
export class ContextBuilder {
  constructor() {
    this.workflowEnricher = new WorkflowEnricher();
    this.userEnricher = new UserEnricher();
    this.integrationEnricher = new IntegrationEnricher();
    this.memoryEnricher = new MemoryEnricher();
    this.cache = new Map();
  }

  /**
   * Build enriched context
   * @param {object} options - Context building options
   * @param {object} options.workflowContext - Raw workflow context
   * @param {object} options.userContext - User context (userId, accessToken, workspaceId)
   * @param {object} options.memoryContext - Memory context (conversationId)
   * @param {Array<string>} options.enrichers - Which enrichers to run (default: all)
   * @returns {Promise<object>} - Enriched context
   */
  async build(options = {}) {
    const {
      workflowContext,
      userContext,
      memoryContext,
      enrichers = ["workflow", "user", "integrations", "memory"],
    } = options;

    // Start with empty context
    let context = {
      workflow: null,
      user: null,
      userConnections: null,
      integrations: null,
      memory: null,
      existingTriggers: [],
      warnings: [],
    };

    // Run enrichers in order
    if (enrichers.includes("workflow") && workflowContext) {
      context = await this.workflowEnricher.enrich(context, workflowContext);
    }

    if (enrichers.includes("user") && userContext) {
      context = await this.userEnricher.enrich(context, userContext);
    }

    if (enrichers.includes("integrations")) {
      context = await this.integrationEnricher.enrich(context);
    }

    if (enrichers.includes("memory") && memoryContext) {
      context = await this.memoryEnricher.enrich(context, memoryContext);
    }

    return context;
  }

  /**
   * Build context block string for prompts
   * @param {object} enrichedContext - Enriched context object
   * @returns {string} - Formatted context block
   */
  buildContextBlock(enrichedContext) {
    if (!enrichedContext || !enrichedContext.workflow) {
      return "";
    }

    return buildContextBlock(enrichedContext.workflow);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}
