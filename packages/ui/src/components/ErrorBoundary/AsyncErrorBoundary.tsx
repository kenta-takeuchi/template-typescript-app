/**
 * 非同期処理用のError Boundary
 * API呼び出しやデータ取得処理で発生するエラーを専門的に処理
 */

import { isApiErrorResponse, ErrorCode } from '@template/types';
import React, { ReactNode, useState, useEffect, useCallback } from 'react';

import { ErrorBoundary } from './ErrorBoundary';
import { useAsyncErrorBoundary } from './useErrorBoundary';

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void | Promise<void>;
  maxRetries?: number;
  retryDelay?: number;
  fallback?: ReactNode;
}

/**
 * 非同期エラー用のフォールバックUI
 */
const AsyncErrorFallback: React.FC<{
  error?: Error | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryCount?: number;
  maxRetries?: number;
}> = ({
  error,
  onRetry,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
}) => {
  const isApiError = error && isApiErrorResponse(error);
  const canRetry = retryCount < maxRetries && onRetry;

  // エラーの種類に応じたメッセージとアクション
  const getErrorInfo = () => {
    if (isApiError) {
      const apiError = error as any; // APIエラーの型アサーション
      const errorCode = apiError.error?.code;

      switch (errorCode) {
        case ErrorCode.UNAUTHORIZED:
          return {
            title: '認証エラー',
            message: 'セッションが無効です。再度ログインしてください。',
            action: '再ログイン',
            canRetry: false,
          };
        case ErrorCode.FORBIDDEN:
          return {
            title: 'アクセス権限エラー',
            message: 'この操作を実行する権限がありません。',
            action: null,
            canRetry: false,
          };
        case ErrorCode.NOT_FOUND:
          return {
            title: 'データが見つかりません',
            message: '要求されたデータが見つかりませんでした。',
            action: '再試行',
            canRetry: true,
          };
        case ErrorCode.RATE_LIMIT_EXCEEDED:
          return {
            title: 'リクエスト制限',
            message:
              'リクエストが制限されています。しばらく時間をおいてお試しください。',
            action: '再試行',
            canRetry: true,
          };
        case ErrorCode.SERVICE_UNAVAILABLE:
          return {
            title: 'サービス一時停止',
            message:
              'サービスが一時的に利用できません。しばらく時間をおいてお試しください。',
            action: '再試行',
            canRetry: true,
          };
        default:
          return {
            title: '通信エラー',
            message: 'サーバーとの通信でエラーが発生しました。',
            action: '再試行',
            canRetry: true,
          };
      }
    }

    return {
      title: 'エラーが発生しました',
      message: 'データの取得でエラーが発生しました。',
      action: '再試行',
      canRetry: true,
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            {errorInfo.title}
          </h3>
          <p className="mt-1 text-sm text-yellow-700">{errorInfo.message}</p>

          <div className="mt-3 flex items-center space-x-3">
            {canRetry && errorInfo.canRetry && (
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-700"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    再試行中...
                  </>
                ) : (
                  errorInfo.action
                )}
              </button>
            )}

            {retryCount > 0 && (
              <span className="text-xs text-yellow-600">
                再試行 {retryCount}/{maxRetries}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 非同期処理用のError Boundary
 * API呼び出しやデータ取得のエラーを専門的に処理
 */
export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  onRetry,
  maxRetries = 3,
  retryDelay = 1000,
  fallback,
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const { executeAsync } = useAsyncErrorBoundary();

  /**
   * リトライ処理の実行
   */
  const handleRetry = useCallback(async () => {
    if (!onRetry || retryCount >= maxRetries) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      // リトライ遅延
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      // リトライ処理の実行
      await executeAsync(async () => {
        if (onRetry) {
          await onRetry();
        }
      });

      // 成功時はカウンターをリセット
      setRetryCount(0);
      setLastError(null);
    } catch (error) {
      console.error('Retry failed:', error);
      setLastError(error instanceof Error ? error : new Error('Retry failed'));
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, retryCount, maxRetries, retryDelay, executeAsync]);

  /**
   * エラーハンドラ
   */
  const handleError = useCallback(
    (error: Error, errorInfo: React.ErrorInfo, errorId: string) => {
      setLastError(error);

      console.warn('Async operation failed:', {
        error: error.message,
        errorId,
        retryCount,
        canRetry: retryCount < maxRetries,
      });
    },
    [retryCount, maxRetries]
  );

  /**
   * retryCountの変更時に自動リセット
   */
  useEffect(() => {
    if (retryCount === 0) {
      setLastError(null);
    }
  }, [retryCount]);

  const customFallback = fallback || (
    <AsyncErrorFallback
      error={lastError}
      onRetry={handleRetry}
      isRetrying={isRetrying}
      retryCount={retryCount}
      maxRetries={maxRetries}
    />
  );

  return (
    <ErrorBoundary
      level="component"
      fallback={customFallback}
      onError={handleError}
      resetKeys={[retryCount]}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  );
};
