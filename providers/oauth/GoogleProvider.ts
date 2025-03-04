// providers/oauth/GoogleProvider.ts

import axios from 'axios';
import { OAuthProvider } from './OAuthProvider.interface';

export class GoogleProvider implements OAuthProvider {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('GoogleProvider requires clientId, clientSecret, and redirectUri.');
    }
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  public getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state: state,
      access_type: 'offline',
      prompt: 'consent'
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  public async getToken(code: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code'
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
      if (response.data && response.data.access_token) {
        return response.data.access_token;
      } else {
        throw new Error('No access token returned from Google.');
      }
    } catch (error) {
      console.error('Error exchanging code for token with Google:', error);
      throw new Error('Failed to obtain access token from Google.');
    }
  }

  public async getUserProfile(token: string): Promise<any> {
    try {
      const response = await axios.get('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Normalize the user profile data.
      return {
        id: response.data.sub,
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture,
      };
    } catch (error) {
      console.error('Error fetching user profile from Google:', error);
      throw new Error('Failed to fetch user profile from Google.');
    }
  }
}
