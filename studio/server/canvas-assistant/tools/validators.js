/**
 * Parameter validation utilities
 * 
 * Provides schema-based validation for tool parameters.
 * Addresses ~68% of errors caused by wrong parameters.
 */

/**
 * Validate arguments against a JSON schema
 * @param {object} schema - JSON schema object
 * @param {object} args - Arguments to validate
 * @returns {{valid: boolean, errors: Array<string>}} - Validation result
 */
export function validateSchema(schema, args) {
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
        if (propSchema.pattern) {
          const regex = new RegExp(propSchema.pattern);
          if (!regex.test(value)) {
            errors.push(`Parameter '${key}' does not match required pattern: ${propSchema.pattern}`);
          }
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

      // Array validation
      if (propSchema.type === "array" && Array.isArray(value)) {
        if (propSchema.minItems && value.length < propSchema.minItems) {
          errors.push(`Parameter '${key}' must have at least ${propSchema.minItems} items`);
        }
        if (propSchema.maxItems && value.length > propSchema.maxItems) {
          errors.push(`Parameter '${key}' must have at most ${propSchema.maxItems} items`);
        }
        if (propSchema.items) {
          value.forEach((item, index) => {
            const itemErrors = validateSchema(propSchema.items, { item });
            if (!itemErrors.valid) {
              errors.push(`Parameter '${key}[${index}]': ${itemErrors.errors.join(", ")}`);
            }
          });
        }
      }

      // Enum validation
      if (propSchema.enum && !propSchema.enum.includes(value)) {
        errors.push(`Parameter '${key}' must be one of: ${propSchema.enum.join(", ")}`);
      }

      // Nested object validation
      if (propSchema.type === "object" && typeof value === "object" && !Array.isArray(value) && value !== null) {
        if (propSchema.properties) {
          const nestedErrors = validateSchema(propSchema, value);
          if (!nestedErrors.valid) {
            errors.push(...nestedErrors.errors.map(e => `${key}.${e}`));
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Apply default values from schema to arguments
 * @param {object} schema - JSON schema object
 * @param {object} args - Arguments (may be missing defaults)
 * @returns {object} - Arguments with defaults applied
 */
export function applyDefaults(schema, args) {
  const result = { ...args };

  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (result[key] === undefined && propSchema.default !== undefined) {
        result[key] = propSchema.default;
      }
    }
  }

  return result;
}
