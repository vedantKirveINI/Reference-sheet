import { BaseTool } from "../BaseTool.js";

export default class SearchInternalExtensions extends BaseTool {
  get name() {
    return "searchInternalExtensions";
  }

  get description() {
    return "Internal/built-in nodes are already listed in your system prompt (HTTP, TRANSFORMER_V3, GPT, etc.). This tool returns no additional results. Use the node types from your instructions directly instead of searching.";
  }

  get parameters() {
    return {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query describing what extension or functionality the user is looking for (e.g., 'create database record', 'send email', 'HTTP request')",
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
    return [];
  }
}
