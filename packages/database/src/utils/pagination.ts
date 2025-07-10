/**
 * Pagination utilities for database queries
 */

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /**
   * Page number (1-based)
   */
  page?: number;
  /**
   * Number of items per page
   */
  limit?: number;
  /**
   * Maximum allowed page size
   */
  maxLimit?: number;
}

/**
 * Pagination result
 */
export interface PaginationResult<T> {
  /**
   * Array of items for current page
   */
  data: T[];
  /**
   * Current page number (1-based)
   */
  page: number;
  /**
   * Number of items per page
   */
  limit: number;
  /**
   * Total number of items
   */
  total: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Whether there is a next page
   */
  hasNext: boolean;
  /**
   * Whether there is a previous page
   */
  hasPrev: boolean;
}

/**
 * Calculate pagination offset and limit
 *
 * @param params - Pagination parameters
 * @returns Prisma skip and take values
 */
export function calculatePagination(params: PaginationParams = {}): {
  skip: number;
  take: number;
  page: number;
  limit: number;
} {
  const { page = 1, limit = 20, maxLimit = 100 } = params;

  // Validate and normalize parameters
  const normalizedPage = Math.max(1, Math.floor(page));
  const normalizedLimit = Math.max(1, Math.min(limit, maxLimit));

  const skip = (normalizedPage - 1) * normalizedLimit;
  const take = normalizedLimit;

  return {
    skip,
    take,
    page: normalizedPage,
    limit: normalizedLimit,
  };
}

/**
 * Create paginated result from data and total count
 *
 * @param data - Array of items
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Paginated result
 */
export function createPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data,
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
  };
}

/**
 * Helper function for paginated queries
 *
 * @param findMany - Prisma findMany function
 * @param count - Prisma count function
 * @param params - Pagination parameters
 * @param query - Additional query options
 * @returns Paginated result
 */
export async function paginatedQuery<T, Q extends Record<string, any>>(
  findMany: (_args: Q & { skip: number; take: number }) => Promise<T[]>,
  count: (_args: Omit<Q, 'skip' | 'take' | 'orderBy'>) => Promise<number>,
  params: PaginationParams,
  query: Q = {} as Q
): Promise<PaginationResult<T>> {
  const { skip, take, page, limit } = calculatePagination(params);

  // Remove pagination and orderBy from count query
  const countQuery = { ...query };
  delete countQuery.skip;
  delete countQuery.take;
  delete countQuery.orderBy;

  const [data, total] = await Promise.all([
    findMany({ ...query, skip, take }),
    count(countQuery),
  ]);

  return createPaginationResult(data, total, page, limit);
}
