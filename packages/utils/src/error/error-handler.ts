/**
 * 共通エラーハンドリング関数
 */

import {
  ApiErrorResponse,
  ErrorCode,
  createErrorResponse,
  isApiErrorResponse,
} from '@template/types';

/**
 * エラー分類のインターフェース
 */
export interface ErrorClassification {
  isOperational: boolean;
  isRetryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'user' | 'system' | 'network' | 'business';
}

/**
 * エラーを分類する関数
 */
export function classifyError(
  error: Error | ApiErrorResponse
): ErrorClassification {
  // APIエラーレスポンスの場合
  if (isApiErrorResponse(error)) {
    return classifyApiErrorResponse(error);
  }

  // JavaScript Errorの場合
  return classifyJavaScriptError(error as Error);
}

/**
 * APIエラーレスポンスを分類
 */
function classifyApiErrorResponse(
  error: ApiErrorResponse
): ErrorClassification {
  const { code } = error.error;

  switch (code) {
    case ErrorCode.VALIDATION_ERROR:
    case ErrorCode.INVALID_REQUEST:
      return {
        isOperational: true,
        isRetryable: false,
        severity: 'low',
        category: 'user',
      };

    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.TOKEN_EXPIRED:
    case ErrorCode.INVALID_TOKEN:
    case ErrorCode.TOKEN_MISSING:
      return {
        isOperational: true,
        isRetryable: false,
        severity: 'medium',
        category: 'user',
      };

    case ErrorCode.FORBIDDEN:
    case ErrorCode.OPERATION_NOT_ALLOWED:
      return {
        isOperational: true,
        isRetryable: false,
        severity: 'medium',
        category: 'business',
      };

    case ErrorCode.NOT_FOUND:
    case ErrorCode.RESOURCE_NOT_AVAILABLE:
      return {
        isOperational: true,
        isRetryable: false,
        severity: 'low',
        category: 'user',
      };

    case ErrorCode.CONFLICT:
      return {
        isOperational: true,
        isRetryable: false,
        severity: 'medium',
        category: 'business',
      };

    case ErrorCode.RATE_LIMIT_EXCEEDED:
      return {
        isOperational: true,
        isRetryable: true,
        severity: 'medium',
        category: 'system',
      };

    case ErrorCode.SERVICE_UNAVAILABLE:
    case ErrorCode.EXTERNAL_SERVICE_ERROR:
      return {
        isOperational: true,
        isRetryable: true,
        severity: 'high',
        category: 'network',
      };

    case ErrorCode.DATABASE_ERROR:
      return {
        isOperational: true,
        isRetryable: true,
        severity: 'high',
        category: 'system',
      };

    case ErrorCode.INTERNAL_ERROR:
    default:
      return {
        isOperational: false,
        isRetryable: false,
        severity: 'critical',
        category: 'system',
      };
  }
}

/**
 * JavaScript Errorを分類
 */
function classifyJavaScriptError(error: Error): ErrorClassification {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // ネットワーク関連エラー
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    name.includes('timeout')
  ) {
    return {
      isOperational: true,
      isRetryable: true,
      severity: 'medium',
      category: 'network',
    };
  }

  // バリデーション関連エラー
  if (
    name === 'validationerror' ||
    message.includes('validation') ||
    message.includes('invalid')
  ) {
    return {
      isOperational: true,
      isRetryable: false,
      severity: 'low',
      category: 'user',
    };
  }

  // TypeErrorやReferenceErrorなどのプログラミングエラー
  if (
    name === 'typeerror' ||
    name === 'referenceerror' ||
    name === 'syntaxerror'
  ) {
    return {
      isOperational: false,
      isRetryable: false,
      severity: 'critical',
      category: 'system',
    };
  }

  // その他は中程度のシステムエラーとして扱う
  return {
    isOperational: true,
    isRetryable: false,
    severity: 'medium',
    category: 'system',
  };
}

/**
 * エラーからユーザー向けメッセージを生成
 */
export function getUserFriendlyMessage(
  error: Error | ApiErrorResponse,
  locale: 'ja' | 'en' = 'ja'
): string {
  const classification = classifyError(error);

  if (isApiErrorResponse(error)) {
    return getUserFriendlyApiErrorResponseMessage(error, locale);
  }

  return getUserFriendlyJavaScriptErrorMessage(
    error as Error,
    classification,
    locale
  );
}

/**
 * APIエラーからユーザー向けメッセージを生成
 */
