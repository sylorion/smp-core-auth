// tests/services/CacheService.test.ts

import { CacheService } from '../../services/CacheService';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    // Instantiate the cache with in-memory fallback.
    cache = new CacheService();
  });

  test('should set and get a value', async () => {
    await cache.set('testKey', { data: 'test' });
    const value = await cache.get('testKey');
    expect(value).toEqual({ data: 'test' });
  });

  test('should return null for a non-existent key', async () => {
    const value = await cache.get('nonexistent');
    expect(value).toBeNull();
  });

  test('should delete a key', async () => {
    await cache.set('testKey', 'value');
    await cache.delete('testKey');
    const value = await cache.get('testKey');
    expect(value).toBeNull();
  });

  test('should expire a key after TTL', async () => {
    jest.useFakeTimers();
    await cache.set('tempKey', 'tempValue', 1); // TTL = 1 second
    expect(await cache.get('tempKey')).toEqual('tempValue');
    jest.advanceTimersByTime(1500);
    expect(await cache.get('tempKey')).toBeNull();
    jest.useRealTimers();
  });

  test('should override existing key', async () => {
    await cache.set('key', 'value1');
    await cache.set('key', 'value2');
    const value = await cache.get('key');
    expect(value).toEqual('value2');
  });

  test('should work with multiple keys concurrently', async () => {
    await cache.set('key1', 1);
    await cache.set('key2', 2);
    await cache.set('key3', 3);
    expect(await cache.get('key1')).toEqual(1);
    expect(await cache.get('key2')).toEqual(2);
    expect(await cache.get('key3')).toEqual(3);
  });

  // More tests could simulate Redis behavior by injecting a Redis config and mocking ioredis methods.
});
