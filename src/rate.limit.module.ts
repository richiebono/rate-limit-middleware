import { Module } from '@nestjs/common';
import { RateLimitService } from './rate.limit.service';
import { configureRateLimitCacheModule } from './rate.limit.configure.cache.module';

@Module({
  imports: [
    configureRateLimitCacheModule(),
  ],
  providers: [RateLimitService],
})
export class RateLimitModule {}
