/**
 * エラーロギングユーティリティ
 */

import {
  ApiErrorResponse,
  ErrorCode,
  isApiErrorResponse,
} from '@template/types';
import { classifyError, ErrorClassification } from './error-handler';

/**
 * ログレベル
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * ログエントリ
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  error?: Error | ApiErrorResponse;
  classification?: ErrorClassification;
  context?: Record<string, unknown>;
  traceId?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  path?: string;
}

/**
 * ログコンテキスト
 */
export interface LogContext {
  traceId?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  path?: string;
  component?: string;
  action?: string;
  [key: string]: unknown;
}

/**
 * エラーロガークラス
 */
export class ErrorLogger {
  private context: LogContext = {};

  constructor(private isDevelopment = process.env.NODE_ENV === 'development') {}

  /**
   * ログコンテキストを設定
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * ログコンテキストをクリア
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * エラーをログ出力
   */
  logError(
    error: Error | ApiErrorResponse,
    message?: string,
    additionalContext?: Record<string, unknown>
  ): void {
    const classification = classifyError(error);
    const level = this.getLogLevel(classification);

    const logEntry: LogEntry = {
      level,
      message: message || this.getDefaultMessage(error),
      timestamp: new Date().toISOString(),
      error,
      classification,
      context: { ...this.context, ...additionalContext },
      traceId: this.context.traceId,
      userId: this.context.userId,
      sessionId: this.context.sessionId,
      userAgent: this.context.userAgent,
      ip: this.context.ip,
      path: this.context.path,
    };

    this.outputLog(logEntry);

    // 本番環境では外部監視サービスに送信
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      this.sendToMonitoringService(logEntry);
    }
  }

  /**
   * 警告をログ出力
   */
  logWarning(message: string, context?: Record<string, unknown>): void {
    const logEntry: LogEntry = {
      level: LogLevel.WARN,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...context },
      traceId: this.context.traceId,
      userId: this.context.userId,
      sessionId: this.context.sessionId,
      userAgent: this.context.userAgent,
      ip: this.context.ip,
      path: this.context.path,
    };

    this.outputLog(logEntry);
  }

  /**
   * 情報をログ出力
   */
  logInfo(message: string, context?: Record<string, unknown>): void {
    const logEntry: LogEntry = {
      level: LogLevel.INFO,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...context },
      traceId: this.context.traceId,
      userId: this.context.userId,
      sessionId: this.context.sessionId,
      userAgent: this.context.userAgent,
      ip: this.context.ip,
      path: this.context.path,
    };

    this.outputLog(logEntry);
  }

  /**
   * デバッグ情報をログ出力
   */
  logDebug(message: string, context?: Record<string, unknown>): void {
    if (!this.isDevelopment) return;

    const logEntry: LogEntry = {
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...context },
      traceId: this.context.traceId,
      userId: this.context.userId,
      sessionId: this.context.sessionId,
      userAgent: this.context.userAgent,
      ip: this.context.ip,
      path: this.context.path,
    };

    this.outputLog(logEntry);
  }

  /**
   * 分類からログレベルを決定
   */
  private getLogLevel(classification: ErrorClassification): LogLevel {
    switch (classification.severity) {
      case 'critical':
        return LogLevel.ERROR;
      case 'high':
        return LogLevel.ERROR;
      case 'medium':
        return LogLevel.WARN;
      case 'low':
        return LogLevel.INFO;
      default:
        return LogLevel.ERROR;
    }
  }

  /**
   * エラーからデフォルトメッセージを生成
   */
  private getDefaultMessage(error: Error | ApiErrorResponse): string {
    if (isApiErrorResponse(error)) {
      return `API Error: ${error.error.code} - ${error.error.message}`;
    }

    return `JavaScript Error: ${error.name} - ${error.message}`;
  }

  /**
   * ログを出力
   */
  private outputLog(logEntry: LogEntry): void {
    const { level, message, timestamp, error, classification, context } =
      logEntry;

    const logData = {
      timestamp,
      level,
      message,
      ...(context && { context }),
      ...(classification && { classification }),
      ...(error && { error: this.serializeError(error) }),
    };

    switch (level) {
      case LogLevel.ERROR:
        console.error(logData);
        break;
      case LogLevel.WARN:
        console.warn(logData);
        break;
      case LogLevel.INFO:
        console.info(logData);
        break;
      case LogLevel.DEBUG:
        console.debug(logData);
        break;
      default:
        console.log(logData);
    }
  }

  /**
   * エラーをシリアライズ（ログ出力用）
   */
  private serializeError(
    error: Error | ApiErrorResponse
  ): Record<string, unknown> {
    if (isApiErrorResponse(error)) {
      return {
        type: 'ApiErrorResponse',
        success: error.success,
        error: error.error,
      };
    }

    return {
      type: 'JavaScriptError',
      name: error.name,
      message: error.message,
      stack: this.isDevelopment ? error.stack : undefined,
    };
  }

  /**
   * 外部監視サービスにエラーを送信
   * 実際の実装では Sentry, LogRocket, DataDog などを使用
   */
  private sendToMonitoringService(logEntry: LogEntry): void {
    // TODO: 外部監視サービスとの統合実装
    console.info('Would send to monitoring service:', {
      level: logEntry.level,
      message: logEntry.message,
      timestamp: logEntry.timestamp,
      traceId: logEntry.traceId,
      userId: logEntry.userId,
    });
  }
}

/**
 * グローバルエラーロガーインスタンス
 */
export const errorLogger = new ErrorLogger();

/**
 * ブラウザ環境でのグローバルエラーハンドリング設定
 */
export function setupGlobalErrorHandling(): void {
  if (typeof window === 'undefined') return;

  // 未処理のエラーをキャッチ
  window.addEventListener('error', event => {
    errorLogger.logError(
      new Error(event.message),
      'Uncaught JavaScript error',
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  });

  // 未処理のPromise rejectionsをキャッチ
  window.addEventListener('unhandledrejection', event => {
    errorLogger.logError(
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason)),
      'Unhandled Promise rejection'
    );
  });
}

/**
 * React環境でのエラーバウンダリ用ログ関数
 */
export function logReactError(
  error: Error,
  errorInfo: { componentStack: string }
): void {
  errorLogger.logError(error, 'React component error', {
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
  });
}
