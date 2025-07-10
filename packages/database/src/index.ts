/**
 * @template/database
 *
 * テンプレート用の共有データベースユーティリティとPrismaクライアント
 *
 * @example
 * ```typescript
 * import { db, UserRepository } from '@template/database';
 *
 * const userRepo = new UserRepository(db);
 * const users = await userRepo.findMany();
 * ```
 */

// クライアントのエクスポート
export {
  createDatabaseClient,
  getDatabaseClient,
  closeDatabaseConnection,
  db,
} from './client';

export type { DatabaseConfig } from './client';

// ユーティリティのエクスポート
export * from './utils';

// リポジトリのエクスポート
export * from './repositories';

// 便利のためPrismaの型を再エクスポート
export type {
  PrismaClient,
  User,
  UserRole,
  UserProfile,
  Post,
  Comment,
  Prisma,
} from '@prisma/client';
