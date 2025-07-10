// Jest setup file for API tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890123456789012';
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/template_test';
process.env.FIREBASE_PROJECT_ID = 'test-project';

// Mock external services
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: 'test-user-id',
      email: 'test@example.com',
    }),
  }),
}));

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}));

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    job: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

// Global test utilities
global.testUtils = {
  createMockRequest: (overrides = {}) => ({
    headers: {},
    query: {},
    params: {},
    body: {},
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
    },
    ...overrides,
  }),

  createMockReply: () => {
    return {
      code: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
    };
  },
};

// Increase timeout for integration tests
jest.setTimeout(30000);
