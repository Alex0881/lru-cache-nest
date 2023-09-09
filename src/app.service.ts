import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { getRedisConnectionToken } from '@nestjs-modules/ioredis';

@Injectable()
export class AppService implements OnApplicationShutdown {
  constructor(
    @Inject(getRedisConnectionToken())
    private redisConnection,
  ) {}

  getHello(): string {
    return 'This is LRU cache service.';
  }

  async onApplicationShutdown(): Promise<any> {
    this.redisConnection?.disconnect();
  }
}
