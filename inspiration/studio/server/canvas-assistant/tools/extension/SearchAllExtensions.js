import { BaseTool } from "../BaseTool.js";
import * as dbStudio from "../../../db-studio.js";

export default class SearchAllExtensions extends BaseTool {
  get name() {
    return "searchAllExtensions";
  }

  get description() {
    return "Search across all extensions (both internal and external). Use when users ask general questions about available extensions or when you're unsure if an extension is internal or external. Use 'kind' to filter by trigger or action.";
  }

  get parameters() {
    return {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for any extension or functionality (e.g., 'email', 'database', 'messaging', 'payment')",
        },
        kind: {
          type: "string",
          enum: ["trigger", "action"],
          description: "Filter results by integration kind. Use 'trigger' to find app-based trigger events. Use 'action' to find action events. Omit to search both.",
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
      },
      required: ["query"],
    };
  }

  async execute(args, context) {
    const { query, kind, limit = 5, similarityThreshold = 0.6 } = args;
    try {
      return await dbStudio.searchIntegrationKnowledgeV2(query, {
        limit,
        similarityThreshold,
        kind: kind || null,
      });
    } catch (err) {
      console.error("[SearchAllExtensions] v2 search failed:", err.message);
      return [];
    }
  }
}
