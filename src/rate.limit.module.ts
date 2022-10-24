import { CacheModule, Module } from '@nestjs/common';
import { RateLimitService } from './rate.limit.service';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [],
  providers: [RateLimitService],
})
export class RateLimitModule {}
