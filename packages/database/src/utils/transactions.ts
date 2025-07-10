import { PrismaClient } from '@prisma/client';

/**
 * Transaction utilities for safe database operations
 */

/**
 * Transaction context type
 */
export type TransactionClient = any;

/**
 * Transaction function type
 */
export type TransactionFn<T> = (_tx: TransactionClient) => Promise<T>;

/**
 * Transaction options
 */
export interface TransactionOptions {
  /**
   * Maximum time the transaction can run before being cancelled (in milliseconds)
   * Default: 5000ms (5 seconds)
   */
  timeout?: number;
  /**
   * Transaction isolation level
   */
  isolationLevel?:
    | 'ReadUncommitted'
    | 'ReadCommitted'
    | 'RepeatableRead'
    | 'Serializable';
}

/**
 * Execute a function within a database transaction
 *
 * @param client - Prisma client instance
 * @param fn - Function to execute within transaction
 * @param options - Transaction options
 * @returns Result of the transaction function
 *
 * @example
 * ```typescript
 * const result = await withTransaction(db, async (tx) => {
 *   const user = await tx.user.create({ data: { name: 'John' } });
 *   const profile = await tx.profile.create({
 *     data: { userId: user.id, bio: 'Developer' }
 *   });
 *   return { user, profile };
 * });
 * ```
 */
export async function withTransaction<T>(
  client: PrismaClient,
  fn: TransactionFn<T>,
  options: TransactionOptions = {}
): Promise<T> {
  const { timeout = 5000, isolationLevel } = options;

  return client.$transaction(fn, {
    timeout,
    isolationLevel,
  });
}

/**
 * Execute multiple operations in a single transaction
 * Each operation receives the transaction client
 *
 * @param client - Prisma client instance
 * @param operations - Array of operations to execute
 * @param options - Transaction options
 * @returns Array of operation results
 *
 * @example
 * ```typescript
 * const [user, company] = await batchTransaction(db, [
 *   (tx) => tx.user.create({ data: { name: 'John' } }),
 *   (tx) => tx.company.create({ data: { name: 'ACME Corp' } })
 * ]);
 * ```
 */
export async function batchTransaction<T extends readonly unknown[]>(
  client: PrismaClient,
  operations: readonly [...{ [K in keyof T]: TransactionFn<T[K]> }],
  options: TransactionOptions = {}
): Promise<T> {
  return withTransaction(
    client,
    async tx => {
      const results = await Promise.all(
        operations.map(operation => operation(tx))
      );
      return results as any;
    },
    options
  );
}

/**
 * Retry a transaction function if it fails due to serialization errors
 *
 * @param client - Prisma client instance
 * @param fn - Function to execute within transaction
 * @param maxRetries - Maximum number of retry attempts
 * @param options - Transaction options
 * @returns Result of the transaction function
 */
export async function retryTransaction<T>(
  client: PrismaClient,
  fn: TransactionFn<T>,
  maxRetries: number = 3,
  options: TransactionOptions = {}
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTransaction(client, fn, options);
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable (serialization failure)
      const isRetryable =
        error instanceof Error &&
        (error.message.includes('serialization_failure') ||
          error.message.includes('deadlock_detected') ||
          error.message.includes('could not serialize access'));

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: wait 2^attempt * 100ms
      const delay = Math.pow(2, attempt) * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
