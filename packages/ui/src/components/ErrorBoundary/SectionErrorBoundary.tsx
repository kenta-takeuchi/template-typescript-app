/**
 * セクションレベルのError Boundary
 * ページ内の特定のセクション（サイドバー、コンテンツエリア等）で発生するエラーを処理
 */

import React, { ReactNode } from 'react';

import { ErrorBoundary } from './ErrorBoundary';
import { useErrorBoundaryReset } from './useErrorBoundary';

interface SectionErrorBoundaryProps {
  children: ReactNode;
  sectionName?: string;
  fallback?: ReactNode;
  isolate?: boolean;
  retryable?: boolean;
  onError?: (
    _error: Error,
    _errorInfo: React.ErrorInfo,
    _errorId: string
  ) => void;
  resetKeys?: Array<string | number>;
}

/**
 * セクション用のエラーフォールバックUI
 */
const SectionErrorFallback: React.FC<{
  sectionName?: string;
  retryable?: boolean;
  onRetry?: () => void;
}> = ({ sectionName = 'セクション', retryable = true, onRetry }) => (
  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 m-4">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <svg
          className="h-8 w-8 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-red-800">
          {sectionName}でエラーが発生しました
        </h3>
        <p className="mt-2 text-sm text-red-700">
          このセクションの読み込みに失敗しました。他の機能は正常に動作します。
        </p>
        {retryable && (
          <div className="mt-4">
            <button
              onClick={onRetry}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg
                className="-ml-0.5 mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              再読み込み
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

/**
 * セクションレベルのError Boundary
 * ページ内の特定エリアのエラーを分離してハンドリング
 */
export const SectionErrorBoundary: React.FC<SectionErrorBoundaryProps> = ({
  children,
  sectionName,
  fallback,
  isolate = true,
  retryable = true,
  onError,
  resetKeys: externalResetKeys,
}) => {
  const { resetErrorBoundary, resetKeys } =
    useErrorBoundaryReset(externalResetKeys);

  const handleError = (
    error: Error,
    errorInfo: React.ErrorInfo,
    errorId: string
  ) => {
    // カスタムエラーハンドラがある場合は実行
    onError?.(error, errorInfo, errorId);

    // セクション固有のエラー処理ロジック
    console.warn(`Section error in ${sectionName}:`, {
      error: error.message,
      errorId,
      section: sectionName,
    });
  };

  const customFallback = fallback || (
    <SectionErrorFallback
      sectionName={sectionName}
      retryable={retryable}
      onRetry={resetErrorBoundary}
    />
  );

  return (
    <ErrorBoundary
      level="section"
      fallback={customFallback}
      onError={handleError}
      isolate={isolate}
      resetKeys={resetKeys}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  );
};
