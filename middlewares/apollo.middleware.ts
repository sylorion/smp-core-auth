// middlewares/apollo.middleware.ts

import { Request } from 'express';
import { AuthenticationError } from 'apollo-server-errors';
import { TokenService } from '../services/TokenService';

/**
 * Apollo Server context middleware.
 * Extracts the token from the Authorization header and verifies it using the provided TokenService.
 * Attaches the user payload to the context if the token is valid.
 *
 * Usage (e.g., in Apollo Server configuration):
 * 
 *   new ApolloServer({
 *     context: async ({ req }) => await apolloAuthMiddleware({ req }, tokenService),
 *     ...
 *   });
 *
 * @param param0 - An object containing the Express request.
 * @param tokenService - An instance of TokenService used to validate tokens.
 * @returns A promise resolving to the context object with a user property if authenticated.
 */
export async function apolloAuthMiddleware(
  { req }: { req: Request },
  tokenService: TokenService
): Promise<{ user?: any }> {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      const token = parts[1];
      try {
        const payload = tokenService.validateAccessToken(token);
        return { user: payload };
      } catch (error) {
        throw new AuthenticationError(
          error instanceof Error ? error.message : 'Unauthorized.'
        );
      }
    } else {
      throw new AuthenticationError('Invalid Authorization header format. Expected "Bearer <token>".');
    }
  }
  // No token provided: return an empty context (or optionally, throw an error if auth is required)
  return {};
}
