import { Module } from '@nestjs/common';
import { FieldService } from './field.service';
import { FieldController } from './field.controller';
import { FieldUtils } from './field.utils';

@Module({
  imports: [],
  controllers: [FieldController],
  providers: [FieldService, FieldUtils],
  exports: [FieldService],
})
export class FieldModule {}
