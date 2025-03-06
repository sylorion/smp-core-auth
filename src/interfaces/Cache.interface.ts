// interfaces/Cache.interface.ts

/**
 * CacheAuth provides a unified interface for caching authentication tokens.
 */
export interface CacheAuth {
  /**
   * Stores a value with an optional TTL (in seconds).
   */
  set(key: string, value: any, ttlSeconds?: number): Promise<void> 

  /**
   * Retrieves a value from the cache.
   */
  get(key: string): Promise<any> 

  /**
   * Deletes a key from the cache.
   */
  delete(key: string): Promise<void> 
}
