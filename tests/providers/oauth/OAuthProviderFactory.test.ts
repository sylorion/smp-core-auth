// tests/providers/oauth/OAuthProviderFactory.test.ts

import { OAuthProviderFactory } from '../../../providers/oauth/OAuthProviderFactory';
import { GoogleProvider } from '../../../providers/oauth/GoogleProvider';
import { FacebookProvider } from '../../../providers/oauth/FacebookProvider';

describe('OAuthProviderFactory', () => {
  const googleConfig = {
    type: 'google',
    clientId: 'google-client-id',
    clientSecret: 'google-client-secret',
    redirectUri: 'http://localhost/google-callback',
  };

  const facebookConfig = {
    type: 'facebook',
    clientId: 'facebook-client-id',
    clientSecret: 'facebook-client-secret',
    redirectUri: 'http://localhost/facebook-callback',
  };

  test('should create a GoogleProvider for type "google"', () => {
    const provider = OAuthProviderFactory.createProvider(googleConfig);
    expect(provider).toBeInstanceOf(GoogleProvider);
  });

  test('should create a FacebookProvider for type "facebook"', () => {
    const provider = OAuthProviderFactory.createProvider(facebookConfig);
    expect(provider).toBeInstanceOf(FacebookProvider);
  });

  test('should throw an error for unsupported provider type', () => {
    expect(() =>
      OAuthProviderFactory.createProvider({
        type: 'unknown',
        clientId: 'x',
        clientSecret: 'y',
        redirectUri: 'http://localhost',
      })
    ).toThrow('OAuth provider type "unknown" is not supported.');
  });

  // Repeat tests with varying case sensitivity.
  test.each([
    ['Google', GoogleProvider],
    ['FACEBOOK', FacebookProvider],
    ['gOoGlE', GoogleProvider],
  ])('should create correct provider for type "%s"', (type, expected) => {
    const provider = OAuthProviderFactory.createProvider({
      type,
      clientId: 'id',
      clientSecret: 'secret',
      redirectUri: 'http://localhost',
    });
    expect(provider).toBeInstanceOf(expected);
  });
});

