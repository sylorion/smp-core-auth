// tokens/JWKSCache.ts

export interface JWKSCacheEntry {
  keys: any[]; // Le tableau des clés JWKS
  expiresAt: number; // Timestamp d'expiration en millisecondes
}


/**
 * JWKSCache caches JSON Web Key Sets (JWKS) with a time-to-live.
 * This helps reduce repeated network calls to an OAuth provider's JWKS endpoint.
 */
export class JWKSCache {
  private cache: Map<string, JWKSCacheEntry> = new Map();


  /**
   * Stores a key-value pair in the cache with a TTL.
   * @param providerUrl - The cache key.
   * @param keys - The JWKS values.
   * @param ttlSeconds - Time-to-live in seconds.
   */
  set(providerUrl: string, keys: any[], ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(providerUrl, { keys, expiresAt });
  }

  /**
   * Retrieves values from the cache.
   * @param providerUrl - The cache key.
   * @returns The cached values, or null if not found or expired.
   */
  get(providerUrl: string): JWKSCacheEntry | null {
    const entry = this.cache.get(providerUrl);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(providerUrl);
      return null;
    }
    return entry; // updated to return the entry instead of just keys
  }

  /**
   * Efface l'intégralité du cache JWKS.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Deletes a key from the cache.
   * @param key - The cache key to remove.
   */
  public delete(providerUrl: string): void {
    this.cache.delete(providerUrl);
  }
  
  /**
   * Returns the number of keys in the cache.
   * @returns The size of the cache.
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Checks if the cache contains a key.
   * @param providerUrl - The cache key to check.
   * @returns True if the key exists, false otherwise.
   */
  public has(providerUrl: string): boolean {
    return this.cache.has(providerUrl);
  }
}
