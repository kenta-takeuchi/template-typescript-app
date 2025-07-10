/**
 * IntegrationExample コンポーネントのテスト（簡素化版）
 * 複雑な非同期処理やToast通知テストは除外し、基本的な機能のみテスト
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  AppWithErrorHandling,
  ErrorStatsDisplay,
  useApiWithErrorHandling,
  useFormWithErrorHandling,
} from './IntegrationExample';

// fetch APIのモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Error Boundary内で使用するコンポーネント
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test integration error');
  }
  return <div>Integration test content</div>;
};

// API呼び出しテスト用コンポーネント
const ApiTestComponent = () => {
  const { fetchWithErrorHandling } = useApiWithErrorHandling();
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleFetch = async () => {
    try {
      const data = await fetchWithErrorHandling('/api/test');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div>
      <button onClick={handleFetch}>Fetch Data</button>
      {result && <div>Data: {JSON.stringify(result)}</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
};

// フォーム送信テスト用コンポーネント
const FormTestComponent = () => {
  const { submitForm } = useFormWithErrorHandling();
  const [result, setResult] = React.useState<any>(null);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('name', 'Test User');

    const response = await submitForm(formData);
    setResult(response);
  };

  return (
    <div>
      <button onClick={handleSubmit}>Submit Form</button>
      {result && (
        <div>
          Result: {result.success ? 'Success' : 'Failed'}
          {result.error && <div>Error: {result.error.message}</div>}
        </div>
      )}
    </div>
  );
};

describe('IntegrationExample', () => {
  // コンソールエラーを抑制
  const originalError = console.error;
  const originalEnv = process.env.NODE_ENV;

  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
    process.env.NODE_ENV = originalEnv;
  });

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('AppWithErrorHandling', () => {
    test('エラーなしの場合は子コンポーネントを表示', () => {
      render(
        <AppWithErrorHandling>
          <ThrowError shouldThrow={false} />
        </AppWithErrorHandling>
      );

      expect(screen.getByText('Integration test content')).toBeInTheDocument();
    });

    test('エラー発生時はエラーUIを表示', () => {
      render(
        <AppWithErrorHandling>
          <ThrowError shouldThrow={true} />
        </AppWithErrorHandling>
      );

      // Error Boundaryのフォールバックが表示される
      expect(
        screen.getByText('ページでエラーが発生しました')
      ).toBeInTheDocument();
    });
  });

  describe('useApiWithErrorHandling', () => {
    test('正常なAPI呼び出し', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test data' }),
      });

      render(
        <AppWithErrorHandling>
          <ApiTestComponent />
        </AppWithErrorHandling>
      );

      const button = screen.getByText('Fetch Data');
      await userEvent.click(button);

      await waitFor(() => {
        expect(
          screen.getByText('Data: {"data":"test data"}')
        ).toBeInTheDocument();
      });
    });

    test('API呼び出しエラー（HTTPエラー）', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      render(
        <AppWithErrorHandling>
          <ApiTestComponent />
        </AppWithErrorHandling>
      );

      const button = screen.getByText('Fetch Data');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Error: API Error: 500/)).toBeInTheDocument();
      });
    });
  });

  describe('useFormWithErrorHandling', () => {
    test('正常なフォーム送信', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <AppWithErrorHandling>
          <FormTestComponent />
        </AppWithErrorHandling>
      );

      const button = screen.getByText('Submit Form');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Result: Success')).toBeInTheDocument();
      });
    });

    test('バリデーションエラー', async () => {
      const FormWithValidationError = () => {
        const { submitForm } = useFormWithErrorHandling();
        const [result, setResult] = React.useState<any>(null);

        const handleSubmit = async () => {
          const formData = new FormData();
          // emailを空にしてバリデーションエラーを発生
          const response = await submitForm(formData);
          setResult(response);
        };

        return (
          <div>
            <button onClick={handleSubmit}>Submit Invalid Form</button>
            {result && (
              <div>
                Result: {result.success ? 'Success' : 'Failed'}
                {result.error && <div>Error: {result.error.message}</div>}
              </div>
            )}
          </div>
        );
      };

      render(
        <AppWithErrorHandling>
          <FormWithValidationError />
        </AppWithErrorHandling>
      );

      const button = screen.getByText('Submit Invalid Form');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Result: Failed')).toBeInTheDocument();
        expect(
          screen.getByText(/メールアドレスが入力されていません/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('ErrorStatsDisplay', () => {
    test('本番環境では表示されない', () => {
      process.env.NODE_ENV = 'production';

      render(
        <AppWithErrorHandling>
          <ErrorStatsDisplay />
        </AppWithErrorHandling>
      );

      expect(
        screen.queryByText('🐛 Error Stats (Dev)')
      ).not.toBeInTheDocument();
    });

    test('開発環境では統計情報を表示', () => {
      process.env.NODE_ENV = 'development';

      render(
        <AppWithErrorHandling>
          <ErrorStatsDisplay />
        </AppWithErrorHandling>
      );

      expect(screen.getByText('🐛 Error Stats (Dev)')).toBeInTheDocument();
      expect(screen.getByText('Total: 0')).toBeInTheDocument();
      expect(screen.getByText('Unhandled: 0')).toBeInTheDocument();
      expect(screen.getByText('Session: 0')).toBeInTheDocument();
    });
  });
});
