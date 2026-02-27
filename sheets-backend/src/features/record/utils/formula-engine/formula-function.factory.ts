import { Injectable } from '@nestjs/common';
import { FormulaFunction } from './types';
import { ConcatenateFunction } from './functions/concatenate.function';
import { LowerFunction } from './functions/lower.function';
import { UpperFunction } from './functions/upper.function';
import { AverageFunction } from './functions/average.function';

@Injectable()
export class FormulaFunctionFactory {
  private functions: Map<string, FormulaFunction> = new Map();

  constructor() {
    this.registerFunctions();
  }

  private registerFunctions(): void {
    // Register all functions at startup
    const functionInstances = [
      new ConcatenateFunction(),
      new LowerFunction(),
      new UpperFunction(),
      new AverageFunction(),
    ];

    functionInstances.forEach((func) => {
      this.functions.set(func.name.toLowerCase(), func);
    });
  }

  getFunction(name: string): FormulaFunction | undefined {
    return this.functions.get(name.toLowerCase());
  }

  getAllFunctionNames(): string[] {
    return Array.from(this.functions.keys());
  }

  getAllFunctions(): Map<string, FormulaFunction> {
    return this.functions;
  }
}
