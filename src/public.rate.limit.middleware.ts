import { Injectable, NestMiddleware} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as moment from 'moment-timezone';
import { RateLimitRequest } from './rate.limit.request';
import { RateLimitService } from './rate.limit.service';

@Injectable()
export class PublicRateLimitMiddleware implements NestMiddleware {

    constructor(private readonly rateLimitService: RateLimitService) {}
    
    async use(req: Request, res: Response, next: NextFunction) {
    
        try 
        {               
            const currentRequestTime = moment();
            
            var rateLimitRequest = {
                key: req.ip,
                requestTimeStamp: currentRequestTime.unix()
            } as RateLimitRequest;

            await this.rateLimitService.add(rateLimitRequest);     
            let totalRequests = await this.rateLimitService.getCount(rateLimitRequest.key, currentRequestTime.subtract(process.env.WINDOW_SIZE_IN_HOURS, 'hours').unix());

            if (totalRequests > parseInt(process.env.MAX_REQUEST_BY_IP_IN_HOUR)) 
            {
                res.status(429).send('You have exceeded the access IP requests limit allowed by hours!');
            } 
            else 
            {
                await this.rateLimitService.update(rateLimitRequest.key, currentRequestTime);
            }
            next();
        } 
        catch (error) {
            next(error);
        }
    }
}
