import * as dbStudio from "../../db-studio.js";

/**
 * ConversationMemory - Short-term memory for current conversation
 * 
 * Manages current conversation state, recent messages, and session-specific data.
 */
export class ConversationMemory {
  /**
   * Get conversation messages
   * @param {string} conversationId - Conversation ID
   * @param {number} limit - Maximum number of messages (default: 20)
   * @returns {Promise<Array>} - Array of messages
   */
  async getMessages(conversationId, limit = 20) {
    if (!conversationId) {
      return [];
    }

    try {
      return await dbStudio.getMessages(conversationId, limit);
    } catch (error) {
      console.error("[ConversationMemory] Error fetching messages:", error);
      return [];
    }
  }

  /**
   * Add a message to conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} role - Message role (user, assistant, system)
   * @param {string} content - Message content
   * @param {object} metadata - Optional metadata
   * @returns {Promise<object>} - Created message
   */
  async addMessage(conversationId, role, content, metadata = null) {
    if (!conversationId) {
      throw new Error("Conversation ID is required");
    }

    try {
      return await dbStudio.insertMessage(conversationId, role, content, metadata);
    } catch (error) {
      console.error("[ConversationMemory] Error adding message:", error);
      throw error;
    }
  }

  /**
   * Get recent messages formatted for AI
   * @param {string} conversationId - Conversation ID
   * @param {number} limit - Maximum number of messages (default: 10)
   * @returns {Promise<Array>} - Array of formatted messages
   */
  async getRecentMessages(conversationId, limit = 10) {
    const messages = await this.getMessages(conversationId, limit);
    
    // Format for OpenAI API
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Update macro journey for conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} macroJourney - Macro journey text
   * @returns {Promise<void>}
   */
  async updateMacroJourney(conversationId, macroJourney) {
    if (!conversationId) {
      return;
    }

    try {
      await dbStudio.updateConversationMacroJourney(conversationId, macroJourney);
    } catch (error) {
      console.error("[ConversationMemory] Error updating macro journey:", error);
    }
  }
}
