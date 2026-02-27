// Types for formula expressions
export interface ExpressionBlock {
  type: 'FUNCTIONS' | 'FIELDS' | 'PRIMITIVES' | 'OPERATORS';
  value?: string;
  category?: string;
  tableData?: {
    dbFieldName: string;
  };
}

export interface FormulaExpression {
  type: 'FX';
  blocks: ExpressionBlock[];
}

export interface FormulaContext {
  recordData: Record<string, any>;
  getValue: (fieldName: string) => any;
}

// Strategy Pattern for different function types
export interface FormulaFunction {
  name: string;
  execute: (args: any[], context: FormulaContext) => any;
  validateArgs: (args: any[]) => boolean;
}
