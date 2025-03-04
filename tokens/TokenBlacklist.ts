// tokens/TokenBlacklist.ts

/**
 * TokenBlacklist is a simple in-memory store for revoked tokens.
 * In a production environment, consider using a distributed cache like Redis.
 */
export class TokenBlacklist {
  // Stockage en mémoire : clé = jti, valeur = timestamp d'expiration en millisecondes.
  private blacklist: Map<string, number> = new Map();

  /**
   * Adds a token to the blacklist.
   * @param jti - The token to revoke.
   * @param [ttlSeconds=3600] - The time-to-live for the token (in seconds).
   */
  add(jti: string, ttlSeconds: number = 3600): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.blacklist.set(jti, expiresAt);
  }

  /**
   * Checks whether a token is blacklisted.
   * @param token - The token to check.
   * @returns True if the token is revoked; false otherwise.
   */
  isBlacklisted(jti: string): boolean {
    const expiresAt = this.blacklist.get(jti);
    if (!expiresAt) {
      return false;
    }
    // Si le token a expiré, le retirer et renvoyer false.
    if (Date.now() > expiresAt) {
      this.blacklist.delete(jti);
      return false;
    }
    return true;
  }

  /**
   * Removes a token from the blacklist.
   * @param token - The token to remove.
   */
  remove(jti: string): void {
    this.blacklist.delete(jti);
  }
}
