/**
 * Database client setup for Template API
 * This file demonstrates how to use the @template/database package
 */

import {
  getDatabaseClient,
  closeDatabaseConnection,
  UserRepository,
  withTransaction,
  type DatabaseConfig,
  type PrismaClient,
} from '@template/database';

// Initialize database client with custom configuration
const databaseConfig: DatabaseConfig = {
  enableLogging: process.env.NODE_ENV === 'development',
  pool: {
    timeout: 10000, // 10 seconds
    idleTimeout: 30000, // 30 seconds
  },
};

/**
 * Get configured database client
 */
export const db: PrismaClient = getDatabaseClient(databaseConfig);

/**
 * Repository instances for easy access
 */
export const userRepository = new UserRepository(db);

/**
 * Gracefully close database connection
 * Call this when the application shuts down
 */
export async function closeDatabase(): Promise<void> {
  try {
    await closeDatabaseConnection();
    console.log('Database connection closed successfully');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
}

/**
 * Example: Create user with profile in a transaction
 */
export async function createUserWithProfile(userData: {
  firebaseUid: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  profileData?: {
    bio?: string;
    avatarUrl?: string;
    website?: string;
    location?: string;
  };
}) {
  return withTransaction(db, async tx => {
    // Create user first
    const user = await tx.user.create({
      data: {
        firebaseUid: userData.firebaseUid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      },
    });

    // Create user profile if data provided
    let profile = null;
    if (userData.profileData) {
      profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          ...userData.profileData,
        },
      });
    }

    return { user, profile };
  });
}

/**
 * Example: Get user with posts
 */
export async function getUserWithPosts(userId: string): Promise<any> {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      profile: true,
    },
  });
}

/**
 * Example: Create post with comments support
 */
export async function createPost(data: {
  title: string;
  content: string;
  authorId: string;
  published?: boolean;
}): Promise<any> {
  return db.post.create({
    data: {
      title: data.title,
      content: data.content,
      authorId: data.authorId,
      published: data.published || false,
    },
    include: {
      author: {
        include: {
          profile: true,
        },
      },
    },
  });
}

/**
 * Example: Get posts with pagination
 */
export async function getPosts(params: {
  published?: boolean;
  page?: number;
  limit?: number;
}): Promise<any> {
  const { page = 1, limit = 10, published = true } = params;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where: { published },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        _count: {
          select: { comments: true },
        },
      },
    }),
    db.post.count({ where: { published } }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
