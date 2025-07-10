module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['import'],
  rules: {
    // Domain Layer Rules
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/infrastructure/**'],
            message: 'Domain layer should not import from infrastructure layer',
          },
          {
            group: ['**/presentation/**'],
            message: 'Domain layer should not import from presentation layer',
          },
        ],
      },
    ],

    // Code Quality Rules
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',

    // React Rules (for frontend apps)
    // Note: React-specific rules are configured in individual app configs

    // Import Rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-default-export': 'error', // Prefer named exports
    'import/prefer-default-export': 'off',
  },
  ignorePatterns: [
    '**/dist/**',
    '**/generated/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/.next/**',
  ],
  overrides: [
    {
      // Allow default exports for pages and API routes
      files: [
        'pages/**/*.tsx',
        'pages/**/*.ts',
        'app/**/*.tsx',
        'app/**/*.ts',
        'src/pages/**/*.tsx',
        'src/pages/**/*.ts',
        'src/app/**/*.tsx',
        'src/app/**/*.ts',
      ],
      rules: {
        'import/no-default-export': 'off',
        'import/prefer-default-export': 'error',
      },
    },
    {
      // Domain layer specific rules
      files: ['**/domain/**/*.ts', '**/domain/**/*.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['react', 'next/*', 'fastify', 'prisma/*'],
                message:
                  'Domain layer should not depend on external frameworks',
              },
            ],
          },
        ],
      },
    },
    {
      // Test files - allow Jest globals and default exports
      files: [
        '**/__tests__/**/*.{ts,tsx,js,jsx}',
        '**/*.{test,spec}.{ts,tsx,js,jsx}',
      ],
      env: {
        jest: true,
      },
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
};
