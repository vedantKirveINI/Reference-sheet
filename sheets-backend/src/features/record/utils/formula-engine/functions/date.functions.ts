import { FormulaFunction, FormulaContext } from '../types';

export class NowFunction implements FormulaFunction {
  name = 'now';

  validateArgs(args: any[]): boolean {
    return args.length === 0;
  }

  execute(_args: any[], _context: FormulaContext): string {
    return new Date().toISOString();
  }
}

export class TodayFunction implements FormulaFunction {
  name = 'today';

  validateArgs(args: any[]): boolean {
    return args.length === 0;
  }

  execute(_args: any[], _context: FormulaContext): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}
