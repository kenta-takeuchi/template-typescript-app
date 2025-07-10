import { PrismaClient } from '@prisma/client';

import {
  PaginationParams,
  PaginationResult,
  paginatedQuery,
} from '../utils/pagination';
import { TransactionClient } from '../utils/transactions';

/**
 * Base repository interface for common CRUD operations
 */
export interface BaseRepository<T, TCreate, TUpdate, TFilter = {}> {
  /**
   * Find a single record by ID
   */
  findById(_id: string): Promise<T | null>;

  /**
   * Find multiple records with optional filtering and pagination
   */
  findMany(
    _filter?: TFilter,
    _pagination?: PaginationParams
  ): Promise<PaginationResult<T>>;

  /**
   * Create a new record
   */
  create(_data: TCreate): Promise<T>;

  /**
   * Update an existing record
   */
  update(_id: string, _data: TUpdate): Promise<T>;

  /**
   * Delete a record by ID
   */
  delete(_id: string): Promise<T>;

  /**
   * Check if a record exists by ID
   */
  exists(_id: string): Promise<boolean>;

  /**
   * Count records matching filter
   */
  count(_filter?: TFilter): Promise<number>;
}

/**
 * Abstract base repository implementation
 */
export abstract class AbstractRepository<T, TCreate, TUpdate, TFilter = {}>
  implements BaseRepository<T, TCreate, TUpdate, TFilter>
{
  protected client: PrismaClient | TransactionClient;

  constructor(client: PrismaClient | TransactionClient) {
    this.client = client;
  }

  /**
   * Get the Prisma model delegate for this repository
   */
  protected abstract getModel(): any;

  /**
   * Transform filter object to Prisma where clause
   */
  protected abstract transformFilter(_filter: TFilter): any;

  /**
   * Default include/select for queries
   */
  protected getDefaultInclude(): any {
    return undefined;
  }

  async findById(id: string): Promise<T | null> {
    return this.getModel().findUnique({
      where: { id },
      include: this.getDefaultInclude(),
    });
  }

  async findMany(
    filter: TFilter = {} as TFilter,
    pagination: PaginationParams = {}
  ): Promise<PaginationResult<T>> {
    const where = this.transformFilter(filter);
    const include = this.getDefaultInclude();

    return paginatedQuery(
      args => this.getModel().findMany({ ...args, where, include }),
      args => this.getModel().count({ ...args, where }),
      pagination,
      {}
    );
  }

  async create(data: TCreate): Promise<T> {
    return this.getModel().create({
      data,
      include: this.getDefaultInclude(),
    });
  }

  async update(id: string, data: TUpdate): Promise<T> {
    return this.getModel().update({
      where: { id },
      data,
      include: this.getDefaultInclude(),
    });
  }

  async delete(id: string): Promise<T> {
    return this.getModel().delete({
      where: { id },
      include: this.getDefaultInclude(),
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.getModel().count({
      where: { id },
    });
    return count > 0;
  }

  async count(filter: TFilter = {} as TFilter): Promise<number> {
    const where = this.transformFilter(filter);
    return this.getModel().count({ where });
  }
}
