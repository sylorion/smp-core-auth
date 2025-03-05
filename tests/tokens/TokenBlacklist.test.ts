// tests/tokens/TokenBlacklist.test.ts

import { TokenBlacklist } from '../../tokens/TokenBlacklist';

describe('TokenBlacklist', () => {
  let blacklist: TokenBlacklist;

  beforeEach(() => {
    blacklist = new TokenBlacklist();
  });

  test('should add a token to the blacklist and detect it', () => {
    const token = 'token123';
    blacklist.add(token);
    expect(blacklist.isBlacklisted(token)).toBe(true);
  });

  test('should return false for a token not added', () => {
    expect(blacklist.isBlacklisted('nonexistent')).toBe(false);
  });

  test('should remove a token from the blacklist', () => {
    const token = 'tokenToRemove';
    blacklist.add(token);
    expect(blacklist.isBlacklisted(token)).toBe(true);
    blacklist.remove(token);
    expect(blacklist.isBlacklisted(token)).toBe(false);
  });

  // Simulate many tokens added
  test('should handle a large number of tokens', () => {
    const tokens = Array.from({ length: 100 }, (_, i) => `token-${i}`);
    tokens.forEach((token) => blacklist.add(token));
    tokens.forEach((token) => {
      expect(blacklist.isBlacklisted(token)).toBe(true);
    });
    // Remove some tokens and verify
    tokens.filter((_, i) => i % 2 === 0).forEach((token) => blacklist.remove(token));
    tokens.forEach((token, i) => {
      if (i % 2 === 0) {
        expect(blacklist.isBlacklisted(token)).toBe(false);
      } else {
        expect(blacklist.isBlacklisted(token)).toBe(true);
      }
    });
  });

  // Run multiple iterations using test.each
  test.each(
    Array.from({ length: 20 }, (_, i) => [`blacklist-test-${i}`])
  )('should blacklist token %s', (token) => {
    blacklist.add(token);
    expect(blacklist.isBlacklisted(token)).toBe(true);
  });
});
