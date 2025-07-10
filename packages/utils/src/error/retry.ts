/**
 * エラーリトライユーティリティ
 */

import {
  ApiErrorResponse,
  ErrorCode,
  isApiErrorResponse,
} from '@template/types';
import { classifyError } from './error-handler';
import { errorLogger } from './error-logger';

/**
 * リトライ設定
 */
export interface RetryOptions {
  maxRetries: number;
  baseDelay: number; // ミリ秒
  maxDelay: number; // ミリ秒
  backoffMultiplier: number;
  retryableErrors?: ErrorCode[];
  onRetry?: (attempt: number, error: Error | ApiErrorResponse) => void;
  onMaxRetriesReached?: (error: Error | ApiErrorResponse) => void;
}

/**
 * デフォルトリトライ設定
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    ErrorCode.RATE_LIMIT_EXCEEDED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ErrorCode.EXTERNAL_SERVICE_ERROR,
    ErrorCode.DATABASE_ERROR,
  ],
};

/**
 * 指数バックオフによる遅延計算
 */
export function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
  const jitter = Math.random() * 0.1 * delay; // 10%のジッターを追加
  return Math.min(delay + jitter, maxDelay);
}

/**
 * エラーがリトライ可能かどうかを判定
 */
export function isRetryableError(
  error: Error | ApiErrorResponse,
  retryableErrors: ErrorCode[] = DEFAULT_RETRY_OPTIONS.retryableErrors!
): boolean {
  // APIエラーレスポンスの場合
  if (isApiErrorResponse(error)) {
    return retryableErrors.includes(error.error.code);
  }

  // JavaScript Errorの場合、分類を使用
  const classification = classifyError(error);
  return classification.isRetryable;
}

/**
 * 遅延実行のユーティリティ
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * リトライ機能付き関数実行
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | ApiErrorResponse;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      const result = await fn();

      // 成功した場合、以前に失敗していればログ出力
      if (attempt > 1) {
        errorLogger.logInfo(`Function succeeded after ${attempt - 1} retries`);
      }

      return result;
    } catch (error) {
      lastError = error as Error | ApiErrorResponse;

      // 最後の試行の場合
      if (attempt > config.maxRetries) {
        if (config.onMaxRetriesReached) {
          config.onMaxRetriesReached(lastError);
        }

        errorLogger.logError(
          lastError,
          `Function failed after ${config.maxRetries} retries`,
          { totalAttempts: attempt - 1 }
        );

        throw lastError;
      }

      // リトライ可能エラーかチェック
      if (!isRetryableError(lastError, config.retryableErrors)) {
        errorLogger.logError(lastError, 'Non-retryable error encountered', {
          attempt,
        });
        throw lastError;
      }

      // リトライコールバック実行
      if (config.onRetry) {
        config.onRetry(attempt, lastError);
      }

      // 遅延実行
      const delayMs = calculateDelay(
        attempt,
        config.baseDelay,
        config.maxDelay,
        config.backoffMultiplier
      );

      errorLogger.logWarning(
        `Retrying after error (attempt ${attempt}/${config.maxRetries})`,
        {
          error: lastError,
          delayMs,
          nextAttempt: attempt + 1,
        }
      );

      await delay(delayMs);
    }
  }

  // 理論上ここには到達しないが、TypeScriptの型チェックのため
  throw lastError!;
}

/**
 * 特定のエラーコードに対するリトライ戦略
 */
export const RETRY_STRATEGIES: Partial<
  Record<ErrorCode, Partial<RetryOptions>>
> = {
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    maxRetries: 5,
    baseDelay: 5000,
    maxDelay: 60000,
    backoffMultiplier: 2,
  },
  [ErrorCode.SERVICE_UNAVAILABLE]: {
    maxRetries: 3,
    baseDelay: 2000,
    maxDelay: 20000,
    backoffMultiplier: 2,
  },
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 15000,
    backoffMultiplier: 1.5,
  },
  [ErrorCode.DATABASE_ERROR]: {
    maxRetries: 2,
    baseDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 2,
  },
};

/**
 * エラーコードに基づく自動リトライ設定取得
 */
export function getRetryOptionsForError(
  error: Error | ApiErrorResponse
): Partial<RetryOptions> {
  if (isApiErrorResponse(error)) {
    return RETRY_STRATEGIES[error.error.code] || {};
  }

  const classification = classifyError(error);

  // ネットワークエラーの場合
  if (classification.category === 'network') {
    return {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 1.5,
    };
  }

  return {};
}

/**
 * APIコール用のリトライラッパー
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  customOptions?: Partial<RetryOptions>
): Promise<T> {
  return withRetry(apiCall, {
    ...DEFAULT_RETRY_OPTIONS,
    ...customOptions,
    onRetry: (attempt, error) => {
      errorLogger.logWarning(`API call retry attempt ${attempt}`, { error });

      if (customOptions?.onRetry) {
        customOptions.onRetry(attempt, error);
      }
    },
  });
}

/**
 * 複数のAPIコールを並列実行（一部失敗しても成功したものは返す）
 */
export async function retryParallelCalls<T>(
  apiCalls: (() => Promise<T>)[],
  options?: Partial<RetryOptions>
): Promise<{ results: T[]; errors: (Error | ApiErrorResponse)[] }> {
  const promises = apiCalls.map(call =>
    withRetry(call, options).catch(error => ({ error }))
  );

  const outcomes = await Promise.all(promises);

  const results: T[] = [];
  const errors: (Error | ApiErrorResponse)[] = [];

  outcomes.forEach(outcome => {
    if (outcome && typeof outcome === 'object' && 'error' in outcome) {
      errors.push(outcome.error);
    } else {
      results.push(outcome as T);
    }
  });

  return { results, errors };
}
