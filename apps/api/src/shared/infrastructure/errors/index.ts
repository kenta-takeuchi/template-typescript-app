// Base error
export { BaseError } from './base.error';

// Domain errors
export {
  DomainError,
  BusinessRuleValidationError,
  EntityNotFoundError,
  InvalidEntityStateError,
  DuplicateEntityError,
} from './domain.error';

// Application errors
export {
  ApplicationError,
  UseCaseValidationError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  RateLimitExceededError,
} from './application.error';

// Infrastructure errors
export {
  InfrastructureError,
  DatabaseConnectionError,
  DatabaseQueryError,
  ExternalServiceError,
  FileSystemError,
  ConfigurationError,
} from './infrastructure.error';
