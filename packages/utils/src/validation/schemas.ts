import { z } from 'zod';
import { UserRole, FileType, ContentStatus } from '@template/types';

// 共通バリデーションスキーマ
export const emailSchema = z
  .string()
  .email('有効なメールアドレスを入力してください');

export const passwordSchema = z
  .string()
  .min(8, 'パスワードは8文字以上で入力してください')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    '小文字・大文字・数字を含む必要があります'
  );

export const phoneSchema = z
  .string()
  .regex(/^[\d\s\-+()]+$/, '有効な電話番号を入力してください')
  .optional();

export const urlSchema = z
  .string()
  .url('有効なURLを入力してください')
  .optional();

export const postalCodeSchema = z
  .string()
  .min(1, '郵便番号を入力してください')
  .optional();

// 位置情報スキーマ
export const locationSchema = z.object({
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  postalCode: postalCodeSchema,
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// 連絡先情報スキーマ
export const contactInfoSchema = z.object({
  email: emailSchema.optional(),
  phone: phoneSchema,
  website: urlSchema,
  social: z.record(z.string(), z.string()).optional(),
});

// ユーザースキーマ
export const createUserSchema = z.object({
  email: emailSchema,
  role: z.nativeEnum(UserRole),
  profileData: z.object({
    firstName: z.string().min(1, '名前を入力してください').optional(),
    lastName: z.string().min(1, '苗字を入力してください').optional(),
    displayName: z.string().min(1, '表示名を入力してください').optional(),
    bio: z
      .string()
      .max(500, '自己紹介は500文字以内で入力してください')
      .optional(),
    avatarUrl: urlSchema,
    location: locationSchema.optional(),
    contactInfo: contactInfoSchema.optional(),
    preferences: z
      .object({
        language: z.enum(['ja', 'en']).optional(),
        timezone: z.string().optional(),
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        theme: z.enum(['light', 'dark', 'system']).optional(),
      })
      .optional(),
  }),
});

export const updateUserSchema = createUserSchema.partial();

// プロファイルスキーマ
export const createProfileSchema = z.object({
  bio: z
    .string()
    .max(1000, '自己紹介は1000文字以内で入力してください')
    .optional(),
  avatarUrl: urlSchema,
  coverImageUrl: urlSchema,
  socialLinks: z
    .object({
      twitter: urlSchema,
      github: urlSchema,
      linkedin: urlSchema,
      website: urlSchema,
    })
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateProfileSchema = createProfileSchema.partial();

// コンテンツスキーマ
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(200, 'タイトルは200文字以内で入力してください'),
  content: z
    .string()
    .min(1, 'コンテンツを入力してください')
    .max(10000, 'コンテンツは10000文字以内で入力してください'),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  tags: z
    .array(z.string())
    .max(10, 'タグは10個以内で設定してください')
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updatePostSchema = createPostSchema.partial();

// コメントスキーマ
export const createCommentSchema = z.object({
  postId: z.string().min(1, '投稿IDを指定してください'),
  content: z
    .string()
    .min(1, 'コメントを入力してください')
    .max(1000, 'コメントは1000文字以内で入力してください'),
  parentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'コメントを入力してください')
    .max(1000, 'コメントは1000文字以内で入力してください'),
});

// ファイルアップロードスキーマ
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'ファイル名を入力してください'),
  mimeType: z.string().min(1, 'MIMEタイプを指定してください'),
  size: z
    .number()
    .max(10 * 1024 * 1024, 'ファイルサイズは10MB以内にしてください'),
  type: z.nativeEnum(FileType),
});

// 検索スキーマ
export const searchSchema = z.object({
  query: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  status: z.nativeEnum(ContentStatus).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ページネーションスキーマ
export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// IDバリデーション
export const uuidSchema = z.string().uuid('有効なIDを指定してください');
export const cuidSchema = z.string().min(1, '有効なIDを指定してください');

// 日付範囲スキーマ
export const dateRangeSchema = z
  .object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  })
  .refine(data => data.end >= data.start, {
    message: '終了日は開始日以降である必要があります',
    path: ['end'],
  });

// 数値範囲スキーマ
export const numberRangeSchema = z
  .object({
    min: z.number(),
    max: z.number(),
  })
  .refine(data => data.max >= data.min, {
    message: '最大値は最小値以上である必要があります',
    path: ['max'],
  });
