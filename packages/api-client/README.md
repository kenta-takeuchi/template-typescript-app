# @template/api-client

Type-safe API client for the Template API, auto-generated from OpenAPI specification.

## 📦 Installation

This package is part of the monorepo and is automatically linked when you run `pnpm install` at the root.

## 🚀 Usage

### Basic Example

```typescript
import { createApiClient } from '@template/api-client';

// Create client with default configuration
const apiClient = createApiClient({
  basePath: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check
const health = await apiClient.health.getHealth();
console.log(health.status); // 'ok'

// Get current date
const today = await apiClient.date.getToday();
console.log(today.date); // '2024-12-18'
```

### With Authentication

```typescript
import { createApiClient } from '@template/api-client';

const apiClient = createApiClient({
  basePath: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

### Error Handling

```typescript
try {
  const result = await apiClient.health.getHealth();
  console.log(result);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.status, error.body);
  } else {
    console.error('Network Error:', error);
  }
}
```

## 🔧 Configuration

### Client Options

```typescript
interface ApiClientConfig {
  basePath?: string;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  middleware?: Middleware[];
}
```

### Environment Variables

- `NEXT_PUBLIC_API_URL`: API base URL for client-side requests
- `API_URL`: API base URL for server-side requests

## 🛠️ Development

### Regenerating the Client

The API client is auto-generated from the OpenAPI specification:

```bash
# From monorepo root
pnpm api:generate

# Or from this package
pnpm generate
```

This will:

1. Read the OpenAPI spec from `/api-spec/openapi.yaml`
2. Generate TypeScript client code in `/generated`
3. Update type definitions

### Adding New Endpoints

1. Update the OpenAPI specification in `/api-spec/openapi.yaml`
2. Run `pnpm api:generate` to regenerate the client
3. The new endpoints will be available in the client

## 📁 Directory Structure

```
api-client/
├── src/
│   ├── client.ts        # Main client factory
│   ├── config.ts        # Configuration utilities
│   └── index.ts         # Public exports
├── generated/           # Auto-generated code (do not edit)
│   ├── apis/           # API endpoint classes
│   ├── models/         # TypeScript interfaces
│   └── runtime.ts      # Runtime utilities
└── scripts/
    └── generate.ts      # Generation script
```

## 🎯 Type Safety

All API responses are fully typed based on the OpenAPI specification:

```typescript
// TypeScript knows the exact shape of the response
const health = await apiClient.health.getHealth();
// health.status is typed as string
// health.timestamp is typed as string (ISO date)
// health.server is typed as string
```

## ⚡ Performance

- Minimal bundle size - only includes used endpoints
- Tree-shakeable exports
- No runtime schema validation (relies on TypeScript)
- Configurable request middleware for caching

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage
```

## 📚 API Documentation

See the [OpenAPI Specification](/api-spec/openapi.yaml) for detailed API documentation.
