// tests/tokens/RefreshTokenManager.test.ts

import jwt from 'jsonwebtoken';
import { RefreshTokenManager, RefreshTokenManagerOptions } from '../../tokens/RefreshTokenManager';

describe('RefreshTokenManager (HS256)', () => {
  const secret = 'refreshsecret';
  const expiresIn = '7d';
  let refreshManager: RefreshTokenManager;

  beforeEach(() => {
    const options: RefreshTokenManagerOptions = {
      secretOrPrivateKey: secret,
      expiresIn,
      algorithm: 'HS256',
    };
    refreshManager = new RefreshTokenManager(options);
  });

  test('should create and verify a refresh token', () => {
    const payload = { userId: '789' };
    const token = refreshManager.createRefreshToken(payload);
    expect(typeof token).toBe('string');
    const decoded = refreshManager.verifyRefreshToken(token);
    expect(decoded).toMatchObject(payload);
  });

  test('should decode refresh token without verifying signature', () => {
    const payload = { userId: '789', extra: 'data' };
    const token = refreshManager.createRefreshToken(payload);
    const decoded = refreshManager.decodeToken(token);
    expect(decoded).toMatchObject(payload);
  });

  test('should throw an error for an invalid refresh token', () => {
    expect(() => refreshManager.verifyRefreshToken('invalid.token')).toThrow();
  });

  test.each(
    Array.from({ length: 25 }, (_, i) => [{ user: `user-${i}`, num: i }])
  )('should create and verify refresh token for payload %o', (payload) => {
    const token = refreshManager.createRefreshToken(payload);
    const decoded = refreshManager.verifyRefreshToken(token);
    expect(decoded).toMatchObject(payload);
  });

  for (let i = 0; i < 10; i++) {
    test(`HS256 refresh iteration ${i}`, () => {
      const payload = { iter: i, random: Math.random() };
      const token = refreshManager.createRefreshToken(payload);
      const decoded = refreshManager.decodeToken(token);
      expect(decoded).toMatchObject(payload);
    });
  }
});

describe('RefreshTokenManager (RS256)', () => {
  const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQC6K3x0i6UpR3K8p7O1Ql3zrB9PKf3rF4jv8miVvYCl6q4K/RKU
CbfSSQ4O2zN8MRnFA5fhKy2PrykslOVK+Q4J9D8v6MU2oS3hGozC2L9JoK1H2V+f
pUeOeP6sRrG3xwY9L5NVSl0sKX5+F/3Uu8t5ZsQFJ7Kw2GmryeS4ULJt8wIDAQAB
AoGBAKZs7Pym67N6a2sp0F5ZD7g+eT9Cz0BSH1b3uST0vCT6lyuBp+8Q/qN9Hu4L
4z95QGdH3MmyFnyyHPG0bbgSx3EcHjiv5hb3vOa8Kiq+JJj9G0E1kaFPvl6bCmVd
bK2hOZlnR9f/owWDz7fXXI3TxjZ98ES+V1e2zGkJm7psnLvhAkEA7BfGcoAYB+vG
A9sEDZFU3VxBJ8uWXzGASfwhcVslFBY8UYoI3AwL2yKrMJf6xmpDHAGHhmdLXR5I
p8B3MqWWZwJBANtSAg8P9S8xR6ZyGvtn4X1dujH0aQjtYF5Y++Uy7x7N8Rp2NrmT
1yd2uP0EJskHwk+GZ6z+7fRItxMyr7jvY8MCQQC9vKy09VpDVqWkLzK81qZ8hcNU
1kAG4HdI1B2uYdXf3PZJxX5nqCxR8Lk0mA0yN2IfIlzNXRcP+VcGFcOVxDPlAkAg
jZP0Aw9YIYEk79oZ1+8uj0JvjHI1AfcFeZ6kkCPbqX2wz2U/CtOcyzdnM8wKX+YU
+jk7yyvOeFo6QhAXnW0zAkA3zQfBGeozX9kSY0w6usWL7Y/lR1U59u7Bx/8Mx17P
uRZzLLa4YfwCb7H0/ig/HFLlxITeHywZDQYf/dH8Zayh
-----END RSA PRIVATE KEY-----`;

  const publicKey = `-----BEGIN PUBLIC KEY-----
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgQC6K3x0i6UpR3K8p7O1Ql3zrB9P
Kf3rF4jv8miVvYCl6q4K/RKUCbfSSQ4O2zN8MRnFA5fhKy2PrykslOVK+Q4J9D8v
6MU2oS3hGozC2L9JoK1H2V+fpUeOeP6sRrG3xwY9L5NVSl0sKX5+F/3Uu8t5ZsQF
J7Kw2GmryeS4ULJt8wIDAQAB
-----END PUBLIC KEY-----`;
  const expiresIn = '10d';

  let refreshManager: RefreshTokenManager;

  beforeEach(() => {
    const options: RefreshTokenManagerOptions = {
      secretOrPrivateKey: privateKey,
      publicKey,
      expiresIn,
      algorithm: 'RS256',
    };
    refreshManager = new RefreshTokenManager(options);
  });

  test('should create and verify an RS256 refresh token', () => {
    const payload = { userId: 'rs-refresh', role: 'USER' };
    const token = refreshManager.createRefreshToken(payload);
    expect(typeof token).toBe('string');
    const decoded = refreshManager.verifyRefreshToken(token);
    expect(decoded).toMatchObject(payload);
  });

  test('should decode an RS256 refresh token without verifying signature', () => {
    const payload = { userId: 'rs-refresh', extra: 'info' };
    const token = refreshManager.createRefreshToken(payload);
    const decoded = refreshManager.decodeToken(token);
    expect(decoded).toMatchObject(payload);
  });

  test.each(
    Array.from({ length: 15 }, (_, i) => [{ index: i, data: `value-${i}` }])
  )('should create and verify refresh token for payload %o', (payload) => {
    const token = refreshManager.createRefreshToken(payload);
    const decoded = refreshManager.verifyRefreshToken(token);
    expect(decoded).toMatchObject(payload);
  });
});
