import { redisCache } from "./cache/redis";

export class RateLimiter {
  /**
   * Simple sliding window rate limiter using Redis Sorted Sets.
   *
   * @param key - The unique identifier for the limit (e.g., "ratelimit:login:192.168.1.1")
   * @param limit - The maximum number of requests allowed in the window
   * @param windowSec - The time window in seconds
   * @returns { success: boolean, remaining: number }
   */
  static async check(key: string, limit: number, windowSec: number): Promise<{ success: boolean; remaining: number }> {
    const now = Date.now();
    const windowStart = now - windowSec * 1000;

    const multi = redisCache.multi();
    // Remove old requests outside the current window
    multi.zremrangebyscore(key, 0, windowStart);
    // Count the number of requests in the current window
    multi.zcard(key);
    // Add the current request
    multi.zadd(key, now, `${now}-${Math.random()}`);
    // Set expiry so the key cleans itself up
    multi.expire(key, windowSec);

    const results = await multi.exec();
    if (!results) {
      return { success: false, remaining: 0 };
    }

    // result[1] corresponds to zcard, results[1][1] is the actual count before adding
    const count = results[1][1] as number;
    const success = count < limit;

    return {
      success,
      remaining: Math.max(0, limit - (count + 1)),
    };
  }
}
