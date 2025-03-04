// providers/local/LocalAuthProvider.ts

import { LocalAuthProviderInterface } from './LocalAuthProvider.interface';
import { UserProfile } from '../../interfaces/UserProfile.interface';

/**
 * A production-ready local authentication provider.
 *
 * This implementation delegates user validation to an external authentication service
 * (communicated via a gRPC client). The gRPC client should implement a method `validateUser`
 * that accepts an object with email and password properties and returns a Promise resolving
 * to a user profile (or throws an error if validation fails).
 */
export class LocalAuthProvider implements LocalAuthProviderInterface {
  private userServiceClient: {
    validateUser: (credentials: { email: string; password: string }) => Promise<UserProfile>;
  };

  /**
   * Constructs a LocalAuthProvider instance.
   *
   * @param userServiceClient - A gRPC client instance for the external user service.
   * @throws Error if the userServiceClient is not provided.
   */
  constructor(userServiceClient: {
    validateUser: (credentials: { email: string; password: string }) => Promise<UserProfile>;
  }) {
    if (!userServiceClient) {
      throw new Error('UserServiceClient is required for LocalAuthProvider.');
    }
    this.userServiceClient = userServiceClient;
  }

  /**
   * Validates the user's email and password by delegating to the external user service.
   *
   * @param email - The user's email.
   * @param password - The user's plain text password.
   * @returns A Promise resolving with the user profile if the credentials are valid, or null otherwise.
   *
   * @throws Error if the external service call fails.
   */
  async validateUser(email: string, password: string): Promise<UserProfile> {
    try {
      // Call the external user service via gRPC.
      const user: UserProfile = await this.userServiceClient.validateUser({ email, password });
      // Validate that the returned user object contains essential information.
      if (user && user.id && user.email) {
        return user;
      } 
      throw new Error('Local authentication failed.');
    } catch (error) {
      // Log the error for debugging and rethrow a generic error message.
      console.error('Error validating local user:', error);
      throw new Error('Local authentication failed.');
    }
  }
}
