import { Injectable, NestMiddleware} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as moment from 'moment-timezone';
import { RateLimitRequest } from './rate.limit.request';
import { RateLimitService } from './rate.limit.service';

@Injectable()
export class PriveteRateLimitMiddleware implements NestMiddleware {

    constructor(private readonly rateLimitService: RateLimitService) {}
    
    async use(req: Request, res: Response, next: NextFunction) {
    
        try 
        {      
            const currentRequestTime = moment();
            const unitOfTime = process.env.RATE_LIMIT_UNIT_OF_TIME as moment.unitOfTime.DurationConstructor;
            const nextWindowsTime = moment(currentRequestTime).add(process.env.RATE_LIMIT_WINDOW_LOG_INTERVAL, unitOfTime);            
            const maxRequestAllowed = parseInt(process.env.RATE_LIMIT_MAX_REQUEST_BY_TOKEN);
            const limitWindowSize = process.env.RATE_LIMIT_WINDOW_SIZE;

            var rateLimitRequest = {
                key: req.header('Authorization').split(' ')[1],
                requestTimeStamp: currentRequestTime.unix()
            } as RateLimitRequest;
              
            this.rateLimitService.add(rateLimitRequest).then(() => {
                
                const potentialCurrentWindow = currentRequestTime.subtract(limitWindowSize, unitOfTime).unix();
            
                this.rateLimitService.getCount(rateLimitRequest.key, potentialCurrentWindow).then(totalRequests => {
                    
                    if (totalRequests >= maxRequestAllowed)
                    {
                        res.status(429).send({ status: 429, message: `You have exceeded the ${ maxRequestAllowed } access token requests limit allowed per ${ unitOfTime }, try again at ${ nextWindowsTime }!`});
                    }                        
                    else 
                    {
                        this.rateLimitService.update(rateLimitRequest.key, currentRequestTime, potentialCurrentWindow).then(() =>{
                            next();
                        });
                    }
                })
            });            
        } 
        catch (error) {
            next(error);
        }
    }
}
