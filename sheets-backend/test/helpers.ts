import { Test, TestingModule } from '@nestjs/testing';

export const mockPrismaService = {
  field: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  tableMeta: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  view: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  base: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  space: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  comment: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  aiConversation: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  aiMessage: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  $queryRawUnsafe: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn((fn: any) => fn(mockPrismaService)),
};

export const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  getClient: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    publish: jest.fn(),
    subscribe: jest.fn(),
  })),
};

export const mockEventEmitterService = {
  emit: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};

export const mockGatewayService = {
  emitToRoom: jest.fn(),
  emitToAll: jest.fn(),
  server: {
    to: jest.fn(() => ({
      emit: jest.fn(),
    })),
  },
};

export const mockBullMqService = {
  addJob: jest.fn(),
  addBulk: jest.fn(),
};

export function resetAllMocks() {
  const resetMock = (obj: any) => {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'function' && obj[key].mockReset) {
        obj[key].mockReset();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        resetMock(obj[key]);
      }
    }
  };
  resetMock(mockPrismaService);
  resetMock(mockRedisService);
  resetMock(mockEventEmitterService);
  resetMock(mockGatewayService);
  resetMock(mockBullMqService);
}
