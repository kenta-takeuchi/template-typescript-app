import { FastifyPluginAsync } from 'fastify';

export const fileRoutes: FastifyPluginAsync = async fastify => {
  // Upload file
  fastify.post(
    '/upload',
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      return {
        success: true,
        data: {
          message: 'Hello from File Upload!',
          timestamp: new Date().toISOString(),
        },
      };
    }
  );

  // Get file info
  fastify.get(
    '/:id',
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      return {
        success: true,
        data: {
          message: `Hello from File ${id}!`,
          fileId: id,
          timestamp: new Date().toISOString(),
        },
      };
    }
  );

  // Delete file
  fastify.delete(
    '/:id',
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      return {
        success: true,
        data: {
          message: `Hello from Delete File ${id}!`,
          fileId: id,
          timestamp: new Date().toISOString(),
        },
      };
    }
  );

  // Get signed URL for direct upload
  fastify.post(
    '/signed-url',
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      return {
        success: true,
        data: {
          message: 'Hello from Signed URL!',
          signedUrl: 'https://example.com/signed-url',
          timestamp: new Date().toISOString(),
        },
      };
    }
  );
};
