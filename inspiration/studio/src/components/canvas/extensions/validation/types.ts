export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  hint?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  summary?: string;
}

export interface NodeValidationContext {
  nodeKey: string;
  nodeType: string;
  nodeName: string;
  tfData: Record<string, any>;
  goData: Record<string, any>;
}

export type NodeValidator = (context: NodeValidationContext) => ValidationResult;
