import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-streams-adapter';
import { createClient } from 'redis';

export class RedisIoStreamAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;
  private redisClient: ReturnType<typeof createClient> | null = null;
  private useRedisAdapter = false;

  async connectToRedis(): Promise<void> {
    try {
      this.redisClient = createClient({
        url: process.env.REDIS_STREAM_URL || 'redis://127.0.0.1:6379/0',
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > 3) return false;
            return Math.min(retries * 500, 3000);
          },
        },
      });
      this.redisClient.on('error', (err) => {
        console.warn('Redis adapter error (non-fatal):', err.message);
      });
      await this.redisClient.connect();
      this.adapterConstructor = createAdapter(this.redisClient);
      this.useRedisAdapter = true;
      console.log('Redis Streams adapter connected successfully');
    } catch (err: any) {
      console.warn(
        'Redis Streams adapter failed to connect, falling back to in-memory adapter:',
        err.message,
      );
      this.useRedisAdapter = false;
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    if (this.useRedisAdapter && this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}
