// interfaces/AuthConfig.interface.ts
// interfaces/AuthConfig.interface.ts

/**
 * Interface for the authentication configuration.
 *
 * This configuration is required for initializing the authentication library.
 * It includes parameters for JWT tokens, OAuth providers, cache settings,
 * gRPC configuration, local authentication, and token management.
 */
export interface AuthConfig {
  /**
   * Secret key used to sign JWT access tokens.
   */
  jwtSecret: string;

  /**
   * Expiration time for JWT access tokens (e.g., '15m', '1h').
   */
  jwtExpiresIn: string;

  /**
   * Secret key used to sign JWT refresh tokens.
   */
  refreshTokenSecret: string;

  /**
   * Expiration time for JWT refresh tokens (e.g., '7d').
   */
  refreshTokenExpiresIn: string;

  /**
   * Configuration for OAuth providers.
   * Each key is the provider name (e.g., 'google', 'facebook', 'apple', etc.) with its corresponding client configuration.
   */
  oauthProviders?: {
    google?: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
    facebook?: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
    apple?: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
    azure?: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
    amazon?: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
    franceconnect?: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
    comptepro?: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };

  };

  /**
   * Cache configuration.
   * Typically used for storing JWKS, token blacklists, and throttling refresh token generation.
   */
  cache?: {
    host: string;
    port: number;
    password?: string;
  };

  /**
   * gRPC configuration for calling external services (e.g., user service for local authentication).
   */
  grpc?: {
    host: string;
    port: number;
  };

  /**
   * Local authentication configuration.
   * Used for validating user credentials via an external user service.
   */
  localAuth?: {
    /**
     * The URL or endpoint for the external user service responsible for authentication.
     */
    userServiceUrl: string;
    // Additional parameters like service credentials can be added if necessary.
  };

  /**
   * Token management configuration.
   * Defines the algorithm and key paths if using asymmetric signing.
   */
  token?: {
    /**
     * The algorithm to use for signing JWT tokens.
     * Example: 'HS256' for HMAC or 'RS256' for RSA.
     */
    algorithm?: 'HS256' | 'RS256';
    /**
     * If using RS256, the path to the public key file for verifying tokens.
     */
    publicKeyPath?: string;
    /**
     * If using RS256, the path to the private key file for signing tokens.
     */
    privateKeyPath?: string;
  };
  /**
   * Additional security measures to enhance token management.
   */
  security?: {
    /**
     * The issuer of the token.
     */
    issuer?: string;
    /**
     * The audience for whom the token is intended.
     */
    audience?: string;
  };
}