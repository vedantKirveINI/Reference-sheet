import { Injectable } from '@nestjs/common';
import {
  FormulaExpression,
  FormulaContext,
  FormulaFunction,
  ExpressionBlock,
} from './types';
import { FormulaFunctionFactory } from './formula-function.factory';

@Injectable()
export class FormulaEngineService {
  private functions: Map<string, FormulaFunction> = new Map();

  constructor(private readonly functionFactory: FormulaFunctionFactory) {
    this.functions = functionFactory.getAllFunctions();
  }

  registerFunction(func: FormulaFunction): void {
    this.functions.set(func.name.toLowerCase(), func);
  }

  evaluateFormula(
    expression: FormulaExpression,
    recordData: Record<string, any>,
  ): any {
    const context: FormulaContext = {
      recordData,
      getValue: (fieldName: string) => {
        const raw = recordData[fieldName];
        if (raw === undefined || raw === null) return null;
        return this.parseStoredValue(raw);
      },
    };

    const result = this.evaluateExpression(expression.blocks, context);

    if (result === null || result === undefined) {
      return null;
    }

    return result;
  }

  private parseStoredValue(value: any): any {
    if (value === null || value === undefined) return null;

    if (typeof value === 'boolean') return value;

    if (typeof value === 'string') {
      if (value.startsWith('"') && value.endsWith('"')) {
        try {
          return JSON.parse(value);
        } catch {
          return value.slice(1, -1);
        }
      }
      const lower = value.trim().toLowerCase();
      if (lower === 'true') return true;
      if (lower === 'false') return false;
      const trimmed = value.trim();
      if (trimmed !== '' && !isNaN(Number(trimmed))) {
        return Number(trimmed);
      }
    }
    return value;
  }

  private evaluateExpression(
    blocks: ExpressionBlock[],
    context: FormulaContext,
  ): any {
    const stack = [...blocks];
    return this.parseExpression(stack, context);
  }

  private parseExpression(
    stack: ExpressionBlock[],
    context: FormulaContext,
  ): any {
    let result = this.parseOperand(stack, context);

    while (
      stack.length >= 2 &&
      stack[0].type === 'OPERATORS' &&
      (stack[0].category?.toLowerCase() === 'arithmetic' || stack[0].category?.toLowerCase() === 'comparison')
    ) {
      const opBlock = stack.shift()!;
      const operator = opBlock.value || '';
      const nextOperand = this.parseOperand(stack, context);

      if (opBlock.category?.toLowerCase() === 'comparison') {
        result = this.performComparisonOperation(result, operator, nextOperand);
      } else {
        result = this.performArithmeticOperation(result, operator, nextOperand);
      }
    }

    if (stack.length >= 2 && stack[0].type === 'OPERATORS' && stack[0].value === '&') {
      stack.shift();
      const nextOperand = this.parseExpression(stack, context);
      const leftStr = result !== null && result !== undefined ? String(result) : '';
      const rightStr = nextOperand !== null && nextOperand !== undefined ? String(nextOperand) : '';
      return leftStr + rightStr;
    }

    return result;
  }

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
      const rawValue = stack.shift()!.value;
      if (rawValue === undefined) {
        throw new Error('Missing value in PRIMITIVES type');
      }
      if (rawValue === 'true') return true;
      if (rawValue === 'false') return false;
      const num = Number(rawValue);
      if (!isNaN(num) && rawValue.trim() !== '') return num;
      return rawValue;
    }

    if (token.type === 'OPERATORS' && token.value === '(') {
      stack.shift();
      const result = this.parseExpression(stack, context);
      if (stack.length > 0 && stack[0].value === ')') {
        stack.shift();
      }
      return result;
    }

    throw new Error(`Unexpected token: ${token.value || 'undefined'}`);
  }

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
        stack.shift();
        break;
      }

      if (token.type === 'OPERATORS' && token.value === ';') {
        stack.shift();
        continue;
      }

      const argValue = this.parseExpression(stack, context);
      args.push(argValue);
    }

    if (!formulaFunction.validateArgs(args)) {
      throw new Error(`Invalid arguments for function ${funcName}`);
    }

    return formulaFunction.execute(args, context);
  }

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

  private performComparisonOperation(
    left: any,
    operator: string,
    right: any,
  ): boolean {
    switch (operator) {
      case '=':
        return left == right;
      case '!=':
        return left != right;
      case '>':
        return Number(left) > Number(right);
      case '<':
        return Number(left) < Number(right);
      case '>=':
        return Number(left) >= Number(right);
      case '<=':
        return Number(left) <= Number(right);
      default:
        throw new Error(`Unsupported comparison operator: ${operator}`);
    }
  }
}
