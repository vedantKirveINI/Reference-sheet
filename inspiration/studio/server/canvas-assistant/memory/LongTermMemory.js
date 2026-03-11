import * as dbStudio from "../../db-studio.js";

/**
 * LongTermMemory - Long-term memory for user preferences and learned patterns
 * 
 * Manages user preferences, macro journey tracking, and decision history.
 */
export class LongTermMemory {
  /**
   * Get decision memory for an asset/workflow
   * @param {string} assetId - Asset/workflow ID
   * @param {number} limit - Maximum number of decisions (default: 20)
   * @returns {Promise<Array>} - Array of decision records
   */
  async getDecisionMemory(assetId, limit = 20) {
    if (!assetId) {
      return [];
    }

    try {
      return await dbStudio.getDecisionMemory(assetId, limit);
    } catch (error) {
      console.error("[LongTermMemory] Error fetching decision memory:", error);
      return [];
    }
  }

  /**
   * Record a decision
   * @param {string} assetId - Asset/workflow ID
   * @param {string} suggestionSummary - Summary of the suggestion
   * @param {Array} suggestedNodes - Suggested nodes
   * @param {string} outcome - Outcome (accepted, declined, modified)
   * @param {string} userId - User ID (optional)
   * @returns {Promise<void>}
   */
  async recordDecision(assetId, suggestionSummary, suggestedNodes, outcome, userId = null) {
    if (!assetId) {
      return;
    }

    try {
      await dbStudio.recordDecisionMemory(assetId, suggestionSummary, suggestedNodes, outcome, userId);
    } catch (error) {
      console.error("[LongTermMemory] Error recording decision:", error);
    }
  }

  /**
   * Get user preferences from decision history
   * @param {string} assetId - Asset/workflow ID
   * @returns {Promise<object>} - User preferences object
   */
  async getUserPreferences(assetId) {
    const decisions = await this.getDecisionMemory(assetId, 50);
    
    const preferences = {
      preferredNodeTypes: [],
      avoidedNodeTypes: [],
      commonPatterns: [],
    };

    // Analyze decisions to infer preferences
    const acceptedDecisions = decisions.filter(d => d.outcome === "accepted");
    const declinedDecisions = decisions.filter(d => d.outcome === "declined");

    // Extract preferred node types from accepted decisions
    acceptedDecisions.forEach((decision) => {
      if (decision.suggested_nodes) {
        const nodes = typeof decision.suggested_nodes === "string" 
          ? JSON.parse(decision.suggested_nodes) 
          : decision.suggested_nodes;
        
        if (Array.isArray(nodes)) {
          preferences.preferredNodeTypes.push(...nodes);
        }
      }
    });

    // Extract avoided node types from declined decisions
    declinedDecisions.forEach((decision) => {
      if (decision.suggested_nodes) {
        const nodes = typeof decision.suggested_nodes === "string" 
          ? JSON.parse(decision.suggested_nodes) 
          : decision.suggested_nodes;
        
        if (Array.isArray(nodes)) {
          preferences.avoidedNodeTypes.push(...nodes);
        }
      }
    });

    // Count frequencies
    const preferredCounts = {};
    preferences.preferredNodeTypes.forEach((type) => {
      preferredCounts[type] = (preferredCounts[type] || 0) + 1;
    });

    const avoidedCounts = {};
    preferences.avoidedNodeTypes.forEach((type) => {
      avoidedCounts[type] = (avoidedCounts[type] || 0) + 1;
    });

    // Get top preferences
    preferences.preferredNodeTypes = Object.entries(preferredCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([type]) => type);

    preferences.avoidedNodeTypes = Object.entries(avoidedCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([type]) => type);

    return preferences;
  }
}
