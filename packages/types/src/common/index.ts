// アプリケーション全体で使用される共通型定義

export type UUID = string;

export type Timestamp = Date;

export interface BaseEntity {
  id: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ユーザーロール
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

// ファイルタイプ
export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other',
}

// コンテンツステータス
export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// 通知タイプ
export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
  MESSAGE = 'message',
}

// API レスポンス型（統一エラーハンドリング対応）
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface ApiError<TCode = string> {
  success: false;
  error: {
    code: TCode;
    message: string;
    timestamp: string;
    details?: unknown;
    traceId?: string;
    path?: string;
  };
}

export type ApiResult<T = unknown, TCode = string> =
  | ApiResponse<T>
  | ApiError<TCode>;

// ページネーション
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 検索とフィルター
export interface SearchParams {
  query?: string;
  tags?: string[];
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 位置情報（汎用）
export interface Location {
  country?: string;
  region?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

// 連絡先情報
export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  social?: Record<string, string>;
}
