import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_STREAM_URL || 'redis://localhost:6379',
    });

    // Connection event listeners
    this.client.on('connect', () => {
      console.log('🔗 Redis connecting...');
    });

    this.client.on('ready', () => {
      console.log('✅ Redis connected successfully');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });

    this.client.on('end', () => {
      console.log('🔌 Redis connection ended');
    });

    this.client.on('reconnecting', () => {
      console.log('Redis reconnecting...');
    });

    this.client.connect();
  }

  // Get Redis config for BullMQ (URL format)
  getRedisConfig() {
    return {
      url:
        process.env.REDIS_URL ||
        process.env.REDIS_STREAM_URL ||
        'redis://localhost:6379',
    };
  }

  // Basic SET operation with TTL
  async set(
    key: string,
    value: string | object,
    ttlSeconds?: number,
  ): Promise<void> {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  // Basic GET operation
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  // GET operation that parses JSON objects
  async getObject<T = any>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  // DELETE operation
  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // Set TTL on existing key
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    return await this.client.expire(key, ttlSeconds);
  }

  // Get TTL of key
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  // Get all keys matching pattern
  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  // Flush all keys (use with caution!)
  async flushAll(): Promise<void> {
    await this.client.flushAll();
  }

  // Get Redis client for advanced operations
  getClient(): RedisClientType {
    return this.client;
  }

  // Health check
  async ping(): Promise<string> {
    return await this.client.ping();
  }

  async onModuleDestroy() {
    console.log('🔄 Disconnecting Redis...');
    await this.client.quit();
    console.log('✅ Redis disconnected successfully');
  }
}
