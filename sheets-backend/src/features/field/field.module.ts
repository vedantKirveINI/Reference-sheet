import { Module } from '@nestjs/common';
import { FieldService } from './field.service';
import { FieldController } from './field.controller';
import { FieldUtils } from './field.utils';
import { LinkFieldService } from './link-field.service';
import { LookupRollupService } from './lookup-rollup.service';
import { FieldDependencyService } from './field-dependency.service';
import { DependencyGraphService } from './dependency-graph.service';
import { ComputedRecalcService } from './computed-recalc.service';

@Module({
  imports: [],
  controllers: [FieldController],
  providers: [
    FieldService,
    FieldUtils,
    LinkFieldService,
    LookupRollupService,
    FieldDependencyService,
    DependencyGraphService,
    ComputedRecalcService,
  ],
  exports: [FieldService, LinkFieldService, LookupRollupService],
})
export class FieldModule {}
