import { CacheModule } from "@nestjs/common";
import { redisStore } from 'cache-manager-redis-store';


export const configureRateLimitCacheModule = () => CacheModule.register({
    // @ts-ignore
    store: async () => await redisStore({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      }, 
      ttl: parseInt(process.env.RADIS_TTL)
    })
  });