import type { NodeValidator, ValidationResult, NodeValidationContext } from './types';

const validatorRegistry: Map<string, NodeValidator> = new Map();

export function registerValidator(nodeType: string, validator: NodeValidator): void {
  validatorRegistry.set(nodeType, validator);
}

export function getValidator(nodeType: string): NodeValidator | undefined {
  return validatorRegistry.get(nodeType);
}

export function validateNode(context: NodeValidationContext): ValidationResult {
  const validator = validatorRegistry.get(context.nodeType);
  
  if (!validator) {
    return {
      isValid: true,
      issues: [],
      summary: undefined,
    };
  }
  
  try {
    return validator(context);
  } catch (error) {
    console.error(`[ValidationRegistry] Error validating node ${context.nodeType}:`, error);
    return {
      isValid: false,
      issues: [{
        field: 'general',
        message: 'An error occurred while validating this step',
        severity: 'error',
      }],
    };
  }
}

export function hasValidator(nodeType: string): boolean {
  return validatorRegistry.has(nodeType);
}
