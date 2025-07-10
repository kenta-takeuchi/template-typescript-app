/**
 * Error Boundary コンポーネントのエクスポート
 */

// Core Error Boundary
export {
  ErrorBoundary,
  ErrorBoundaryWithToast,
  ErrorBoundaryWithToastProvider,
} from './ErrorBoundary';

// Specialized Error Boundaries
export { PageErrorBoundary } from './PageErrorBoundary';
export { SectionErrorBoundary } from './SectionErrorBoundary';
export { AsyncErrorBoundary } from './AsyncErrorBoundary';

// Hooks
export {
  useErrorBoundary,
  useAsyncErrorBoundary,
  useErrorBoundaryReset,
  useErrorBoundaryStats,
} from './useErrorBoundary';

// Global Error Context
export {
  GlobalErrorProvider,
  useGlobalError,
  useErrorReporter,
} from './GlobalErrorContext';
export type { GlobalError } from './GlobalErrorContext';

// Types
export interface ErrorBoundaryConfig {
  /** Error Boundaryのレベル */
  level: 'page' | 'section' | 'component';
  /** 分離モード（他のコンポーネントに影響しない） */
  isolate?: boolean;
  /** 自動復旧を試行するか */
  autoRecovery?: boolean;
  /** 最大リトライ回数 */
  maxRetries?: number;
  /** リトライ間隔（ミリ秒） */
  retryDelay?: number;
}

/**
 * Error Boundaryの設定用ヘルパー関数
 */
export const createErrorBoundaryConfig = (
  overrides: Partial<ErrorBoundaryConfig> = {}
): ErrorBoundaryConfig => ({
  level: 'component',
  isolate: true,
  autoRecovery: false,
  maxRetries: 3,
  retryDelay: 1000,
  ...overrides,
});

/**
 * 開発環境用のError Boundary設定
 */
export const developmentErrorBoundaryConfig: ErrorBoundaryConfig = {
  level: 'component',
  isolate: false, // 開発時は分離しない
  autoRecovery: false,
  maxRetries: 1,
  retryDelay: 500,
};

/**
 * 本番環境用のError Boundary設定
 */
export const productionErrorBoundaryConfig: ErrorBoundaryConfig = {
  level: 'component',
  isolate: true,
  autoRecovery: true,
  maxRetries: 3,
  retryDelay: 2000,
};
