import { FormulaFunction, FormulaContext } from '../types';

function isTruthy(value: any): boolean {
  if (value === null || value === undefined || value === '' || value === 0 || value === false) {
    return false;
  }
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'false' || lower === '0') return false;
  }
  return true;
}

export class IfFunction implements FormulaFunction {
  name = 'if';
  validateArgs(args: any[]): boolean { return args.length === 3; }
  execute(args: any[], _context: FormulaContext): any {
    return isTruthy(args[0]) ? args[1] : args[2];
  }
}

export class AndFunction implements FormulaFunction {
  name = 'and';
  validateArgs(args: any[]): boolean { return args.length > 0; }
  execute(args: any[], _context: FormulaContext): boolean {
    return args.every((arg) => isTruthy(arg));
  }
}

export class OrFunction implements FormulaFunction {
  name = 'or';
  validateArgs(args: any[]): boolean { return args.length > 0; }
  execute(args: any[], _context: FormulaContext): boolean {
    return args.some((arg) => isTruthy(arg));
  }
}

export class NotFunction implements FormulaFunction {
  name = 'not';
  validateArgs(args: any[]): boolean { return args.length === 1; }
  execute(args: any[], _context: FormulaContext): boolean {
    return !isTruthy(args[0]);
  }
}

export class SwitchFunction implements FormulaFunction {
  name = 'switch';
  validateArgs(args: any[]): boolean { return args.length >= 3; }
  execute(args: any[], _context: FormulaContext): any {
    const expr = args[0];
    for (let i = 1; i < args.length - 1; i += 2) {
      if (String(expr) === String(args[i])) {
        return args[i + 1];
      }
    }
    if (args.length % 2 === 0) {
      return args[args.length - 1];
    }
    return null;
  }
}

export class BlankFunction implements FormulaFunction {
  name = 'blank';
  validateArgs(args: any[]): boolean { return args.length === 0; }
  execute(_args: any[], _context: FormulaContext): null {
    return null;
  }
}
