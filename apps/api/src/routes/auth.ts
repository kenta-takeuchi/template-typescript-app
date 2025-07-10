import { FastifyPluginAsync } from 'fastify';

export const authRoutes: FastifyPluginAsync = async fastify => {
  // Login endpoint
  fastify.post('/login', async (request, reply) => {
    return {
      success: true,
      data: {
        message: 'Hello from Auth Login!',
        timestamp: new Date().toISOString(),
      },
    };
  });

  // Logout endpoint
  fastify.post('/logout', async (request, reply) => {
    return {
      success: true,
      data: {
        message: 'Hello from Auth Logout!',
        timestamp: new Date().toISOString(),
      },
    };
  });

  // Token refresh endpoint
  fastify.post('/refresh', async (request, reply) => {
    return {
      success: true,
      data: {
        message: 'Hello from Auth Refresh!',
        timestamp: new Date().toISOString(),
      },
    };
  });

  // Current user endpoint
  fastify.get(
    '/me',
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      return {
        success: true,
        data: {
          message: 'Hello from Auth Me!',
          user: request.user || null,
          timestamp: new Date().toISOString(),
        },
      };
    }
  );
};
