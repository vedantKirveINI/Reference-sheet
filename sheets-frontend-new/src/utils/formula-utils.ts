import {
  FORMULA_FUNCTION_NAMES,
  getFunctionByName,
  getArgBounds,
} from '@/config/formula-functions';
import type { IExtendedColumn } from '@/stores/fields-store';

// =============================================================================
// Block types (mirror backend ExpressionBlock / FormulaExpression)
// =============================================================================

export interface ExpressionBlock {
  type: 'FUNCTIONS' | 'FIELDS' | 'PRIMITIVES' | 'OPERATORS';
  value?: string;
  displayValue?: string;
  category?: string;
  tableData?: {
    dbFieldName: string;
    name?: string;
    type?: string;
    id?: string | number;
  };
}

export interface FormulaExpression {
  type: 'FX';
  blocks: ExpressionBlock[];
}

// =============================================================================
// String ↔ Blocks conversion
// =============================================================================

/**
 * Converts the backend blocks representation of a formula back into the
 * human-readable string used by our textarea editor.
 * e.g. [FUNCTIONS:concatenate, OPERATORS:(, FIELDS:first_name, OPERATORS:), ] → "concatenate({first_name})"
 */
export function expressionBlocksToString(blocks: ExpressionBlock[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    if (block.type === 'FUNCTIONS') {
      parts.push(block.value || '');
    } else if (block.type === 'OPERATORS') {
      if (block.value === ';') {
        parts.push(', ');
      } else {
        parts.push(block.value || '');
      }
    } else if (block.type === 'FIELDS') {
      const dbName = block.tableData?.dbFieldName || '';
      parts.push(`{${dbName}}`);
    } else if (block.type === 'PRIMITIVES') {
      const val = block.value ?? '';
      const isNum = /^-?\d+(\.\d+)?$/.test(val);
      parts.push(isNum ? val : `"${val}"`);
    }
  }
  return parts.join('');
}

/**
 * Parses the textarea expression string into the blocks format expected by
 * the backend FormulaEngineService.
 * Commas become OPERATORS ';' blocks (the backend's arg separator).
 * Spaces and other unknown tokens are skipped.
 */
export function expressionStringToBlocks(
  expr: string,
  columns: IExtendedColumn[],
): FormulaExpression {
  const tokens = parseFormulaTokens(expr);
  const blocks: ExpressionBlock[] = [];

  for (const token of tokens) {
    if (token.type === 'function') {
      blocks.push({ type: 'FUNCTIONS', value: token.value.toLowerCase() });
    } else if (token.type === 'paren') {
      blocks.push({ type: 'OPERATORS', value: token.value });
    } else if (token.type === 'field') {
      const dbFieldName = token.value.slice(1, -1);
      const col = columns.find(
        (c) =>
          c.dbFieldName?.toLowerCase() === dbFieldName.toLowerCase() ||
          c.name?.toLowerCase() === dbFieldName.toLowerCase(),
      );
      const resolvedDbName = col?.dbFieldName || dbFieldName;
      blocks.push({
        type: 'FIELDS',
        displayValue: col?.name || dbFieldName,
        tableData: {
          dbFieldName: resolvedDbName,
          name: col?.name || dbFieldName,
          type: col?.rawType || 'SHORT_TEXT',
          ...(col?.rawId != null ? { id: col.rawId } : {}),
        },
      });
    } else if (token.type === 'string') {
      const inner = token.value.slice(1, -1);
      blocks.push({ type: 'PRIMITIVES', value: inner });
    } else if (token.type === 'number') {
      blocks.push({ type: 'PRIMITIVES', value: token.value });
    } else if (token.type === 'operator') {
      blocks.push({ type: 'OPERATORS', value: token.value, category: 'arithmetic' });
    } else if (token.type === 'separator') {
      blocks.push({ type: 'OPERATORS', value: ';' });
    }
    // 'unknown' tokens (spaces etc.) are intentionally skipped
  }

  return { type: 'FX', blocks };
}

// =============================================================================
// Token types
// =============================================================================

