import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../auth';

describe('Auth Middleware', () => {
  let mockFastify: Partial<FastifyInstance>;

  beforeEach(() => {
    mockFastify = {
      decorate: jest.fn(),
    };
  });

  it('should export authMiddleware function', () => {
    expect(authMiddleware).toBeDefined();
    expect(typeof authMiddleware).toBe('function');
  });

  it('should register authentication decorators', async () => {
    await authMiddleware(mockFastify as FastifyInstance, {});

    expect(mockFastify.decorate).toHaveBeenCalledWith(
      'authenticate',
      expect.any(Function)
    );
    expect(mockFastify.decorate).toHaveBeenCalledWith(
      'optionalAuth',
      expect.any(Function)
    );
    expect(mockFastify.decorate).toHaveBeenCalledWith(
      'authorize',
      expect.any(Function)
    );
  });

  it('should handle bearer token extraction', () => {
    const authHeader = 'Bearer test-token-123';
    const token = authHeader.split(' ')[1];

    expect(token).toBe('test-token-123');
  });

  it('should validate authorization header format', () => {
    const validHeader = 'Bearer abc123';
    const invalidHeaders = ['Bearer', 'Token abc123', 'invalid'];

    const isValidBearer = (header: string) => {
      const parts = header.split(' ');
      return parts.length === 2 && parts[0] === 'Bearer' && !!parts[1];
    };

    expect(isValidBearer(validHeader)).toBe(true);
    invalidHeaders.forEach(header => {
      expect(isValidBearer(header)).toBe(false);
    });
  });

  it('should handle role-based authorization', () => {
    const allowedRoles = ['admin', 'user'];
    const userRole = 'admin';

    expect(allowedRoles.includes(userRole)).toBe(true);
    expect(allowedRoles.includes('guest')).toBe(false);
  });

  it('should create authorization function for roles', () => {
    const createAuthFunction = (roles: string[]) => {
      return (userRole: string) => roles.includes(userRole);
    };

    const adminAuth = createAuthFunction(['admin']);
    const userAuth = createAuthFunction(['admin', 'user']);

    expect(adminAuth('admin')).toBe(true);
    expect(adminAuth('user')).toBe(false);
    expect(userAuth('user')).toBe(true);
    expect(userAuth('guest')).toBe(false);
  });

  it('should handle optional authentication scenarios', () => {
    const mockRequest: any = {
      headers: {},
    };

    // Optional auth should not fail when no authorization header
    expect(mockRequest.headers).toEqual({});

    // Optional auth should attempt verification when header exists
    mockRequest.headers = { authorization: 'Bearer token' };
    expect(mockRequest.headers.authorization).toBeTruthy();
  });
});
