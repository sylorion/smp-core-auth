// index.ts

/**
 * Main export file for the authentication library.
 * 
 * This file aggregates and re-exports all modules, services, utilities,
 * and constants so that consumers can import from a single entry point.
 */

export * from './providers/oauth/OAuthProvider.interface';
export * from './providers/oauth/GoogleProvider';
export * from './providers/oauth/FacebookProvider';
export * from './providers/oauth/OAuthProviderFactory';
export * from './providers/local/LocalAuthProvider.interface';
export * from './providers/local/LocalAuthProvider';
export * from './services/TokenService';
export * from './services/CacheService';
export * from './services/AuthService';
export * from './services/GRPCService';
export * from './tokens/JWTManager';
export * from './tokens/RefreshTokenManager';
export * from './tokens/TokenBlacklist';
export * from './tokens/JWKSCache';
export * from './interceptors/grpc.interceptor';
export * from './interceptors/rabbitmq.interceptor';
export * from './middlewares/express.middleware';
export * from './middlewares/apollo.middleware';
export * from './interfaces/UserProfile.interface';
export * from './interfaces/AuthConfig.interface';
export * from './utils/crypto.util';
export * from './utils/validation.util';
export * from './constants';
