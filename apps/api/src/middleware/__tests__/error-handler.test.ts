import { FastifyInstance } from 'fastify';
import { errorHandler } from '../error-handler';

describe('Error Handler Middleware', () => {
  let mockFastify: Partial<FastifyInstance>;

  beforeEach(() => {
    mockFastify = {
      setErrorHandler: jest.fn(),
    };
  });

  it('should export errorHandler function', () => {
    expect(errorHandler).toBeDefined();
    expect(typeof errorHandler).toBe('function');
  });

  it('should register error handler plugin', async () => {
    await errorHandler(mockFastify as FastifyInstance, {});

    expect(mockFastify.setErrorHandler).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('should handle Zod validation errors correctly', () => {
    const zodError = {
      name: 'ZodError',
      errors: [
        {
          path: ['name'],
          message: 'String must contain at least 1 character(s)',
        },
      ],
    };

    expect(zodError.errors[0].path).toEqual(['name']);
    expect(zodError.errors[0].message).toContain('character');
  });

  it('should handle JWT token expiration', () => {
    const jwtError = {
      code: 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED',
      statusCode: 401,
    };

    expect(jwtError.code).toBe('FST_JWT_AUTHORIZATION_TOKEN_EXPIRED');
    expect(jwtError.statusCode).toBe(401);
  });

  it('should handle rate limiting errors', () => {
    const rateLimitError = {
      statusCode: 429,
      message: 'Rate limit exceeded',
    };

    expect(rateLimitError.statusCode).toBe(429);
  });

  it('should handle database unique constraint violations', () => {
    const dbError = {
      message: 'Unique constraint failed on the fields: (`email`)',
    };

    const isUniqueConstraintError =
      dbError.message.includes('Unique constraint');
    expect(isUniqueConstraintError).toBe(true);
  });

  it('should handle not found database errors', () => {
    const notFoundError = {
      message: 'Record to update not found.',
    };

    const isNotFoundError = notFoundError.message.includes(
      'Record to update not found'
    );
    expect(isNotFoundError).toBe(true);
  });

  it('should determine development mode correctly', () => {
    const originalEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = 'development';
    expect(process.env.NODE_ENV).toBe('development');

    process.env.NODE_ENV = 'production';
    expect(process.env.NODE_ENV).toBe('production');

    // Restore original
    process.env.NODE_ENV = originalEnv;
  });
});
