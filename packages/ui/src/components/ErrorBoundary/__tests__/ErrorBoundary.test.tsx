/**
 * ErrorBoundary コンポーネントのテスト
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { AsyncErrorBoundary } from '../AsyncErrorBoundary';
import { ErrorBoundary } from '../ErrorBoundary';
import { PageErrorBoundary } from '../PageErrorBoundary';
import { SectionErrorBoundary } from '../SectionErrorBoundary';

// エラーを発生させるテスト用コンポーネント
const ThrowError: React.FC<{
  shouldThrow?: boolean;
  errorMessage?: string;
}> = ({ shouldThrow = true, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>正常なコンポーネント</div>;
};

// コンソールエラーを抑制
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  describe('基本機能', () => {
    it('エラーが発生しない場合、子コンポーネントを正常に表示する', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('正常なコンポーネント')).toBeInTheDocument();
    });

    it('エラーが発生した場合、フォールバックUIを表示する', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText('再試行')).toBeInTheDocument();
    });

    it('カスタムフォールバックUIを表示する', () => {
      const customFallback = <div>カスタムエラー表示</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('カスタムエラー表示')).toBeInTheDocument();
    });

    it('再試行ボタンが表示される', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // エラー状態を確認
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText('再試行')).toBeInTheDocument();
    });
  });

  describe('onErrorコールバック', () => {
    it('エラー発生時にonErrorコールバックが呼ばれる', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError errorMessage="テストエラー" />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'テストエラー',
        }),
        expect.objectContaining({
          componentStack: expect.any(String),
        }),
        expect.any(String)
      );
    });
  });

  describe('resetKeys', () => {
    it('resetKeysが変更された時にエラー状態をリセットする', () => {
      let resetKey = 'initial';

      const { rerender } = render(
        <ErrorBoundary resetOnPropsChange={true} resetKeys={[resetKey]}>
          <ThrowError />
        </ErrorBoundary>
      );

      // エラー状態を確認
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();

      // resetKeyを変更して再レンダリング
      resetKey = 'changed';
      rerender(
        <ErrorBoundary resetOnPropsChange={true} resetKeys={[resetKey]}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // 正常な表示に戻ることを確認
      expect(screen.getByText('正常なコンポーネント')).toBeInTheDocument();
    });
  });
});

describe('PageErrorBoundary', () => {
  it('ページレベルのエラーフォールバックを表示する', () => {
    render(
      <PageErrorBoundary appName="テストアプリ">
        <ThrowError />
      </PageErrorBoundary>
    );

    expect(
      screen.getByText('テストアプリでエラーが発生しました')
    ).toBeInTheDocument();
    expect(screen.getByText('ページを再読み込み')).toBeInTheDocument();
    expect(screen.getByText('前のページに戻る')).toBeInTheDocument();
    expect(screen.getByText('ホームページに戻る')).toBeInTheDocument();
  });
});

describe('SectionErrorBoundary', () => {
  it('セクションレベルのエラーフォールバックを表示する', () => {
    render(
      <SectionErrorBoundary sectionName="テストセクション">
        <ThrowError />
      </SectionErrorBoundary>
    );

    expect(
      screen.getByText('テストセクションでエラーが発生しました')
    ).toBeInTheDocument();
    expect(screen.getByText('再読み込み')).toBeInTheDocument();
  });

  it('retryable=falseの場合、再試行ボタンを表示しない', () => {
    render(
      <SectionErrorBoundary sectionName="テストセクション" retryable={false}>
        <ThrowError />
      </SectionErrorBoundary>
    );

    expect(
      screen.getByText('テストセクションでエラーが発生しました')
    ).toBeInTheDocument();
    expect(screen.queryByText('再読み込み')).not.toBeInTheDocument();
  });
});

describe('AsyncErrorBoundary', () => {
  it('非同期エラー用のフォールバックを表示する', () => {
    render(
      <AsyncErrorBoundary>
        <ThrowError />
      </AsyncErrorBoundary>
    );

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });

  it('onRetryコールバックが設定されている場合、再試行ボタンを表示する', () => {
    const onRetry = jest.fn();

    render(
      <AsyncErrorBoundary onRetry={onRetry}>
        <ThrowError />
      </AsyncErrorBoundary>
    );

    expect(screen.getByText('再試行')).toBeInTheDocument();
  });

  it('再試行ボタンが正しく表示される', () => {
    const onRetry = jest.fn();

    render(
      <AsyncErrorBoundary onRetry={onRetry}>
        <ThrowError />
      </AsyncErrorBoundary>
    );

    const retryButton = screen.getByText('再試行');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).not.toBeDisabled();
  });
});

describe('開発環境での動作', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('開発環境では詳細なエラー情報を表示する', () => {
    render(
      <ErrorBoundary>
        <ThrowError errorMessage="開発環境テストエラー" />
      </ErrorBoundary>
    );

    // 詳細情報の表示を確認（開発者情報のセクション）
    expect(screen.getByText('開発者情報')).toBeInTheDocument();
  });
});
