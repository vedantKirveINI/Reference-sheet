import { Global, Module, Provider } from '@nestjs/common';
import * as lodash from 'lodash';

const LodashProvider: Provider = {
  provide: 'Lodash',
  useValue: lodash,
};

@Global()
@Module({
  providers: [LodashProvider],
  exports: [LodashProvider],
})
export class LodashModule {}
