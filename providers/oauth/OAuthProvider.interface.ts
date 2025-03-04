// providers/oauth/OAuthProvider.interface.ts

/**
 * Interface defining the contract for an OAuth2/OpenID Connect provider.
 */
export interface OAuthProvider {
  /**
   * Constructs the URL used to redirect the user for authentication.
   * @param state A state parameter to mitigate CSRF.
   * @returns The full authorization URL.
   */
  getAuthorizationUrl(state: string): string;

  /**
   * Exchanges an authorization code for an access token.
   * @param code The authorization code received from the provider.
   * @returns A Promise resolving to the access token.
   */
  getToken(code: string): Promise<string>;

  /**
   * Retrieves and normalizes the user profile from the provider.
   * @param token The access token.
   * @returns A Promise resolving to the user profile.
   */
  getUserProfile(token: string): Promise<any>;
}
