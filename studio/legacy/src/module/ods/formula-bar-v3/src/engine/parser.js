import { TokenType, OPERATORS, KEYWORDS } from './tokenizer.js';
import {
  createLiteralNode,
  createVariableNode,
  createFunctionCallNode,
  createBinaryOpNode,
  createUnaryOpNode,
  createIfExpressionNode,
  createArrayNode,
  createErrorNode,
  resetNodeIdCounter,
} from './ast.js';
import { TypeKind } from './types.js';

export class Parser {
  constructor(tokens, functionRegistry = {}, variableRegistry = {}) {
    this.tokens = tokens;
    this.position = 0;
    this.functionRegistry = functionRegistry;
    this.variableRegistry = variableRegistry;
    this.errors = [];
    resetNodeIdCounter();
  }

  parse() {
    try {
      if (this.tokens.length === 0 || (this.tokens.length === 1 && this.peek().type === TokenType.EOF)) {
        return null;
      }
      const ast = this.parseExpression(0);
      return ast;
    } catch (error) {
      this.errors.push(error.message);
      return createErrorNode(error.message, this.tokens);
    }
  }

  getErrors() {
    return this.errors;
  }

  peek(offset = 0) {
    const pos = this.position + offset;
    if (pos >= this.tokens.length) {
      return { type: TokenType.EOF, value: null };
    }
    return this.tokens[pos];
  }

  advance() {
    const token = this.peek();
    this.position++;
    return token;
  }

  expect(type, errorMessage) {
    const token = this.peek();
    if (token.type !== type) {
      throw new Error(errorMessage || `Expected ${type} but got ${token.type}`);
    }
    return this.advance();
  }

  parseExpression(minPrecedence = 0) {
    let left = this.parseUnary();

    while (true) {
      const token = this.peek();
      
      if (token.type !== TokenType.OPERATOR) break;
      
      const opInfo = OPERATORS[token.value] || OPERATORS[token.value.toUpperCase()];
      if (!opInfo || opInfo.unary) break;
      if (opInfo.precedence < minPrecedence) break;

      this.advance();
      
      const nextMinPrecedence = opInfo.associativity === 'right' 
        ? opInfo.precedence 
        : opInfo.precedence + 1;
      
      const right = this.parseExpression(nextMinPrecedence);
      left = createBinaryOpNode(token.value, left, right);
    }

    return left;
  }

  parseUnary() {
    const token = this.peek();

    if (token.type === TokenType.OPERATOR) {
      const opInfo = OPERATORS[token.value] || OPERATORS[token.value.toUpperCase()];
      if (opInfo?.unary || token.value === '-' || token.value === '+') {
        this.advance();
        const operand = this.parseUnary();
        return createUnaryOpNode(token.value, operand);
      }
    }

    return this.parsePrimary();
  }

  parsePrimary() {
    const token = this.peek();

    if (token.type === TokenType.NUMBER) {
      this.advance();
      return createLiteralNode(token.value, TypeKind.NUMBER);
    }

    if (token.type === TokenType.STRING) {
      this.advance();
      return createLiteralNode(token.value, TypeKind.STRING);
    }

    if (token.type === TokenType.KEYWORD) {
      this.advance();
      const keywordInfo = KEYWORDS[token.value] || KEYWORDS[token.value.toLowerCase()];
      if (keywordInfo) {
        if (keywordInfo.type === 'boolean') {
          return createLiteralNode(keywordInfo.value, TypeKind.BOOLEAN);
        }
        if (keywordInfo.type === 'null') {
          const node = createLiteralNode(null, TypeKind.NULL);
          node.nullable = true;
          return node;
        }
      }
      return createLiteralNode(token.value, TypeKind.ANY);
    }

    if (token.type === TokenType.FUNCTION) {
      return this.parseFunctionCall();
    }

    if (token.type === TokenType.VARIABLE) {
      this.advance();
      const variableName = token.value;
      const variableInfo = this.variableRegistry[variableName] || token.originalBlock;
      return createVariableNode(variableName, variableInfo);
    }

    if (token.type === TokenType.IDENTIFIER) {
      this.advance();
      
      if (this.peek().type === TokenType.OPEN_PAREN) {
        this.position--;
        return this.parseFunctionCall();
      }

      const variableInfo = this.variableRegistry[token.value];
      if (variableInfo) {
        return createVariableNode(token.value, variableInfo);
      }

      return createVariableNode(token.value, { nullable: true });
    }

    if (token.type === TokenType.OPEN_PAREN) {
      this.advance();
      const expr = this.parseExpression(0);
      this.expect(TokenType.CLOSE_PAREN, 'Expected closing parenthesis');
      return expr;
    }

    if (token.type === TokenType.OPEN_BRACKET) {
      return this.parseArray();
    }

    if (token.type === TokenType.EOF) {
      return null;
    }

    this.advance();
    return createErrorNode(`Unexpected token: ${token.value}`, [token]);
  }

  parseFunctionCall() {
    const nameToken = this.advance();
    const functionName = nameToken.value.replace('(', '');
    
    this.expect(TokenType.OPEN_PAREN, `Expected '(' after function name ${functionName}`);

    const args = [];
    
    while (this.peek().type !== TokenType.CLOSE_PAREN && this.peek().type !== TokenType.EOF) {
      const arg = this.parseExpression(0);
      if (arg) {
        args.push(arg);
      }

      const next = this.peek();
      if (next.type === TokenType.SEMICOLON || next.type === TokenType.COMMA) {
        this.advance();
      } else if (next.type !== TokenType.CLOSE_PAREN && next.type !== TokenType.EOF) {
        break;
      }
    }

    if (this.peek().type === TokenType.CLOSE_PAREN) {
      this.advance();
    }

    const funcNameLower = functionName.toLowerCase();
    const funcInfo = this.functionRegistry[functionName] || 
                     this.functionRegistry[funcNameLower] ||
                     this.functionRegistry[functionName.replace('Fn', '')] ||
                     nameToken.originalBlock;

    const node = createFunctionCallNode(functionName, args, funcInfo);

    if (funcNameLower === 'if' || funcNameLower === 'iffn') {
      if (args.length >= 3) {
        return createIfExpressionNode(args[0], args[1], args[2]);
      }
    }

    return node;
  }

  parseArray() {
    this.expect(TokenType.OPEN_BRACKET, 'Expected [');
    
    const elements = [];
    
    while (this.peek().type !== TokenType.CLOSE_BRACKET && this.peek().type !== TokenType.EOF) {
      const element = this.parseExpression(0);
      if (element) {
        elements.push(element);
      }

      const next = this.peek();
      if (next.type === TokenType.SEMICOLON || next.type === TokenType.COMMA) {
        this.advance();
      } else if (next.type !== TokenType.CLOSE_BRACKET) {
        break;
      }
    }

    if (this.peek().type === TokenType.CLOSE_BRACKET) {
      this.advance();
    }

    return createArrayNode(elements);
  }
}

export const parseFormula = (tokens, functionRegistry = {}, variableRegistry = {}) => {
  const parser = new Parser(tokens, functionRegistry, variableRegistry);
  const ast = parser.parse();
  return {
    ast,
    errors: parser.getErrors(),
  };
};
