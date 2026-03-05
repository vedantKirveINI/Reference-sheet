import {
  getFunctionInfo,
  getFunctionReturnType,
  getArgTypeAt,
  checkArgCount,
} from "./function-type-registry.js";

const TYPE_COERCION_RULES = {
  'string+number': 'string',
  'number+string': 'string',
  'string+boolean': 'string',
  'boolean+string': 'string',
  'number+boolean': 'number',
  'boolean+number': 'number',
  'string+string': 'string',
  'number+number': 'number',
  'boolean+boolean': 'boolean',
  'any+string': 'string',
  'string+any': 'string',
  'any+number': 'any',
  'number+any': 'any',
  'any+boolean': 'any',
  'boolean+any': 'any',
  'any+any': 'any',
};

const SEVERITY_LEVELS = {
  NONE: 'none',
  WARNING: 'warning',
  ERROR: 'error',
};

const TYPE_COMPATIBILITY = {
  string: {
    string: { compatible: true, severity: SEVERITY_LEVELS.NONE },
    number: { compatible: true, severity: SEVERITY_LEVELS.WARNING, message: 'Number will be converted to text' },
    boolean: { compatible: true, severity: SEVERITY_LEVELS.WARNING, message: 'Boolean will be converted to text' },
    int: { compatible: true, severity: SEVERITY_LEVELS.WARNING, message: 'Integer will be converted to text' },
    object: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Object cannot be stored as text' },
    array: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Array cannot be stored as text' },
    any: { compatible: true, severity: SEVERITY_LEVELS.NONE },
  },
  number: {
    string: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Text cannot be stored as number - may cause database errors' },
    number: { compatible: true, severity: SEVERITY_LEVELS.NONE },
    boolean: { compatible: true, severity: SEVERITY_LEVELS.WARNING, message: 'Boolean will be converted to 0/1' },
    int: { compatible: true, severity: SEVERITY_LEVELS.NONE },
    object: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Object cannot be stored as number' },
    array: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Array cannot be stored as number' },
    any: { compatible: true, severity: SEVERITY_LEVELS.NONE },
  },
  int: {
    string: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Text cannot be stored as integer - may cause database errors' },
    // number: { compatible: true, severity: SEVERITY_LEVELS.WARNING, message: 'Decimal will be truncated to integer' },
    number: { compatible: true, severity: SEVERITY_LEVELS.WARNING, message: 'Use floor() or ceiling() to convert decimal to integer' },
    boolean: { compatible: true, severity: SEVERITY_LEVELS.WARNING, message: 'Boolean will be converted to 0/1' },
    int: { compatible: true, severity: SEVERITY_LEVELS.NONE },
    object: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Object cannot be stored as integer' },
    array: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Array cannot be stored as integer' },
    any: { compatible: true, severity: SEVERITY_LEVELS.NONE },
  },
  boolean: {
    string: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Text cannot be stored as boolean' },
    number: { compatible: true, severity: SEVERITY_LEVELS.WARNING, message: 'Number will be converted to true/false' },
    boolean: { compatible: true, severity: SEVERITY_LEVELS.NONE },
    int: { compatible: true, severity: SEVERITY_LEVELS.WARNING, message: 'Integer will be converted to true/false' },
    object: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Object cannot be stored as boolean' },
    array: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Array cannot be stored as boolean' },
    any: { compatible: true, severity: SEVERITY_LEVELS.NONE },
  },
  object: {
    string: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Text cannot be stored as object' },
    number: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Number cannot be stored as object' },
    boolean: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Boolean cannot be stored as object' },
    int: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Integer cannot be stored as object' },
    object: { compatible: true, severity: SEVERITY_LEVELS.NONE },
    array: { compatible: true, severity: SEVERITY_LEVELS.WARNING, message: 'Array will be wrapped as object' },
    any: { compatible: true, severity: SEVERITY_LEVELS.NONE },
  },
  array: {
    string: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Text cannot be stored as array' },
    number: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Number cannot be stored as array' },
    boolean: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Boolean cannot be stored as array' },
    int: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Integer cannot be stored as array' },
    object: { compatible: false, severity: SEVERITY_LEVELS.ERROR, message: 'Object cannot be stored as array' },
    array: { compatible: true, severity: SEVERITY_LEVELS.NONE },
    any: { compatible: true, severity: SEVERITY_LEVELS.NONE },
  },
  any: {
    string: { compatible: true, severity: SEVERITY_LEVELS.NONE },
    number: { compatible: true, severity: SEVERITY_LEVELS.NONE },
    boolean: { compatible: true, severity: SEVERITY_LEVELS.NONE },
    int: { compatible: true, severity: SEVERITY_LEVELS.NONE },
    object: { compatible: true, severity: SEVERITY_LEVELS.NONE },
    array: { compatible: true, severity: SEVERITY_LEVELS.NONE },
    any: { compatible: true, severity: SEVERITY_LEVELS.NONE },
  },
};

