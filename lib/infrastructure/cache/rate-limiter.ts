import { redisClient } from "./cache-service";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export class RateLimiter {
  /**
   * Simple fixed window rate limiter using Redis
   * @param identifier - e.g., IP address or User ID
   * @param limit - Maximum requests allowed
   * @param windowSeconds - Time window in seconds
   */
  static async check(identifier: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}`;
    
    // Increment the count for the key
    const count = await redisClient.incr(key);
    
    // If it's the first request, set the expiration
    if (count === 1) {
      await redisClient.expire(key, windowSeconds);
    }
    
    // Get the time remaining (reset)
    const ttl = await redisClient.ttl(key);
    
    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset: ttl > 0 ? Date.now() + ttl * 1000 : Date.now() + windowSeconds * 1000,
    };
  }
}
