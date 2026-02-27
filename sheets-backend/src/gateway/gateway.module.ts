import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { ViewModule } from 'src/features/view/view.module';

@Module({
  imports: [ViewModule],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