export type TokenType =
  | 'field'
  | 'function'
  | 'string'
  | 'number'
  | 'operator'
  | 'paren'
  | 'separator'
  | 'unknown';

export interface FormulaToken {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}

// =============================================================================
// Tokenizer
// =============================================================================

/**
 * Breaks an expression string into typed tokens for syntax highlighting.
 * Function names are identified by a lookup against the registry so the
 * tokenizer always stays in sync with the supported function list.
 */
export function parseFormulaTokens(expr: string): FormulaToken[] {
  const tokens: FormulaToken[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    // Field reference: {field_name}
    if (ch === '{') {
      const end = expr.indexOf('}', i);
      if (end !== -1) {
        tokens.push({ type: 'field', value: expr.slice(i, end + 1), start: i, end: end + 1 });
        i = end + 1;
        continue;
      }
    }

    // String literal: "..." or '...'
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

    // Number literal (including negative numbers after operators/parens/separators)
    if (
      /[0-9]/.test(ch) ||
      (
        ch === '-' &&
        i + 1 < expr.length &&
        /[0-9]/.test(expr[i + 1]) &&
        (
          tokens.length === 0 ||
          tokens[tokens.length - 1].type === 'operator' ||
          tokens[tokens.length - 1].type === 'paren' ||
          tokens[tokens.length - 1].type === 'separator'
        )
      )
    ) {
      let j = i + 1;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      tokens.push({ type: 'number', value: expr.slice(i, j), start: i, end: j });
      i = j;
      continue;
    }

    // Identifier — function name if it's in the registry, otherwise unknown
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i + 1;
      while (j < expr.length && /[a-zA-Z0-9_]/.test(expr[j])) j++;
      const word = expr.slice(i, j);
      const type: TokenType = FORMULA_FUNCTION_NAMES.has(word.toLowerCase()) ? 'function' : 'unknown';
      tokens.push({ type, value: word, start: i, end: j });
      i = j;
      continue;
    }

    // Parentheses
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch, start: i, end: i + 1 });
      i++;
      continue;
    }

    // Argument separator
    if (ch === ',') {
      tokens.push({ type: 'separator', value: ch, start: i, end: i + 1 });
      i++;
      continue;
    }

    // Operators (only the ones supported by the backend)
    if ('+-*/'.includes(ch)) {
      let j = i + 1;
      while (j < expr.length && '+-*/'.includes(expr[j])) j++;
      tokens.push({ type: 'operator', value: expr.slice(i, j), start: i, end: j });
      i = j;
      continue;
    }

    tokens.push({ type: 'unknown', value: ch, start: i, end: i + 1 });
    i++;
  }

  return tokens;
}

// =============================================================================
// Validator
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Scans expression text for all function calls and returns each one with the
 * raw argument string and the argument count (counting top-level commas only,
 * so nested calls are handled correctly).
 *
 * This is intentionally derived from the config so that as new functions are
 * added to formula-functions.ts, validation rules apply automatically.
 */