function getUserFriendlyApiErrorResponseMessage(
  error: ApiErrorResponse,
  locale: 'ja' | 'en'
): string {
  const { code } = error.error;

  const messages = {
    ja: {
      [ErrorCode.VALIDATION_ERROR]:
        '入力内容に誤りがあります。確認してください。',
      [ErrorCode.INVALID_REQUEST]: 'リクエストが正しくありません。',
      [ErrorCode.UNAUTHORIZED]: 'ログインが必要です。',
      [ErrorCode.TOKEN_EXPIRED]:
        'セッションが期限切れです。再度ログインしてください。',
      [ErrorCode.INVALID_TOKEN]:
        '認証情報が無効です。再度ログインしてください。',
      [ErrorCode.TOKEN_MISSING]: 'ログインが必要です。',
      [ErrorCode.FORBIDDEN]: 'この操作を実行する権限がありません。',
      [ErrorCode.OPERATION_NOT_ALLOWED]: 'この操作は許可されていません。',
      [ErrorCode.NOT_FOUND]: '指定されたデータが見つかりません。',
      [ErrorCode.RESOURCE_NOT_AVAILABLE]: 'リソースが利用できません。',
      [ErrorCode.CONFLICT]: 'データが既に存在するか、競合が発生しました。',
      [ErrorCode.RATE_LIMIT_EXCEEDED]:
        'リクエストが多すぎます。しばらくしてから再試行してください。',
      [ErrorCode.SERVICE_UNAVAILABLE]: 'サービスが一時的に利用できません。',
      [ErrorCode.EXTERNAL_SERVICE_ERROR]:
        '外部サービスでエラーが発生しました。',
      [ErrorCode.DATABASE_ERROR]: 'データベースエラーが発生しました。',
      [ErrorCode.INTERNAL_ERROR]: 'システムエラーが発生しました。',
      [ErrorCode.BUSINESS_RULE_VIOLATION]: 'ビジネスルールに違反しています。',
    },
    en: {
      [ErrorCode.VALIDATION_ERROR]: 'Please check your input data.',
      [ErrorCode.INVALID_REQUEST]: 'Invalid request.',
      [ErrorCode.UNAUTHORIZED]: 'Login required.',
      [ErrorCode.TOKEN_EXPIRED]: 'Session expired. Please login again.',
      [ErrorCode.INVALID_TOKEN]: 'Invalid credentials. Please login again.',
      [ErrorCode.TOKEN_MISSING]: 'Login required.',
      [ErrorCode.FORBIDDEN]: 'You do not have permission for this operation.',
      [ErrorCode.OPERATION_NOT_ALLOWED]: 'This operation is not allowed.',
      [ErrorCode.NOT_FOUND]: 'The requested data was not found.',
      [ErrorCode.RESOURCE_NOT_AVAILABLE]: 'Resource is not available.',
      [ErrorCode.CONFLICT]: 'Data already exists or conflict occurred.',
      [ErrorCode.RATE_LIMIT_EXCEEDED]:
        'Too many requests. Please try again later.',
      [ErrorCode.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable.',
      [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'External service error occurred.',
      [ErrorCode.DATABASE_ERROR]: 'Database error occurred.',
      [ErrorCode.INTERNAL_ERROR]: 'System error occurred.',
      [ErrorCode.BUSINESS_RULE_VIOLATION]: 'Business rule violation.',
    },
  };

  return messages[locale][code] || messages[locale][ErrorCode.INTERNAL_ERROR];
}

/**
 * JavaScript Errorからユーザー向けメッセージを生成
 */
function getUserFriendlyJavaScriptErrorMessage(
  error: Error,
  classification: ErrorClassification,
  locale: 'ja' | 'en'
): string {
  if (classification.category === 'network') {
    return locale === 'ja'
      ? 'ネットワークエラーが発生しました。接続を確認してください。'
      : 'Network error occurred. Please check your connection.';
  }

  if (classification.category === 'user') {
    return locale === 'ja'
      ? '入力内容を確認してください。'
      : 'Please check your input.';
  }

  return locale === 'ja'
    ? 'エラーが発生しました。しばらくしてから再試行してください。'
    : 'An error occurred. Please try again later.';
}

/**
 * エラーハンドリングのオプション
 */
export interface ErrorHandlingOptions {
  showToast?: boolean;
  logError?: boolean;
  retryable?: boolean;
  maxRetries?: number;
  onRetry?: () => void;
  onError?: (error: Error | ApiErrorResponse) => void;
}

/**
 * 統一エラーハンドリング関数
 */
export async function handleError(
  error: Error | ApiErrorResponse,
  options: ErrorHandlingOptions = {}
): Promise<void> {
  const {
    showToast = true,
    logError = true,
    retryable = false,
    maxRetries = 3,
    onRetry,
    onError,
  } = options;

  const classification = classifyError(error);

  // エラーログ出力
  if (logError) {
    console.error('Error handled:', {
      error,
      classification,
      timestamp: new Date().toISOString(),
    });
  }

  // カスタムエラーハンドラーの実行
  if (onError) {
    onError(error);
  }

  // リトライ可能な場合の処理
  if (retryable && classification.isRetryable && onRetry) {
    // リトライ回数の管理は呼び出し側で実装
    onRetry();
  }

  // トースト通知の表示
  if (showToast && typeof window !== 'undefined') {
    const message = getUserFriendlyMessage(error);
    // トースト表示は別途実装されるトーストシステムを使用
    console.warn('Toast message:', message);
  }
}
