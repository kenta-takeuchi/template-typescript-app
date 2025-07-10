import { BaseError } from './base.error';

/**
 * Application layer specific errors
 */
export class ApplicationError extends BaseError {
  constructor(
    message: string,
    statusCode = 400,
    context?: Record<string, unknown>
  ) {
    super(message, statusCode, true, context);
  }
}

/**
 * Use case validation error
 */
export class UseCaseValidationError extends ApplicationError {
  constructor(
    useCaseName: string,
    validationErrors: string[],
    context?: Record<string, unknown>
  ) {
    super(
      `Validation failed for ${useCaseName}: ${validationErrors.join(', ')}`,
      400,
      { ...context, useCaseName, validationErrors }
    );
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends ApplicationError {
  constructor(
    message = 'Authentication failed',
    context?: Record<string, unknown>
  ) {
    super(message, 401, context);
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends ApplicationError {
  constructor(
    resource: string,
    action: string,
    context?: Record<string, unknown>
  ) {
    super(`Access denied to ${action} ${resource}`, 403, {
      ...context,
      resource,
      action,
    });
  }
}

/**
 * Conflict error (for business conflicts)
 */
export class ConflictError extends ApplicationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 409, context);
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitExceededError extends ApplicationError {
  constructor(
    limit: number,
    windowMs: number,
    context?: Record<string, unknown>
  ) {
    super(`Rate limit exceeded: ${limit} requests per ${windowMs}ms`, 429, {
      ...context,
      limit,
      windowMs,
    });
  }
}
