import { BaseError } from './base.error';

/**
 * Infrastructure layer specific errors
 */
export class InfrastructureError extends BaseError {
  constructor(
    message: string,
    statusCode = 500,
    context?: Record<string, unknown>
  ) {
    super(message, statusCode, true, context);
  }
}

/**
 * Database connection error
 */
export class DatabaseConnectionError extends InfrastructureError {
  constructor(
    dbName: string,
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(`Failed to connect to database: ${dbName}`, 500, {
      ...context,
      dbName,
      originalError: originalError?.message,
    });
  }
}

/**
 * Database query error
 */
export class DatabaseQueryError extends InfrastructureError {
  constructor(
    query: string,
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(
      `Database query failed: ${originalError?.message || 'Unknown error'}`,
      500,
      { ...context, query, originalError: originalError?.message }
    );
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends InfrastructureError {
  constructor(
    serviceName: string,
    operation: string,
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(
      `External service ${serviceName} failed for operation ${operation}: ${originalError?.message || 'Unknown error'}`,
      503,
      {
        ...context,
        serviceName,
        operation,
        originalError: originalError?.message,
      }
    );
  }
}

/**
 * File system error
 */
export class FileSystemError extends InfrastructureError {
  constructor(
    operation: string,
    filePath: string,
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(`File system operation failed: ${operation} on ${filePath}`, 500, {
      ...context,
      operation,
      filePath,
      originalError: originalError?.message,
    });
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends InfrastructureError {
  constructor(
    configKey: string,
    reason: string,
    context?: Record<string, unknown>
  ) {
    super(`Configuration error for '${configKey}': ${reason}`, 500, {
      ...context,
      configKey,
      reason,
    });
  }
}
