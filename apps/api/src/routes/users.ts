import { FastifyPluginAsync } from 'fastify';

export const userRoutes: FastifyPluginAsync = async fastify => {
  // Get all users
  fastify.get(
    '/',
    {
      preHandler: fastify.authorize(['agent', 'admin']),
    },
    async (request, reply) => {
      return {
        success: true,
        data: {
          message: 'Hello from Users List!',
          users: [],
          timestamp: new Date().toISOString(),
        },
      };
    }
  );

  // Get user by ID
  fastify.get(
    '/:id',
    {
      preHandler: fastify.optionalAuth,
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      return {
        success: true,
        data: {
          message: `Hello from User ${id}!`,
          userId: id,
          timestamp: new Date().toISOString(),
        },
      };
    }
  );

  // Create user
  fastify.post('/', async (request, reply) => {
    return {
      success: true,
      data: {
        message: 'Hello from Create User!',
        timestamp: new Date().toISOString(),
      },
    };
  });

  // Update user
  fastify.put(
    '/:id',
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      return {
        success: true,
        data: {
          message: `Hello from Update User ${id}!`,
          userId: id,
          timestamp: new Date().toISOString(),
        },
      };
    }
  );

  // Delete user
  fastify.delete(
    '/:id',
    {
      preHandler: fastify.authorize(['admin']),
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      return {
        success: true,
        data: {
          message: `Hello from Delete User ${id}!`,
          userId: id,
          timestamp: new Date().toISOString(),
        },
      };
    }
  );
};
