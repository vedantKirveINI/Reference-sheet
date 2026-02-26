import { Injectable } from '@nestjs/common';
import { FormulaFunction } from './types';
import { ConcatenateFunction } from './functions/concatenate.function';
import { LowerFunction } from './functions/lower.function';
import { UpperFunction } from './functions/upper.function';
import { AverageFunction } from './functions/average.function';
import {
  SumFunction,
  MaxFunction,
  MinFunction,
  CountFunction,
  CountAFunction,
  RoundFunction,
  AbsFunction,
  CeilFunction,
  FloorFunction,
  ModFunction,
  PowerFunction,
  SqrtFunction,
} from './functions/numeric.functions';
import {
  LenFunction,
  LeftFunction,
  RightFunction,
  MidFunction,
  FindFunction,
  SubstituteFunction,
  TrimFunction,
  TextFunction,
} from './functions/text.functions';
import {
  IfFunction,
  AndFunction,
  OrFunction,
  NotFunction,
  SwitchFunction,
  BlankFunction,
} from './functions/logical.functions';
import { NowFunction, TodayFunction } from './functions/date.functions';

@Injectable()
export class FormulaFunctionFactory {
  private functions: Map<string, FormulaFunction> = new Map();

  constructor() {
    this.registerFunctions();
  }

  private registerFunctions(): void {
    const functionInstances = [
      new ConcatenateFunction(),
      new LowerFunction(),
      new UpperFunction(),
      new AverageFunction(),
      new SumFunction(),
      new MaxFunction(),
      new MinFunction(),
      new CountFunction(),
      new CountAFunction(),
      new RoundFunction(),
      new AbsFunction(),
      new CeilFunction(),
      new FloorFunction(),
      new ModFunction(),
      new PowerFunction(),
      new SqrtFunction(),
      new LenFunction(),
      new LeftFunction(),
      new RightFunction(),
      new MidFunction(),
      new FindFunction(),
      new SubstituteFunction(),
      new TrimFunction(),
      new TextFunction(),
      new IfFunction(),
      new AndFunction(),
      new OrFunction(),
      new NotFunction(),
      new SwitchFunction(),
      new BlankFunction(),
      new NowFunction(),
      new TodayFunction(),
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
