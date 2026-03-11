export * from './types.js';
export * from './ast.js';
export * from './tokenizer.js';
export * from './parser.js';
export * from './type-inference.js';
export * from './evaluator.js';

import { tokenizeBlocks } from './tokenizer.js';
import { parseFormula } from './parser.js';
import { inferTypes } from './type-inference.js';
import { evaluateFormula, DebugStepStatus } from './evaluator.js';
import { typeToString } from './types.js';

export const debugFormula = (blocks, options = {}) => {
  const {
    functionRegistry = {},
    variableRegistry = {},
    variableValues = {},
  } = options;

  const tokens = tokenizeBlocks(blocks);
  
  const { ast, errors: parseErrors } = parseFormula(tokens, functionRegistry, variableRegistry);
  
  if (!ast) {
    return {
      success: false,
      value: null,
      errors: parseErrors.length > 0 ? parseErrors : ['No expression to evaluate'],
      diagnostics: [],
      trace: [],
      ast: null,
    };
  }

  const { diagnostics } = inferTypes(ast, functionRegistry, variableRegistry);
  
  const { value, rootStep, trace } = evaluateFormula(ast, functionRegistry, variableValues, true);

  const errors = [
    ...parseErrors,
    ...diagnostics.filter(d => d.severity === 'error').map(d => d.message),
  ];

  const hasErrors = errors.length > 0 || trace.some(s => s.status === DebugStepStatus.ERROR);

  return {
    success: !hasErrors,
    value: hasErrors ? null : value,
    errors,
    diagnostics,
    trace,
    rootStep,
    ast,
  };
};

export const formatDebugTrace = (trace) => {
  return trace.map((step, index) => {
    const indent = '  '.repeat(step.children?.length > 0 ? 0 : 1);
    const statusIcon = step.status === 'success' ? '✓' : step.status === 'error' ? '✗' : '○';
    const typeStr = step.inferredType || 'unknown';
    const nullableStr = step.nullable ? '?' : '';
    const valueStr = step.value !== null && step.value !== undefined 
      ? ` = ${JSON.stringify(step.value)}`
      : '';
    const errorStr = step.errorMessage ? ` (${step.errorMessage})` : '';
    
    return `${indent}${statusIcon} ${step.label} : ${typeStr}${nullableStr}${valueStr}${errorStr}`;
  }).join('\n');
};

export const validateFormula = (blocks, options = {}) => {
  const {
    functionRegistry = {},
    variableRegistry = {},
  } = options;

  if (!blocks || blocks.length === 0) {
    return {
      valid: true,
      errors: [],
      diagnostics: [],
      ast: null,
    };
  }

  try {
    const tokens = tokenizeBlocks(blocks);
    const { ast, errors: parseErrors } = parseFormula(tokens, functionRegistry, variableRegistry);
    
    if (!ast) {
      return {
        valid: parseErrors.length === 0,
        errors: parseErrors,
        diagnostics: [],
        ast: null,
      };
    }

    const { diagnostics } = inferTypes(ast, functionRegistry, variableRegistry);
    
    const errors = [
      ...parseErrors,
      ...diagnostics.filter(d => d.severity === 'error').map(d => d.message),
    ];

    return {
      valid: errors.length === 0,
      errors,
      diagnostics,
      ast,
    };
  } catch (e) {
    return {
      valid: false,
      errors: [e.message || 'Validation error'],
      diagnostics: [],
      ast: null,
    };
  }
};
