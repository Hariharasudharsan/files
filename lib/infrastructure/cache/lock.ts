import { redisClient } from "./cache-service";
import crypto from "crypto";

export class DistributedLock {
  /**
   * Acquires a lock for a given key.
   * @param resource - The resource identifier to lock
   * @param ttlSeconds - How long the lock should be held automatically (to prevent deadlocks)
   * @returns A token if acquired, null if the lock is currently held by someone else
   */
  static async acquire(resource: string, ttlSeconds: number = 30): Promise<string | null> {
    const lockKey = `lock:${resource}`;
    const token = crypto.randomUUID();
    
    // NX: Set if Not eXists
    // EX: Expire after X seconds
    const result = await redisClient.set(lockKey, token, "EX", ttlSeconds, "NX");
    
    if (result === "OK") {
      return token;
    }
    return null;
  }

  /**
   * Releases a lock using the token obtained from acquire().
   * Uses a Lua script to ensure atomic check-and-delete.
   */
  static async release(resource: string, token: string): Promise<boolean> {
    const lockKey = `lock:${resource}`;
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    const result = await redisClient.eval(script, 1, lockKey, token);
    return result === 1;
  }

  /**
   * Helper to execute a function while holding a lock.
   */
  static async withLock<T>(resource: string, fn: () => Promise<T>, ttlSeconds: number = 30): Promise<T> {
    const token = await this.acquire(resource, ttlSeconds);
    
    if (!token) {
      throw new Error(`Could not acquire lock for resource: ${resource}`);
    }

    try {
      return await fn();
    } finally {
      await this.release(resource, token);
    }
  }
}