function extractFunctionCalls(expr: string): Array<{ name: string; argCount: number }> {
  const results: Array<{ name: string; argCount: number }> = [];
  const nameRe = /([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
  let match: RegExpExecArray | null;

  while ((match = nameRe.exec(expr)) !== null) {
    const fnName = match[1];
    const argsStart = match.index + match[0].length;

    let depth = 1;
    let inStr: string | null = null;
    let commaCount = 0;
    let hasContent = false;
    let i = argsStart;

    while (i < expr.length && depth > 0) {
      const ch = expr[i];

      if (inStr) {
        if (ch === inStr && expr[i - 1] !== '\\') inStr = null;
      } else if (ch === '"' || ch === "'") {
        inStr = ch;
        hasContent = true;
      } else if (ch === '(') {
        depth++;
        hasContent = true;
      } else if (ch === ')') {
        depth--;
        if (depth > 0) hasContent = true;
      } else if (ch === ',' && depth === 1) {
        commaCount++;
        hasContent = true;
      } else if (!/\s/.test(ch)) {
        hasContent = true;
      }

      i++;
    }

    results.push({ name: fnName, argCount: hasContent ? commaCount + 1 : 0 });
  }

  return results;
}

/**
 * Validates a formula expression against:
 *  1. Balanced parentheses
 *  2. Known field references (matched against column dbFieldName and display name)
 *  3. Known function names (derived from registry — no hardcoding)
 *  4. Argument count bounds (min/max derived from each function's config)
 *
 * All validation rules scale automatically when the function registry changes.
 */
export function validateFormula(expr: string, columns: IExtendedColumn[]): ValidationResult {
  const trimmed = expr.trim();
  if (!trimmed) return { valid: false, error: 'Formula is empty' };

  // 1. Balanced parentheses
  let depth = 0;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '(') depth++;
    else if (trimmed[i] === ')') {
      depth--;
      if (depth < 0) return { valid: false, error: 'Unexpected closing parenthesis' };
    }
  }
  if (depth !== 0) {
    return { valid: false, error: `Missing ${depth} closing parenthesis${depth > 1 ? 'es' : ''}` };
  }

  // 2.5 Unsupported operator characters (backend currently only supports +, -, *, /)
  // We allow these characters only inside string literals, never as operators.
  let inStr: string | null = null;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (inStr) {
      if (ch === inStr && trimmed[i - 1] !== '\\') inStr = null;
    } else if (ch === '"' || ch === "'") {
      inStr = ch;
    } else if ('=<>!&|'.includes(ch)) {
      return { valid: false, error: `Unsupported operator in formula: "${ch}"` };
    }
  }

  // 2. Valid field references
  const knownDbNames = new Set(columns.map(c => c.dbFieldName?.toLowerCase()).filter(Boolean));
  const knownDisplayNames = new Set(columns.map(c => c.name?.toLowerCase()).filter(Boolean));
  const fieldRefs = [...trimmed.matchAll(/\{([^}]+)\}/g)];
  for (const match of fieldRefs) {
    const ref = match[1].toLowerCase();
    if (!knownDbNames.has(ref) && !knownDisplayNames.has(ref)) {
      return { valid: false, error: `Unknown field reference: {${match[1]}}` };
    }
  }

  // 3. Known function names + 4. Argument count bounds (both from registry)
  const calls = extractFunctionCalls(trimmed);
  for (const { name, argCount } of calls) {
    const fn = getFunctionByName(name);
    if (!fn) {
      return { valid: false, error: `Unknown function: ${name}()` };
    }

    const { min, max } = getArgBounds(fn);
    if (argCount < min) {
      return {
        valid: false,
        error: `${name}() needs at least ${min} argument${min !== 1 ? 's' : ''} (got ${argCount})`,
      };
    }
    if (max !== null && argCount > max) {
      return {
        valid: false,
        error: `${name}() accepts at most ${max} argument${max !== 1 ? 's' : ''} (got ${argCount})`,
      };
    }
  }

  return { valid: true };
}

// =============================================================================
// Cursor insertion utility
// =============================================================================

export interface InsertResult {
  newValue: string;
  selectionStart: number;
  selectionEnd: number;
}

/**
 * Inserts text at the given cursor position and returns the new string along
 * with the selection range to set on the textarea after insertion.
 * When the insertion contains a `(`, the first argument placeholder is
 * automatically selected so the user can type immediately.
 */
export function insertAtCursor(
  currentValue: string,
  insertion: string,
  cursorPos: number,
): InsertResult {
  const before = currentValue.slice(0, cursorPos);
  const after = currentValue.slice(cursorPos);
  const newValue = before + insertion + after;
  const base = cursorPos;

  const parenIdx = insertion.indexOf('(');
  if (parenIdx !== -1) {
    const firstArgStart = base + parenIdx + 1;
    const commaIdx = insertion.indexOf(',', parenIdx);
    const closeIdx = insertion.indexOf(')', parenIdx);
    const firstArgEnd =
      commaIdx !== -1 ? base + commaIdx : closeIdx !== -1 ? base + closeIdx : firstArgStart;
    return { newValue, selectionStart: firstArgStart, selectionEnd: firstArgEnd };
  }

  const end = base + insertion.length;
  return { newValue, selectionStart: end, selectionEnd: end };
}
