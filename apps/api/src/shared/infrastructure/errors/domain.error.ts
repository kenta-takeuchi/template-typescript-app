import { BaseError } from './base.error';

/**
 * Domain layer specific errors
 */
export class DomainError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, true, context);
  }
}

/**
 * Business rule validation error
 */
export class BusinessRuleValidationError extends DomainError {
  constructor(rule: string, entity: string, context?: Record<string, unknown>) {
    super(`Business rule validation failed: ${rule} for ${entity}`, {
      ...context,
      rule,
      entity,
    });
  }
}

/**
 * Entity not found error
 */
export class EntityNotFoundError extends DomainError {
  constructor(
    entityName: string,
    identifier: string | number,
    context?: Record<string, unknown>
  ) {
    super(`${entityName} with identifier ${identifier} not found`, {
      ...context,
      entityName,
      identifier,
    });
  }
}

/**
 * Invalid entity state error
 */
export class InvalidEntityStateError extends DomainError {
  constructor(
    entityName: string,
    currentState: string,
    expectedState: string,
    context?: Record<string, unknown>
  ) {
    super(
      `Invalid state for ${entityName}: current '${currentState}', expected '${expectedState}'`,
      { ...context, entityName, currentState, expectedState }
    );
  }
}

/**
 * Duplicate entity error
 */
export class DuplicateEntityError extends DomainError {
  constructor(
    entityName: string,
    identifier: string,
    context?: Record<string, unknown>
  ) {
    super(`${entityName} with identifier ${identifier} already exists`, {
      ...context,
      entityName,
      identifier,
    });
  }
}
