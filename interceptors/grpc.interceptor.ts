// interceptors/grpc.interceptor.ts

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ServerUnaryCall } from '@grpc/grpc-js';
import { TokenService } from '../services/TokenService';

/**
 * gRPC interceptor for unary calls.
 * 
 * This interceptor:
 * - Extracts the "authorization" metadata header.
 * - Validates the JWT using the provided TokenService.
 * - Attaches the decoded payload to the request object (as `user`).
 * - Logs success and error events.
 *
 * @param tokenService - An instance of TokenService.
 * @returns An interceptor function that wraps a unary call.
 */
export function grpcAuthInterceptor<T>(
  tokenService: TokenService
) {
  return (
    call: ServerUnaryCall<any, any>,
    next: (call: ServerUnaryCall<any, any>) => Observable<T>
  ): Observable<T> => {
    try {
      // Retrieve the 'authorization' metadata.
      const authHeader = call.metadata.get('authorization')[0];
      if (!authHeader || typeof authHeader !== 'string') {
        throw new Error("Missing or invalid authorization metadata.");
      }
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        throw new Error("Invalid authorization metadata format. Expected 'Bearer <token>'.");
      }
      const token = parts[1];
      // Validate token and attach payload to the request.
      const payload = tokenService.validateAccessToken(token);
      (call.request as any).user = payload;
    } catch (error) {
      console.error("gRPC auth interceptor error:", error);
      // Rethrow to let the framework handle the error (e.g., returning an error status).
      throw error;
    }
    
    // Call the next handler and log outcome.
    return next(call).pipe(
      tap({
        next: (data: any) => console.log("gRPC call succeeded:", data),
        error: (err: any) => console.error("gRPC call failed:", err)
      })
    );
  };
}
