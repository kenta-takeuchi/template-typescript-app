/**
 * Error Boundary関連のカスタムフック
 * 関数コンポーネントからError Boundaryの機能を利用するためのユーティリティ
 */

import { useCallback, useState } from 'react';

/**
 * エラー情報の型定義
 */
interface ErrorBoundaryError {
  error: Error;
  errorId: string;
  timestamp: string;
}

/**
 * useErrorBoundaryフックの戻り値
 */
interface UseErrorBoundaryReturn {
  /** 手動でエラーを発生させる関数 */
  reportError: (_error: Error | string) => void;
  /** 最後に発生したエラー情報 */
  lastError: ErrorBoundaryError | null;
  /** エラー状態をクリアする関数 */
  clearError: () => void;
  /** エラーが発生しているかのフラグ */
  hasError: boolean;
}

/**
 * Error Boundaryとの連携を提供するカスタムフック
 *
 * 主な機能:
 * - 関数コンポーネント内からError Boundaryにエラーを報告
 * - 非同期処理のエラーをError Boundaryで捕捉
 * - カスタムエラーの生成と報告
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { reportError } = useErrorBoundary();
 *
 *   const handleAsyncOperation = async () => {
 *     try {
 *       await riskyAsyncOperation();
 *     } catch (error) {
 *       reportError(error); // Error Boundaryで捕捉される
 *     }
 *   };
 *
 *   return <button onClick={handleAsyncOperation}>実行</button>;
 * }
 * ```
 */
export function useErrorBoundary(): UseErrorBoundaryReturn {
  const [lastError, setLastError] = useState<ErrorBoundaryError | null>(null);

  /**
   * エラーをError Boundaryに報告する関数
   * React の setState の特性を利用してエラーを再スローする
   */
  const reportError = useCallback((error: Error | string) => {
    const errorObject = error instanceof Error ? error : new Error(error);
    const errorId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // エラー情報を記録
    const errorInfo: ErrorBoundaryError = {
      error: errorObject,
      errorId,
      timestamp,
    };

    setLastError(errorInfo);

    // Error Boundaryで捕捉されるようにエラーを再スロー
    // React 18のconcurrent featuresに対応するため、setStateのコールバック内でスロー
    setLastError(_prev => {
      throw errorObject;
    });
  }, []);

  /**
   * エラー状態をクリアする関数
   */
  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  return {
    reportError,
    lastError,
    clearError,
    hasError: lastError !== null,
  };
}

/**
 * 非同期処理用のエラーハンドリングフック
 * Promise の rejection を Error Boundary で捕捉可能にする
 *
 * @example
 * ```tsx
 * function AsyncComponent() {
 *   const { executeAsync } = useAsyncErrorBoundary();
 *
 *   const handleClick = () => {
 *     executeAsync(async () => {
 *       const data = await fetchData();
 *       // 成功時の処理
 *       return data;
 *     });
 *   };
 *
 *   return <button onClick={handleClick}>データを取得</button>;
 * }
 * ```
 */
export function useAsyncErrorBoundary() {
  const { reportError } = useErrorBoundary();

  /**
   * 非同期処理を実行し、エラーをError Boundaryで捕捉
   */
  const executeAsync = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T | void> => {
      try {
        return await asyncFn();
      } catch (error) {
        reportError(error instanceof Error ? error : new Error(String(error)));
      }
    },
    [reportError]
  );

  /**
   * 複数の非同期処理を並行実行し、エラーをError Boundaryで捕捉
   */
  const executeAsyncParallel = useCallback(
    async <T>(asyncFns: Array<() => Promise<T>>): Promise<Array<T | Error>> => {
      const results = await Promise.allSettled(asyncFns.map(fn => fn()));

      const values: Array<T | Error> = [];
      let hasError = false;

      for (const result of results) {
        if (result.status === 'fulfilled') {
          values.push(result.value);
        } else {
          const error =
            result.reason instanceof Error
              ? result.reason
              : new Error(String(result.reason));
          values.push(error);
          hasError = true;
        }
      }

      // いずれかでエラーが発生した場合、最初のエラーをreport
      if (hasError) {
        const firstError = values.find(v => v instanceof Error) as Error;
        reportError(firstError);
      }

      return values;
    },
    [reportError]
  );

  return {
    executeAsync,
    executeAsyncParallel,
  };
}

/**
 * Error Boundary のリセット機能を提供するフック
 * 特定の条件下でError Boundaryの状態をリセットする
 *
 * @param resetKeys リセットのトリガーとなるキーの配列
 * @param delay リセットの遅延時間（ミリ秒）
 */
export function useErrorBoundaryReset(
  resetKeys?: Array<string | number>,
  delay: number = 0
) {
  const [resetCount, setResetCount] = useState(0);

  /**
   * Error Boundaryをリセットする関数
   */
  const resetErrorBoundary = useCallback(() => {
    if (delay > 0) {
      setTimeout(() => {
        setResetCount(prev => prev + 1);
      }, delay);
    } else {
      setResetCount(prev => prev + 1);
    }
  }, [delay]);

  /**
   * 自動リセット機能
   * resetKeysが変更された際に自動的にリセット
   */
  const autoReset = useCallback(() => {
    resetErrorBoundary();
  }, [resetErrorBoundary]);

  return {
    resetCount,
    resetErrorBoundary,
    autoReset,
    resetKeys: resetKeys ? [...resetKeys, resetCount] : [resetCount],
  };
}

/**
 * Error Boundary の統計情報を提供するフック
 * 開発・デバッグ用途
 */
export function useErrorBoundaryStats() {
  const [stats, setStats] = useState({
    totalErrors: 0,
    lastErrorTime: null as string | null,
    errorFrequency: [] as string[],
  });

  /**
   * エラー統計を更新
   */
  const recordError = useCallback((errorId: string) => {
    setStats(prev => ({
      totalErrors: prev.totalErrors + 1,
      lastErrorTime: new Date().toISOString(),
      errorFrequency: [...prev.errorFrequency.slice(-9), errorId], // 最新10件を保持
    }));
  }, []);

  /**
   * 統計をリセット
   */
  const resetStats = useCallback(() => {
    setStats({
      totalErrors: 0,
      lastErrorTime: null,
      errorFrequency: [],
    });
  }, []);

  return {
    stats,
    recordError,
    resetStats,
  };
}
