import { Module } from '@nestjs/common';
import { FormulaEngineService } from './formula-engine.service';
import { FormulaFunctionFactory } from './formula-function.factory';

@Module({
  providers: [FormulaEngineService, FormulaFunctionFactory],
  exports: [FormulaEngineService],
})
export class FormulaEngineModule {}
