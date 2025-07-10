import { PrismaClient, User, UserRole, Prisma } from '@prisma/client';

import { textSearchToWhere, buildWhereClause } from '../utils/filters';
import { TransactionClient } from '../utils/transactions';

import { AbstractRepository } from './base';

/**
 * User creation data
 */
export type UserCreateData = Omit<
  Prisma.UserCreateInput,
  'id' | 'createdAt' | 'updatedAt'
>;

/**
 * User update data
 */
export type UserUpdateData = Prisma.UserUpdateInput;

/**
 * User filter options
 */
export interface UserFilter {
  /**
   * Filter by user role
   */
  role?: UserRole;
  /**
   * Search in name or email
   */
  search?: string;
  /**
   * Filter by email
   */
  email?: string;
  /**
   * Filter by prefecture
   */
  prefecture?: string;
  /**
   * Filter by active status
   */
  isActive?: boolean;
  /**
   * Filter by Firebase UID
   */
  firebaseUid?: string;
}

/**
 * User with related data
 */
export type UserWithProfile = User & {
  profile?: any;
  posts?: any[];
  comments?: any[];
};

/**
 * User repository for managing user data
 */
export class UserRepository extends AbstractRepository<
  UserWithProfile,
  UserCreateData,
  UserUpdateData,
  UserFilter
> {
  constructor(client: PrismaClient | TransactionClient) {
    super(client);
  }

  protected getModel() {
    return this.client.user;
  }

  protected getDefaultInclude() {
    return {
      profile: true,
      posts: true,
      comments: true,
    };
  }

  protected transformFilter(filter: UserFilter) {
    const where: any = {};

    if (filter.role) {
      where.role = filter.role;
    }

    if (filter.email) {
      where.email = filter.email;
    }

    if (filter.prefecture) {
      where.prefecture = filter.prefecture;
    }

    if (typeof filter.isActive === 'boolean') {
      where.isActive = filter.isActive;
    }

    if (filter.firebaseUid) {
      where.firebaseUid = filter.firebaseUid;
    }

    if (filter.search) {
      const searchWhere = textSearchToWhere({
        query: filter.search,
        mode: 'contains',
        caseSensitive: false,
      });

      if (searchWhere) {
        where.OR = [{ name: searchWhere }, { email: searchWhere }];
      }
    }

    return buildWhereClause(where);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserWithProfile | null> {
    return this.getModel().findUnique({
      where: { email },
      include: this.getDefaultInclude(),
    });
  }

  /**
   * Find user by Firebase UID
   */
  async findByFirebaseUid(
    firebaseUid: string
  ): Promise<UserWithProfile | null> {
    return this.getModel().findUnique({
      where: { firebaseUid },
      include: this.getDefaultInclude(),
    });
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole) {
    return this.getModel().findMany({
      where: { role },
      include: this.getDefaultInclude(),
    });
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(id: string): Promise<UserWithProfile> {
    return this.getModel().update({
      where: { id },
      data: { lastLoginAt: new Date() },
      include: this.getDefaultInclude(),
    });
  }

  /**
   * Activate or deactivate user
   */
  async setActiveStatus(
    id: string,
    isActive: boolean
  ): Promise<UserWithProfile> {
    return this.getModel().update({
      where: { id },
      data: { isActive },
      include: this.getDefaultInclude(),
    });
  }

  /**
   * Check if email is already taken
   */
  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    const where: any = { email };

    if (excludeUserId) {
      where.NOT = { id: excludeUserId };
    }

    const count = await this.getModel().count({ where });
    return count > 0;
  }

  /**
   * Get user statistics by role
   */
  async getUserStatsByRole(): Promise<Record<UserRole, number>> {
    const stats = await this.getModel().groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    const result = {} as Record<UserRole, number>;

    // Initialize all roles with 0
    Object.values(UserRole).forEach(role => {
      result[role] = 0;
    });

    // Fill in actual counts
    stats.forEach((stat: any) => {
      result[stat.role as UserRole] = stat._count.id;
    });

    return result;
  }
}
