// tests/services/TokenService.test.ts

import jwt from 'jsonwebtoken';
import { TokenService } from '../../services/TokenService';
import { TokenBlacklist } from '../../tokens/TokenBlacklist';
import { AuthConfig } from '../../interfaces/AuthConfig.interface';

describe('TokenService (HS256)', () => {
  let tokenService: TokenService;
  let tokenBlacklist: TokenBlacklist;
  const authConfig: AuthConfig = {
    jwtSecret: 'secret',
    jwtExpiresIn: '1h',
    refreshTokenSecret: 'refresh-secret',
    refreshTokenExpiresIn: '7d',
  };

  beforeEach(() => {
    tokenBlacklist = new TokenBlacklist();
    tokenService = new TokenService(authConfig, tokenBlacklist);
  });

  test('should generate a valid access token', () => {
    const payload = { userId: '123', roles: ['USER'] };
    const token = tokenService.generateAccessToken(payload);
    expect(token).toBeDefined();
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    expect(decoded).toMatchObject(payload);
  });

  test('should generate a valid refresh token', () => {
    const payload = { userId: '123' };
    const token = tokenService.generateRefreshToken(payload);
    expect(token).toBeDefined();
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    expect(decoded).toMatchObject(payload);
  });

  test('should validate a valid access token', () => {
    const payload = { userId: '123', roles: ['USER'] };
    const token = tokenService.generateAccessToken(payload);
    const result = tokenService.validateAccessToken(token);
    expect(result).toMatchObject(payload);
  });

  test('should throw error for revoked access token', () => {
    const payload = { userId: '123', roles: ['USER'] };
    const token = tokenService.generateAccessToken(payload);
    tokenService.revokeToken(token);
    expect(() => tokenService.validateAccessToken(token)).toThrow('Token has been revoked.');
  });

  test('should decode a token without verification', () => {
    const payload = { userId: '123', roles: ['USER'] };
    const token = tokenService.generateAccessToken(payload);
    const decoded = tokenService.decodeToken(token);
    expect(decoded).toMatchObject(payload);
  });

  test('should throw error for invalid token format', () => {
    expect(() => tokenService.validateAccessToken('invalid.token')).toThrow();
  });

  test('should throw error for expired token', () => {
    // Create a configuration with a short expiration for testing.
    const shortConfig: AuthConfig = {
      jwtSecret: 'secret',
      jwtExpiresIn: '1s',
      refreshTokenSecret: 'refresh-secret',
      refreshTokenExpiresIn: '7d',
    };
    tokenService = new TokenService(shortConfig, tokenBlacklist);
    const payload = { userId: '123' };
    const token = tokenService.generateAccessToken(payload);
    jest.useFakeTimers();
    jest.advanceTimersByTime(1500);
    expect(() => tokenService.validateAccessToken(token)).toThrow();
    jest.useRealTimers();
  });

  // Repeated tests for various payload types
  test('should handle complex payloads', () => {
    const payload = { userId: 'abc', roles: ['ADMIN'], permissions: ['read', 'write'], meta: { ip: '127.0.0.1' } };
    const token = tokenService.generateAccessToken(payload);
    const result = tokenService.validateAccessToken(token);
    expect(result).toMatchObject(payload);
  });

  // Additional tests can be added to cover edge cases...
});
