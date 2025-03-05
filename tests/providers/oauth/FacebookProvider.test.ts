// tests/providers/oauth/FacebookProvider.test.ts

import axios from 'axios';
import { FacebookProvider } from '../../../providers/oauth/FacebookProvider';
import { OAuthProvider } from '../../../providers/oauth/OAuthProvider.interface';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FacebookProvider', () => {
  const clientId = 'test-facebook-client-id';
  const clientSecret = 'test-facebook-client-secret';
  const redirectUri = 'http://localhost/fb-callback';
  let provider: OAuthProvider;

  beforeEach(() => {
    provider = new FacebookProvider(clientId, clientSecret, redirectUri);
  });

  describe('constructor', () => {
    test('should throw if parameters are missing', () => {
      expect(() => new FacebookProvider('', clientSecret, redirectUri)).toThrow();
      expect(() => new FacebookProvider(clientId, '', redirectUri)).toThrow();
      expect(() => new FacebookProvider(clientId, clientSecret, '')).toThrow();
    });
  });

  describe('getAuthorizationUrl', () => {
    test.each([
      ['fbState1'],
      ['randomFBState'],
      [''],
    ])('should return a valid URL for state "%s"', (state) => {
      const url = provider.getAuthorizationUrl(state);
      expect(url).toContain('https://www.facebook.com/v10.0/dialog/oauth');
      expect(url).toContain(`client_id=${clientId}`);
      expect(url).toContain(`redirect_uri=${encodeURIComponent(redirectUri)}`);
      expect(url).toContain(`state=${state}`);
      expect(url).toContain('scope=email,public_profile');
    });
  });

  describe('getToken', () => {
    const fakeCode = 'fake-fb-code';
    const fakeAccessToken = 'fake-facebook-access-token';

    test('should return access token when API responds correctly', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { access_token: fakeAccessToken },
      });
      const token = await provider.getToken(fakeCode);
      expect(token).toEqual(fakeAccessToken);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    test('should throw an error if API returns no access_token', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });
      await expect(provider.getToken(fakeCode)).rejects.toThrow(
        'No access token returned from Facebook.'
      );
    });

    test('should throw an error on API failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'));
      await expect(provider.getToken(fakeCode)).rejects.toThrow(
        'Failed to obtain access token from Facebook.'
      );
    });
  });

  describe('getUserProfile', () => {
    const fakeAccessToken = 'fake-facebook-access-token';
    const fbProfile = {
      id: 'fb-user-123',
      email: 'user@facebook.com',
      name: 'Facebook User',
      picture: { data: { url: 'http://facebook.com/pic.jpg' } },
    };

    test('should return normalized user profile on success', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: fbProfile });
      const profile = await provider.getUserProfile(fakeAccessToken);
      expect(profile).toEqual({
        id: fbProfile.id,
        email: fbProfile.email,
        name: fbProfile.name,
        picture: fbProfile.picture.data.url,
      });
    });

    test('should throw an error if profile fetch fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Profile error'));
      await expect(provider.getUserProfile(fakeAccessToken)).rejects.toThrow(
        'Failed to fetch user profile from Facebook.'
      );
    });

    // Run multiple iterations to simulate hundreds of tests.
    test.each(
      Array.from({ length: 50 }, (_, i) => [`iteration-${i}`, fbProfile])
    )('iteration test %s', async (_, profileData) => {
      mockedAxios.get.mockResolvedValueOnce({ data: profileData });
      const profile = await provider.getUserProfile(fakeAccessToken);
      expect(profile.id).toBe(profileData.id);
    });
  });
});

