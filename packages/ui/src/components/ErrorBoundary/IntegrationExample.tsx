/**
 * Error Boundary + Toast システムの統合使用例
 * 実際のアプリケーションでの使用パターンを示すサンプルコード
 */

import React from 'react';

import { ToastProvider } from '../Toast';

import {
  ErrorBoundaryWithToastProvider,
  GlobalErrorProvider,
  useGlobalError,
  useErrorReporter,
} from './index';

/**
 * アプリケーション全体のエラーハンドリング設定例
 */
export const AppWithErrorHandling: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ToastProvider>
      <GlobalErrorProvider
        enableToastNotifications={true}
        enableGlobalHandlers={true}
        maxErrorsInMemory={100}
      >
        <ErrorBoundaryWithToastProvider
          level="page"
          showToast={true}
          toastLevel="error"
        >
          {children}
        </ErrorBoundaryWithToastProvider>
      </GlobalErrorProvider>
    </ToastProvider>
  );
};

/**
 * ページレベルのエラーハンドリング例
 */
export const PageWithErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ErrorBoundaryWithToastProvider
      level="page"
      showToast={true}
      toastLevel="error"
      resetOnPropsChange={true}
      resetKeys={[]} // ページ遷移時のリセット用
    >
      {children}
    </ErrorBoundaryWithToastProvider>
  );
};

/**
 * セクションレベルのエラーハンドリング例
 */
export const SectionWithErrorBoundary: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <ErrorBoundaryWithToastProvider
      level="section"
      showToast={true}
      toastLevel="warning"
      isolate={true}
    >
      {children}
    </ErrorBoundaryWithToastProvider>
  );
};

/**
 * APIコール用のエラーハンドリングフック例
 */
export const useApiWithErrorHandling = () => {
  const reportError = useErrorReporter();

  const fetchWithErrorHandling = React.useCallback(
    async (url: string) => {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          const error = new Error(`API Error: ${response.status}`);
          (error as any).status = response.status;
          (error as any).statusText = response.statusText;

          reportError(error, {
            url,
            status: response.status,
            statusText: response.statusText,
          });

          throw error;
        }

        return response.json();
      } catch (error) {
        if (error instanceof Error) {
          reportError(error, { url, type: 'fetch_error' });
        }
        throw error;
      }
    },
    [reportError]
  );

  return { fetchWithErrorHandling };
};

/**
 * フォーム送信でのエラーハンドリング例
 */
export const useFormWithErrorHandling = () => {
  const reportError = useErrorReporter();

  const submitForm = React.useCallback(
    async (formData: FormData) => {
      try {
        // フォームバリデーション
        if (!formData.get('email')) {
          const validationError = new Error(
            'メールアドレスが入力されていません'
          );
          reportError(validationError, {
            type: 'validation_error',
            field: 'email',
          });
          return { success: false, error: validationError };
        }

        // API送信
        const response = await fetch('/api/submit', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const apiError = new Error('フォーム送信に失敗しました');
          (apiError as any).status = response.status;

          reportError(apiError, {
            type: 'form_submission_error',
            url: '/api/submit',
            status: response.status,
          });

          return { success: false, error: apiError };
        }

        return { success: true, data: await response.json() };
      } catch (error) {
        if (error instanceof Error) {
          reportError(error, { type: 'form_error' });
        }
        return { success: false, error };
      }
    },
    [reportError]
  );

  return { submitForm };
};

/**
 * エラー統計表示コンポーネント例（開発環境用）
 */
export const ErrorStatsDisplay: React.FC = () => {
  const { getErrorStats, getUnhandledErrors } = useGlobalError();
  const stats = getErrorStats();
  const unhandledErrors = getUnhandledErrors();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="text-sm font-bold mb-2">🐛 Error Stats (Dev)</h3>
      <div className="text-xs space-y-1">
        <div>Total: {stats.total}</div>
        <div>Unhandled: {stats.unhandled}</div>
        <div>Session: {stats.session}</div>
        <div>
          Last:{' '}
          {stats.lastErrorAgo > 0
            ? `${Math.round(stats.lastErrorAgo / 1000)}s ago`
            : 'None'}
        </div>

        {unhandledErrors.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer">
              Unhandled ({unhandledErrors.length})
            </summary>
            <div className="mt-1 max-h-32 overflow-y-auto">
              {unhandledErrors.map(error => (
                <div
                  key={error.id}
                  className="text-xs p-1 bg-red-900 rounded mb-1"
                >
                  <div>{error.error.message}</div>
                  <div className="text-gray-400">
                    {error.level} / {error.source}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

/**
 * 非同期処理でのエラーハンドリング例
 */
export const AsyncOperationComponent: React.FC = () => {
  const reportError = useErrorReporter();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);

  const handleAsyncOperation = React.useCallback(async () => {
    setLoading(true);

    try {
      // 複数の非同期処理を順次実行
      const result1 = await fetchData('/api/data1');
      const result2 = await fetchData('/api/data2');
      const result3 = await processData(result1, result2);

      setData(result3);
    } catch (error) {
      if (error instanceof Error) {
        reportError(error, {
          operation: 'async_data_fetch',
          step: 'data_processing',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [reportError]);

  return (
    <div>
      <button
        onClick={handleAsyncOperation}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Start Async Operation'}
      </button>

      {data && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          Operation completed successfully!
        </div>
      )}
    </div>
  );
};

// ヘルパー関数
async function fetchData(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return response.json();
}

async function processData(data1: any, data2: any) {
  // データ処理のシミュレーション
  if (!data1 || !data2) {
    throw new Error('Invalid data for processing');
  }
  return { processed: true, data1, data2 };
}
