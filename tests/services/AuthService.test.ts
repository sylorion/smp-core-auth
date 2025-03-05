// tests/services/AuthService.test.ts

import { AuthService } from '../../services/AuthService';
import { TokenService } from '../../services/TokenService';
import { CacheService } from '../../services/CacheService';
import { TokenBlacklist } from '../../tokens/TokenBlacklist';
import { GRPCService } from '../../services/GRPCService';
import { AuthConfig } from '../../interfaces/AuthConfig.interface';
import { LocalAuthProviderInterface } from '../../providers/local/LocalAuthProvider.interface';

describe('AuthService', () => {
  let authService: AuthService;
  let tokenService: TokenService;
  let cacheService: CacheService;
  let localAuthProvider: LocalAuthProviderInterface;
  let tokenBlacklist: TokenBlacklist;
  let grpcService: GRPCService;
  const authConfig: AuthConfig = {
    jwtSecret: 'secret',
    jwtExpiresIn: '1h',
    refreshTokenSecret: 'refresh-secret',
    refreshTokenExpiresIn: '7d',
  };

  beforeEach(() => {
    tokenBlacklist = new TokenBlacklist();
    tokenService = new TokenService(authConfig, tokenBlacklist);
    cacheService = new CacheService();
    grpcService = new GRPCService("localhost", 5051, "../user.proto", "user", "UserService");
    localAuthProvider = {
      validateUser: jest.fn(async (email: string, password: string) => {
        if (email === 'test@example.com' && password === 'password') {
          return { id: 'user-123', email: 'test@example.com', roles: ['USER'] };
        }
        return null;
      }),
    };
    authService = new AuthService({ tokenService, cacheService, grpcService, localAuthProvider });
  });

  test('should authenticate a user with valid credentials', async () => {
    const result = await authService.authenticateLocal('test@example.com', 'password');
    expect(result.user).toMatchObject({ id: 'user-123', email: 'test@example.com' });
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  test('should throw an error for invalid credentials', async () => {
    await expect(authService.authenticateLocal('wrong@example.com', 'wrongpass')).rejects.toThrow('Invalid credentials provided.');
  });

  test('should store the refresh token in the cache', async () => {
    await authService.authenticateLocal('test@example.com', 'password');
    const cachedToken = await cacheService.get('refresh_user-123');
    expect(cachedToken).toBeDefined();
  });

  test('should call localAuthProvider.validateUser with correct parameters', async () => {
    await authService.authenticateLocal('test@example.com', 'password');
    expect(localAuthProvider.validateUser).toHaveBeenCalledWith('test@example.com', 'password');
  });

  // Additional tests for edge cases, such as missing provider responses or caching errors.
});
