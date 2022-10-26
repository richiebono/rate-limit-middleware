import { CacheModule } from "@nestjs/common";
import { redisStore } from 'cache-manager-redis-store';

const getCacheTTL = (() => {
    const unitOfTime = process.env.RATE_LIMIT_UNIT_OF_TIME;
    switch(unitOfTime) {  
      case "minutes":
            return 60;
        case "days":
          return 86400;                
        default:
            return 3600;
      }
});

export const configureRateLimitCacheModule = () => CacheModule.register({
    // @ts-ignore
    store: async () => await redisStore({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      }, 
      ttl: getCacheTTL()
    })
  });