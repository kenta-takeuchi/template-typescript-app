/**
 * useToast カスタムフック
 * Toast通知システムのメインインターフェース
 */

import { useCallback } from 'react';

import { ToastData } from './Toast';
import { useToastContext } from './ToastProvider';

/**
 * Toast 作成用のオプション
 */
export interface ToastOptions
  extends Partial<Omit<ToastData, 'id' | 'variant'>> {
  /** 表示位置（将来的な拡張用） */
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top'
    | 'bottom';
  /** プロミスと連携した自動更新 */
  promise?: Promise<unknown>;
  /** 成功時の更新内容 */
  success?: Partial<ToastData>;
  /** エラー時の更新内容 */
  error?: Partial<ToastData>;
}

/**
 * useToast フックの戻り値
 */
export interface UseToastReturn {
  /** Toast表示メソッド */
  toast: (_message: string, _options?: ToastOptions) => string;

  /** バリアント別の便利メソッド */
  success: (_message: string, _options?: ToastOptions) => string;
  error: (_message: string, _options?: ToastOptions) => string;
  warning: (_message: string, _options?: ToastOptions) => string;
  info: (_message: string, _options?: ToastOptions) => string;
  loading: (_message: string, _options?: ToastOptions) => string;

  /** プロミス連携Toast */
  promise: <T>(
    _promise: Promise<T>,
    _loading: string | ToastOptions,
    _success?: string | ToastOptions,
    _error?: string | ToastOptions
  ) => Promise<T>;

  /** Toast管理メソッド */
  dismiss: (_id: string) => void;
  dismissAll: () => void;
  update: (_id: string, _updates: Partial<ToastData>) => void;

  /** 現在のToast一覧 */
  toasts: ToastData[];
}

/**
 * Toast通知のメインフック
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { toast, success, error } = useToast();
 *
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       success('データを保存しました');
 *     } catch (err) {
 *       error('保存に失敗しました', { description: err.message });
 *     }
 *   };
 *
 *   const handleAsyncOperation = () => {
 *     toast.promise(
 *       asyncOperation(),
 *       '処理中...',
 *       '処理が完了しました',
 *       '処理に失敗しました'
 *     );
 *   };
 * }
 * ```
 */
export const useToast = (): UseToastReturn => {
  const context = useToastContext();

  /**
   * 基本的なToast表示
   */
  const toast = useCallback(
    (message: string, options: ToastOptions = {}): string => {
      const {
        promise,
        success: successOptions,
        error: errorOptions,
        ...toastOptions
      } = options;

      return context.addToast({
        title: message,
        variant: 'default',
        ...toastOptions,
      });
    },
    [context]
  );

  /**
   * 成功Toast
   */
  const success = useCallback(
    (message: string, options: ToastOptions = {}): string => {
      return context.toast.success(message, options.description, options);
    },
    [context]
  );

  /**
   * エラーToast
   */
  const error = useCallback(
    (message: string, options: ToastOptions = {}): string => {
      return context.toast.error(message, options.description, options);
    },
    [context]
  );

  /**
   * 警告Toast
   */
  const warning = useCallback(
    (message: string, options: ToastOptions = {}): string => {
      return context.toast.warning(message, options.description, options);
    },
    [context]
  );

  /**
   * 情報Toast
   */
  const info = useCallback(
    (message: string, options: ToastOptions = {}): string => {
      return context.toast.info(message, options.description, options);
    },
    [context]
  );

  /**
   * ローディングToast
   */
  const loading = useCallback(
    (message: string, options: ToastOptions = {}): string => {
      return context.toast.loading(message, options.description, options);
    },
    [context]
  );

  /**
   * プロミス連携Toast
   * 非同期処理の状態に応じて自動的にToastを更新
   */
  const promise = useCallback(
    async <T>(
      promiseToResolve: Promise<T>,
      loadingOptions: string | ToastOptions,
      successOptions?: string | ToastOptions,
      errorOptions?: string | ToastOptions
    ): Promise<T> => {
      // ローディングToastを表示
      const loadingToastId = loading(
        typeof loadingOptions === 'string'
          ? loadingOptions
          : loadingOptions.title || '処理中...',
        typeof loadingOptions === 'object' ? loadingOptions : {}
      );

      try {
        const result = await promiseToResolve;

        // ローディングToastを削除
        context.removeToast(loadingToastId);

        // 成功Toastを表示
        if (successOptions) {
          success(
            typeof successOptions === 'string'
              ? successOptions
              : successOptions.title || '完了しました',
            typeof successOptions === 'object' ? successOptions : {}
          );
        }

        return result;
      } catch (err) {
        // ローディングToastを削除
        context.removeToast(loadingToastId);

        // エラーToastを表示
        if (errorOptions) {
          const errorMessage =
            typeof errorOptions === 'string'
              ? errorOptions
              : errorOptions.title || 'エラーが発生しました';

          const errorDescription =
            err instanceof Error
              ? err.message
              : typeof errorOptions === 'object'
                ? errorOptions.description
                : undefined;

          error(errorMessage, {
            description: errorDescription,
            ...(typeof errorOptions === 'object' ? errorOptions : {}),
          });
        }

        throw err;
      }
    },
    [loading, success, error, context]
  );

  /**
   * Toast削除
   */
  const dismiss = useCallback(
    (id: string) => {
      context.removeToast(id);
    },
    [context]
  );

  /**
   * 全Toast削除
   */
  const dismissAll = useCallback(() => {
    context.clearToasts();
  }, [context]);

  /**
   * Toast更新
   */
  const update = useCallback(
    (id: string, updates: Partial<ToastData>) => {
      context.updateToast(id, updates);
    },
    [context]
  );

  return {
    toast,
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
    dismissAll,
    update,
    toasts: context.toasts,
  };
};

/**
 * Toast状態管理用のシンプルなフック
 */
export const useToastState = () => {
  const { toasts } = useToastContext();

  return {
    toasts,
    count: toasts.length,
    hasToasts: toasts.length > 0,
    variants: {
      success: toasts.filter(t => t.variant === 'success').length,
      error: toasts.filter(t => t.variant === 'error').length,
      warning: toasts.filter(t => t.variant === 'warning').length,
      info: toasts.filter(t => t.variant === 'info').length,
      default: toasts.filter(t => t.variant === 'default').length,
    },
  };
};