export function inferFormulaResultType(blocks = []) {
  if (!blocks || blocks.length === 0) {
    return 'any';
  }

  const types = [];
  let hasOperator = false;
  let lastOperator = null;

  for (const block of blocks) {
    if (!block) continue;

    const blockType = block.type || block.subCategory;

    if (blockType === 'OPERATORS' || block.subCategory === 'OPERATORS') {
      hasOperator = true;
      lastOperator = block.value || block.displayValue;
      continue;
    }

    if (blockType === 'PRIMITIVES' && block.value !== undefined) {
      const value = block.value;
      if (typeof value === 'string') {
        // Check if string is a numeric value (integer or decimal)
        const trimmed = value.trim();
        const isNumericString = trimmed !== '' && !isNaN(trimmed) && !isNaN(parseFloat(trimmed)) && isFinite(trimmed);
        if (isNumericString) {
          // Check if it's a whole number (integer) or decimal
          const numValue = parseFloat(trimmed);
          if (Number.isInteger(numValue) && trimmed.indexOf('.') === -1) {
            types.push('int');
          } else {
            types.push('number');
          }
        } else {
          types.push('string');
        }
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          types.push('int');
        } else {
          types.push('number');
        }
      } else if (typeof value === 'boolean') {
        types.push('boolean');
      }
      continue;
    }

    if (blockType === 'NODE' || block.subCategory === 'NODE') {
      const variableType = block.variableData?.type?.toLowerCase() || 'any';
      types.push(normalizeType(variableType));
      continue;
    }

    if (blockType === 'FUNCTIONS' || block.subCategory === 'FUNCTIONS') {
      const returnType = block.returnType?.toLowerCase() || 'any';
      types.push(normalizeType(returnType));
      continue;
    }

    if (block.variableData?.type) {
      types.push(normalizeType(block.variableData.type.toLowerCase()));
      continue;
    }

    types.push('any');
  }

  if (types.length === 0) {
    return 'any';
  }

  if (types.length === 1) {
    return types[0];
  }

  if (hasOperator) {
    if (lastOperator === '+') {
      return types.reduce((acc, type) => {
        const key = `${acc}+${type}`;
        return TYPE_COERCION_RULES[key] || 'any';
      });
    }

    if (['-', '*', '/', '%'].includes(lastOperator)) {
      return 'number';
    }

    if (['&&', '||', '!', '==', '!=', '<', '>', '<=', '>='].includes(lastOperator)) {
      return 'boolean';
    }
  }

  return types[types.length - 1];
}

function normalizeType(type) {
  if (!type) return 'any';

  const typeStr = String(type).toLowerCase();

  if (['string', 'text', 'html', 'xml'].includes(typeStr)) {
    return 'string';
  }
  if (['number', 'float', 'double', 'decimal'].includes(typeStr)) {
    return 'number';
  }
  if (['int', 'integer'].includes(typeStr)) {
    return 'int';
  }
  if (['bool', 'boolean'].includes(typeStr)) {
    return 'boolean';
  }
  if (['object', 'json'].includes(typeStr)) {
    return 'object';
  }
  if (['array', 'list'].includes(typeStr)) {
    return 'array';
  }

  return 'any';
}

export function checkTypeCompatibility(expectedType, actualType) {
  const normalizedExpected = normalizeType(expectedType);
  const normalizedActual = normalizeType(actualType);

  if (normalizedExpected === 'any' || normalizedActual === 'any') {
    return {
      compatible: true,
      severity: SEVERITY_LEVELS.NONE,
      message: null,
    };
  }

  const compatibility = TYPE_COMPATIBILITY[normalizedExpected]?.[normalizedActual];

  if (!compatibility) {
    return {
      compatible: false,
      severity: SEVERITY_LEVELS.WARNING,
      message: `Type '${actualType}' may not match expected '${expectedType}'`,
    };
  }

  return compatibility;
}

export function getTypeMismatchSeverity(expectedType, actualType) {
  const result = checkTypeCompatibility(expectedType, actualType);
  return result.severity;
}

export function getTypeMismatchMessage(expectedType, actualType) {
  const result = checkTypeCompatibility(expectedType, actualType);
  return result.message;
}

