// providers/oauth/FacebookProvider.ts

import axios from 'axios';
import { OAuthProvider } from './OAuthProvider.interface.js';

export class FacebookProvider implements OAuthProvider {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('FacebookProvider requires clientId, clientSecret, and redirectUri.');
    }
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  public getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state,
      response_type: 'code',
      scope: 'email,public_profile',
    });
    return `https://www.facebook.com/v10.0/dialog/oauth?${params.toString()}`;
  }

  public async getToken(code: string): Promise<string> {
    try {
      const tokenUrl = 'https://graph.facebook.com/v10.0/oauth/access_token';
      const params = {
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        client_secret: this.clientSecret,
        code: code,
      };
      const response = await axios.get(tokenUrl, { params });
      if (response.data && response.data.access_token) {
        return response.data.access_token;
      } else {
        throw new Error('No access token returned from Facebook.');
      }
    } catch (error) {
      console.error('Error exchanging code for token with Facebook:', error);
      throw new Error('Failed to obtain access token from Facebook.');
    }
  }

  public async getUserProfile(token: string): Promise<any> {
    try {
      const response = await axios.get('https://graph.facebook.com/me', {
        params: {
          fields: 'id,name,email,picture',
          access_token: token,
        },
      });
      // Normalize the user profile data.
      return {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture?.data?.url,
      };
    } catch (error) {
      console.error('Error fetching user profile from Facebook:', error);
      throw new Error('Failed to fetch user profile from Facebook.');
    }
  }
}
