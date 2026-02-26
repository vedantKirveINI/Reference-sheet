import { FormulaFunction, FormulaContext } from '../types';

function toNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return isNaN(value) ? null : value;
  if (typeof value === 'string') {
    const num = Number(value.trim());
    return isNaN(num) ? null : num;
  }
  const num = Number(value);
  return isNaN(num) ? null : num;
}

export class SumFunction implements FormulaFunction {
  name = 'sum';
  validateArgs(args: any[]): boolean { return args.length > 0; }
  execute(args: any[], _context: FormulaContext): number {
    let total = 0;
    for (const arg of args) {
      const val = toNumber(arg);
      if (val !== null) total += val;
    }
    return total;
  }
}

export class MaxFunction implements FormulaFunction {
  name = 'max';
  validateArgs(args: any[]): boolean { return args.length > 0; }
  execute(args: any[], _context: FormulaContext): number | null {
    const nums: number[] = [];
    for (const arg of args) {
      const val = toNumber(arg);
      if (val !== null) nums.push(val);
    }
    return nums.length === 0 ? null : Math.max(...nums);
  }
}

export class MinFunction implements FormulaFunction {
  name = 'min';
  validateArgs(args: any[]): boolean { return args.length > 0; }
  execute(args: any[], _context: FormulaContext): number | null {
    const nums: number[] = [];
    for (const arg of args) {
      const val = toNumber(arg);
      if (val !== null) nums.push(val);
    }
    return nums.length === 0 ? null : Math.min(...nums);
  }
}

export class CountFunction implements FormulaFunction {
  name = 'count';
  validateArgs(args: any[]): boolean { return args.length > 0; }
  execute(args: any[], _context: FormulaContext): number {
    let count = 0;
    for (const arg of args) {
      if (arg !== null && arg !== undefined && arg !== '') {
        const num = toNumber(arg);
        if (num !== null) count++;
      }
    }
    return count;
  }
}

export class CountAFunction implements FormulaFunction {
  name = 'counta';
  validateArgs(args: any[]): boolean { return args.length > 0; }
  execute(args: any[], _context: FormulaContext): number {
    let count = 0;
    for (const arg of args) {
      if (arg !== null && arg !== undefined && arg !== '') count++;
    }
    return count;
  }
}

export class RoundFunction implements FormulaFunction {
  name = 'round';
  validateArgs(args: any[]): boolean { return args.length >= 1 && args.length <= 2; }
  execute(args: any[], _context: FormulaContext): number | null {
    const val = toNumber(args[0]);
    if (val === null) return null;
    const decimals = args.length > 1 ? toNumber(args[1]) ?? 0 : 0;
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  }
}

export class AbsFunction implements FormulaFunction {
  name = 'abs';
  validateArgs(args: any[]): boolean { return args.length === 1; }
  execute(args: any[], _context: FormulaContext): number | null {
    const val = toNumber(args[0]);
    return val === null ? null : Math.abs(val);
  }
}

export class CeilFunction implements FormulaFunction {
  name = 'ceil';
  validateArgs(args: any[]): boolean { return args.length === 1; }
  execute(args: any[], _context: FormulaContext): number | null {
    const val = toNumber(args[0]);
    return val === null ? null : Math.ceil(val);
  }
}

export class FloorFunction implements FormulaFunction {
  name = 'floor';
  validateArgs(args: any[]): boolean { return args.length === 1; }
  execute(args: any[], _context: FormulaContext): number | null {
    const val = toNumber(args[0]);
    return val === null ? null : Math.floor(val);
  }
}

export class ModFunction implements FormulaFunction {
  name = 'mod';
  validateArgs(args: any[]): boolean { return args.length === 2; }
  execute(args: any[], _context: FormulaContext): number | null {
    const dividend = toNumber(args[0]);
    const divisor = toNumber(args[1]);
    if (dividend === null || divisor === null || divisor === 0) return null;
    return dividend % divisor;
  }
}

export class PowerFunction implements FormulaFunction {
  name = 'power';
  validateArgs(args: any[]): boolean { return args.length === 2; }
  execute(args: any[], _context: FormulaContext): number | null {
    const base = toNumber(args[0]);
    const exponent = toNumber(args[1]);
    if (base === null || exponent === null) return null;
    return Math.pow(base, exponent);
  }
}

export class SqrtFunction implements FormulaFunction {
  name = 'sqrt';
  validateArgs(args: any[]): boolean { return args.length === 1; }
  execute(args: any[], _context: FormulaContext): number | null {
    const val = toNumber(args[0]);
    if (val === null || val < 0) return null;
    return Math.sqrt(val);
  }
}
