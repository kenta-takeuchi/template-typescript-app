/**
 * 統一APIエラーレスポンス型定義
 * OpenAPI仕様とBackendエラーハンドリングの統一化
 */

// 基本型をインポート（関数で使用するため）
import type { ApiResponse, ApiError, ApiResult } from '../common/index';

/**
 * APIエラーコード
 * 各エラーカテゴリごとに体系的に定義
 */
export enum ErrorCode {
  // Client Errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Authentication Errors
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_MISSING = 'TOKEN_MISSING',

  // Business Logic Errors
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  RESOURCE_NOT_AVAILABLE = 'RESOURCE_NOT_AVAILABLE',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',

  // Server Errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

/**
 * エラー詳細情報
 */
export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
  value?: unknown;
}

/**
 * ErrorCode制約付きAPIエラー型
 */
export type ApiErrorResponse = ApiError<ErrorCode>;

/**
 * ErrorCode制約付きAPIレスポンス型
 */
export type ApiResultWithErrorCode<T = unknown> = ApiResult<T, ErrorCode>;

/**
 * 基本API型の再エクスポート
 */
export type { ApiResponse, ApiError, ApiResult } from '../common/index';

/**
 * エラーレスポンス作成ヘルパー
 */
export interface CreateErrorResponseOptions {
  code: ErrorCode;
  message: string;
  details?: ErrorDetail[] | Record<string, unknown>;
  traceId?: string;
  path?: string;
  timestamp?: string;
}

/**
 * APIエラーレスポンスを作成するヘルパー関数
 */
export function createErrorResponse(
  options: CreateErrorResponseOptions
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code: options.code,
      message: options.message,
      timestamp: options.timestamp || new Date().toISOString(),
      ...(options.details && { details: options.details }),
      ...(options.traceId && { traceId: options.traceId }),
      ...(options.path && { path: options.path }),
    },
  };
}

/**
 * API成功レスポンスを作成するヘルパー関数
 */
export function createSuccessResponse<T>(
  data: T,
  options?: { timestamp?: string; message?: string; meta?: any }
): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: options?.timestamp || new Date().toISOString(),
    ...(options?.message && { message: options.message }),
    ...(options?.meta && { meta: options.meta }),
  };
}

/**
 * エラーレスポンスの型ガード
 */
export function isErrorResponse<T, TCode = string>(
  response: ApiResult<T, TCode> | Error | unknown
): response is ApiError<TCode> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false
  );
}

/**
 * 成功レスポンスの型ガード
 */
export function isSuccessResponse<T, TCode = string>(
  response: ApiResult<T, TCode>
): response is ApiResponse<T> {
  return response.success === true;
}

/**
 * ErrorCode制約付きエラーレスポンスの型ガード
 */
export function isErrorResponseWithCode<T>(
  response: ApiResult<T, ErrorCode>
): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Error | ApiErrorResponse ユニオン型用の型ガード
 */
export function isApiErrorResponse(
  error: Error | ApiErrorResponse | unknown
): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    error.success === false &&
    'error' in error &&
    typeof error.error === 'object' &&
    error.error !== null &&
    'code' in error.error
  );
}

/**
 * HTTPステータスコードとエラーコードのマッピング
 */
export const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  // 400 Bad Request
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_REQUEST]: 400,
  [ErrorCode.BUSINESS_RULE_VIOLATION]: 400,

  // 401 Unauthorized
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.TOKEN_MISSING]: 401,

  // 403 Forbidden
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.OPERATION_NOT_ALLOWED]: 403,

  // 404 Not Found
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_NOT_AVAILABLE]: 404,

  // 409 Conflict
  [ErrorCode.CONFLICT]: 409,

  // 429 Too Many Requests
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,

  // 500 Internal Server Error
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,

  // 503 Service Unavailable
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 503,
};

/**
 * エラーコードからHTTPステータスコードを取得
 */
export function getStatusCodeFromErrorCode(errorCode: ErrorCode): number {
  return ERROR_STATUS_MAP[errorCode] || 500;
}
