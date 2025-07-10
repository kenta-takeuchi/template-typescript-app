import { Configuration } from '../generated/src/runtime';

export interface ApiClientConfig {
  basePath?: string;
  apiKey?: string;
  accessToken?: string;
  headers?: Record<string, string>;
}

export function createApiConfiguration(
  config: ApiClientConfig = {}
): Configuration {
  const {
    basePath = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    apiKey,
    accessToken,
    headers = {},
  } = config;

  return new Configuration({
    basePath,
    apiKey,
    accessToken,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}
