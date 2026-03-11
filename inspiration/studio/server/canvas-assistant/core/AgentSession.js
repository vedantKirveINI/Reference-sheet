/**
 * AgentSession - Session state management per conversation
 * 
 * Manages session state including conversation ID, message history,
 * tool call history, context cache, and memory state.
 */
export class AgentSession {
  constructor(conversationId, assetId = null, userId = null) {
    this.conversationId = conversationId;
    this.assetId = assetId;
    this.userId = userId;
    this.messageHistory = [];
    this.toolCallHistory = [];
    this.contextCache = null;
    this.memoryState = null;
    this.createdAt = new Date();
    this.lastActivity = new Date();
  }

  /**
   * Add a message to history
   * @param {string} role - Message role
   * @param {string} content - Message content
   * @param {object} metadata - Optional metadata
   */
  addMessage(role, content, metadata = null) {
    this.messageHistory.push({
      role,
      content,
      metadata,
      timestamp: new Date(),
    });
    this.lastActivity = new Date();
  }

  /**
   * Add a tool call to history
   * @param {string} toolName - Tool name
   * @param {object} args - Tool arguments
   * @param {any} result - Tool result
   */
  addToolCall(toolName, args, result) {
    this.toolCallHistory.push({
      toolName,
      args,
      result,
      timestamp: new Date(),
    });
    this.lastActivity = new Date();
  }

  /**
   * Cache context
   * @param {object} context - Context to cache
   */
  cacheContext(context) {
    this.contextCache = {
      context,
      timestamp: new Date(),
    };
  }

  /**
   * Get cached context if still valid
   * @param {number} maxAge - Maximum age in milliseconds (default: 5 minutes)
   * @returns {object|null} - Cached context or null if expired
   */
  getCachedContext(maxAge = 5 * 60 * 1000) {
    if (!this.contextCache) {
      return null;
    }

    const age = Date.now() - this.contextCache.timestamp.getTime();
    if (age > maxAge) {
      this.contextCache = null;
      return null;
    }

    return this.contextCache.context;
  }

  /**
   * Update memory state
   * @param {object} memoryState - Memory state
   */
  updateMemoryState(memoryState) {
    this.memoryState = memoryState;
    this.lastActivity = new Date();
  }

  /**
   * Get recent messages formatted for AI
   * @param {number} limit - Maximum number of messages
   * @returns {Array} - Formatted messages
   */
  getRecentMessages(limit = 20) {
    return this.messageHistory
      .slice(-limit)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
  }

  /**
   * Clear session data
   */
  clear() {
    this.messageHistory = [];
    this.toolCallHistory = [];
    this.contextCache = null;
    this.memoryState = null;
  }

  /**
   * Get session summary
   * @returns {object} - Session summary
   */
  getSummary() {
    return {
      conversationId: this.conversationId,
      assetId: this.assetId,
      userId: this.userId,
      messageCount: this.messageHistory.length,
      toolCallCount: this.toolCallHistory.length,
      hasCachedContext: this.contextCache !== null,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
    };
  }
}
