import { Provider } from '@nestjs/common';
import Asset from 'oute-services-asset-sdk';

export const assetProvider: Provider = {
  provide: Asset, // This should be the token or string identifier used to inject this provider
  useValue: Asset,
};
