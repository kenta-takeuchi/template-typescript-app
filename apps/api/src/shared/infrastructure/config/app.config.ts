import { Environment } from '../../types/common.types';
import { ConfigurationError } from '../errors';

/**
 * Application configuration interface
 */
export interface AppConfig {
  // Environment
  env: Environment;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;

  // Server
  port: number;
  host: string;

  // Database
  database: {
    url: string;
    maxConnections: number;
    enableLogging: boolean;
  };

  // Authentication
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenExpiresIn: string;
    bcryptRounds: number;
  };

  // File upload
  upload: {
    maxFileSize: number;
    allowedMimeTypes: string[];
    uploadPath: string;
  };

  // External services
  firebase: {
    projectId: string;
    privateKey: string;
    clientEmail: string;
  };

  // Logging
  logging: {
    level: string;
    enableConsole: boolean;
    enableFile: boolean;
    filePath?: string;
  };

  // Rate limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  // CORS
  cors: {
    origin: string[];
    credentials: boolean;
  };
}

/**
 * Load and validate application configuration
 */
export function loadAppConfig(): AppConfig {
  // Get environment
  const env = getEnvironment();

  try {
    const config: AppConfig = {
      // Environment
      env,
      isDevelopment: env === Environment.DEVELOPMENT,
      isProduction: env === Environment.PRODUCTION,
      isTest: env === Environment.TEST,

      // Server
      port: getNumberEnv('PORT', 4000),
      host: getStringEnv('HOST', '0.0.0.0'),

      // Database
      database: {
        url: getRequiredStringEnv('DATABASE_URL'),
        maxConnections: getNumberEnv('DB_MAX_CONNECTIONS', 10),
        enableLogging: getBooleanEnv(
          'DB_ENABLE_LOGGING',
          env === Environment.DEVELOPMENT
        ),
      },

      // Authentication
      auth: {
        jwtSecret: getRequiredStringEnv('JWT_SECRET'),
        jwtExpiresIn: getStringEnv('JWT_EXPIRES_IN', '15m'),
        refreshTokenExpiresIn: getStringEnv('REFRESH_TOKEN_EXPIRES_IN', '7d'),
        bcryptRounds: getNumberEnv('BCRYPT_ROUNDS', 12),
      },

      // File upload
      upload: {
        maxFileSize: getNumberEnv('UPLOAD_MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB
        allowedMimeTypes: getArrayEnv('UPLOAD_ALLOWED_MIME_TYPES', [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]),
        uploadPath: getStringEnv('UPLOAD_PATH', './uploads'),
      },

      // Firebase
      firebase: {
        projectId: getRequiredStringEnv('FIREBASE_PROJECT_ID'),
        privateKey: getRequiredStringEnv('FIREBASE_PRIVATE_KEY').replace(
          /\\n/g,
          '\n'
        ),
        clientEmail: getRequiredStringEnv('FIREBASE_CLIENT_EMAIL'),
      },

      // Logging
      logging: {
        level: getStringEnv(
          'LOG_LEVEL',
          env === Environment.PRODUCTION ? 'info' : 'debug'
        ),
        enableConsole: getBooleanEnv('LOG_ENABLE_CONSOLE', true),
        enableFile: getBooleanEnv(
          'LOG_ENABLE_FILE',
          env === Environment.PRODUCTION
        ),
        filePath: getOptionalStringEnv('LOG_FILE_PATH'),
      },

      // Rate limiting
      rateLimit: {
        windowMs: getNumberEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
        maxRequests: getNumberEnv('RATE_LIMIT_MAX_REQUESTS', 100),
      },

      // CORS
      cors: {
        origin: getArrayEnv('CORS_ORIGIN', [
          'http://localhost:3000', // jobseeker-web
          'http://localhost:3001', // company-web
          'http://localhost:3002', // agent-web
        ]),
        credentials: getBooleanEnv('CORS_CREDENTIALS', true),
      },
    };

    validateConfig(config);
    return config;
  } catch (error) {
    throw new ConfigurationError(
      'CONFIG_LOAD_FAILED',
      `Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get environment from NODE_ENV
 */
function getEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV?.toLowerCase();

  switch (nodeEnv) {
    case 'development':
      return Environment.DEVELOPMENT;
    case 'staging':
      return Environment.STAGING;
    case 'production':
      return Environment.PRODUCTION;
    case 'test':
      return Environment.TEST;
    default:
      return Environment.DEVELOPMENT;
  }
}

/**
 * Get required string environment variable
 */
function getRequiredStringEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new ConfigurationError(
      key,
      `Environment variable ${key} is required`
    );
  }
  return value;
}

/**
 * Get optional string environment variable
 */
function getOptionalStringEnv(key: string): string | undefined {
  return process.env[key];
}

/**
 * Get string environment variable with default
 */
function getStringEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Get number environment variable with default
 */
function getNumberEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new ConfigurationError(
      key,
      `Environment variable ${key} must be a valid number`
    );
  }

  return parsed;
}

/**
 * Get boolean environment variable with default
 */
function getBooleanEnv(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;

  const lowerValue = value.toLowerCase();
  return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
}

/**
 * Get array environment variable with default
 */
function getArrayEnv(key: string, defaultValue: string[]): string[] {
  const value = process.env[key];
  if (!value) return defaultValue;

  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * Validate configuration
 */
function validateConfig(config: AppConfig): void {
  const errors: string[] = [];

  // Validate port
  if (config.port < 1 || config.port > 65535) {
    errors.push('Port must be between 1 and 65535');
  }

  // Validate JWT secret
  if (config.auth.jwtSecret.length < 32) {
    errors.push('JWT secret must be at least 32 characters long');
  }

  // Validate bcrypt rounds
  if (config.auth.bcryptRounds < 8 || config.auth.bcryptRounds > 15) {
    errors.push('Bcrypt rounds must be between 8 and 15');
  }

  // Validate max file size
  if (config.upload.maxFileSize < 1024) {
    errors.push('Max file size must be at least 1KB');
  }

  // Validate rate limit
  if (config.rateLimit.windowMs < 1000) {
    errors.push('Rate limit window must be at least 1 second');
  }

  if (config.rateLimit.maxRequests < 1) {
    errors.push('Rate limit max requests must be at least 1');
  }

  if (errors.length > 0) {
    throw new ConfigurationError('VALIDATION_FAILED', errors.join(', '));
  }
}

// Export singleton instance
let configInstance: AppConfig | null = null;

/**
 * Get application configuration (singleton)
 */
export function getAppConfig(): AppConfig {
  if (!configInstance) {
    configInstance = loadAppConfig();
  }
  return configInstance;
}

/**
 * Reset configuration (for testing)
 */
export function resetAppConfig(): void {
  configInstance = null;
}
