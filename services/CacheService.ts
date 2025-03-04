export interface CacheItem<T> {
  value: T;
  expiresAt: number; // Timestamp en millisecondes
}

export class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();

  /**
   * Stocke une valeur dans le cache avec une durée de vie en secondes.
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Récupère la valeur associée à la clé si elle n'est pas expirée.
   */
  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  /**
   * Supprime une clé du cache.
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
}
