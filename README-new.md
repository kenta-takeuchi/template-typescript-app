# Template TypeScript App

A modern TypeScript monorepo template with Next.js, Fastify, and comprehensive tooling.

## Features

- 🚀 **Monorepo Structure** - Powered by Turborepo and pnpm workspaces
- 🔧 **TypeScript** - Full TypeScript support with strict mode
- ⚡ **Next.js 14** - App Router, Server Components, and more
- 🚄 **Fastify** - High-performance Node.js web framework
- 🗄️ **Prisma** - Type-safe database ORM with MySQL support
- 🔐 **Firebase Auth** - Authentication out of the box
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📦 **Shared Packages** - Reusable components, utilities, and types
- 🧪 **Testing** - Jest setup with coverage reporting
- 📝 **Code Quality** - ESLint, Prettier, Husky, and lint-staged
- 🔄 **CI/CD Ready** - GitHub Actions workflows included
- 📚 **API Documentation** - OpenAPI specification and auto-generated client

## Quick Start

### Use this template

1. Click the "Use this template" button on GitHub
2. Create a new repository from this template
3. Clone your new repository

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Set up database
pnpm db:push

# Start development servers
pnpm dev
```

## Project Structure

```
.
├── apps/
│   ├── api/          # Fastify API server (port 4000)
│   └── web/          # Next.js web app (port 3000)
├── packages/
│   ├── api-client/   # Auto-generated API client
│   ├── config/       # Shared configuration
│   ├── database/     # Prisma database client
│   ├── types/        # Shared TypeScript types
│   ├── ui/           # Shared UI components
│   └── utils/        # Shared utilities
├── docs/             # Documentation
└── infrastructure/   # Infrastructure as code
```

## Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps and packages
- `pnpm test` - Run tests for all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format all files with Prettier
- `pnpm type-check` - Run TypeScript type checking
- `pnpm db:push` - Push database schema changes
- `pnpm db:studio` - Open Prisma Studio

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/dbname"

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""

# API
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Fastify, Prisma ORM
- **Database**: MySQL (or PostgreSQL with minor changes)
- **Authentication**: Firebase Auth
- **Testing**: Jest, Testing Library
- **Build Tools**: Turborepo, pnpm, Vite
- **Code Quality**: ESLint, Prettier, Husky
- **CI/CD**: GitHub Actions

## Customization

1. **Update package names**: Replace `@template` with your organization name in all `package.json` files
2. **Configure database**: Update the Prisma schema in `packages/database/prisma/schema.prisma`
3. **Add your business logic**: Start building your features in the `apps/` directory
4. **Extend shared packages**: Add common components, utilities, and types as needed

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Create a pull request

## License

MIT

---

Built with ❤️ using modern TypeScript tooling
