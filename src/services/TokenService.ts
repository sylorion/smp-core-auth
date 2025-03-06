// services/TokenService.ts
// services/TokenService.ts

import fs from 'fs';
import path from 'path';
import { JWTManager, RefreshTokenManager } from '../tokens/JWTManager.js';
import { AuthConfig } from '../interfaces/AuthConfig.interface.js';
import { CacheService } from './CacheService.js';
import { CacheAuth } from '../interfaces/Cache.interface.js';
import { DEFAULT_JWT_EXPIRES_IN, DEFAULT_REFRESH_TOKEN_EXPIRES_IN } from '../constants.js';


/**
 * Service for issuing, validating, and revoking JWT tokens.
 * Supports symmetric (HS256) and asymmetric (RS256) signing based on configuration.
 */
export class TokenService {
  private jwtManager: JWTManager;
  private refreshTokenManager: RefreshTokenManager;
  private privateKey?: Buffer;      // For RS256 signing
  private publicKey?: Buffer;       // For RS256 verification
  private secretKey?: string;       // For HS256 signing
  private refreshTokenSecret?: string; // For HS256 signing
  private verifyOptions: { algorithms: string[] };

  constructor(private config: AuthConfig, private cacheService: CacheAuth) {
    this.validateConfig(config);
    const useAsymmetric = config.token?.algorithm === 'RS256';

    if (useAsymmetric) {
      if (!config.token?.privateKeyPath || !config.token.publicKeyPath) {
        throw new Error('RS256 requires both privateKeyPath and publicKeyPath in AuthConfig.');
      }
      this.privateKey = fs.readFileSync(path.resolve(config.token.privateKeyPath));
      this.publicKey = fs.readFileSync(path.resolve(config.token.publicKeyPath));
    } else {
      // Use HS256 – ensure a secret is provided.
      this.secretKey = config.jwtSecret;
      this.refreshTokenSecret = config.refreshTokenSecret;
    }

    this.verifyOptions = {
      algorithms: [ useAsymmetric ? 'RS256' : 'HS256' ],
    };

    // Initialize JWTManager for access tokens.
    this.jwtManager = new JWTManager({
      secretOrPrivateKey: this.privateKey ?? (this.secretKey ?? config.jwtSecret),
      publicKey: this.publicKey ?? (config.token as any)?.publicKey,
      algorithm: config.token?.algorithm,
      expiresIn: config.jwtExpiresIn || DEFAULT_JWT_EXPIRES_IN,
      cacheService: this.cacheService,
    });

    // Initialize RefreshTokenManager for refresh tokens.
    this.refreshTokenManager = new RefreshTokenManager({
      secretOrPrivateKey: this.privateKey ?? (this.refreshTokenSecret ?? config.refreshTokenSecret),
      publicKey: this.publicKey ?? (config.token as any)?.publicKey,
      algorithm: config.token?.algorithm,
      expiresIn: config.refreshTokenExpiresIn || DEFAULT_REFRESH_TOKEN_EXPIRES_IN,
      cacheService: this.cacheService,
    });
  }

  /**
   * Creates an access token with the provided payload.
   */
  public createAccessToken(payload: object): string {
    return this.jwtManager.createToken(payload);
  }

  /**
   * Verifies the access token and returns the decoded payload.
   */
  public async verifyAccessToken(token: string): Promise<any> {
    return await this.jwtManager.verifyToken(token);
  }

  /**
   * Invalidates an access token (e.g. during logout).
   */
  public async invalidateAccessToken(token: string): Promise<void> {
    await this.jwtManager.invalidateToken(token);
  }

  /**
   * Creates a refresh token with the provided payload.
   */
  public createRefreshToken(payload: object): string {
    return this.refreshTokenManager.createToken(payload);
  }

  /**
   * Verifies the refresh token and returns the decoded payload.
   */
  public async verifyRefreshToken(token: string): Promise<any> {
    return await this.refreshTokenManager.verifyToken(token);
  }

  /**
   * Invalidates a refresh token.
   */
  public async invalidateRefreshToken(token: string): Promise<void> {
    await this.refreshTokenManager.invalidateToken(token);
  }

  /**
   * Decodes a token without verifying its signature.
   */
  public decodeToken(token: string): any {
    return this.jwtManager.decodeToken(token);
  }

  /**
   * Validates essential configuration.
   */
  private validateConfig(cfg: AuthConfig): void {
    if (!cfg.jwtSecret && (!cfg.token || !cfg.token.algorithm)) {
      throw new Error('AuthConfig must include either a jwtSecret for HS256 or token.algorithm for RS256.');
    }
    if (!cfg.refreshTokenSecret && (!cfg.token || !cfg.token.algorithm)) {
      throw new Error('AuthConfig must include a refreshTokenSecret for HS256 or token.algorithm for RS256.');
    }
  }
}
