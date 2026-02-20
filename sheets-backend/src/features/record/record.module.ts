import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';
import { FieldModule } from '../field/field.module';
import { RecordUtils } from './utils/record.utils';
import { DateTimeUtils } from 'src/utils/DateTime';
import { FormulaRecalculatorService } from './utils/formula-recalculator.service';
import { FormulaEngineModule } from './utils/formula-engine/formula-engine.module';

@Module({
  imports: [FieldModule, FormulaEngineModule],
  controllers: [RecordController],
  providers: [
    RecordUtils,
    RecordService,
    DateTimeUtils,
    FormulaRecalculatorService,
  ],
  exports: [RecordService],
})
export class RecordModule {}
