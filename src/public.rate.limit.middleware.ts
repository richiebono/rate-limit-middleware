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
            const unitOfTime = process.env.RATE_LIMIT_UNIT_OF_TIME as moment.unitOfTime.DurationConstructor;
            const nextWindowsTime = moment(currentRequestTime).add(process.env.RATE_LIMIT_WINDOW_LOG_INTERVAL, unitOfTime);
            const maxRequestAllowed = parseInt(process.env.RATE_LIMIT_MAX_REQUEST_BY_IP);
            const limitWindowSize = process.env.RATE_LIMIT_WINDOW_SIZE;

            const rateLimitRequest = {
                key: req.ip,
                requestTimeStamp: currentRequestTime.unix()
            } as RateLimitRequest;

            await this.rateLimitService.add(rateLimitRequest);  
            const potentialCurrentWindow = currentRequestTime.subtract(limitWindowSize, unitOfTime).unix();
            const totalRequests = await this.rateLimitService.getCount(rateLimitRequest.key, potentialCurrentWindow);
            
            if (totalRequests >= maxRequestAllowed) 
                res.status(429).send({ status: 429, message: `You have exceeded the ${ maxRequestAllowed } IP requests limit allowed per ${ unitOfTime }, try again at ${ nextWindowsTime }!`});
            else 
                await this.rateLimitService.update(rateLimitRequest.key, currentRequestTime, potentialCurrentWindow);
            
            next();
        } 
        catch (error) {
            next(error);
        }
    }
}
