import { Global, Module } from '@nestjs/common';
import { AssetService } from './asset.service';

import Asset from 'oute-services-asset-sdk';
import { AssetController } from './asset.controller';

@Global()
@Module({
  providers: [
    {
      provide: 'Asset', // This should be the token or string identifier used to inject this provider
      useValue: Asset,
    },
    AssetService,
  ],
  controllers: [AssetController],
  exports: [AssetService],
})
export class AssetModule {}
