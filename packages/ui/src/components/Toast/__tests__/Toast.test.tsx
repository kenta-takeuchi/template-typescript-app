/**
 * Toast コンポーネントのテスト
 */

import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import React from 'react';

import { ToastComponent, ToastData } from '../Toast';
import {
  ToastProvider,
  useToastContext,
  useToastStats,
} from '../ToastProvider';
import { useToast, useToastState } from '../useToast';

// テスト用コンポーネント
const TestToastTrigger: React.FC = () => {
  const { success, error, warning, info, loading, promise } = useToast();

  const handleSuccess = () => {
    success('成功メッセージ', { description: '詳細な説明' });
  };

  const handleError = () => {
    error('エラーメッセージ', { description: 'エラーの詳細' });
  };

  const handleWarning = () => {
    warning('警告メッセージ');
  };

  const handleInfo = () => {
    info('情報メッセージ');
  };

  const handleLoading = () => {
    loading('ローディング中...');
  };

  const handlePromise = () => {
    const mockPromise = new Promise(resolve => {
      setTimeout(() => resolve('成功'), 1000);
    });

    promise(mockPromise, '処理中...', '完了しました', 'エラーが発生しました');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success Toast</button>
      <button onClick={handleError}>Error Toast</button>
      <button onClick={handleWarning}>Warning Toast</button>
      <button onClick={handleInfo}>Info Toast</button>
      <button onClick={handleLoading}>Loading Toast</button>
      <button onClick={handlePromise}>Promise Toast</button>
    </div>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider>{children}</ToastProvider>
);

// コンソールエラーを抑制
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('Toast Components', () => {
  describe('ToastComponent', () => {
    it('基本的なtoastを正しく表示する', () => {
      const mockToast: ToastData = {
        id: 'test-toast',
        title: 'テストタイトル',
        description: 'テスト説明',
        variant: 'success',
        duration: 5000,
        dismissible: true,
      };

      render(
        <TestWrapper>
          <ToastComponent toast={mockToast} />
        </TestWrapper>
      );

      expect(screen.getByText('テストタイトル')).toBeInTheDocument();
      expect(screen.getByText('テスト説明')).toBeInTheDocument();
    });

    it('各バリアントで正しいスタイルが適用される', () => {
      const variants: Array<{ variant: ToastData['variant']; testId: string }> =
        [
          { variant: 'success', testId: 'success-toast' },
          { variant: 'error', testId: 'error-toast' },
          { variant: 'warning', testId: 'warning-toast' },
          { variant: 'info', testId: 'info-toast' },
        ];

      variants.forEach(({ variant, testId }) => {
        const toast: ToastData = {
          id: testId,
          title: `${variant} toast`,
          variant,
        };

        const { container } = render(
          <TestWrapper>
            <ToastComponent toast={toast} />
          </TestWrapper>
        );

        // バリアントに応じたクラスが適用されているか確認
        const toastElement = container.querySelector('[data-state="open"]');
        expect(toastElement).toHaveClass(
          variant === 'error' ? 'destructive' : variant
        );
      });
    });

    it('ローディング状態を正しく表示する', () => {
      const loadingToast: ToastData = {
        id: 'loading-toast',
        title: 'ローディング中...',
        variant: 'default',
        loading: true,
        dismissible: false,
      };

      render(
        <TestWrapper>
          <ToastComponent toast={loadingToast} />
        </TestWrapper>
      );

      expect(screen.getByText('ローディング中...')).toBeInTheDocument();
      // ローディングアイコンが表示されているか確認
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('閉じるボタンが動作する', async () => {
      const mockOnOpenChange = jest.fn();
      const toast: ToastData = {
        id: 'dismissible-toast',
        title: 'テストtoast',
        variant: 'default',
        dismissible: true,
      };

      render(
        <TestWrapper>
          <ToastComponent toast={toast} onOpenChange={mockOnOpenChange} />
        </TestWrapper>
      );

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('ToastProvider', () => {
    it('コンテキストを正しく提供する', () => {
      const TestComponent = () => {
        const context = useToastContext();
        return <div>{`Toasts: ${context.toasts.length}`}</div>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Toasts: 0')).toBeInTheDocument();
    });

    it('ToastProvider外での使用時にエラーをスローする', () => {
      const TestComponent = () => {
        try {
          useToastContext();
          return <div>正常</div>;
        } catch (error) {
          return <div>エラー: {(error as Error).message}</div>;
        }
      };

      render(<TestComponent />);

      expect(
        screen.getByText(
          'エラー: useToastContext must be used within a ToastProvider'
        )
      ).toBeInTheDocument();
    });

    it('最大Toast数の制限が機能する', () => {
      const TestComponent = () => {
        const { addToast, toasts } = useToastContext();

        const addMultipleToasts = () => {
          for (let i = 0; i < 7; i++) {
            addToast({
              title: `Toast ${i}`,
              variant: 'default',
            });
          }
        };

        return (
          <div>
            <button onClick={addMultipleToasts}>Add 7 Toasts</button>
            <div>{`Count: ${toasts.length}`}</div>
          </div>
        );
      };

      render(
        <ToastProvider maxToasts={5}>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Add 7 Toasts'));

      expect(screen.getByText('Count: 5')).toBeInTheDocument();
    });
  });

  describe('useToast Hook', () => {
    it('各タイプのtoastを正しく表示する', async () => {
      render(
        <TestWrapper>
          <TestToastTrigger />
        </TestWrapper>
      );

      // 成功toast
      fireEvent.click(screen.getByText('Success Toast'));
      await waitFor(() => {
        expect(screen.getByText('成功メッセージ')).toBeInTheDocument();
        expect(screen.getByText('詳細な説明')).toBeInTheDocument();
      });

      // エラーtoast
      fireEvent.click(screen.getByText('Error Toast'));
      await waitFor(() => {
        expect(screen.getByText('エラーメッセージ')).toBeInTheDocument();
        expect(screen.getByText('エラーの詳細')).toBeInTheDocument();
      });

      // 警告toast
      fireEvent.click(screen.getByText('Warning Toast'));
      await waitFor(() => {
        expect(screen.getByText('警告メッセージ')).toBeInTheDocument();
      });

      // 情報toast
      fireEvent.click(screen.getByText('Info Toast'));
      await waitFor(() => {
        expect(screen.getByText('情報メッセージ')).toBeInTheDocument();
      });

      // ローディングtoast
      fireEvent.click(screen.getByText('Loading Toast'));
      await waitFor(() => {
        expect(screen.getByText('ローディング中...')).toBeInTheDocument();
      });
    });

    it('promiseメソッドが正しく動作する', async () => {
      render(
        <TestWrapper>
          <TestToastTrigger />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Promise Toast'));

      // ローディング状態のtoastが表示される
      await waitFor(() => {
        expect(screen.getByText('処理中...')).toBeInTheDocument();
      });

      // 成功toast
      await waitFor(
        () => {
          expect(screen.getByText('完了しました')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('toast管理メソッドが正しく動作する', () => {
      const TestComponent = () => {
        const { success, dismiss, dismissAll, toasts } = useToast();

        const addToast = () => {
          success('テストtoast');
        };

        const removeFirstToast = () => {
          if (toasts.length > 0) {
            dismiss(toasts[0].id);
          }
        };

        return (
          <div>
            <button onClick={addToast}>Add Toast</button>
            <button onClick={removeFirstToast}>Remove First</button>
            <button onClick={dismissAll}>Remove All</button>
            <div>{`Count: ${toasts.length}`}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // toastを追加
      fireEvent.click(screen.getByText('Add Toast'));
      expect(screen.getByText('Count: 1')).toBeInTheDocument();

      // 最初のtoastを削除
      fireEvent.click(screen.getByText('Remove First'));
      expect(screen.getByText('Count: 0')).toBeInTheDocument();

      // 複数追加してから全削除
      fireEvent.click(screen.getByText('Add Toast'));
      fireEvent.click(screen.getByText('Add Toast'));
      expect(screen.getByText('Count: 2')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Remove All'));
      expect(screen.getByText('Count: 0')).toBeInTheDocument();
    });
  });

  describe('Toast 自動削除', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('指定した時間後に自動的に削除される', async () => {
      const TestComponent = () => {
        const { addToast, toasts } = useToastContext();

        const addAutoCloseToast = () => {
          addToast({
            title: '自動削除toast',
            variant: 'default',
            duration: 1000,
          });
        };

        return (
          <div>
            <button onClick={addAutoCloseToast}>Add Auto Close Toast</button>
            <div>{`Count: ${toasts.length}`}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Add Auto Close Toast'));
      expect(screen.getByText('Count: 1')).toBeInTheDocument();

      // 1秒後に自動削除
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Count: 0')).toBeInTheDocument();
      });
    });

    it('duration=0の場合は自動削除されない', () => {
      const TestComponent = () => {
        const { addToast, toasts } = useToastContext();

        const addPersistentToast = () => {
          addToast({
            title: '永続toast',
            variant: 'error',
            duration: 0,
          });
        };

        return (
          <div>
            <button onClick={addPersistentToast}>Add Persistent Toast</button>
            <div>{`Count: ${toasts.length}`}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Add Persistent Toast'));
      expect(screen.getByText('Count: 1')).toBeInTheDocument();

      // 十分な時間が経っても削除されない
      jest.advanceTimersByTime(10000);
      expect(screen.getByText('Count: 1')).toBeInTheDocument();
    });
  });

  describe('ToastProvider additional features', () => {
    it('カスタムmaxToastsが適用される', () => {
      const TestComponent = () => {
        const { addToast, toasts } = useToastContext();

        const addMultiple = () => {
          for (let i = 0; i < 3; i++) {
            addToast({
              title: `Toast ${i}`,
              variant: 'default',
            });
          }
        };

        return (
          <div>
            <button onClick={addMultiple}>Add Multiple</button>
            <div>{`Count: ${toasts.length}`}</div>
          </div>
        );
      };

      render(
        <ToastProvider maxToasts={2}>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Add Multiple'));
      expect(screen.getByText('Count: 2')).toBeInTheDocument();
    });

    it('カスタムスワイプ方向が設定される', () => {
      const TestComponent = () => {
        const { addToast } = useToastContext();

        const addSwipeToast = () => {
          addToast({
            title: 'スワイプテスト',
            variant: 'default',
          });
        };

        return <button onClick={addSwipeToast}>Add Toast</button>;
      };

      render(
        <ToastProvider swipeDirection="left">
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Add Toast'));

      // Toastが表示されていることを確認
      expect(screen.getByText('スワイプテスト')).toBeInTheDocument();
    });
  });

  describe('useToast additional features', () => {
    it('useToastStateフックが正しく動作する', () => {
      const TestComponent = () => {
        const { success, error, warning, info } = useToast();
        const toastState = useToastState();

        const addVariousToasts = () => {
          success('成功');
          error('エラー');
          warning('警告');
          info('情報');
        };

        return (
          <div>
            <button onClick={addVariousToasts}>Add Various Toasts</button>
            <div>Total: {toastState.count}</div>
            <div>Success: {toastState.variants.success}</div>
            <div>Error: {toastState.variants.error}</div>
            <div>Warning: {toastState.variants.warning}</div>
            <div>Info: {toastState.variants.info}</div>
            <div>Has Toasts: {toastState.hasToasts ? 'Yes' : 'No'}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Add Various Toasts'));

      expect(screen.getByText('Total: 4')).toBeInTheDocument();
      expect(screen.getByText('Success: 1')).toBeInTheDocument();
      expect(screen.getByText('Error: 1')).toBeInTheDocument();
      expect(screen.getByText('Warning: 1')).toBeInTheDocument();
      expect(screen.getByText('Info: 1')).toBeInTheDocument();
      expect(screen.getByText('Has Toasts: Yes')).toBeInTheDocument();
    });

    it('promise失敗時のエラーハンドリング', async () => {
      const TestComponent = () => {
        const { promise } = useToast();

        const handleFailedPromise = () => {
          const failedPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Promise failed')), 100);
          });

          promise(
            failedPromise,
            '処理中...',
            '成功しました',
            'エラーが発生しました'
          ).catch(() => {
            // エラーを無視
          });
        };

        return <button onClick={handleFailedPromise}>Failed Promise</button>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Failed Promise'));

      // ローディング状態
      expect(screen.getByText('処理中...')).toBeInTheDocument();

      // エラー後
      await waitFor(() => {
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      });
    });

    it('promiseでエラーオプションがオブジェクトの場合', async () => {
      const TestComponent = () => {
        const { promise } = useToast();

        const handleFailedPromiseWithOptions = () => {
          const failedPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Custom error')), 100);
          });

          promise(
            failedPromise,
            { title: '処理中...', description: '少々お待ちください' },
            { title: '成功', description: '処理が完了しました' },
            { title: 'エラー', description: 'カスタムエラー説明' }
          ).catch(() => {
            // エラーを無視
          });
        };

        return (
          <button onClick={handleFailedPromiseWithOptions}>
            Failed Promise With Options
          </button>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Failed Promise With Options'));

      await waitFor(() => {
        expect(screen.getByText('エラー')).toBeInTheDocument();
        expect(screen.getByText('カスタムエラー説明')).toBeInTheDocument();
      });
    });

    it('update機能のテスト', () => {
      const TestComponent = () => {
        const { toast, update, toasts } = useToast();

        const addAndUpdate = () => {
          const id = toast('初期メッセージ', { variant: 'default' });
          update(id, { title: '更新されたメッセージ', variant: 'success' });
        };

        return (
          <div>
            <button onClick={addAndUpdate}>Add And Update</button>
            <div>Count: {toasts.length}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Add And Update'));
      expect(screen.getByText('更新されたメッセージ')).toBeInTheDocument();
    });

    it('基本toast機能のテスト', () => {
      const TestComponent = () => {
        const { toast } = useToast();

        const addBasicToast = () => {
          toast('基本メッセージ', { description: '説明テキスト' });
        };

        return <button onClick={addBasicToast}>Add Basic Toast</button>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Add Basic Toast'));
      expect(screen.getByText('基本メッセージ')).toBeInTheDocument();
      expect(screen.getByText('説明テキスト')).toBeInTheDocument();
    });

    it('promiseメソッドでsuccessOptionsがオブジェクトの場合', async () => {
      const TestComponent = () => {
        const { promise } = useToast();

        const handleSuccessPromiseWithOptions = () => {
          const successPromise = new Promise(resolve => {
            setTimeout(() => resolve('success'), 100);
          });

          promise(
            successPromise,
            '処理中...',
            { title: '成功', description: '処理が完了しました' },
            'エラーが発生しました'
          );
        };

        return (
          <button onClick={handleSuccessPromiseWithOptions}>
            Success Promise With Options
          </button>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Success Promise With Options'));

      await waitFor(() => {
        expect(screen.getByText('成功')).toBeInTheDocument();
        expect(screen.getByText('処理が完了しました')).toBeInTheDocument();
      });
    });

    it('promiseメソッドでloadingOptionsがオブジェクトの場合', async () => {
      const TestComponent = () => {
        const { promise } = useToast();

        const handlePromiseWithLoadingOptions = () => {
          const successPromise = new Promise(resolve => {
            setTimeout(() => resolve('success'), 100);
          });

          promise(
            successPromise,
            { title: 'ローディング中', description: '少々お待ちください' },
            '完了',
            'エラー'
          );
        };

        return (
          <button onClick={handlePromiseWithLoadingOptions}>
            Promise With Loading Options
          </button>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Promise With Loading Options'));
      expect(screen.getByText('ローディング中')).toBeInTheDocument();
      expect(screen.getByText('少々お待ちください')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('完了')).toBeInTheDocument();
      });
    });
  });

  describe('ToastStats フック', () => {
    it('useToastStatsが正しく統計を返す', () => {
      const TestComponent = () => {
        const { success, error } = useToast();
        const stats = useToastStats();

        const addMixed = () => {
          success('成功1');
          success('成功2');
          error('エラー1');
        };

        return (
          <div>
            <button onClick={addMixed}>Add Mixed</button>
            <div>Total: {stats.total}</div>
            <div>Success: {stats.byVariant.success}</div>
            <div>Error: {stats.byVariant.error}</div>
            <div>Active: {stats.active}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Add Mixed'));

      expect(screen.getByText('Total: 3')).toBeInTheDocument();
      expect(screen.getByText('Success: 2')).toBeInTheDocument();
      expect(screen.getByText('Error: 1')).toBeInTheDocument();
      expect(screen.getByText('Active: 3')).toBeInTheDocument();
    });
  });

  describe('ToastComponent with action', () => {
    it('アクションボタンを表示する', () => {
      const mockAction = <button>アクション</button>;
      const toastWithAction: ToastData = {
        id: 'action-toast',
        title: 'アクション付きtoast',
        variant: 'default',
        action: mockAction,
      };

      render(
        <TestWrapper>
          <ToastComponent toast={toastWithAction} />
        </TestWrapper>
      );

      expect(screen.getByText('アクション付きtoast')).toBeInTheDocument();
      expect(screen.getByText('アクション')).toBeInTheDocument();
    });

    it('dismissible=falseの場合、閉じるボタンを表示しない', () => {
      const nonDismissibleToast: ToastData = {
        id: 'non-dismissible-toast',
        title: '閉じられないtoast',
        variant: 'default',
        dismissible: false,
      };

      render(
        <TestWrapper>
          <ToastComponent toast={nonDismissibleToast} />
        </TestWrapper>
      );

      expect(screen.getByText('閉じられないtoast')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
