/**
 * ModelSelector - Cost-optimized model selection
 * 
 * Selects appropriate models based on task type to optimize costs.
 */
export class ModelSelector {
  constructor() {
    // Model configurations
    this.models = {
      // Main conversation model (cost-effective)
      conversation: {
        model: "gpt-4o-mini",
        maxTokens: 1024,
        temperature: 0.7,
      },
      // Memory operations (cheaper)
      memory: {
        model: "gpt-4o-mini",
        maxTokens: 512,
        temperature: 0.3,
      },
      // Workflow generation (needs more capability)
      workflowGeneration: {
        model: "gpt-4o",
        maxTokens: 4096,
        temperature: 0.3,
      },
      // Setup/configuration (moderate)
      setup: {
        model: "gpt-4o-mini",
        maxTokens: 1024,
        temperature: 0.5,
      },
    };
  }

  /**
   * Get model configuration for a task type
   * @param {string} taskType - Task type (conversation, memory, workflowGeneration, setup)
   * @returns {object} - Model configuration
   */
  getModel(taskType = "conversation") {
    return this.models[taskType] || this.models.conversation;
  }

  /**
   * Get model name for a task type
   * @param {string} taskType - Task type
   * @returns {string} - Model name
   */
  getModelName(taskType = "conversation") {
    return this.getModel(taskType).model;
  }

  /**
   * Get max tokens for a task type
   * @param {string} taskType - Task type
   * @returns {number} - Max tokens
   */
  getMaxTokens(taskType = "conversation") {
    return this.getModel(taskType).maxTokens;
  }

  /**
   * Get temperature for a task type
   * @param {string} taskType - Task type
   * @returns {number} - Temperature
   */
  getTemperature(taskType = "conversation") {
    return this.getModel(taskType).temperature;
  }

  /**
   * Track token usage (placeholder for future implementation)
   * @param {string} taskType - Task type
   * @param {number} tokensUsed - Tokens used
   */
  trackUsage(taskType, tokensUsed) {
    // Future: Implement token tracking and cost calculation
    // For now, just log
    console.log(`[ModelSelector] ${taskType}: ${tokensUsed} tokens`);
  }
}
