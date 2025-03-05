// tests/services/GRPCService.test.ts

import { GRPCService } from '../../services/GRPCService';

describe('GRPCService', () => {
  let grpcService: GRPCService;
  const host = 'localhost';
  const port = 50051;
  const protoPath = 'dummy.proto'; // This file is not actually loaded in tests.
  const packageName = 'dummyPackage';
  const serviceName = 'DummyService';

  const dummyResponse = { success: true, data: 'test' };

  beforeEach(() => {
    // Instantiate GRPCService normally.
    grpcService = new GRPCService(host, port, protoPath, packageName, serviceName);
    // Override the internal client with a dummy one.
    (grpcService as any).client = {
      dummyMethod: jest.fn((data: any, callback: (err: any, response: any) => void) => {
        callback(null, dummyResponse);
      }),
    };
  });

  test('should call a valid gRPC method successfully', async () => {
    const response = await grpcService.callUserService('dummyMethod', { test: 'data' });
    expect(response).toEqual(dummyResponse);
    expect((grpcService as any).client.dummyMethod).toHaveBeenCalledWith({ test: 'data' }, expect.any(Function));
  });

  test('should reject if the method does not exist', async () => {
    await expect(grpcService.callUserService('nonExistentMethod', {})).rejects.toThrow('Method nonExistentMethod is not available on the gRPC client.');
  });

  test('should reject if the gRPC call returns an error', async () => {
    (grpcService as any).client.dummyMethod = jest.fn((data: any, callback: (err: any, response: any) => void) => {
      callback(new Error('gRPC error'), null);
    });
    await expect(grpcService.callUserService('dummyMethod', {})).rejects.toThrow('gRPC error');
  });

  // Additional tests to simulate network delays, malformed responses, etc.
});
