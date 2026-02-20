import { Global, Module } from '@nestjs/common';
import * as utility_instance from 'oute-services-utility-sdk';

const UtilitySdkProvider = {
  provide: 'UtilitySdk',
  useValue: utility_instance,
};

@Global()
@Module({
  providers: [UtilitySdkProvider],
  exports: [UtilitySdkProvider],
})
export class UtilitySdkkModule {}
