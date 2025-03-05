// tests/tokens/JWKSCache.test.ts

import { JWKSCache } from '../../tokens/JWKSCache';

describe('JWKSCache', () => {
  let cache: JWKSCache;

  beforeEach(() => {
    cache = new JWKSCache();
  });

  test('should set and retrieve a value before TTL expires', () => {
    cache.set('key1', [{ data: 'value1' }], 5);
    const value = cache.get('key1');
    expect(value).toEqual([{ data: 'value1' }]);
  });

  test('should return null for a non-existent key', () => {
    const value = cache.get('nonexistent');
    expect(value).toBeNull();
  });

  test('should delete a key', () => {
    cache.set('key2', ['value2'], 5);
    cache.delete('key2');
    const value = cache.get('key2');
    expect(value).toBeNull();
  });

  test('should expire a key after TTL', async () => {
    jest.useFakeTimers();
    cache.set('tempKey', ['tempValue'], 1); // TTL = 1 second
    expect(cache.get('tempKey')).toEqual(['tempValue']);
    jest.advanceTimersByTime(1500);
    expect(cache.get('tempKey')).toBeNull();
    jest.useRealTimers();
  });

  // Test repeated set and get operations with many keys.
  test('should handle multiple keys with different TTLs', async () => {
    for (let i = 0; i < 50; i++) {
      cache.set(`key-${i}`, [i], 5 + i);
    }
    for (let i = 0; i < 50; i++) {
      expect(cache.get(`key-${i}`)).toEqual([i]);
    }
  });

  // Data-driven tests using test.each
  test.each(
    Array.from({ length: 20 }, (_, i) => [`dynamic-key-${i}`, i]) // Change from { value: i } to i
  )('should set and get dynamic key %s', (key, value) => {
    cache.set(key, [value], 10);
    expect(cache.get(key)).toEqual([value]);
  });

  // Simulate key update and deletion cycles
  for (let i = 0; i < 10; i++) {
    test(`cycle iteration ${i} for key update and deletion`, () => {
      const key = `cycle-key-${i}`;
      cache.set(key, [i], 10);
      expect(cache.get(key)).toEqual([i]);
      cache.set(key, [i * 2], 10);
      expect(cache.get(key)).toEqual([i * 2]);
      cache.delete(key);
      expect(cache.get(key)).toBeNull();
    });
  }

  test('should update the key value correctly', () => {
    const key = 'update-key';
    cache.set(key, [1], 10);
    expect(cache.get(key)).toEqual([1]);
    cache.set(key, [2], 10);
    expect(cache.get(key)).toEqual([2]);
    cache.delete(key);
    expect(cache.get(key)).toBeNull();
  });


  test('should update key value before expiration', () => {
    const key = 'expiring-key';
    cache.set(key, [100], 5);
    expect(cache.get(key)).toEqual([100]);
    cache.set(key, [200], 5);
    expect(cache.get(key)).toEqual([200]);
  });
});
