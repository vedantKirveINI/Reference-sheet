import { FormulaFunction, FormulaContext } from '../types';

function toNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return isNaN(value) ? null : value;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

export class LenFunction implements FormulaFunction {
  name = 'len';
  validateArgs(args: any[]): boolean { return args.length === 1; }
  execute(args: any[], _context: FormulaContext): number {
    return String(args[0] ?? '').length;
  }
}

export class LeftFunction implements FormulaFunction {
  name = 'left';
  validateArgs(args: any[]): boolean { return args.length === 2; }
  execute(args: any[], _context: FormulaContext): string {
    const text = String(args[0] ?? '');
    const count = toNumber(args[1]) ?? 0;
    return text.substring(0, count);
  }
}

export class RightFunction implements FormulaFunction {
  name = 'right';
  validateArgs(args: any[]): boolean { return args.length === 2; }
  execute(args: any[], _context: FormulaContext): string {
    const text = String(args[0] ?? '');
    const count = toNumber(args[1]) ?? 0;
    return text.substring(Math.max(0, text.length - count));
  }
}

export class MidFunction implements FormulaFunction {
  name = 'mid';
  validateArgs(args: any[]): boolean { return args.length === 3; }
  execute(args: any[], _context: FormulaContext): string {
    const text = String(args[0] ?? '');
    const start = (toNumber(args[1]) ?? 1) - 1;
    const count = toNumber(args[2]) ?? 0;
    return text.substring(Math.max(0, start), Math.max(0, start) + count);
  }
}

export class FindFunction implements FormulaFunction {
  name = 'find';
  validateArgs(args: any[]): boolean { return args.length >= 2 && args.length <= 3; }
  execute(args: any[], _context: FormulaContext): number {
    const search = String(args[0] ?? '');
    const text = String(args[1] ?? '');
    const startPos = args.length > 2 ? (toNumber(args[2]) ?? 1) - 1 : 0;
    const index = text.indexOf(search, Math.max(0, startPos));
    return index === -1 ? 0 : index + 1;
  }
}

export class SubstituteFunction implements FormulaFunction {
  name = 'substitute';
  validateArgs(args: any[]): boolean { return args.length === 3; }
  execute(args: any[], _context: FormulaContext): string {
    const text = String(args[0] ?? '');
    const oldText = String(args[1] ?? '');
    const newText = String(args[2] ?? '');
    return text.split(oldText).join(newText);
  }
}

export class TrimFunction implements FormulaFunction {
  name = 'trim';
  validateArgs(args: any[]): boolean { return args.length === 1; }
  execute(args: any[], _context: FormulaContext): string {
    return String(args[0] ?? '').trim();
  }
}

export class TextFunction implements FormulaFunction {
  name = 'text';
  validateArgs(args: any[]): boolean { return args.length === 1; }
  execute(args: any[], _context: FormulaContext): string {
    if (args[0] === null || args[0] === undefined) return '';
    return String(args[0]);
  }
}
