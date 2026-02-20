import { Global, Module } from '@nestjs/common';
import user_sdk from 'oute-services-user-sdk';
import { UserSdkService } from './user-sdk.service';
import { UserSdkController } from './user-sdk.controller';

@Global()
@Module({
  providers: [
    {
      provide: 'UserSdk',
      useValue: user_sdk,
    },
    UserSdkService,
  ],
  controllers: [UserSdkController],
  exports: [UserSdkService],
})
export class UserSdkModule {}
