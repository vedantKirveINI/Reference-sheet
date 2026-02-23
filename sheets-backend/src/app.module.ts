import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FieldModule } from './features/field/field.module';
import { SpaceModule } from './features/space/space.module';
import { RecordModule } from './features/record/record.module';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ViewModule } from './features/view/view.module';
import { TableModule } from './features/table/table.module';
import { PrismaModule } from './prisma/prisma.module';
import { PermissionModule } from './permission/permission.module';
import { GatewayModule } from './gateway/gateway.module';
import { BaseModule } from './features/base/base.module';
import { SheetModule } from './features/sheet/sheet.module';
import { AssetModule } from './npmAssets/asset/asset.module';
import { ShortUUIDModule } from './npmAssets/shortUUID/shortUUID.module';
import { EventEmitte2rModule } from './eventemitter/eventemitter.module';
import { LodashModule } from './npmAssets/loadash/lodash.module';
import { ApiTokenCheckMiddleware } from './middleware/api-token-check.middleware';
import { WsJwtGuard } from './auth/ws-jwt.guard';
import { APP_GUARD } from '@nestjs/core';
import { FlowUtilitySdkModule } from './npmAssets/outeServicesSdk/flowUtilitySdk/flow-utility-sdk.module';
import { BullMQModule } from './bullMq/bullMq.module';
import { UtilitySdkkModule } from './npmAssets/outeServicesSdk/utilitySdk/utility-sdk.module';
import { WinstonLoggerModule } from './logger/logger.module';
import { BullMQService } from './bullMq/bullMq.service';
import { HealthModule } from './health/health.module';
// import { PgEventsModule } from './pg-events/pg-events.module';
import { UserSdkModule } from './npmAssets/user-sdk/user-sdk.module';
import { RedisModule } from './redis/redis.modue';
import { CommentModule } from './features/comment/comment.module';

@Module({
  imports: [
    GatewayModule,
    PrismaModule,
    TableModule,
    FieldModule,
    SpaceModule,
    RecordModule,
    ViewModule,
    BaseModule,
    SheetModule,
    AssetModule,
    ShortUUIDModule,
    EventEmitte2rModule,
    LodashModule,
    FlowUtilitySdkModule,
    BullMQModule,
    UtilitySdkkModule,
    WinstonLoggerModule,
    PermissionModule,
    HealthModule,
    // PgEventsModule,
    UserSdkModule,
    RedisModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
    {
      provide: APP_GUARD,
      useClass: WsJwtGuard,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly bullBoardService: BullMQService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        ApiTokenCheckMiddleware,
        // ApiAuthMiddleware
      )
      .exclude(
        // Exclude health API paths from the middleware
        { path: 'health', method: RequestMethod.ALL },
        { path: 'health/(.*)', method: RequestMethod.ALL }, // For all health-related routes like /health/status, /health/metrics, etc.

        { path: 'record/create_record', method: RequestMethod.POST },
        { path: 'record/v2/create_record', method: RequestMethod.POST },
        { path: 'admin/(.*)', method: RequestMethod.ALL }, // Exclude paths under /admin/queues
        { path: '(.*)public(.*)', method: RequestMethod.ALL }, // Exclude any path containing 'public'

        // Exclude all enrichment webhook endpoints
        {
          path: 'record/v1/enrichment/get_enriched_data',
          method: RequestMethod.ALL,
        },
        {
          path: 'table/v1/webhook/prospect-data',
          method: RequestMethod.ALL,
        },
        {
          path: 'table/prospect/run',
          method: RequestMethod.ALL,
        },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
