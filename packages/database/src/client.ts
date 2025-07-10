import { PrismaClient } from '@prisma/client';

/**
 * Database client configuration
 */
export interface DatabaseConfig {
  /**
   * Database connection URL
   */
  url?: string;
  /**
   * Enable query logging in development
   */
  enableLogging?: boolean;
  /**
   * Connection pool settings
   */
  pool?: {
    timeout?: number;
    idleTimeout?: number;
  };
}

/**
 * Create and configure Prisma client instance
 *
 * @param config - Database configuration options
 * @returns Configured Prisma client
 */
export function createDatabaseClient(
  config: DatabaseConfig = {}
): PrismaClient {
  const {
    url = process.env.DATABASE_URL,
    enableLogging = process.env.NODE_ENV === 'development',
    pool: _pool = {},
  } = config;

  if (!url) {
    throw new Error(
      'Database URL is required. Set DATABASE_URL environment variable or provide url in config.'
    );
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
    log: enableLogging ? ['query', 'error', 'warn'] : undefined,
    errorFormat: 'pretty',
  });

  return client;
}

/**
 * Global database client instance
 * Implements singleton pattern to avoid multiple connections
 */
declare global {
  // eslint-disable-next-line no-var
  var __template_db_client: PrismaClient | undefined;
}

/**
 * Get or create the global database client instance
 *
 * @param config - Database configuration options
 * @returns Singleton database client
 */
export function getDatabaseClient(config: DatabaseConfig = {}): PrismaClient {
  if (typeof globalThis !== 'undefined') {
    if (!globalThis.__template_db_client) {
      globalThis.__template_db_client = createDatabaseClient(config);
    }
    return globalThis.__template_db_client;
  }

  // Fallback for environments without globalThis
  return createDatabaseClient(config);
}

/**
 * Close database connection
 * Should be called when application shuts down
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (typeof globalThis !== 'undefined' && globalThis.__template_db_client) {
    await globalThis.__template_db_client.$disconnect();
    globalThis.__template_db_client = undefined;
  }
}

/**
 * Default database client instance
 * Uses environment configuration
 */
export const db = getDatabaseClient();

export default db;
