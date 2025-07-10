/**
 * Toast Provider とコンテキスト
 * アプリケーション全体でToast通知を管理
 */

import * as ToastPrimitive from '@radix-ui/react-toast';
import React, { createContext, useContext, useState, useCallback } from 'react';

import {
  ToastComponent,
  ToastData,
  ToastVariant,
  ToastViewport,
} from './Toast';

/**
 * Toast コンテキストの型定義
 */
interface ToastContextType {
  toasts: ToastData[];
  addToast: (_toast: Omit<ToastData, 'id'>) => string;
  removeToast: (_id: string) => void;
  clearToasts: () => void;
  updateToast: (_id: string, _updates: Partial<ToastData>) => void;

  // 便利メソッド
  toast: {
    success: (
      _title: string,
      _description?: string,
      _options?: Partial<ToastData>
    ) => string;
    error: (
      _title: string,
      _description?: string,
      _options?: Partial<ToastData>
    ) => string;
    warning: (
      _title: string,
      _description?: string,
      _options?: Partial<ToastData>
    ) => string;
    info: (
      _title: string,
      _description?: string,
      _options?: Partial<ToastData>
    ) => string;
    loading: (
      _title: string,
      _description?: string,
      _options?: Partial<ToastData>
    ) => string;
  };
}

/**
 * Toast コンテキスト
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider のプロパティ
 */
export interface ToastProviderProps {
  children: React.ReactNode;
  /** 同時に表示する最大Toast数 */
  maxToasts?: number;
  /** デフォルトの表示時間（ミリ秒） */
  defaultDuration?: number;
  /** スワイプで削除を許可するかどうか */
  swipeDirection?: 'right' | 'left' | 'up' | 'down';
}

/**
 * Toast Provider コンポーネント
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  defaultDuration = 5000,
  swipeDirection = 'right',
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  /**
   * Toast を追加
   */
  const addToast = useCallback(
    (toast: Omit<ToastData, 'id'>): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastData = {
        id,
        duration: defaultDuration,
        dismissible: true,
        ...toast,
      };

      setToasts(prev => {
        const updated = [...prev, newToast];
        // 最大数を超える場合は古いものから削除
        return updated.slice(-maxToasts);
      });

      // 自動削除のタイマー設定
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }

      return id;
    },
    [defaultDuration, maxToasts]
  );

  /**
   * Toast を削除
   */
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  /**
   * 全ての Toast をクリア
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Toast を更新
   */
  const updateToast = useCallback((id: string, updates: Partial<ToastData>) => {
    setToasts(prev =>
      prev.map(toast => (toast.id === id ? { ...toast, ...updates } : toast))
    );
  }, []);

  /**
   * 便利メソッド: 成功Toast
   */
  const success = useCallback(
    (title: string, description?: string, options?: Partial<ToastData>) => {
      return addToast({
        title,
        description,
        variant: 'success',
        ...options,
      });
    },
    [addToast]
  );

  /**
   * 便利メソッド: エラーToast
   */
  const error = useCallback(
    (title: string, description?: string, options?: Partial<ToastData>) => {
      return addToast({
        title,
        description,
        variant: 'error',
        duration: 0, // エラーは手動で閉じるまで表示
        ...options,
      });
    },
    [addToast]
  );

  /**
   * 便利メソッド: 警告Toast
   */
  const warning = useCallback(
    (title: string, description?: string, options?: Partial<ToastData>) => {
      return addToast({
        title,
        description,
        variant: 'warning',
        duration: 8000, // 警告は少し長く表示
        ...options,
      });
    },
    [addToast]
  );

  /**
   * 便利メソッド: 情報Toast
   */
  const info = useCallback(
    (title: string, description?: string, options?: Partial<ToastData>) => {
      return addToast({
        title,
        description,
        variant: 'info',
        ...options,
      });
    },
    [addToast]
  );

  /**
   * 便利メソッド: ローディングToast
   */
  const loading = useCallback(
    (title: string, description?: string, options?: Partial<ToastData>) => {
      return addToast({
        title,
        description,
        variant: 'default',
        loading: true,
        duration: 0, // ローディングは手動で閉じるまで表示
        dismissible: false,
        ...options,
      });
    },
    [addToast]
  );

  /**
   * Toast開閉のハンドラ
   */
  const handleOpenChange = useCallback(
    (id: string) => (open: boolean) => {
      if (!open) {
        removeToast(id);
      }
    },
    [removeToast]
  );

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    updateToast,
    toast: {
      success,
      error,
      warning,
      info,
      loading,
    },
  };

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastPrimitive.Provider swipeDirection={swipeDirection}>
        {children}
        {toasts.map(toast => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onOpenChange={handleOpenChange(toast.id)}
          />
        ))}
        <ToastViewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};

/**
 * Toast コンテキストを使用するカスタムフック
 */
export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

/**
 * Toast 統計情報の型
 */
export interface ToastStats {
  total: number;
  byVariant: Record<ToastVariant, number>;
  active: number;
  dismissed: number;
}

/**
 * Toast統計を取得するフック
 */
export const useToastStats = (): ToastStats => {
  const { toasts } = useToastContext();

  const stats: ToastStats = {
    total: toasts.length,
    byVariant: {
      default: 0,
      success: 0,
      error: 0,
      warning: 0,
      info: 0,
    },
    active: toasts.length,
    dismissed: 0,
  };

  // バリアント別にカウント
  toasts.forEach(toast => {
    stats.byVariant[toast.variant]++;
  });

  return stats;
};
