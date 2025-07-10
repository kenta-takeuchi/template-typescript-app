/**
 * Error Handler + Toast統合コンポーネント
 * Toast通知機能付きのエラーハンドリングシステム
 */

import React from 'react';

import { useToast } from '../Toast';

import {
  GlobalErrorProvider,
  ToastNotificationConfig,
} from './GlobalErrorContext';

/**
 * Toast通知機能付きグローバルエラープロバイダー
 */
interface ErrorHandlerWithToastProps {
  children: React.ReactNode;
  enableToastNotifications?: boolean;
  enableGlobalHandlers?: boolean;
  maxErrorsInMemory?: number;
}

export const ErrorHandlerWithToast: React.FC<
  ErrorHandlerWithToastProps
> = props => {
  return (
    <GlobalErrorProvider
      {...props}
      onToastNotification={_config => {
        // Toast通知を処理するための内部コンポーネントへ
      }}
    >
      <ToastHandler {...props} />
    </GlobalErrorProvider>
  );
};

/**
 * Toast通知を処理する内部コンポーネント
 */
const ToastHandler: React.FC<ErrorHandlerWithToastProps> = ({ children }) => {
  const { error, warning, info, success } = useToast();

  // GlobalErrorProviderを再作成してToast機能を注入
  return (
    <GlobalErrorProvider
      enableToastNotifications={true}
      onToastNotification={(config: ToastNotificationConfig) => {
        switch (config.type) {
          case 'error':
            error(config.title, {
              description: config.description,
              duration: config.duration,
            });
            break;
          case 'warning':
            warning(config.title, {
              description: config.description,
              duration: config.duration,
            });
            break;
          case 'info':
            info(config.title, {
              description: config.description,
              duration: config.duration,
            });
            break;
          case 'success':
            success(config.title, {
              description: config.description,
              duration: config.duration,
            });
            break;
        }
      }}
    >
      {children}
    </GlobalErrorProvider>
  );
};
