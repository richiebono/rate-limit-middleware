import { CacheModule, Module } from '@nestjs/common';
import { RateLimitService } from './rate.limit.service';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [CacheModule.register({
    // @ts-ignore
    store: async () => await redisStore({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
      ttl: parseInt(process.env.RATE_LIMIT_WINDOW_LOG_INTERVAL)
    })
  })],
  providers: [RateLimitService],
})
export class RateLimitModule {}
