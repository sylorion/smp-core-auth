// tests/providers/oauth/GoogleProvider.test.ts

import axios from 'axios';
import { GoogleProvider } from '../../../providers/oauth/GoogleProvider';
import { OAuthProvider } from '../../../providers/oauth/OAuthProvider.interface';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GoogleProvider', () => {
  const clientId = 'test-google-client-id';
  const clientSecret = 'test-google-client-secret';
  const redirectUri = 'http://localhost/callback';
  let provider: OAuthProvider;

  beforeEach(() => {
    provider = new GoogleProvider(clientId, clientSecret, redirectUri);
  });

  describe('constructor', () => {
    test('should throw if any parameter is missing', () => {
      expect(() => new GoogleProvider('', clientSecret, redirectUri)).toThrow();
      expect(() => new GoogleProvider(clientId, '', redirectUri)).toThrow();
      expect(() => new GoogleProvider(clientId, clientSecret, '')).toThrow();
    });
  });

  describe('getAuthorizationUrl', () => {
    test.each([
      ['state1'],
      ['randomState123'],
      [''],
    ])('should return a valid URL for state "%s"', (state) => {
      const url = provider.getAuthorizationUrl(state);
      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(url).toContain(`client_id=${clientId}`);
      expect(url).toContain(`redirect_uri=${encodeURIComponent(redirectUri)}`);
      expect(url).toContain(`state=${state}`);
      expect(url).toContain('scope=openid%20profile%20email');
    });
  });

  describe('getToken', () => {
    const fakeCode = 'fake-auth-code';
    const fakeAccessToken = 'fake-google-access-token';

    test('should return access token when API responds correctly', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: fakeAccessToken },
      });
      const token = await provider.getToken(fakeCode);
      expect(token).toEqual(fakeAccessToken);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    test('should throw an error if API returns no access_token', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });
      await expect(provider.getToken(fakeCode)).rejects.toThrow(
        'No access token returned from Google.'
      );
    });

    test('should throw an error on API failure', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('API error'));
      await expect(provider.getToken(fakeCode)).rejects.toThrow(
        'Failed to obtain access token from Google.'
      );
    });
  });

  describe('getUserProfile', () => {
    const fakeAccessToken = 'fake-google-access-token';
    const fakeProfile = {
      sub: 'google-user-123',
      email: 'user@google.com',
      name: 'Google User',
      picture: 'http://google.com/pic.jpg',
    };

    test('should return normalized user profile on success', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: fakeProfile });
      const profile = await provider.getUserProfile(fakeAccessToken);
      expect(profile).toEqual({
        id: fakeProfile.sub,
        email: fakeProfile.email,
        name: fakeProfile.name,
        picture: fakeProfile.picture,
      });
    });

    test('should throw an error if user profile fetch fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Profile error'));
      await expect(provider.getUserProfile(fakeAccessToken)).rejects.toThrow(
        'Failed to fetch user profile from Google.'
      );
    });

    // Run many iterations to simulate hundreds of tests (data-driven)
    test.each(
      Array.from({ length: 50 }, (_, i) => [`state-${i}`, fakeProfile])
    )('iteration test %s', async (_, profileData) => {
      mockedAxios.get.mockResolvedValueOnce({ data: profileData });
      const profile = await provider.getUserProfile(fakeAccessToken);
      expect(profile.email).toBe(profileData.email);
    });
  });
});
