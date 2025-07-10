/**
 * ページレベルのError Boundary
 * アプリケーション全体をラップし、致命的なエラーを処理
 */

import React, { ReactNode } from 'react';

import { ErrorBoundary } from './ErrorBoundary';

interface PageErrorBoundaryProps {
  children: ReactNode;
  appName?: string;
  onError?: (
    _error: Error,
    _errorInfo: React.ErrorInfo,
    _errorId: string
  ) => void;
}

/**
 * ページ全体のエラーフォールバックUI
 */
const PageErrorFallback: React.FC<{
  appName?: string;
  onRetry?: () => void;
}> = ({ appName = 'アプリケーション', onRetry: _onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full space-y-8 text-center">
      <div>
        <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-12 w-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          {appName}でエラーが発生しました
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          予期しないエラーが発生しました。お手数ですが、ページを再読み込みしてください。
          問題が続く場合は、サポートにお問い合わせください。
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => window.location.reload()}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ページを再読み込み
        </button>

        <button
          onClick={() => window.history.back()}
          className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          前のページに戻る
        </button>

        <a
          href="/"
          className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ホームページに戻る
        </a>
      </div>

      <div className="text-xs text-gray-500">
        このエラーは自動的に記録されました。
        <br />
        継続的に問題が発生する場合は、サポートまでご連絡ください。
      </div>
    </div>
  </div>
);

/**
 * ページレベルのError Boundary
 * アプリケーション全体の最上位でエラーをキャッチ
 */
export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  appName,
  onError,
}) => {
  const handleError = (
    error: Error,
    errorInfo: React.ErrorInfo,
    errorId: string
  ) => {
    // カスタムエラーハンドラがある場合は実行
    onError?.(error, errorInfo, errorId);

    // 重要なエラーを外部サービスに送信（実装例）
    if (typeof window !== 'undefined') {
      // Google Analytics等の分析ツールへのエラー送信
      if ((window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: `${error.name}: ${error.message}`,
          fatal: true,
          error_id: errorId,
        });
      }

      // Sentry等のエラートラッキングサービスへの送信
      if ((window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          tags: {
            errorBoundary: 'page',
            errorId,
          },
          extra: {
            componentStack: errorInfo.componentStack,
          },
        });
      }
    }
  };

  return (
    <ErrorBoundary
      level="page"
      fallback={<PageErrorFallback appName={appName} />}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};
