import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { RateLimitRequest } from './rate.limit.request';
import { Cache } from 'cache-manager';
import { Moment } from 'moment';

@Injectable()
export class RateLimitService {
  
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    private fillData(key: string, requestTimeStamp: number): RateLimitRequest {
        let rateLimitRequest = new RateLimitRequest();
        rateLimitRequest.key = key;        
        rateLimitRequest.requestCount = 1; 
        rateLimitRequest.requestTimeStamp = requestTimeStamp;       
        return rateLimitRequest;
    }

    private checkIfCacheExist()
    {
        if (!this.cacheManager) throw new Error('Redis client does not exist!');
    }

    public async findByKey(key: string): Promise<RateLimitRequest[]>
    {
        this.checkIfCacheExist();
        if (!this.cacheManager) throw new Error('Redis client does not exist!');
        return (await this.cacheManager.get(key)) as RateLimitRequest[];
    }

    public async add(request: RateLimitRequest) {
        this.checkIfCacheExist();        
        const  rateLimitRequests = await this.filter(request.key, request.requestTimeStamp);        
        if (rateLimitRequests !== null)  return request;        
        let rateLimitRequest = this.fillData(request.key, request.requestTimeStamp);
        let newRecord = [] as RateLimitRequest[];            
        newRecord.push(rateLimitRequest);
        await this.cacheManager.set(request.key, newRecord);  
        return rateLimitRequest;
    }

    public async filter(key: string, requestTimeStamp: number ): Promise<RateLimitRequest[]> {
        const  rateLimitRequests = await this.findByKey(key);
        return rateLimitRequests.filter((entry) => {
            return entry.requestTimeStamp > requestTimeStamp;
        });
    }

    public async getCount(key: string, requestTimeStamp: number) {        
        const  rateLimitRequests = await this.filter(key, requestTimeStamp);
        return rateLimitRequests.reduce((accumulator, entry) => {
            return accumulator + entry.requestCount;
        }, 0);
    }
    
    public async update(key: string, requestTimeStamp: Moment) {
        this.checkIfCacheExist();        
        const  rateLimitRequests = await this.findByKey(key);
        let lastRateLimitRequest = rateLimitRequests[rateLimitRequests.length - 1];
        let potentialCurrentWindow = requestTimeStamp.subtract(process.env.WINDOW_LOG_INTERVAL_IN_HOURS, 'hours').unix();

        console.log( {lastRateLimitRequest: lastRateLimitRequest});
        console.log( {potentialCurrentWindow: potentialCurrentWindow});

        if (lastRateLimitRequest.requestTimeStamp > potentialCurrentWindow) 
        {
            lastRateLimitRequest.requestCount++;
            rateLimitRequests[rateLimitRequests.length - 1] = lastRateLimitRequest;
            console.log( {rateLimitRequestsIf: rateLimitRequests});
        }
        else 
        {
            rateLimitRequests.push(this.fillData(key, requestTimeStamp.unix()));
            console.log( {rateLimitRequestsElse: rateLimitRequests});
        }
        
        await this.cacheManager.set(key, rateLimitRequests);
    }
}
