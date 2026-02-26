import { FormulaFunction, FormulaContext } from '../types';

export class ConcatenateFunction implements FormulaFunction {
  name = 'concatenate';

  validateArgs(args: any[]): boolean {
    return args.length > 0;
  }

  execute(args: any[], _context: FormulaContext): string {
    return args
      .map((arg) => {
        return arg !== null && arg !== undefined ? String(arg) : '';
      })
      .join('');
  }
}
