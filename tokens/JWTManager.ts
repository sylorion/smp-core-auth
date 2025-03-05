// tokens/JWTManager.ts

import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import { DEFAULT_JWT_EXPIRES_IN } from '../constants';
export interface JWTManagerOptions {
  /** Secret (or private key) for signing tokens */
  secretOrPrivateKey: string | Buffer;
  /** Public key for verifying tokens when using RS256 */
  publicKey?: string | Buffer;
  /** Signing algorithm (defaults to HS256) */
  algorithm?: 'HS256' | 'RS256';
  /** Expiration for the token (e.g., '15m', '1h') */
  expiresIn: string | number;
}

/**
 * JWTManager handles token creation and verification.
 */
export class JWTManager {
  private secretOrPrivateKey: string | Buffer;
  private publicKey?: string | Buffer;
  private algorithm: 'HS256' | 'RS256';
  private expiresIn: string | number;
  private verifyOptions: VerifyOptions;

  constructor(options: JWTManagerOptions) {
    if (!options.secretOrPrivateKey) {
      throw new Error('JWTManager requires a secretOrPrivateKey.');
    }
    this.secretOrPrivateKey = options.secretOrPrivateKey;
    this.publicKey = options.publicKey;
    this.algorithm = options.algorithm || 'HS256';
    this.expiresIn = options.expiresIn;
    this.verifyOptions = { algorithms: [this.algorithm] };
  }

  /**
   * Creates a signed JWT with the provided payload.
   */
  public createToken(payload: object): string {
    const expiresIn = (typeof this.expiresIn === 'string') ? parseInt(this.expiresIn as string, 10) : this.expiresIn;
    
    const signOptions: SignOptions = {
      algorithm: this.algorithm,
      expiresIn: expiresIn,
    };
    try {
      return jwt.sign(payload, this.secretOrPrivateKey, signOptions);
    } catch (error) {
      throw new Error(`Error creating token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verifies the provided token and returns its decoded payload.
   */
  public verifyToken(token: string): JwtPayload | string {
    try {
      const key = this.algorithm === 'RS256' ? this.publicKey! : this.secretOrPrivateKey;
      return jwt.verify(token, key, this.verifyOptions);
    } catch (error) {
      throw new Error(`Error verifying token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Decodes the token without verifying its signature.
   */
  public decodeToken(token: string): JwtPayload | null {
    const decoded = jwt.decode(token);
    return typeof decoded === 'object' ? decoded : null;
  }
}
