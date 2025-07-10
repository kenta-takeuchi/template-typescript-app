/**
 * React Error Boundary コンポーネント
 * アプリケーション全体のJavaScriptエラーをキャッチし、適切にハンドリングする
 */

import { isApiErrorResponse } from '@template/types';
import { errorLogger } from '@template/utils';
import React, { Component, ErrorInfo, ReactNode } from 'react';

import { useToast } from '../Toast';

/**
 * Error Boundaryの状態インターフェース
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * Error Boundaryコンポーネントのプロパティ
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (_error: Error, _errorInfo: ErrorInfo, _errorId: string) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
  showToast?: boolean;
  toastLevel?: 'error' | 'warning';
}

/**
 * Error Boundaryクラスコンポーネント
 * React 18のエラーハンドリングパターンに準拠
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  /**
   * エラーが発生した際に状態を更新
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  /**
   * エラー情報をログに記録
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    const { errorId } = this.state;

    // エラー情報を記録
    this.setState({ errorInfo });

    // エラーの分類と処理
    const enhancedError = this.enhanceError(error, errorInfo, level);

    // 構造化ログ出力
    errorLogger.logError(
      enhancedError,
      'React Error Boundary caught an error',
      {
        component: 'ErrorBoundary',
        level,
        errorId: errorId || 'unknown',
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      }
    );

    // カスタムエラーハンドラの実行
    if (onError && errorId) {
      try {
        onError(error, errorInfo, errorId);
      } catch (handlerError) {
        console.error('Error in onError handler:', handlerError);
      }
    }

    // 開発環境でのコンソール出力
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 React Error Boundary (${level})`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error ID:', errorId);
      console.groupEnd();
    }
  }

  /**
   * プロパティ変更時のリセット処理
   */
  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => prevProps.resetKeys?.[index] !== key
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  /**
   * コンポーネントのアンマウント処理
   */
  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  /**
   * エラー情報の拡張
   */
  private enhanceError(
    error: Error,
    errorInfo: ErrorInfo,
    level: string
  ): Error {
    const enhancedError = new Error(error.message);
    enhancedError.name = `${error.name}[ErrorBoundary:${level}]`;
    enhancedError.stack = error.stack;

    // Error Boundary固有の情報を追加
    (enhancedError as any).componentStack = errorInfo.componentStack;
    (enhancedError as any).errorBoundaryLevel = level;
    (enhancedError as any).timestamp = new Date().toISOString();

    return enhancedError;
  }

  /**
   * Error Boundaryの状態をリセット
   */
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  /**
   * 自動復旧の試行
   */
  private attemptAutoRecovery = () => {
    const { isolate } = this.props;

    // 分離モードでない場合のみ自動復旧を試行
    if (!isolate) {
      this.resetTimeoutId = window.setTimeout(() => {
        this.resetErrorBoundary();
      }, 5000); // 5秒後に自動復旧を試行
    }
  };

  render() {
    const { hasError, error, errorInfo, errorId } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError) {
      // カスタムフォールバックUIがある場合
      if (fallback) {
        return fallback;
      }

      // デフォルトのエラーフォールバックUI
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          errorId={errorId}
          level={level}
          onRetry={this.resetErrorBoundary}
          onAutoRecovery={this.attemptAutoRecovery}
        />
      );
    }

    return children;
  }
}

/**
 * デフォルトのエラーフォールバックUIコンポーネント
 */
interface DefaultErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  level: string;
  onRetry: () => void;
  onAutoRecovery: () => void;
}

/**
 * Toast通知機能付きError Boundaryラッパー
 */
interface ErrorBoundaryWithToastProps extends ErrorBoundaryProps {
  children: ReactNode;
}

export const ErrorBoundaryWithToast: React.FC<
  ErrorBoundaryWithToastProps
