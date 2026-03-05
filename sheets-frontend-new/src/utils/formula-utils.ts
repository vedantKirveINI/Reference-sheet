import { FORMULA_FUNCTION_NAMES } from '@/config/formula-functions';
import type { IExtendedColumn } from '@/stores/fields-store';

export type TokenType = 'field' | 'function' | 'string' | 'number' | 'operator' | 'paren' | 'separator' | 'unknown';

export interface FormulaToken {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}

export function parseFormulaTokens(expr: string): FormulaToken[] {
  const tokens: FormulaToken[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    if (ch === '{') {
      const end = expr.indexOf('}', i);
      if (end !== -1) {
        tokens.push({ type: 'field', value: expr.slice(i, end + 1), start: i, end: end + 1 });
        i = end + 1;
        continue;
      }
    }

    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < expr.length && expr[j] !== quote) {
        if (expr[j] === '\\') j++;
        j++;
      }
      tokens.push({ type: 'string', value: expr.slice(i, j + 1), start: i, end: j + 1 });
      i = j + 1;
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === '-' && i + 1 < expr.length && /[0-9]/.test(expr[i + 1]) && (tokens.length === 0 || tokens[tokens.length - 1].type === 'operator' || tokens[tokens.length - 1].type === 'paren' || tokens[tokens.length - 1].type === 'separator'))) {
      let j = i + 1;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      tokens.push({ type: 'number', value: expr.slice(i, j), start: i, end: j });
      i = j;
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let j = i + 1;
      while (j < expr.length && /[a-zA-Z0-9_]/.test(expr[j])) j++;
      const word = expr.slice(i, j);
      const type: TokenType = FORMULA_FUNCTION_NAMES.has(word.toLowerCase()) ? 'function' : 'unknown';
      tokens.push({ type, value: word, start: i, end: j });
      i = j;
      continue;
    }

    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch, start: i, end: i + 1 });
      i++;
      continue;
    }

    if (ch === ',') {
      tokens.push({ type: 'separator', value: ch, start: i, end: i + 1 });
      i++;
      continue;
    }

    if ('+-*/=<>!&|'.includes(ch)) {
      let j = i + 1;
      while (j < expr.length && '+-*/=<>!&|'.includes(expr[j])) j++;
      tokens.push({ type: 'operator', value: expr.slice(i, j), start: i, end: j });
      i = j;
      continue;
    }

    tokens.push({ type: 'unknown', value: ch, start: i, end: i + 1 });
    i++;
  }

  return tokens;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFormula(expr: string, columns: IExtendedColumn[]): ValidationResult {
  const trimmed = expr.trim();
  if (!trimmed) return { valid: false, error: 'Formula is empty' };

  let depth = 0;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '(') depth++;
    else if (trimmed[i] === ')') {
      depth--;
      if (depth < 0) return { valid: false, error: 'Unexpected closing parenthesis' };
    }
  }
  if (depth !== 0) return { valid: false, error: `Missing ${depth} closing parenthesis${depth > 1 ? 'es' : ''}` };

  const fieldRefs = [...trimmed.matchAll(/\{([^}]+)\}/g)];
  const knownFieldNames = new Set(columns.map(c => c.dbFieldName?.toLowerCase()).filter(Boolean));
  const knownDisplayNames = new Set(columns.map(c => c.name?.toLowerCase()).filter(Boolean));

  for (const match of fieldRefs) {
    const ref = match[1].toLowerCase();
    if (!knownFieldNames.has(ref) && !knownDisplayNames.has(ref)) {
      return { valid: false, error: `Unknown field reference: {${match[1]}}` };
    }
  }

  const funcMatches = [...trimmed.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g)];
  for (const match of funcMatches) {
    const name = match[1].toLowerCase();
    if (!FORMULA_FUNCTION_NAMES.has(name)) {
      return { valid: false, error: `Unknown function: ${match[1]}()` };
    }
  }

  return { valid: true };
}

export interface InsertResult {
  newValue: string;
  selectionStart: number;
  selectionEnd: number;
}

export function insertAtCursor(
  currentValue: string,
  insertion: string,
  cursorPos: number
): InsertResult {
  const before = currentValue.slice(0, cursorPos);
  const after = currentValue.slice(cursorPos);
  const newValue = before + insertion + after;
  const insertionBase = cursorPos;

  const parenIdx = insertion.indexOf('(');
  if (parenIdx !== -1) {
    const firstArgStart = insertionBase + parenIdx + 1;
    const commaIdx = insertion.indexOf(',', parenIdx);
    const closeIdx = insertion.indexOf(')', parenIdx);
    const firstArgEnd = commaIdx !== -1
      ? insertionBase + commaIdx
      : closeIdx !== -1
        ? insertionBase + closeIdx
        : firstArgStart;
    return { newValue, selectionStart: firstArgStart, selectionEnd: firstArgEnd };
  }

  const end = insertionBase + insertion.length;
  return { newValue, selectionStart: end, selectionEnd: end };
}
