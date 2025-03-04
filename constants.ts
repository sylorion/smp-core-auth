// constants.ts

/**
 * Global constants for the authentication library.
 * 
 * These constants can be configured via environment variables to adapt
 * to different production environments.
 */

// JWT expiration defaults
export const DEFAULT_JWT_EXPIRES_IN: string = process.env.DEFAULT_JWT_EXPIRES_IN || '15m';
export const DEFAULT_REFRESH_TOKEN_EXPIRES_IN: string = process.env.DEFAULT_REFRESH_TOKEN_EXPIRES_IN || '7d';

// Bcrypt configuration
export const DEFAULT_BCRYPT_SALT_ROUNDS: number = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

// PBKDF2 configuration (if used elsewhere)
// Although bcrypt is used for password hashing in production,
// these defaults are provided for any PBKDF2 usage.
export const DEFAULT_PBKDF2_ITERATIONS: number = parseInt(process.env.PBKDF2_ITERATIONS || '100000', 10);
export const DEFAULT_PBKDF2_KEY_LENGTH: number = parseInt(process.env.PBKDF2_KEY_LENGTH || '64', 10);
export const DEFAULT_PBKDF2_DIGEST: string = process.env.PBKDF2_DIGEST || 'sha512';

// Supported OAuth providers (used for configuration and validation)
export const SUPPORTED_OAUTH_PROVIDERS: string[] = [
  'google',
  'facebook',
  'apple',
  'azure',
  'amazon',
  'franceconnect',
  'comptepro'
];
