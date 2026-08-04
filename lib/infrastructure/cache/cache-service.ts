import Redis from "ioredis";
import { Logger } from "../logger";
import { CachePolicy } from "./cache-policies";

const redisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

const redisClient = new Redis(redisOptions);

redisClient.on("error", (err) => {
  Logger.error("Redis Cache Connection Error", { error: err.message });
});

/**
 * CacheService provides an enterprise-grade caching subsystem.
 * It uses Redis for persistence and a local Promise Map to prevent Cache Stampedes
 * (also known as thundering herds) by coalescing concurrent requests for the same key.
 */
class EnterpriseCacheService {
  private stampedeLocks = new Map<string, Promise<any>>();

  /**
   * Read-through cache fetcher with stampede protection.
   * If the key is in Redis, it returns it.
   * If not, it executes `fetcher()`, saves to Redis, and returns.
   * If 10,000 requests hit this concurrently for the same key, only ONE `fetcher()` runs.
   * 
   * @param key The hierarchical cache key (e.g., mathuram:v1:catalog:published)
   * @param ttlSeconds Time-to-Live in seconds
   * @param fetcher The async function to execute on a cache miss
   */
  async remember<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    try {
      // 1. Try Redis first
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        // Atomic metric update
        redisClient.incr(CachePolicy.Metrics.Hits).catch(() => {});
        return JSON.parse(cachedData) as T;
      }
    } catch (error) {
      Logger.error("Redis GET Error", { key, error });
    }

    // Cache Miss Metric
    redisClient.incr(CachePolicy.Metrics.Misses).catch(() => {});

    // 2. Distributed Stampede Protection using Redis SET NX
    const lockKey = `lock:${key}`;
    const acquiredLock = await redisClient.set(lockKey, "1", "EX", 10, "NX");

    if (!acquiredLock) {
      // 3. We didn't get the lock. Another node is fetching it. 
      // We must wait for the data to be populated or the lock to expire.
      // We can poll Redis for a short duration.
      for (let i = 0; i < 20; i++) { // Poll for up to 10 seconds (20 * 500ms)
        await new Promise(resolve => setTimeout(resolve, 500));
        const data = await redisClient.get(key);
        if (data) return JSON.parse(data) as T;
      }
      Logger.warn("Cache stampede wait timed out, proceeding to fetch directly", { key });
      // If it times out, just fetch directly as a fallback
      return await fetcher();
    }

    // 4. We got the lock! We are the chosen instance to fetch the data.
    try {
      const freshData = await fetcher();
      
      // Save to Redis
      await redisClient.set(key, JSON.stringify(freshData), "EX", ttlSeconds);

      return freshData;
    } finally {
      // 5. Release the lock so subsequent requests can fail-over gracefully if this node crashes
      await redisClient.del(lockKey).catch(() => {});
    }
  }

  /**
   * Delete a specific key
   */
  async invalidate(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      Logger.error("Failed to invalidate cache key", { key, error });
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const stream = redisClient.scanStream({ match: pattern, count: 100 });
      const keys: string[] = [];
      
      stream.on("data", (resultKeys) => {
        for (let i = 0; i < resultKeys.length; i++) {
          keys.push(resultKeys[i]);
        }
      });
      
      stream.on("end", async () => {
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      });
    } catch (error) {
      Logger.error("Failed to invalidate cache pattern", { pattern, error });
    }
  }

  /**
   * Fetches the current metrics
   */
  async getMetrics(): Promise<{ hits: number; misses: number; ratio: number }> {
    const [hitsStr, missesStr] = await Promise.all([
      redisClient.get(CachePolicy.Metrics.Hits),
      redisClient.get(CachePolicy.Metrics.Misses),
    ]);

    const hits = parseInt(hitsStr || "0", 10);
    const misses = parseInt(missesStr || "0", 10);
    const total = hits + misses;
    const ratio = total === 0 ? 0 : Math.round((hits / total) * 100);

    return { hits, misses, ratio };
  }

  /**
   * Flushes entire cache. Use with caution!
   */
  async flushAll(): Promise<void> {
    await redisClient.flushall();
  }
}

export const CacheService = new EnterpriseCacheService();
