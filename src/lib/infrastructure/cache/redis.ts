import Redis from "ioredis";
import { Logger } from "../logger";

const redisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

export const redisCache = new Redis(redisOptions);

redisCache.on("error", (err) => {
  Logger.error("Redis Cache Connection Error", { error: err.message });
});

/**
 * Get a parsed JSON value from Redis
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redisCache.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    Logger.error("Failed to get cache from Redis", { key, error });
    return null;
  }
}

/**
 * Set a JSON value in Redis with an optional TTL (in seconds)
 */
export async function setCache<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
  try {
    const data = JSON.stringify(value);
    await redisCache.set(key, data, "EX", ttlSeconds);
  } catch (error) {
    Logger.error("Failed to set cache in Redis", { key, error });
  }
}

/**
 * Delete a value from Redis
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redisCache.del(key);
  } catch (error) {
    Logger.error("Failed to delete cache in Redis", { key, error });
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const stream = redisCache.scanStream({ match: pattern, count: 100 });
    const keys: string[] = [];
    
    stream.on("data", (resultKeys) => {
      for (let i = 0; i < resultKeys.length; i++) {
        keys.push(resultKeys[i]);
      }
    });
    
    stream.on("end", async () => {
      if (keys.length > 0) {
        await redisCache.del(...keys);
      }
    });
  } catch (error) {
    Logger.error("Failed to invalidate cache pattern", { pattern, error });
  }
}
