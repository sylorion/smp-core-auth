// tests/providers/local/LocalAuthProvider.test.ts

import { LocalAuthProvider } from '../../../providers/local/LocalAuthProvider';
import { LocalAuthProviderInterface } from '../../../providers/local/LocalAuthProvider.interface';
import { UserProfile } from '../../../interfaces/UserProfile.interface';

describe('LocalAuthProvider', () => {
  let localAuthProvider: LocalAuthProviderInterface;

  // Dummy gRPC-like client for local auth validation.
  const dummyUserServiceClient = {
    validateUser: jest.fn(async ({ email, password }: { email: string; password: string }): Promise<UserProfile> => {
      if (email === 'valid@example.com' && password === 'validPassword') {
        return { id: 'user-001', email, roles: ['USER'] };
      } else if (email === 'error@example.com') {
        throw new Error('User service error');
      } 
      throw new Error('User service error (invalid credentials)');
    }),
  };

  beforeEach(() => {
    localAuthProvider = new LocalAuthProvider(dummyUserServiceClient);
  });

  describe('constructor', () => {
    test('should throw if userServiceClient is not provided', () => {
      expect(() => new LocalAuthProvider(null as any)).toThrow('UserServiceClient is required for LocalAuthProvider.');
    });
  });

  describe('validateUser', () => {
    test('should return a user profile for valid credentials', async () => {
      const user = await localAuthProvider.validateUser('valid@example.com', 'validPassword');
      expect(user).toEqual({ id: 'user-001', email: 'valid@example.com', roles: ['USER'] });
      expect(dummyUserServiceClient.validateUser).toHaveBeenCalledWith({ email: 'valid@example.com', password: 'validPassword' });
    });

    test('should return null for invalid credentials', async () => {
      const user = await localAuthProvider.validateUser('invalid@example.com', 'wrongPassword');
      expect(user).toBeNull();
    });

    test('should throw a generic error if user service call fails', async () => {
      await expect(localAuthProvider.validateUser('error@example.com', 'anyPassword')).rejects.toThrow('Local authentication failed.');
    });

    // Simulate hundreds of test cases with test.each.
    test.each(
      Array.from({ length: 50 }, (_, i) => [
        `user${i}@example.com`,
        'wrongPassword',
        null,
      ])
    )('iteration %s should return null for invalid credentials', async (email, password, expected) => {
      const user = await localAuthProvider.validateUser(email, password);
      expect(user).toEqual(expected);
    });
  });
});
