// services/CacheService.ts

import { Redis } from 'ioredis';

/**
 * CacheService provides a unified interface for caching,
 * using Redis if configuration is provided, or an in-memory Map otherwise.
 */
export class CacheService {
  private redisClient?: Redis;
  private inMemoryCache: Map<string, any>;

  constructor(config?: { host: string; port: number; password?: string }) {
    if (config && config.host && config.port) {
      this.redisClient = new Redis({
        host: config.host,
        port: config.port,
        password: config.password,
      });
    }
    this.inMemoryCache = new Map<string, any>();
  }

  /**
   * Stores a value with an optional TTL (in seconds).
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.set(key, JSON.stringify({...value, ttl: ttlSeconds}));
    } else {
      this.inMemoryCache.set(key, value);
      if (ttlSeconds) {
        setTimeout(() => this.inMemoryCache.delete(key), ttlSeconds * 1000);
      }
    }
  }

  /**
   * Retrieves a value from the cache.
   */
  async get(key: string): Promise<any> {
    if (this.redisClient) {
      const result = await this.redisClient.get(key);
      return result ? JSON.parse(result) : null;
    }
    return this.inMemoryCache.get(key);
  }

  /**
   * Deletes a key from the cache.
   */
  async delete(key: string): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.del(key);
    } else {
      this.inMemoryCache.delete(key);
    }
  }
}
