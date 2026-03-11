export const TokenType = {
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  IDENTIFIER: 'IDENTIFIER',
  VARIABLE: 'VARIABLE',
  FUNCTION: 'FUNCTION',
  OPERATOR: 'OPERATOR',
  KEYWORD: 'KEYWORD',
  OPEN_PAREN: 'OPEN_PAREN',
  CLOSE_PAREN: 'CLOSE_PAREN',
  SEMICOLON: 'SEMICOLON',
  COMMA: 'COMMA',
  DOT: 'DOT',
  OPEN_BRACKET: 'OPEN_BRACKET',
  CLOSE_BRACKET: 'CLOSE_BRACKET',
  EOF: 'EOF',
  ERROR: 'ERROR',
};

export const OPERATORS = {
  '+': { precedence: 10, associativity: 'left', type: 'arithmetic' },
  '-': { precedence: 10, associativity: 'left', type: 'arithmetic' },
  '*': { precedence: 20, associativity: 'left', type: 'arithmetic' },
  '/': { precedence: 20, associativity: 'left', type: 'arithmetic' },
  '^': { precedence: 30, associativity: 'right', type: 'arithmetic' },
  '%': { precedence: 20, associativity: 'left', type: 'arithmetic' },
  '<': { precedence: 5, associativity: 'left', type: 'comparison' },
  '>': { precedence: 5, associativity: 'left', type: 'comparison' },
  '<=': { precedence: 5, associativity: 'left', type: 'comparison' },
  '>=': { precedence: 5, associativity: 'left', type: 'comparison' },
  '==': { precedence: 4, associativity: 'left', type: 'comparison' },
  '!=': { precedence: 4, associativity: 'left', type: 'comparison' },
  'AND': { precedence: 3, associativity: 'left', type: 'logical' },
  'OR': { precedence: 2, associativity: 'left', type: 'logical' },
  'NOT': { precedence: 25, associativity: 'right', type: 'logical', unary: true },
};

export const KEYWORDS = {
  'TRUE': { value: true, type: 'boolean' },
  'FALSE': { value: false, type: 'boolean' },
  'true': { value: true, type: 'boolean' },
  'false': { value: false, type: 'boolean' },
  'null': { value: null, type: 'null' },
  'NULL': { value: null, type: 'null' },
};

const createToken = (type, value, originalBlock = null, position = 0) => ({
  type,
  value,
  originalBlock,
  position,
});

export const tokenizeBlocks = (blocks) => {
  const tokens = [];
  let position = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    if (!block) continue;

    if (block.type === 'PRIMITIVES') {
      const primitiveTokens = tokenizePrimitive(block.value, position, block);
      tokens.push(...primitiveTokens);
      position += block.value.length;
      continue;
    }

    if (block.type === 'BREAKLINE' || block.type === 'TABSPACE') {
      position += 1;
      continue;
    }

    const subCategory = block.subCategory || block.type;
    const value = block.displayValue || block.value;

    if (subCategory === 'FUNCTIONS') {
      tokens.push(createToken(TokenType.FUNCTION, value.replace('(', ''), block, position));
    } else if (subCategory === 'OPERATORS') {
      if (value === '(') {
        tokens.push(createToken(TokenType.OPEN_PAREN, value, block, position));
      } else if (value === ')') {
        tokens.push(createToken(TokenType.CLOSE_PAREN, value, block, position));
      } else if (value === ';') {
        tokens.push(createToken(TokenType.SEMICOLON, value, block, position));
      } else if (value === ',') {
        tokens.push(createToken(TokenType.COMMA, value, block, position));
      } else if (OPERATORS[value] || OPERATORS[value.toUpperCase()]) {
        tokens.push(createToken(TokenType.OPERATOR, value.toUpperCase(), block, position));
      } else {
        tokens.push(createToken(TokenType.OPERATOR, value, block, position));
      }
    } else if (subCategory === 'KEYWORDS') {
      tokens.push(createToken(TokenType.KEYWORD, value.toUpperCase(), block, position));
    } else if (block.category === 'VARIABLES' || subCategory === 'VARIABLES' || block.isVariable) {
      tokens.push(createToken(TokenType.VARIABLE, value, block, position));
    } else {
      tokens.push(createToken(TokenType.IDENTIFIER, value, block, position));
    }

    position += (value?.length || 1);
  }

  tokens.push(createToken(TokenType.EOF, null, null, position));
  return tokens;
};

const tokenizePrimitive = (text, startPosition, originalBlock) => {
  const tokens = [];
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(text[i + 1]))) {
      let numStr = '';
      while (i < text.length && (/[0-9]/.test(text[i]) || text[i] === '.')) {
        numStr += text[i];
        i++;
      }
      tokens.push(createToken(TokenType.NUMBER, parseFloat(numStr), originalBlock, startPosition + i - numStr.length));
      continue;
    }

    if (char === '"' || char === "'") {
      const quote = char;
      let str = '';
      i++;
      while (i < text.length && text[i] !== quote) {
        if (text[i] === '\\' && i + 1 < text.length) {
          str += text[i + 1];
          i += 2;
        } else {
          str += text[i];
          i++;
        }
      }
      i++;
      tokens.push(createToken(TokenType.STRING, str, originalBlock, startPosition + i - str.length - 2));
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let ident = '';
      while (i < text.length && /[a-zA-Z0-9_]/.test(text[i])) {
        ident += text[i];
        i++;
      }
      
      if (KEYWORDS[ident] || KEYWORDS[ident.toUpperCase()]) {
        tokens.push(createToken(TokenType.KEYWORD, ident.toUpperCase(), originalBlock, startPosition + i - ident.length));
      } else if (OPERATORS[ident.toUpperCase()]) {
        tokens.push(createToken(TokenType.OPERATOR, ident.toUpperCase(), originalBlock, startPosition + i - ident.length));
      } else {
        tokens.push(createToken(TokenType.IDENTIFIER, ident, originalBlock, startPosition + i - ident.length));
      }
      continue;
    }

    const twoChar = text.slice(i, i + 2);
    if (OPERATORS[twoChar]) {
      tokens.push(createToken(TokenType.OPERATOR, twoChar, originalBlock, startPosition + i));
      i += 2;
      continue;
    }

    if (OPERATORS[char]) {
      tokens.push(createToken(TokenType.OPERATOR, char, originalBlock, startPosition + i));
      i++;
      continue;
    }

    if (char === '(') {
      tokens.push(createToken(TokenType.OPEN_PAREN, char, originalBlock, startPosition + i));
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push(createToken(TokenType.CLOSE_PAREN, char, originalBlock, startPosition + i));
      i++;
      continue;
    }

    if (char === ';' || char === ',') {
      tokens.push(createToken(TokenType.SEMICOLON, char, originalBlock, startPosition + i));
      i++;
      continue;
    }

    if (char === '[') {
      tokens.push(createToken(TokenType.OPEN_BRACKET, char, originalBlock, startPosition + i));
      i++;
      continue;
    }

    if (char === ']') {
      tokens.push(createToken(TokenType.CLOSE_BRACKET, char, originalBlock, startPosition + i));
      i++;
      continue;
    }

    if (char === '.') {
      tokens.push(createToken(TokenType.DOT, char, originalBlock, startPosition + i));
      i++;
      continue;
    }

    i++;
  }

  return tokens;
};

export const tokensToString = (tokens) => {
  return tokens
    .filter(t => t.type !== TokenType.EOF)
    .map(t => {
      if (t.type === TokenType.STRING) return `"${t.value}"`;
      return String(t.value);
    })
    .join(' ');
};
