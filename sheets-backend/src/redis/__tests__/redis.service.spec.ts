const mockRedisClient = {
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
  setEx: jest.fn().mockResolvedValue('OK'),
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  keys: jest.fn(),
  flushAll: jest.fn(),
  ping: jest.fn().mockResolvedValue('PONG'),
  quit: jest.fn().mockResolvedValue(undefined),
};

jest.mock('redis', () => ({
  createClient: jest.fn(() => mockRedisClient),
}));

import { RedisService } from '../redis.service';

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient.on.mockClear();
    mockRedisClient.connect.mockClear();
    service = new RedisService();
  });

  describe('constructor', () => {
    it('should create redis client and register event handlers', () => {
      const eventNames = mockRedisClient.on.mock.calls.map(
        (c: any) => c[0],
      );
      expect(eventNames).toContain('connect');
      expect(eventNames).toContain('ready');
      expect(eventNames).toContain('error');
      expect(eventNames).toContain('end');
      expect(eventNames).toContain('reconnecting');
    });

    it('should call connect', () => {
      expect(mockRedisClient.connect).toHaveBeenCalled();
    });
  });

  describe('getRedisConfig', () => {
    it('should return redis URL config', () => {
      const config = service.getRedisConfig();
      expect(config).toHaveProperty('url');
      expect(typeof config.url).toBe('string');
    });
  });

  describe('set', () => {
    it('should set string value without TTL', async () => {
      await service.set('key1', 'value1');
      expect(mockRedisClient.set).toHaveBeenCalledWith('key1', 'value1');
    });

    it('should set string value with TTL', async () => {
      await service.set('key1', 'value1', 60);
      expect(mockRedisClient.setEx).toHaveBeenCalledWith('key1', 60, 'value1');
    });

    it('should JSON.stringify object values', async () => {
      const obj = { name: 'test' };
      await service.set('key1', obj);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'key1',
        JSON.stringify(obj),
      );
    });

    it('should setEx with object and TTL', async () => {
      const obj = { name: 'test' };
      await service.set('key1', obj, 30);
      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'key1',
        30,
        JSON.stringify(obj),
      );
    });
  });

  describe('get', () => {
    it('should return string value', async () => {
      mockRedisClient.get.mockResolvedValue('hello');
      const result = await service.get('key1');
      expect(result).toBe('hello');
    });

    it('should return null for missing key', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      const result = await service.get('missing');
      expect(result).toBeNull();
    });
  });

  describe('getObject', () => {
    it('should parse JSON value', async () => {
      mockRedisClient.get.mockResolvedValue('{"name":"test"}');
      const result = await service.getObject('key1');
      expect(result).toEqual({ name: 'test' });
    });

    it('should return null for missing key', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      const result = await service.getObject('missing');
      expect(result).toBeNull();
    });

    it('should return null for invalid JSON', async () => {
      mockRedisClient.get.mockResolvedValue('not-json');
      const result = await service.getObject('key1');
      expect(result).toBeNull();
    });
  });

  describe('del', () => {
    it('should delete key', async () => {
      mockRedisClient.del.mockResolvedValue(1);
      const result = await service.del('key1');
      expect(result).toBe(1);
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      mockRedisClient.exists.mockResolvedValue(1);
      const result = await service.exists('key1');
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      mockRedisClient.exists.mockResolvedValue(0);
      const result = await service.exists('key1');
      expect(result).toBe(false);
    });
  });

  describe('expire', () => {
    it('should set TTL on key', async () => {
      mockRedisClient.expire.mockResolvedValue(true);
      const result = await service.expire('key1', 60);
      expect(result).toBe(true);
    });
  });

  describe('ttl', () => {
    it('should return TTL of key', async () => {
      mockRedisClient.ttl.mockResolvedValue(42);
      const result = await service.ttl('key1');
      expect(result).toBe(42);
    });
  });

  describe('keys', () => {
    it('should return matching keys', async () => {
      mockRedisClient.keys.mockResolvedValue(['key:1', 'key:2']);
      const result = await service.keys('key:*');
      expect(result).toEqual(['key:1', 'key:2']);
    });
  });

  describe('flushAll', () => {
    it('should flush all keys', async () => {
      await service.flushAll();
      expect(mockRedisClient.flushAll).toHaveBeenCalled();
    });
  });

  describe('getClient', () => {
    it('should return redis client', () => {
      const client = service.getClient();
      expect(client).toBeDefined();
    });
  });

  describe('ping', () => {
    it('should return PONG', async () => {
      const result = await service.ping();
      expect(result).toBe('PONG');
    });
  });

  describe('onModuleDestroy', () => {
    it('should quit redis connection', async () => {
      await service.onModuleDestroy();
      expect(mockRedisClient.quit).toHaveBeenCalled();
    });
  });
});
