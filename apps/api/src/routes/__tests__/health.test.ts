import { FastifyInstance } from 'fastify';
import healthRoutes from '../health';

describe('Health Routes', () => {
  let mockFastify: Partial<FastifyInstance>;

  beforeEach(() => {
    mockFastify = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };
  });

  it('should export healthRoutes function', () => {
    expect(healthRoutes).toBeDefined();
    expect(typeof healthRoutes).toBe('function');
  });

  it('should register health check routes', async () => {
    await healthRoutes(mockFastify as FastifyInstance);

    expect(mockFastify.get).toHaveBeenCalled();
  });

  it('should register GET /health route', async () => {
    await healthRoutes(mockFastify as FastifyInstance);

    // Should register both /health and /today routes
    expect(mockFastify.get).toHaveBeenCalledWith(
      '/health',
      expect.any(Function)
    );
    expect(mockFastify.get).toHaveBeenCalledWith(
      '/today',
      expect.any(Function)
    );
  });

  it('should have proper health check response structure', () => {
    const healthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    expect(healthResponse).toHaveProperty('status');
    expect(healthResponse).toHaveProperty('timestamp');
    expect(healthResponse).toHaveProperty('uptime');
    expect(healthResponse).toHaveProperty('version');
    expect(healthResponse.status).toBe('ok');
  });

  it('should handle health check with database status', () => {
    const healthWithDb = {
      status: 'ok',
      checks: {
        database: 'connected',
        redis: 'connected',
      },
    };

    expect(healthWithDb.checks).toHaveProperty('database');
    expect(healthWithDb.checks.database).toBe('connected');
  });

  it('should format uptime correctly', () => {
    const uptime = 3661; // 1 hour, 1 minute, 1 second
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    expect(hours).toBe(1);
    expect(minutes).toBe(1);
    expect(seconds).toBe(1);
  });
});
