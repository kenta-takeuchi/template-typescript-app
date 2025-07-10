/**
 * グローバルエラーコンテキスト
 * アプリケーション全体でのエラー状態管理とToast通知の統合
 */

import { isApiErrorResponse } from '@template/types';
import { errorLogger } from '@template/utils';
import React, {
  createContext,
  useContext,
  useCallback,
  useReducer,
  useEffect,
} from 'react';

/**
 * エラー情報の型定義
 */
export interface GlobalError {
  id: string;
  error: Error;
  timestamp: number;
  level: 'page' | 'section' | 'component' | 'global';
  source: 'boundary' | 'handler' | 'promise' | 'manual';
  handled: boolean;
  retryCount: number;
  context?: Record<string, unknown>;
}

/**
 * グローバルエラー状態の型定義
 */
interface GlobalErrorState {
  errors: GlobalError[];
  isRecovering: boolean;
  lastErrorTime: number;
  errorCount: number;
  sessionErrorCount: number;
}

/**
 * エラーアクションの型定義
 */
type ErrorAction =
  | {
      type: 'ADD_ERROR';
      payload: Omit<GlobalError, 'id' | 'timestamp' | 'handled' | 'retryCount'>;
    }
  | { type: 'MARK_HANDLED'; payload: string }
  | { type: 'RETRY_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'SET_RECOVERING'; payload: boolean }
  | { type: 'INCREMENT_SESSION_COUNT' };

/**
 * グローバルエラーコンテキストの値
 */
interface GlobalErrorContextValue {
  state: GlobalErrorState;
  reportError: (
    _error: Error,
    _options?: Partial<Pick<GlobalError, 'level' | 'source' | 'context'>>
  ) => string;
  markErrorHandled: (_errorId: string) => void;
  retryError: (_errorId: string) => void;
  clearError: (_errorId: string) => void;
  clearAllErrors: () => void;
  getUnhandledErrors: () => GlobalError[];
  getErrorStats: () => {
    total: number;
    unhandled: number;
    session: number;
    lastErrorAgo: number;
  };
  onToastNotification?: (_config: ToastNotificationConfig) => void;
}

/**
 * Toast通知設定の型定義
 */
export interface ToastNotificationConfig {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  duration: number;
}

const GlobalErrorContext = createContext<GlobalErrorContextValue | null>(null);

/**
 * エラー状態のリデューサー
 */
function errorReducer(
  state: GlobalErrorState,
  action: ErrorAction
): GlobalErrorState {
  switch (action.type) {
    case 'ADD_ERROR': {
      const error: GlobalError = {
        ...action.payload,
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        handled: false,
        retryCount: 0,
      };

      return {
        ...state,
        errors: [...state.errors, error],
        lastErrorTime: Date.now(),
        errorCount: state.errorCount + 1,
        sessionErrorCount: state.sessionErrorCount + 1,
      };
    }

    case 'MARK_HANDLED': {
      return {
        ...state,
        errors: state.errors.map(error =>
          error.id === action.payload ? { ...error, handled: true } : error
        ),
      };
    }

    case 'RETRY_ERROR': {
      return {
        ...state,
        errors: state.errors.map(error =>
          error.id === action.payload
            ? { ...error, retryCount: error.retryCount + 1 }
            : error
        ),
      };
    }

    case 'CLEAR_ERROR': {
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
      };
    }

    case 'CLEAR_ALL_ERRORS': {
      return {
        ...state,
        errors: [],
      };
    }

    case 'SET_RECOVERING': {
      return {
        ...state,
        isRecovering: action.payload,
      };
    }

    case 'INCREMENT_SESSION_COUNT': {
      return {
        ...state,
        sessionErrorCount: state.sessionErrorCount + 1,
      };
    }

    default:
      return state;
  }
}

/**
 * 初期状態
 */
const initialState: GlobalErrorState = {
  errors: [],
  isRecovering: false,
  lastErrorTime: 0,
  errorCount: 0,
  sessionErrorCount: 0,
};

/**
 * グローバルエラープロバイダーのプロパティ
 */
interface GlobalErrorProviderProps {
  children: React.ReactNode;
  enableToastNotifications?: boolean;
  enableGlobalHandlers?: boolean;
  maxErrorsInMemory?: number;
  onToastNotification?: (_config: ToastNotificationConfig) => void;
}

/**
 * グローバルエラープロバイダー
 */
