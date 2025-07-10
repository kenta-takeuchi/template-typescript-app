import { DateApi, HealthApi } from '../generated/src/apis';
import { Configuration } from '../generated/src/runtime';

import { createApiConfiguration, ApiClientConfig } from './config';

export interface TemplateApiClient {
  date: DateApi;
  health: HealthApi;
  configuration: Configuration;
}

export function createApiClient(
  config: ApiClientConfig = {}
): TemplateApiClient {
  const configuration = createApiConfiguration(config);

  return {
    date: new DateApi(configuration),
    health: new HealthApi(configuration),
    configuration,
  };
}
