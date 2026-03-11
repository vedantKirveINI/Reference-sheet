export const parseFormula = (formula, properties = []) => {
  const tokens = [];
  let remaining = formula;
  let position = 0;

  while (remaining.length > 0) {
    const commentMatch = remaining.match(/^\/\*[\s\S]*?\*\//);
    if (commentMatch) {
      tokens.push({ 
        type: 'comment', 
        value: commentMatch[0], 
        start: position, 
        end: position + commentMatch[0].length 
      });
      position += commentMatch[0].length;
      remaining = remaining.slice(commentMatch[0].length);
      continue;
    }

    const stringMatch = remaining.match(/^("[^"]*"|'[^']*')/);
    if (stringMatch) {
      tokens.push({ 
        type: 'string', 
        value: stringMatch[0], 
        stringValue: stringMatch[0].slice(1, -1),
        start: position, 
        end: position + stringMatch[0].length 
      });
      position += stringMatch[0].length;
      remaining = remaining.slice(stringMatch[0].length);
      continue;
    }

    const propMatch = remaining.match(/^prop\s*\(\s*["']([^"']+)["']\s*\)/);
    if (propMatch) {
      const propName = propMatch[1];
      const property = properties.find(p => p.name === propName || p.label === propName);
      tokens.push({ 
        type: 'property', 
        value: propMatch[0], 
        propertyName: propName,
        propertyType: property?.type || 'text',
        valid: !!property,
        start: position, 
        end: position + propMatch[0].length 
      });
      position += propMatch[0].length;
      remaining = remaining.slice(propMatch[0].length);
      continue;
    }

    const numberMatch = remaining.match(/^\d+\.?\d*/);
    if (numberMatch) {
      tokens.push({ 
        type: 'number', 
        value: numberMatch[0], 
        numericValue: parseFloat(numberMatch[0]),
        start: position, 
        end: position + numberMatch[0].length 
      });
      position += numberMatch[0].length;
      remaining = remaining.slice(numberMatch[0].length);
      continue;
    }

    const keywordMatch = remaining.match(/^(true|false|and|or|not|if|else|let|lets|current|index)\b/);
    if (keywordMatch) {
      tokens.push({ 
        type: 'keyword', 
        value: keywordMatch[0], 
        start: position, 
        end: position + keywordMatch[0].length 
      });
      position += keywordMatch[0].length;
      remaining = remaining.slice(keywordMatch[0].length);
      continue;
    }

    const funcMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/);
    if (funcMatch) {
      tokens.push({ 
        type: 'function', 
        value: funcMatch[1], 
        start: position, 
        end: position + funcMatch[1].length 
      });
      position += funcMatch[1].length;
      remaining = remaining.slice(funcMatch[1].length);
      continue;
    }

    const operatorMatch = remaining.match(/^(>=|<=|==|!=|&&|\|\||[+\-*/%^=!<>&|?:])/);
    if (operatorMatch) {
      tokens.push({ 
        type: 'operator', 
        value: operatorMatch[0], 
        start: position, 
        end: position + operatorMatch[0].length 
      });
      position += operatorMatch[0].length;
      remaining = remaining.slice(operatorMatch[0].length);
      continue;
    }

    const parenMatch = remaining.match(/^[()[\]{},]/);
    if (parenMatch) {
      tokens.push({ 
        type: 'punctuation', 
        value: parenMatch[0], 
        start: position, 
        end: position + 1 
      });
      position += 1;
      remaining = remaining.slice(1);
      continue;
    }

    const identifierMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
    if (identifierMatch) {
      tokens.push({ 
        type: 'identifier', 
        value: identifierMatch[0], 
        start: position, 
        end: position + identifierMatch[0].length 
      });
      position += identifierMatch[0].length;
      remaining = remaining.slice(identifierMatch[0].length);
      continue;
    }

    const whitespaceMatch = remaining.match(/^\s+/);
    if (whitespaceMatch) {
      tokens.push({ 
        type: 'whitespace', 
        value: whitespaceMatch[0], 
        start: position, 
        end: position + whitespaceMatch[0].length 
      });
      position += whitespaceMatch[0].length;
      remaining = remaining.slice(whitespaceMatch[0].length);
      continue;
    }

    tokens.push({ 
      type: 'unknown', 
      value: remaining[0], 
      start: position, 
      end: position + 1 
    });
    position += 1;
    remaining = remaining.slice(1);
  }

  return tokens;
};

export const validateFormula = (formula, allElements = {}, previewData = {}) => {
  const errors = [];
  const properties = allElements.properties || [];
  const tokens = parseFormula(formula, properties);
  
  if (!formula.trim()) {
    return { 
      valid: true, 
      errors: [], 
      result: { value: null, type: 'unknown' },
      tokens 
    };
  }

  let parenStack = [];
  let bracketStack = [];
  
  tokens.forEach((token, index) => {
    if (token.type === 'punctuation') {
      if (token.value === '(') {
        parenStack.push({ index, position: token.start });
      } else if (token.value === ')') {
        if (parenStack.length === 0) {
          errors.push({
            message: 'Unexpected closing parenthesis',
            position: [token.start, token.end],
            type: 'syntax'
          });
        } else {
          parenStack.pop();
        }
      } else if (token.value === '[') {
        bracketStack.push({ index, position: token.start });
      } else if (token.value === ']') {
        if (bracketStack.length === 0) {
          errors.push({
            message: 'Unexpected closing bracket',
            position: [token.start, token.end],
            type: 'syntax'
          });
        } else {
          bracketStack.pop();
        }
      }
    }

    if (token.type === 'function') {
      const funcName = token.value.toLowerCase();
      const allFunctions = allElements.functions || [];
      const funcExists = allFunctions.some(f => 
        (f.value || f.label || '').toLowerCase() === funcName
      );
      
      if (!funcExists && !isBuiltInFunction(funcName)) {
        errors.push({
          message: `Unknown function: ${token.value}`,
          position: [token.start, token.end],
          type: 'reference'
        });
      }
    }

    if (token.type === 'property' && !token.valid) {
      errors.push({
        message: `Unknown property: "${token.propertyName}"`,
        position: [token.start, token.end],
        type: 'reference'
      });
    }
  });

  parenStack.forEach(open => {
    errors.push({
      message: 'Expected token ")"',
      position: [open.position, open.position + 1],
      type: 'syntax'
    });
  });

  bracketStack.forEach(open => {
    errors.push({
      message: 'Expected token "]"',
      position: [open.position, open.position + 1],
      type: 'syntax'
    });
  });

  const functionTokens = tokens.filter(t => t.type === 'function');
  functionTokens.forEach((funcToken) => {
    const tokenIndex = tokens.indexOf(funcToken);
    const nextTokens = tokens.slice(tokenIndex + 1);
    const nextNonWhitespace = nextTokens.find(t => t.type !== 'whitespace');
    
    if (!nextNonWhitespace || nextNonWhitespace.value !== '(') {
      errors.push({
        message: `Expected function ${funcToken.value}() to be called`,
        position: [funcToken.start, funcToken.end],
        type: 'syntax'
      });
    }
  });

  let evaluatedResult = { value: null, type: 'unknown' };
  
  if (errors.length === 0) {
    try {
      evaluatedResult = evaluateFormula(formula, properties, previewData);
    } catch (e) {
      evaluatedResult = { 
        value: null, 
        type: inferResultType(tokens, allElements),
        evaluationError: e.message
      };
    }
  } else {
    evaluatedResult = { value: null, type: 'unknown' };
  }

  return {
    valid: errors.length === 0,
    errors,
    result: evaluatedResult,
    tokens
  };
};

const evaluateFormula = (formula, properties = [], previewData = {}) => {
  const cleanFormula = formula.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  
  if (!cleanFormula) {
    return { value: null, type: 'unknown' };
  }

  const tokens = parseFormula(cleanFormula, properties);
  const nonWhitespace = tokens.filter(t => t.type !== 'whitespace' && t.type !== 'comment');

  if (nonWhitespace.length === 1) {
    const token = nonWhitespace[0];
    
    if (token.type === 'number') {
      return { value: token.numericValue, type: 'number' };
    }
    if (token.type === 'string') {
      return { value: token.stringValue, type: 'text' };
    }
    if (token.type === 'keyword') {
      if (token.value === 'true') return { value: true, type: 'boolean' };
      if (token.value === 'false') return { value: false, type: 'boolean' };
    }
    if (token.type === 'property') {
      const propValue = previewData[token.propertyName];
      if (propValue !== undefined) {
        return { value: propValue, type: token.propertyType };
      }
      return { value: null, type: token.propertyType };
    }
  }

  const resolveValue = (expr, props, data) => {
    expr = expr.trim();
    
    if (/^\d+\.?\d*$/.test(expr)) {
      return parseFloat(expr);
    }
    
    const propMatch = expr.match(/^prop\s*\(\s*["']([^"']+)["']\s*\)$/);
    if (propMatch) {
      const propName = propMatch[1];
      const val = data[propName];
      return typeof val === 'number' ? val : (parseFloat(val) || 0);
    }
    
    if (expr === 'true') return 1;
    if (expr === 'false') return 0;
    
    return NaN;
  };

  const simpleArithmeticMatch = cleanFormula.match(/^(\d+\.?\d*)\s*([+\-*/%^])\s*(\d+\.?\d*)$/);
  if (simpleArithmeticMatch) {
    const [, left, op, right] = simpleArithmeticMatch;
    const a = parseFloat(left);
    const b = parseFloat(right);
    let result;
    
    switch (op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = b !== 0 ? a / b : Infinity; break;
      case '%': result = a % b; break;
      case '^': result = Math.pow(a, b); break;
      default: result = null;
    }
    
    return { value: result, type: 'number' };
  }

  const propArithmeticMatch = cleanFormula.match(/^(prop\s*\(\s*["'][^"']+["']\s*\)|\d+\.?\d*)\s*([+\-*/%^])\s*(prop\s*\(\s*["'][^"']+["']\s*\)|\d+\.?\d*)$/);
  if (propArithmeticMatch) {
    const [, leftExpr, op, rightExpr] = propArithmeticMatch;
    const a = resolveValue(leftExpr, properties, previewData);
    const b = resolveValue(rightExpr, properties, previewData);
    
    if (!isNaN(a) && !isNaN(b)) {
      let result;
      switch (op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': result = b !== 0 ? a / b : Infinity; break;
        case '%': result = a % b; break;
        case '^': result = Math.pow(a, b); break;
        default: result = null;
      }
      return { value: result, type: 'number' };
    }
    return { value: null, type: 'number' };
  }

  const chainedArithmeticMatch = cleanFormula.match(/^(prop\s*\(\s*["'][^"']+["']\s*\)|\d+\.?\d*)\s*([+\-*/%^])\s*(\d+\.?\d*)\s*([+\-*/%^])\s*(\d+\.?\d*)$/);
  if (chainedArithmeticMatch) {
    const [, expr1, op1, val2, op2, val3] = chainedArithmeticMatch;
    const a = resolveValue(expr1, properties, previewData);
    const b = parseFloat(val2);
    const c = parseFloat(val3);
    
    if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
      let intermediate;
      switch (op1) {
        case '+': intermediate = a + b; break;
        case '-': intermediate = a - b; break;
        case '*': intermediate = a * b; break;
        case '/': intermediate = b !== 0 ? a / b : Infinity; break;
        case '%': intermediate = a % b; break;
        case '^': intermediate = Math.pow(a, b); break;
        default: intermediate = a;
      }
      let result;
      switch (op2) {
        case '+': result = intermediate + c; break;
        case '-': result = intermediate - c; break;
        case '*': result = intermediate * c; break;
        case '/': result = c !== 0 ? intermediate / c : Infinity; break;
        case '%': result = intermediate % c; break;
        case '^': result = Math.pow(intermediate, c); break;
        default: result = intermediate;
      }
      return { value: result, type: 'number' };
    }
  }

  const simpleComparisonMatch = cleanFormula.match(/^(\d+\.?\d*)\s*(==|!=|>=|<=|>|<)\s*(\d+\.?\d*)$/);
  if (simpleComparisonMatch) {
    const [, left, op, right] = simpleComparisonMatch;
    const a = parseFloat(left);
    const b = parseFloat(right);
    let result;
    
    switch (op) {
      case '==': result = a === b; break;
      case '!=': result = a !== b; break;
      case '>': result = a > b; break;
      case '<': result = a < b; break;
      case '>=': result = a >= b; break;
      case '<=': result = a <= b; break;
      default: result = null;
    }
    
    return { value: result, type: 'boolean' };
  }

  const sumMatch = cleanFormula.match(/^sum\s*\(\s*(.+)\s*\)$/i);
  if (sumMatch) {
    const argsStr = sumMatch[1];
    const args = argsStr.split(',').map(a => parseFloat(a.trim())).filter(n => !isNaN(n));
    if (args.length > 0) {
      const sum = args.reduce((acc, n) => acc + n, 0);
      return { value: sum, type: 'number' };
    }
  }

  const avgMatch = cleanFormula.match(/^average\s*\(\s*(.+)\s*\)$/i);
  if (avgMatch) {
    const argsStr = avgMatch[1];
    const args = argsStr.split(',').map(a => parseFloat(a.trim())).filter(n => !isNaN(n));
    if (args.length > 0) {
      const avg = args.reduce((acc, n) => acc + n, 0) / args.length;
      return { value: avg, type: 'number' };
    }
  }

  const minMatch = cleanFormula.match(/^min\s*\(\s*(.+)\s*\)$/i);
  if (minMatch) {
    const argsStr = minMatch[1];
    const args = argsStr.split(',').map(a => parseFloat(a.trim())).filter(n => !isNaN(n));
    if (args.length > 0) {
      return { value: Math.min(...args), type: 'number' };
    }
  }

  const maxMatch = cleanFormula.match(/^max\s*\(\s*(.+)\s*\)$/i);
  if (maxMatch) {
    const argsStr = maxMatch[1];
    const args = argsStr.split(',').map(a => parseFloat(a.trim())).filter(n => !isNaN(n));
    if (args.length > 0) {
      return { value: Math.max(...args), type: 'number' };
    }
  }

  const roundMatch = cleanFormula.match(/^round\s*\(\s*(\d+\.?\d*)\s*(?:,\s*(\d+))?\s*\)$/i);
  if (roundMatch) {
    const value = parseFloat(roundMatch[1]);
    const precision = roundMatch[2] ? parseInt(roundMatch[2]) : 0;
    const multiplier = Math.pow(10, precision);
    return { value: Math.round(value * multiplier) / multiplier, type: 'number' };
  }

  const floorMatch = cleanFormula.match(/^floor\s*\(\s*(\d+\.?\d*)\s*\)$/i);
  if (floorMatch) {
    return { value: Math.floor(parseFloat(floorMatch[1])), type: 'number' };
  }

  const ceilMatch = cleanFormula.match(/^ceil(?:ing)?\s*\(\s*(\d+\.?\d*)\s*\)$/i);
  if (ceilMatch) {
    return { value: Math.ceil(parseFloat(ceilMatch[1])), type: 'number' };
  }

  const absMatch = cleanFormula.match(/^abs\s*\(\s*(-?\d+\.?\d*)\s*\)$/i);
  if (absMatch) {
    return { value: Math.abs(parseFloat(absMatch[1])), type: 'number' };
  }

  const lengthMatch = cleanFormula.match(/^length\s*\(\s*["'](.*)["']\s*\)$/i);
  if (lengthMatch) {
    return { value: lengthMatch[1].length, type: 'number' };
  }

  const lowerMatch = cleanFormula.match(/^lower\s*\(\s*["'](.*)["']\s*\)$/i);
  if (lowerMatch) {
    return { value: lowerMatch[1].toLowerCase(), type: 'text' };
  }

  const upperMatch = cleanFormula.match(/^upper\s*\(\s*["'](.*)["']\s*\)$/i);
  if (upperMatch) {
    return { value: upperMatch[1].toUpperCase(), type: 'text' };
  }

  return { 
    value: null, 
    type: inferResultType(tokens, { properties, functions: [], builtIns: [] })
  };
};

const isBuiltInFunction = (name) => {
  const builtIns = [
    'if', 'ifs', 'and', 'or', 'not', 'empty', 'length',
    'substring', 'contains', 'test', 'match', 'replace', 'replaceall',
    'lower', 'upper', 'repeat', 'link', 'style', 'unstyle', 'format',
    'add', 'subtract', 'multiply', 'divide', 'mod', 'pow',
    'min', 'max', 'sum', 'median', 'mean', 'average', 'abs', 'round', 'ceil', 'ceiling', 'floor',
    'sqrt', 'cbrt', 'exp', 'ln', 'log10', 'log2', 'sign', 'pi', 'e',
    'tonumber', 'now', 'today', 'minute', 'hour', 'day', 'date', 'week', 'month', 'year',
    'dateadd', 'datesubtract', 'datebetween', 'daterange', 'datestart', 'dateend',
    'timestamp', 'fromtimestamp', 'formatdate', 'parsedate',
    'name', 'email', 'at', 'first', 'last', 'slice', 'concat',
    'sort', 'reverse', 'join', 'split', 'unique', 'includes', 'find', 'findindex',
    'filter', 'some', 'every', 'map', 'flat', 'let', 'lets', 'id', 'prop'
  ];
  return builtIns.includes(name.toLowerCase());
};

const inferResultType = (tokens, allElements) => {
  const nonWhitespace = tokens.filter(t => t.type !== 'whitespace' && t.type !== 'comment');
  
  if (nonWhitespace.length === 0) return 'unknown';

  const firstToken = nonWhitespace[0];

  if (firstToken.type === 'string') return 'text';
  if (firstToken.type === 'number') return 'number';
  if (firstToken.type === 'keyword') {
    if (firstToken.value === 'true' || firstToken.value === 'false') return 'boolean';
  }

  if (firstToken.type === 'function') {
    const funcName = firstToken.value.toLowerCase();
    
    if (['sum', 'average', 'min', 'max', 'round', 'floor', 'ceil', 'ceiling', 'abs', 'sqrt', 'pow', 'length', 'tonumber', 'mean', 'median'].includes(funcName)) {
      return 'number';
    }
    if (['if', 'ifs'].includes(funcName)) {
      return 'any';
    }
    if (['and', 'or', 'not', 'empty', 'contains', 'test', 'every', 'some', 'includes'].includes(funcName)) {
      return 'boolean';
    }
    if (['now', 'today', 'dateadd', 'datesubtract', 'parsedate', 'fromtimestamp', 'datestart', 'dateend'].includes(funcName)) {
      return 'date';
    }
    if (['lower', 'upper', 'substring', 'replace', 'replaceall', 'format', 'formatdate', 'join', 'style'].includes(funcName)) {
      return 'text';
    }
    if (['filter', 'map', 'sort', 'reverse', 'concat', 'slice', 'flat', 'unique', 'split', 'match'].includes(funcName)) {
      return 'list';
    }
    if (['first', 'last', 'at', 'find'].includes(funcName)) {
      return 'any';
    }
  }

  if (firstToken.type === 'property') {
    return firstToken.propertyType || 'any';
  }

  const hasComparison = nonWhitespace.some(t => 
    t.type === 'operator' && ['==', '!=', '>', '<', '>=', '<='].includes(t.value)
  );
  if (hasComparison) return 'boolean';

  const hasArithmetic = nonWhitespace.some(t => 
    t.type === 'operator' && ['+', '-', '*', '/', '%', '^'].includes(t.value)
  );
  if (hasArithmetic) {
    const hasString = nonWhitespace.some(t => t.type === 'string');
    if (hasString) return 'text';
    return 'number';
  }

  return 'unknown';
};

export default { parseFormula, validateFormula };
