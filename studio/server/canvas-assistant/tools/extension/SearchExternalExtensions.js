import { BaseTool } from "../BaseTool.js";
import * as dbStudio from "../../../db-studio.js";

export default class SearchExternalExtensions extends BaseTool {
  get name() {
    return "searchExternalExtensions";
  }

  get description() {
    return "Search for external/third-party integration extensions (e.g., Slack, SendGrid, Stripe, Google Sheets). Use when users ask about specific integrations or third-party services. When the user's intent clearly points to one integration, set resolveWithLLM to true to return a single best match. Use the 'kind' parameter to filter by trigger or action integrations.";
  }

  get parameters() {
    return {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for the integration or service name (e.g., 'Slack messaging', 'SendGrid email', 'Stripe payment')",
        },
        kind: {
          type: "string",
          enum: ["trigger", "action"],
          description: "Filter results by integration kind. Use 'trigger' to find app-based trigger events (e.g., 'HubSpot contact created', 'Stripe payment received'). Use 'action' to find action/output events (e.g., 'Slack send message', 'Gmail send email'). Omit to search both.",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return (default: 5)",
          default: 5,
          minimum: 1,
          maximum: 20,
        },
        similarityThreshold: {
          type: "number",
          description: "Minimum similarity score 0-1 (default: 0.6)",
          default: 0.6,
          minimum: 0,
          maximum: 1,
        },
        resolveWithLLM: {
          type: "boolean",
          description: "When true, use LLM to pick the single best-matching integration from top candidates (default: false). Use when the user's request clearly implies one integration.",
          default: false,
        },
      },
      required: ["query"],
    };
  }

  async execute(args, context) {
    const { query, kind, limit = 5, similarityThreshold = 0.6, resolveWithLLM = false } = args;
    try {
      return await dbStudio.searchIntegrationKnowledgeV2(query, {
        limit,
        similarityThreshold,
        kind: kind || null,
        resolveWithLLM,
      });
    } catch (err) {
      console.error("[SearchExternalExtensions] v2 search failed:", err.message);
      return [];
    }
  }
}
