import type { ApiResponse, ApiError, ApiResult } from '@template/types';

/**
 * API クライアントユーティリティ
 */

// API設定
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// リクエストオプション
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * APIクライアントクラス
 */
export class ApiClient {
  private config: Required<ApiConfig>;

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    };
  }

  /**
   * HTTP リクエストを実行
   */
  async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResult<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = this.config.timeout,
      signal,
    } = options;

    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();

    // タイムアウト設定
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...this.config.headers,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: signal || controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: errorData.message || response.statusText,
            timestamp: new Date().toISOString(),
            details: errorData,
          },
        };
      }

      const data = await response.json();
      return data as ApiResult<T>;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        return {
          success: false,
          error: {
            code: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
            message: error.message,
            timestamp: new Date().toISOString(),
            details: error,
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
          timestamp: new Date().toISOString(),
          details: error,
        },
      };
    }
  }

  /**
   * GET リクエスト
   */
  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<ApiResult<T>> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params as Record<string, string>)}`
      : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST リクエスト
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown
  ): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  /**
   * PUT リクエスト
   */
  async put<T = unknown>(
    endpoint: string,
    body?: unknown
  ): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  /**
   * DELETE リクエスト
   */
  async delete<T = unknown>(endpoint: string): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * PATCH リクエスト
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown
  ): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  /**
   * 認証トークンを設定
   */
  setAuthToken(token: string): void {
    this.config.headers.Authorization = `Bearer ${token}`;
  }

  /**
   * 認証トークンを削除
   */
  removeAuthToken(): void {
    delete this.config.headers.Authorization;
  }

  /**
   * ベースURLを更新
   */
  setBaseUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl;
  }
}

/**
 * API レスポンスの型ガード
 */
export function isApiSuccess<T>(
  response: ApiResult<T>
): response is ApiResponse<T> {
  return response.success === true;
}

export function isApiError(response: ApiResult): response is ApiError {
  return response.success === false;
}

/**
 * APIエラーを投げる
 */
export function throwApiError(response: ApiError): never {
  const error = new Error(response.error.message);
  error.name = response.error.code;
  throw error;
}

/**
 * APIレスポンスからデータを安全に取得
 */
export function getApiData<T>(response: ApiResult<T>): T {
  if (isApiSuccess(response)) {
    return response.data;
  }
  throwApiError(response);
}

/**
 * デフォルトのAPIクライアントインスタンスを作成
 */
export function createApiClient(config: ApiConfig): ApiClient {
  return new ApiClient(config);
}

/**
 * フォームデータをAPIリクエスト用に変換
 */
export function formDataToJson(formData: FormData): Record<string, unknown> {
  const json: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (json[key]) {
      // 複数の値がある場合は配列にする
      if (Array.isArray(json[key])) {
        (json[key] as unknown[]).push(value);
      } else {
        json[key] = [json[key], value];
      }
    } else {
      json[key] = value;
    }
  }

  return json;
}

/**
 * ファイルアップロード用のフォームデータを作成
 */
export function createFormData(
  data: Record<string, unknown>,
  files?: Record<string, File>
): FormData {
  const formData = new FormData();

  // 通常のデータを追加
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  }

  // ファイルを追加
  if (files) {
    for (const [key, file] of Object.entries(files)) {
      formData.append(key, file);
    }
  }

  return formData;
}
