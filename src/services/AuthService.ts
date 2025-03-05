// services/AuthService.ts

import { TokenService } from './TokenService.js';
import { CacheService } from './CacheService.js';  
import { GRPCService, Credentials } from './GRPCService.js';
import { UserProfile } from '../interfaces/UserProfile.interface.js';
import { LocalAuthProviderInterface } from '../providers/local/LocalAuthProvider.interface.js';

export interface AuthServiceConfig {
  tokenService: TokenService;
  cacheService: CacheService;
  grpcService: GRPCService;
  localAuthProvider?: LocalAuthProviderInterface;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private tokenService: TokenService;
  private cacheService: CacheService;
  private grpcService: GRPCService;
  private localAuthProvider?: LocalAuthProviderInterface; 

  constructor(config: AuthServiceConfig) {
    this.tokenService       = config.tokenService;
    this.cacheService       = config.cacheService;
    this.grpcService        = config.grpcService;
    this.cacheService       = config.cacheService ?? new CacheService(); 
    this.localAuthProvider  = config.localAuthProvider;
  }

  /**
   * Authentifie un utilisateur via GRPC et génère les tokens JWT.
   */
  async login(credentials: Credentials): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    // Appel au service gRPC pour authentifier l'utilisateur.
    const user = await this.grpcService.authenticateUser(credentials);

    // Création d'un payload pour le JWT.
    const payload = { userId: user.id, email: user.email, roles: user.roles };

    // Génération des tokens.
    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    // Exemple de stockage en cache du refresh token avec TTL (ici, 7 jours).
    await this.cacheService.set(`refreshToken:${user.id}`, refreshToken, 7 * 24 * 3600);

    return { user, tokens: { accessToken, refreshToken } };
  }

  /**
   * Permet de rafraîchir le token d'accès à partir d'un refresh token valide.
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // Vérification du refresh token
    let payload: any;
    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }

    // Optionnel : vérifier que le refresh token est toujours valide dans le cache
    const cachedToken = await this.cacheService.get(`refreshToken:${payload.userId}`);
    if (cachedToken !== refreshToken) {
      throw new Error('Refresh token revoked or expired');
    }

    // Générer un nouveau token d'accès
    const newAccessToken = this.tokenService.generateAccessToken(payload);
    // Pour ce prototype, nous renvoyons le même refresh token.
    return { accessToken: newAccessToken, refreshToken };
  }

  /**
   * Révoque le refresh token d'un utilisateur pour une déconnexion globale.
   */
  async logout(userId: string): Promise<void> {
    await this.cacheService.delete(`refreshToken:${userId}`);
    // D'autres actions de révocation (ex. blacklist des JWT) peuvent être implémentées ici.
  }

  /**
   * Authenticates a user locally (e.g., using email and password).
   * Delegates credential validation to an external service via the LocalAuthProvider.
   * Issues both access and refresh tokens on success.
   */
  async authenticateLocal(email: string, password: string): Promise<{
    user: UserProfile;
    accessToken: string;
    refreshToken: string;
  }> {
    // Validate user credentials via the external service
    const user = await this.localAuthProvider?.validateUser(email, password);
    if (!user) {
      throw new Error('Invalid credentials provided.');
    }

    // Generate tokens with payload containing user ID and roles
    const accessToken = this.tokenService.generateAccessToken({ userId: user.id, roles: user.roles });
    const refreshToken = this.tokenService.generateRefreshToken({ userId: user.id });

    // Optionally, store refresh token or user session in cache (e.g., for throttling)
    await this.cacheService.set(`refresh_${user.id}`, refreshToken, 60 * 60 * 24 * 7); // 7 days

    return { user, accessToken, refreshToken };
  }

  // Méthodes pour l’authentification OAuth et la gestion fine des tokens viendront ultérieurement.
}
