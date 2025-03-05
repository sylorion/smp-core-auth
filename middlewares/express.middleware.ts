// middlewares/express.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/TokenService';

/**
 * Returns an Express middleware that validates the JWT from the Authorization header.
 * If valid, the decoded payload is attached to req.user.
 *
 * @param tokenService - An instance of TokenService used to validate tokens.
 * @returns Express middleware function.
 */
export function expressAuthMiddleware(tokenService: TokenService): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      if (!authHeader) {
        const rt = res.status(401).json({ message: 'Missing Authorization header.' });
        return rt;
      }
      const parts = (typeof authHeader === 'string' ? authHeader.split(' ') : (Array.isArray(authHeader) && authHeader.length > 0 ? authHeader[0].split(' ') : []));
      if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return res.status(401).json({
          message: 'Invalid Authorization header format. Expected "Bearer <token>".',
        });
      }

      const token = parts[1];
      const payload = tokenService.validateAccessToken(token);
      // Attach payload (e.g., user data) to the request object
      (req as any).user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ message: err instanceof Error ? err.message : 'Unauthorized.' });
    }
  };
}
