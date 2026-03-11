/**
 * BaseTool - Abstract base class for all tools
 * 
 * All tools must extend this class and implement:
 * - name: tool identifier (snake_case)
 * - description: when to use this tool
 * - parameters: JSON schema for validation
 * - execute(args, context): the actual tool logic
 */
export class BaseTool {
  /**
   * Tool name (snake_case identifier)
   * @type {string}
   */
  get name() {
    throw new Error("Tool must define 'name' property");
  }

  /**
   * Tool description (when to use this tool)
   * @type {string}
   */
  get description() {
    throw new Error("Tool must define 'description' property");
  }

  /**
   * JSON schema for tool parameters
   * @type {object}
   */
  get parameters() {
    throw new Error("Tool must define 'parameters' property");
  }

  /**
   * Execute the tool with given arguments and context
   * @param {object} args - Validated tool arguments
   * @param {object} context - Execution context (userId, accessToken, workflowContext, etc.)
   * @returns {Promise<any>} - Tool execution result
   */
  async execute(args, context) {
    throw new Error("Tool must implement 'execute' method");
  }

  /**
   * Validate tool arguments against schema
   * @param {object} args - Arguments to validate
   * @returns {{valid: boolean, errors: Array<string>}} - Validation result
   */
  validate(args) {
    const schema = this.parameters;
    const errors = [];

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (args[field] === undefined || args[field] === null) {
          errors.push(`Missing required parameter: ${field}`);
        }
      }
    }

    // Validate each property
    if (schema.properties) {
      for (const [key, value] of Object.entries(args)) {
        const propSchema = schema.properties[key];
        if (!propSchema) {
          // Allow extra properties for flexibility
          continue;
        }

        // Type validation
        if (propSchema.type) {
          const actualType = Array.isArray(value) ? "array" : typeof value;
          if (actualType !== propSchema.type) {
            errors.push(`Parameter '${key}' must be of type ${propSchema.type}, got ${actualType}`);
          }
        }

        // String validation
        if (propSchema.type === "string" && typeof value === "string") {
          if (propSchema.minLength && value.length < propSchema.minLength) {
            errors.push(`Parameter '${key}' must be at least ${propSchema.minLength} characters`);
          }
          if (propSchema.maxLength && value.length > propSchema.maxLength) {
            errors.push(`Parameter '${key}' must be at most ${propSchema.maxLength} characters`);
          }
        }

        // Number validation
        if (propSchema.type === "number" && typeof value === "number") {
          if (propSchema.minimum !== undefined && value < propSchema.minimum) {
            errors.push(`Parameter '${key}' must be at least ${propSchema.minimum}`);
          }
          if (propSchema.maximum !== undefined && value > propSchema.maximum) {
            errors.push(`Parameter '${key}' must be at most ${propSchema.maximum}`);
          }
        }

        // Enum validation
        if (propSchema.enum && !propSchema.enum.includes(value)) {
          errors.push(`Parameter '${key}' must be one of: ${propSchema.enum.join(", ")}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert tool to OpenAI function calling format
   * @returns {object} - OpenAI function schema
   */
  getOpenAISchema() {
    return {
      type: "function",
      function: {
        name: this.name,
        description: this.description,
        parameters: this.parameters,
      },
    };
  }
}
