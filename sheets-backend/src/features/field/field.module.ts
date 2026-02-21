import { Module } from '@nestjs/common';
import { FieldService } from './field.service';
import { FieldController } from './field.controller';
import { FieldUtils } from './field.utils';
import { LinkFieldService } from './link-field.service';

@Module({
  imports: [],
  controllers: [FieldController],
  providers: [FieldService, FieldUtils, LinkFieldService],
  exports: [FieldService, LinkFieldService],
})
export class FieldModule {}
