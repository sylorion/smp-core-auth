// tokens/RefreshTokenManager.ts

import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';

export interface RefreshTokenManagerOptions {
  /** Secret (or private key) for signing refresh tokens */
  secretOrPrivateKey: string | Buffer;
  /** Public key for verifying tokens when using RS256 */
  publicKey?: string | Buffer;
  /** Signing algorithm (defaults to HS256) */
  algorithm?: 'HS256' | 'RS256';
  /** Expiration for the refresh token (e.g., '7d') */
  expiresIn: string | number;
}

/**
 * RefreshTokenManager handles creation and verification of refresh tokens.
 */
export class RefreshTokenManager {
  private secretOrPrivateKey: string | Buffer;
  private publicKey?: string | Buffer;
  private algorithm: 'HS256' | 'RS256';
  private expiresIn: string | number;
  private verifyOptions: VerifyOptions;

  constructor(options: RefreshTokenManagerOptions) {
    if (!options.secretOrPrivateKey) {
      throw new Error('RefreshTokenManager requires a secretOrPrivateKey.');
    }
    this.secretOrPrivateKey = options.secretOrPrivateKey;
    this.publicKey = options.publicKey;
    this.algorithm = options.algorithm || 'HS256';
    this.expiresIn = options.expiresIn;
    this.verifyOptions = { algorithms: [this.algorithm] };
  }

  /**
   * Creates a signed refresh token with the provided payload.
   */
  public createRefreshToken(payload: object): string {
    const signOptions: SignOptions = {
      algorithm: this.algorithm,
      expiresIn: this.expiresIn,
    };
    try {
      return jwt.sign(payload, this.secretOrPrivateKey, signOptions);
    } catch (error) {
      throw new Error(`Error creating refresh token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verifies the provided refresh token and returns its decoded payload.
   */
  public verifyRefreshToken(token: string): JwtPayload | string {
    try {
      const key = this.algorithm === 'RS256' ? this.publicKey! : this.secretOrPrivateKey;
      return jwt.verify(token, key, this.verifyOptions);
    } catch (error) {
      throw new Error(`Error verifying refresh token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Decodes the refresh token without verifying its signature.
   */
  public decodeToken(token: string): JwtPayload | null {
    const decoded = jwt.decode(token);
    return typeof decoded === 'object' ? decoded : null;
  }
}
