// tests/utils/crypto.util.test.ts

import { generateRandomToken, hashPassword, verifyPassword } from '../../utils/crypto.util';

describe('Crypto Utility', () => {
  test('generateRandomToken should return a hex string of expected length', () => {
    const token = generateRandomToken(16);
    expect(typeof token).toBe('string');
    expect(token.length).toBe(32); // 16 bytes * 2 characters per byte in hex
  });

  test('hashPassword and verifyPassword should work correctly', async () => {
    const plainPassword = 'Password@123';
    const hash = await hashPassword(plainPassword);
    expect(typeof hash).toBe('string');
    const isValid = await verifyPassword(plainPassword, hash);
    expect(isValid).toBe(true);
  });

  test('verifyPassword should fail for incorrect password', async () => {
    const plainPassword = 'Password@123';
    const wrongPassword = 'WrongPassword';
    const hash = await hashPassword(plainPassword);
    const isValid = await verifyPassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });

  // Run many iterations
  for (let i = 0; i < 20; i++) {
    test(`iteration ${i}: generate and verify random token`, async () => {
      const token = generateRandomToken(20);
      expect(token.length).toBe(40);
    });
  }
});
