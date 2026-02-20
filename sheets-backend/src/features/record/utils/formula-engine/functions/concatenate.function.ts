import { FormulaFunction, FormulaContext } from '../types';

export class ConcatenateFunction implements FormulaFunction {
  name = 'concatenate';

  validateArgs(args: any[]): boolean {
    return args.length > 0;
  }

  execute(args: any[], context: FormulaContext): string {
    return args
      .map((arg) => {
        const value = this.resolveValue(arg, context);
        return value !== null && value !== undefined ? String(value) : '';
      })
      .join('');
  }

  private resolveValue(arg: any, context: FormulaContext): any {
    if (typeof arg === 'string' && arg.startsWith('"') && arg.endsWith('"')) {
      // Field reference - remove quotes and get value
      const fieldName = arg.slice(1, -1);
      const value = context.getValue(fieldName);

      // NEW: Parse stringified values
      return this.parseStringifiedValue(value);
    }
    if (typeof arg === 'string' && arg.startsWith("'") && arg.endsWith("'")) {
      // Literal string - remove quotes
      return arg.slice(1, -1);
    }
    return arg;
  }

  /**
   * Parse stringified values from getRecords
   * Handles cases like '"2025-07-23T13:23:00.000Z"' -> '2025-07-23T13:23:00.000Z'
   */
  private parseStringifiedValue(value: any): any {
    if (typeof value === 'string') {
      // Check if it's a stringified value (has extra quotes)
      if (value.startsWith('"') && value.endsWith('"')) {
        try {
          // Try to parse as JSON first (handles escaped quotes)
          return JSON.parse(value);
        } catch {
          // If JSON parsing fails, just remove the outer quotes
          return value.slice(1, -1);
        }
      }
    }
    return value;
  }
}
