// providers/oauth/OAuthProviderFactory.ts

import { OAuthProvider } from './OAuthProvider.interface.js';
import { GoogleProvider } from './GoogleProvider.js';
import { FacebookProvider } from './FacebookProvider.js';

interface ProviderConfig {
  type: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Factory for creating OAuthProvider instances based on configuration.
 */
export class OAuthProviderFactory {
  /**
   * Creates an OAuthProvider instance for the specified provider type.
   * @param config The configuration for the OAuth provider.
   * @returns An instance of OAuthProvider.
   * @throws Error if the provider type is not supported.
   */
  public static createProvider(config: ProviderConfig): OAuthProvider {
    if (!config || !config.type) {
      throw new Error('Provider configuration must include a valid type.');
    }
    switch (config.type.toLowerCase()) {
      case 'google':
        return new GoogleProvider(config.clientId, config.clientSecret, config.redirectUri);
      case 'facebook':
        return new FacebookProvider(config.clientId, config.clientSecret, config.redirectUri);
      default:
        throw new Error(`OAuth provider type "${config.type}" is not supported.`);
    }
  }
}
