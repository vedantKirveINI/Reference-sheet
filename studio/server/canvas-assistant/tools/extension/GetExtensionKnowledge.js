import { BaseTool } from "../BaseTool.js";
import * as dbStudio from "../../../db-studio.js";

export default class GetExtensionKnowledge extends BaseTool {
  get name() {
    return "getExtensionKnowledge";
  }

  get description() {
    return "Get detailed knowledge about a specific extension/node by its identifier. Use when you need detailed information about a specific node type (e.g., 'GPT_SUMMARIZER', 'SLACK_SEND_MESSAGE').";
  }

  get parameters() {
    return {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description: "The workflow_node_identifier of the extension/node (e.g., 'GPT_SUMMARIZER', 'SLACK_SEND_MESSAGE', 'CREATE_RECORD_V2')",
        },
      },
      required: ["identifier"],
    };
  }

  async execute(args, context) {
    const { identifier } = args;

    try {
      const v2 = await dbStudio.getIntegrationKnowledgeV2ByNodeIdentifier(identifier);
      if (v2) {
        return {
          id: v2.id,
          sourceType: "integration_v2",
          extensionSlug: v2.integrationSlug,
          eventSlug: v2.eventSlug,
          kind: v2.kind,
          title: v2.title,
          content: v2.enrichedDescription ?? v2.description,
          metadata: null,
          inputSchema: v2.inputSchema,
          outputSchema: v2.outputSchema,
          workflowNodeIdentifier: v2.workflowNodeIdentifier,
          configKeySummary: v2.configKeySummary ?? null,
        };
      }
    } catch (err) {
      console.error("[GetExtensionKnowledge] v2 lookup failed:", err.message);
    }

    return null;
  }
}
