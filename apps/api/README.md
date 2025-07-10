# Template API Server

Fastify-based API server template.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

The API server will be available at http://localhost:4000

## 📋 Available Scripts

| Script            | Description                              |
| ----------------- | ---------------------------------------- |
| `pnpm dev`        | Start development server with hot reload |
| `pnpm build`      | Build for production                     |
| `pnpm start`      | Start production server                  |
| `pnpm lint`       | Run ESLint                               |
| `pnpm test`       | Run tests                                |
| `pnpm type-check` | Run TypeScript type checking             |

## 🛠️ API Endpoints

### Health Check

- `GET /health` - Health check endpoint
- `GET /today` - Get current date information

### Authentication

The API uses JWT tokens for authentication with role-based access control.

## 🐳 Docker

```bash
# Build Docker image
docker build -t template-api .

# Run container
docker run -p 4000:4000 --env-file .env template-api
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test -- --coverage
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

Key variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing
- `FIREBASE_PROJECT_ID`: Firebase project for authentication
- `SENDGRID_API_KEY`: SendGrid for email sending

## 🔧 Development

The API server uses:

- **Fastify**: Fast and low overhead web framework
- **TypeScript**: For type safety
- **Zod**: For request validation
- **JWT**: For authentication
- **Prisma**: For database ORM
- **Pino**: For structured logging

## 📚 Documentation

- [Project Documentation](../../docs/README.md)
- [API Design Patterns](../../docs/development/guidelines.md)
- [Database Schema](../../docs/api/)
