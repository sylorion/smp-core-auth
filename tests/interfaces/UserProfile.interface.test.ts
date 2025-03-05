// tests/interfaces/UserProfile.interface.test.ts

// Since TypeScript interfaces do not exist at runtime, we can only test by verifying that
// sample objects conform to the expected structure.

import { UserProfile } from '../../interfaces/UserProfile.interface';

describe('UserProfile Interface', () => {
  // A helper function to simulate type-checking at runtime.
  const isValidUserProfile = (obj: any): obj is UserProfile => {
    return typeof obj.id === 'string' && typeof obj.email === 'string';
  };

  test('should accept a valid user profile object', () => {
    const user: UserProfile = { id: 'user-1', email: 'user@example.com', roles: ['USER'], extra: 'data' };
    expect(isValidUserProfile(user)).toBe(true);
  });

  test.each(
    Array.from({ length: 20 }, (_, i) => [{ id: `user-${i}`, email: `user${i}@example.com`, roles: ['USER'] }])
  )('iteration %#: user profile is valid', (user) => {
    expect(isValidUserProfile(user)).toBe(true);
  });

  test('should reject an object missing required fields', () => {
    const invalidUser = { email: 'user@example.com' };
    expect(isValidUserProfile(invalidUser)).toBe(false);
  });
});