> = props => {
  const {
    showToast: _showToast = true,
    toastLevel: _toastLevel = 'error',
    ...errorBoundaryProps
  } = props;

  const handleError = (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    // 既存のonErrorコールバックを実行
    if (props.onError) {
      props.onError(error, errorInfo, errorId);
    }

    // Toast通知機能は関数コンポーネント内で使用するため、
    // ErrorBoundaryWithToastProvider で実装
  };

  return <ErrorBoundary {...errorBoundaryProps} onError={handleError} />;
};

/**
 * Toast Provider付きError Boundary
 */
export const ErrorBoundaryWithToastProvider: React.FC<
  ErrorBoundaryWithToastProps
> = props => {
  return <ErrorBoundaryToastHandler {...props} />;
};

/**
 * Toast通知を処理する内部コンポーネント
 */
const ErrorBoundaryToastHandler: React.FC<
  ErrorBoundaryWithToastProps
> = props => {
  const {
    showToast = true,
    toastLevel = 'error',
    ...errorBoundaryProps
  } = props;
  const { error: toastError, warning: toastWarning } = useToast();

  const handleError = React.useCallback(
    (error: Error, errorInfo: ErrorInfo, errorId: string) => {
      // 既存のonErrorコールバックを実行
      if (props.onError) {
        props.onError(error, errorInfo, errorId);
      }

      // Toast通知を表示
      if (showToast) {
        const isAPIError = error && isApiErrorResponse(error);

        const toastMessage = isAPIError
          ? 'サーバーとの通信でエラーが発生しました'
          : 'アプリケーションでエラーが発生しました';

        const toastDescription =
          props.level === 'page'
            ? 'ページを再読み込みしてください'
            : '操作を再試行してください';

        if (toastLevel === 'error') {
          toastError(toastMessage, {
            description: `${toastDescription} (ID: ${errorId})`,
            duration: 8000,
          });
        } else {
          toastWarning(toastMessage, {
            description: `${toastDescription} (ID: ${errorId})`,
            duration: 5000,
          });
        }
      }
    },
    [
      props.onError,
      showToast,
      toastLevel,
      props.level,
      toastError,
      toastWarning,
    ]
  );

  return <ErrorBoundary {...errorBoundaryProps} onError={handleError} />;
};

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  errorInfo: _errorInfo,
  errorId,
  level,
  onRetry,
  onAutoRecovery,
}) => {
  const isAPIError = error && isApiErrorResponse(error);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // レベルに応じたスタイリング
  const getLevelStyles = () => {
    switch (level) {
      case 'page':
        return 'min-h-screen bg-gray-50 flex items-center justify-center p-4';
      case 'section':
        return 'min-h-96 bg-gray-50 flex items-center justify-center p-8 rounded-lg border';
      case 'component':
      default:
        return 'min-h-32 bg-red-50 flex items-center justify-center p-4 rounded border-2 border-red-200';
    }
  };

  return (
    <div className={getLevelStyles()}>
      <div className="max-w-md w-full text-center">
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
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
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {level === 'page'
            ? 'ページでエラーが発生しました'
            : 'エラーが発生しました'}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          {isAPIError
            ? 'サーバーとの通信でエラーが発生しました。しばらく時間をおいて再度お試しください。'
            : '予期しないエラーが発生しました。ページを再読み込みするか、しばらく時間をおいて再度お試しください。'}
        </p>

        {isDevelopment && (
          <details className="text-left mb-4 p-2 bg-gray-100 rounded text-xs">
            <summary className="cursor-pointer font-medium">開発者情報</summary>
            <div className="mt-2 space-y-2">
              <div>
                <strong>Error ID:</strong> {errorId}
              </div>
              <div>
                <strong>Error:</strong> {error?.message}
              </div>
              <div>
                <strong>Level:</strong> {level}
              </div>
              {error?.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap text-xs">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col space-y-2">
          <button
            onClick={onRetry}
            className="w-full inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            再試行
          </button>

          {level !== 'page' && (
            <button
              onClick={onAutoRecovery}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              自動復旧を試行
            </button>
          )}

          {level === 'page' && (
            <button
              onClick={() => window.location.reload()}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              ページを再読み込み
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
