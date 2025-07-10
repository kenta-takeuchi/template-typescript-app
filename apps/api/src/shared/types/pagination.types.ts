/**
 * Pagination-specific types and utilities
 */

/**
 * Default pagination configuration
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

/**
 * Pagination request parameters
 */
export interface PaginationRequest {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  offset: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Cursor-based pagination parameters
 */
export interface CursorPaginationRequest {
  cursor?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
}

/**
 * Cursor-based pagination metadata
 */
export interface CursorPaginationMeta {
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

/**
 * Cursor-based paginated response
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: CursorPaginationMeta;
}

/**
 * Pagination utility functions
 */
export class PaginationUtils {
  /**
   * Calculate pagination metadata
   */
  static calculateMeta(
    page: number,
    limit: number,
    total: number
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      offset,
    };
  }

  /**
   * Validate and normalize pagination parameters
   */
  static validateAndNormalize(params: PaginationRequest): {
    page: number;
    limit: number;
    offset: number;
  } {
    let page = params.page || DEFAULT_PAGINATION.page;
    let limit = params.limit || DEFAULT_PAGINATION.limit;

    // Ensure positive values
    page = Math.max(1, Math.floor(page));
    limit = Math.max(1, Math.floor(limit));

    // Enforce maximum limit
    limit = Math.min(limit, DEFAULT_PAGINATION.maxLimit);

    const offset =
      params.offset !== undefined
        ? Math.max(0, Math.floor(params.offset))
        : (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Create paginated response
   */
  static createResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResponse<T> {
    return {
      data,
      meta: this.calculateMeta(page, limit, total),
    };
  }

  /**
   * Create cursor-based paginated response
   */
  static createCursorResponse<T>(
    data: T[],
    limit: number,
    hasNext: boolean,
    hasPrev: boolean,
    nextCursor?: string,
    prevCursor?: string
  ): CursorPaginatedResponse<T> {
    return {
      data,
      meta: {
        limit,
        hasNext,
        hasPrev,
        nextCursor,
        prevCursor,
      },
    };
  }
}
