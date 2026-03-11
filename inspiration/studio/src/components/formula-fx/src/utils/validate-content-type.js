import { checkTypeCompatibility, SEVERITY_LEVELS } from './type-inference.js';
import { validate } from "oute-services-fx-validator-sdk";

/**
 * Extracts content string from blocks array
 * @param {Array} content - Array of block objects
 * @returns {string} - Extracted content string
 */
export const extractContentString = (content) => {
  if (!content || content.length === 0) return "";

  return content
    .map((block) => {
      if (!block) return "";
      if (block.type === "PRIMITIVES") return block.value || "";
      if (block.value) return block.value;
      if (block.displayValue) return block.displayValue;
      if (block.name) return block.name;
      return "";
    })
    .join("");
};

/**
 * Validates content type compatibility
 * @param {Array} content - Array of block objects
 * @param {string} expectedType - Expected type ("any", "string", "number", "int", etc.)
 * @returns {Object} - Validation result with { hasError, hasWarning, message, severity, error }
 */
export const validateContentType = (content, expectedType) => {
  if (!content || content.length === 0) {
    return {
      hasError: false,
      hasWarning: false,
      message: "",
      severity: SEVERITY_LEVELS.NONE,
      error: null,
    };
  }


  let actualType = "any";
  try {
    const validationResult = validate(content);
    // Convert SDK return_type to lowercase to match your type system
    actualType = (validationResult?.return_type || "ANY").toLowerCase();
  } catch (error) {
    // If validation fails, fall back to "any"
    console.warn("Validation error:", error);
    actualType = "any";
  }


  // If no type constraint, return no error
  if (expectedType === "any") {
    return {
      hasError: false,
      hasWarning: false,
      message: "",
      severity: SEVERITY_LEVELS.NONE,
      error: null,
    };
  }

  // Check type compatibility
  const compatibility = checkTypeCompatibility(expectedType, actualType);

  if (compatibility.severity === SEVERITY_LEVELS.NONE) {
    return {
      hasError: false,
      hasWarning: false,
      message: "",
      severity: SEVERITY_LEVELS.NONE,
      error: null,
    };
  }

  const error = {
    error: compatibility.severity === SEVERITY_LEVELS.ERROR,
    warning: compatibility.severity === SEVERITY_LEVELS.WARNING,
    errorMessage: compatibility.message,
    errorType: "TYPE_MISMATCH",
    severity: compatibility.severity,
  };

  return {
    hasError: compatibility.severity === SEVERITY_LEVELS.ERROR,
    hasWarning: compatibility.severity === SEVERITY_LEVELS.WARNING,
    message: compatibility.message,
    severity: compatibility.severity,
    error,
  };
};

