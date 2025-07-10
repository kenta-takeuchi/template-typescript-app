/**
 * グローバルエラーコンテキストのテスト
 */

import { renderHook, act } from '@testing-library/react';
import React from 'react';

import {
  GlobalErrorProvider,
  useGlobalError,
  useErrorReporter,
} from './GlobalErrorContext';

// テスト用のラッパーコンポーネント
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GlobalErrorProvider>{children}</GlobalErrorProvider>
);

describe('GlobalErrorContext', () => {
  // コンソールエラーを抑制
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  describe('useGlobalError', () => {
    test('プロバイダー外で使用時はエラーを投げる', () => {
      expect(() => {
        renderHook(() => useGlobalError());
      }).toThrow('useGlobalError must be used within a GlobalErrorProvider');
    });

    test('基本的なエラー報告機能', () => {
      const { result } = renderHook(() => useGlobalError(), {
        wrapper: TestWrapper,
      });

      const testError = new Error('Test error');

      act(() => {
        result.current.reportError(testError);
      });

      expect(result.current.state.errors).toHaveLength(1);
      expect(result.current.state.errors[0].error).toBe(testError);
      expect(result.current.state.errorCount).toBe(1);
      expect(result.current.state.sessionErrorCount).toBe(1);
    });

    test('エラーレベルとソースの指定', () => {
      const { result } = renderHook(() => useGlobalError(), {
        wrapper: TestWrapper,
      });

      const testError = new Error('Page error');

      act(() => {
        result.current.reportError(testError, {
          level: 'page',
          source: 'boundary',
          context: { userId: '123' },
        });
      });

      const reportedError = result.current.state.errors[0];
      expect(reportedError.level).toBe('page');
      expect(reportedError.source).toBe('boundary');
      expect(reportedError.context).toEqual({ userId: '123' });
    });

    test('エラーの処理済みマーク', () => {
      const { result } = renderHook(() => useGlobalError(), {
        wrapper: TestWrapper,
      });

      const testError = new Error('Test error');

      act(() => {
        result.current.reportError(testError);
      });

      const errorId = result.current.state.errors[0]?.id || '';
      expect(result.current.state.errors[0]?.handled).toBe(false);

      act(() => {
        result.current.markErrorHandled(errorId);
      });

      expect(result.current.state.errors[0]?.handled).toBe(true);
    });

    test('エラーのリトライカウント', () => {
      const { result } = renderHook(() => useGlobalError(), {
        wrapper: TestWrapper,
      });

      const testError = new Error('Test error');

      act(() => {
        result.current.reportError(testError);
      });

      const errorId = result.current.state.errors[0]?.id || '';
      expect(result.current.state.errors[0]?.retryCount).toBe(0);

      act(() => {
        result.current.retryError(errorId);
      });

      expect(result.current.state.errors[0]?.retryCount).toBe(1);
    });

    test('特定エラーのクリア', () => {
      const { result } = renderHook(() => useGlobalError(), {
        wrapper: TestWrapper,
      });

      const testError1 = new Error('Test error 1');
      const testError2 = new Error('Test error 2');

      act(() => {
        result.current.reportError(testError1);
        result.current.reportError(testError2);
      });

      const errorId1 = result.current.state.errors[0]?.id || '';
      expect(result.current.state.errors).toHaveLength(2);

      act(() => {
        result.current.clearError(errorId1);
      });

      expect(result.current.state.errors).toHaveLength(1);
      expect(result.current.state.errors[0]?.error).toBe(testError2);
    });

    test('全エラーのクリア', () => {
      const { result } = renderHook(() => useGlobalError(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.reportError(new Error('Error 1'));
        result.current.reportError(new Error('Error 2'));
        result.current.reportError(new Error('Error 3'));
      });

      expect(result.current.state.errors).toHaveLength(3);

      act(() => {
        result.current.clearAllErrors();
      });

      expect(result.current.state.errors).toHaveLength(0);
    });
  });

  describe('エラー統計機能', () => {
    test('未処理エラーの取得', () => {
      const { result } = renderHook(() => useGlobalError(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.reportError(new Error('Error 1'));
        result.current.reportError(new Error('Error 2'));
        result.current.reportError(new Error('Error 3'));
      });

      const errorId1 = result.current.state.errors[0]?.id || '';
      const errorId2 = result.current.state.errors[1]?.id || '';

      // 一部を処理済みにマーク
      act(() => {
        result.current.markErrorHandled(errorId1);
        result.current.markErrorHandled(errorId2);
      });

      const unhandledErrors = result.current.getUnhandledErrors();
      expect(unhandledErrors).toHaveLength(1);
      expect(unhandledErrors[0]?.error.message).toBe('Error 3');
    });

    test('エラー統計の計算', async () => {
      const { result } = renderHook(() => useGlobalError(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.reportError(new Error('Error 1'));
      });

      // 少し待ってからタイムスタンプを確保
      await new Promise(resolve => setTimeout(resolve, 10));

      act(() => {
        result.current.reportError(new Error('Error 2'));
      });

      const errorId = result.current.state.errors[0]?.id || '';

      act(() => {
        result.current.markErrorHandled(errorId);
      });

      const stats = result.current.getErrorStats();
      expect(stats.total).toBe(2);
      expect(stats.unhandled).toBe(1);
      expect(stats.session).toBe(2);
      expect(stats.lastErrorAgo).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Toast通知機能', () => {
    test('onToastNotificationコールバックが呼ばれる', () => {
      const mockToastNotification = jest.fn();

      const { result } = renderHook(() => useGlobalError(), {
        wrapper: ({ children }) => (
          <GlobalErrorProvider onToastNotification={mockToastNotification}>
            {children}
          </GlobalErrorProvider>
        ),
      });

      act(() => {
        result.current.reportError(new Error('Test notification error'));
      });

      expect(mockToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'エラーが発生しました',
        description:
          '操作を再試行してください。問題が継続する場合はサポートにお問い合わせください。',
        duration: 8000,
      });
    });

    test('APIエラーの場合は専用メッセージを通知', () => {
      const mockToastNotification = jest.fn();

      const { result } = renderHook(() => useGlobalError(), {
        wrapper: ({ children }) => (
          <GlobalErrorProvider onToastNotification={mockToastNotification}>
            {children}
          </GlobalErrorProvider>
        ),
      });

      // isApiErrorResponse()が期待する形式でAPIエラーを作成
      const apiError: any = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'API Error',
        },
      };

      act(() => {
        result.current.reportError(apiError);
      });

      expect(mockToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'サーバーエラー',
        description:
          'サーバーとの通信でエラーが発生しました。しばらく時間をおいて再度お試しください。',
        duration: 8000,
      });
    });

    test('レベル別のToastメッセージを通知', () => {
      const mockToastNotification = jest.fn();

      const { result } = renderHook(() => useGlobalError(), {
        wrapper: ({ children }) => (
          <GlobalErrorProvider onToastNotification={mockToastNotification}>
            {children}
          </GlobalErrorProvider>
        ),
      });

      act(() => {
        result.current.reportError(new Error('Page error'), { level: 'page' });
      });

      expect(mockToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'ページエラー',
        description:
          'ページでエラーが発生しました。ページを再読み込みしてください。',
        duration: 8000,
      });
    });
  });

  describe('useErrorReporter', () => {
    test('シンプルなエラー報告', () => {
      const { result } = renderHook(
        () => ({
          globalError: useGlobalError(),
          reporter: useErrorReporter(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      const testError = new Error('Reporter test');

      act(() => {
        result.current.reporter(testError, { userId: '123' });
      });

      expect(result.current.globalError.state.errors).toHaveLength(1);
      expect(result.current.globalError.state.errors[0]?.error).toBe(testError);
      expect(result.current.globalError.state.errors[0]?.context).toEqual({
        userId: '123',
      });
    });
  });

  describe('メモリ管理', () => {
    test('最大エラー数の制限', () => {
      const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
        children,
      }) => (
        <GlobalErrorProvider maxErrorsInMemory={2}>
          {children}
        </GlobalErrorProvider>
      );

      const { result } = renderHook(() => useGlobalError(), {
        wrapper: TestWrapper,
      });

      // 最大数を超えてエラーを段階的に追加
      act(() => {
        result.current.reportError(new Error('Error 1'));
      });
      expect(result.current.state.errors).toHaveLength(1);

      act(() => {
        result.current.reportError(new Error('Error 2'));
      });
      expect(result.current.state.errors).toHaveLength(2);

      act(() => {
        result.current.reportError(new Error('Error 3')); // これで最大数を超える
      });

      // 最古のエラーが削除されて制限内に収まることを確認
      expect(result.current.state.errors).toHaveLength(2);
      expect(result.current.state.errors[0]?.error.message).toBe('Error 2');
      expect(result.current.state.errors[1]?.error.message).toBe('Error 3');
    });
  });

  describe('グローバルハンドラー', () => {
    test('enableGlobalHandlers=falseの場合はハンドラーを設定しない', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
        children,
      }) => (
        <GlobalErrorProvider enableGlobalHandlers={false}>
          {children}
        </GlobalErrorProvider>
      );

      renderHook(() => useGlobalError(), {
        wrapper: TestWrapper,
      });

      expect(addEventListenerSpy).not.toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
      expect(addEventListenerSpy).not.toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });
  });
});
