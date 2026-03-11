import type { ValidationResult, ValidationIssue } from './types';

export function createValidationResult(
  issues: ValidationIssue[]
): ValidationResult {
  const hasErrors = issues.some(i => i.severity === 'error');
  
  return {
    isValid: !hasErrors,
    issues,
    summary: generateSummary(issues),
  };
}

function generateSummary(issues: ValidationIssue[]): string {
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  
  if (errors.length === 0 && warnings.length === 0) {
    return '';
  }
  
  const parts: string[] = [];
  
  if (errors.length === 1) {
    parts.push(`1 required field needs attention`);
  } else if (errors.length > 1) {
    parts.push(`${errors.length} required fields need attention`);
  }
  
  if (warnings.length === 1) {
    parts.push(`1 optional improvement`);
  } else if (warnings.length > 1) {
    parts.push(`${warnings.length} optional improvements`);
  }
  
  return parts.join(' and ');
}

export function createIssue(
  field: string,
  message: string,
  severity: 'error' | 'warning' = 'error',
  hint?: string
): ValidationIssue {
  return { field, message, severity, hint };
}

export function required(fieldName: string, displayName: string, hint?: string): ValidationIssue {
  return createIssue(
    fieldName,
    `${displayName} is required`,
    'error',
    hint
  );
}

export function recommended(fieldName: string, displayName: string, hint?: string): ValidationIssue {
  return createIssue(
    fieldName,
    `${displayName} is recommended`,
    'warning',
    hint
  );
}
