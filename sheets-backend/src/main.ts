import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import * as Sentry from '@sentry/node';
import pkg from '../package.json';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.ENV || process.env.NODE_ENV || 'development',
  tracesSampleRate: ['PROD', 'production'].includes(process.env.ENV || process.env.NODE_ENV || '') ? 0.2 : 1.0,
  release: `sheets-backend@${pkg.version}`,
  initialScope: { tags: { service: 'tinytable-backend' } },
});

// allowing newrelic loging irrespective of the ENV asked by Ankit Sir
if (['PROD', 'DEV'].includes(process.env.ENV || '')) {
  require('newrelic');
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonLoggerService } from './logger/winstonLogger.service';
import { HttpExceptionFilter } from './http-exception/http-exception.filter';
import { AllExceptionsFilter } from './http-exception/all-exceptions.filter';
import { AssetService } from './npmAssets/asset/asset.service';
import { RedisIoStreamAdapter } from './redis-io-stream.adapter';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure body parser limits to 200MB
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ limit: '200mb', extended: true }));

  const redisIoAdapter = new RedisIoStreamAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // Instantiate your logger service
  const winstonLoggerService = app.get(WinstonLoggerService);
  const assetService = app.get(AssetService);

  // Use the global exception filter with your logger
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(winstonLoggerService, assetService),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, token, auth, x-request-id',
  });

  const port = process.env.PORT || 4545;

  await app.listen(port);
}
bootstrap();
