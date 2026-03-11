import { BaseTool } from "../BaseTool.js";
import AuthorizeData from "oute-services-authorized-data-sdk";

/**
 * GetUserConnections - Fetch user's connected integrations
 */
export default class GetUserConnections extends BaseTool {
  get name() {
    return "getUserConnections";
  }

  get description() {
    return "Fetch the user's active connected integrations (e.g., Slack, Gmail, Stripe). Use when you need to know what integrations the user has connected to suggest appropriate nodes or configure workflows.";
  }

  get parameters() {
    return {
      type: "object",
      properties: {
        authorizationId: {
          type: "string",
          description: "The authorization ID (optional, will use from context if not provided)",
        },
      },
      required: [],
    };
  }

  async execute(args, context) {
    const { userId, accessToken, workspaceId } = context;
    const { authorizationId } = args;

    if (!userId || !accessToken || !workspaceId) {
      throw new Error("Missing required context: userId, accessToken, or workspaceId");
    }

    // Get OUTE_SERVER URL from environment
    const outeServerUrl = process.env.REACT_APP_OUTE_SERVER || process.env.OUTE_SERVER || "http://localhost:3101";

    // Initialize AuthorizedData SDK
    const authorizedDataInstance = new AuthorizeData({
      url: outeServerUrl,
      token: accessToken,
    });

    try {
      // Build query for getByParent
      const query = {
        authorization_id: authorizationId || userId,
        workspace_id: workspaceId,
        state: "ACTIVE",
      };

      const response = await authorizedDataInstance.getByParent(query);

      if (response?.status === "success" && response?.result) {
        return {
          connections: Array.isArray(response.result) ? response.result : [response.result],
          count: Array.isArray(response.result) ? response.result.length : 1,
        };
      }

      return {
        connections: [],
        count: 0,
        error: "No active connections found",
      };
    } catch (error) {
      console.error("Error fetching user connections:", error);
      return {
        connections: [],
        count: 0,
        error: error.message || "Failed to fetch user connections",
      };
    }
  }
}
