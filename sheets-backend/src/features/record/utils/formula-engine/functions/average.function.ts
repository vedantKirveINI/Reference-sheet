import { FormulaFunction, FormulaContext } from '../types';

export class AverageFunction implements FormulaFunction {
  name = 'average';

  validateArgs(args: any[]): boolean {
    return args.length > 0;
  }

  execute(args: any[], _context: FormulaContext): number | null {
    const numericValues: number[] = [];

    for (const arg of args) {
      const num = this.toNumber(arg);
      if (num !== null) {
        numericValues.push(num);
      }
    }

    if (numericValues.length === 0) {
      return null;
    }

    const sum = numericValues.reduce((acc, val) => acc + val, 0);
    return sum / numericValues.length;
  }

  private toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return isNaN(value) ? null : value;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
}
