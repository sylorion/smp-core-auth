// interceptors/rabbitmq.interceptor.ts

import { Message } from 'amqplib';
import { TokenService } from '../services/TokenService';

/**
 * RabbitMQ interceptor for message handling.
 * 
 * This interceptor:
 * - Extracts the "authorization" header from the message properties.
 * - Validates the JWT using the provided TokenService.
 * - Attaches the decoded payload to the message (as `user`).
 * - Logs errors and processing results.
 *
 * @param tokenService - An instance of TokenService.
 * @returns A function that wraps a message handler.
 */
export function rabbitmqInterceptor(tokenService: TokenService) {
  return function (
    handler: (message: Message) => Promise<any>
  ): (message: Message) => Promise<any> {
    return async function (message: Message): Promise<any> {
      try {
        // Extract the 'authorization' header from message properties.
        const headers = message.properties.headers;
        const authHeader = headers?.authorization;
        if (!authHeader || typeof authHeader !== 'string') {
          throw new Error("Missing or invalid authorization header in message properties.");
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
          throw new Error("Invalid authorization header format in message properties. Expected 'Bearer <token>'.");
        }
        const token = parts[1];
        // Validate the token and attach the payload to the message.
        const payload = tokenService.validateAccessToken(token);
        (message as any).user = payload;
      } catch (error) {
        console.error("RabbitMQ interceptor error:", error);
        // Rethrow the error to allow the caller to handle message rejection.
        throw error;
      }
      // Proceed with the original message handler.
      try {
        const result = await handler(message);
        console.log("RabbitMQ message processed successfully:", result);
        return result;
      } catch (error) {
        console.error("Error processing RabbitMQ message:", error);
        throw error;
      }
    };
  };
}
