// tests/interfaces/AuthConfig.interface.test.ts

import { AuthConfig } from '../../interfaces/AuthConfig.interface';

describe('AuthConfig Interface', () => {
  // Since interfaces don't exist at runtime, we simulate checks using a helper function.
  const isValidAuthConfig = (cfg: any): cfg is AuthConfig => {
    return typeof cfg.jwtSecret === 'string'
      && typeof cfg.jwtExpiresIn === 'string'
      && typeof cfg.refreshTokenSecret === 'string'
      && typeof cfg.refreshTokenExpiresIn === 'string';
  };

  test('should accept a valid AuthConfig object', () => {
    const config: AuthConfig = {
      jwtSecret: 'secret',
      jwtExpiresIn: '15m',
      refreshTokenSecret: 'refresh-secret',
      refreshTokenExpiresIn: '7d',
      oauthProviders: {
        google: {
          clientId: 'google-id',
          clientSecret: 'google-secret',
          redirectUri: 'http://localhost/google',
        },
      },
      cache: { host: 'localhost', port: 6379 },
      grpc: { host: 'localhost', port: 50051 },
      localAuth: { userServiceUrl: 'http://localhost/auth' },
      token: { algorithm: 'HS256' },
    };
    expect(isValidAuthConfig(config)).toBe(true);
  });

  test.each(
    Array.from({ length: 20 }, (_, i) => [{
      jwtSecret: `secret${i}`,
      jwtExpiresIn: '15m',
      refreshTokenSecret: `refresh${i}`,
      refreshTokenExpiresIn: '7d',
    }])
  )('iteration %#: should validate auth config object', (config) => {
    expect(isValidAuthConfig(config)).toBe(true);
  });

  test('should reject invalid auth config missing required fields', () => {
    const invalidConfig = { jwtExpiresIn: '15m', refreshTokenExpiresIn: '7d' };
    expect(isValidAuthConfig(invalidConfig)).toBe(false);
  });
});
