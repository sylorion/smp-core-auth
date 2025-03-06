// tokens/JWTManager.ts

import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import { CacheService } from '../services/CacheService.js';
import { generateRandomToken } from '../utils/crypto.util.js';
import { CacheAuth } from '../interfaces/Cache.interface.js';

/**
 * Options for configuring the BaseTokenManager.
 */
export interface BaseTokenManagerOptions {
  /** Secret (or private key) used for signing tokens */
  secretOrPrivateKey: string | Buffer;
  /** Public key used for verifying tokens when using RS256 */
  publicKey?: string | Buffer;
  /** Signing algorithm (defaults to HS256) */
  algorithm?: 'HS256' | 'RS256';
  /** Expiration for the token (e.g., '15m', '7d') */
  expiresIn: string | number;
  /** Optional CacheService instance for token metadata storage */
  cacheService?: CacheAuth;
}


/**
 * JWTManager handles token creation and verification.
 */
/**
 * A helper to parse expiresIn values.
 * Supports a number (seconds) or strings ending with 'm', 'h', or 'd' (minutes, hours, days).
 */
export function parseExpiry(expiry: string | number): number {
  if (typeof expiry === 'number') return expiry;
  const match = expiry.match(/^(\d+)([mhd])$/);
  if (!match) {
    throw new Error(`Invalid expiresIn format: ${expiry}`);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default:
      throw new Error(`Unsupported time unit in expiresIn: ${unit}`);
  }
}

/**
 * BaseTokenManager handles creation, verification, invalidation, and decoding of tokens.
 * It stores token metadata (including a unique jti and an "invalidate" flag)
 * in the provided CacheAuth.
 */
export abstract class BaseTokenManager {
  protected secretOrPrivateKey: string | Buffer;
  protected publicKey?: string | Buffer;
  protected algorithm: 'HS256' | 'RS256';
  protected expiresIn: string | number;
  protected verifyOptions: VerifyOptions;
  protected cacheService?: CacheAuth;
  protected ttlSeconds: number;

  constructor(options: BaseTokenManagerOptions) {
    if (!options.secretOrPrivateKey) {
      throw new Error('BaseTokenManager requires a secretOrPrivateKey.');
    }
    this.secretOrPrivateKey = options.secretOrPrivateKey;
    this.publicKey = options.publicKey;
    this.algorithm = options.algorithm || 'HS256';
    this.expiresIn = options.expiresIn;
    this.verifyOptions = { algorithms: [this.algorithm] };
    this.cacheService = options.cacheService;
    this.ttlSeconds = parseExpiry(this.expiresIn);
  }

  /**
   * Creates a signed token with the given payload.
   * Automatically adds a unique jti if not provided.
   * If CacheService is provided, stores token metadata (with an "invalidate" flag) in the cache.
   */
  public createToken(payload: object): string {
    const mutablePayload: any = { ...payload };
    if (!mutablePayload.jti) {
      mutablePayload.jti = generateRandomToken(16);
    }
    const expiresIn = (typeof this.expiresIn === 'string') ? parseInt(this.expiresIn as string, 10) : this.expiresIn;

    const signOptions: SignOptions = {
      algorithm: this.algorithm,
      expiresIn: expiresIn,
    };
    let token: string;
    try {
      token = jwt.sign(mutablePayload, this.secretOrPrivateKey, signOptions);
    } catch (error) {
      throw new Error(`Error creating token: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (this.cacheService) {
      // Store metadata with key "token:<jti>", TTL matching the token's expiration, and an "invalidate" flag.
      this.cacheService.set(`token:${mutablePayload.jti}`, { invalidate: false }, this.ttlSeconds);
    }
    return token;
  }

  /**
   * Asynchronously verifies the token and checks the cache for an invalidation flag.
   * @returns The decoded token payload if valid.
   */
  public async verifyToken(token: string): Promise<JwtPayload | string> {
    try {
      const decoded = jwt.verify(token, this.publicKey ?? this.secretOrPrivateKey, this.verifyOptions) as JwtPayload;
      if (this.cacheService && decoded.jti) {
        const cacheEntry = await this.cacheService.get(`token:${decoded.jti}`);
        if (cacheEntry && cacheEntry.invalidate === true) {
          throw new Error('Token has been invalidated.');
        }
      }
      return decoded;
    } catch (error) {
      throw new Error(`Error verifying token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Invalidates a token by updating its cache entry:
   * sets its TTL to 0 and marks it as invalid.
   */
  public async invalidateToken(token: string): Promise<void> {
    if (!this.cacheService) {
      throw new Error('CacheService not configured; cannot invalidate token.');
    }
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded || !decoded.jti) {
      throw new Error('Invalid token format; missing jti.');
    }
    await this.cacheService.set(`token:${decoded.jti}`, { invalidate: true }, 0);
  }

  /**
   * Decodes the token without verifying its signature.
   */
  public decodeToken(token: string): JwtPayload | null {
    const decoded = jwt.decode(token);
    return typeof decoded === 'object' ? decoded : null;
  }
}

/**
 * JWTManager for access tokens.
 */
export class JWTManager extends BaseTokenManager {}

/**
 * RefreshTokenManager for refresh tokens.
 */
export class RefreshTokenManager extends BaseTokenManager {}
