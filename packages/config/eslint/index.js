/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: true,
  },
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    // TypeScript - DDD Strict Rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      { accessibility: 'explicit' },
    ],
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-readonly-parameter-types': 'off', // Too strict for most cases
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',

    // General Code Quality
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'no-duplicate-imports': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],

    // Import/Export Rules
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
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-default-export': 'error',
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',

    // DDD Architecture Rules (Domain > Layer structure)
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['*/infrastructure/**'],
            message: 'Domain layer should not import from infrastructure layer',
          },
          {
            group: ['*/presentation/**'],
            message:
              'Domain and Application layers should not import from presentation layer',
          },
          {
            group: ['../infrastructure/**'],
            message:
              'Domain layer should not import from same domain infrastructure layer',
          },
          {
            group: ['../presentation/**'],
            message:
              'Domain and Application layers should not import from same domain presentation layer',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      // Domain layer specific rules (Domain > Layer structure)
      files: ['*/domain/**/*.ts', '*/domain/**/*.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['react', 'next/*', 'fastify', '@prisma/*'],
                message:
                  'Domain layer should not depend on external frameworks',
              },
              {
                group: ['../infrastructure/**', '../presentation/**'],
                message:
                  'Domain layer should not import from infrastructure or presentation layers',
              },
              {
                group: ['*/infrastructure/**', '*/presentation/**'],
                message:
                  'Domain layer should not import from other domain infrastructure/presentation layers',
              },
            ],
          },
        ],
      },
    },
    {
      // Application layer specific rules
      files: ['*/application/**/*.ts', '*/application/**/*.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['../presentation/**'],
                message:
                  'Application layer should not import from presentation layer',
              },
              {
                group: ['*/presentation/**'],
                message:
                  'Application layer should not import from other domain presentation layers',
              },
            ],
          },
        ],
      },
    },
    {
      // Allow default exports for specific file types
      files: [
        'pages/**/*.tsx',
        'pages/**/*.ts',
        'app/**/*.tsx',
        'app/**/*.ts',
        'src/pages/**/*.tsx',
        'src/pages/**/*.ts',
        'src/app/**/*.tsx',
        'src/app/**/*.ts',
        '*.config.js',
        '*.config.ts',
      ],
      rules: {
        'import/no-default-export': 'off',
        'import/prefer-default-export': 'error',
      },
    },
  ],
  ignorePatterns: [
    'dist',
    '.turbo',
    'node_modules',
    '.next',
    'coverage',
    '*.d.ts',
    'generated/**/*',
  ],
};
