import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60 * 15, // Block for 15 minutes
});

export { rateLimiter };

export async function rateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await rateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (rejRes: any) {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
}

// Stricter rate limiter for API endpoints
const apiRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'api',
  points: 50,
  duration: 60,
  blockDuration: 60 * 30,
});

export async function apiRateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await apiRateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (rejRes: any) {
    logger.warn(`API rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'API Rate Limit Exceeded',
      message: 'Too many API requests. Please try again later.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
} 