// services/TokenService.ts

import fs from 'fs';
import path from 'path';
import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import { AuthConfig } from '../interfaces/AuthConfig.interface';
import { TokenBlacklist } from '../tokens/TokenBlacklist';
import { DEFAULT_JWT_EXPIRES_IN, DEFAULT_REFRESH_TOKEN_EXPIRES_IN } from '../constants';

/**
 * Service for issuing, validating, and revoking JWT tokens.
 * Supports symmetric (HS256) and asymmetric (RS256) signing based on configuration.
 */
export class TokenService {
  private readonly accessTokenOptions: SignOptions;
  private readonly refreshTokenOptions: SignOptions;
  private readonly verifyOptions: VerifyOptions;
  private privateKey?: Buffer;      // For RS256 signing
  private publicKey?: Buffer;       // For RS256 verification
  private secretKey?: string;       // For HS256 signing

  constructor(
    private config: AuthConfig,
    private tokenBlacklist: TokenBlacklist
  ) {
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
    }

    this.accessTokenOptions = {
      algorithm: useAsymmetric ? 'RS256' : 'HS256',
      expiresIn: config.jwtExpiresIn || DEFAULT_JWT_EXPIRES_IN,
    };

    this.refreshTokenOptions = {
      algorithm: useAsymmetric ? 'RS256' : 'HS256',
      expiresIn: config.refreshTokenExpiresIn || DEFAULT_REFRESH_TOKEN_EXPIRES_IN,
    };

    this.verifyOptions = {
      algorithms: [useAsymmetric ? 'RS256' : 'HS256'],
    };
  }

  /**
   * Issues a new access token with the given payload.
   */
  public generateAccessToken(payload: Record<string, unknown>): string {
    const key = this.privateKey ?? this.secretKey!;
    return jwt.sign(payload, key, this.accessTokenOptions);
  }

  /**
   * Issues a new refresh token with the given payload.
   */
  public generateRefreshToken(payload: Record<string, unknown>): string {
    const key = this.privateKey ?? this.secretKey!;
    return jwt.sign(payload, key, this.refreshTokenOptions);
  }

  /**
   * Validates an access token, checking signature, expiration, and blacklist.
   */
  public validateAccessToken(token: string): JwtPayload | string {
    if (this.tokenBlacklist.isBlacklisted(token)) {
      throw new Error('Token has been revoked.');
    }
    try {
      const key = this.publicKey ?? this.secretKey!;
      return jwt.verify(token, key, this.verifyOptions);
    } catch (error) {
      throw new Error(`Invalid or expired access token: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Validates a refresh token, checking signature, expiration, and blacklist.
   */
  public verifyRefreshToken(token: string): JwtPayload | string {
    if (this.tokenBlacklist.isBlacklisted(token)) {
      throw new Error('Refresh token has been revoked.');
    }
    try {
      const key = this.publicKey ?? this.secretKey!;
      return jwt.verify(token, key, this.verifyOptions);
    } catch (error) {
      throw new Error(`Invalid or expired refresh token: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Revokes a token by adding it to the blacklist.
   */
  public revokeToken(token: string): void {
    this.tokenBlacklist.add(token);
  }

  /**
   * Decodes a token without verifying signature or expiration.
   */
  public decodeToken(token: string): JwtPayload | null {
    const decoded = jwt.decode(token);
    return typeof decoded === 'object' ? decoded : null;
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
