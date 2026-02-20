import { Injectable } from '@nestjs/common';
import {
  FormulaExpression,
  FormulaContext,
  FormulaFunction,
  ExpressionBlock,
} from './types';
import { FormulaFunctionFactory } from './formula-function.factory';

// Main Formula Engine
@Injectable()
export class FormulaEngineService {
  private functions: Map<string, FormulaFunction> = new Map();

  constructor(private readonly functionFactory: FormulaFunctionFactory) {
    // Get all functions from factory
    this.functions = functionFactory.getAllFunctions();
  }

  /**
   * Register a new formula function
   */
  registerFunction(func: FormulaFunction): void {
    this.functions.set(func.name.toLowerCase(), func);
  }

  /**
   * Evaluate a formula expression
   */
  evaluateFormula(
    expression: FormulaExpression,
    recordData: Record<string, any>,
  ): string {
    const context: FormulaContext = {
      recordData,
      getValue: (fieldName: string) => recordData[fieldName] || null,
    };

    const result = this.evaluateExpression(expression.blocks, context);

    // Always return a string
    if (result === null || result === undefined) {
      return '';
    }

    return String(result);
  }

  /**
   * Evaluate expression blocks recursively
   */
  private evaluateExpression(
    blocks: ExpressionBlock[],
    context: FormulaContext,
  ): any {
    const stack = [...blocks];

    return this.parseExpression(stack, context);
  }

  /**
   * Parse arithmetic expressions
   */
  private parseExpression(
    stack: ExpressionBlock[],
    context: FormulaContext,
  ): any {
    let result = this.parseOperand(stack, context);

    while (
      stack.length >= 2 &&
      stack[0].type === 'OPERATORS' &&
      stack[0].category?.toLowerCase() === 'arithmetic'
    ) {
      const operator = stack.shift()!.value;
      const nextOperand = this.parseOperand(stack, context);

      result = this.performArithmeticOperation(
        result,
        operator || '',
        nextOperand || '',
      );
    }

    return result;
  }

  /**
   * Parse a single operand (function, field, or primitive)
   */
  private parseOperand(stack: ExpressionBlock[], context: FormulaContext): any {
    const token = stack[0];

    if (!token) {
      throw new Error('Unexpected end of expression');
    }

    if (token.type === 'FUNCTIONS') {
      return this.parseFunction(stack, context);
    }

    if (token.type === 'FIELDS') {
      const field = stack.shift()!;
      if (!field.tableData?.dbFieldName) {
        throw new Error('Missing dbFieldName in tableData');
      }
      return context.getValue(field.tableData.dbFieldName);
    }

    if (token.type === 'PRIMITIVES') {
      const value = stack.shift()!.value;
      if (value === undefined) {
        throw new Error('Missing value in PRIMITIVES type');
      }
      return value;
    }

    throw new Error(`Unexpected token: ${token.value || 'undefined'}`);
  }

  /**
   * Parse function expressions
   */
  private parseFunction(
    stack: ExpressionBlock[],
    context: FormulaContext,
  ): any {
    const func = stack.shift();

    if (!func || func.type !== 'FUNCTIONS' || !func.value) {
      throw new Error('Expected a function block with value');
    }

    const funcName = func.value.toLowerCase();
    const formulaFunction = this.functions.get(funcName);

    if (!formulaFunction) {
      throw new Error(`Unknown function: ${funcName}`);
    }

    const openParen = stack.shift();
    if (!openParen || openParen.value !== '(') {
      throw new Error('Expected "(" after function name');
    }

    const args: any[] = [];

    while (stack.length) {
      const token = stack[0];

      if (token.value === ')') {
        stack.shift(); // consume ')'
        break;
      }

      if (token.type === 'OPERATORS' && token.value === ';') {
        stack.shift(); // skip separator
        continue;
      }

      if (token.type === 'FUNCTIONS') {
        const nested = this.parseFunction(stack, context);
        args.push(nested);
        continue;
      }

      if (token.type === 'FIELDS') {
        const field = stack.shift()!;
        if (!field.tableData?.dbFieldName) {
          throw new Error('Missing dbFieldName in tableData');
        }
        args.push(`"${field.tableData.dbFieldName}"`);
        continue;
      }

      if (token.type === 'PRIMITIVES') {
        const val = stack.shift()!.value;
        args.push(`'${val}'`);
        continue;
      }

      throw new Error(`Unexpected token in function args: ${token.value}`);
    }

    if (!formulaFunction.validateArgs(args)) {
      throw new Error(`Invalid arguments for function ${funcName}`);
    }

    return formulaFunction.execute(args, context);
  }

  /**
   * Perform arithmetic operations
   */
  private performArithmeticOperation(
    left: any,
    operator: string,
    right: any,
  ): any {
    const leftNum = Number(left) || 0;
    const rightNum = Number(right) || 0;

    switch (operator) {
      case '+':
        return leftNum + rightNum;
      case '-':
        return leftNum - rightNum;
      case '*':
        return leftNum * rightNum;
      case '/':
        return rightNum === 0 ? null : leftNum / rightNum;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
}
