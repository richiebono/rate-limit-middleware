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
        rateLimitRequest.requestCount = 0; 
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
    }

    public async filter(key: string, requestTimeStamp: number ): Promise<RateLimitRequest[]> {
        const  rateLimitRequests = await this.findByKey(key);
        return rateLimitRequests && rateLimitRequests.filter((entry) => {
            return entry.requestTimeStamp > requestTimeStamp && entry.key === key
        });
    }

    public async getCount(key: string, requestTimeStamp: number) {        
        const  rateLimitRequests = await this.filter(key, requestTimeStamp);
        return rateLimitRequests.reduce((accumulator, entry) => {
            return accumulator + entry.requestCount;
        }, 0);
    }
    
    public async update(key: string, requestTimeStamp: Moment, potentialCurrentWindow: number ) {
        
        this.checkIfCacheExist();             
        const  rateLimitRequests = await this.findByKey(key);
        let lastRateLimitRequest = rateLimitRequests[rateLimitRequests.length - 1];        

        if (lastRateLimitRequest.requestTimeStamp >= potentialCurrentWindow) 
        {
            lastRateLimitRequest.requestCount++;
            rateLimitRequests[rateLimitRequests.length - 1] = lastRateLimitRequest;
        }
        else rateLimitRequests.push(this.fillData(key, requestTimeStamp.unix()));
        
        await this.cacheManager.set(key, rateLimitRequests);
    }
}