export function inferNestedFunctionType(blocks = [], depth = 0) {
  const issues = [];
  let resultType = "any";

  if (!blocks || blocks.length === 0) {
    return { type: resultType, issues };
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block) continue;

    const blockType = block.type || block.subCategory;

    if (blockType === "FUNCTIONS" || block.subCategory === "FUNCTIONS") {
      const fnName = block.value || block.displayValue;
      const fnInfo = getFunctionInfo(fnName);

      if (!fnInfo) {
        resultType = block.returnType ? normalizeType(block.returnType) : "any";
        continue;
      }

      resultType = fnInfo.returnType;

      if (block.children && Array.isArray(block.children)) {
        const args = parseNestedArgs(block.children);
        const argCountResult = checkArgCount(fnName, args.length);

        if (!argCountResult.valid) {
          issues.push({
            severity: SEVERITY_LEVELS.ERROR,
            message: argCountResult.message,
            functionName: fnName,
            blockIndex: i,
            depth,
          });
        }

        args.forEach((argBlocks, argIdx) => {
          const argResult = inferNestedFunctionType(argBlocks, depth + 1);
          issues.push(...argResult.issues);

          const expectedArgType = getArgTypeAt(fnName, argIdx);
          if (expectedArgType !== "any" && argResult.type !== "any") {
            const compatibility = checkTypeCompatibility(expectedArgType, argResult.type);
            if (!compatibility.compatible) {
              issues.push({
                severity: compatibility.severity,
                message: `${fnName}() argument ${argIdx + 1}: ${compatibility.message}`,
                functionName: fnName,
                argIndex: argIdx,
                expectedType: expectedArgType,
                actualType: argResult.type,
                blockIndex: i,
                depth,
              });
            } else if (compatibility.severity === SEVERITY_LEVELS.WARNING) {
              issues.push({
                severity: SEVERITY_LEVELS.WARNING,
                message: `${fnName}() argument ${argIdx + 1}: ${compatibility.message}`,
                functionName: fnName,
                argIndex: argIdx,
                expectedType: expectedArgType,
                actualType: argResult.type,
                blockIndex: i,
                depth,
              });
            }
          }
        });
      }
      continue;
    }

    if (blockType === "PRIMITIVES" && block.value !== undefined) {
      const value = block.value;
      if (typeof value === "string") {
        resultType = "string";
      } else if (typeof value === "number") {
        resultType = "number";
      } else if (typeof value === "boolean") {
        resultType = "boolean";
      }
      continue;
    }

    if (blockType === "NODE" || block.subCategory === "NODE") {
      const variableType = block.variableData?.type?.toLowerCase() || "any";
      resultType = normalizeType(variableType);
      continue;
    }

    if (block.variableData?.type) {
      resultType = normalizeType(block.variableData.type.toLowerCase());
      continue;
    }
  }

  return { type: resultType, issues };
}

function parseNestedArgs(children) {
  const args = [];
  let currentArg = [];

  for (const child of children) {
    if (!child) continue;

    if (child.type === "PRIMITIVES" && child.value === ",") {
      if (currentArg.length > 0) {
        args.push(currentArg);
        currentArg = [];
      }
      continue;
    }

    currentArg.push(child);
  }

  if (currentArg.length > 0) {
    args.push(currentArg);
  }

  return args;
}

export function validateFormulaTypes(blocks = [], expectedOutputType = null) {
  const result = inferNestedFunctionType(blocks);

  if (expectedOutputType && expectedOutputType !== "any") {
    const outputCompatibility = checkTypeCompatibility(expectedOutputType, result.type);
    if (!outputCompatibility.compatible) {
      result.issues.push({
        severity: outputCompatibility.severity,
        message: `Formula returns ${result.type} but ${expectedOutputType} is expected: ${outputCompatibility.message}`,
        expectedType: expectedOutputType,
        actualType: result.type,
        isOutputMismatch: true,
      });
    } else if (outputCompatibility.severity === SEVERITY_LEVELS.WARNING) {
      result.issues.push({
        severity: SEVERITY_LEVELS.WARNING,
        message: `Formula returns ${result.type} but ${expectedOutputType} is expected: ${outputCompatibility.message}`,
        expectedType: expectedOutputType,
        actualType: result.type,
        isOutputMismatch: true,
      });
    }
  }

  return {
    ...result,
    hasErrors: result.issues.some((i) => i.severity === SEVERITY_LEVELS.ERROR),
    hasWarnings: result.issues.some((i) => i.severity === SEVERITY_LEVELS.WARNING),
  };
}

export { SEVERITY_LEVELS, getFunctionInfo, getFunctionReturnType, getArgTypeAt };
