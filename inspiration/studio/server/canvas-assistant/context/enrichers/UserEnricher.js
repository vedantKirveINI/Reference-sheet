import toolRegistry from "../../tools/ToolRegistry.js";

/**
 * UserEnricher - Enriches context with user information
 */
export class UserEnricher {
  /**
   * Enrich context with user data
   * @param {object} context - Current context object
   * @param {object} userContext - User context (userId, accessToken, workspaceId)
   * @returns {Promise<object>} - Enriched context
   */
  async enrich(context, userContext) {
    if (!userContext || !userContext.userId) {
      return context;
    }

    // Add user info to context
    context.user = {
      userId: userContext.userId,
      workspaceId: userContext.workspaceId,
    };

    // Fetch user connections if access token is available
    if (userContext.accessToken) {
      try {
        const getUserConnectionsTool = toolRegistry.get("getUserConnections");
        if (getUserConnectionsTool) {
          const connections = await toolRegistry.execute(
            "getUserConnections",
            {},
            {
              userId: userContext.userId,
              accessToken: userContext.accessToken,
              workspaceId: userContext.workspaceId,
            }
          );

          if (connections && connections.connections) {
            context.userConnections = connections.connections;
            context.userConnectionsCount = connections.count || 0;
          }
        }
      } catch (error) {
        console.warn("[UserEnricher] Failed to fetch user connections:", error.message);
        // Don't fail if connections can't be fetched
      }
    }

    return context;
  }
}
