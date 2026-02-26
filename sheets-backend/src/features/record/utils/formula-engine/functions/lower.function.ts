import { FormulaFunction, FormulaContext } from '../types';

export class LowerFunction implements FormulaFunction {
  name = 'lower';

  validateArgs(args: any[]): boolean {
    return args.length === 1;
  }

  execute(args: any[], _context: FormulaContext): string {
    return String(args[0] || '').toLowerCase();
  }
}
