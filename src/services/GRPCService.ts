// services/GRPCService.ts

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { UserProfile } from '../interfaces/UserProfile.interface.js';

export interface Credentials {
  email: string;
  password: string;
}

/**
 * GRPCService provides a generic client for calling external gRPC services.
 * It loads the provided proto definition and creates a client for the specified service.
 */
export class GRPCService {
  private client: any;

  /**
   * Constructs a new GRPCService instance.
   *
   * @param host - The gRPC server host.
   * @param port - The gRPC server port.
   * @param protoPath - Path to the proto file.
   * @param packageName - The package name defined in the proto file.
   * @param serviceName - The service name defined in the proto file.
   */
  constructor(host: string, port: number, protoPath: string, packageName: string, serviceName: string) {
    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    const protoPackage = protoDescriptor[packageName] || {};
    const service = (protoPackage as grpc.GrpcObject)[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not found in package ${packageName}.`);
    }
    this.client = new (service as grpc.ServiceClientConstructor)(`${host}:${port}`, grpc.credentials.createInsecure());
  }

  /**
   * Calls a method on the gRPC service.
   *
   * @param method - The method name to call.
   * @param data - The request payload.
   * @returns A promise that resolves to the response from the gRPC service.
   */
  public callUserService(method: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof this.client[method] !== 'function') {
        return reject(new Error(`Method ${method} is not available on the gRPC client.`));
      }
      this.client[method](data, (error: any, response: any) => {
        if (error) {
          return reject(error);
        }
        resolve(response);
      });
    });
  }
    /**
   * Simule l'appel gRPC pour authentifier un utilisateur.
   * En pratique, cette méthode réalisera une communication via gRPC avec un service AuthN.
   */
    async authenticateUser(credentials: Credentials): Promise<UserProfile> {
      // Simulation : utilisateur valide si email et password correspondent aux valeurs attendues.
      if (credentials.email === 'user@example.com' && credentials.password === 'password') {
        // Retourne un profil utilisateur simulé.
        return {
          id: 'user-123',
          email: credentials.email,
          roles: ['USER'],
        };
      }
      // Reject the promise with an error for invalid credentials.
      throw new Error('Invalid credentials');
    }

    /**
     * Example method to get user profile by ID.
     * This is a placeholder for future gRPC calls.
     */
    async getUserProfileById(userId: string): Promise<UserProfile> {
      return {
        id: userId,
        email: 'user@example.com',
        roles: ['USER'],
      };
    }

    /**
     * Retrieves the user profile using the gRPC service.
     * This is a concrete implementation of a future gRPC call.
     */
    async getUserProfile(userId: string): Promise<UserProfile> {
      const data = { userId };
      return this.callUserService('GetUserProfile', data);
    }
  
}