export const GlobalErrorProvider: React.FC<GlobalErrorProviderProps> = ({
  children,
  enableToastNotifications = true,
  enableGlobalHandlers = true,
  maxErrorsInMemory = 50,
  onToastNotification,
}) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  /**
   * エラーを報告する
   */
  const reportError = useCallback(
    (
      error: Error,
      options: Partial<Pick<GlobalError, 'level' | 'source' | 'context'>> = {}
    ): string => {
      const errorPayload = {
        error,
        level: options.level || 'component',
        source: options.source || 'manual',
        context: options.context,
      };

      // エラー数の制限（追加前にチェック）
      if (state.errors.length >= maxErrorsInMemory) {
        const oldestError = state.errors[0];
        if (oldestError) {
          dispatch({ type: 'CLEAR_ERROR', payload: oldestError.id });
        }
      }

      dispatch({ type: 'ADD_ERROR', payload: errorPayload });

      // 構造化ログ出力
      errorLogger.logError(error, 'Global error reported', {
        ...options.context,
        level: errorPayload.level,
        source: errorPayload.source,
        globalErrorHandler: true,
      });

      // Toast通知の表示
      if (enableToastNotifications && onToastNotification) {
        const isAPIError = isApiErrorResponse(error);
        const toastConfig = getToastConfigForError(
          error,
          errorPayload.level,
          isAPIError
        );
        onToastNotification(toastConfig);
      }

      return `${errorPayload.error.message}_${Date.now()}`;
    },
    [
      state.errors.length,
      maxErrorsInMemory,
      enableToastNotifications,
      onToastNotification,
    ]
  );

  /**
   * エラーを処理済みとしてマークする
   */
  const markErrorHandled = useCallback((errorId: string) => {
    dispatch({ type: 'MARK_HANDLED', payload: errorId });
  }, []);

  /**
   * エラーのリトライ
   */
  const retryError = useCallback((errorId: string) => {
    dispatch({ type: 'RETRY_ERROR', payload: errorId });
  }, []);

  /**
   * 特定のエラーをクリア
   */
  const clearError = useCallback((errorId: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: errorId });
  }, []);

  /**
   * すべてのエラーをクリア
   */
  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  }, []);

  /**
   * 未処理エラーの取得
   */
  const getUnhandledErrors = useCallback(() => {
    return state.errors.filter(error => !error.handled);
  }, [state.errors]);

  /**
   * エラー統計の取得
   */
  const getErrorStats = useCallback(() => {
    const unhandledCount = state.errors.filter(error => !error.handled).length;
    const lastErrorAgo = state.lastErrorTime
      ? Date.now() - state.lastErrorTime
      : 0;

    return {
      total: state.errorCount,
      unhandled: unhandledCount,
      session: state.sessionErrorCount,
      lastErrorAgo,
    };
  }, [
    state.errorCount,
    state.errors,
    state.sessionErrorCount,
    state.lastErrorTime,
  ]);

  /**
   * グローバルエラーハンドラーの設定
   */
  useEffect(() => {
    if (!enableGlobalHandlers) return;

    const handleError = (event: ErrorEvent) => {
      reportError(event.error || new Error(event.message), {
        level: 'global',
        source: 'handler',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      reportError(error, {
        level: 'global',
        source: 'promise',
        context: {
          type: 'unhandledrejection',
          reason: event.reason,
        },
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, [enableGlobalHandlers, reportError]);

  const contextValue: GlobalErrorContextValue = {
    state,
    reportError,
    markErrorHandled,
    retryError,
    clearError,
    clearAllErrors,
    getUnhandledErrors,
    getErrorStats,
    onToastNotification,
  };

  return (
    <GlobalErrorContext.Provider value={contextValue}>
      {children}
    </GlobalErrorContext.Provider>
  );
};

/**
 * グローバルエラーコンテキストフック
 */
export const useGlobalError = (): GlobalErrorContextValue => {
  const context = useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within a GlobalErrorProvider');
  }
  return context;
};

/**
 * エラー用Toast設定の生成
 */
function getToastConfigForError(
  error: Error,
  level: GlobalError['level'],
  isAPIError: boolean
) {
  const baseConfig = {
    type: 'error' as const,
    duration: 8000,
  };

  if (isAPIError) {
    return {
      ...baseConfig,
      title: 'サーバーエラー',
      description:
        'サーバーとの通信でエラーが発生しました。しばらく時間をおいて再度お試しください。',
    };
  }

  switch (level) {
    case 'page':
      return {
        ...baseConfig,
        title: 'ページエラー',
        description:
          'ページでエラーが発生しました。ページを再読み込みしてください。',
      };

    case 'section':
      return {
        ...baseConfig,
        title: 'セクションエラー',
        description:
          'この部分でエラーが発生しました。操作を再試行してください。',
      };

    case 'global':
      return {
        ...baseConfig,
        title: 'システムエラー',
        description:
          'システムでエラーが発生しました。ページを再読み込みしてください。',
      };

    case 'component':
    default:
      return {
        ...baseConfig,
        title: 'エラーが発生しました',
        description:
          '操作を再試行してください。問題が継続する場合はサポートにお問い合わせください。',
      };
  }
}

/**
 * エラー報告用のシンプルフック
 */
export const useErrorReporter = () => {
  const { reportError } = useGlobalError();

  return useCallback(
    (error: Error, context?: Record<string, unknown>) => {
      return reportError(error, { context });
    },
    [reportError]
  );
};
