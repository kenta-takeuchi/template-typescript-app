import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';

import { config } from './lib/config';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/error-handler';
import { authMiddleware } from './middleware/auth';

// Routes
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { fileRoutes } from './routes/files';

const fastify = Fastify({
  logger: logger,
  ajv: {
    customOptions: {
      removeAdditional: 'all',
      coerceTypes: true,
      allErrors: true,
    },
  },
});

async function buildServer() {
  try {
    // Security plugins
    await fastify.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    });

    await fastify.register(cors, {
      origin: config.app.frontendUrl || 'http://localhost:3000',
      credentials: true,
    });

    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    });

    // Utility plugins
    await fastify.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    });

    await fastify.register(jwt, {
      secret: config.security.jwtSecret,
    });

    // Global middleware
    await fastify.register(errorHandler);
    await fastify.register(authMiddleware);

    // Health check
    fastify.get('/health', async () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
    }));

    // API routes
    await fastify.register(import('./routes/health'), { prefix: '/api/v1' });
    await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
    await fastify.register(userRoutes, { prefix: '/api/v1/users' });
    await fastify.register(fileRoutes, { prefix: '/api/v1/files' });

    return fastify;
  } catch (error) {
    fastify.log.error(error);
    throw error;
  }
}

async function start() {
  try {
    const server = await buildServer();

    const address = await server.listen({
      port: config.app.port,
      host: config.app.host,
    });

    console.log(`🚀 API Server running at ${address}`);
    console.log(`📖 Environment: ${config.app.nodeEnv}`);
    console.log(`🔗 Health check: ${address}/health`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);

  try {
    await fastify.close();
    console.log('✅ Server closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Only start the server if this file is run directly
if (require.main === module) {
  start();
}

export { buildServer };
export default fastify;
