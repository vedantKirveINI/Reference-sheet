import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService {
  public prismaClient: PrismaClient;

  constructor() {
    this.prismaClient = new PrismaClient({
      log: ['error'],
      transactionOptions: {
        timeout: parseInt(process.env.PRISMA_TIMEOUT || '5000'),
        maxWait: parseInt(process.env.PRISMA_MAX_WAIT || '3000'),
      },
    });
  }
}
