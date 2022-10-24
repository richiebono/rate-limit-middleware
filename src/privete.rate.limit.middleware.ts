import { Inject, Injectable, NestMiddleware, CACHE_MANAGER} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment-timezone';
import { RateLimitRequest } from './rate.limit.request';
import { RateLimitService } from './rate.limit.service';

@Injectable()
export class PriveteRateLimitMiddleware implements NestMiddleware {

    constructor(private readonly rateLimitService: RateLimitService) {}
    
    async use(req: Request, res: Response, next: NextFunction) {
    
        try 
        {      
            const currentRequestTime = moment();         
            let rateLimitRequest = new RateLimitRequest();
            rateLimitRequest.key = req.body.accessToken;
            rateLimitRequest.requestTimeStamp = currentRequestTime.unix();
            rateLimitRequest = await this.rateLimitService.add(rateLimitRequest);
                   
            let totalRequests = await this.rateLimitService.getCount(rateLimitRequest.key, currentRequestTime.subtract(process.env.WINDOW_SIZE_IN_HOURS, 'hours').unix());

            if (totalRequests >= parseInt(process.env.MAX_REQUEST_BY_TOKEN_IN_HOUR)) 
            {
                res.status(429).send('You have exceeded the access token requests limit allowed by hours!');
            } 
            else 
            {
                await this.rateLimitService.update(rateLimitRequest.key, currentRequestTime.subtract(process.env.WINDOW_LOG_INTERVAL_IN_HOURS, 'hours').unix());
            }
            next();
        } 
        catch (error) {
            next(error);
        }
    }
}
