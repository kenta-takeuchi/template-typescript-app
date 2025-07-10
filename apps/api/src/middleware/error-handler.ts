import { FastifyPluginAsync, FastifyError } from 'fastify';
import { ZodError } from 'zod';
import {
  ApiErrorResponse,
  ErrorCode,
  createErrorResponse,
  getStatusCodeFromErrorCode,
  ErrorDetail,
} from '@template/types';

export const errorHandler: FastifyPluginAsync = async fastify => {
  fastify.setErrorHandler(async (error: FastifyError, request, reply) => {
    const { log } = request;
    const traceId = request.id;
    const path = request.url;

    // Zod validation errors
    if (error instanceof ZodError) {
      log.warn({ error: error.errors, traceId }, 'Validation error');

      const details: ErrorDetail[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        value: 'received' in err ? err.received : undefined,
      }));

      const errorResponse = createErrorResponse({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid request data',
        details,
        traceId,
        path,
      });

      return reply
        .status(getStatusCodeFromErrorCode(ErrorCode.VALIDATION_ERROR))
        .send(errorResponse);
    }

    // Fastify validation errors
    if (error.validation) {
      log.warn(
        { error: error.validation, traceId },
        'Fastify validation error'
      );

      const details =
        error.validation?.map(err => ({
          field: err.instancePath || 'unknown',
          message: err.message || 'Validation failed',
          code: err.keyword,
        })) || [];

      const errorResponse = createErrorResponse({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid request format',
        details,
        traceId,
        path,
      });

      return reply
        .status(getStatusCodeFromErrorCode(ErrorCode.VALIDATION_ERROR))
        .send(errorResponse);
    }

    // JWT errors
    if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
      log.warn({ traceId }, 'JWT token expired');

      const errorResponse = createErrorResponse({
        code: ErrorCode.TOKEN_EXPIRED,
        message: 'Authentication token has expired',
        traceId,
        path,
      });

      return reply
        .status(getStatusCodeFromErrorCode(ErrorCode.TOKEN_EXPIRED))
        .send(errorResponse);
    }

    if (error.code === 'FST_JWT_BAD_REQUEST') {
      log.warn({ traceId }, 'Invalid JWT token');

      const errorResponse = createErrorResponse({
        code: ErrorCode.INVALID_TOKEN,
        message: 'Invalid authentication token',
        traceId,
        path,
      });

      return reply
        .status(getStatusCodeFromErrorCode(ErrorCode.INVALID_TOKEN))
        .send(errorResponse);
    }

    // Rate limit errors
    if (error.statusCode === 429) {
      log.warn({ traceId }, 'Rate limit exceeded');

      const errorResponse = createErrorResponse({
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
        message: 'Too many requests. Please try again later.',
        traceId,
        path,
      });

      return reply
        .status(getStatusCodeFromErrorCode(ErrorCode.RATE_LIMIT_EXCEEDED))
        .send(errorResponse);
    }

    // Not found errors
    if (error.statusCode === 404) {
      log.warn({ traceId }, 'Resource not found');

      const errorResponse = createErrorResponse({
        code: ErrorCode.NOT_FOUND,
        message: 'The requested resource was not found',
        traceId,
        path,
      });

      return reply
        .status(getStatusCodeFromErrorCode(ErrorCode.NOT_FOUND))
        .send(errorResponse);
    }

    // Database errors (Prisma)
    if (error.message.includes('Unique constraint')) {
      log.warn({ error, traceId }, 'Database unique constraint violation');

      const errorResponse = createErrorResponse({
        code: ErrorCode.CONFLICT,
        message: 'Resource already exists',
        traceId,
        path,
      });

      return reply
        .status(getStatusCodeFromErrorCode(ErrorCode.CONFLICT))
        .send(errorResponse);
    }

    if (error.message.includes('Record to update not found')) {
      log.warn({ error, traceId }, 'Database record not found');

      const errorResponse = createErrorResponse({
        code: ErrorCode.NOT_FOUND,
        message: 'Resource not found',
        traceId,
        path,
      });

      return reply
        .status(getStatusCodeFromErrorCode(ErrorCode.NOT_FOUND))
        .send(errorResponse);
    }

    // Log unexpected errors
    log.error({ error, traceId }, 'Unhandled error');

    // Generic server error
    const statusCode = error.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';

    const errorResponse = createErrorResponse({
      code: ErrorCode.INTERNAL_ERROR,
      message: isDevelopment
        ? error.message
        : 'An internal server error occurred',
      details: isDevelopment ? { stack: error.stack } : undefined,
      traceId,
      path,
    });

    return reply.status(statusCode).send(errorResponse);
  });
};
