import { Global, Module } from '@nestjs/common';
import * as flow_utility_instance from 'oute-services-flow-utility-sdk';

const FlowUtilitySdkProvider = {
  provide: 'FlowUtilitySdk',
  useValue: flow_utility_instance,
};

@Global()
@Module({
  providers: [FlowUtilitySdkProvider],
  exports: [FlowUtilitySdkProvider],
})
export class FlowUtilitySdkModule {}
