import { Module } from '@nestjs/common';
import { BaseService } from './base.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseController } from './base.controller';

@Module({
  controllers: [BaseController],
  providers: [BaseService, PrismaService],
})
export class BaseModule {}
