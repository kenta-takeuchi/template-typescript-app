/**
 * Database filter utilities for building type-safe queries
 */

/**
 * Date range filter
 */
export interface DateRangeFilter {
  /**
   * Start date (inclusive)
   */
  from?: Date | string;
  /**
   * End date (inclusive)
   */
  to?: Date | string;
}

/**
 * Numeric range filter
 */
export interface NumericRangeFilter {
  /**
   * Minimum value (inclusive)
   */
  min?: number;
  /**
   * Maximum value (inclusive)
   */
  max?: number;
}

/**
 * Text search filter
 */
export interface TextSearchFilter {
  /**
   * Search query
   */
  query?: string;
  /**
   * Search mode
   */
  mode?: 'contains' | 'startsWith' | 'endsWith' | 'equals';
  /**
   * Case sensitivity
   */
  caseSensitive?: boolean;
}

/**
 * Convert date range filter to Prisma where clause
 *
 * @param filter - Date range filter
 * @returns Prisma date filter object
 */
export function dateRangeToWhere(filter: DateRangeFilter) {
  const where: { gte?: Date; lte?: Date } = {};

  if (filter.from) {
    where.gte =
      typeof filter.from === 'string' ? new Date(filter.from) : filter.from;
  }

  if (filter.to) {
    where.lte = typeof filter.to === 'string' ? new Date(filter.to) : filter.to;
  }

  return Object.keys(where).length > 0 ? where : undefined;
}

/**
 * Convert numeric range filter to Prisma where clause
 *
 * @param filter - Numeric range filter
 * @returns Prisma numeric filter object
 */
export function numericRangeToWhere(filter: NumericRangeFilter) {
  const where: { gte?: number; lte?: number } = {};

  if (typeof filter.min === 'number') {
    where.gte = filter.min;
  }

  if (typeof filter.max === 'number') {
    where.lte = filter.max;
  }

  return Object.keys(where).length > 0 ? where : undefined;
}

/**
 * Convert text search filter to Prisma where clause
 *
 * @param filter - Text search filter
 * @returns Prisma text filter object
 */
export function textSearchToWhere(filter: TextSearchFilter) {
  if (!filter.query) {
    return undefined;
  }

  const { query, mode = 'contains', caseSensitive = false } = filter;

  switch (mode) {
    case 'contains':
      return {
        contains: query,
        mode: caseSensitive ? 'default' : ('insensitive' as const),
      };
    case 'startsWith':
      return {
        startsWith: query,
        mode: caseSensitive ? 'default' : ('insensitive' as const),
      };
    case 'endsWith':
      return {
        endsWith: query,
        mode: caseSensitive ? 'default' : ('insensitive' as const),
      };
    case 'equals':
      return {
        equals: query,
        mode: caseSensitive ? 'default' : ('insensitive' as const),
      };
    default:
      return {
        contains: query,
        mode: caseSensitive ? 'default' : ('insensitive' as const),
      };
  }
}

/**
 * Create a multi-field text search filter
 *
 * @param fields - Array of field names to search in
 * @param filter - Text search filter
 * @returns Prisma OR filter for multiple fields
 */
export function multiFieldTextSearch(
  fields: string[],
  filter: TextSearchFilter
) {
  if (!filter.query) {
    return undefined;
  }

  const searchWhere = textSearchToWhere(filter);
  if (!searchWhere) {
    return undefined;
  }

  return {
    OR: fields.map(field => ({
      [field]: searchWhere,
    })),
  };
}

/**
 * Array contains filter helper
 *
 * @param values - Array of values to check for
 * @param mode - Filter mode ('some', 'every', 'none')
 * @returns Prisma array filter
 */
export function arrayContainsFilter<T>(
  values: T[],
  mode: 'some' | 'every' | 'none' = 'some'
) {
  if (!values || values.length === 0) {
    return undefined;
  }

  switch (mode) {
    case 'some':
      return {
        hasSome: values,
      };
    case 'every':
      return {
        hasEvery: values,
      };
    case 'none':
      return {
        isEmpty: false,
        NOT: {
          hasSome: values,
        },
      };
    default:
      return {
        hasSome: values,
      };
  }
}

/**
 * Build complex where clause from multiple filters
 *
 * @param filters - Object containing various filters
 * @returns Combined Prisma where clause
 */
export function buildWhereClause(filters: Record<string, any>) {
  const where: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      where[key] = value;
    }
  });

  return Object.keys(where).length > 0 ? where : undefined;
}
