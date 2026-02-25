import { PrismaService } from '../prisma.service';

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $transaction: jest.fn(),
    })),
  };
});

describe('PrismaService', () => {
  let service: PrismaService;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create a PrismaClient instance', () => {
    service = new PrismaService();
    expect(service.prismaClient).toBeDefined();
  });

  it('should use default timeout values', () => {
    const { PrismaClient } = require('@prisma/client');
    service = new PrismaService();

    expect(PrismaClient).toHaveBeenCalledWith(
      expect.objectContaining({
        log: ['error'],
        transactionOptions: {
          timeout: 5000,
          maxWait: 3000,
        },
      }),
    );
  });

  it('should use environment variable timeout values', () => {
    process.env.PRISMA_TIMEOUT = '10000';
    process.env.PRISMA_MAX_WAIT = '6000';

    const { PrismaClient } = require('@prisma/client');
    service = new PrismaService();

    expect(PrismaClient).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionOptions: {
          timeout: 10000,
          maxWait: 6000,
        },
      }),
    );
  });

  it('should expose prismaClient as public property', () => {
    service = new PrismaService();
    expect(service.prismaClient).toBeTruthy();
    expect(typeof service.prismaClient.$connect).toBe('function');
  });
});
