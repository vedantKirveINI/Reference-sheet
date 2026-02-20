import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-streams-adapter';
import { createClient } from 'redis';

export class RedisIoStreamAdapter extends IoAdapter {
  private adapterConstructor!: ReturnType<typeof createAdapter>;
  private redisClient!: ReturnType<typeof createClient>;

  async connectToRedis(): Promise<void> {
    this.redisClient = createClient({
      url: process.env.REDIS_STREAM_URL,
    });
    await this.redisClient.connect();
    this.adapterConstructor = createAdapter(this.redisClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
