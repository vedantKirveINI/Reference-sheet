import { FormulaFunction, FormulaContext } from '../types';

export class AverageFunction implements FormulaFunction {
  name = 'average';

  validateArgs(args: any[]): boolean {
    return args.length > 0;
  }

  execute(args: any[], context: FormulaContext): number {
    const numericValues: number[] = [];

    // Process each argument
    for (const arg of args) {
      const value = this.resolveValue(arg, context);

      // Convert to number and add to array if it's a valid number
      const numValue = this.parseNumericValue(value);
      if (numValue !== null) {
        numericValues.push(numValue);
      }
    }

    // Calculate average
    if (numericValues.length === 0) {
      return 0; // Return 0 if no valid numeric values
    }

    const sum = numericValues.reduce((acc, val) => acc + val, 0);
    return sum / numericValues.length;
  }

  private resolveValue(arg: any, context: FormulaContext): any {
    if (typeof arg === 'string' && arg.startsWith('"') && arg.endsWith('"')) {
      // Field reference - remove quotes and get value
      const fieldName = arg.slice(1, -1);
      const value = context.getValue(fieldName);

      // Parse stringified values
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

  /**
   * Parse numeric value, handling various formats
   */
  private parseNumericValue(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // If already a number, return it
    if (typeof value === 'number') {
      return isNaN(value) ? null : value;
    }

    // Convert string to number
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') {
        return null;
      }

      const num = Number(trimmed);
      return isNaN(num) ? null : num;
    }

    // Try to convert other types
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
}
