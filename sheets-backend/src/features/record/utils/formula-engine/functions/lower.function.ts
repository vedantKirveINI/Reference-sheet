import { FormulaFunction, FormulaContext } from '../types';

export class LowerFunction implements FormulaFunction {
  name = 'lower';

  validateArgs(args: any[]): boolean {
    return args.length === 1;
  }

  execute(args: any[], context: FormulaContext): string {
    const value = this.resolveValue(args[0], context);
    return String(value || '').toLowerCase();
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

  private parseStringifiedValue(value: any): any {
    if (typeof value === 'string') {
      if (value.startsWith('"') && value.endsWith('"')) {
        try {
          return JSON.parse(value);
        } catch {
          return value.slice(1, -1);
        }
      }
    }
    return value;
  }
}
