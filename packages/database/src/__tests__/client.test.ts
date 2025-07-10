// Set up test environment variables before any imports
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test';

// Mock Prisma Client
const mockPrismaClient = {
  $on: jest.fn(),
  $disconnect: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));

import {
  createDatabaseClient,
  getDatabaseClient,
  closeDatabaseConnection,
} from '../client';

describe('Database Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset global client
    if (typeof globalThis !== 'undefined') {
      globalThis.__template_db_client = undefined;
    }
  });

  describe('createDatabaseClient', () => {
    it('should create a new client with default config', () => {
      const client = createDatabaseClient();
      expect(client).toBeDefined();
    });

    it('should throw error when no database URL is provided', () => {
      delete process.env.DATABASE_URL;

      expect(() => {
        createDatabaseClient({});
      }).toThrow('Database URL is required');

      // Restore for other tests
      process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test';
    });

    it('should use provided database URL', () => {
      const testUrl = 'mysql://test:test@localhost:3306/test';
      const _client = createDatabaseClient({ url: testUrl });
      expect(_client).toBeDefined();
    });

    it('should create client with logging enabled', () => {
      const _client = createDatabaseClient({ enableLogging: true });
      expect(_client).toBeDefined();
    });

    it('should create client with logging disabled', () => {
      const _client = createDatabaseClient({ enableLogging: false });
      expect(_client).toBeDefined();
    });
  });

  describe('getDatabaseClient', () => {
    it('should return singleton instance', () => {
      const client1 = getDatabaseClient();
      const client2 = getDatabaseClient();

      expect(client1).toBe(client2);
    });
  });

  describe('closeDatabaseConnection', () => {
    it('should disconnect client and clear global', async () => {
      // Create a client first
      getDatabaseClient();

      await closeDatabaseConnection();

      expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
    });

    it('should handle case when no global client exists', async () => {
      await expect(closeDatabaseConnection()).resolves.not.toThrow();
    });
  });
});
