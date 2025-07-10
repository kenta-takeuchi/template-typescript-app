/**
 * Error Boundary + Toast 統合テスト（簡素化版）
 * 複雑な非同期Toast通知テストは除外し、基本的な機能のみテスト
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { ToastProvider } from '../Toast';

import { ErrorBoundaryWithToastProvider } from './ErrorBoundary';

// エラーを投げるテスト用コンポーネント
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary');
  }
  return <div>No error</div>;
};

describe('ErrorBoundaryWithToast Integration', () => {
  // コンソールエラーを抑制
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  const renderWithProviders = (children: React.ReactNode) => {
    return render(<ToastProvider>{children}</ToastProvider>);
  };

  describe('基本的なError Boundary機能', () => {
    test('エラーなしの場合は子コンポーネントをレンダリング', () => {
      renderWithProviders(
        <ErrorBoundaryWithToastProvider>
          <ThrowError shouldThrow={false} />
        </ErrorBoundaryWithToastProvider>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    test('エラー発生時はフォールバックUIを表示', () => {
      renderWithProviders(
        <ErrorBoundaryWithToastProvider>
          <ThrowError shouldThrow={true} />
        </ErrorBoundaryWithToastProvider>
      );

      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText('再試行')).toBeInTheDocument();
    });

    test('showToast=falseの場合はToast通知を表示しない', () => {
      renderWithProviders(
        <ErrorBoundaryWithToastProvider showToast={false}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundaryWithToastProvider>
      );

      // フォールバックUIは表示されるがToastは表示されない
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('プロパティの動作確認', () => {
    test('レベル別の設定が正しく適用される', () => {
      renderWithProviders(
        <ErrorBoundaryWithToastProvider level="page">
          <ThrowError shouldThrow={true} />
        </ErrorBoundaryWithToastProvider>
      );

      expect(
        screen.getByText('ページでエラーが発生しました')
      ).toBeInTheDocument();
    });

    test('セクションレベルの設定', () => {
      renderWithProviders(
        <ErrorBoundaryWithToastProvider level="section">
          <ThrowError shouldThrow={true} />
        </ErrorBoundaryWithToastProvider>
      );

      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    });
  });
});
