// providers/local/LocalAuthProvider.interface.ts
import { UserProfile } from '../../interfaces/UserProfile.interface.js';

/**
 * Interface for the local authentication provider.
 *
 * This provider is responsible for validating a user's email and password
 * via an external authentication service (e.g. using gRPC).
 */
export interface LocalAuthProviderInterface {
  /**
   * Validates user credentials using an external service.
   *
   * @param email - The user's email address.
   * @param password - The user's plain text password.
   * @returns A promise that resolves with the user profile if the credentials are valid, or null otherwise.
   */
  validateUser(email: string, password: string): Promise<UserProfile | null>;
}
